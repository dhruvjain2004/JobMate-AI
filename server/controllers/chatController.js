import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";

import ChatConversation from "../models/ChatConversation.js";
import ChatMessage from "../models/ChatMessage.js";
import User from "../models/user.js";
import Job from "../models/Job.js";

// ============================
// ML SERVICE CONFIG
// ============================
const ML_SERVICE_URL = process.env.ML_SERVICE_URL;
const SHARED_SECRET = process.env.SHARED_SECRET;

// ============================
// HELPERS
// ============================
const generateSignature = () => {
  const timestamp = Date.now().toString();

  const signature = crypto
    .createHmac("sha256", SHARED_SECRET || "")
    .update(timestamp)
    .digest("hex");

  return { signature, timestamp };
};

// ----------------------------
// WAKE ML (prevents 502)
// ----------------------------
const wakeML = async () => {
  try {
    await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 8000 });
    console.log("ML service awake");
  } catch {
    console.log("ML cold start detected (ok)");
  }
};

// ----------------------------
// CALL ML WITH RETRY
// ----------------------------
const callMLService = async (endpoint, payload, retries = 2) => {
  const { signature, timestamp } = generateSignature();
  const url = `${ML_SERVICE_URL}${endpoint}`;

  try {
    return await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature,
        "X-Timestamp": timestamp,
      },
      timeout: 30000,
    });
  } catch (err) {
    if (retries > 0) {
      console.warn("Retrying ML call...");
      await new Promise(r => setTimeout(r, 2000));
      return callMLService(endpoint, payload, retries - 1);
    }
    throw err;
  }
};

// ============================
// CHAT
// ============================
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, message, context = {} } = req.body;
    const userId = req.userId;

    if (!userId || !message?.trim()) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    let conversation = await ChatConversation.findOne({
      _id: conversationId,
      userId,
      status: "active",
    });

    if (!conversation) {
      conversation = await ChatConversation.create({
        userId: new mongoose.Types.ObjectId(userId),
        status: "active",
        context,
        messages: [],
        messageCount: 0,
      });
    }

    const userMessage = await ChatMessage.create({
      conversationId: conversation._id,
      userId,
      role: "user",
      content: message,
    });

    let assistantMessage;

    try {
      // Load resume & job context safely
      const user = await User.findById(userId);
      const jobId = context?.jobId;
      const job = jobId ? await Job.findById(jobId) : null;

      await wakeML();

      const mlResponse = await callMLService("/api/ml/chat", {
        userId,
        message,
        conversationId: conversation._id.toString(),
        context,
        resumeText: user?.resume,
        jobDescription: job?.description,
        jobSkills: job?.skillsRequired,
        jobTitle: job?.title,
      });

      assistantMessage = await ChatMessage.create({
        conversationId: conversation._id,
        userId,
        role: "assistant",
        content: mlResponse.data?.data?.response || "I’m here to help!",
        suggestions: mlResponse.data?.data?.suggestions,
      });

    } catch (err) {
      console.error("ML service unavailable:", err.message);

      assistantMessage = await ChatMessage.create({
        conversationId: conversation._id,
        userId,
        role: "assistant",
        content: "AI service is warming up. Please try again in a few seconds.",
      });
    }

    await ChatConversation.findByIdAndUpdate(conversation._id, {
      lastMessageAt: new Date(),
      $inc: { messageCount: 2 },
    });

    res.json({
      success: true,
      data: { conversationId: conversation._id, userMessage, assistantMessage },
    });

  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

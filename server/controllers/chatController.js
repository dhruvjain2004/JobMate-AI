import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose"; // ✅ REQUIRED
import ChatConversation from "../models/ChatConversation.js";
import ChatMessage from "../models/ChatMessage.js";
import MLAnalysis from "../models/MLAnalysis.js";
import User from "../models/user.js";
import Job from "../models/Job.js";

// ML Service Configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL;
const SHARED_SECRET = process.env.SHARED_SECRET;

/**
 * Generate HMAC signature for ML service authentication
 */
const generateSignature = () => {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", SHARED_SECRET)
    .update(timestamp)
    .digest("hex");

  return { signature, timestamp };
};

/**
 * Call ML service with authentication
 */
const callMLService = async (endpoint, data) => {
  const { signature, timestamp } = generateSignature();

  const response = await axios.post(
    `${ML_SERVICE_URL}${endpoint}`,
    data,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature,
        "X-Timestamp": timestamp,
      },
      timeout: 30000,
    }
  );

  return response.data;
};

/**
 * Get or create conversation
 */
export const getOrCreateConversation = async (req, res) => {
  try {
    const { conversationId, type = "general", jobId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    let conversation = null;

    if (conversationId) {
      conversation = await ChatConversation.findOne({
        _id: conversationId,
        userId,
        status: "active",
      });
    }

    if (!conversation) {
      const context = {};

      if (jobId) {
        const job = await Job.findById(jobId);
        if (job) {
          context.jobId = jobId;
          context.jobTitle = job.title;
        }
      }

      conversation = await ChatConversation.create({
        userId: new mongoose.Types.ObjectId(userId), // ✅ FIX
        type,
        context,
        status: "active",
        messages: [],
        messageCount: 0,
      });
    }

    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error("Get/Create Conversation Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Send chat message
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, message, context = {} } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    let conversation = null;

    if (conversationId) {
      conversation = await ChatConversation.findOne({
        _id: conversationId,
        userId,
        status: "active",
      });
    }

    if (!conversation) {
      conversation = await ChatConversation.create({
        userId: new mongoose.Types.ObjectId(userId), // ✅ FIX
        type: context.type || "general",
        context,
        status: "active",
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
      const mlResponse = await callMLService("/api/ml/chat", {
        userId: userId.toString(),
        message,
        conversationId: conversation._id.toString(),
        context,
      });

      assistantMessage = await ChatMessage.create({
        conversationId: conversation._id,
        userId,
        role: "assistant",
        content: mlResponse?.data?.response || "I’m here to help!",
        intent: mlResponse?.data?.intent,
        suggestions: mlResponse?.data?.suggestions,
      });
    } catch (err) {
      assistantMessage = await ChatMessage.create({
        conversationId: conversation._id,
        userId,
        role: "assistant",
        content:
          "Sorry, I’m having trouble right now. Please try again in a moment.",
      });
    }

    await ChatConversation.findByIdAndUpdate(conversation._id, {
      lastMessageAt: new Date(),
      $inc: { messageCount: 2 },
    });

    res.json({
      success: true,
      data: {
        conversationId: conversation._id,
        userMessage,
        assistantMessage,
      },
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

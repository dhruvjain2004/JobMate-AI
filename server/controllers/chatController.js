import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";

import ChatConversation from "../models/ChatConversation.js";
import ChatMessage from "../models/ChatMessage.js";
import MLAnalysis from "../models/MLAnalysis.js";
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
    .createHmac("sha256", SHARED_SECRET)
    .update(timestamp)
    .digest("hex");

  return { signature, timestamp };
};

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

// ============================
// CONVERSATIONS
// ============================
export const getOrCreateConversation = async (req, res) => {
  try {
    const { conversationId, type = "general", jobId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
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
        userId: new mongoose.Types.ObjectId(userId),
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

export const getConversationHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await ChatConversation.findOne({
      _id: conversationId,
      userId,
      status: "active",
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: { conversation, messages },
    });
  } catch (error) {
    console.error("Get Conversation History Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await ChatConversation.find({
      userId,
      status: "active",
    }).sort({ lastMessageAt: -1 });

    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error("Get User Conversations Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await ChatConversation.findOneAndUpdate(
      { _id: conversationId, userId },
      { status: "deleted" },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    res.json({ success: true, message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Delete Conversation Error:", error);
    res.status(500).json({ success: false, message: error.message });
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
        type: "general",
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
        userId,
        message,
        conversationId: conversation._id.toString(),
        context,
      });

      assistantMessage = await ChatMessage.create({
        conversationId: conversation._id,
        userId,
        role: "assistant",
        content: mlResponse?.data?.response || "I’m here to help!",
        suggestions: mlResponse?.data?.suggestions,
      });
    } catch {
      assistantMessage = await ChatMessage.create({
        conversationId: conversation._id,
        userId,
        role: "assistant",
        content: "ML service unavailable. Please try again later.",
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

// ============================
// ML FEATURES
// ============================
export const calculateATSScore = async (req, res) => {
  try {
    const { resumeText, jobSkills } = req.body;

    const mlResponse = await callMLService("/api/ml/ats-score", {
      resumeText,
      jobSkills,
    });

    res.json({ success: true, data: mlResponse.data });
  } catch (error) {
    console.error("ATS Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const explainJobMatch = async (req, res) => {
  res.json({
    success: true,
    data: { message: "Job match explanation coming soon" },
  });
};

export const getCareerPath = async (req, res) => {
  res.json({
    success: true,
    data: { message: "Career path guidance coming soon" },
  });
};

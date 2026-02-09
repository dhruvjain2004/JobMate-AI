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

  if (!SHARED_SECRET) {
    console.warn('SHARED_SECRET is not set — ML requests will likely be rejected by the ML service.');
  }

  const signature = crypto
    .createHmac("sha256", SHARED_SECRET || "")
    .update(timestamp)
    .digest("hex");

  // Do not log the secret itself, but log that a signature was generated
  console.debug && console.debug('generateSignature - timestamp:', timestamp, 'signature:', signature.slice(0, 8) + '...');

  return { signature, timestamp };
};

const callMLService = async (endpoint, data) => {
  const { signature, timestamp } = generateSignature();

  const url = `${ML_SERVICE_URL}${endpoint}`;
  console.debug && console.debug('callMLService - calling', url);

  try {
    const response = await axios.post(
      url,
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
  } catch (err) {
    console.error('callMLService failed:', err.message);
    if (err.response) {
      console.error('callMLService response status:', err.response.status);
      console.error('callMLService response data:', JSON.stringify(err.response.data));
    }
    throw err;
  }
};

// ============================
// CONVERSATIONS
// ============================
export const getOrCreateConversation = async (req, res) => {
  try {
    const { conversationId, type = "general", jobId } = req.body;
    const userId = req.userId;

    // If userId is missing it means auth middleware didn't set it (bad/absent token)
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: userId missing. Ensure Authorization header is set." });
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
      // Include user resume and job details (if available) to enable explainability from ML service
      let resumeText = undefined;
      try {
        const user = await User.findById(userId);
        if (user && user.resume) resumeText = user.resume;
      } catch (e) {
        console.warn('Failed to load user resume for ML payload:', e.message);
      }

      let jobDescription = undefined;
      let jobSkills = undefined;
      let jobTitle = undefined;

      try {
        const jobId = context?.jobId || req.body?.jobId;
        if (jobId) {
          const job = await Job.findById(jobId);
          if (job) {
            jobDescription = job.description;
            jobSkills = job.skillsRequired || [];
            jobTitle = job.title;
          }
        }
      } catch (e) {
        console.warn('Failed to load job details for ML payload:', e.message);
      }

      const mlResponse = await callMLService("/api/ml/chat", {
        userId,
        message,
        conversationId: conversation._id.toString(),
        context,
        resumeText,
        jobDescription,
        jobSkills,
        jobTitle,
      });

      assistantMessage = await ChatMessage.create({
        conversationId: conversation._id,
        userId,
        role: "assistant",
        content: mlResponse?.data?.response || "I’m here to help!",
        suggestions: mlResponse?.data?.suggestions,
      });
    } catch (err) {
      // Log full error details for diagnosis
      console.error('ML service call failed in sendMessage:', err.message);
      if (err.response) {
        console.error('ML status:', err.response.status);
        console.error('ML response data:', JSON.stringify(err.response.data));
      }

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
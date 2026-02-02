import axios from "axios";
import crypto from "crypto";
import ChatConversation from "../models/ChatConversation.js";
import ChatMessage from "../models/ChatMessage.js";
import MLAnalysis from "../models/MLAnalysis.js";
import User from "../models/user.js";
import Job from "../models/Job.js";

// ML Service Configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const SHARED_SECRET = process.env.SHARED_SECRET || "your-shared-secret-between-services";

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
  
  try {
    const response = await axios.post(`${ML_SERVICE_URL}${endpoint}`, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature,
        "X-Timestamp": timestamp,
      },
      timeout: 30000, // 30 seconds
    });
    
    return response.data;
  } catch (error) {
    console.error(`ML Service Error (${endpoint}):`, error.message);
    throw new Error(`ML service unavailable: ${error.message}`);
  }
};

/**
 * Get or create conversation
 */
export const getOrCreateConversation = async (req, res) => {
  try {
    const { conversationId, type = "general", jobId } = req.body;
    const userId = req.userId;

    let conversation;

    if (conversationId) {
      conversation = await ChatConversation.findOne({
        _id: conversationId,
        userId,
        status: "active",
      });
    }

    if (!conversation) {
      // Create new conversation
      const context = {};
      if (jobId) {
        const job = await Job.findById(jobId);
        if (job) {
          context.jobId = jobId;
          context.jobTitle = job.title;
        }
      }

      conversation = await ChatConversation.create({
        userId,
        type,
        context,
        title: type === "job_match" ? "Job Match Analysis" : "Career Guidance",
      });
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Get/Create Conversation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get conversation",
      error: error.message,
    });
  }
};

/**
 * Get conversation history
 */
export const getConversationHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await ChatConversation.findOne({
      _id: conversationId,
      userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({
      success: true,
      data: {
        conversation,
        messages,
      },
    });
  } catch (error) {
    console.error("Get Conversation History Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get conversation history",
      error: error.message,
    });
  }
};

/**
 * Get all conversations for user
 */
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.userId;
    const { status = "active", limit = 20 } = req.query;

    const conversations = await ChatConversation.find({
      userId,
      status,
    })
      .sort({ lastMessageAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Get User Conversations Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get conversations",
      error: error.message,
    });
  }
};

/**
 * Send chat message
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, message, context = {} } = req.body;
    const userId = req.userId;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await ChatConversation.findOne({
        _id: conversationId,
        userId,
      });
    }

    if (!conversation) {
      conversation = await ChatConversation.create({
        userId,
        type: context.type || "general",
        context,
      });
    }

    // Save user message
    const userMessage = await ChatMessage.create({
      conversationId: conversation._id,
      userId,
      role: "user",
      content: message,
    });

    // Call ML service for response
    const mlResponse = await callMLService("/api/ml/chat", {
      userId: userId.toString(),
      message,
      conversationId: conversation._id.toString(),
      context,
    });

    // Save assistant response
    const assistantMessage = await ChatMessage.create({
      conversationId: conversation._id,
      userId,
      role: "assistant",
      content: mlResponse.data.response,
      intent: mlResponse.data.intent,
      suggestions: mlResponse.data.suggestions,
      mlData: mlResponse.data.mlData,
    });

    // Update conversation
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
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

/**
 * Explain job match
 */
export const explainJobMatch = async (req, res) => {
  try {
    const { jobId, conversationId } = req.body;
    const userId = req.userId;

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get job data
    const job = await Job.findById(jobId).populate("companyId");
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check cache
    const cachedAnalysis = await MLAnalysis.findOne({
      userId,
      jobId,
      analysisType: "job_match",
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (cachedAnalysis) {
      return res.json({
        success: true,
        data: cachedAnalysis.results,
        cached: true,
      });
    }

    // Prepare data for ML service
    const resumeText = user.resume || `
      Name: ${user.name}
      Headline: ${user.headline}
      About: ${user.about}
      Education: ${user.degree} from ${user.institute}
      Work Status: ${user.workStatus}
      Location: ${user.location}
    `;

    const jobDescription = `
      ${job.title}
      ${job.description}
      Key Responsibilities: ${job.keyResponsibilities.join(", ")}
      Location: ${job.location}
      Category: ${job.category}
      Level: ${job.level}
    `;

    // Call ML service
    const mlResponse = await callMLService("/api/ml/explain-match", {
      userId: userId.toString(),
      jobId: jobId.toString(),
      resumeText,
      jobDescription,
      jobSkills: job.skillsRequired,
      requiredExperience: job.level === "Senior Level" ? 5 : job.level === "Mid Level" ? 3 : 0,
      jobTitle: job.title,
      conversationId,
    });

    // Cache the results
    await MLAnalysis.create({
      userId,
      jobId,
      analysisType: "job_match",
      inputData: {
        resumeText,
        jobDescription,
        jobSkills: job.skillsRequired,
      },
      results: mlResponse.data,
      matchScore: mlResponse.data.overall_match_score,
      atsScore: mlResponse.data.ats_score,
      explainability: {
        matchedSkills: mlResponse.data.matched_skills,
        missingSkills: mlResponse.data.missing_skills,
        explanation: mlResponse.data.explanation,
      },
    });

    res.json({
      success: true,
      data: mlResponse.data,
      cached: false,
    });
  } catch (error) {
    console.error("Explain Job Match Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to explain job match",
      error: error.message,
    });
  }
};

/**
 * Get career path guidance
 */
export const getCareerPath = async (req, res) => {
  try {
    const { targetRole } = req.body;
    const userId = req.userId;

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check cache
    const cachedAnalysis = await MLAnalysis.findOne({
      userId,
      analysisType: "career_path",
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (cachedAnalysis && !targetRole) {
      return res.json({
        success: true,
        data: cachedAnalysis.results,
        cached: true,
      });
    }

    // Extract skills from user profile
    const skills = [];
    if (user.headline) {
      skills.push(...user.headline.split(/[,\s]+/).filter(s => s.length > 2));
    }

    // Estimate experience
    const experienceYears = user.workStatus === "fresher" ? 0 : 2;

    // Call ML service
    const mlResponse = await callMLService("/api/ml/career-path", {
      userId: userId.toString(),
      currentRole: user.headline || user.workStatus,
      skills,
      experienceYears,
      education: user.degree,
      certifications: [],
      targetRole,
    });

    // Cache the results
    await MLAnalysis.create({
      userId,
      analysisType: "career_path",
      inputData: {
        currentRole: user.headline || user.workStatus,
        skills,
        experienceYears,
      },
      results: mlResponse.data,
      careerPredictions: {
        predictedRoles: mlResponse.data.predicted_roles,
        learningPath: mlResponse.data.learning_path,
        salaryGrowth: mlResponse.data.salary_growth,
      },
    });

    res.json({
      success: true,
      data: mlResponse.data,
      cached: false,
    });
  } catch (error) {
    console.error("Get Career Path Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get career path",
      error: error.message,
    });
  }
};

/**
 * Calculate ATS score
 */
export const calculateATSScore = async (req, res) => {
  try {
    const { resumeText, jobSkills } = req.body;
    const userId = req.userId;

    if (!resumeText || !jobSkills) {
      return res.status(400).json({
        success: false,
        message: "Resume text and job skills are required",
      });
    }

    // Call ML service
    const mlResponse = await callMLService("/api/ml/ats-score", {
      resumeText,
      jobSkills,
    });

    res.json({
      success: true,
      data: mlResponse.data,
    });
  } catch (error) {
    console.error("Calculate ATS Score Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate ATS score",
      error: error.message,
    });
  }
};

/**
 * Delete conversation
 */
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
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Delete Conversation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete conversation",
      error: error.message,
    });
  }
};

import express from "express";
import {
  getOrCreateConversation,
  getConversationHistory,
  getUserConversations,
  sendMessage,
  explainJobMatch,
  getCareerPath,
  calculateATSScore,
  deleteConversation,
} from "../controllers/chatController.js";
import  { protectUser }  from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protectUser);

// Conversation management
router.post("/conversation", getOrCreateConversation);
router.get("/conversations", getUserConversations);
router.get("/conversation/:conversationId", getConversationHistory);
router.delete("/conversation/:conversationId", deleteConversation);

// Chat interaction
router.post("/message", sendMessage);

// ML-powered features
router.post("/explain-match", explainJobMatch);
router.post("/career-path", getCareerPath);
router.post("/ats-score", calculateATSScore);

export default router;

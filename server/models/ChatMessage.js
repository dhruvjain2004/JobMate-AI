import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatConversation",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mlData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    intent: {
      type: String,
      enum: ["job_match", "career_guidance", "ats_score", "general"],
    },
    suggestions: [String],
    metadata: {
      processingTime: Number,
      modelVersion: String,
      confidence: Number,
    },
  },
  { timestamps: true }
);

// Index for efficient message retrieval
chatMessageSchema.index({ conversationId: 1, createdAt: 1 });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;

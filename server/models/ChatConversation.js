import mongoose from "mongoose";

const chatConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Conversation",
    },
    type: {
      type: String,
      enum: ["job_match", "career_guidance", "general"],
      default: "general",
    },
    context: {
      jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
      jobTitle: String,
      analysisType: String,
    },
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
chatConversationSchema.index({ userId: 1, status: 1, lastMessageAt: -1 });

const ChatConversation = mongoose.model("ChatConversation", chatConversationSchema);

export default ChatConversation;

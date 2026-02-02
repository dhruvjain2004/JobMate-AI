import mongoose from "mongoose";

const mlAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      index: true,
    },
    analysisType: {
      type: String,
      enum: ["job_match", "career_path", "ats_score"],
      required: true,
    },
    inputData: {
      resumeText: String,
      jobDescription: String,
      jobSkills: [String],
      currentRole: String,
      skills: [String],
      experienceYears: Number,
    },
    results: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    explainability: {
      matchedSkills: [String],
      missingSkills: [String],
      shapValues: mongoose.Schema.Types.Mixed,
      explanation: String,
    },
    careerPredictions: {
      predictedRoles: [
        {
          role: String,
          probability: Number,
          readinessScore: Number,
        },
      ],
      learningPath: [mongoose.Schema.Types.Mixed],
      salaryGrowth: mongoose.Schema.Types.Mixed,
    },
    cached: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      index: true,
    },
  },
  { timestamps: true }
);

// TTL index to auto-delete expired analyses
mlAnalysisSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for cache lookups
mlAnalysisSchema.index({ userId: 1, jobId: 1, analysisType: 1 });

const MLAnalysis = mongoose.model("MLAnalysis", mlAnalysisSchema);

export default MLAnalysis;

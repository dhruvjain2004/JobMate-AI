import Job from "../models/Job.js";
import User from "../models/user.js";
import JobApplication from "../models/JobApplication.js";
import { v2 as cloudinary } from "cloudinary";

//Get user data
export const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//apply for a job
export const applyForJob = async (req, res) => {
  const { jobId } = req.body;
  const userId = req.user._id;
  try {
    const isAlreadyApplied = await JobApplication.find({ jobId, userId });
    if (isAlreadyApplied.length > 0) {
      return res.json({
        success: false,
        message: "Already Applied",
      });
    }
    const jobData = await Job.findById(jobId);

    if (!jobData) {
      return res.json({
        success: false,
        message: "Not found",
      });
    }

    await JobApplication.create({
      companyId: jobData.companyId,
      userId,
      jobId,
      date: Date.now(),
    });
    res.json({
      success: true,
      message: "Applied Successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Job Not Found",
    });
  }
};

//Get user applied applications
export const getUserJobApplications = async (req, res) => {
  try {
    const userId = req.user._id;

    const applications = await JobApplication.find({ userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title description location category level salary")
      .exec();
    if (!applications) {
      return res.json({
        success: false,
        message: "No job applications found for this user",
      });
    }
    return res.json({
      success: true,
      applications,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//update user profile (resume)
export const updateUserResume = async (req, res) => {
  try {
    const userId = req.user._id;

    const resumeFile = req.file;

    const userData = await User.findById(userId);

    if (resumeFile) {
      // Convert buffer to base64 string for Cloudinary upload
      const b64 = Buffer.from(resumeFile.buffer).toString("base64");
      const dataURI = `data:${resumeFile.mimetype};base64,${b64}`;

      const resumeUpload = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "resumes",
      });

      userData.resume = resumeUpload.secure_url;
    }

    await userData.save();
    res.json({
      success: true,
      message: "Resume updated",
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
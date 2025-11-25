import express from "express";
import {
  applyForJob,
  getUserData,
  getUserJobApplications,
  updateUserResume,
} from "../controllers/userController.js";
import upload from "../config/multer.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/user", protectUser, getUserData);
router.post("/apply", protectUser, applyForJob);
router.get("/applications", protectUser, getUserJobApplications);
router.post("/update-resume", protectUser, upload.single("resume"), updateUserResume);

export default router;


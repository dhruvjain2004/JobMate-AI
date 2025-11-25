import express from "express";
import {
  googleAuth,
  loginAdmin,
  loginUser,
  registerAdmin,
  registerUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);

router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);

export default router;


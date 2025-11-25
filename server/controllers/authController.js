import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import Admin from "../models/Admin.js";
import generateToken from "../utils/generateToken.js";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

const buildUserPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  mobileNumber: user.mobileNumber,
  workStatus: user.workStatus,
  resume: user.resume,
  image: user.image,
});

export const registerUser = async (req, res) => {
  const { fullName, email, password, mobileNumber, workStatus } = req.body;

  if (!fullName || !email || !password || !mobileNumber || !workStatus) {
    return res.json({ success: false, message: "Please fill in all required fields." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      mobileNumber,
      workStatus,
    });

    res.json({
      success: true,
      message: "Account created successfully.",
      token: generateToken(user._id),
      user: buildUserPayload(user),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid email or password." });
    }

    res.json({
      success: true,
      message: "Logged in successfully.",
      token: generateToken(user._id),
      user: buildUserPayload(user),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.json({ success: false, message: "Google credential missing." });
  }

  if (!googleClient) {
    return res.json({ success: false, message: "Google auth is not configured." });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name || "Google User",
        email: payload.email,
        mobileNumber: payload.phone_number || "NA",
        workStatus: "experienced",
        googleId: payload.sub,
        image: payload.picture,
        password: null,
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      if (!user.image && payload.picture) {
        user.image = payload.picture;
      }
      await user.save();
    }

    res.json({
      success: true,
      message: "Authenticated with Google.",
      token: generateToken(user._id),
      user: buildUserPayload(user),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const buildAdminPayload = (admin) => ({
  _id: admin._id,
  name: admin.name,
  email: admin.email,
  avatar: admin.avatar,
});

export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "All fields are required." });
  }

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.json({ success: false, message: "Admin already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({ name, email, password: hashedPassword });

    res.json({
      success: true,
      message: "Admin account created.",
      token: generateToken(admin._id),
      admin: buildAdminPayload(admin),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Email and password are required." });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.json({ success: false, message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials." });
    }

    res.json({
      success: true,
      message: "Admin login successful.",
      token: generateToken(admin._id),
      admin: buildAdminPayload(admin),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


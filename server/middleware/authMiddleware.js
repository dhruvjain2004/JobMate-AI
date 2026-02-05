import jwt from "jsonwebtoken";
import Company from "../models/Company.js";
import User from "../models/user.js";

const extractBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) return null;
  return authorizationHeader.split(" ")[1];
};

export const protectCompany = async (req, res, next) => {
  // Accept either a raw `token` header or `Authorization: Bearer <token>`
  const token = req.headers.token || extractBearerToken(req.headers.authorization || "");
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized, please login again." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.company = await Company.findById(decoded.id).select("-password");
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const protectUser = async (req, res, next) => {
  const bearer = extractBearerToken(req.headers.authorization || "");
  if (!bearer) {
    return res.status(401).json({ success: false, message: "Unauthorized, please login again." });
  }
  try {
    const decoded = jwt.verify(bearer, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    req.user = user;
    req.userId = decoded.id; // ensure controllers relying on req.userId work
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};
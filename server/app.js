import "./config/instrument.js";
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import * as Sentry from "@sentry/node";
import companyRoutes from "./routes/companyRoutes.js";
import connectCloudinary from "./config/cloudinary.js";
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

await connectDB();
await connectCloudinary();

app.use(cors());
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.get("/", (req, res) => {
  res.send("API Working Properly");
});
app.get("/debug-sentry", function mainHandler() {
  throw new Error("My first Sentry error!");
});

app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 5000;
// Fix Sentry error handler usage
app.use(Sentry.Handlers.errorHandler());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
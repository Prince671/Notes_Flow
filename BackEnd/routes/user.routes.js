require("dotenv").config(); // ✅ IMPORTANT

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user.model");
const auth = require("../middleware/auth");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ================== EMAIL SETUP ==================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ================== REGISTER ==================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Backend Register Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ================== LOGIN ==================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (err) {
    console.error("Backend Login Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ================== PROFILE ==================
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);

  } catch (err) {
    console.error("Backend Profile Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================== FORGOT PASSWORD ==================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // ✅ Create reset token
    const resetToken = jwt.sign(
      { id: user._id, isResetToken: true },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // ✅ Create reset link
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    // ✅ Send Email
    try {
      await transporter.sendMail({
        from: `"NotesFlow Support" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Password Reset Request",
        html: `
          <h3>Hello ${user.name},</h3>
          <p>Click below to reset your password:</p>
          <a href="${resetLink}" 
             style="padding:10px 15px; background:#3b82f6; color:white; text-decoration:none; border-radius:5px;">
             Reset Password
          </a>
          <p>This link expires in 15 minutes.</p>
        `,
      });

      console.log("✅ Email sent:", user.email);

      res.json({ message: "Password reset link sent to email" });

    } catch (mailError) {
      console.error("❌ Email error:", mailError);

      let errorMessage = "Email failed. Check backend console for reset link";
      if (mailError.code === 'EAUTH') {
        errorMessage = "Email authentication failed. Your Gmail App Password might be incorrect or revoked.";
      }

      // fallback (for dev)
      console.log("====================================================");
      console.log("RESET LINK (FALLBACK):", resetLink);
      console.log("====================================================");

      res.status(500).json({
        error: errorMessage,
        details: mailError.message
      });
    }

  } catch (err) {
    console.error("Backend Forgot Password Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================== RESET PASSWORD ==================
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token & password required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password too short" });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);

      if (!decoded.isResetToken) {
        return res.status(401).json({ error: "Invalid token" });
      }

    } catch (err) {
      return res.status(401).json({ error: "Token expired/invalid" });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error("Backend Reset Password Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const ChatHistory = require("../models/chat.model");
const auth = require("../middleware/auth"); // Assuming this middleware exists

// Fetch chat history for the logged-in user
router.get("/history", auth, async (req, res) => {
  try {
    const history = await ChatHistory.findOne({ userId: req.user.id });
    if (!history) {
      return res.json({ messages: [] });
    }
    res.json(history);
  } catch (error) {
    console.error("Fetch History Error:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// Clear chat history for the logged-in user
router.delete("/clear", auth, async (req, res) => {
  try {
    await ChatHistory.findOneAndDelete({ userId: req.user.id });
    res.json({ message: "Chat history cleared" });
  } catch (error) {
    console.error("Clear History Error:", error);
    res.status(500).json({ error: "Failed to clear chat history" });
  }
});

module.exports = router;

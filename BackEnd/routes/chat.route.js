const express = require("express");
const router = express.Router();
const ChatSession = require("../models/chat.model");
const auth = require("../middleware/auth");

/* ─────────────────────────────────────────────────────────────────────────────
   GET /history  —  return all sessions for the logged-in user (lightweight,
                    messages omitted so the sidebar list loads fast)
───────────────────────────────────────────────────────────────────────────── */
router.get("/history", auth, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .select("_id title createdAt updatedAt")
      .lean();

    // Attach user-message count for the sidebar subtitle
    const sessionsWithCount = await Promise.all(
      sessions.map(async (s) => {
        const full = await ChatSession.findById(s._id).select("messages").lean();
        const userMsgCount = (full?.messages || []).filter(
          (m) => m.role === "user"
        ).length;
        return { ...s, userMsgCount };
      })
    );

    res.json({ sessions: sessionsWithCount });
  } catch (err) {
    console.error("Fetch History Error:", err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   GET /history/:sessionId  —  return a single session with all messages
───────────────────────────────────────────────────────────────────────────── */
router.get("/history/:sessionId", auth, async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.sessionId,
      userId: req.user.id,
    }).lean();

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json({ session });
  } catch (err) {
    console.error("Fetch Session Error:", err);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   POST /session  —  create a new empty session
                     body: { title? }
───────────────────────────────────────────────────────────────────────────── */
router.post("/session", auth, async (req, res) => {
  try {
    const session = await ChatSession.create({
      userId: req.user.id,
      title: req.body.title?.trim() || "New Chat",
      messages: [],
    });
    res.status(201).json({ session });
  } catch (err) {
    console.error("Create Session Error:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /session/:sessionId/title  —  rename a session
                                       body: { title }
───────────────────────────────────────────────────────────────────────────── */
router.patch("/session/:sessionId/title", auth, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    const session = await ChatSession.findOneAndUpdate(
      { _id: req.params.sessionId, userId: req.user.id },
      { title: title.trim().slice(0, 120) },
      { new: true, select: "_id title updatedAt" }
    );
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json({ session });
  } catch (err) {
    console.error("Rename Session Error:", err);
    res.status(500).json({ error: "Failed to rename session" });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   POST /session/:sessionId/message  —  append a message to a session
                                        body: { role, text, isError?, files? }
───────────────────────────────────────────────────────────────────────────── */
router.post("/session/:sessionId/message", auth, async (req, res) => {
  try {
    const { role, text, isError, files } = req.body;
    if (!role || !text) {
      return res.status(400).json({ error: "role and text are required" });
    }

    const message = { role, text, isError: !!isError, files: files || [] };

    const session = await ChatSession.findOneAndUpdate(
      { _id: req.params.sessionId, userId: req.user.id },
      { $push: { messages: message } },
      { new: true, select: "_id title updatedAt messages" }
    );

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Return only the newly added message (last in array)
    const saved = session.messages[session.messages.length - 1];
    res.status(201).json({ message: saved });
  } catch (err) {
    console.error("Add Message Error:", err);
    res.status(500).json({ error: "Failed to add message" });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /session/:sessionId  —  delete an entire session
───────────────────────────────────────────────────────────────────────────── */
router.delete("/session/:sessionId", auth, async (req, res) => {
  try {
    const result = await ChatSession.findOneAndDelete({
      _id: req.params.sessionId,
      userId: req.user.id,
    });
    if (!result) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json({ message: "Session deleted" });
  } catch (err) {
    console.error("Delete Session Error:", err);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /clear  —  delete ALL sessions for the user (legacy / nuclear option)
───────────────────────────────────────────────────────────────────────────── */
router.delete("/clear", auth, async (req, res) => {
  try {
    await ChatSession.deleteMany({ userId: req.user.id });
    res.json({ message: "All chat history cleared" });
  } catch (err) {
    console.error("Clear All Error:", err);
    res.status(500).json({ error: "Failed to clear chat history" });
  }
});

module.exports = router;
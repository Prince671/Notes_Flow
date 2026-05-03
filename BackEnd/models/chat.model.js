const mongoose = require("mongoose");

/* ── individual message inside a session ── */
const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    isError: {
      type: Boolean,
      default: false,
    },
    files: [
      {
        name: String,
        type: String,
        path: String,
      },
    ],
  },
  { timestamps: true }
);

/* ── one conversation session ── */
const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat",
      maxlength: 120,
    },
    messages: [chatMessageSchema],
  },
  { timestamps: true }
);

// Index so we can quickly fetch all sessions for a user sorted by recent
chatSessionSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model("ChatSession", chatSessionSchema);
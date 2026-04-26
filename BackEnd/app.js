require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connection = require("./config/db");
const notesRoute = require("./routes/notes.route");
const authRoute = require("./routes/user.routes");
const chatRoute = require("./routes/chat.route");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/auth", authRoute);
app.use("/notes", notesRoute);
app.use("/chat", chatRoute);

// Start server after DB connection
app.listen(3000, async () => {
  try {
    await connection;
    console.log("✅ Connected to DB");
    console.log("🚀 Server running at: http://localhost:3000");
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }
});

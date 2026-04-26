const express = require('express');
const Note = require('../models/notes.model');
const auth = require('../middleware/auth');
const cors = require('cors');
const aiService = require('../services/ai.service');
const multer = require('multer');
const { storage } = require('../config/cloudinary.config');

const router = express.Router();
router.use(cors());

// Use Cloudinary for file uploads — accept all common file types
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB per file
});

// Helper: derive a normalised attachment type from mime + filename
const getFileType = (mimetype, originalname) => {
  const mime = (mimetype || '').toLowerCase();
  const name = (originalname || '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (
    mime === 'application/msword' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    /\.(doc|docx)$/.test(name)
  ) return 'doc';
  if (
    mime === 'application/vnd.ms-excel' ||
    mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    /\.(xls|xlsx|csv)$/.test(name)
  ) return 'excel';
  if (
    mime === 'application/vnd.ms-powerpoint' ||
    mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    /\.(ppt|pptx)$/.test(name)
  ) return 'ppt';
  if (mime.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/.test(name)) return 'video';
  if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac)$/.test(name)) return 'audio';
  return 'file';
};

/* ------------------------
   ADD NOTE
------------------------ */
router.post(
  "/add",
  auth,
  upload.fields([
    { name: "files", maxCount: 5 },      // attachments
    { name: "canvasImage", maxCount: 1 } // canvas file (optional)
  ]),
  async (req, res) => {
    try {
      const {
        title,
        desc,
        tags = [],
        priority = "medium",
        archived = false,
        starred = false,
        canvasData // optional JSON/base64
      } = req.body;

      if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // ✅ Allow canvas-only note
      if (!title?.trim() && !desc?.trim() && !canvasData && !req.files?.canvasImage) {
        return res.status(400).json({
          error: "Provide title, description, or canvas drawing",
        });
      }

      // 📎 Attachments
      const attachments = req.files?.files
        ? req.files.files.map((file) => ({
            url: file.path,
            type: getFileType(file.mimetype, file.originalname),
            name: file.originalname,
          }))
        : [];

      // 🎨 Canvas Image (file upload)
      let canvasImage = null;

      if (req.files?.canvasImage?.length > 0) {
        canvasImage = req.files.canvasImage[0].path;
      }

      // 🎨 OR base64 fallback
      if (!canvasImage && canvasData) {
        canvasImage = canvasData;
      }

      const note = await Note.create({
        title: title?.trim() || "",
        description: desc?.trim() || "",
        tags: Array.isArray(tags)
          ? tags
          : tags.split(",").map((t) => t.trim()).filter(Boolean),
        priority,
        archived,
        starred,
        attachments,
        canvasImage,
        canvasData: canvasData || null,
        createdBy: req.user.id,
      });

      return res.status(201).json({
        message: "Note added successfully",
        note,
      });

    } catch (error) {
      console.error("Add Note Error:", error);

      if (error.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          error: "Unexpected file field. Check field names.",
        });
      }

      return res.status(500).json({
        error: error.message || "Failed to add note",
      });
    }
  }
);


/* ------------------------
   FETCH NOTES
------------------------ */
router.get('/fetch', auth, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notes = await Note.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json(notes);

  } catch (error) {
    console.error("Fetch Notes Error:", error);
    return res.status(500).json({ error: "Failed to fetch notes" });
  }
});


/* ------------------------
   DELETE NOTE
------------------------ */
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const deleted = await Note.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.json({ message: "Note deleted successfully" });

  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ error: "Failed to delete note" });
  }
});


/* ------------------------
   UPDATE NOTE
------------------------ */
router.put('/update/:id', auth, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, desc, tags, priority, archived, starred, existingAttachments } = req.body;

    const updateFields = {};

    if (title) updateFields.title = title.trim();
    if (desc) updateFields.description = desc.trim();
    if (tags) {
      updateFields.tags = Array.isArray(tags)
        ? tags
        : tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (priority) updateFields.priority = priority;
    if (archived !== undefined) updateFields.archived = archived;
    if (starred !== undefined) updateFields.starred = starred;

    let attachments = [];
    if (existingAttachments) {
      attachments = Array.isArray(existingAttachments) ? existingAttachments : JSON.parse(existingAttachments);
    }

    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        url: file.path, // Cloudinary URL
        type: getFileType(file.mimetype, file.originalname),
        name: file.originalname
      }));
      attachments = [...attachments, ...newAttachments];
    }
    
    updateFields.attachments = attachments;

    const updated = await Note.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      updateFields,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.json({
      message: "Note updated successfully",
      note: updated
    });

  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({ error: error.message || "Failed to update note" });
  }
});


/* ------------------------
   SHARE NOTE (PUBLIC)
------------------------ */
router.get('/share/:publicId', async (req, res) => {
  try {
    const note = await Note.findOne({ publicId: req.params.publicId }).lean();

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    return res.json({
      title: note.title,
      description: note.description,
      tags: note.tags || []
    });

  } catch (error) {
    console.error("Share Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


const ChatHistory = require("../models/chat.model");

/* ------------------------
   AI AGENT (MAIN FIXED PART)
------------------------ */
router.post('/ask', auth, upload.array('files', 3), async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question is required" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 1. Fetch chat history for context
    let chatHistory = await ChatHistory.findOne({ userId: req.user.id });
    const historyContext = chatHistory ? chatHistory.messages : [];

    // 2. Fetch user notes for context
    const notes = await Note.find({ createdBy: req.user.id })
      .select("title description attachments");

    // 3. Process current uploaded files
    const currentFiles = req.files ? req.files.map(file => ({
      path: file.path,
      mimetype: file.mimetype,
      originalname: file.originalname
    })) : [];

    // 4. Get answer from AI
    const answer = await aiService.askAgent(notes, question, currentFiles, historyContext);

    if (!answer) {
      return res.status(500).json({ error: "Empty AI response" });
    }

    // 5. Save interaction to history
    const newUserMsg = {
      role: "user",
      text: question,
      files: currentFiles.map(f => ({ 
        name: f.originalname, 
        type: f.mimetype,
        path: f.path
      }))
    };
    const newAiMsg = {
      role: "ai",
      text: answer
    };

    if (chatHistory) {
      chatHistory.messages.push(newUserMsg, newAiMsg);
      await chatHistory.save();
    } else {
      chatHistory = new ChatHistory({
        userId: req.user.id,
        messages: [newUserMsg, newAiMsg]
      });
      await chatHistory.save();
    }

    return res.status(200).json({
      answer
    });

  } catch (error) {
    console.error("🔥 Ask AI Error:", error);
    return res.status(500).json({
      error: error.message || "AI request failed"
    });
  }
});

module.exports = router;
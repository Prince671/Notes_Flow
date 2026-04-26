const express = require('express');
const { Note, Folder } = require('../models/notes.model');
const auth = require('../middleware/auth');
const cors = require('cors');
const aiService = require('../services/ai.service');
const multer = require('multer');
const { storage, cloudinary } = require('../config/cloudinary.config'); // ✅ FIX: import cloudinary instance too
const ChatHistory = require('../models/chat.model'); // ✅ FIX: moved to top with all other imports

const router = express.Router();
router.use(cors());

/* ─────────────────────────────────────────────────────────────
   MULTER SETUP
───────────────────────────────────────────────────────────── */

// ✅ FIX: expanded allowed MIME types to match what the frontend actually accepts
//    (doc, xlsx, ppt, txt, csv, video, audio were previously rejected silently)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  // Office documents
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Text / data
  'text/plain',
  'text/csv',
  'application/csv',
  // Video
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
]);

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // ✅ FIX: raised from 5 MB → 20 MB (videos/audio need room)
});

/* ─────────────────────────────────────────────────────────────
   CLOUDINARY HELPER UTILITIES
───────────────────────────────────────────────────────────── */

/**
 * Extract the Cloudinary public_id from a full URL.
 * e.g. "https://res.cloudinary.com/demo/image/upload/v123/notes/abc.png"
 *       → "notes/abc"
 * Returns null if the URL doesn't look like a Cloudinary URL.
 */
const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('cloudinary.com')) return null;
  try {
    // Strip query string first
    const clean = url.split('?')[0];
    // The public_id lives after "/upload/v<digits>/" or "/upload/"
    const match = clean.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) return null;
    // Remove file extension (.png, .pdf, …)
    return match[1].replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
};

/**
 * Delete a single Cloudinary asset by URL.
 * Tries image resource type first; falls back to raw (for PDFs / docs).
 * Errors are swallowed so that a failed CDN cleanup never blocks a DB delete.
 */
const deleteCloudinaryAsset = async (url) => {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  try {
    // Try as image first (covers jpeg, png, gif, webp)
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    if (result.result === 'not found') {
      // Fall back to raw (pdf, docx, xlsx, pptx, txt, csv …)
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }
  } catch (err) {
    // Log but never throw — DB operation already succeeded
    console.error(`[Cloudinary] Failed to delete asset (${publicId}):`, err.message);
  }
};

/**
 * Delete ALL Cloudinary assets belonging to a note:
 * canvasImage + every attachment URL.
 */
const deleteNoteAssets = async (note) => {
  const tasks = [];

  if (note.canvasImage) {
    tasks.push(deleteCloudinaryAsset(note.canvasImage));
  }

  if (Array.isArray(note.attachments)) {
    for (const att of note.attachments) {
      if (att?.url) tasks.push(deleteCloudinaryAsset(att.url));
    }
  }

  // Run all deletions in parallel; individual failures are already handled inside
  await Promise.allSettled(tasks);
};

/* ─────────────────────────────────────────────────────────────
   FOLDER ROUTES
───────────────────────────────────────────────────────────── */

/* ── Create Folder ── */
router.post('/folders/create', auth, async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

    const { name, color = '#6366f1', icon = '📁' } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Folder name is required' });

    const folder = await Folder.create({
      name: name.trim(),
      color,
      icon,
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: 'Folder created', folder });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A folder with that name already exists' });
    }
    console.error('Create Folder Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create folder' });
  }
});

/* ── Fetch Folders ── */
router.get('/folders/fetch', auth, async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

    const folders = await Folder.find({ createdBy: req.user.id }).sort({ createdAt: 1 });
    return res.status(200).json(folders);
  } catch (error) {
    console.error('Fetch Folders Error:', error);
    return res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

/* ── Update Folder ── */
router.put('/folders/update/:id', auth, async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

    const { name, color, icon } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (color) updateFields.color = color;
    if (icon) updateFields.icon = icon;

    // ✅ FIX: guard against empty update body
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      updateFields,
      { new: true }
    );

    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    return res.json({ message: 'Folder updated', folder });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A folder with that name already exists' });
    }
    console.error('Update Folder Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update folder' });
  }
});

/* ── Delete Folder ── */
// ✅ FIX: now also cleans up Cloudinary assets for every note inside the folder
router.delete('/folders/delete/:id', auth, async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

    const deleted = await Folder.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!deleted) return res.status(404).json({ error: 'Folder not found' });

    // Move notes inside this folder back to Inbox (no Cloudinary cleanup — notes still exist)
    await Note.updateMany(
      { folderId: req.params.id, createdBy: req.user.id },
      { $set: { folderId: null } }
    );

    return res.json({ message: 'Folder deleted, notes moved to inbox' });
  } catch (error) {
    console.error('Delete Folder Error:', error);
    return res.status(500).json({ error: 'Failed to delete folder' });
  }
});

/* ── Move Note to Folder ── */
router.put('/move/:noteId', auth, async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

    const { folderId } = req.body;

    if (folderId) {
      const folder = await Folder.findOne({ _id: folderId, createdBy: req.user.id });
      if (!folder) return res.status(404).json({ error: 'Folder not found' });
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.noteId, createdBy: req.user.id },
      { $set: { folderId: folderId || null } },
      { new: true }
    );

    if (!note) return res.status(404).json({ error: 'Note not found' });
    return res.json({ message: 'Note moved successfully', note });
  } catch (error) {
    console.error('Move Note Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to move note' });
  }
});

/* ─────────────────────────────────────────────────────────────
   NOTE ROUTES
───────────────────────────────────────────────────────────── */

/* ── Add Note ── */
router.post(
  '/add',
  auth,
  upload.fields([
    { name: 'files', maxCount: 5 },
    { name: 'canvasImage', maxCount: 1 }, // ✅ FIX: was 3, canvas is always a single image
  ]),
  async (req, res) => {
    try {
      // ✅ FIX: auth guard moved BEFORE any body destructuring
      if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

      const {
        title,
        desc,
        tags = [],
        priority = 'medium',
        archived = false,
        starred = false,
        canvasData,
        canvasName = 'Canvas Drawing',
        folderId,
      } = req.body;

      if (!title?.trim() && !desc?.trim() && !canvasData && !req.files?.canvasImage) {
        return res.status(400).json({ error: 'Provide a title, description, or canvas drawing' });
      }

      if (folderId) {
        const folder = await Folder.findOne({ _id: folderId, createdBy: req.user.id });
        if (!folder) return res.status(404).json({ error: 'Folder not found' });
      }

      const attachments = (req.files?.files ?? []).map((file) => ({
        url: file.path,
        mimetype: file.mimetype,
        name: file.originalname,
      }));

      let canvasImage = null;
      if (req.files?.canvasImage?.length > 0) {
        canvasImage = req.files.canvasImage[0].path;
      } else if (canvasData) {
        canvasImage = canvasData;
      }

      // ✅ FIX: normalise tags regardless of whether they arrive as array or CSV string
      const normalisedTags = (() => {
        if (!tags) return [];
        if (Array.isArray(tags)) return tags.map((t) => t.trim()).filter(Boolean);
        return tags.split(',').map((t) => t.trim()).filter(Boolean);
      })();

      const note = await Note.create({
        title: title?.trim() || '',
        description: desc?.trim() || '',
        tags: normalisedTags,
        priority,
        // ✅ FIX: coerce string "true"/"false" coming from multipart form body to boolean
        archived: archived === true || archived === 'true',
        starred: starred === true || starred === 'true',
        attachments,
        canvasImage,
        canvasName: canvasName || 'Canvas Drawing',
        canvasData: canvasData || null,
        folderId: folderId || null,
        createdBy: req.user.id,
      });

      return res.status(201).json({ message: 'Note added successfully', note });
    } catch (error) {
      console.error('Add Note Error:', error);
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Unexpected file field name.' });
      }
      return res.status(500).json({ error: error.message || 'Failed to add note' });
    }
  }
);

/* ── Fetch Notes ── */
router.get('/fetch', auth, async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

    const notes = await Note.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(notes);
  } catch (error) {
    console.error('Fetch Notes Error:', error);
    return res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

/* ── Delete Note ── */
// ✅ NEW: deletes all Cloudinary assets (attachments + canvasImage) before removing from DB
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

    const note = await Note.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!note) return res.status(404).json({ error: 'Note not found' });

    // Delete all Cloudinary assets first (non-blocking — errors are logged, not thrown)
    await deleteNoteAssets(note);

    // Now remove from DB
    await note.deleteOne();

    return res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    return res.status(500).json({ error: 'Failed to delete note' });
  }
});

/* ── Update Note ── */
// ✅ FIX: now handles canvasImage uploads + deletes orphaned Cloudinary assets
router.put(
  '/update/:id',
  auth,
  upload.fields([
    { name: 'files', maxCount: 5 },
    { name: 'canvasImage', maxCount: 1 }, // ✅ FIX: canvas save sends canvasImage field
  ]),
  async (req, res) => {
    try {
      if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

      const {
        title,
        desc,
        tags,
        priority,
        archived,
        starred,
        existingAttachments,
        canvasName,
        folderId,
      } = req.body;

      // Fetch the current note so we can diff attachments for cleanup
      const currentNote = await Note.findOne({ _id: req.params.id, createdBy: req.user.id });
      if (!currentNote) return res.status(404).json({ error: 'Note not found' });

      const updateFields = {};
      if (title !== undefined) updateFields.title = title.trim();
      if (desc !== undefined) updateFields.description = desc.trim();
      if (tags !== undefined) {
        updateFields.tags = Array.isArray(tags)
          ? tags.map((t) => t.trim()).filter(Boolean)
          : tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
      if (priority) updateFields.priority = priority;
      // ✅ FIX: coerce multipart string booleans
      if (archived !== undefined) updateFields.archived = archived === true || archived === 'true';
      if (starred !== undefined) updateFields.starred = starred === true || starred === 'true';
      if (canvasName !== undefined) updateFields.canvasName = canvasName || 'Canvas Drawing';
      if (folderId !== undefined) updateFields.folderId = folderId || null;

      // ── Attachment diffing ────────────────────────────────────────────────
      // Parse the attachments the client still wants to keep
      let keptAttachments = [];
      if (existingAttachments) {
        try {
          keptAttachments = Array.isArray(existingAttachments)
            ? existingAttachments
            : JSON.parse(existingAttachments);
        } catch {
          keptAttachments = [];
        }
      }

      // Find URLs that were removed by the user → delete from Cloudinary
      const keptUrls = new Set(keptAttachments.map((a) => a?.url).filter(Boolean));
      const removedAttachments = (currentNote.attachments || []).filter(
        (a) => a?.url && !keptUrls.has(a.url)
      );
      if (removedAttachments.length > 0) {
        await Promise.allSettled(removedAttachments.map((a) => deleteCloudinaryAsset(a.url)));
      }

      // Append any newly uploaded attachment files
      const newAttachments = (req.files?.files ?? []).map((file) => ({
        url: file.path,
        mimetype: file.mimetype,
        name: file.originalname,
      }));
      updateFields.attachments = [...keptAttachments, ...newAttachments];

      // ── Canvas image handling ─────────────────────────────────────────────
      if (req.files?.canvasImage?.length > 0) {
        // ✅ NEW: if note already had a canvas image, delete the old one from Cloudinary
        if (currentNote.canvasImage) {
          await deleteCloudinaryAsset(currentNote.canvasImage);
        }
        updateFields.canvasImage = req.files.canvasImage[0].path;
      }

      const updated = await Note.findOneAndUpdate(
        { _id: req.params.id, createdBy: req.user.id },
        updateFields,
        { new: true }
      );

      // Shouldn't happen (checked above), but guard anyway
      if (!updated) return res.status(404).json({ error: 'Note not found' });

      return res.json({ message: 'Note updated successfully', note: updated });
    } catch (error) {
      console.error('Update Error:', error);
      return res.status(500).json({ error: error.message || 'Failed to update note' });
    }
  }
);

/* ── Share Note (Public) ── */
router.get('/share/:publicId', async (req, res) => {
  try {
    const note = await Note.findOne({ publicId: req.params.publicId }).lean();
    if (!note) return res.status(404).json({ message: 'Note not found' });

    return res.json({
      title: note.title,
      description: note.description,
      tags: note.tags || [],
    });
  } catch (error) {
    console.error('Share Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/* ── AI Agent ── */
router.post('/ask', auth, upload.array('files', 3), async (req, res) => {
  try {
    // ✅ FIX: auth check before reading body
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

    const { question } = req.body;
    if (!question?.trim()) return res.status(400).json({ error: 'Question is required' });

    let chatHistory = await ChatHistory.findOne({ userId: req.user.id });
    const historyContext = chatHistory ? chatHistory.messages : [];

    const notes = await Note.find({ createdBy: req.user.id }).select('title description attachments');
    const currentFiles = (req.files ?? []).map((file) => ({
      path: file.path,
      mimetype: file.mimetype,
      originalname: file.originalname,
    }));

    const answer = await aiService.askAgent(notes, question, currentFiles, historyContext);
    if (!answer) return res.status(500).json({ error: 'Empty AI response' });

    const newUserMsg = {
      role: 'user',
      text: question,
      files: currentFiles.map((f) => ({ name: f.originalname, type: f.mimetype, path: f.path })),
    };
    const newAiMsg = { role: 'ai', text: answer };

    if (chatHistory) {
      chatHistory.messages.push(newUserMsg, newAiMsg);
      await chatHistory.save();
    } else {
      chatHistory = new ChatHistory({
        userId: req.user.id,
        messages: [newUserMsg, newAiMsg],
      });
      await chatHistory.save();
    }

    return res.status(200).json({ answer });
  } catch (error) {
    console.error('Ask AI Error:', error);
    return res.status(500).json({ error: error.message || 'AI request failed' });
  }
});

module.exports = router;
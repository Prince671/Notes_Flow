const express = require('express');
const { Note, Folder } = require('../models/notes.model');
const auth = require('../middleware/auth');
const cors = require('cors');
const aiService = require('../services/ai.service');
const multer = require('multer');
const { storage, cloudinary } = require('../config/cloudinary.config');
const ChatHistory = require('../models/chat.model');

const router = express.Router();
router.use(cors());

/* ─────────────────────────────────────────────────────────────
   MIME → ATTACHMENT TYPE MAPPER
   FIX: The old schema only allowed 'image' | 'pdf'. We now map
        every accepted MIME to one of the expanded enum values.
───────────────────────────────────────────────────────────── */
const mimeToAttachmentType = (mimetype = '') => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype === 'application/pdf') return 'pdf';
  if (
    mimetype === 'application/msword' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return 'doc';
  if (
    mimetype === 'application/vnd.ms-excel' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
    return 'excel';
  if (
    mimetype === 'application/vnd.ms-powerpoint' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  )
    return 'ppt';
  if (mimetype === 'text/plain' || mimetype === 'text/csv' || mimetype === 'application/csv')
    return 'text';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  return 'raw';
};

/* ─────────────────────────────────────────────────────────────
   MULTER SETUP
───────────────────────────────────────────────────────────── */
const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
  // PDF
  'application/pdf',
  // Office documents
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Text / data
  'text/plain', 'text/csv', 'application/csv',
  // Video
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
  // Audio
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4',
]);

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      // FIX: instead of throwing an error (which breaks multipart parsing),
      //      skip the file gracefully and continue so other fields still parse.
      cb(null, false);
    }
  },
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB per file
});

/* ─────────────────────────────────────────────────────────────
   CLOUDINARY HELPER UTILITIES
───────────────────────────────────────────────────────────── */

/**
 * Extract the Cloudinary public_id from a full URL.
 * e.g. "https://res.cloudinary.com/demo/image/upload/v123/notes/abc.png"
 *       → "notes/abc"
 */
const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('cloudinary.com')) return null;
  try {
    const clean = url.split('?')[0];
    const match = clean.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) return null;
    return match[1].replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
};

/**
 * Delete a single Cloudinary asset by URL.
 * FIX: tries 'image' first, then 'video', then 'raw' so that ALL
 *      file types (docs, videos, audio, PDFs) are cleaned up correctly.
 *      Errors are swallowed so a failed CDN cleanup never blocks a DB delete.
 */
const deleteCloudinaryAsset = async (url) => {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  for (const resourceType of ['image', 'video', 'raw']) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      if (result.result === 'ok') return; // deleted — stop trying
    } catch {
      // ignore and try next resource type
    }
  }
  console.warn(`[Cloudinary] Could not delete asset: ${publicId}`);
};

/**
 * Delete ALL Cloudinary assets belonging to a note:
 * canvasImage + every attachment URL.
 */
const deleteNoteAssets = async (note) => {
  const tasks = [];
  if (note.canvasImage) tasks.push(deleteCloudinaryAsset(note.canvasImage));
  if (Array.isArray(note.attachments)) {
    for (const att of note.attachments) {
      if (att?.url) tasks.push(deleteCloudinaryAsset(att.url));
    }
  }
  await Promise.allSettled(tasks);
};

/* ─────────────────────────────────────────────────────────────
   CLOUDINARY CONFIG PATCH
   FIX: Cloudinary's default multer-storage-cloudinary only uploads
        as 'image'. Docs / videos / audio need resource_type 'auto'
        or 'raw'. The cleanest fix is to set resource_type: 'auto'
        in your cloudinary.config.js. If you cannot change that file,
        the helper below re-uploads as 'raw' after multer saves it.
   ─────────────────────────────────────────────────────────────
   IMPORTANT: In your /config/cloudinary.config.js make sure the
   storage is configured like this:
   
     const storage = new CloudinaryStorage({
       cloudinary,
       params: async (_req, file) => ({
         folder: 'notes_attachments',
         resource_type: 'auto',          // ← THIS IS THE KEY FIX
         allowed_formats: null,          // allow everything
         use_filename: true,
         unique_filename: true,
       }),
     });
   
   Without resource_type: 'auto', Cloudinary rejects non-image uploads
   with a 400 error, which is the root cause of the attachment bug.
───────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────
   FOLDER ROUTES
   FIX: frontend calls /folders (GET), /folders (POST),
        /folders/:id (PUT), /folders/:id (DELETE).
        Old routes used /folders/fetch, /folders/create, etc.
        Both sets of routes are registered below so existing
        bookmarks and the new frontend both work.
───────────────────────────────────────────────────────────── */

/* ── Create Folder ── */
const createFolderHandler = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { name, color = '#6366f1', icon = '📁' } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Folder name is required' });
    const folder = await Folder.create({ name: name.trim(), color, icon, createdBy: req.user.id });
    return res.status(201).json({ message: 'Folder created', folder });
  } catch (error) {
    if (error.code === 11000)
      return res.status(409).json({ error: 'A folder with that name already exists' });
    console.error('Create Folder Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create folder' });
  }
};

/* ── Fetch Folders ── */
const fetchFoldersHandler = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const folders = await Folder.find({ createdBy: req.user.id }).sort({ createdAt: 1 });
    return res.status(200).json(folders);
  } catch (error) {
    console.error('Fetch Folders Error:', error);
    return res.status(500).json({ error: 'Failed to fetch folders' });
  }
};

/* ── Update Folder ── */
const updateFolderHandler = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { name, color, icon } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (color) updateFields.color = color;
    if (icon) updateFields.icon = icon;
    if (Object.keys(updateFields).length === 0)
      return res.status(400).json({ error: 'No valid fields provided for update' });
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      updateFields,
      { new: true }
    );
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    return res.json({ message: 'Folder updated', folder });
  } catch (error) {
    if (error.code === 11000)
      return res.status(409).json({ error: 'A folder with that name already exists' });
    console.error('Update Folder Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update folder' });
  }
};

/* ── Delete Folder ── */
const deleteFolderHandler = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const deleted = await Folder.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!deleted) return res.status(404).json({ error: 'Folder not found' });
    // Move notes back to Inbox
    await Note.updateMany(
      { folderId: req.params.id, createdBy: req.user.id },
      { $set: { folderId: null } }
    );
    return res.json({ message: 'Folder deleted, notes moved to inbox' });
  } catch (error) {
    console.error('Delete Folder Error:', error);
    return res.status(500).json({ error: 'Failed to delete folder' });
  }
};

// FIX: register BOTH the old path-based URLs AND the RESTful URLs
// so the frontend works regardless of which base URL pattern is used.

// RESTful (what the frontend now calls)
router.get('/folders', auth, fetchFoldersHandler);
router.post('/folders', auth, createFolderHandler);
router.put('/folders/:id', auth, updateFolderHandler);
router.delete('/folders/:id', auth, deleteFolderHandler);

// Legacy path-based (kept for backwards compatibility)
router.get('/folders/fetch', auth, fetchFoldersHandler);
router.post('/folders/create', auth, createFolderHandler);
router.put('/folders/update/:id', auth, updateFolderHandler);
router.delete('/folders/delete/:id', auth, deleteFolderHandler);

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
    { name: 'files', maxCount: 10 },       // FIX: raised from 5 → 10
    { name: 'canvasImage', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

      const {
        title,
        desc,
        description, // FIX: frontend sends both 'desc' and 'description' — accept either
        tags = [],
        priority = 'medium',
        archived = false,
        starred = false,
        canvasData,
        canvasName = 'Canvas Drawing',
        folderId,
      } = req.body;

      // Use whichever description field was sent
      const descriptionText = (description || desc || '').trim();

      if (!title?.trim() && !descriptionText && !canvasData && !req.files?.canvasImage) {
        return res.status(400).json({ error: 'Provide a title, description, or canvas drawing' });
      }

      if (folderId) {
        const folder = await Folder.findOne({ _id: folderId, createdBy: req.user.id });
        if (!folder) return res.status(404).json({ error: 'Folder not found' });
      }

      // FIX: map uploaded files to the correct schema shape.
      //      Old code used { url, mimetype, name } but the schema requires { url, type, name, mimetype }.
      //      'type' is now derived from mimetype via mimeToAttachmentType().
      const attachments = (req.files?.files ?? []).map((file) => ({
        url: file.path,
        type: mimeToAttachmentType(file.mimetype),
        name: file.originalname,
        mimetype: file.mimetype,
      }));

      let canvasImage = null;
      if (req.files?.canvasImage?.length > 0) {
        canvasImage = req.files.canvasImage[0].path;
      } else if (canvasData) {
        canvasImage = canvasData;
      }

      // Normalise tags regardless of whether they arrive as array or CSV string
      const normalisedTags = (() => {
        if (!tags) return [];
        if (Array.isArray(tags)) return tags.map((t) => t.trim()).filter(Boolean);
        return tags.split(',').map((t) => t.trim()).filter(Boolean);
      })();

      const note = await Note.create({
        title: title?.trim() || '',
        description: descriptionText,
        tags: normalisedTags,
        priority,
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
      if (error.code === 11000) {
        return res.status(409).json({ error: 'A note with that title already exists' });
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
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const note = await Note.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    await deleteNoteAssets(note);
    await note.deleteOne();
    return res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    return res.status(500).json({ error: 'Failed to delete note' });
  }
});

/* ── Update Note ── */
router.put(
  '/update/:id',
  auth,
  upload.fields([
    { name: 'files', maxCount: 10 },       // FIX: raised from 5 → 10
    { name: 'canvasImage', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

      const {
        title,
        desc,
        description, // FIX: accept either field name
        tags,
        priority,
        archived,
        starred,
        existingAttachments,
        canvasName,
        folderId,
      } = req.body;

      const currentNote = await Note.findOne({ _id: req.params.id, createdBy: req.user.id });
      if (!currentNote) return res.status(404).json({ error: 'Note not found' });

      const updateFields = {};
      if (title !== undefined) updateFields.title = title.trim();

      // FIX: accept both 'desc' and 'description' fields from the frontend
      const descVal = description !== undefined ? description : desc;
      if (descVal !== undefined) updateFields.description = descVal.trim();

      if (tags !== undefined) {
        updateFields.tags = Array.isArray(tags)
          ? tags.map((t) => t.trim()).filter(Boolean)
          : tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
      if (priority) updateFields.priority = priority;
      if (archived !== undefined) updateFields.archived = archived === true || archived === 'true';
      if (starred !== undefined) updateFields.starred = starred === true || starred === 'true';
      if (canvasName !== undefined) updateFields.canvasName = canvasName || 'Canvas Drawing';
      if (folderId !== undefined) updateFields.folderId = folderId || null;

      // ── Attachment diffing ──────────────────────────────────────────────
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

      // Delete Cloudinary assets that were removed by the user
      const keptUrls = new Set(keptAttachments.map((a) => a?.url).filter(Boolean));
      const removedAttachments = (currentNote.attachments || []).filter(
        (a) => a?.url && !keptUrls.has(a.url)
      );
      if (removedAttachments.length > 0) {
        await Promise.allSettled(removedAttachments.map((a) => deleteCloudinaryAsset(a.url)));
      }

      // FIX: new attachment files also mapped to correct schema shape
      const newAttachments = (req.files?.files ?? []).map((file) => ({
        url: file.path,
        type: mimeToAttachmentType(file.mimetype),
        name: file.originalname,
        mimetype: file.mimetype,
      }));
      updateFields.attachments = [...keptAttachments, ...newAttachments];

      // ── Canvas image handling ───────────────────────────────────────────
      if (req.files?.canvasImage?.length > 0) {
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
      chatHistory = new ChatHistory({ userId: req.user.id, messages: [newUserMsg, newAiMsg] });
      await chatHistory.save();
    }

    return res.status(200).json({ answer });
  } catch (error) {
    console.error('Ask AI Error:', error);
    return res.status(500).json({ error: error.message || 'AI request failed' });
  }
});

module.exports = router;
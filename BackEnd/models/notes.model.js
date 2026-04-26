const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// ── Folder Schema ────────────────────────────────────────────────────────────
const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    icon: {
      type: String,
      default: '📁',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

folderSchema.index({ name: 1, createdBy: 1 }, { unique: true });

const Folder = mongoose.model('Folder', folderSchema);

// ── Attachment Sub-Schema ────────────────────────────────────────────────────
const attachmentSchema = new mongoose.Schema(
  {
    url:  { type: String, required: true },
    type: { type: String, required: true, enum: ['image', 'pdf'] },
    name: { type: String, required: true },
  },
  { _id: false }
);

// ── Note Schema ──────────────────────────────────────────────────────────────
const notesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: '',
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Folder reference — null means "no folder" (inbox)
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    archived: {
      type: Boolean,
      default: false,
    },

    starred: {
      type: Boolean,
      default: false,
    },

    // File attachments (images / PDFs) stored in Cloudinary
    attachments: {
      type: [attachmentSchema],
      default: [],
    },

    // Canvas drawing — Cloudinary URL after upload, or base64 fallback
    canvasImage: {
      type: String,
      default: null,
    },

    // Canvas name / label
    canvasName: {
      type: String,
      default: 'Canvas Drawing',
    },

    // Raw Fabric.js / custom JSON so the canvas is re-editable
    canvasData: {
      type: String,
      default: null,
    },

    // Public share token
    publicId: {
      type: String,
      unique: true,
      default: uuidv4,
      index: true,
    },
  },
  { timestamps: true }
);

// Unique title per user (only when title is non-empty)
notesSchema.index(
  { title: 1, createdBy: 1 },
  {
    unique: true,
    partialFilterExpression: { title: { $type: 'string', $ne: '' } },
  }
);

const Note = mongoose.model('Note', notesSchema);

module.exports = { Note, Folder };
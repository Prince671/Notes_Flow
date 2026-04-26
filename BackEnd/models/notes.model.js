const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const attachmentSchema = new mongoose.Schema(
  {
    url:  { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['image', 'pdf', 'doc', 'excel', 'ppt', 'video', 'audio', 'file'],
    },
    name: { type: String, required: true },
  },
  { _id: false }
);

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
module.exports = Note;
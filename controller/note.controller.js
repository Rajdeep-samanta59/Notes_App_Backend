import mongoose from 'mongoose';
import Note from "../Models/note.model.js";
import { v2 as cloudinary } from 'cloudinary';

// CREATE NOTE CONTROLLER
export const createNote = async (req, res) => {
  try {
    const userId = req.user && (req.user.id || req.user._id); // whatever you sign into the JWT becomes req.user after verification
    // prefer uploaded file (multer memory) and upload to Cloudinary, otherwise fallback to any image field in the body
    let imageUrl = req.body?.image || null;
    if (req.file && req.file.buffer) {
      // upload buffer using upload_stream
      const streamUpload = (buffer) => new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'notes_app', transformation: [{ width: 1600, crop: 'limit' }] }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        stream.end(buffer);
      });

      try {
        const result = await streamUpload(req.file.buffer);
        imageUrl = result.secure_url || result.url || imageUrl;
      } catch (err) {
        console.warn('cloudinary upload failed', err);
        // continue with fallback image if any
      }
    }

    // support tags sent as JSON string from FormData
    let tags = [];
    if (req.body?.tags) {
      try {
        tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
      } catch (err) {
        tags = Array.isArray(req.body.tags) ? req.body.tags : [];
      }
    }

    const noteData = {
      title: req.body.title,
      content: req.body.content,
      tags,
      image: imageUrl,
      author: userId,
      authorName: req.user?.name || req.body.authorName || "",
    };
    const note = new Note(noteData);
    await note.save();
    return res.status(200).json({ msg: 'Note saved successfully', noteId: note._id });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

//  GET ALL NOTE CONTROLLER

export const getAllNotes = async (req, res) => {
  try {
    const userId = req.user && req.user.id; // restrict notes to the logged-in user
    const filter = userId ? { author: userId } : {};

    // pagination
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit || '8', 10)); // default 8 per page
    const skip = (page - 1) * limit;

    // optional search query
    const q = (req.query.q || '').toString().trim();
    if (q) {
      // escape regex special chars
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safe, 'i');
      filter.$or = [{ title: regex }, { content: regex }, { tags: { $in: [regex] } }];
    }

    const [notes, total] = await Promise.all([
      Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Note.countDocuments(filter),
    ]);

    return res.status(200).json({ notes, total, page, limit });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

// GET A PERTICULAR NOTE CONTROLLER

export const getNote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ msg: 'id is required' });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'invalid id format' });
    }

    const note = await Note.findById(id).lean();
    if (!note) return res.status(404).json({ msg: 'note not found' });
    const userId = req.user?.id || req.user?._id;
    if (userId && String(note.author) !== String(userId)) {
      return res.status(403).json({ msg: 'forbidden' }); // if  this   is the id of  the any other  user's then forbidden messsage will come 
    }

    return res.status(200).json({ note });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// UPDATE A NOTE CONTROLLER

export const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ msg: 'note not found' });
    // handle image upload buffer if present
    let imageUrl = req.body?.image || note.image;
    if (req.file && req.file.buffer) {
      const streamUpload = (buffer) => new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'notes_app', transformation: [{ width: 1600, crop: 'limit' }] }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        stream.end(buffer);
      });
      try {
        const result = await streamUpload(req.file.buffer);
        imageUrl = result.secure_url || result.url || imageUrl;
      } catch (err) {
        console.warn('cloudinary upload failed', err);
      }
    }
    let tags = note.tags || [];
    if (req.body?.tags) {
      try {
        tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
      } catch (err) {
        tags = Array.isArray(req.body.tags) ? req.body.tags : tags;
      }
    }

    const update = {
      title: req.body.title ?? note.title,
      content: req.body.content ?? note.content,
      tags,
      image: imageUrl,
      updatedAt: new Date(), // ensure updatedAt changes on update
    };

    await Note.findByIdAndUpdate(req.params.id, { $set: update });
    return res.status(200).json({ msg: 'note updated successfully' });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

// DELETE A  NOTE CONTROLLER
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ msg: 'id is required' });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'invalid id format' });
    }

    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ msg: 'note not found' });

    // Optional: ensure only owner can delete when authenticated
    const userId = req.user?.id || req.user?._id;
    if (userId && String(note.author) !== String(userId)) {
      return res.status(403).json({ msg: 'forbidden' });
    }

    await note.deleteOne();
    return res.status(200).json({ msg: 'note deleted successfully' });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};


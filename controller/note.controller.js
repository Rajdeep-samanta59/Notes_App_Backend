import mongoose from 'mongoose';
import Note from "../Models/note.model.js";
// CREATE NOTE CONTROLLER
export const createNote = async (req, res) => {
  try {
    const userId = req.user && (req.user.id || req.user._id); // whatever you sign into the JWT becomes req.user after verification
    const noteData = {
      ...req.body, //copies all properties from req.body into a new object.
      author: userId,
      authorName: req.user?.name || req.body.authorName || "",
    };
    const note = new Note(noteData);
    await note.save();
    return res.status(200).json("Note saved successfully");
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

//  GET ALL NOTE CONTROLLER

export const getAllNotes = async (req, res) => {
  try {
    const userId = req.user && req.user.id; //the main logic  is to restrict notes to a specific logged-in user.
    const filter = userId ? { author: userId } : {};

    const notes = await Note.find(filter).sort({ createdAt: -1 }).lean();

    return res.status(200).json({ notes });
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
    await Note.findByIdAndUpdate(req.params.id, { $set: req.body });
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


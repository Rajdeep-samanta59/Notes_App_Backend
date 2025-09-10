import express from 'express';
import {signupUser, loginUser,logoutUser} from '../controller/user.controller.js';
// image upload endpoints  will be added Here
// import { createNote, getAllNotes, getNote, updateNote, deleteNote} from '../controller/postController.js';
import { createNote} from '../controller/note.controller.js';

import { authenticateToken } from '../controller/jwt.controller.js';

const router=express.Router();

router.post('/signup',signupUser);
router.post('/login',loginUser);
router.post('/logout',logoutUser);
// file upload endpoints  will be added  here  later onn

// CREATE A NOTE
router.post('/create',authenticateToken, createNote);
// // GET ALL NOTES 
// router.get('/posts', authenticateToken, getAllNotes);
// // GET A NOTE
// router.get('/post/:id', authenticateToken, getNote);
// // UPDATE A NOTE
// router.put('/update/:id',authenticateToken, updateNote);
// // Delete a note
// router.delete('/delete/:id',authenticateToken, deleteNote);


export default router;
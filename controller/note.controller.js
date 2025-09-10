import Note from '../Models/note.model.js'

// CREATE NOTE CONTROLLER
export const createNote=async(request, response)=>{
    try {
        const note = await new Note(request.body);
        note.save();

        response.status(200).json('Note saved successfully');
    } catch (error) {
        response.status(500).json(error);
    }
}

//  GET ALL NOTE CONTROLLER

// GET A PERTICULAR NOTE CONTROLLER 

// UPDATE A NOTE CONTROLLER 

// DELETE A  NOTE CONTROLLER 


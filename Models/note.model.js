import mongoose from "mongoose";

// Notes schema aligned with client Create/Edit flows
const NoteSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        image: { type: String, required: false, default: null },// storing image  url  and the image url will be given by cloudinary
        authorName: { type: String, required: false },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
        tags: { type: [String], default: [] },
    },
    { timestamps: true }
);

const Note = mongoose.models.Note || mongoose.model("Note", NoteSchema);
export default Note;

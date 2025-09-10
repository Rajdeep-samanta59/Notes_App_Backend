import mongoose from "mongoose";

// User schema aligned with client Signup/Login fields
// Frontend uses email and password (name is optional on signup form)
const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        name: { type: String, required: false, trim: true },
        password: { type: String, required: true },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

import mongoose from "mongoose";
import dotenv from "dotenv";

// Load .env when db.js is imported so process.env values are available
dotenv.config();

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGO_URI not set. Set the MONGO_URI env var in Render (or .env for local).");
  process.exit(1);
}

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection failed", err);
    process.exit(1);
  }
};
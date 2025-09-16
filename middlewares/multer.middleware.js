import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudName =process.env.cloud_name;
const apiKey = process.env.api_key;
const apiSecret =process.env.api_secret;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Use memory storage; controller will upload buffer to Cloudinary using upload_stream
const storage = multer.memoryStorage();
export const upload = multer({ storage });

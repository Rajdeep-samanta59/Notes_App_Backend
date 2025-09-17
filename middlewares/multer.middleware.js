import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Read from either uppercase or lowercase env vars
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.cloud_name;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.api_key;
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.api_secret;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary credentials. Check environment variables.');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Use memory storage; controller will upload buffer to Cloudinary using upload_stream
const storage = multer.memoryStorage();
export const upload = multer({ storage });

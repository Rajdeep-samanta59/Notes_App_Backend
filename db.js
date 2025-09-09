import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/notes_app_dev';
  await mongoose.connect(uri, {
    
  });
  console.log('MongoDB connected');
};

export default connectDB;

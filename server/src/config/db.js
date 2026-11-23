import mongoose from 'mongoose';

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Thieu MONGODB_URI trong file .env');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });

  console.log('Da ket noi thanh cong.');
}

export default connectDB;
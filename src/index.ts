import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
  if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_KEY || !process.env.CLOUDINARY_SECRET ) {
    throw new Error('Cloudinary must be set');
  }

  if (!process.env.SITE_URL) {
    throw new Error('Site URL must be defined');
  }

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.PAYSTACK_SECRET) {
    throw new Error('Paystack payment must be set');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  const PORT = process.env.PORT || 5000;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(error);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

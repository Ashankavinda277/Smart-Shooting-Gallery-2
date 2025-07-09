// Database configuration
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Try connecting to MongoDB Atlas first
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Atlas connected');
  } catch (atlasError) {
    console.warn('MongoDB Atlas connection error:', atlasError.message);
    console.log('Attempting to connect to local MongoDB server...');
    
    try {
      // Fallback to local MongoDB if Atlas connection fails
      await mongoose.connect('mongodb://localhost:27017/shooting_gallery');
      console.log('Local MongoDB connected');
    } catch (localError) {
      console.error('Local MongoDB connection error:', localError.message);
      console.error('Could not connect to any MongoDB instance. Please ensure MongoDB is running locally or check your Atlas configuration.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;

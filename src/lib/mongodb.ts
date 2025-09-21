/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  console.warn('MONGODB_URI environment variable is not defined. Database features will be disabled.');
}

const cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  // If no MongoDB URI is provided, throw a specific error
  if (!MONGODB_URI) {
    throw new Error('MongoDB URI not configured. Please set MONGODB_URI environment variable.');
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    console.log('Attempting to connect to MongoDB...');
    
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
    }).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection failed:', error.message);
      cached.promise = null; // Reset promise so we can try again
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    cached.promise = null; // Reset for next attempt
    throw error;
  }
}

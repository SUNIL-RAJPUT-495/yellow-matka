import mongoose from 'mongoose';

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!process.env.MONGODB_URL) {
    console.error("❌ MONGODB_URL is missing in environment variables!");
    return null;
  }

  try {
    // Disable buffering for serverless environments
    mongoose.set('bufferCommands', false);

    const opts = {
      bufferCommands: false,
    };

    cachedConnection = await mongoose.connect(process.env.MONGODB_URL, opts);
    console.log(`✅ MongoDB Connected Successfully: ${cachedConnection.connection.host}`);
    return cachedConnection;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1); 
    }
    throw error;
  }
};

export default connectDB;
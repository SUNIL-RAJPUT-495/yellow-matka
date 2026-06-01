import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      console.error("❌ MONGODB_URL is missing in environment variables!");
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1); 
    }
  }
};

export default connectDB;
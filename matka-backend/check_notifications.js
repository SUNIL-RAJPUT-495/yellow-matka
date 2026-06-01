import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Notification from './models/Notification.js';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to DB");

    const usersWithToken = await User.find({ fcmToken: { $ne: null } }).countDocuments();
    console.log(`Users with FCM Token: ${usersWithToken}`);

    const totalNotifications = await Notification.countDocuments();
    console.log(`Total Notifications in DB: ${totalNotifications}`);

    const lastNotification = await Notification.findOne().sort({ createdAt: -1 });
    console.log("Last Notification:", lastNotification);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

check();

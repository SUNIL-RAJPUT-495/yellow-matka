import Notification from '../models/Notification.js';
import User from '../models/User.js';
import admin from '../Config/firebaseAdmin.js';
import jwt from 'jsonwebtoken';

export const sendNotification = async (req, res) => {
    try {
        const { title, message, sendToAllUsers } = req.body;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: 'Title and message are required' });
        }

        // 1. Save to Database for history
        const notification = new Notification({
            title,
            message,
            type: 'Alert',
            userId: null,
        });
        await notification.save();

        // 2. Send Push Notifications via Firebase
        let tokens = [];

        if (sendToAllUsers) {
            const usersWithTokens = await User.find({ fcmToken: { $ne: null } }).select('fcmToken');
            tokens = usersWithTokens.map(u => u.fcmToken);
        } else {
            // Logic for specific user (if implemented in future)
            if (req.body.userId) {
                const user = await User.findById(req.body.userId).select('fcmToken');
                if (user?.fcmToken) tokens.push(user.fcmToken);
            }
        }

        if (tokens.length > 0) {
            const payload = {
                notification: {
                    title: title,
                    body: message,
                },
                // Optional: For mobile background handling
                data: {
                    click_action: "FLUTTER_NOTIFICATION_CLICK",
                    status: "done",
                }
            };

            // Multicast sending
            try {
                const response = await admin.messaging().sendEachForMulticast({
                    tokens,
                    notification: payload.notification,
                    data: payload.data
                });
                console.log(`Successfully sent ${response.successCount} notifications`);
                
                // Cleanup invalid tokens if necessary (optional improvement)
                if (response.failureCount > 0) {
                    const failedTokens = [];
                    response.responses.forEach((resp, idx) => {
                        if (!resp.success) {
                            failedTokens.push(tokens[idx]);
                        }
                    });
                    console.log('Failed tokens:', failedTokens);
                }

            } catch (fcmError) {
                console.error("FCM Send Error:", fcmError);
                // We proceed since DB save was successful
            }
        }

        res.status(201).json({ success: true, message: 'Notification sent and broadcasted successfully', notification });
    } catch (error) {
        console.error("sendNotification error:", error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

export const getNotifications = async (req, res) => {
    try {
        let userId = null;
        const auth = req.header('Authorization')?.replace(/^Bearer\s+/i, '');
        if (auth && process.env.JWT_SECRET) {
            try {
                const decoded = jwt.verify(auth, process.env.JWT_SECRET);
                userId = decoded._id || decoded.id;
            } catch {
            }
        }

        const globalOr = [
            { userId: null },
            { userId: { $exists: false } },
        ];

        let notifications;
        if (userId) {
            const user = await User.findById(userId).select('createdAt');
            const userJoinedDate = user?.createdAt || new Date(0);

            notifications = await Notification.find({
                $or: [...globalOr, { userId }],
                createdAt: { $gte: userJoinedDate }
            })
                .sort({ createdAt: -1 })
                .limit(50);
        } else {
            notifications = await Notification.find({ $or: globalOr })
                .sort({ createdAt: -1 })
                .limit(50);
        }

        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error("getNotifications error:", error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

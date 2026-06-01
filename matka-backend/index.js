import 'dotenv/config';
import express from 'express';
import connectDB from './Config/Db.js';
import morgan from 'morgan';
import userRouter from './routes/userRouter.js';
import transactionRouter from './routes/transactionRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';
import chatRouter from './routes/chat.router.js';
import bidRouter from './routes/bidRoutes.js';
import marketRouter from './routes/marketRoutes.js';
import upiRoutes from './routes/upiRoutes.js';
import { setupStaticFolders } from './middleware/staticConfig.js';
import transactionSettingRouter from './routes/transationSetting.router.js';
import settingsRouter from './routes/settingsRouter.js';
import gdMarketRouter from './routes/gdMarketRoutes.js';
import gdBidRouter from './routes/gdBidRoutes.js';
import cron from 'node-cron';
import { resetDailyMarketDisplay } from './jobs/resetMarketDisplay.js';

const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://yellow-matka.vercel.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin) {
    const cleanedOrigin = origin.trim().replace(/\/$/, "");
    const isAllowed = allowedOrigins.some(o => o.trim().replace(/\/$/, "") === cleanedOrigin)
      || (process.env.FRONTEND_URL && process.env.FRONTEND_URL.trim().replace(/\/$/, "") === cleanedOrigin)
      || cleanedOrigin.endsWith('.vercel.app');
      
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());
app.use(morgan('dev'));

setupStaticFolders(app);

// Database connection middleware for all API routes
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection middleware error:", err);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: err.message
    });
  }
});

// Har din raat 12:00 IST — home/market cards par live result hata kar *** / ** placeholders
// (Schedules only in local development environment to prevent blocking/crashing Vercel serverless)
if (process.env.NODE_ENV !== 'production') {
  cron.schedule(
    '0 0 * * *',
    async () => {
      try {
        const r = await resetDailyMarketDisplay();
        console.log(
          `[cron] Daily market display reset — modified: ${r.modifiedCount ?? r.matchedCount}`
        );
      } catch (e) {
        console.error('[cron] resetDailyMarketDisplay failed:', e);
      }
    },
    { timezone: 'Asia/Kolkata' }
  );
}

app.get('/', (req, res) => {
  res.send('Admin Panel API is running on Vercel Serverless!');
});


app.use("/api/user", userRouter);
app.use("/api/bid", bidRouter);
app.use("/api/market", marketRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/chat", chatRouter);
app.use('/api/upi', upiRoutes);
app.use('/api/transaction-setting', transactionSettingRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/gd-market', gdMarketRouter);
app.use('/api/gd-bid', gdBidRouter);

const PORT = process.env.PORT || 5000;


if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on http://localhost:${PORT}`);
  });
}


export default app;
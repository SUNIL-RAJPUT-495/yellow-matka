import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// How to get Service Account Key:
// 1. Go to Firebase Console > Project Settings > Service Accounts
// 2. Click "Generate New Private Key"
// 3. Download the JSON file.
// 4. You can either place the file path in GOOGLE_APPLICATION_CREDENTIALS 
//    OR pass the object directly to initializeApp.

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

const requiredEnv = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

try {
    if (missingEnv.length > 0) {
        console.warn(
            `Firebase Admin disabled. Missing env vars: ${missingEnv.join(', ')}`
        );
    } else if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin Initialized");
    }
} catch (error) {
    console.error("Firebase Admin initialization error:", error);
}

export default admin;

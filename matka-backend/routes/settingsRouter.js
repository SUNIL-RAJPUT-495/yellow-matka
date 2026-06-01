import express from 'express';
import { verifyAdminToken } from '../middleware/verifyAdminToken.js';
import { upload } from '../middleware/upload.js';
import {
    getGameRates, createGameRate, deleteGameRate,
    getHowToPlay, updateHowToPlay,
    getContactSettings, updateContactSettings,
    changeAdminPassword
} from '../Controller/settingsController.js';

const settingsRouter = express.Router();

console.log("--- Initializing Settings Router [/api/settings] ---");

// Public routes for the app
settingsRouter.get('/how-to-play', getHowToPlay);
settingsRouter.get('/contact', getContactSettings);
settingsRouter.get('/game-rates', getGameRates);

// Protected Admin routes
settingsRouter.post('/game-rates', verifyAdminToken, createGameRate);
settingsRouter.delete('/game-rates/:id', verifyAdminToken, deleteGameRate);

settingsRouter.put('/how-to-play', verifyAdminToken, updateHowToPlay);

settingsRouter.put('/contact', verifyAdminToken, upload.single('logo'), updateContactSettings);

settingsRouter.put('/change-admin-password', verifyAdminToken, changeAdminPassword);

export default settingsRouter;

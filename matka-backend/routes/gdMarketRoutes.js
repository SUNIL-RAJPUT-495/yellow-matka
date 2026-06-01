import express from 'express';
import {
    addGDGame,
    getAllGDGames,
    declareGDResult,
    getAllGDResults,
    deleteGDMarket,
    toggleGDMarketStatus,
    getGDMarketResults
} from '../Controller/gdMarketController.js';
import { verifyAdminToken } from '../middleware/verifyAdminToken.js';

const gdMarketRouter = express.Router();

gdMarketRouter.post('/add-market', verifyAdminToken, addGDGame);
gdMarketRouter.delete('/delete-market', verifyAdminToken, deleteGDMarket);
gdMarketRouter.put('/toggle-status', verifyAdminToken, toggleGDMarketStatus);
gdMarketRouter.get('/get-all-markets', getAllGDGames);
gdMarketRouter.post('/declare-result', verifyAdminToken, declareGDResult);
gdMarketRouter.get('/get-all-results', getAllGDResults);
gdMarketRouter.get('/get-market-results', getGDMarketResults);

export default gdMarketRouter;

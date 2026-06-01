import express from 'express';
import { placeGDBid, getGDUserBids, getGDFilteredBids } from '../Controller/gdBidController.js';
import { authToken } from '../middleware/authToken.js';
import { verifyAdminToken } from '../middleware/verifyAdminToken.js';

const gdBidRouter = express.Router();

gdBidRouter.post('/place-bid', authToken, placeGDBid);
gdBidRouter.get('/get-user-bids', authToken, getGDUserBids);
gdBidRouter.get('/get-filtered-bids', verifyAdminToken, getGDFilteredBids);

export default gdBidRouter;

import User from "../models/User.js";
import GDMarket from "../models/GDMarket.js";
import GDBet from "../models/GDBid.js";
import GDResult from "../models/GDResult.js";
import { parseTimeToMinutes, getCurrentISTMinutes, getCurrentISTTimeString, getISTDayBounds } from "../utils/timeUtils.js";

export const placeGDBid = async (req, res) => {
    try {
        const user_id = req.userId;
        const { market_id, game_type, session, bet_number, amount } = req.body;

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.status === 'Blocked') {
            return res.status(403).json({ message: 'Your account is blocked. Contact Admin.' });
        }

        const market = await GDMarket.findById(market_id);
        if (!market) {
            return res.status(404).json({ message: 'GD Market not found' });
        }

        if (market.status === 'Closed') {
            return res.status(400).json({ message: 'Market is closed for betting.' });
        }

        // Check if GD Result is already declared for today
        const today = new Date();
        const { start: startOfDay, end: endOfDay } = getISTDayBounds(today);
        const existingResult = await GDResult.findOne({ market_id, date: { $gte: startOfDay, $lte: endOfDay } });
        if (existingResult && existingResult.jodi) {
            const declaredJodi = String(existingResult.jodi || '');
            if (declaredJodi.length === 2) {
                if (game_type === 'Left Digit' && declaredJodi[0] !== '*') {
                    return res.status(400).json({ message: 'Left Digit result is already declared for today. Betting is closed.' });
                }
                if (game_type === 'Right Digit' && declaredJodi[1] !== '*') {
                    return res.status(400).json({ message: 'Right Digit result is already declared for today. Betting is closed.' });
                }
                if (game_type === 'Jodi Digit' && (declaredJodi[0] !== '*' || declaredJodi[1] !== '*')) {
                    return res.status(400).json({ message: 'Result is already declared for today. Jodi betting is closed.' });
                }
            }
        }

        const isWithinWindow = (currMBM, startMBM, endMBM) => {
            if (startMBM === endMBM) return false;
            if (startMBM < endMBM) return currMBM >= startMBM && currMBM < endMBM;
            return currMBM >= startMBM || currMBM < endMBM;
        };

        const currentMBM = getCurrentISTMinutes();
        const openStartMBM = parseTimeToMinutes(market.open_time || '00:00 AM');
        const closeCutoffMBM = parseTimeToMinutes(market.close_time);

        // Check if betting time is open
        const isBiddingOpen = isWithinWindow(currentMBM, openStartMBM, closeCutoffMBM);
        if (!isBiddingOpen) {
            const serverTime = getCurrentISTTimeString();
            return res.status(400).json({
                message: `Betting is closed for this Gali Desawar market. Allowed between ${market.open_time || '00:00 AM'} and ${market.close_time}. Server time: ${serverTime}.`
            });
        }

        const bidAmt = Number(amount);
        if (isNaN(bidAmt) || bidAmt < 10 || !Number.isInteger(bidAmt)) {
            return res.status(400).json({ message: 'Invalid amount. Minimum ₹10 required.' });
        }

        if (!bet_number) {
            return res.status(400).json({ message: 'Bet number is required.' });
        }

        // Validate number formats
        if (game_type === 'Jodi Digit' && bet_number.length !== 2) {
            return res.status(400).json({ message: 'Jodi number must be exactly 2 digits.' });
        }
        if ((game_type === 'Left Digit' || game_type === 'Right Digit') && bet_number.length !== 1) {
            return res.status(400).json({ message: 'Digit must be exactly 1 digit.' });
        }

        if (!user.wallet) user.wallet = { realBalance: 0, bonusBalance: 0 };
        const currentBalance = user.wallet.realBalance || 0;

        if (currentBalance < bidAmt) {
            return res.status(400).json({ message: 'Insufficient wallet balance.' });
        }

        const betSession = game_type === 'Left Digit' ? 'Open' : (game_type === 'Right Digit' ? 'Close' : 'Full');

        const newBid = await GDBet.create({
            user_id,
            market_id,
            game_type,
            session: betSession,
            bet_session: betSession,
            bet_number: String(bet_number),
            amount: bidAmt
        });

        user.wallet.realBalance -= bidAmt;
        await user.save();

        return res.status(201).json({
            success: true,
            message: `Successfully placed bid of ₹${bidAmt}.`,
            bid: newBid,
            updatedBalance: user.wallet.realBalance
        });

    } catch (error) {
        console.error("placeGDBid Error:", error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

export const getGDUserBids = async (req, res) => {
    try {
        const user_id = req.userId;
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const bids = await GDBet.find({ user_id })
            .populate('market_id')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'GD Bids fetched successfully',
            totalBids: bids.length,
            bids: bids
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const getGDFilteredBids = async (req, res) => {
    try {
        const { market_id, date, status } = req.query;
        
        if (!market_id) {
            return res.status(400).json({ message: 'Market ID is required' });
        }

        let query = { market_id };
        
        if (date) {
            const { start, end } = getISTDayBounds(new Date(date));
            query.createdAt = { $gte: start, $lte: end };
        }

        if (status) {
            query.status = status;
        }

        const bids = await GDBet.find(query)
            .populate('user_id', 'name mobile')
            .populate('market_id', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, bids });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

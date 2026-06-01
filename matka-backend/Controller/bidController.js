import User from "../models/User.js";
import Market from "../models/Market.js";
import Bid from "../models/Bid.js";
import Result from "../models/Result.js";
import { parseTimeToMinutes, getCurrentISTMinutes, getCurrentISTTimeString, getISTDayBounds } from "../utils/timeUtils.js";

const normalizeGameType = (type) => {
    if (!type) return type;
    if (type === 'SingleBulk' || type === 'SinglePannaBulk' || type === 'DoublePannaBulk' || type === 'JodiBulk') {
        if (type === 'SingleBulk') return 'Single';
        if (type === 'SinglePannaBulk') return 'Single Panna';
        if (type === 'DoublePannaBulk') return 'Double Panna';
        if (type === 'JodiBulk') return 'Jodi';
    }
    return type;
};

const normalizeSession = (session) => {
    if (!session) return '';
    const value = String(session).trim().toLowerCase();
    if (value === 'open') return 'Open';
    if (value === 'close') return 'Close';
    if (value === 'full') return 'Full';
    return '';
};

const generateSPMotor = (motor) => {
    let digits = Array.from(new Set(motor.split(''))).sort();
    let panas = [];
    for (let i = 0; i < digits.length; i++) {
        for (let j = i + 1; j < digits.length; j++) {
            for (let k = j + 1; k < digits.length; k++) {
                panas.push(digits[i] + digits[j] + digits[k]);
            }
        }
    }
    return panas;
};

const generateDPMotor = (motor) => {
    let digits = Array.from(new Set(motor.split(''))).sort();
    let panas = [];
    for (let i = 0; i < digits.length; i++) {
        for (let j = 0; j < digits.length; j++) {
            if (i !== j) {
                let p = [digits[i], digits[i], digits[j]].sort().join('');
                if (!panas.includes(p)) panas.push(p);
            }
        }
    }
    return panas;
};


export const placeBid = async (req, res) => {
    try {
        const user_id = req.userId;
        const { market_id, game_type, session, bet_number, amount, total_amount, bids } = req.body;


        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.status === 'Blocked') {
            return res.status(403).json({ message: 'Your account is blocked. Contact Admin.' });
        }

        // 2. Market Check
        const market = await Market.findById(market_id);
        if (!market) {
            return res.status(404).json({ message: 'Market not found' });
        }

        let incomingBids = [];
        if (bids && Array.isArray(bids) && bids.length > 0) {
            incomingBids = bids;
        } else if (bet_number && amount && session) {
            incomingBids = [{ session, bet_number, amount }];
        } else {
            return res.status(400).json({ message: 'Invalid bid data.' });
        }

        if (market.status === 'Closed') {
            return res.status(400).json({ message: 'Market is closed for betting.' });
        }

        // Check if result is declared for today
        const today = new Date();
        const { start: startOfDay, end: endOfDay } = getISTDayBounds(today);
        const existingResult = await Result.findOne({ market_id, date: { $gte: startOfDay, $lte: endOfDay } });

        const currentMBM = getCurrentISTMinutes();

        // -----------------------------------------------------------------------
        // SESSION TIME RULES (as per admin fields):
        // - open_time         => daily betting start time
        // - open_result_time  => OPEN session betting cutoff
        // - close_time        => CLOSE/FULL session betting cutoff
        // - close_result_time => result declaration reference only
        // -----------------------------------------------------------------------
        const SANGAM_GAMES = ['HalfSangamA', 'HalfSangamB', 'FullSangam'];
        const JODI_GAMES   = ['Jodi', 'JodiBulk', 'RedJodi'];
        const openStartMBM = parseTimeToMinutes(market.open_time);
        const openCutoffMBM = parseTimeToMinutes(market.open_result_time || market.open_time);
        const closeCutoffMBM = parseTimeToMinutes(market.close_time);

        const isWithinWindow = (currMBM, startMBM, endMBM) => {
            if (startMBM === endMBM) return false;
            if (startMBM < endMBM) return currMBM >= startMBM && currMBM < endMBM;
            return currMBM >= startMBM || currMBM < endMBM;
        };

        const isOpenSessionAllowed = isWithinWindow(currentMBM, openStartMBM, openCutoffMBM);
        const isCloseSessionAllowed = isWithinWindow(currentMBM, openStartMBM, closeCutoffMBM);

        for (let b of incomingBids) {
            let isAllowed = false;
            let sessionLabel = b.session || 'Full';
            let startTimeStr = market.open_time;
            let cutoffTimeStr = market.close_time;

            const normalizedBidSession = normalizeSession(b.session);

            // Result declaration session check
            if (existingResult) {
                if (normalizedBidSession === 'Open' && existingResult.open_panna) {
                    return res.status(400).json({ message: 'Open result is already declared for today. Open session betting is closed.' });
                }
                if (normalizedBidSession === 'Close' && existingResult.close_panna) {
                    return res.status(400).json({ message: 'Close result is already declared for today. Close session betting is closed.' });
                }
                if (normalizedBidSession === 'Full' && (existingResult.open_panna || existingResult.close_panna)) {
                    return res.status(400).json({ message: 'Result has been declared. Jodi betting is closed.' });
                }
                if (SANGAM_GAMES.includes(game_type) && existingResult.open_panna) {
                    return res.status(400).json({ message: 'Open result is already declared. Sangam betting is closed.' });
                }
                if (JODI_GAMES.includes(game_type) && (existingResult.open_panna || existingResult.close_panna)) {
                    return res.status(400).json({ message: 'Result has been declared. Jodi betting is closed.' });
                }
            }

            if (normalizedBidSession === 'Open') {
                isAllowed = isOpenSessionAllowed;
                cutoffTimeStr = market.open_result_time || market.open_time;
                sessionLabel = 'Open';
            } else if (normalizedBidSession === 'Close') {
                isAllowed = isCloseSessionAllowed;
                cutoffTimeStr = market.close_time;
                sessionLabel = 'Close';
            } else if (SANGAM_GAMES.includes(game_type)) {
                // Open-panna based games must close at open result time
                isAllowed = isOpenSessionAllowed;
                cutoffTimeStr = market.open_result_time || market.open_time;
                sessionLabel = `${game_type} (Open)`;
            } else if (JODI_GAMES.includes(game_type)) {
                isAllowed = isCloseSessionAllowed;
                cutoffTimeStr = market.close_time;
                sessionLabel = `${game_type} (Full)`;
            } else {
                isAllowed = isCloseSessionAllowed;
                cutoffTimeStr = market.close_time;
                sessionLabel = normalizedBidSession || 'Full';
            }

            if (!isAllowed) {
                const serverTime = getCurrentISTTimeString();
                return res.status(400).json({
                    message: `Betting is closed for ${sessionLabel} session. Allowed between ${startTimeStr} and ${cutoffTimeStr}. Server time: ${serverTime}.`
                });
            }
        }

        let finalBidsToSave = [];
        let backendCalculatedTotalAmount = 0;

        for (let bid of incomingBids) {
            const bidAmt = Number(bid.amount);
            if (isNaN(bidAmt) || bidAmt < 10 || !Number.isInteger(bidAmt)) {
                return res.status(400).json({ message: 'Invalid amount. Minimum ₹10 required.' });
            }
            const normalizedIncomingSession = normalizeSession(bid.session);
            if (!normalizedIncomingSession || !bid.bet_number) {
                return res.status(400).json({ message: 'Session and bet number required.' });
            }

            const normalizedType = normalizeGameType(game_type);
            const finalSession = normalizedType === 'Jodi' ? 'Full' : normalizedIncomingSession;
            const betSession = normalizedIncomingSession;

            if (game_type === 'SPMotor') {
                const panas = generateSPMotor(bid.bet_number);
                for (let pana of panas) {
                    finalBidsToSave.push({ user_id, market_id, game_type: 'Single Panna', session: finalSession, bet_session: betSession, bet_number: pana, amount: bidAmt });
                    backendCalculatedTotalAmount += bidAmt;
                }
            } else if (game_type === 'DPMotor') {
                const panas = generateDPMotor(bid.bet_number);
                for (let pana of panas) {
                    finalBidsToSave.push({ user_id, market_id, game_type: 'Double Panna', session: finalSession, bet_session: betSession, bet_number: pana, amount: bidAmt });
                    backendCalculatedTotalAmount += bidAmt;
                }
            } else if (game_type === 'OddEven') {
                const digits = bid.bet_number === 'Odd' ? ['1', '3', '5', '7', '9'] : ['0', '2', '4', '6', '8'];
                for (let digit of digits) {
                    finalBidsToSave.push({ user_id, market_id, game_type: 'Single', session: finalSession, bet_session: betSession, bet_number: digit, amount: bidAmt });
                    backendCalculatedTotalAmount += bidAmt;
                }
            } else {
                finalBidsToSave.push({ user_id, market_id, game_type: normalizedType, session: finalSession, bet_session: betSession, bet_number: String(bid.bet_number), amount: bidAmt });
                backendCalculatedTotalAmount += bidAmt;
            }
        }

        if (finalBidsToSave.length === 0) return res.status(400).json({ message: 'No valid bets to place.' });
        if (!user.wallet) user.wallet = { realBalance: 0, bonusBalance: 0 };
        const currentBalance = user.wallet.realBalance || 0;

        if (currentBalance < backendCalculatedTotalAmount) return res.status(400).json({ message: 'Insufficient wallet balance.' });

        const createdBids = await Bid.insertMany(finalBidsToSave);
        user.wallet.realBalance -= backendCalculatedTotalAmount;
        await user.save();

        return res.status(201).json({
            success: true,
            message: `Successfully placed ${finalBidsToSave.length} bids.`,
            total_deducted: backendCalculatedTotalAmount,
            updatedBalance: user.wallet.realBalance
        });

    } catch (error) {
        console.error("Bid Controller Error:", error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};



export const getAllBids = async (req, res) => {
    try {
        const bids = await Bid.find()
            .populate('user_id', 'name mobile')
            .populate('market_id', 'name')
            .sort({ createdAt: -1 }); 

        res.status(200).json({ success: true, bids });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}




export const getUserBids = async (req, res) => {
    try {
        const user_id = req.userId;
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const user = await User.findById(user_id)


        const bids = await Bid.find({ user_id }).populate('market_id').sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Bids fetched successfully',
            totalBids: bids.length,
            bids: bids
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export const getFilteredBids = async (req, res) => {
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

        const bids = await Bid.find(query)
            .populate('user_id', 'name mobile')
            .populate('market_id', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, bids });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};



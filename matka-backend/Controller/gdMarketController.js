import GDMarket from "../models/GDMarket.js";
import GDResult from "../models/GDResult.js";
import { parseTimeToMinutes, getCurrentISTMinutes, getISTDateKey, getISTDayBounds } from "../utils/timeUtils.js";
import { runGDSettlementLogic } from "../services/settlementService.js";

export const addGDGame = async (req, res) => {
    try {
        const { name, open_time, close_time } = req.body;

        if (!name || !open_time || !close_time) {
            return res.status(400).json({ message: 'Name, Open Time and Close Time are required' });
        }

        const existingGame = await GDMarket.findOne({ name });
        if (existingGame) {
            return res.status(400).json({ message: 'Game already exists' });
        }

        const game = await GDMarket.create({
            name,
            open_time,
            close_time
        });

        res.status(201).json({ message: 'Gali Desawar Game added successfully', game });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const deleteGDMarket = async (req, res) => {
    try {
        const { marketId } = req.body;
        if (!marketId) {
            return res.status(400).json({ message: 'Market ID is required' });
        }
        
        const market = await GDMarket.findById(marketId);
        if (!market) {
            return res.status(404).json({ message: 'Market not found' });
        }

        await GDMarket.findByIdAndDelete(marketId);
        
        res.status(200).json({ success: true, message: 'Market deleted successfully' });
    } catch (error) {
        console.error("deleteGDMarket Error:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const toggleGDMarketStatus = async (req, res) => {
    try {
        const { gameId, status } = req.body;
        if (!gameId || !status) {
            return res.status(400).json({ message: 'Game ID and Status are required' });
        }

        const market = await GDMarket.findById(gameId);
        if (!market) {
            return res.status(404).json({ message: 'Market not found' });
        }

        market.status = status;
        await market.save();

        res.status(200).json({ success: true, message: 'Market status updated successfully', market });
    } catch (error) {
        console.error("toggleGDMarketStatus Error:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

function applyTodayResultDisplay(game, todayResult) {
    if (!todayResult) {
        return {
            ...game,
            jodi_result: '**'
        };
    }
    return {
        ...game,
        jodi_result: todayResult.jodi || '**'
    };
}

export const getAllGDGames = async (req, res) => {
    try {
        const games = await GDMarket.find().lean();

        const todayKey = getISTDateKey(new Date());
        const recentCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const recentResults = await GDResult.find({ date: { $gte: recentCutoff } }).lean();

        const resultByMarket = new Map();
        for (const r of recentResults) {
            if (getISTDateKey(r.date) !== todayKey) continue;
            resultByMarket.set(String(r.market_id), r);
        }

        const currentMBM = getCurrentISTMinutes();

        const isWithinWindow = (currMBM, startMBM, endMBM) => {
            if (startMBM === endMBM) return false;
            if (startMBM < endMBM) return currMBM >= startMBM && currMBM < endMBM;
            return currMBM >= startMBM || currMBM < endMBM;
        };

        const gamesWithStatus = games.map((game) => {
            const openStartMBM = parseTimeToMinutes(game.open_time || '00:00 AM');
            const closeCutoffMBM = parseTimeToMinutes(game.close_time);
            
            // Gali Desawar is active if the current time is within open and close range
            let isAllowed = isWithinWindow(currentMBM, openStartMBM, closeCutoffMBM);
            let currentStatus = isAllowed ? 'Active' : 'Closed';

            // Override with manual status if set to Closed
            if (game.status === 'Closed') {
                currentStatus = 'Closed';
            }

            const todayResult = resultByMarket.get(String(game._id));
            const withDisplay = applyTodayResultDisplay(game, todayResult);

            return {
                ...withDisplay,
                status: currentStatus,
                is_closed: currentStatus === 'Closed'
            };
        });

        res.status(200).json({ data: gamesWithStatus });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const declareGDResult = async (req, res) => {
    try {
        const { market_id, date, jodi } = req.body;

        if (!market_id || !jodi) {
            return res.status(400).json({ message: 'Market ID and Jodi are required' });
        }

        const targetDate = date ? new Date(date) : new Date();
        const { start: startOfDay, end: endOfDay } = getISTDayBounds(targetDate);

        const marketDoc = await GDMarket.findById(market_id);
        if (!marketDoc) {
            return res.status(404).json({ message: 'GD Market not found' });
        }

        let resultDoc = await GDResult.findOne({ market_id, date: { $gte: startOfDay, $lte: endOfDay } });

        if (!resultDoc) {
            resultDoc = new GDResult({
                market_id,
                date: targetDate,
                jodi: jodi
            });
        } else {
            resultDoc.jodi = jodi;
        }

        await resultDoc.save();

        marketDoc.jodi_result = jodi;
        await marketDoc.save();

        // Trigger Settlement Service for Gali Desawar Bids
        await runGDSettlementLogic(market_id, resultDoc);

        res.status(200).json({ 
            success: true,
            message: 'GD Result declared and settlement triggered.', 
            result: resultDoc
        });

    } catch (error) {
        console.error("GD Result Logic Error:", error);
        res.status(500).json({ message: "Server error calculating GD results." });
    }
};

export const getGDMarketResults = async (req, res) => {
    try {
        const { market_id, date } = req.query;

        if (!market_id) {
            return res.status(400).json({ message: "market_id is required" });
        }

        let query = { market_id: market_id };
        if (date) {
            const { start: startOfDay, end: endOfDay } = getISTDayBounds(new Date(date));
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const results = await GDResult.find(query)
            .sort({ date: 1 })
            .populate('market_id', 'name');

        res.status(200).json({ data: results });

    } catch (error) {
        console.error("Error fetching GD market results:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllGDResults = async (req, res) => {
    try {
        const results = await GDResult.find()
            .sort({ date: -1 })
            .populate('market_id', 'name');

        res.status(200).json({ data: results });
    } catch (error) {
        console.error("Error fetching all GD results:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

import Market from "../models/Market.js";
import Result from "../models/Result.js";
import { parseTimeToMinutes, getCurrentISTMinutes, getISTDateKey, getISTDayBounds } from "../utils/timeUtils.js";
import { runSettlementLogic } from "../services/settlementService.js";
import { resetDailyMarketDisplay } from "../jobs/resetMarketDisplay.js";
import { notifyResultDeclared } from "../utils/notificationHelper.js";


export const addGame = async (req, res) => {
    try {
        const name = req.body?.name ?? req.body?.Name;
        const open_time = req.body?.open_time ?? req.body?.OpeningTime;
        const close_time = req.body?.close_time ?? req.body?.ClosingTime;

        const open_result_time = req.body?.open_result_time;
        const close_result_time = req.body?.close_result_time;

        if (!name || !open_time || !close_time || !open_result_time || !close_result_time) {
            return res.status(400).json({
                message: 'All fields (Name and 4 Timings) are required'
            });
        }

        const existingGame = await Market.findOne({ name });
        if (existingGame) {
            return res.status(400).json({ message: 'Game already exists' });
        }

        const game = await Market.create({
            name,
            open_time,
            close_time,
            open_result_time,
            close_result_time
        });

        res.status(201).json({ message: 'Game added successfully', game });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export const deleteMarket = async (req, res) => {
    try {
        const { marketId } = req.body;
        if (!marketId) {
            return res.status(400).json({ message: 'Market ID is required' });
        }
        
        const market = await Market.findById(marketId);
        if (!market) {
            return res.status(404).json({ message: 'Market not found' });
        }

        await Market.findByIdAndDelete(marketId);
        
        res.status(200).json({ success: true, message: 'Market deleted successfully' });
    } catch (error) {
        console.error("deleteMarket Error:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}


function applyTodayResultDisplay(game, todayResult) {
    if (!todayResult) {
        return {
            ...game,
            open_pana: '***',
            jodi_result: '**',
            close_pana: '***',
        };
    }
    const open_pana = todayResult.open_panna || '***';
    const close_pana = todayResult.close_panna || '***';
    const displayOpen = todayResult.open_digit || '*';
    const displayClose = todayResult.close_digit || '*';
    const jodi_result = `${displayOpen}${displayClose}`;
    return {
        ...game,
        open_pana,
        jodi_result,
        close_pana,
    };
}

export const getAllGames = async (req, res) => {
    try {
        const games = await Market.find().lean();

        const todayKey = getISTDateKey(new Date());
        const recentCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const recentResults = await Result.find({ date: { $gte: recentCutoff } }).lean();

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
            const openStartMBM = parseTimeToMinutes(game.open_time);
            const openCutoffMBM = parseTimeToMinutes(game.open_result_time || game.open_time);
            const closeCutoffMBM = parseTimeToMinutes(game.close_time);

            const openBettingOpen = isWithinWindow(currentMBM, openStartMBM, openCutoffMBM);
            const closeBettingOpen = isWithinWindow(currentMBM, openStartMBM, closeCutoffMBM);

            let currentStatus = 'Upcoming';
            if (closeBettingOpen) currentStatus = 'Active';
            else if (!openBettingOpen && !closeBettingOpen) currentStatus = 'Closed';

            const todayResult = resultByMarket.get(String(game._id));
            const withDisplay = applyTodayResultDisplay(game, todayResult);

            return {
                ...withDisplay,
                open_betting_open: openBettingOpen,
                close_betting_open: closeBettingOpen,
                is_closed: currentStatus === 'Closed',
                status: currentStatus
            };
        });

        res.status(200).json({ data: gamesWithStatus });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}


export const declareResult = async (req, res) => {
    try {
        const { market_id, date, open_panna, close_panna } = req.body;

        const calculateDigit = (panna) => {
            if (!panna || panna.length !== 3) return '';
            const sum = parseInt(panna[0]) + parseInt(panna[1]) + parseInt(panna[2]);
            return (sum % 10).toString();
        };

        const open_digit = open_panna ? calculateDigit(open_panna) : '';
        const close_digit = close_panna ? calculateDigit(close_panna) : '';

        const targetDate = date ? new Date(date) : new Date();
        const { start: startOfDay, end: endOfDay } = getISTDayBounds(targetDate);

        const marketDoc = await Market.findById(market_id);
        if (!marketDoc) {
            return res.status(404).json({ message: 'Market not found' });
        }

        let resultDoc = await Result.findOne({ market_id, date: { $gte: startOfDay, $lte: endOfDay } });

        let runOpenSettlement = false;
        let runCloseSettlement = false;

        if (!resultDoc) {
            resultDoc = new Result({
                market_id,
                date: targetDate,
                open_panna: open_panna || '',
                open_digit: open_digit,
                close_panna: close_panna || '',
                close_digit: close_digit,
                jodi: (open_digit && close_digit) ? `${open_digit}${close_digit}` : ''
            });

            if (open_panna) runOpenSettlement = true;
            if (close_panna) runCloseSettlement = true;

        } else {
            if (open_panna && !resultDoc.open_panna) {
                resultDoc.open_panna = open_panna;
                resultDoc.open_digit = open_digit;
                runOpenSettlement = true;
            }
            if (close_panna && !resultDoc.close_panna) {
                resultDoc.close_panna = close_panna;
                resultDoc.close_digit = close_digit;
                runCloseSettlement = true;
            }
            
            if (resultDoc.open_digit && resultDoc.close_digit) {
                resultDoc.jodi = `${resultDoc.open_digit}${resultDoc.close_digit}`;
            }
        }

        await resultDoc.save();

        marketDoc.open_pana = resultDoc.open_panna || '***';
        marketDoc.close_pana = resultDoc.close_panna || '***';
        
        const displayOpen = resultDoc.open_digit || '*';
        const displayClose = resultDoc.close_digit || '*';
        marketDoc.jodi_result = `${displayOpen}${displayClose}`;
        
        await marketDoc.save();

        if (runOpenSettlement) runSettlementLogic(market_id, resultDoc, 'Open');
        if (runCloseSettlement) runSettlementLogic(market_id, resultDoc, 'Close');

        try {
            const resultLine = `${marketDoc.open_pana}-${marketDoc.jodi_result}-${marketDoc.close_pana}`;
            await notifyResultDeclared(marketDoc.name || 'Market', resultLine);
        } catch (e) {
            console.error("Notification Error:", e);
        }

        res.status(200).json({ 
            success: true,
            message: 'Result declared and settlement triggered accordingly.', 
            result: resultDoc,
            settlementsTriggered: { open: runOpenSettlement, close: runCloseSettlement }
        });

    } catch (error) {
        console.error("Result Logic Error:", error);
        res.status(500).json({ message: "Server error calculating results." });
    }
};


export const getMarketResults = async (req, res) => {
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

        const results = await Result.find(query)
            .sort({ date: 1 })
            .populate('market_id', 'name');

        res.status(200).json({ data: results });

    } catch (error) {
        console.error("Error fetching market results:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllResults = async (req, res) => {
    try {
        const results = await Result.find()
            .sort({ date: -1 })
            .populate('market_id', 'name');

        res.status(200).json({ data: results });
    } catch (error) {
        console.error("Error fetching all results:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const resetDailyMarketDisplayAdmin = async (req, res) => {
    try {
        const r = await resetDailyMarketDisplay();
        res.status(200).json({
            success: true,
            message: 'Market display reset to placeholders.',
            modifiedCount: r.modifiedCount ?? r.matchedCount,
        });
    } catch (error) {
        console.error('resetDailyMarketDisplayAdmin:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const cronResetDailyMarketDisplay = async (req, res) => {
    const secret = req.headers['x-cron-secret'];
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
        const r = await resetDailyMarketDisplay();
        res.status(200).json({
            success: true,
            message: 'OK',
            modifiedCount: r.modifiedCount ?? r.matchedCount,
        });
    } catch (error) {
        console.error('cronResetDailyMarketDisplay:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
import mongoose from 'mongoose';
import Bid from '../models/Bid.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import GDBet from '../models/GDBid.js';
import { getISTDayBounds } from '../utils/timeUtils.js';



const isSinglePanna = (panna) => panna && new Set(panna.split('')).size === 3;
const isDoublePanna = (panna) => panna && new Set(panna.split('')).size === 2;
const isTriplePanna = (panna) => panna && new Set(panna.split('')).size === 1;

const isCyclePanaWin = (betNum, resultNum) => {
    if (!resultNum || resultNum.length !== 3) return false;
    const rotations = [
        resultNum,
        resultNum[1] + resultNum[2] + resultNum[0],
        resultNum[2] + resultNum[0] + resultNum[1]
    ];
    return rotations.includes(betNum);
};

const isFamilyPanelWin = (betNum, resultNum) => {
    if (!resultNum || !betNum) return false;
    return betNum.split('').sort().join('') === resultNum.split('').sort().join('');
};

const isMotorWin = (motorDigits, resultPanna) => {
    if (!resultPanna || !motorDigits) return false;
    return resultPanna.split('').every(digit => motorDigits.includes(digit));
};

const isUniqueDigitsMotorWin = (motorDigits, resultPanna) => {
    if (!resultPanna || !motorDigits) return false;
    const uniqueResultDigits = [...new Set(resultPanna.split(''))];
    return uniqueResultDigits.every(digit => motorDigits.includes(digit));
};

const PAYOUT_RATES = {
    'Single': 10, 'SingleBulk': 10,
    'Jodi': 100, 'JodiBulk': 100,
    'Single Panna': 160, 'SinglePannaBulk': 160,
    'Double Panna': 320, 'DoublePannaBulk': 320,
    'Triple Panna': 700,
    'FullSangam': 10000,
    'HalfSangamA': 1000, 'HalfSangamB': 1000,
    'SP': 10, 'DP': 100, 'TP': 700,
    'TwoDigitPana': 100,
    'SPMotor': 160, 'DPMotor': 320,
    'RedJodi': 100,
    'OddEven': 2,
    'SPCOMMON': 10, 'DPCOMMON': 100,
    'Cycle Pana': 160, 'CyclePana': 160,
    'Family Panel': 100, 'FamilyPanel': 100,
    'Left Digit': 9.5,
    'Right Digit': 9.5,
    'Jodi Digit': 95,
};

const getPayoutRate = (gameType) => {
    if (!gameType) return 0;
    if (PAYOUT_RATES[gameType] !== undefined) return PAYOUT_RATES[gameType];

    // Fallback aliases to avoid zero payout on naming variants
    const aliasMap = {
        'SingleBulk': 'Single',
        'JodiBulk': 'Jodi',
        'SinglePannaBulk': 'Single Panna',
        'DoublePannaBulk': 'Double Panna',
        'CyclePana': 'Cycle Pana',
        'FamilyPanel': 'Family Panel'
    };

    const normalized = aliasMap[gameType] || gameType;
    return PAYOUT_RATES[normalized] || 0;
};

// ==========================================
// 2. INDIVIDUAL GAME CHECKERS 
// ==========================================

const checkSingleWin = (betNum, resultDigit) => betNum === resultDigit;

const checkJodiWin = (betNum, _, __, resultDoc) => betNum === resultDoc.jodi;

const checkSinglePannaWin = (betNum, _, resultPanna) => isSinglePanna(resultPanna) && betNum === resultPanna;

const checkDoublePannaWin = (betNum, _, resultPanna) => isDoublePanna(resultPanna) && betNum === resultPanna;

const checkTriplePannaWin = (betNum, _, resultPanna) => isTriplePanna(resultPanna) && betNum === resultPanna;

const checkSPMotorWin = (betNum, _, resultPanna) => isSinglePanna(resultPanna) && isMotorWin(betNum, resultPanna);

const checkDPMotorWin = (betNum, _, resultPanna) => isDoublePanna(resultPanna) && isUniqueDigitsMotorWin(betNum, resultPanna);

const checkOddEvenWin = (betNum, resultDigit) => {
    let digitNum = parseInt(resultDigit);
    if (!isNaN(digitNum)) {
        let isEven = digitNum % 2 === 0;
        return (betNum.toLowerCase() === 'even' && isEven) || (betNum.toLowerCase() === 'odd' && !isEven);
    }
    return false;
};

const checkRedJodiWin = (betNum, _, __, resultDoc) => {
    const redList = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
    return redList.includes(resultDoc.jodi) && betNum === resultDoc.jodi;
};

const checkTwoDigitPanaWin = (betNum, _, resultPanna) => {
    if (resultPanna && betNum.length === 2) {
        let pannaChars = resultPanna.split('');
        let betChars = betNum.split('');
        let matchCount = 0;
        for (let char of betChars) {
            let idx = pannaChars.indexOf(char);
            if (idx !== -1) {
                matchCount++;
                pannaChars.splice(idx, 1);
            }
        }
        return matchCount === 2;
    }
    return false;
};

const checkHalfSangamAWin = (betNum, _, __, resultDoc) => betNum === `${resultDoc.open_panna}-${resultDoc.close_digit}`;
const checkHalfSangamBWin = (betNum, _, __, resultDoc) => betNum === `${resultDoc.open_digit}-${resultDoc.close_panna}`;
const checkFullSangamWin = (betNum, _, __, resultDoc) => betNum === `${resultDoc.open_panna}-${resultDoc.close_panna}`;
const checkCyclePanaWin = (betNum, _, resultPanna) => isCyclePanaWin(betNum, resultPanna);
const checkFamilyPanelWin = (betNum, _, resultPanna) => isFamilyPanelWin(betNum, resultPanna);


// ==========================================
// 3. THE WIN ENGINE (Router)
// ==========================================
const GameWinEngine = {
    'Single': checkSingleWin, 'SingleBulk': checkSingleWin,
    'Jodi': checkJodiWin, 'JodiBulk': checkJodiWin,
    'Single Panna': checkSinglePannaWin, 'SinglePannaBulk': checkSinglePannaWin, 'SP': checkSinglePannaWin, 'SPCOMMON': checkSinglePannaWin,
    'Double Panna': checkDoublePannaWin, 'DoublePannaBulk': checkDoublePannaWin, 'DP': checkDoublePannaWin, 'DPCOMMON': checkDoublePannaWin,
    'Triple Panna': checkTriplePannaWin, 'TP': checkTriplePannaWin,
    'SPMotor': checkSPMotorWin,
    'DPMotor': checkDPMotorWin,
    'OddEven': checkOddEvenWin,
    'RedJodi': checkRedJodiWin,
    'TwoDigitPana': checkTwoDigitPanaWin,
    'HalfSangamA': checkHalfSangamAWin,
    'HalfSangamB': checkHalfSangamBWin,
    'FullSangam': checkFullSangamWin,
    'Cycle Pana': checkCyclePanaWin, 'CyclePana': checkCyclePanaWin,
    'Family Panel': checkFamilyPanelWin, 'FamilyPanel': checkFamilyPanelWin,
    'Left Digit': checkSingleWin,
    'Right Digit': checkSingleWin,
    'Jodi Digit': checkJodiWin
};

const getResultTargetsBySession = (session, resultDoc) => {
    const effectiveSession = session || 'Full';
    return {
        resultPannaToMatch: effectiveSession === 'Open' ? resultDoc.open_panna : resultDoc.close_panna,
        resultDigitToMatch: effectiveSession === 'Open' ? resultDoc.open_digit : resultDoc.close_digit
    };
};

export const evaluateBidWin = ({ game_type, bet_number, session, resultDoc }) => {
    const checkWinFunction = GameWinEngine[game_type];
    if (!checkWinFunction) return false;

    const { resultPannaToMatch, resultDigitToMatch } = getResultTargetsBySession(session, resultDoc);
    return checkWinFunction(String(bet_number), resultDigitToMatch, resultPannaToMatch, resultDoc);
};


// ==========================================
// 4. MAIN SETTLEMENT LOGIC 
// ==========================================
export const runSettlementLogic = async (marketId, resultDoc, sessionType) => {
    try {
        console.log(`[SETTLEMENT] Started for Market: ${marketId} | Session: ${sessionType}`);

        const resultDate = resultDoc.date ? new Date(resultDoc.date) : new Date();
        const { start, end } = getISTDayBounds(resultDate);

        console.log(`[SETTLEMENT] Filtering bids between ${start.toISOString()} and ${end.toISOString()} for market ${marketId}`);

        const bidCursor = Bid.find({
            market_id: marketId,
            status: 'Pending',
            createdAt: { $gte: start, $lte: end }
        }).cursor();

        let processedCount = 0;

        for await (const bid of bidCursor) {
            const effectiveSession = bid.bet_session || bid.session;

            // 1. Session Check
            if (sessionType === 'Open' && effectiveSession !== 'Open') continue;
            if (sessionType === 'Close' && !['Close', 'Full'].includes(effectiveSession)) continue;

            // 2. Evaluate winner by game/session specific logic
            let isWinner = false;
            if (GameWinEngine[bid.game_type]) {
                isWinner = evaluateBidWin({
                    game_type: bid.game_type,
                    bet_number: bid.bet_number,
                    session: effectiveSession,
                    resultDoc
                });
            } else {
                console.error(`[SETTLEMENT WARNING] No checker found for game_type: ${bid.game_type}`);
            }

            // 4. Update Database safely with Transactions
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                if (isWinner) {
                    const rate = getPayoutRate(bid.game_type);
                    const winningAmount = bid.amount * rate;

                    await User.findByIdAndUpdate(bid.user_id, { $inc: { 'wallet.realBalance': winningAmount } }, { session });
                    await Bid.findByIdAndUpdate(bid._id, { status: 'Winner', wonAmount: winningAmount }, { session });

                    await Transaction.create([{
                        userId: bid.user_id,
                        amount: winningAmount,
                        type: 'Win',
                        remark: `Won in ${bid.game_type} (${bid.session}) - Number: ${bid.bet_number}`,
                        method: 'System',
                        status: 'Approved'
                    }], { session });

                } else {
                    await Bid.findByIdAndUpdate(bid._id, { status: 'Loser', wonAmount: 0 }, { session });
                }

                await session.commitTransaction();
                processedCount++;

            } catch (error) {
                await session.abortTransaction();
                console.error(`[SETTLEMENT] Failed for Bid ID ${bid._id}:`, error);
            } finally {
                session.endSession();
            }
        }

        console.log(`[SETTLEMENT] Successfully processed ${processedCount} bids for ${sessionType} session.`);

    } catch (criticalError) {
        console.error(`[SETTLEMENT] CRITICAL ERROR in Market ${marketId}:`, criticalError);
    }
};

export const runGDSettlementLogic = async (marketId, resultDoc) => {
    try {
        console.log(`[GD SETTLEMENT] Started for Market: ${marketId} | Jodi Result: ${resultDoc.jodi}`);

        const resultDate = resultDoc.date ? new Date(resultDoc.date) : new Date();
        const { start, end } = getISTDayBounds(resultDate);

        console.log(`[GD SETTLEMENT] Filtering bids between ${start.toISOString()} and ${end.toISOString()} for market ${marketId}`);

        const bidCursor = GDBet.find({
            market_id: marketId,
            status: 'Pending',
            createdAt: { $gte: start, $lte: end }
        }).cursor();

        let processedCount = 0;

        for await (const bid of bidCursor) {
            let isWinner = false;
            
            // Check winning conditions for Gali Desawar
            const declaredJodi = String(resultDoc.jodi || '');
            if (declaredJodi.length === 2) {
                if (bid.game_type === 'Left Digit') {
                    isWinner = bid.bet_number === declaredJodi[0];
                } else if (bid.game_type === 'Right Digit') {
                    isWinner = bid.bet_number === declaredJodi[1];
                } else if (bid.game_type === 'Jodi Digit') {
                    isWinner = bid.bet_number === declaredJodi;
                }
            }

            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                if (isWinner) {
                    const rate = bid.game_type === 'Jodi Digit' ? 95 : 9.5;
                    const winningAmount = bid.amount * rate;

                    await User.findByIdAndUpdate(bid.user_id, { $inc: { 'wallet.realBalance': winningAmount } }, { session });
                    await GDBet.findByIdAndUpdate(bid._id, { status: 'Winner', wonAmount: winningAmount }, { session });

                    await Transaction.create([{
                        userId: bid.user_id,
                        amount: winningAmount,
                        type: 'Win',
                        remark: `Won in GD ${bid.game_type} - Number: ${bid.bet_number}`,
                        method: 'System',
                        status: 'Approved'
                    }], { session });

                } else {
                    await GDBet.findByIdAndUpdate(bid._id, { status: 'Loser', wonAmount: 0 }, { session });
                }

                await session.commitTransaction();
                processedCount++;

            } catch (error) {
                await session.abortTransaction();
                console.error(`[GD SETTLEMENT] Failed for Bid ID ${bid._id}:`, error);
            } finally {
                session.endSession();
            }
        }

        console.log(`[GD SETTLEMENT] Successfully processed ${processedCount} Gali Desawar bids.`);

    } catch (criticalError) {
        console.error(`[GD SETTLEMENT] CRITICAL ERROR in Market ${marketId}:`, criticalError);
    }
};
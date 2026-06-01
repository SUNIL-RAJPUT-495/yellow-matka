import mongoose from "mongoose";

const gameRateSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['Main Games', 'Starline Games'],
        default: 'Main Games'
    },
    gameType: {
        type: String,
        required: true,
    },
    costAmount: {
        type: Number,
        required: true,
        default: 10
    },
    winningAmount: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

export const GameRate = mongoose.model("GameRate", gameRateSchema);

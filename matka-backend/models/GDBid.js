import mongoose from 'mongoose';

const gdBetSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    market_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GDMarket',
        required: true
    },
    game_type: {
        type: String,
        enum: ['Left Digit', 'Right Digit', 'Jodi Digit'],
        required: true
    },
    session: {
        type: String,
        enum: ['Open', 'Close', 'Full'],
        required: true
    },
    bet_session: {
        type: String,
        enum: ['Open', 'Close', 'Full'],
        default: 'Full'
    },
    bet_number: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    wonAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Winner', 'Loser'],
        default: 'Pending'
    }
}, { timestamps: true });

export default mongoose.model('GDBet', gdBetSchema);

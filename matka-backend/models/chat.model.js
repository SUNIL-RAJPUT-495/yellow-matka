import mongoose from "mongoose";

// 1. Conversation Model 
const conversationSchema = new mongoose.Schema({
    participants: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],
    lastMessage: { type: String, default: "" },
}, { timestamps: true });

export const Conversation = mongoose.model("Conversation", conversationSchema);

// 2. Message Model 
const messageSchema = new mongoose.Schema({
    conversationId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Conversation',
        required: true
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    message: { type: String, required: true },
    seen: { type: Boolean, default: false }
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);
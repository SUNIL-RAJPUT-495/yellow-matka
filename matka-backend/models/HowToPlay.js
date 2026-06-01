import mongoose from "mongoose";

const howToPlaySchema = new mongoose.Schema({
    pageTitle: {
        type: String,
        default: "How To Play"
    },
    sections: [{
        heading: { type: String, required: true },
        description: { type: String, required: true }
    }],
    videoUrl: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export const HowToPlay = mongoose.model("HowToPlay", howToPlaySchema);

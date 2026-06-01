import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    whatsapp: { type: String, default: "" },
    phone1: { type: String, default: "" },
    phone2: { type: String, default: "" },
    telegram: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    websiteName: { type: String, default: "MAHA DEV MATKA" },
    logo: { type: String, default: "" },
}, { timestamps: true });

export const Contact = mongoose.model("Contact", contactSchema);

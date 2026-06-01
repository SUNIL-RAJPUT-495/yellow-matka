import mongoose from 'mongoose';

const upiSettingSchema = new mongoose.Schema({
    upiId: {
        type: String,
        required: true,
        trim: true
    },
    merchantName: {
        type: String,
        required: true,
        default: "Mahadev Admin"
    },
    qrCodeImage: {
        type: String, 
        default: ""
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model('UpiSetting', upiSettingSchema);
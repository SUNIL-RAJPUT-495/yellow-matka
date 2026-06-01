import { GameRate } from '../models/GameRate.js';
import { HowToPlay } from '../models/HowToPlay.js';
import { Contact } from '../models/Contact.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// --- GAME RATES ---
export const getGameRates = async (req, res) => {
    try {
        const rates = await GameRate.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, rates });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const createGameRate = async (req, res) => {
    try {
        const { category, gameType, costAmount, winningAmount } = req.body;
        if (!gameType || !winningAmount) {
            return res.status(400).json({ success: false, message: 'Game Type and Winning Amount are required' });
        }
        const newRate = await GameRate.create({ category, gameType, costAmount, winningAmount });
        res.status(201).json({ success: true, message: 'Rate added successfully', rate: newRate });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const deleteGameRate = async (req, res) => {
    try {
        const { id } = req.params;
        await GameRate.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Rate deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


// --- HOW TO PLAY ---
export const getHowToPlay = async (req, res) => {
    try {
        let content = await HowToPlay.findOne();
        if (!content) {
            content = await HowToPlay.create({ pageTitle: "How To Play", sections: [] });
        }
        res.status(200).json({ success: true, content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const updateHowToPlay = async (req, res) => {
    try {
        const { pageTitle, sections, videoUrl } = req.body;
        let content = await HowToPlay.findOne();
        if (!content) {
            content = new HowToPlay();
        }
        content.pageTitle = pageTitle || content.pageTitle;
        content.sections = sections || content.sections;
        content.videoUrl = videoUrl !== undefined ? videoUrl : content.videoUrl;
        
        await content.save();
        res.status(200).json({ success: true, message: 'Content updated successfully', content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


// --- CONTACT SETTINGS ---
export const getContactSettings = async (req, res) => {
    try {
        let contact = await Contact.findOne();
        if (!contact) {
            contact = await Contact.create({});
        }
        res.status(200).json({ success: true, contact });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const updateContactSettings = async (req, res) => {
    try {
        const { whatsapp, phone1, phone2, telegram, email, address } = req.body;
        let contact = await Contact.findOne();
        if (!contact) {
            contact = new Contact();
        }
        
        if (whatsapp !== undefined) contact.whatsapp = whatsapp;
        if (phone1 !== undefined) contact.phone1 = phone1;
        if (phone2 !== undefined) contact.phone2 = phone2;
        if (telegram !== undefined) contact.telegram = telegram;
        if (email !== undefined) contact.email = email;
        if (address !== undefined) contact.address = address;
        if (req.body.websiteName !== undefined) contact.websiteName = req.body.websiteName;

        if (req.file) {
            contact.logo = req.file.filename;
        }

        await contact.save();
        res.status(200).json({ success: true, message: 'Contacts updated successfully', contact });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.user?._id; // Corrected from req.userId to req.user._id

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current and New passwords are required' });
        }

        const admin = await User.findById(adminId);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedPassword;
        await admin.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

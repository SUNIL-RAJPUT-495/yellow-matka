import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const setupStaticFolders = (app) => {
    const uploadPath = path.join(__dirname, '../uploads');
    
    app.use('/uploads', express.static(uploadPath));
};
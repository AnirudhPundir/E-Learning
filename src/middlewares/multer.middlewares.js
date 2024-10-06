import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import path from 'path'
import { dbName } from '../constants.js';
import crypto from 'crypto';
import mongodb from 'mongodb';
import mongoose from 'mongoose';

const fileSize = 2 * 1024 * 1024 * 1024;

const gridFsStorage = new GridFsStorage({
    url: `${process.env.MONGODB_URI}${dbName}`,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const connection = mongoose.connection;

            new mongodb.GridFSBucket(connection.db, {
                bucketName: 'uploads'
            });
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const fileName = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    fileName,
                    bucketName: 'uploads'
                }
                resolve(fileInfo);
            });
        })
    }
});

export const gridFsupload = multer({ gridFsStorage });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const fileTypes = /mp4|avi|mkv|mov/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName) return cb(null, true)
    else cb(new Error('Only videos files are allowed'));
};

export const upload = multer({ storage, fileFilter, limits: { fileSize } });
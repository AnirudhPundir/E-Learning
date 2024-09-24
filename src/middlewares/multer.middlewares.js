import multer from 'multer';
import path from 'path'

const fileSize = 2 * 1024 * 1024 *1024;

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./public/temp");
    },
    filename: function(req, file, cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const fileTypes = /mp4|avi|mkv|mov/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if(mimeType && extName) return cb(null, true)
    else cb(new Error('Only videos files are allowed'));
};

export const upload = multer({storage, fileFilter, limits: {fileSize}});
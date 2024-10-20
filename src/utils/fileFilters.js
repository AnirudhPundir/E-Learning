import path from 'path'

const videoFileFilter = (req, file, cb) => {
    const fileTypes = /mp4|avi|mkv|mov/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName) return cb(null, true)
    else cb(new Error('Only videos files are allowed'));
};

const pdfFileFilter = (req, file, cb) => {
    const fileTypes = /pdf/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName) return cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
};

export {videoFileFilter, pdfFileFilter}
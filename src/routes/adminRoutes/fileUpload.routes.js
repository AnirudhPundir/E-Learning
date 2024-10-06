import { Router } from "express";
import { gridFsupload } from "../../middlewares/multer.middlewares.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import mongoose from "mongoose";
import mongodb from "mongodb";

const router = Router();

const gridFSBucket = () => {
    const connection = mongoose.connection;
    const gridfsbucket = new mongodb.GridFSBucket(connection.db, {
        bucketName: 'uploads'
    });
    return gridfsbucket;

    
}

router.route("/upload-file").post(gridFsupload.single('file'), (req, res) => {
    gridFSBucket();
    return res.status(200).json(new ApiResponse(200, { success: true, file: req.file }, "The video was uploaded successfully"));
});

router.route("/get-files").get((req, res) => {
    const gridfsbucket = gridFSBucket();
    gridfsbucket.find().toArray((err, files) => {
        if (!files || files.length === 0) {
            return res.status(200).json(new ApiResponse(400, {
                success: false,
                message: 'No files available'
            }, "No files found"));
        }

        files.map(file => {
            if (file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/svg') {
                file.isImage = true;
            } else {
                file.isImage = false;
            }
        });

        return res.status(200).json(new ApiResponse(200, {
            success: true,
            files,
        }, "Files Fetched successfully"));
    });
});



export default router;
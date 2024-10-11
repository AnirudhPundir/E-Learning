import { Router } from "express";
import { upload } from "../../middlewares/multer.middlewares.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import mongoose from "mongoose";
import mongodb from "mongodb";
import fs from 'fs';

const router = Router();


router.route("/upload-file").post(upload.single('file'), (req, res) => {
    debugger

    const {sectionId, videoName} = req.body;

    const db = mongoose.connection.db;

    const bucket = new mongodb.GridFSBucket(db, { bucketName: 'uploads' });

    const file = fs.createReadStream(`public/temp/${req.file.filename}`).
        pipe(bucket.openUploadStream(req.file.filename, {
            chunkSizeBytes: 1048576,
            metadata: { field: 'myField', value: 'myValue' }
        }));

    if(!file) return res.status(200).json(400, {success: false}, "Video was not uploaded");

    

    return res.status(200).json(new ApiResponse(200, { success: true, file }, "The video was uploaded successfully"));
});

router.route("/get-files").get(async (req, res) => {

    const db = mongoose.connection.db;

    const video = await db.collection('uploads.files').findOne({});
 
    if (!video) return res.status(200).json(new ApiResponse(400, { success: false }, "No video found"));

    //create response headers
    const videoSize = video.length;
    const start = 0;
    const end = videoSize - 1;


    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-length": contentLength,
        "Content-Type": "video/mp4"
    };

    res.writeHead(206, headers);

    const bucket = new mongodb.GridFSBucket(db, { bucketName: 'uploads' });

    const downloadStream = bucket.openDownloadStreamByName(video.filename, {
        start
    });

    downloadStream.pipe(res);
});

router.route("/get-file/:id").get(async (req, res) => {

    const range = req.headers.range;
    if (!range) {
      return res.status(400).send("Requires Range header");
    }  

    const db = mongoose.connection.db;

    const id = req.params.id;

    if (!id) return res.status(200).json(new ApiResponse(400, { success: false }, "Invalid input"));

    const video = await db.collection('uploads.files').findOne(new mongoose.Types.ObjectId(id));

    if (!video) return res.json(200).json(new ApiResponse(400, { success: false }, "Video not found"));

    //create response headers
    const videoSize = video.length;
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);    

    const contentLength = end - start + 1;

    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-length": contentLength,
        "Content-Type": "video/mp4"
    };

    res.writeHead(206, headers);

    const bucket = new mongodb.GridFSBucket(db, { bucketName: 'uploads' });

    const downloadStream = bucket.openDownloadStreamByName(video.filename, {
        start, end
    });

    downloadStream.pipe(res);
})

export default router;
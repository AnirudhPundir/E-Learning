import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { Section } from "../../models/section.models.js";
import { Video } from "../../models/videoLecture.models.js";
import fs from 'fs';
import mongoose from "mongoose";
import mongodb from "mongodb";
//Handle 

const uploadVideoLecture = asyncHandler(async (req, res) => {

    //TODO: APPLY DUPLICACY CHECK

    const fileName = req.file && req.file.filename;

    if (!fileName) return res.status(200).json(new ApiResponse(400, {success: false}, "Video was not uploaded"));

    const { sectionId, videoName, description } = req.body;

    if (!sectionId) return res.status(200).json(new ApiResponse(400, { success: false }, "Section id is invalid"));

    if ([videoName, description].some(field => field?.trim() === "")) return res.status(200).json(new ApiResponse(400, { success: false }, "Incorrect Input"));

    const section = await Section.findById(sectionId);

    if (!(section || section.isDeleted)) return res.status(200).json(new ApiResponse(404, { success: false }, "Section not found"));

    const sectionVideos = await Video.find({ sectionId });

    let sectionIndex = -1;

    if (!sectionVideos || sectionVideos.length === 0) sectionIndex = 0;

    else sectionIndex = sectionVideos.length;

    const db = mongoose.connection.db;

    const bucket = new mongodb.GridFSBucket(db, { bucketName: 'uploads' });

    const file = fs.createReadStream(`public/temp/${fileName}`).
        pipe(bucket.openUploadStream(fileName, {
            chunkSizeBytes: 1048576,
            metadata: { field: 'myField', value: 'myValue' }
        }));

    if (!file) return res.status(200).json(400, { success: false }, "Video was not uploaded");

    const videoLecture = await Video.create({
        sectionId,
        videoName,
        description,
        videoId: file.id.toString(),
        sectionIndex
    });

    if (!videoLecture) return res.status(200).json(400, { success: false }, "Video was not uploaded");

    return res.status(200).json(new ApiResponse(200, { success: true, data: videoLecture }, "The video was uploaded successfully"));
});

const getAllVideos = asyncHandler(async (req, res) => {

    const videos = await Video.find({ isDeleted: false }).select("-isDeleted");

    if (!videos) return res.status(200).json(new ApiResponse(400, { success: false }, "No video found"));

    return res.status(200).json(new ApiResponse(200, { success: true, data: videos }, "Video data fetched"))
});

const getAllVideosBySectionId = asyncHandler(async (req, res) => {
    const { id: sectionId } = req.params;

    if (!sectionId) return res.status(200).json(new ApiResponse(400, { success: false }, "Invalid Input"));

    const section = await Section.findById(sectionId, { isDeleted: false });

    if (!section) return res.status(200).json(400, { success: false }, "Section not found");

    const videos = await Video.find({ sectionId, isDeleted: false }).select("-isDeleted");

    if (!(videos && videos.length)) return res.status(200).json(400, { success: false }, "No videos found");

    return res.status(200).json(new ApiResponse(200, { success: true, data: videos }, "Videos fetched"));
});

const getVideoDetailsById = asyncHandler(async(req, res) => {
    const {id: videoId} = req.params;

    if(!videoId) return  res.status(200).json(new ApiResponse(400, {success: false}, "Invalid video id"));

    const video = await Video.findById(videoId, {isDeleted: false});

    if(!video) return res.status(200).json(new ApiResponse(400, {success: false}, "Video not found"));

    return res.status(200).json(new ApiResponse(200, {success: true, data: video}, "Video details fetched"))
})

const updateVideoDetails = asyncHandler(async (req, res) => {

    if (!req.body) res.status(200).json(new ApiResponse(400, { success: false }, "Invalid input"));

    const { id } = req.body;

    if (!id) return res.status(200).json(400, { success: false }, "Invalid Input");

    const video = await Video.findById(id, { isDeleted: false });

    if (!video) return res.status(200).json(400, { success: false }, "Video not found");

    const updatedVideo = await Video.findByIdAndUpdate(id, {
        $set: req.body
    }, { new: true }).select("-isDeleted");

    if (!updatedVideo) return res.status(200).json(400, { success: false }, "Video not updated");

    return res.status(200).json(400, { success: false, data: updatedVideo }, "Video updated successfully");
});

const streamVideo = asyncHandler(async (req, res) => {

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
});

const deleteVideo = asyncHandler(async (req, res) => {
    const {id: videoId} = req.params;
    
    if(!videoId) return res.status(200).json(new ApiResponse(400, {success: false}, "Incorrect Input"));

    const video = await Video.findById(videoId, {isDeleted: false});

    if(!video) return res.status(200).json(new ApiResponse(404, {success: false}, "Video not found"));

    const deletedVideo = await Video.findByIdAndUpdate(videoId, {$set: {isDeleted: true}}, {new: true});

    if(!deletedVideo) return res.status(200).json(new ApiResponse(400, {success: false}, "Video was not deleted"));

    return res.status(200).json(new ApiResponse(400, {success: true}, "Video was deleted"))
});

export { uploadVideoLecture, getAllVideos, getAllVideosBySectionId, updateVideoDetails, streamVideo, deleteVideo, getVideoDetailsById }
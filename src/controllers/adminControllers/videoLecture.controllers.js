import {asyncHandler} from "../../utils/asyncHandler.js";
import {ApiResponse} from "../../utils/apiResponse.js";
import { Section } from "../../models/section.models.js";
import { Video } from "../../models/videoLecture.models.js";
import { uploadOnCloudinaryVideo } from "../../utils/cloudinary.js";

//Handle 

const uploadVideoLecture = asyncHandler(async(req, res) => {

    const videoContentPath = req.file && req.file.path;

    const {sectionId, videoName} = req.body;

    let sectionIndex = -1;

    if(!videoContentPath) res.status(200).json(new ApiResponse(404, {success: false}, "File not uploaded successfully"));

    if(!sectionId) return res.status(200).json(new ApiResponse(400, {sucess: false}, "Section id is invalid"));

    const section = await Section.findById(sectionId);

    if(!(section || section.isDeleted)) return res.status(200).json(new ApiResponse(404, {success: false}, "Section not found"));

    if([videoName].some(field => field?.trim() === "")) return res.status(200).json(new ApiResponse(400, {sucess: false}, "Incorrect Input"));

    //handle section index

    const sectionVideos = await Video.find({sectionId});

    if(!sectionVideos || sectionVideos.length === 0) sectionIndex = 0;
    
    else sectionIndex = sectionVideos.length;

    const uploadedFile = await uploadOnCloudinaryVideo(videoContentPath);

    if(!uploadedFile) res.status(200).json(new ApiResponse(400, {success: false}, "Video upload failed"));

    const videoLecture = await Video.create({
        sectionId,
        videoName,
        url : uploadedFile.url,
        sectionIndex
    });

    if(!videoLecture) res.status(200).json(new ApiResponse(400, {success: false}, "Video was not uploaded"))

    res.status(200).json(new ApiResponse(200, {success: true, data : req.file.filename}, "File uploaded successfully"));

});

export {uploadVideoLecture}
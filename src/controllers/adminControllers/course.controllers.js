import { Course } from "../../models/course.models.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const createCourse = asyncHandler(async(req, res) => {
    const {courseName, courseDetails, instructorName, price} = req.body;

    if ([courseName, courseDetails, instructorName, price].some(field => field?.trim() === "")) {
        return res.status(200).json(new ApiResponse(400,{success: false}, "Incorrect Input"));
    }    

    const createdCourse = await Course.create({courseName, courseDetails, instructorName, price});

    if(!createdCourse) res.status(200).json(new ApiResponse(400, {success: false}, "The course was not created"));

    return res.status(200).json(new ApiResponse(200, {success: true, createdCourse}, "The course was created successfully"));
});

const updateCourse = asyncHandler(async(req, res) => {
    const {id, ...rest} = req.body;

    if(!id) return res.status(200).json(new ApiResponse(400, {success: false}, "Invalid course id"));

    const course = await Course.findById(id);

    if(!(course && !course.isDeleted)) return res.status(200).json(new ApiResponse(400, {success: false}, "Course not found"));

    const updatedCourse = await Course.findByIdAndUpdate(id, {...rest}, {new: true});

    if(!updateCourse) return res.status(200).json(new ApiResponse(400, {success: false}, "The course was not updated"));

    return res.status(200).json(new ApiResponse(200, {success: true, data : updatedCourse}, "The course was updated successfully"));
});

const deleteCourse = asyncHandler(async(req, res) => {
    const {id} = req.body;

    if(!id) return res.status(200).json(new ApiResponse(400, {success: false}, "Invalid course id"));

    const course = await Course.findById(id);

    if(!(course && !course.isDeleted)) return res.status(200).json(new ApiResponse(400, {success: false}, "Course not found"));

    const deletedCourse = await Course.findByIdAndUpdate(id, {isDeleted : true}, {new: true});

    if(!deleteCourse) return res.status(200).json(new ApiResponse(400, {success: false}, "The course was not deleted"));

    return res.status(200).json(new ApiResponse(200, {success: true}, "The course was deleted successfully"));    
})

export {createCourse, updateCourse, deleteCourse};
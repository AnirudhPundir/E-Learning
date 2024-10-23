import mongoose from "mongoose";
import { Course } from "../../models/course.models.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const getAllCourses = asyncHandler(async (req, res) => {

    const courses = await Course.find({ isDeleted: false }).select("-isDeleted");

    if (!courses || courses.length === 0) {
        return res.status(200).json(new ApiResponse(404, { success: false }, "No courses found"));
    }

    return res.status(200).json(new ApiResponse(200, { success: true, data: courses }, "Courses fetched successfully"));
});

const getCourseSections = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!courseId) {
        return res.status(200).json(new ApiResponse(400, { success: false }, "Course ID is required"));
    }

    const sections = await Course.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(courseId), isDeleted: false } },
        {
            $lookup: {
                from: 'sections', // Assuming the collection name for sections
                localField: '_id',
                foreignField: 'courseId',
                as: 'sections'
            }
        },
        {
            $unwind: {
                path: '$sections',
                preserveNullAndEmptyArrays: true // To keep courses without sections
            }
        },
        { $match: { 'sections.isDeleted': false } }, // Only bring sections that are not deleted
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                sections: '$sections'
            }
        }
    ]);

    if (!sections || sections.length === 0) {
        return res.status(200).json(new ApiResponse(404, { success: false }, "No sections found for this course"));
    }

    return res.status(200).json(new ApiResponse(200, { success: true, data: sections }, "Course sections fetched successfully"));
});

const getCourseContents = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!courseId) {
        return res.status(200).json(new ApiResponse(400, { success: false }, "Course ID is required"));
    }

    const generateLookups = (fields) => {
        return fields.map(field => ({
            from: field.modelName,
            localField: '_id',
            foreignField: field.foreignField,
            as: field.modelName
        }));
    };

    const lookupFields = [
        { foreignField: 'courseId', modelName: 'videos' },
        { foreignField: 'courseId', modelName: 'assignments' },
        { foreignField: 'courseId', modelName: 'mcqs' }
    ];

    const lookups = generateLookups(lookupFields);


    const sections = await Course.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(courseId), isDeleted: false } },
        {
            $lookup: {
                from: 'sections', // Assuming the collection name for sections
                localField: '_id',
                foreignField: 'courseId',
                as: 'sections',
                pipeline: [
                    { $match: { isDeleted: false } } // Check for sections that are not deleted
                ]
            }
        },
        {
            $unwind: {
                path: '$sections',
                preserveNullAndEmptyArrays: true // To keep courses without sections
            }
        },
        {
            $lookup: {
                from: 'videos', // Assuming the collection name for videos
                localField: 'sections._id',
                foreignField: 'sectionId',
                as: 'sections.videos',
                pipeline: [
                    { $match: { isDeleted: false } }, // Check for videos that are not deleted
                    { $project: { _id: 1, videoName: 1, sectionIndex: 1, videoId: 1, description: 1 } } // Project required fields
                ]
            }
        },
        {
            $lookup: {
                from: 'assignments', // Assuming the collection name for assignments
                localField: 'sections._id',
                foreignField: 'sectionId',
                as: 'sections.assignments',
                pipeline: [
                    { $match: { isDeleted: false } },
                    { $match: { isDeleted: false } },
                    {
                        $project: {
                            _id: 1,
                            assignmentName: 1,
                            assignmentTask: 1,
                            assignmentId: 1,
                            documentType: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: 'mcqs', // Assuming the collection name for MCQs
                localField: 'sections._id',
                foreignField: 'sectionId',
                as: 'sections.mcqs',
                pipeline: [
                    { $match: { isDeleted: false } }, // Check for MCQs that are not deleted
                    {
                        $project: {
                            _id: 1,
                            question: 1,
                            options: 1,
                            answer: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                sections: {
                    _id: '$sections._id',
                    title: '$sections.title',
                    contents: {
                        videos: '$sections.videos',
                        assignments: '$sections.assignments',
                        mcqs: '$sections.mcqs'
                    }
                }
            }
        }
    ]);

    if (!sections || sections.length === 0) {
        return res.status(200).json(new ApiResponse(404, { success: false }, "No sections found for this course"));
    }

    return res.status(200).json(new ApiResponse(200, { success: true, data: sections }, "Course sections with contents fetched successfully"));
});

const getCourseDetails = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!courseId) {
        return res.status(200).json(new ApiResponse(400, { success: false }, "Course ID is required"));
    }

    const course = await Course.findOne({ _id: courseId, isDeleted: false });

    if (!course) {
        return res.status(200).json(new ApiResponse(404, { success: false }, "Course not found or has been deleted"));
    }

    return res.status(200).json(new ApiResponse(200, { success: true, data: course }, "Course details fetched successfully"));
});


export { getAllCourses, getCourseContents, getCourseSections, getCourseDetails };

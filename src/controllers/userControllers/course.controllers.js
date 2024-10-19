import { Course } from "../../models/course.models";
import { ApiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

const getAllCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find({ isDeleted: false });

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
        { $match: { _id: mongoose.Types.ObjectId(courseId), isDeleted: false } },
        {
            $lookup: {
                from: 'sections', // Assuming the collection name for sections
                localField: '_id',
                foreignField: 'course_id',
                as: 'sections'
            }
        },
        {
            $unwind: {
                path: '$sections',
                preserveNullAndEmptyArrays: true // To keep courses without sections
            }
        },
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
        { foreignField: 'course_id', modelName: 'videos' },
        { foreignField: 'course_id', modelName: 'assignments' },
        { foreignField: 'course_id', modelName: 'mcqs' }
    ];

    const lookups = generateLookups(lookupFields);

    
    const sections = await Course.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(courseId), isDeleted: false } },
        {
            $lookup: {
                from: 'sections', // Assuming the collection name for sections
                localField: '_id',
                foreignField: 'course_id',
                as: 'sections'
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
                foreignField: 'section_id',
                as: 'sections.videos'
            }
        },
        {
            $lookup: {
                from: 'assignments', // Assuming the collection name for assignments
                localField: 'sections._id',
                foreignField: 'section_id',
                as: 'sections.assignments'
            }
        },
        {
            $lookup: {
                from: 'mcqs', // Assuming the collection name for MCQs
                localField: 'sections._id',
                foreignField: 'section_id',
                as: 'sections.mcqs'
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

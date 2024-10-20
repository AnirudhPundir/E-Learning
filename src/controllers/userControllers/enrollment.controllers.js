import { Course } from "../../models/course.models.js";
import Enrollment from "../../models/enrollment.models.js";
import { ApiResponse } from "../../utils/apiResponse.js";


const enrollUserInCourse = asyncHandler(async (req, res) => {
    const {courseId } = req.body;

    const userId = req.data._id;

    if (!userId || !courseId) {
        return res.status(200).json(new ApiResponse(400, { success: false }, "User ID and Course ID are required"));
    }

    const courseExists = await Course.findById(courseId);

    if (!courseExists || courseExists.isDeleted) {
        return res.status(200).json(new ApiResponse(404, { success: false }, "Course not found or has been deleted"));
    }

    const enrollment = await Enrollment.create({ student_id: userId, course_id: courseId });

    if (!enrollment) {
        return res.status(200).json(new ApiResponse(400, { success: false }, "Enrollment failed"));
    }

    return res.status(200).json(new ApiResponse(200, { success: true, data: enrollment }, "User enrolled successfully"));
});

const getUserEnrolledCourses = asyncHandler(async (req, res) => {
    const userId = req.data._id;

    if (!userId) {
        return res.status(200).json(new ApiResponse(400, { success: false }, "User ID is required"));
    }

    const enrollments = await Enrollment.aggregate([
        { $match: { student_id: userId } },
        {
            $lookup: {
                from: 'courses', // The name of the Course collection
                localField: 'course_id',
                foreignField: '_id',
                as: 'courseDetails'
            }
        },
        { $unwind: '$courseDetails' } // Optional: Unwind if you want a flat structure
    ]);

    if (!enrollments || enrollments.length === 0) {
        return res.status(200).json(new ApiResponse(404, { success: false }, "No courses found for this user"));
    }

    return res.status(200).json(new ApiResponse(200, { success: true, data: enrollments }, "User's enrolled courses fetched successfully"));
});

const deleteEnrollment = asyncHandler(async (req, res) => {
    const { enrollmentId } = req.params;

    if (!enrollmentId) {
        return res.status(200).json(new ApiResponse(400, { success: false }, "Enrollment ID is required"));
    }

    const enrollment = await Enrollment.findByIdAndDelete(enrollmentId);

    if (!enrollment) {
        return res.status(200).json(new ApiResponse(404, { success: false }, "Enrollment not found"));
    }

    return res.status(200).json(new ApiResponse(200, { success: true }, "Enrollment deleted successfully"));
});

const updateCourseCompletion = asyncHandler(async (req, res) => {
    const { completionStatus, enrollmentId } = req.body;

    if (!enrollmentId) {
        return res.status(200).json(new ApiResponse(400, { success: false }, "Enrollment ID is required"));
    }

    if (completionStatus === undefined) {
        return res.status(200).json(new ApiResponse(400, { success: false }, "Completion status is required"));
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
        enrollmentId,
        { completion_status: completionStatus },
        { new: true }
    );

    if (!enrollment) {
        return res.status(200).json(new ApiResponse(404, { success: false }, "Enrollment not found"));
    }

    return res.status(200).json(new ApiResponse(200, { success: true, data: enrollment }, "Course completion status updated successfully"));
});


export { enrollUserInCourse, getUserEnrolledCourses, deleteEnrollment, updateCourseCompletion};

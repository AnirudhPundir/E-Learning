import mongoose from "mongoose";
import { Course } from "../../models/course.models.js";
import { Section } from "../../models/section.models.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";


const addSection = asyncHandler(async (req, res) => {

    const { courseId, sectionName, sectionDetails } = req.body;

    if (!courseId) return res.status(200).json(new ApiResponse(400, { success: false }, "Invalid Course Id"));

    const course = await Course.findById(courseId);

    if (!(course && !course.isDeleted)) return res.status(200).json(new ApiResponse(400, { success: false }, "Course not found"));

    if (!sectionName || !sectionDetails) return res.status(200).json(new ApiResponse(400, { success: false }, "Invalid input"));

    const sectionExits = await Section.find({ courseId, isDeleted: false, sectionName });

    if (sectionExits && sectionExits.length > 0) return res.status(200).json(new ApiResponse(400, { success: false }, 'Section already exists'));

    const section = await Section.create({ courseId, sectionName, sectionDetails });

    if (!section) return res.status(200).json(new ApiResponse(400, { success: false }, "Section was not created"));

    return res.status(200).json(new ApiResponse(200, { success: true, data: section }, "Section was created successfully"));
});

const updateSection = asyncHandler(async (req, res) => {

    const { sectionId, ...rest } = req.body;

    if (!sectionId) return res.status(200).json(new ApiResponse(400, { success: false }, 'Section Id is missing'));

    if (!rest) return res.status(200).json(new ApiResponse(400, { success: false }, "Invalid input"));

    const section = await Section.findById(sectionId);

    if (!(section && !section.isDeleted)) return res.status(200).json(new ApiResponse(404, { success: false }, "Section was not found"));

    const updateSection = await Section.findByIdAndUpdate(sectionId, { ...rest }, { new: true });

    if (!updateSection) return res.status(200).json(new ApiResponse(400, { success: false }, "Section was not updated successfully"));

    return res.status(200).json(new ApiResponse(200, { success: true, data: section }, "Section was updated successfully"));
});

const deleteSection = asyncHandler(async (req, res) => {

    const { sectionId } = req.body;

    if (!sectionId) return res.status(200).json(new ApiResponse(400, { success: false }))

    const section = await Section.findById(sectionId);

    if (!(section && !section.isDeleted)) return res.status(200).json(new ApiResponse(404, { success: false }, "Section was not found"));

    const deletedSection = await Section.findByIdAndUpdate(sectionId, { isDeleted: true });

    if (!deletedSection) return res.status(200).json(new ApiResponse(400, { successs: false }, "Section was not deleted"));

    return res.status(200).json(new ApiResponse(200, { success: true }, "Section was deleted successfully"));
});

const fetchAllSectionsDetails = asyncHandler(async (req, res) => {

    const { courseId } = req.body;

    if (!courseId) return res.status(200).json(new ApiResponse(400, { success: false }, "Invalid course id"));

    const course = await Course.findById(courseId);

    if (!(course && !course.isDeleted)) return res.status(200).json(new ApiResponse(400, { success: false }, "Course not found"));

    const sections = await Section.find({ courseId, isDeleted: false }).select("-isDeleted");

    if (!sections || sections.length === 0) return res.status(200).json(new ApiResponse(400, { success: false }, "No sections were found"));

    return res.status(200).json(new ApiResponse(200, { success: true, data: sections }, "All the sections were fetched"));
});

const fetchSectionContentByID = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!id) return res.status(200).json(new ApiResponse(400, { success: false }, 'Section Id is missing'));

    const section = await Section.findById(id);

    if (!(section && !section.isDeleted)) return res.status(200).json(new ApiResponse(404, { success: false }, "Section was not found"));

    const sectionContent = await Section.aggregate([{
        $match: { _id: new mongoose.Types.ObjectId(id) },
    }, {
        $lookup: {
            from: 'mcqs',
            localField: '_id',
            foreignField: 'sectionId',
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $eq: ['$isDeleted', false]
                        }
                    }
                }
            ],
            as: 'MCQs'
        }
    }]);

    if (!sectionContent || sectionContent.length === 0) return res.status(200).json(new ApiResponse(400, { success: false }, 'Section was empty'));

    return res.status(200).json(new ApiResponse(200, { success: true, data: sectionContent }, 'Section content was fetched successfully'));

});

export { addSection, updateSection, deleteSection, fetchAllSectionsDetails, fetchSectionContentByID };


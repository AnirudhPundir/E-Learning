import { asyncHandler } from "../utils/asyncHandler.js";
import { Section } from "../models/section.models.js"
import Mcq from "../models/mcq.models.js";
import { ApiResponse } from "../utils/apiResponse.js";

const addMCQ = asyncHandler(async (req, res) => {

    const { sectionId, question, options, answer } = req.body;

    if (!sectionId) return res.status(200).json(new ApiResponse(400, { success: false }, "Incorrect Input"));

    if (!question || !options || options.length === 0) return res.status(200).json(new ApiResponse(400, { success: false }, "Invalid Input"));


    const section = await Section.findById(sectionId);

    if (!(section && !section.isDeleted)) return res.status(200).json(new ApiResponse(404, { success: false }, "Section not found"));

    const mcqExists = await Mcq.exists({ isDeleted: false, question });

    if (mcqExists) return res.status(200).json(new ApiResponse(400, { success: false }, "MCQ already exists"));

    const mcq = await Mcq.create({ sectionId, question, options, answer });

    if (!mcq) return res.status(200).json(new ApiResponse(400, { success: false }, "MCQ not created"));

    return res.status(200).json(new ApiResponse(200, { success: false, data: mcq }, "MCQ created successfully"));

});

const updateMCQ = asyncHandler(async (req, res) => {

    const { id, ...rest } = req.body;

    if (!rest) return res.status(200).json(new ApiResponse(400, { success: false }, "Incorrect Input"));

    const mcqExists = await Mcq.exists({ _id: id });

    if (!mcqExists) return res.status(200).json(new ApiResponse(404, { success: false }, "MCQ not foubd"));

    const mcq = await Mcq.findByIdAndUpdate(id, { ...rest }, { new: true }).select("-isDeleted");

    if (!mcq) return res.status(200).json(new ApiResponse(400, { success: false }, "MCQ not updated"));

    return res.status(200).json(new ApiResponse(200, { success: true, data: mcq }, "MCQ was updated"));
});

const deleteMCQ = asyncHandler(async (req, res) => {

    const { id } = req.body;

    if (!id) return res.status(200).json(new ApiResponse(400, { success: false }, "Invalid Input"));

    const mcqExists = await Mcq.exists({ _id: id });

    if (!mcqExists) return res.status(200).json(new ApiResponse(404, { success: false }, "MCQ not foubd"));

    const mcq = await Mcq.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    if (!mcq) return res.status(200).json(new ApiResponse(400, { success: false }, "MCQ not deleted"));

    return res.status(200).json(new ApiResponse(200, { success: true }, "MCQ deleted successfully"));
});

const fetchMCQById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!id) return res.status(200).json(new ApiResponse(400, { success: false }, "Invalid Input"));

    const mcq = await Mcq.find({ _id: id, isDeleted: false });

    if (!mcq || mcq.length === 0) return res.status(200).json(new ApiResponse(404, { success: false }, "MCQ not found"));

    return res.status(200).json(new ApiResponse(200, { success: true, data: mcq }, "MCQ fetched successfully"));
});

const fetchMCQBySection = asyncHandler(async (req, res) => {

    const { sectionId } = req.body;

    if (!sectionId) return res.status(200).json(new ApiResponse(400, { success: false }, "Invalid Input"));

    const mcq = await Mcq.find({ sectionId, isDeleted: false });

    if (!mcq || mcq.length === 0) return res.status(200).json(new ApiResponse(404, { success: false }, "MCQ not found"));

    return res.status(200).json(new ApiResponse(200, { success: true, data : mcq }, "Fetched MCQ successfully"));
});

export { addMCQ, updateMCQ, deleteMCQ, fetchMCQById, fetchMCQBySection };
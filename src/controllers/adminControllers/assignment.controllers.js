import mongoose from "mongoose";
import mongodb from 'mongodb';
import fs from 'fs'
import { Assignment } from "../../models/assignment.models.js";
import { Section } from "../../models/section.models.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";


const uploadAssignment = asyncHandler(async (req, res) => {
  const fileName = req.file && req.file.filename;

  if (!fileName)
    return res
      .status(200)
      .json(
        new ApiResponse(400, { success: false }, "Assignment was not uploaded")
      );

  const { assignmentName, assignmentTask, documentType, sectionId } = req.body;

  if (
    [assignmentName, assignmentTask, documentType, sectionId].some(
      (field) => field?.trim() === ""
    )
  ) {
    return res
      .status(200)
      .json(
        new ApiResponse(400, { success: false }, "All fields are required")
      );
  }

  const section = await Section.findById(sectionId, { isDeleted: false });
  if (!section) {
    return res
      .status(200)
      .json(new ApiResponse(400, { success: false }, "Section not found"));
  }

  // Check if an assignment with the same name already exists
  const existingAssignment = await Assignment.findOne({
    assignmentName,
    isDeleted: false,
  });

  if (existingAssignment) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          400,
          { success: false },
          "Assignment with the same name already exists"
        )
      );
  }

  const db = mongoose.connection.db;
  const bucket = new mongodb.GridFSBucket(db, { bucketName: 'uploads' });

  const fileStream = fs.createReadStream(`public/temp/${fileName}`)
    .pipe(bucket.openUploadStream(fileName, {
      chunkSizeBytes: 1048576,
      metadata: { field: 'myField', value: 'myValue' }
    }));

  if (!fileStream) {
    return res.status(200).json(new ApiResponse(400, { success: false }, "Assignment was not uploaded"));
  }

  const newAssignment = await Assignment.create({
    assignmentName,
    assignmentTask,
    documentType,
    sectionId, // Adding sectionId to the new assignment
    assignmentId: fileStream.id.toString(), // Storing the file stream id as assignmentId
  });

  if (!newAssignment)
    return res
      .status(200)
      .json(
        new ApiResponse(400, { success: false }, "Assignment was not created")
      );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { success: true, data: newAssignment },
        "Assignment uploaded successfully"
      )
    );
});

const getAssignmentById = asyncHandler(async (req, res) => {
    const { id: assignmentId } = req.params;

    if (!assignmentId) {
        return res.status(200).json(new ApiResponse(400, { success: false }, "Invalid assignment ID"));
    }

    const assignment = await Assignment.findById(assignmentId, { isDeleted: false });

    if (!assignment) {
        return res.status(200).json(new ApiResponse(404, { success: false }, "Assignment not found"));
    }

    return res.status(200).json(new ApiResponse(200, { success: true, data: assignment }, "Assignment fetched successfully"));
});

const getAssignmentsBySectionId = asyncHandler(async (req, res) => {
    const { sectionId } = req.params;

    if (!sectionId) {
        return res.status(200).json(new ApiResponse(400, { success: false }, "Invalid section ID"));
    }

    const sectionExists = await Section.findById(sectionId, {isDeleted: false}); // Assuming Section is the model for sections

    if (!sectionExists) {
        return res.status(200).json(new ApiResponse(404, { success: false }, "Section not found"));
    }

    const assignments = await Assignment.find({ sectionId, isDeleted: false });

    if (!assignments || assignments.length === 0) {
        return res.status(200).json(new ApiResponse(404, { success: false }, "No assignments found for this section"));
    }

    return res.status(200).json(new ApiResponse(200, { success: true, data: assignments }, "Assignments fetched successfully"));
});

const updateAssignment = asyncHandler(async (req, res) => {
    const { assignmentId, ...rest } = req.body;

    if (!assignmentId) {
        return res.status(200).json(new ApiResponse(400, { success: false }, "Invalid assignment ID"));
    }

    if (!rest || Object.keys(rest).length === 0) {
        return res.status(200).json(new ApiResponse(400, { success: false }, "No fields provided for update"));
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment || assignment.isDeleted) {
        return res.status(200).json(new ApiResponse(404, { success: false }, "Assignment not ˳°found"));
    }

    // Update fields if provided

    const { assignmentName, assignmentTask } = rest;
    if (assignmentName) assignment.assignmentName = assignmentName;
    if (assignmentTask) assignment.assignmentTask = assignmentTask;

    const updatedAssignment = await assignment.save();

    return res.status(200).json(new ApiResponse(200, { success: true, data: updatedAssignment }, "Assignment updated successfully"));
});

const deleteAssignment = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;

    if (!assignmentId) {
        return res.status(200).json(new ApiResponse(400, { success: false }, "Invalid assignment ID"));
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment || assignment.isDeleted) {
        return res.status(200).json(new ApiResponse(404, { success: false }, "Assignment not found"));
    }

    assignment.isDeleted = true; // Mark the assignment as deleted
    await assignment.save();

    return res.status(200).json(new ApiResponse(200, { success: true }, "Assignment deleted successfully"));
});

const downloadAssignmentV1 = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;

    if (!assignmentId) {
        return res.status(200).json(new ApiResponse(400, { success: false }, "Invalid assignment ID"));
    }
    const db = mongoose.connection.db;

    const assignment = await db.collection('uploads.files').findOne(new mongoose.Types.ObjectId(assignmentId));

    if (!assignment) {
        return res.status(200).json(new ApiResponse(404, { success: false }, "Assignment not found"));
    }

    const assignmentConfig = {
        size: assignment.length,
        start: 0,
        end: assignment.length - 1

    }

    const headers = {
        "Content-Range": `bytes ${assignmentConfig.start}-${assignmentConfig.end}/${assignmentConfig.Size}`,
        "Accept-Ranges": "bytes",
        "Content-length": assignmentConfig.end - assignmentConfig.start + 1,
        "Content-Type": "video/mp4"
    };

    res.writeHead(206, headers);
    const bucket = new mongodb.GridFSBucket(db, { bucketName: 'uploads' });
    const downloadStream = bucket.openDownloadStreamByName(assignment.filename, {
        start: assignmentConfig.start, end: assignmentConfig.end
    });

    downloadStream.pipe(res);
});

const downloadAssignment = asyncHandler(async (req, res) => {q
    const { assignmentId } = req.params;

    if (!assignmentId) {
        return res.status(200).json(new ApiResponse(400, { success: false }, "Invalid assignment ID"));
    }

    const db = mongoose.connection.db;
    const assignment = await db.collection('uploads.files').findOne({ _id: new mongoose.Types.ObjectId(assignmentId) });

    if (!assignment) {
        return res.status(200).json(new ApiResponse(404, { success: false }, "Assignment not found"));
    }

    const bucket = new mongodb.GridFSBucket(db, { bucketName: 'uploads' }).open;
    const downloadStream = bucket.openDownloadStream(assignment._id);


    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${assignment.filename}"`,
    });

    downloadStream.on('error', (error) => {
        return res.status(200).json(new ApiResponse(500, { success: false }, "Error downloading the file"));
    });

    downloadStream.pipe(res);
});

export { uploadAssignment, getAssignmentById, getAssignmentsBySectionId, updateAssignment, deleteAssignment, downloadAssignment };

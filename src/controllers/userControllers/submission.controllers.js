import Submission from "../../models/submission.models.js";

export const createSubmission = async (req, res) => {
    try {
        const { assignment_id, student_id, fileId } = req.body;

        const newSubmission = new Submission({
            assignment_id,
            student_id,
            fileId
        });

        await newSubmission.save();
        return res.status(201).json({ message: "Submission created successfully", submission: newSubmission });
    } catch (error) {
        return res.status(500).json({ message: "Error creating submission", error: error.message });
    }
};








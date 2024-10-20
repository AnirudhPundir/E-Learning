import mongoose, { Schema } from "mongoose";

const submissionSchema = new mongoose.Schema({
  assignment_id: {
    type: Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  student_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  submitted_at: { type: Date, default: Date.now }, 
  fileId: {
    type: Schema.Types.ObjectId,
    ref: "upload.files",
    required: true,
  }, 
  grade: { type: Number, default: null }
});

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;

import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  enrollment_date: { type: Date, default: Date.now },
  completion_status: {
    type: Number,
    default: 0,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;

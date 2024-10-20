import mongoose, { Schema } from "mongoose";

const assignmentSchemma = new Schema({
    assignmentName : {
        type : String,
        required : true
    },
    assignmentTask : {
        type : String,
        required : true
    },
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "upload.files",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    }
}, {timestamps : true});

export const assignment = mongoose.model("Assignment", assignmentSchemma);

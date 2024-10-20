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
    documentType: {
      type: String,
      enum: {
        values: ['question', 'answer'],
        message: '{VALUE} is not a valid document type'
      },  
      required: true
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "Section", // Assuming Section is the model for sections
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
    }
}, {timestamps : true});

export const Assignment = mongoose.model("Assignment", assignmentSchemma);

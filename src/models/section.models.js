import mongoose, { Schema } from "mongoose";

const sectionSchemma = new Schema({
    sectionName : {
        type : String,
        required : true,
        trim : true
    },
    courseId: {
        type : Schema.Types.ObjectId,
        ref : "Course",
        required: true
    },
    sectionDetails : {
        type : String,
        required : true
    },
    isDeleted : {
        type: Boolean,
        default: false,
        required: true
    }
}, {timestamps: true});


export const Section = mongoose.model("Section", sectionSchemma);
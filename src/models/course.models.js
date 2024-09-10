import mongoose, { Schema } from "mongoose";

const courseSchemma = new Schema({
    courseName : {
        type : String,
        required : true,
        trim : true,
        unique : true
    },
    courseDetails : {
        type : String,
        required : true   
    },
    instructorName : {
        type : String
    },
    price : {
        type : String,
        default : "Free"
    },
    isDeleted : {
        type : Boolean,
        default: false
    }
}, { timeseries: true });

export const Course = mongoose.model("Course", courseSchemma);
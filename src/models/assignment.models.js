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
    assignmentSolution : {
        type : String,
        required : true
    },
    completed : {
        type : Boolean,
        default : false
    }
}, {timestamps : true});

export const assignment = mongoose.model("Assignment", assignmentSchemma);
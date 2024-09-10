import mongoose, { Schema } from "mongoose";

const mcqSchemma = new Schema({
    sectionId : {
        type: Schema.Types.ObjectId,
        ref: "Section",
        required: true
    },
    question: {
        type: String,
        required: true,
    },
    options: [{
        type: String,
        required: true
    }],
    answer: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


const Mcq = mongoose.model("MCQ", mcqSchemma);

export default Mcq;

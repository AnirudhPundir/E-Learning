import mongoose, { Schema } from "mongoose";

const videoLectureSchemma = new Schema({
    sectionId: {
        type: Schema.Types.ObjectId,
        ref: "Section"
    },
    videoName: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    sectionIndex: {
        type: Number,
        required: true
    }
}, { timestamps: true });

export const Video = mongoose.model("Video", videoLectureSchemma);
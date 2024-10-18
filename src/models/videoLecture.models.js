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
    sectionIndex: {
        type: Number,
        required: true
    },
    videoId: {
        type: Schema.Types.ObjectId,
        ref: "Uploads.files"
    },
    description: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Video = mongoose.model("Video", videoLectureSchemma);
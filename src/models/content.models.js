import mongoose, { Schema } from "mongoose";

const contentSchemma = new Schema({
    contentType : {
        type : "String",
        required : true
    },
    section_id : {
        type : Schema.Types.ObjectId,
        required : true
    }
}, {timestamps : true});

export const content = mongoose.model("Content", contentSchemma);
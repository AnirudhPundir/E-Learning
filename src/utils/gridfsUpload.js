import mongoose from "mongoose";
import mongodb from "mongodb";
import fs from "fs";

const gridfsUpload = (fileName) => {
    const db = mongoose.connection.db;

    const bucket = new mongodb.GridFSBucket(db, { bucketName: 'uploads' });

    const file = fs.createReadStream(`public/temp/${fileName}`).
        pipe(bucket.openUploadStream(fileName, {
            chunkSizeBytes: 1048576,
            metadata: { field: 'myField', value: 'myValue' }
        }));

    return file;
}

export default gridfsUpload;
import mongoose from "mongoose";
import { dbName } from "../constants.js";

const connectDb = async() => {
    try {
        const connectInstance = await mongoose.connect(`${process.env.MONGODB_URI}${dbName}`);
        console.log(`\n MONGO DB connected || DB HOST ${connectInstance.connection.host}`);
    } catch (error) {
        console.log(`MONGODB CONNECTION ERR ${error}`);
        process.exit(1);
    }
} 

export default connectDb;
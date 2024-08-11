import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const adminSchemma = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    role: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String
    }
}, {timestamps: true});

adminSchemma.pre("save", async function(next){
    if(this.isModified("password")) this.password = await bcrypt.hash(this.password, 10);
    next();
});

adminSchemma.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
};

adminSchemma.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullName: this.fullName
    }, 
    process.env.ACCESS_TOKEN_SECRET, 
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
};

adminSchemma.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullName: this.fullName
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
);
};

export const Admin = mongoose.model("Admin", adminSchemma);

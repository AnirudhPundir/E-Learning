import mongoose, { Schema } from "mongoose";
import brcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const userSchemma = new Schema({
    userName: {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },
    email: {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true
    },
    phone: {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        match: [/^\+?\d{10,15}$/, 'Please enter a valid phone number']
    },
    fullName: {
        type : String,
        required : true,
        trim : true,
        index : true
    },
    avatar : {
        type : String,
    },
    password : {
        type : String,
        required: [true, "Password is required"]
    },
    isDeleted: {
        type: Boolean,
        required: true
    },
    refreshToken : {
        type : String
    }
}, {timestamps: true});

userSchemma.pre("save", async function(next){
    if(this.isModified('password')) this.password = await brcrypt.hash(this.password, 10);
    next();
});

userSchemma.methods.isPasswordCorrect = async function(password){
    return await brcrypt.compare(password, this.password);
}

userSchemma.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET_USER,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY_USER
    });
}

userSchemma.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
    process.env.REFRESH_TOKEN_SECRET_USER,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY_USER
    });
}

userSchemma.methods.removePasswordAndRefreshToken = function(){
    const userData = this.toObject();
    const {password, refreshToken, ...rest} = userData; 
    return rest;
}

export const User = mongoose.model("User", userSchemma);
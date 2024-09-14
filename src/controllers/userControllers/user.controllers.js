import { asyncHandler } from "../../utils/asyncHandler.js";
import {ApiResponse} from "../../utils/apiResponse.js";
import { User } from "../../models/user.models.js";
import { cookieConfig } from "../../constants.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async(user) => {
    try{
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        user.save({validateBeforeSave: false});
        return({accessToken, refreshToken});
    }
    catch(err){
        res.status(200).json( new ApiResponse(500, {success: false}, "Access and Refresh tokens weren't generated"));
    }
}

export const registerUser = asyncHandler(async(req, res) => {
    const {userName, fullName, email, phone, password} = req.body;

    if([userName, fullName, email, phone, password].some(field => field?.trim() === "")) res.status(200).json( new ApiResponse(400, {success: false}, "Incorrect payload"));

    //user's existence
    const userExisted = await User.findOne({
        $or : [{email}, {phone}]
    }); 

    if(userExisted && !userExisted.isDeleted) res.status(200).json( new ApiResponse(400, {success: false}, "User already exists"));

    const user = await User.create({userName, fullName, email, phone, password, isDeleted: false});

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser) res.status(200).json( new ApiResponse(400, {success: false}, "User was not created"));

    return res.status(200).json(new ApiResponse(200, {success: true, data: createdUser}, "User created successfully"));
});

export const loginUser = asyncHandler(async(req, res) => {

    const {userName, email, password} = req.body;

    if(!(userName || email)) res.status(200).json( new ApiResponse(400, {success: false}, "Email or Username is N/A"));

    if(!password) res.status(200).json( new ApiResponse(400, {success: false}, "Password is N/A"));

    const userExists = await User.findOne({
        $or : [{userName}, {email}]
    });

    if(!userExists) res.status(200).json( new ApiResponse(400, {success: false}, "User name or email is invalid"));

    const isPasswordCorrect = await userExists.isPasswordCorrect(password);

    if(!isPasswordCorrect) res.status(200).json( new ApiResponse(400, {success: false}, "Password is incorrect"));
    
    //Fetch token first then remove the password
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(userExists);  

    const user = await userExists.removePasswordAndRefreshToken();

    return res.status(200).cookie("accessToken", accessToken, cookieConfig).cookie("refreshToken", refreshToken, cookieConfig).json(new ApiResponse(200, {success: true, data : {user, accessToken, refreshToken}}, "User was successfully logged In"));
});

export const logoutUser = asyncHandler(async(req, res) => {

    await User.findByIdAndUpdate(req.data._id, {$set: {refreshToken: ""}});

    return res.status(200).clearCookie("accessToken", cookieConfig).clearCookie("refreshToken", cookieConfig).json(new ApiResponse(200, {}, "User logged out"));
});

export const refreshAccessTokenUser = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookie?.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) res.status(200).json( new ApiResponse(400, {success: false}, "Refresh Token N/A"));

    const decodeToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET_USER);

    const user = await User.findById(decodeToken?._id);

    if(!user) res.status(200).json( new ApiResponse(400, {success: false}, "Incorrect Refresh Token"));

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user);

    res.status(200).cookie("accessToken", accessToken, cookieConfig).cookie("refreshToken", refreshToken, cookieConfig).json(new ApiResponse(200, {success: false, data: {accessToken, refreshToken}}, "Access Token refreshed"));
});

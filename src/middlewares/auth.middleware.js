import { collections } from "../models/collections.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const tokenSecrets = {
    admin : process.env.ACCESS_TOKEN_SECRET,
    user : process.env.ACCESS_TOKEN_SECRET_USER
};

export const verifyJWT = asyncHandler(async(req, res, next) => {
    try{    
        const token = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ", "");
        
        if(!token) throw new ApiError(401, "Unauthorized request");

        const userType = req.baseUrl.split(`\/`)[3];

        const decodeToken = jwt.verify(token, tokenSecrets[userType]);
        
        const data = await collections[userType].findById(decodeToken?._id).select("-password -refreshToken -isDeleted");
        
        if(!data) throw new ApiError(401, "Invalid Access token");

        req.data = data;

        next();
    }catch(err) {
        throw new ApiError(401, err?.message || "Invalid Access Token");
    }

});

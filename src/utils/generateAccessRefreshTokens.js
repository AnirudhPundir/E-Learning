import { ApiError } from "./apiError.js";

const generateAccessAndRefreshTokens = async(id, model) => {
    try{
        const admin = await model.findById(id);
        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();
        admin.refreshToken = refreshToken;
        admin.save({validateBeforeSave: false});
        return {accessToken, refreshToken};
    }
    catch(errr){
        throw new ApiError(500, `Tokens weren't generated ${errr.message}`);
    }
}

export default generateAccessAndRefreshTokens
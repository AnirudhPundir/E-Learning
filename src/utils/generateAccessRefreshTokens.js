import { ApiResponse } from "./apiResponse.js";

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
        resizeBy.status(200).json( new ApiResponse(500, {success: false}, `Tokens weren't generated ${errr.message}`));
    }
}

export default generateAccessAndRefreshTokens
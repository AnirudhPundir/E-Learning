import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/apiError.js"
import { Admin } from "../../models/admin.models.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { cookieConfig, SUPERADMIN } from "../../constants.js";
import generateAccessAndRefreshTokens from "../../utils/generateAccessRefreshTokens.js";

export const registerAdmin = asyncHandler(async (req, res) => {
    const { userName, fullName, email, phone, password, role = "admin" } = req.body;

    //validations
    if ([userName, fullName, email, password, role].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All Fields are required");
    }

    //Check if user already exists or not
    const adminExisted = await Admin.findOne({
        $or: [{ email }, { userName }]
    })

    if (adminExisted) throw new ApiError(400, "User already exists");

    //Create a record in the database
    const admin = await Admin.create({
        fullName, userName, email, phone, password, role
    });

    console.log("\n Admin created", Admin);
    const createdAdmin = await Admin.findById(admin._id).select("-password-refreshToken");

    if (!createdAdmin) throw new ApiError(400, "Admin wasn't registered");
    return res.status(200).json(new ApiResponse(200, createdAdmin, "Admin created successfully"));
});

export const loginAdmin = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body;

    //validations
    if (!(userName || email)) throw new ApiError(400, "Please insert the username or email");

    if (!password) throw new ApiError(400, "Please insert the password");

    //Check record's presence
    const admin = await Admin.findOne({
        $or: [{ userName }, { email }],
        isDeleted: false
    });

    if (!(admin && !admin.isDeleted)) throw new ApiError(404, "Admin not found");

    //Check password
    const isPasswordCorrect = await admin.isPasswordCorrect(password);

    if (!isPasswordCorrect) throw new ApiError(401, "Password is incorrect");

    //Capture tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin._id, Admin);

    const loggedInAdmin = await Admin.findById(admin?._id).select("-password -refreshToken -isDeleted");

    //Cookie creation

    return res.status(200).cookie("accessToken", accessToken, cookieConfig).cookie("refreshToken", refreshToken, cookieConfig).json(new ApiResponse(200, { admin: loggedInAdmin, accessToken, refreshToken }, "Admin logged in successfully"));
});

export const logoutAdmin = asyncHandler(async (req, res) => {
    const admin = await Admin.findByIdAndUpdate(req.data._id, { refreshToken: "" }, { new: true });
    console.log(admin);
    const cookieConfig = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", cookieConfig).clearCookie("refreshToken", cookieConfig).json(new ApiResponse(200, {}, "User logged out succesfully"));
});

export const updateAdmin = asyncHandler(async (req, res) => {

    if (!req.body) throw new ApiError(400, "Invalid input");

    const loggedInAdminRole = req.data?.role;

    const admin = await Admin.findById(req.body?.id);

    if (!(admin && !admin.isDeleted)) throw new ApiError(404, "Admin not not present")

    if (loggedInAdminRole === SUPERADMIN) {
        if (admin.role === SUPERADMIN) throw new ApiError(400, "Operation cannot be performed");

        const updatedAdmin = await Admin.findByIdAndUpdate(req.body?.id, {
            $set: req.body
        }, { new: true }).select("-password -refreshToken -isDeleted");

        if (!updatedAdmin) throw new ApiError(404, "Admin was not updated");

        return res.status(200).json(new ApiResponse(200, updatedAdmin, "Admin was updated successfully"));
    }

    if (!(admin.id === req.data?.id)) throw new ApiError(400, "Operation is not allowed");

    const updatedAdmin = await Admin.findByIdAndUpdate(req.data?.id, {
        $set: req.body
    }, { new: true }).select("-password -refreshToken -isDeleted");

    if (!updatedAdmin) throw new ApiError(400, "Admin was not updated");

    return res.status(200).json(new ApiResponse(200, updateAdmin, "Admin was updated successfully"));

});

export const deleteAdmin = asyncHandler(async (req, res) => {

    if (!req.body) throw new ApiError(400, "Invalid input");

    const loggedInAdminRole = req.data?.role;

    const admin = await Admin.findById(req.body?.id);

    if (!(admin && !admin.isDeleted)) throw new ApiError(404, "Admin not not present")

    if (loggedInAdminRole === SUPERADMIN) {
        if (admin.role === SUPERADMIN) throw new ApiError(400, "Operation cannot be performed");

        const updatedAdmin = await Admin.findByIdAndUpdate(req.body?.id, { $set: { isDeleted: true } });

        if (!updatedAdmin) throw new ApiError(404, "Admin was not deleted");

        return res.status(200).json(new ApiResponse(200, {}, "Admin was deleted successfully"));
    }

    if (!(admin.id === req.data?.id)) throw new ApiError(400, "Operation is not allowed");
    
    const updatedAdmin = await Admin.findByIdAndUpdate(req.body?.id, { $set: { isDeleted: true } });

    if (!updatedAdmin) throw new ApiError(400, "Admin was not deleted");

    return res.status(200).json(new ApiResponse(200, updateAdmin, "Admin was deleted successfully"));
});

export const getAdminDetails = asyncHandler(async (req, res) => {
    const { adminId } = req.params;

    const admin = await Admin.find({ _id: adminId, isDeleted: false }).select("-password -refreshToken -isDeleted");

    if (!(admin.length > 0)) throw new ApiError(404, "Admin data N/A");

    return res.status(200).json(new ApiResponse(200, admin, "Admin data fetched successfully"));
});

export const getAllAdmins = asyncHandler(async (req, res) => {
    const admin = await Admin.find({ isDeleted: false }).limit(50).select("-password -refreshToken -isDeleted");

    if (!admin) throw new ApiError(404, "Admin data N/A");

    return res.status(200).json(new ApiResponse(200, admin, "Admin data fetched successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookie?.refreshToken || req.body?.refreshToken;
        if (!incomingRefreshToken) throw new ApiError(401, "Refresh token N/A");

        // verify refreshtoken
        const decodeToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        //fetch user details from the token
        const admin = await Admin.findById(decodeToken?._id);

        if (!(admin && !admin.isDeleted)) throw new ApiError(401, 'Invalid Refresh Token');

        if (incomingRefreshToken !== admin?.refreshToken) throw new ApiError(401, 'Refresh token expired');

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin?._id, Admin);

        return res.status(200).cookie("accessToken", accessToken, cookieConfig).cookie("refreshToken", refreshToken, cookieConfig).json(new ApiResponse(200, { accessToken, refreshToken }, "Access token created"));
    }
    catch (err) {
        throw new ApiError(401, err?.message || "Invalid Refresh Token");
    }
});


import { Router } from "express";
import { deleteAdmin, getAdminDetails, getAllAdmins, loginAdmin, logoutAdmin, refreshAccessToken, registerAdmin, updateAdmin } from "../controllers/admin.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerAdmin);

router.route("/login").post(loginAdmin);

router.route("/logout").post(verifyJWT, logoutAdmin);

router.route("/update-admin-details").post(verifyJWT, updateAdmin);

router.route("/delete-admin").post(verifyJWT, deleteAdmin);

router.route("/get-admin-details/:adminId").get(verifyJWT, getAdminDetails);

router.route("/get-all-admins").get(verifyJWT, getAllAdmins);

router.route("/refresh-access-token").post(refreshAccessToken);

export default router;
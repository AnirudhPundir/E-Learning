import { Router } from "express";
import { loginUser, logoutUser, refreshAccessTokenUser, registerUser } from "../../controllers/userControllers/user.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.route("/register-user").post(registerUser);

router.route("/login-user").post(loginUser);

router.route("/logout-user").get(verifyJWT, logoutUser);

router.route("/refresh-user-access-token").post(refreshAccessTokenUser);

export default router;
import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { addSection, deleteSection, fetchAllSections, updateSection } from "../../controllers/adminControllers/section.controllers.js";

const router = Router();

router.route("/create-section").post(verifyJWT, addSection);

router.route("/update-section").post(verifyJWT, updateSection);

router.route("/remove-section").post(verifyJWT, deleteSection);

router.route("/fetch-all-sections").post(verifyJWT, fetchAllSections);

export default router;
import { Router } from "express";
import { addMCQ, deleteMCQ, fetchMCQById, fetchMCQBySection, updateMCQ } from "../controllers/adminControllers/mcq.controllers.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-MCQ").post(verifyJWT, addMCQ);

router.route("/update-MCQ").post(verifyJWT, updateMCQ);

router.route("/delete-MCQ").post(verifyJWT, deleteMCQ);

router.route("/fetch-MCQ-by-Id/:id").get(verifyJWT, fetchMCQById);

router.route("/fetch-MCQ-by-section").post(verifyJWT, fetchMCQBySection);

export default router;
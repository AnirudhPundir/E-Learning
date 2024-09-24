import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {uploadVideoLecture} from "../controllers/adminControllers/videoLecture.controllers.js";

const router = Router();

router.route("/handle-video-upload").post(verifyJWT, upload.single('video'), uploadVideoLecture);

export default router;
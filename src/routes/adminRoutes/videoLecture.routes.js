import { Router } from "express";
import { upload } from "../../middlewares/multer.middlewares.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getAllVideosBySectionId, getVideoDetailsById, streamVideo, updateVideoDetails, uploadVideoLecture } from "../../controllers/adminControllers/videoLecture.controllers.js";

const router = Router();


router.route("/upload-file").post(verifyJWT, upload.single('file'), uploadVideoLecture);

router.route("/get-all-files-details").get(verifyJWT, getAllVideos);

router.route("/get-videos-by-sectionId/:id").get(verifyJWT, getAllVideosBySectionId);

router.route("/update-video-details").post(verifyJWT, updateVideoDetails);

router.route("/get-video-details/:id").get(verifyJWT, getVideoDetailsById);

router.route("/delete-video/:id").get(verifyJWT, deleteVideo);

router.route("/stream-file/:id").get(streamVideo);

export default router;
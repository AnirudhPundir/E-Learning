import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { uploadAssignment, getAssignmentsBySectionId, getAssignmentById, updateAssignment, deleteAssignment, downloadAssignment } from "../../controllers/adminControllers/assignment.controllers.js";
import { upload } from "../../middlewares/multer.middlewares.js";

const router = Router();

router.route("/upload-assignment").post(verifyJWT, upload.single('file'), uploadAssignment);

router.route("/assignments").get(verifyJWT, getAssignmentsBySectionId);

router.route("/assignment/:id").get(verifyJWT, getAssignmentById);

router.route("/update-assignment").put(verifyJWT, updateAssignment);

router.route("/delete-assignment/:assignmentId").delete(verifyJWT, deleteAssignment);

router.route("/download-assignment/:assignmentId").get(verifyJWT, downloadAssignment);


export default router;
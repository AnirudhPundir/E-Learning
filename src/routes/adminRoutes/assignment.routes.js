import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { uploadAssignment, getAssignmentsBySectionId, getAssignmentById, updateAssignment, deleteAssignment, downloadAssignment } from "../../controllers/adminControllers/assignment.controllers.js";
import { createMulterUpload } from "../../middlewares/multer.middlewares.js";
import { pdfFileFilter } from "../../utils/fileFilters.js";

const router = Router();

const upload = createMulterUpload(pdfFileFilter); // Assuming fileFilter is defined for assignment uploads

router.route("/upload-assignment").post(verifyJWT, upload.single('file'), uploadAssignment);

router.route("/assignmentsnySectionId/:sectionId").get(verifyJWT, getAssignmentsBySectionId);

router.route("/assignment/:id").get(verifyJWT, getAssignmentById);

router.route("/update-assignment").post(verifyJWT, updateAssignment);

router.route("/delete-assignment/:assignmentId").delete(verifyJWT, deleteAssignment);

router.route("/download-assignment/:assignmentId").get(verifyJWT, downloadAssignment);


export default router;
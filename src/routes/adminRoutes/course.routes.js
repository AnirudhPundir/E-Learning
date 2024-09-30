import { Router } from "express"
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { createCourse, deleteCourse, fetchAllCourses, fetchCourseDetailsById, updateCourse } from "../../controllers/adminControllers/course.controllers.js";

const router = Router();

router.route("/create-course").post(verifyJWT, createCourse);

router.route("/update-course-details").post(verifyJWT, updateCourse);

router.route("/delete-course").post(verifyJWT, deleteCourse);

router.route("/fetch-course-by-id/:id").get(verifyJWT, fetchCourseDetailsById);

router.route("/fetch-all-courses").get(verifyJWT, fetchAllCourses);

export default router;
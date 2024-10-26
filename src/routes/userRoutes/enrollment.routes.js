import express from 'express';
import { deleteEnrollment, enrollUserInCourse, getUserEnrolledCourses, updateCourseCompletion } from '../../controllers/userControllers/enrollment.controllers.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Define routes
router.route("/enroll").post(verifyJWT, enrollUserInCourse); // Route for enrolling a user in a course
router.route("/enrollments").get(verifyJWT, getUserEnrolledCourses); // Route for getting all courses a user is enrolled in
router.route("/enrollments/:enrollmentId").delete(verifyJWT, deleteEnrollment); // Route for deleting a specific enrollment
router.route("/enrollments/completion").put(verifyJWT, updateCourseCompletion); // Route for updating course completion status



export default router;
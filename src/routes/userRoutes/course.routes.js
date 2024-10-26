import express from 'express';
import { getAllCourses, getCourseContents, getCourseDetails, getCourseSections } from '../../controllers/userControllers/course.controllers.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.route("/courses").get(verifyJWT, getAllCourses); // Route for getting all courses
router.route('/courses/:courseId/sections').get(verifyJWT, getCourseSections); // Route for getting sections of a specific course
router.route('/courses/:courseId/contents').get(verifyJWT, getCourseContents); // Route for getting contents of a specific course
router.route('/courses/:courseId').get(verifyJWT,getCourseDetails); // Route for getting details of a specific course

export default router;
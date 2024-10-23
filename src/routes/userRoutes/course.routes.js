import express from 'express';
import { getAllCourses, getCourseContents, getCourseDetails, getCourseSections } from '../../controllers/userControllers/course.controllers.js';

const router = express.Router();

// Define routes
router.get('/courses', getAllCourses); // Route for getting all courses
router.get('/courses/:courseId/sections', getCourseSections); // Route for getting sections of a specific course
router.get('/courses/:courseId/contents', getCourseContents); // Route for getting contents of a specific course
router.get('/courses/:courseId', getCourseDetails); // Route for getting details of a specific course

export default router;
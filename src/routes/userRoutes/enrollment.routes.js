import express from 'express';
import {  
    enrollUserInCourse, 
    getUserEnrolledCourses, 
    deleteEnrollment 
} from '../controllers/userControllers/enrollment.controllers.js';
import { updateCourseCompletion } from '../../controllers/userControllers/enrollment.controllers.js';

const router = express.Router();

// Define routes
router.post('/enroll', enrollUserInCourse); // Enroll user in a course
router.get('/user/courses', getUserEnrolledCourses); // Get user's enrolled courses
router.delete('/enrollment/:enrollmentId', deleteEnrollment); // Delete enrollment
router.put('/enrollment/completion', updateCourseCompletion); // Update course completion status


export default router;
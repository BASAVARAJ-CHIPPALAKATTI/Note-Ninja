const express = require('express');
const { 
  generateQuiz, 
  getTeacherQuizzes, 
  getStudentQuizzes, 
  submitQuiz,
  deleteQuiz,
  fixQuizzes, // Add this import
  getTeacherDashboardResults,
} = require('../controllers/quizController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Teacher routes
router.post('/generate', authorizeRole(['teacher']), generateQuiz);
router.get('/teacher/quizzes', authorizeRole(['teacher']), getTeacherQuizzes);
router.delete('/teacher/quiz/:quizId', authorizeRole(['teacher']), deleteQuiz);
router.post('/teacher/fix-quizzes', authorizeRole(['teacher']), fixQuizzes); // Add this route
// Add this route for teacher dashboard results
router.get('/teacher/dashboard-results', authorizeRole(['teacher']), getTeacherDashboardResults);

// Student routes
router.get('/student/quizzes', authorizeRole(['student']), getStudentQuizzes);
router.post('/student/submit/:quizId', authorizeRole(['student']), submitQuiz);


module.exports = router;
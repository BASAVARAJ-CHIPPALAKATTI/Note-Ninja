const express = require('express');
const { uploadPdf, getTeacherPdfs, getStudentPdfs, getStudents } = require('../controllers/pdfController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authenticateToken);

router.post('/upload', authorizeRole(['teacher']), upload.single('pdf'), uploadPdf);
router.get('/teacher/pdfs', authorizeRole(['teacher']), getTeacherPdfs);
router.get('/student/pdfs', authorizeRole(['student']), getStudentPdfs);
router.get('/students', authorizeRole(['teacher']), getStudents);

// Remove the assign route since it's no longer needed
// router.post('/assign', authorizeRole(['teacher']), assignPdf);

module.exports = router;
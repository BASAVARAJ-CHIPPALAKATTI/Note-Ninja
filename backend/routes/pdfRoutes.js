const express = require('express');
const { uploadPdf, getTeacherPdfs, getStudentPdfs, getStudents } = require('../controllers/pdfController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const PdfChunk = require('../models/PdfChunk');

const router = express.Router();

router.use(authenticateToken);

router.post('/upload', authorizeRole(['teacher']), upload.single('pdf'), uploadPdf);
router.get('/teacher/pdfs', authorizeRole(['teacher']), getTeacherPdfs);
router.get('/student/pdfs', authorizeRole(['student']), getStudentPdfs);
router.get('/students', authorizeRole(['teacher']), getStudents);

// Debug: chunk counts per PDF
router.get('/debug/chunks/:pdfId', authorizeRole(['teacher','student']), async (req, res) => {
  try {
    const count = await PdfChunk.countDocuments({ pdf: req.params.pdfId });
    res.json({ pdfId: req.params.pdfId, chunkCount: count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Remove the assign route since it's no longer needed
// router.post('/assign', authorizeRole(['teacher']), assignPdf);

module.exports = router;
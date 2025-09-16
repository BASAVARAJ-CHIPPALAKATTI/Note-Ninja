const express = require('express');
const { askPdfQuestion } = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');
const Pdf = require('../models/Pdf'); // ← Add this import
const Assignment = require('../models/Assignment'); // ← Add this import

const router = express.Router();

router.use(authenticateToken);
router.post('/ask-pdf', askPdfQuestion);

// Debug endpoint to check PDF access
router.get('/debug-pdf/:pdfId', async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.pdfId);
    
    if (!pdf) {
      return res.json({ 
        exists: false, 
        message: 'PDF not found in database' 
      });
    }

    let hasAccess = false;
    let reason = '';

    if (req.user.role === 'student') {
      const assignment = await Assignment.findOne({
        student: req.user.userId,
        pdf: req.params.pdfId
      });
      hasAccess = !!assignment;
      reason = hasAccess ? 'Student has assignment' : 'No assignment found for student';
    } else {
      hasAccess = pdf.teacher.toString() === req.user.userId;
      reason = hasAccess ? 'Teacher owns PDF' : 'Teacher does not own PDF';
    }

    res.json({
      exists: true,
      hasAccess: hasAccess,
      reason: reason,
      pdf: {
        id: pdf._id,
        title: pdf.title,
        teacher: pdf.teacher,
        contentLength: pdf.content?.length || 0
      },
      user: {
        id: req.user.userId,
        role: req.user.role
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this endpoint for debugging all PDFs
router.get('/debug/all-pdfs', authenticateToken, async (req, res) => {
  try {
    const pdfs = await Pdf.find().select('title _id teacher createdAt').populate('teacher', 'name email');
    
    res.json({
      totalPDFs: pdfs.length,
      pdfs: pdfs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this endpoint for debugging assignments
router.get('/debug/assignments', authenticateToken, async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('student', 'name email')
      .populate('pdf', 'title _id')
      .populate('assignedBy', 'name email');

    res.json({
      totalAssignments: assignments.length,
      assignments: assignments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
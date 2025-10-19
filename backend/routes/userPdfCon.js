
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { askTemporaryPdfQuestion } = require('../controllers/userPdfCon'); // This is correct

// New route for temporary student PDFs
router.post('/ask-temporary-pdf', authenticateToken, askTemporaryPdfQuestion);

module.exports = router;
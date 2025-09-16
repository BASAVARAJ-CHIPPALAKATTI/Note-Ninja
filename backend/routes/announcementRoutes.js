const express = require('express');
const {
  createAnnouncement,
  getAnnouncements,
  getTeacherAnnouncements,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Students and Teachers can view announcements
router.get('/', getAnnouncements);

// Teacher-only routes
router.post('/', authorizeRole(['teacher']), createAnnouncement);
router.get('/teacher', authorizeRole(['teacher']), getTeacherAnnouncements);
router.delete('/:id', authorizeRole(['teacher']), deleteAnnouncement);

module.exports = router;
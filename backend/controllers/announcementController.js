const Announcement = require('../models/Announcement');

// Create announcement (Teacher only)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, priority, expiresAt } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      priority: priority || 'medium',
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      teacher: req.user.userId
    });

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all announcements (Students and Teachers)
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      expiresAt: { $gt: new Date() } // Only non-expired announcements
    })
    .populate('teacher', 'name email')
    .sort({ createdAt: -1 });

    res.json({
      count: announcements.length,
      announcements
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get teacher's announcements (Teacher only)
exports.getTeacherAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ teacher: req.user.userId })
      .sort({ createdAt: -1 });

    res.json({
      count: announcements.length,
      announcements
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete announcement (Teacher only)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findOneAndDelete({
      _id: id,
      teacher: req.user.userId // Only owner can delete
    });

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found or access denied' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
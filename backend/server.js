const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const aiRoutes = require('./routes/aiRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const quizRoutes = require('./routes/quizRoutes');
// const profileRoutes = require('./routes/profileRoutes');

const app = express();
const PORT = process.env.PORT || 5001; 

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pdfs', pdfRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/quiz', quizRoutes);
// app.use('/api/profile', profileRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Edu Platform API is running',
    database: 'MongoDB'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('MongoDB connected');
  console.log('Available endpoints:');
  console.log('  POST /api/auth/register');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/auth/profile');
  console.log('  POST /api/pdfs/upload');
  console.log('  GET  /api/pdfs/teacher/pdfs');
  console.log('  GET  /api/pdfs/student/pdfs');
  console.log('  POST /api/pdfs/assign');
  console.log('  GET  /api/pdfs/students');
  console.log('  POST /api/ai/ask-pdf');
});
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const aiRoutes = require('./routes/aiRoutes');
const ragRoutes = require('./routes/ragRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const quizRoutes = require('./routes/quizRoutes');
const userPdfCon = require('./routes/userPdfCon');

const app = express();
const PORT = process.env.PORT || 5001; 

// Connect to MongoDB
connectDB();

// ✅ STEP 1: Update CORS like this
app.use(cors({
  origin: [
    'https://note-ninja-nine.vercel.app', // ← NEW VERCEL URL
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pdfs', pdfRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/user-pdf', userPdfCon);

// ✅ STEP 2: Add a root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Note Ninja Backend API is running!',
    version: '1.0.0',
    status: 'active'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Note Ninja API is running',
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Note Ninja Server running on port ${PORT}`);
  console.log('📊 Available endpoints:');
  console.log('  GET  /');
  console.log('  GET  /health');
  console.log('  POST /api/auth/register');
  console.log('  POST /api/auth/login');
  console.log('  POST /api/pdfs/upload');
  console.log('  POST /api/ai/ask-pdf');
});
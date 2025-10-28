const Pdf = require('../models/Pdf');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const pdfParse = require('pdf-parse');
const { reindexPdf } = require('../services/ragIngest');

exports.uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Extract text from PDF buffer
    const pdfData = await pdfParse(req.file.buffer);
    
    // Create PDF document
    const pdf = await Pdf.create({
      title: req.body.title || req.file.originalname,
      filename: req.file.originalname,
      originalName: req.file.originalname,
      content: pdfData.text,
      teacher: req.user.userId,
      fileSize: req.file.size,
      pageCount: pdfData.numpages || 0
    });

    // Automatically assign this PDF to all students
    await this.assignToAllStudents(pdf._id, req.user.userId);

    // RAG ingestion (chunk + embeddings)
    let chunkCount = 0;
    try {
      chunkCount = await reindexPdf(pdf, {});
    } catch (ingestErr) {
      console.warn('RAG ingestion failed for PDF', pdf._id.toString(), ingestErr.message);
    }

    res.status(201).json({
      message: 'PDF uploaded and assigned to all students successfully',
      pdf: {
        id: pdf._id,
        title: pdf.title,
        filename: pdf.filename
      },
      rag: { chunks: chunkCount }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to assign PDF to all students
exports.assignToAllStudents = async (pdfId, teacherId) => {
  try {
    const students = await User.find({ role: 'student' });
    
    const assignmentPromises = students.map(student => 
      Assignment.findOneAndUpdate(
        { student: student._id, pdf: pdfId },
        { 
          student: student._id, 
          pdf: pdfId, 
          assignedBy: teacherId 
        },
        { upsert: true, new: true } // Create if doesn't exist, update if exists
      )
    );

    await Promise.all(assignmentPromises);
  } catch (error) {
    console.error('Error assigning PDF to students:', error);
    // Don't throw error here to avoid failing the upload
  }
};

exports.getTeacherPdfs = async (req, res) => {
  try {
    const pdfs = await Pdf.find({ teacher: req.user.userId })
      .select('title filename originalName createdAt')
      .sort({ createdAt: -1 });
    
    res.json(pdfs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentPdfs = async (req, res) => {
  try {
    const assignments = await Assignment.find({ student: req.user.userId })
      .populate('pdf', 'title filename originalName createdAt')
      .sort({ createdAt: -1 });
    
    const pdfs = assignments.map(assignment => assignment.pdf);
    res.json(pdfs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove the assignPdf function since it's no longer needed

exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email')
      .sort({ name: 1 });
    
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userPdfApi } from '../../services/api';

import './StudentUpload.css';

const StudentUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedPdf, setUploadedPdf] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const { user } = useAuth();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setUploadedPdf(null);
      setAnswer('');
      setChatHistory([]);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Pdf = e.target.result.split(',')[1];
        
        setUploadedPdf({
          name: selectedFile.name,
          content: base64Pdf,
          uploadTime: new Date(),
          size: selectedFile.size
        });
        
        setIsLoading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Upload error:', error);
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
  if (!uploadedPdf || !question.trim()) return;

  setIsLoading(true);
  const currentQuestion = question.trim();
  
  try {
    console.log('📤 Sending request to backend...');
    
    const response = await userPdfApi.askTemporaryPdf({
      pdfContent: uploadedPdf.content,
      pdfName: uploadedPdf.name,
      question: currentQuestion
    });

    console.log('✅ Received response:', response.data);

    const newAnswer = {
      question: currentQuestion,
      answer: response.data.answer,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, newAnswer]);
    setAnswer(response.data.answer);
    setQuestion('');
    
  } catch (error) {
    console.error('❌ Detailed error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code
    });

    let errorMessage = 'Sorry, I could not process your question at this time.';
    
    // Specific error messages
    if (error.response?.status === 401) {
      errorMessage = 'Please login again to use this feature.';
    } else if (error.response?.status === 413) {
      errorMessage = 'PDF file is too large. Please try a smaller file.';
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data?.message || 'Invalid request. Please check your PDF file.';
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = 'Network error. Please check your connection and ensure the backend server is running.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. The server is taking too long to respond.';
    } else if (error.response?.status === 404) {
      errorMessage = 'API endpoint not found. Please check backend routes.';
    } else if (error.response?.status === 500) {
      errorMessage = 'Server error. Please check backend console for details.';
    }

    const errorAnswer = {
      question: currentQuestion,
      answer: errorMessage,
      timestamp: new Date(),
      error: true
    };
    setChatHistory(prev => [...prev, errorAnswer]);
    setAnswer(errorMessage);
  }
  setIsLoading(false);
};

  const handleClear = () => {
    setSelectedFile(null);
    setUploadedPdf(null);
    setQuestion('');
    setAnswer('');
    setChatHistory([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <div className="student-upload-container">
      <div className="upload-header">
        <h2>📄 Personal PDF Analyzer</h2>
        <p className="upload-info">
          Upload any PDF to ask questions about its content. 
          <strong> Your file is processed temporarily and won't be stored.</strong>
        </p>
      </div>

      {/* File Upload Section */}
      {!uploadedPdf && (
        <div className="upload-section">
          <div className="file-input-container">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="file-input"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="file-input-label">
              📁 Choose PDF File
            </label>
            {selectedFile && (
              <div className="file-info">
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-size">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="upload-btn"
          >
            {isLoading ? '⏳ Processing...' : '🚀 Upload & Analyze'}
          </button>
        </div>
      )}

      {/* Chat Interface */}
      {uploadedPdf && (
        <div className="chat-interface">
          <div className="pdf-header">
            <h3>📋 Analyzing: {uploadedPdf.name}</h3>
            <button onClick={handleClear} className="clear-btn">
              🗑️ New PDF
            </button>
          </div>

          {/* Chat History */}
          <div className="chat-history">
            {chatHistory.map((chat, index) => (
              <div key={index} className="chat-message">
                <div className="question-bubble">
                  <strong>Q:</strong> {chat.question}
                </div>
                <div className={`answer-bubble ${chat.error ? 'error' : ''}`}>
                  <strong>A:</strong> {chat.answer}
                </div>
              </div>
            ))}
          </div>

          {/* Question Input */}
          <div className="question-input-container">
            <div className="input-group">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about this PDF... (Press Enter to send)"
                rows="2"
                className="question-textarea"
                disabled={isLoading}
              />
              <button
                onClick={handleAskQuestion}
                disabled={!question.trim() || isLoading}
                className="ask-btn"
              >
                {isLoading ? '💭 Thinking...' : '📤 Ask'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentUpload;
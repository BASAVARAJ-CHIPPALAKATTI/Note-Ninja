import React, { useState, useEffect } from 'react';
import { quizApi } from '../../services/api';
import '../../styles/Quiz.css';

const QuizResults = ({ refreshTrigger }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, [refreshTrigger]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await quizApi.getResults();
      console.log('Results response:', response); // Debug log
      setResults(response.data || response || []);
    } catch (error) {
      console.error('Results fetch error:', error);
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="quiz-results-page">
        <h2>Quiz Results</h2>
        <div className="loading">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-results-page">
        <h2>Quiz Results</h2>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchResults} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-results-page">
      <h2>Quiz Results</h2>
      
      {results.length === 0 ? (
        <div className="empty-state">
          <p>No quiz results available yet.</p>
        </div>
      ) : (
        <div className="results-container">
          {results.map((quiz) => {
            // Add safety checks for quiz data
            if (!quiz || !quiz.quizSubject || !quiz.studentResults) {
              console.warn('Invalid quiz data:', quiz);
              return null; // Skip invalid quizzes
            }
            
            return (
              <div key={quiz._id || quiz.quizId} className="quiz-result-card">
                <div className="quiz-header">
                  <h3>{quiz.quizSubject} - {quiz.quizTopic || 'General'}</h3>
                  <span className="difficulty-badge">{quiz.difficulty || 'Medium'}</span>
                </div>
                
                <div className="stats">
                  <div className="stat">
                    <span className="stat-label">Total Attempts</span>
                    <span className="stat-value">{quiz.attempts || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Average Score</span>
                    <span 
                      className="stat-value"
                      style={{ color: getGradeColor(quiz.averageScore || 0) }}
                    >
                      {quiz.averageScore || 0}%
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Students</span>
                    <span className="stat-value">{quiz.totalStudents || 0}</span>
                  </div>
                </div>

                <div className="students-list">
                  <h4>Student Performances</h4>
                  {quiz.studentResults.map((student, index) => (
                    <div key={index} className="student-result">
                      <span className="student-name">{student.studentName || 'Unknown Student'}</span>
                      <span 
                        className="student-score"
                        style={{ color: getGradeColor(student.score || 0) }}
                      >
                        {student.score || 0}%
                      </span>
                      <span className="student-time">
                        {student.completedAt ? new Date(student.completedAt).toLocaleDateString() : 'Unknown date'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizResults;
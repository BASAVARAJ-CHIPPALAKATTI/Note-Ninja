import React, { useState, useEffect } from 'react';
import { quizApi } from '../../services/api';
import '../../styles/Quiz.css';

const QuizManagement = ({ refreshTrigger, onRefresh }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, [refreshTrigger]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await quizApi.getTeacherQuizzes(); // Changed to getTeacherQuizzes
      console.log('Teacher quizzes response:', response);
      setQuizzes(response.data || response || []);
    } catch (error) {
      console.error('Teacher quiz fetch error:', error);
      setError('Failed to load quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    setDeletingId(quizId);
    try {
      await quizApi.deleteQuiz(quizId);
      setQuizzes(quizzes.filter(quiz => quiz._id !== quizId));
      if (onRefresh) onRefresh();
      alert('Quiz deleted successfully!');
    } catch (error) {
      console.error('Delete quiz error:', error);
      alert('Failed to delete quiz. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading quizzes...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={fetchQuizzes} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-management">
      <h3>My Quizzes</h3>
      
      {quizzes.length === 0 ? (
        <div className="empty-state">
          <p>No quizzes created yet</p>
        </div>
      ) : (
        <div className="quizzes-list">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="quiz-management-card">
              <div className="quiz-info">
                <h4>{quiz.title || 'Untitled Quiz'}</h4>
                <p><strong>Subject:</strong> {quiz.subject || 'N/A'}</p>
                <p><strong>Topic:</strong> {quiz.topic || 'General'}</p>
                <p><strong>Difficulty:</strong> {quiz.difficulty || 'Medium'}</p>
                <p><strong>Questions:</strong> {quiz.totalQuestions || (quiz.questions ? quiz.questions.length : 0)}</p>
                <p><strong>Created:</strong> {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'Unknown'}</p>
              </div>
              
              <div className="quiz-actions">
                <button
                  onClick={() => handleDeleteQuiz(quiz._id)}
                  disabled={deletingId === quiz._id}
                  className="delete-quiz-btn"
                >
                  {deletingId === quiz._id ? 'Deleting...' : 'Delete Quiz'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizManagement;
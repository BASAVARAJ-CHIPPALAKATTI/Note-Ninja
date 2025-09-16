import React, { useState, useEffect } from 'react';
import { quizApi } from '../../services/api';
import '../../styles/Quiz.css';

const QuizList = ({ onSelectQuiz }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
  try {
    const response = await quizApi.getStudentQuizzes();;
    console.log('Quiz data received:', JSON.stringify(response.data, null, 2));
    setQuizzes(response.data);
  } catch (error) {
    setError('Failed to load quizzes');
    console.error('Quiz fetch error:', error);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="quiz-list">
        <h2>Available Quizzes</h2>
        <div className="loading">Loading quizzes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-list">
        <h2>Available Quizzes</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="quiz-list">
      <h2>Available Quizzes</h2>
      
      {!quizzes || quizzes.length === 0 ? (
        <div className="empty-state">
          <p>No quizzes available yet</p>
        </div>
      ) : (
        <div className="quizzes-grid">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="quiz-card" onClick={() => onSelectQuiz(quiz)}>
              <h3>{quiz.title || 'Untitled Quiz'}</h3>
              <p>{quiz.description || quiz.subject || 'Test your knowledge'}</p>
              <div className="quiz-meta">
                <span>{(quiz.questions && quiz.questions.length) || quiz.totalQuestions || 0} questions</span>
                <span>•</span>
                <span>Created by: {quiz.creator?.name || quiz.creatorName || 'Teacher'}</span>
              </div>
              <button className="take-quiz-btn">
                Take Quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;
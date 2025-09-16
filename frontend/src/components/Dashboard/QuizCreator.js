import React, { useState } from 'react';
import { quizApi } from '../../services/api';
import '../../styles/Quiz.css';

const QuizCreator = ({ onQuizCreated }) => {
  const [quizData, setQuizData] = useState({
    subject: '',
    topic: '',
    difficulty: 'medium',
    questionCount: 5,
    questionType: 'multiple-choice'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await quizApi.createQuiz(quizData);
      setMessage('Quiz created successfully!');
      setQuizData({
        subject: '',
        topic: '',
        difficulty: 'medium',
        questionCount: 5,
        questionType: 'multiple-choice'
      });
      onQuizCreated();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-creator">
      <h2>Create New Quiz</h2>
      
      <form onSubmit={handleSubmit} className="quiz-form">
        <div className="form-row">
          <div className="form-group">
            <label>Subject *</label>
            <input
              type="text"
              value={quizData.subject}
              onChange={(e) => setQuizData({...quizData, subject: e.target.value})}
              placeholder="e.g., Mathematics, Science, History"
              required
            />
          </div>

          <div className="form-group">
            <label>Topic</label>
            <input
              type="text"
              value={quizData.topic}
              onChange={(e) => setQuizData({...quizData, topic: e.target.value})}
              placeholder="e.g., Algebra, World War II, Photosynthesis"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Difficulty</label>
            <select
              value={quizData.difficulty}
              onChange={(e) => setQuizData({...quizData, difficulty: e.target.value})}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label>Number of Questions</label>
            <input
              type="number"
              min="1"
              max="20"
              value={quizData.questionCount}
              onChange={(e) => setQuizData({...quizData, questionCount: parseInt(e.target.value)})}
              required
            />
          </div>

          <div className="form-group">
            <label>Question Type</label>
            <select
              value={quizData.questionType}
              onChange={(e) => setQuizData({...quizData, questionType: e.target.value})}
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True/False</option>
              <option value="short-answer">Short Answer</option>
            </select>
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <button type="submit" disabled={loading} className="create-quiz-btn">
          {loading ? 'Creating Quiz...' : 'Create Quiz'}
        </button>
      </form>

      <div className="quiz-info">
        <h3>About Quiz Creation</h3>
        <ul>
          <li>Quizzes are generated using AI based on the subject and topic</li>
          <li>Students will see quizzes in their "Take Quizzes" section</li>
          <li>You can view results in the "Quiz Results" tab</li>
        </ul>
      </div>
    </div>
  );
};

export default QuizCreator;
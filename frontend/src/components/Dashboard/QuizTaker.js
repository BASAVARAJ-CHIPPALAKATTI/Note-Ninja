import React, { useState } from 'react';
import { quizApi } from '../../services/api';
import '../../styles/Quiz.css';

const QuizTaker = ({ quiz, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Safety check
  if (!quiz || !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return (
      <div className="quiz-taker">
        <div className="error-message">
          <h2>Error: Invalid Quiz</h2>
          <p>This quiz appears to be corrupted or incomplete.</p>
          <button onClick={onBack} className="back-btn">
            ← Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      // Convert answers object to array in the correct order
      const answersArray = [];
      for (let i = 0; i < quiz.questions.length; i++) {
        answersArray.push(answers[i] !== undefined ? answers[i] : -1);
      }
      
      const response = await quizApi.submitQuiz(quiz._id, {
        answers: answersArray,
        timeTaken: 0
      });
      
      setResults(response.data);
    } catch (error) {
      console.error('Quiz submission error:', error);
      setError(error.response?.data?.error || 'Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (results) {
    return (
      <div className="quiz-results">
        <h2>Quiz Results: {quiz.title}</h2>
        
        <div className="results-summary">
          <div className="score">
            <h3>Your Score: {results.score}/{quiz.questions.length}</h3>
            <p>{Math.round((results.score / quiz.questions.length) * 100)}%</p>
          </div>
          
          <div className="results-details">
            {results.details?.map((detail, index) => {
              const question = quiz.questions[index];
              const userAnswerIndex = answers[index];
              
              // Get user answer text
              const userAnswerText = userAnswerIndex !== undefined && userAnswerIndex !== -1
                ? (question.options[userAnswerIndex]?.text || question.options[userAnswerIndex] || 'No answer')
                : 'No answer';
              
              // Get correct answer text - FIXED LOGIC
              let correctAnswerText = 'Not available';
              
              // Method 1: If we have the correct answer index from results
              if (detail.correctAnswer !== undefined) {
                correctAnswerText = question.options[detail.correctAnswer]?.text || 
                                  question.options[detail.correctAnswer] || 
                                  'Not available';
              }
              // Method 2: If we have the correct answer index from question
              else if (question.correctAnswer !== undefined) {
                correctAnswerText = question.options[question.correctAnswer]?.text || 
                                  question.options[question.correctAnswer] || 
                                  'Not available';
              }
              // Method 3: Try to find the correct option by isCorrect flag
              else {
                const correctOption = question.options.find(opt => opt.isCorrect);
                correctAnswerText = correctOption?.text || correctOption || 'Not available';
              }
              
              return (
                <div key={index} className={`question-result ${detail.correct ? 'correct' : 'incorrect'}`}>
                  <p><strong>Q{index + 1}:</strong> {question.question}</p>
                  <p>Your answer: {userAnswerText}</p>
                  {!detail.correct && (
                    <p>Correct answer: {correctAnswerText}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="quiz-actions">
          <button onClick={onBack} className="back-btn">
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="quiz-taker">
      <div className="quiz-header">
        <h2>{quiz.title}</h2>
        <p>Question {currentQuestion + 1} of {quiz.questions.length}</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="dismiss-btn">
            Dismiss
          </button>
        </div>
      )}

      <div className="question-card">
        <h3>{question.question}</h3>
        
        <div className="options-list">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`option ${answers[currentQuestion] === index ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(currentQuestion, index)}
            >
              <span className="option-text">
                {typeof option === 'object' ? option.text : option}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="quiz-navigation">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="nav-btn prev-btn"
        >
          Previous
        </button>

        <div className="progress">
          {currentQuestion + 1} / {quiz.questions.length}
        </div>

        {currentQuestion < quiz.questions.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={answers[currentQuestion] === undefined}
            className="nav-btn next-btn"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== quiz.questions.length || isSubmitting}
            className="nav-btn submit-btn"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>

      <button onClick={onBack} className="back-btn">
        ← Back to Quizzes
      </button>
    </div>
  );
};

export default QuizTaker;
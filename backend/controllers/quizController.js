const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Result = require('../models/Result');
const axios = require('axios');

const OLLAMA_HOST = 'http://127.0.0.1:11434';
const MODEL = 'mistral';

// Generate Quiz - FIXED VERSION
exports.generateQuiz = async (req, res) => {
  try {
    const { subject, topic, difficulty, questionCount, questionType } = req.body;

    const prompt = `Create a ${difficulty} level quiz about ${subject} ${topic ? `on topic: ${topic}` : ''} with ${questionCount} ${questionType} questions. 
    For each question, provide 4 options and clearly indicate the correct answer by providing its exact text.
    Return only JSON format with this structure: {
      "title": "string",
      "questions": [
        {
          "question": "string",
          "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
          "correctAnswer": "Exact text of the correct option",
          "explanation": "string"
        }
      ]
    }`;

    console.log('🤖 Generating quiz with Ollama...');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    let response;
    try {
      response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
        model: MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 2000,
          top_k: 40,
          top_p: 0.9
        }
      }, { signal: controller.signal });

      clearTimeout(timeout);
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === 'CanceledError') {
        return res.status(201).json({
          message: 'Quiz generated successfully (fallback)',
          quiz: await createFallbackQuiz(subject, topic, difficulty, questionCount, questionType, req.user.userId)
        });
      }
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'Ollama service is not running',
          solution: 'Start Ollama with: ollama serve'
        });
      }
      throw error;
    }

    try {
      const quizData = JSON.parse(response.data.response);
      const creatorId = req.user.userId;
      
      if (!creatorId) {
        throw new Error('User ID not found in request');
      }

      const quiz = await Quiz.create({
        title: quizData.title || `${subject} Quiz - ${topic || 'General'}`,
        subject: subject,
        topic: topic,
        difficulty: difficulty,
        questions: quizData.questions.map(q => {
          // Find which option is the correct answer
          const correctAnswerText = q.correctAnswer;
          const options = q.options.map((opt, index) => ({
            text: opt,
            isCorrect: opt === correctAnswerText // Set isCorrect based on text match
          }));
          
          // Find the index of the correct answer
          const correctAnswerIndex = options.findIndex(opt => opt.isCorrect);
          
          return {
            question: q.question,
            options: options,
            correctAnswer: correctAnswerIndex !== -1 ? correctAnswerIndex : 0,
            explanation: q.explanation
          };
        }),
        creator: creatorId,
        totalQuestions: questionCount
      });

      res.status(201).json({
        message: 'Quiz generated successfully',
        quiz: quiz
      });
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      const creatorId = req.user.userId;
      res.status(201).json({
        message: 'Quiz generated successfully (fallback)',
        quiz: await createFallbackQuiz(subject, topic, difficulty, questionCount, questionType, creatorId)
      });
    }
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate quiz: ' + error.message });
  }
};

// Submit Quiz Answers - UPDATED to include correct answer in response
exports.submitQuiz = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const quizId = req.params.quizId;
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    let score = 0;
    const answerDetails = [];
    const totalPoints = quiz.questions.length;

    quiz.questions.forEach((question, index) => {
      const userAnswerIndex = answers[index];
      let isCorrect = false;
      
      if (userAnswerIndex !== undefined && userAnswerIndex !== -1) {
        // Method 1: Check if the option has isCorrect flag
        if (question.options[userAnswerIndex]?.isCorrect) {
          isCorrect = true;
        }
        // Method 2: Check against stored correctAnswer index
        else if (question.correctAnswer === userAnswerIndex) {
          isCorrect = true;
        }
        // Method 3: Compare text values as fallback
        else {
          const userAnswerText = question.options[userAnswerIndex]?.text || question.options[userAnswerIndex];
          const correctAnswerText = question.options[question.correctAnswer]?.text || question.options[question.correctAnswer];
          isCorrect = userAnswerText === correctAnswerText;
        }
      }
      
      if (isCorrect) score++;
      
      answerDetails.push({
        questionId: question._id,
        selectedAnswer: userAnswerIndex,
        isCorrect: isCorrect,
        pointsEarned: isCorrect ? 1 : 0,
        correctAnswer: question.correctAnswer, // Include correct answer index
        correctAnswerText: question.options[question.correctAnswer]?.text || question.options[question.correctAnswer] || 'Not available' // Include correct answer text
      });
    });

    const percentage = (score / totalPoints) * 100;

    // Save quiz attempt
    const quizAttempt = await QuizAttempt.create({
      quiz: quizId,
      student: req.user.userId,
      answers: answerDetails,
      score: score,
      totalPoints: totalPoints,
      percentage: percentage,
      timeTaken: timeTaken || 0,
      completedAt: new Date()
    });

    // Update or create result summary
    await Result.findOneAndUpdate(
      { quiz: quizId, student: req.user.userId },
      {
        quiz: quizId,
        student: req.user.userId,
        score: score,
        totalQuestions: totalPoints,
        percentage: percentage,
        timeSpent: timeTaken || 0,
        completedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      score: score,
      total: totalPoints,
      percentage: percentage.toFixed(1),
      timeTaken: timeTaken || 0,
      attemptId: quizAttempt._id,
      details: answerDetails // This now includes correctAnswer and correctAnswerText
    });

  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Teacher's Quizzes
exports.getTeacherQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ creator: req.user.userId })
      .select('title subject topic difficulty totalQuestions createdAt')
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Student's Available Quizzes
exports.getStudentQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isPublished: true })
      .select('title subject topic difficulty questions createdAt')
      .populate('creator', 'name')
      .sort({ createdAt: -1 });
    
    const formattedQuizzes = quizzes.map(quiz => ({
      _id: quiz._id,
      title: quiz.title,
      subject: quiz.subject,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      questions: quiz.questions || [],
      creator: quiz.creator,
      createdAt: quiz.createdAt,
      totalQuestions: quiz.questions ? quiz.questions.length : 0
    }));
    
    res.json(formattedQuizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Quiz Results for Teacher - UPDATED with safety checks
exports.getQuizResults = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    
    // Get all attempts for this quiz with proper error handling
    const results = await QuizAttempt.find({ quiz: quizId })
      .populate('student', 'name email')
      .populate('quiz', 'subject topic difficulty') // Populate quiz details
      .sort({ percentage: -1 });
    
    // Format results with safety checks
    const formattedResults = results.map(attempt => {
      // Skip invalid attempts
      if (!attempt || !attempt.quiz || !attempt.student) {
        return null;
      }
      
      return {
        _id: attempt._id,
        student: {
          name: attempt.student.name || 'Unknown Student',
          email: attempt.student.email || 'No email'
        },
        quiz: {
          subject: attempt.quiz.subject || 'Unknown Subject',
          topic: attempt.quiz.topic || 'General',
          difficulty: attempt.quiz.difficulty || 'Medium'
        },
        score: attempt.score || 0,
        percentage: attempt.percentage || 0,
        totalQuestions: attempt.totalPoints || 0,
        timeTaken: attempt.timeTaken || 0,
        completedAt: attempt.completedAt || new Date()
      };
    }).filter(result => result !== null); // Remove null results
    
    res.json(formattedResults);
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Quiz Details
exports.getQuizDetails = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
      .populate('creator', 'name');
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    if (quiz.creator.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this quiz' });
    }
    
    await Quiz.findByIdAndDelete(req.params.quizId);
    await QuizAttempt.deleteMany({ quiz: req.params.quizId });
    await Result.deleteMany({ quiz: req.params.quizId });
    
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function for fallback quiz
async function createFallbackQuiz(subject, topic, difficulty, questionCount, questionType, userId) {
  if (!userId) {
    throw new Error('User ID is required for quiz creation');
  }

  const questions = [];
  
  for (let i = 0; i < questionCount; i++) {
    questions.push({
      question: `${subject} Question ${i + 1}: About ${topic || 'general knowledge'} (${difficulty})`,
      options: [
        { text: 'Option A', isCorrect: i % 4 === 0 },
        { text: 'Option B', isCorrect: i % 4 === 1 },
        { text: 'Option C', isCorrect: i % 4 === 2 },
        { text: 'Option D', isCorrect: i % 4 === 3 }
      ],
      correctAnswer: i % 4,
      explanation: `This is the explanation for question ${i + 1}`
    });
  }

  const quiz = await Quiz.create({
    title: `${subject} Quiz - ${topic || 'General'}`,
    subject: subject,
    topic: topic,
    difficulty: difficulty,
    questions: questions,
    creator: userId,
    totalQuestions: questionCount
  });

  return quiz;
}

// Add this temporary route to fix existing quizzes
exports.fixQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({});
    let fixedCount = 0;
    
    for (const quiz of quizzes) {
      let needsFix = false;
      
      for (const question of quiz.questions) {
        // Check if all options have isCorrect: false (broken quiz)
        const allFalse = question.options.every(opt => !opt.isCorrect);
        
        if (allFalse && question.correctAnswer !== undefined) {
          needsFix = true;
          
          // If correctAnswer is a number, use it as index
          if (typeof question.correctAnswer === 'number') {
            question.options.forEach((opt, idx) => {
              opt.isCorrect = (idx === question.correctAnswer);
            });
          }
        }
      }
      
      if (needsFix) {
        await quiz.save();
        fixedCount++;
      }
    }
    
    res.json({ message: `Fixed ${fixedCount} quizzes` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Results for Teacher Dashboard
exports.getTeacherDashboardResults = async (req, res) => {
  try {
    // Get all quizzes created by this teacher
    const quizzes = await Quiz.find({ creator: req.user.userId });
    const quizIds = quizzes.map(quiz => quiz._id);
    
    // Get results for these quizzes
    const results = await QuizAttempt.find({ quiz: { $in: quizIds } })
      .populate('student', 'name email')
      .populate('quiz', 'subject topic difficulty')
      .sort({ completedAt: -1 });
    
    // Group results by quiz
    const resultsByQuiz = {};
    
    results.forEach(attempt => {
      if (!attempt.quiz || !attempt.student) return;
      
      const quizId = attempt.quiz._id.toString();
      
      if (!resultsByQuiz[quizId]) {
        resultsByQuiz[quizId] = {
          quizId: quizId,
          quizSubject: attempt.quiz.subject || 'Unknown Subject',
          quizTopic: attempt.quiz.topic || 'General',
          difficulty: attempt.quiz.difficulty || 'Medium',
          attempts: 0,
          totalScore: 0,
          studentResults: [],
          studentIds: new Set()
        };
      }
      
      resultsByQuiz[quizId].attempts++;
      resultsByQuiz[quizId].totalScore += attempt.percentage || 0;
      resultsByQuiz[quizId].studentResults.push({
        studentId: attempt.student._id,
        studentName: attempt.student.name || 'Unknown Student',
        score: attempt.percentage || 0,
        completedAt: attempt.completedAt
      });
      resultsByQuiz[quizId].studentIds.add(attempt.student._id.toString());
    });
    
    // Format the final response
    const formattedResults = Object.values(resultsByQuiz).map(quizResult => ({
      _id: quizResult.quizId,
      quizSubject: quizResult.quizSubject,
      quizTopic: quizResult.quizTopic,
      difficulty: quizResult.difficulty,
      attempts: quizResult.attempts,
      averageScore: quizResult.attempts > 0 ? Math.round(quizResult.totalScore / quizResult.attempts) : 0,
      totalStudents: quizResult.studentIds.size,
      studentResults: quizResult.studentResults
    }));
    
    res.json(formattedResults);
  } catch (error) {
    console.error('Error fetching teacher dashboard results:', error);
    res.status(500).json({ error: error.message });
  }
};
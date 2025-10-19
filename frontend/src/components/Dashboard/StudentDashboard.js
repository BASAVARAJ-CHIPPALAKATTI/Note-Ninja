import React, { useState } from 'react';
import PdfList from './PdfList';
import ChatInterface from './ChatInterface';
import QuizList from './QuizList';
import QuizTaker from './QuizTaker';
import AnnouncementList from '../Announcements/AnnouncementList';
import StudentUpload from '../StudentUpload/StudentUpload'; // Import the new component
import '../../styles/Dashboard.css';

const StudentDashboard = () => {
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [activeView, setActiveView] = useState('announcements');

  return (
    <div className="student-dashboard">
      {/* Header Section - Sticky */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-text">
              <h1>Student Dashboard</h1>
              <p>Access learning materials, announcements, and take assessments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Navigation Sidebar - Sticky and Narrow */}
        <div className="dashboard-nav">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeView === 'announcements' ? 'active' : ''}`}
              onClick={() => setActiveView('announcements')}
              title="Announcements"
            >
              <span className="tab-icon">📢</span>
              <span className="tab-text">Announcements</span>
            </button>
            <button
              className={`nav-tab ${activeView === 'study' ? 'active' : ''}`}
              onClick={() => setActiveView('study')}
              title="Study Materials"
            >
              <span className="tab-icon">📚</span>
              <span className="tab-text">Study Materials</span>
            </button>
            <button
              className={`nav-tab ${activeView === 'personal-upload' ? 'active' : ''}`}
              onClick={() => setActiveView('personal-upload')}
              title="My PDF Analysis"
            >
              <span className="tab-icon">📤</span>
              <span className="tab-text">My PDF Analysis</span>
            </button>
            <button
              className={`nav-tab ${activeView === 'quizzes' ? 'active' : ''}`}
              onClick={() => setActiveView('quizzes')}
              title="Take Quizzes"
            >
              <span className="tab-icon">📝</span>
              <span className="tab-text">Take Quizzes</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="dashboard-content">
          <div className="content-header">
            <h2>
              {activeView === 'announcements' && 'Announcements'}
              {activeView === 'study' && 'Study Materials & Chat'}
              {activeView === 'personal-upload' && 'My PDF Analysis'}
              {activeView === 'quizzes' && 'Take Quizzes'}
            </h2>
          </div>
          
          <div className="content-body">
            {activeView === 'announcements' && (
              <div className="announcements-full">
                <AnnouncementList userRole="student" />
              </div>
            )}

            {activeView === 'study' && (
              <div className="student-layout">
                <div className="pdfs-section">
                  <h3>My Study Materials</h3>
                  <PdfList onSelectPdf={setSelectedPdf} />
                </div>

                <div className="chat-section">
                  <h3>Ask Questions</h3>
                  {selectedPdf ? (
                    <ChatInterface pdf={selectedPdf} />
                  ) : (
                    <div className="select-pdf-prompt">
                      <p>Select a PDF from the list to start asking questions</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === 'personal-upload' && (
              <div className="personal-upload-section">
                <StudentUpload />
              </div>
            )}

            {activeView === 'quizzes' && (
              <div className="quizzes-layout">
                {selectedQuiz ? (
                  <QuizTaker 
                    quiz={selectedQuiz} 
                    onBack={() => setSelectedQuiz(null)}
                    onComplete={() => setSelectedQuiz(null)}
                  />
                ) : (
                  <QuizList onSelectQuiz={setSelectedQuiz} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
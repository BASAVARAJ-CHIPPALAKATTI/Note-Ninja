import React, { useState } from 'react';
import PdfUpload from './PdfUpload';
import PdfList from './PdfList';
import QuizCreator from './QuizCreator';
import QuizResults from './QuizResults';
import '../../styles/Dashboard.css';
import QuizManagement from './QuizDelete';
import CreateAnnouncement from '../Announcements/CreateAnnouncement';
import AnnouncementList from '../Announcements/AnnouncementList';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [refreshQuizzes, setRefreshQuizzes] = useState(0);

  const handleCreateAnnouncement = (newAnnouncement) => {
    const announcement = {
      id: announcements.length + 1,
      ...newAnnouncement,
      date: new Date().toISOString().split('T')[0],
      author: 'Teacher'
    };
    setAnnouncements([announcement, ...announcements]);
  };

  const handleQuizRefresh = () => {
    setRefreshQuizzes(prev => prev + 1);
  };

  const tabs = [
    { 
      id: 'announcements', 
      label: '📢 Announcements', 
      component: (
        <div>
          <CreateAnnouncement onCreate={handleCreateAnnouncement} />
          <AnnouncementList announcements={announcements} userRole="teacher" />
        </div>
      ) 
    },
    { id: 'upload', label: '📤 Upload PDF', component: <PdfUpload /> },
    { id: 'manage', label: '📚 My PDFs', component: <PdfList /> },
    { id: 'create-quiz', label: '📝 Create Quiz', component: <QuizCreator onQuizCreated={handleQuizRefresh} /> },
    { id: 'manage-quizzes', label: '⚙️ Manage Quizzes', component: <QuizManagement refreshTrigger={refreshQuizzes} onRefresh={handleQuizRefresh} /> },
    { id: 'results', label: '📊 Quiz Results', component: <QuizResults refreshTrigger={refreshQuizzes} /> }
  ];

  return (
    <div className="teacher-dashboard">
      {/* Header Section - Sticky */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-text">
              <h1>Teacher Dashboard</h1>
              <p>Manage your educational content and assessments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Navigation Sidebar - Sticky and Narrow */}
        <div className="dashboard-nav">
          <div className="nav-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label.replace(/[^a-zA-Z ]/g, '')}
              >
                <span className="tab-icon">{tab.label.split(' ')[0]}</span>
                <span className="tab-text">{tab.label.split(' ').slice(1).join(' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="dashboard-content">
          <div className="content-header">
            <h2>{tabs.find(tab => tab.id === activeTab)?.label.replace(/[^a-zA-Z ]/g, '')}</h2>
          </div>
          
          <div className="content-body">
            {tabs.find(tab => tab.id === activeTab)?.component}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
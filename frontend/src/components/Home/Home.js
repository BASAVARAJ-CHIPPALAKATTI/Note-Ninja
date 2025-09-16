import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const Home = () => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (path === '/dashboard' && !isAuthenticated) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <div className="home-container">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      {/* Enhanced Navbar */}
      <nav className="home-navbar">
        <div className="nav-brand">
          <Link to="/">
            <h1>Note-Ninja</h1>
          </Link>
        </div>
        
        <div className="nav-menu">
          <button 
            className="nav-link"
            onClick={() => navigate('/')}
          >
            🏠 Home
          </button>
          
          <button 
            className="nav-link"
            onClick={() => handleNavigation('/dashboard')}
          >
            📊 Dashboard
          </button>

          <button 
            className="nav-link"
            onClick={() => setShowHowItWorks(!showHowItWorks)}
          >
            ℹ️ How It Works
          </button>

          {isAuthenticated ? (
            <div className="user-section">
              <span className="welcome-text">Welcome, {user?.name}</span>
              <span className="role-badge">{user?.role}</span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="nav-btn login-btn">Login</Link>
              <Link to="/register" className="nav-btn signup-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Transform Learning with
              <span className="gradient-text"> AI-Powered</span>
              <br />PDF Conversations
            </h1>
            <p className="hero-description">
              Upload educational PDFs and engage in intelligent conversations with your documents. 
              Ask questions, get instant answers, and enhance your learning experience.
            </p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="cta-btn primary"
                  >
                    Go to Dashboard
                  </button>
                  <button 
                    onClick={() => setShowHowItWorks(true)}
                    className="cta-btn secondary"
                  >
                    How It Works
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="cta-btn primary">Get Started Free</Link>
                  <Link to="/login" className="cta-btn secondary">Existing User</Link>
                </>
              )}
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card">
              <div className="card-icon">📚</div>
              <h3>For Teachers</h3>
              <p>Upload and share educational materials instantly</p>
            </div>
            <div className="floating-card">
              <div className="card-icon">🎓</div>
              <h3>For Students</h3>
              <p>Access assigned materials and ask questions</p>
            </div>
            <div className="floating-card">
              <div className="card-icon">⚡</div>
              <h3>Instant Answers</h3>
              <p>Get immediate responses from your documents</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Modal */}
      {showHowItWorks && (
        <div className="modal-overlay" onClick={() => setShowHowItWorks(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowHowItWorks(false)}
            >
              ×
            </button>
            
            <h2>How EduChat Works</h2>
            
            <div className="how-it-works-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Upload PDFs</h3>
                  <p>Teachers upload educational PDF documents to the platform</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Automatic Assignment</h3>
                  <p>PDFs are automatically assigned to all students - no manual work needed</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Ask Questions</h3>
                  <p>Students can ask any question about the assigned PDF content</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Instant Answers</h3>
                  <p>Get immediate, accurate answers based on the document content</p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h3>Secure Access</h3>
                  <p>Role-based access ensures students only see their assigned materials</p>
                </div>
              </div>
            </div>

            <div className="feature-highlights">
              <h3>Key Features:</h3>
              <ul>
                <li>⚡ Instant keyword-based search technology</li>
                <li>📚 Support for all educational PDF documents</li>
                <li>👥 Separate dashboards for teachers and students</li>
                <li>🔒 Secure authentication and data protection</li>
                <li>🎯 Accurate answers from document content</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose EduChat?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Instant Responses</h3>
            <p>Get immediate answers to your questions without waiting for AI processing</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎓</div>
            <h3>For Educators</h3>
            <p>Easy content sharing and automatic assignment to all students</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Access</h3>
            <p>Role-based authentication ensures content security and proper access</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2024 EduChat. Transforming education with instant document conversations.</p>
        <p>Need help? Contact us at support@educhat.com</p>
      </footer>
    </div>
  );
};

export default Home;



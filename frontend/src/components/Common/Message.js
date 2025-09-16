import React from 'react';
import './Message.css';

const Message = ({ message, isUser, isTyping, method }) => {
  return (
    <div className={`message ${isUser ? 'user-message' : 'ai-message'} ${isTyping ? 'typing' : ''}`}>
      <div className="message-avatar">
        {isUser ? '👤' : (isTyping ? '⏳' : '🤖')}
      </div>
      <div className="message-content">
        <div className="message-text">
          {message.content}
        </div>
        
        {!isTyping && !isUser && (
          <div className="message-meta">
            <span className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
            {method === 'keyword-search' && (
              <span className="search-indicator">⚡ Instant search</span>
            )}
          </div>
        )}
        
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
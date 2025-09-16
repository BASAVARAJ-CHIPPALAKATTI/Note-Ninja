import React, { useState } from 'react';
import { aiApi } from '../../services/api';
import Message from '../Common/Message';
import '../../styles/Chat.css';

const ChatInterface = ({ pdf }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = { 
      role: 'user', 
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    // Add immediate typing indicator
    const typingMessage = {
      role: 'assistant',
      content: '🔍 Searching document...',
      isTyping: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await aiApi.askPdfQuestion({
        pdfId: pdf._id,
        question: inputMessage
      });

      // Remove typing indicator and add actual response
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const aiMessage = { 
        role: 'assistant', 
        content: response.data.answer,
        method: response.data.method || 'keyword-search',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error:', error.response?.data);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const errorMessage = { 
        role: 'assistant', 
        content: error.response?.data?.error || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h3>Chat about: {pdf?.title}</h3>
        <span className="search-badge">⚡ Instant Search</span>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <Message 
            key={index} 
            message={message} 
            isUser={message.role === 'user'}
            isTyping={message.isTyping}
            method={message.method}
          />
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a question about this PDF..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Ask'}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, User, Bot } from 'lucide-react';
import api from '../utils/api';
import './Chatbot.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Chatbot = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.getUser(user.id);
      setUserProfile(response.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      text: `Hello! I'm your AI assistant. I can help you with questions about skin cancer, provide health advice, and guide you on prevention and early detection. What would you like to know?`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setLoading(true);

    try {
      const response = await api.sendMessage(currentInput, user.id);

      const botMessage = {
        id: Date.now() + 1,
        text: response.response.message,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'I apologize, but I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const examplePrompts = [
    'What are the early signs of skin cancer?',
    'How can I prevent skin cancer?',
    'When should I see a dermatologist?',
    'What does a suspicious mole look like?'
  ];

  const handleExampleClick = (prompt) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="chatbot-wrapper">
      <motion.button
        onClick={() => navigate('/dashboard')}
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
        className="chatbot-back-button"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </motion.button>

      <div className="chatbot-container">
        <div className="chatbot-header">
          <motion.div
            className="header-icon-wrapper"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              repeatDelay: 2 
            }}
          >
            <Sparkles className="header-icon" />
          </motion.div>
          <div className="header-text">
            <h1>AI Assistant</h1>
            <p>Ask me anything about skin health</p>
          </div>
        </div>

        <div className="chatbot-messages-wrapper">
          <div className="messages-container">
            {messages.length === 1 && (
              <div className="welcome-section">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="welcome-content"
                >
                  <Sparkles size={48} className="welcome-icon" />
                  <h2>How can I help you today?</h2>
                  <div className="example-prompts">
                    {examplePrompts.map((prompt, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleExampleClick(prompt)}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        className="example-prompt"
                      >
                        {prompt}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index === messages.length - 1 ? 0.1 : 0 }}
                  className={`message-wrapper ${message.sender}`}
                >
                  <div className="message-container">
                    <div className={`message-avatar ${message.sender}`}>
                      {message.sender === 'bot' ? (
                        <motion.div
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            repeatDelay: 3 
                          }}
                        >
                          <Bot size={20} />
                        </motion.div>
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div className="message-bubble">
                      <div className="message-text">
                        {message.text.split('\n').map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < message.text.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="message-wrapper bot"
              >
                <div className="message-container">
                  <div className="message-avatar bot">
                    <Bot size={20} />
                  </div>
                  <div className="message-bubble">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="chatbot-input-wrapper">
          <form onSubmit={handleSend} className="input-form">
            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message AI Assistant..."
                className="chat-input"
                disabled={loading}
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || loading}
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                className="send-button"
              >
                <Send size={18} />
              </motion.button>
            </div>
            <p className="input-footer">
              AI can make mistakes. Always consult a healthcare professional for medical advice.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;

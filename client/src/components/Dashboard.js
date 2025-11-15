import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Clock, MessageCircle, User, LogOut, Shield, TrendingUp, Share2 } from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: Camera,
      title: 'Capture & Analyze',
      description: 'Take a photo and get AI-powered analysis',
      path: '/camera',
      color: '#8b5cf6'
    },
    {
      icon: Clock,
      title: 'Timeline',
      description: 'Track your skin condition over time',
      path: '/timeline',
      color: '#3b82f6'
    },
    {
      icon: MessageCircle,
      title: 'AI Chatbot',
      description: 'Get personalized health advice',
      path: '/chatbot',
      color: '#f97316'
    },
    {
      icon: User,
      title: 'Profile',
      description: 'View your health profile',
      path: '/profile',
      color: '#10b981'
    },
    {
      icon: Share2,
      title: 'Share App',
      description: 'Share SkinGuard with QR code',
      path: '/share',
      color: '#ec4899'
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
          >
            <Shield className="header-logo" />
          </motion.div>
          <div>
            <h1>Welcome back, {user.name}!</h1>
            <p>Your health is our priority</p>
          </div>
        </div>
        <motion.button
          onClick={onLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="logout-button"
        >
          <LogOut size={20} />
        </motion.button>
      </div>

      <div className="stats-grid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <TrendingUp className="stat-icon" />
          <div className="stat-content">
            <h3>Health Score</h3>
            <p className="stat-value">85%</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <Camera className="stat-icon" />
          <div className="stat-content">
            <h3>Scans</h3>
            <p className="stat-value">12</p>
          </div>
        </motion.div>
      </div>

      <div className="menu-grid">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05, y: -8, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className="menu-card"
            >
              <div className="menu-icon-wrapper">
                <Icon size={32} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="quick-tips">
        <h3>💡 Quick Tips</h3>
        <ul>
          <li>Perform regular skin checks monthly</li>
          <li>Use SPF 30+ sunscreen daily</li>
          <li>Stay hydrated and maintain a healthy diet</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import { ACHIEVEMENTS, getAchievementsByCategory } from '../data/achievements';
import '../styles/pixelated.css';
import './Achievements.css';

const Achievements = ({ unlockedAchievements = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'scanning', label: 'Scanning' },
    { id: 'medication', label: 'Medication' },
    { id: 'chatbot', label: 'Chatbot' },
    { id: 'streaks', label: 'Streaks' },
    { id: 'levels', label: 'Levels' },
    { id: 'special', label: 'Special' }
  ];

  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') {
      return ACHIEVEMENTS;
    }
    return getAchievementsByCategory(selectedCategory);
  };

  const isUnlocked = (achievementId) => {
    return unlockedAchievements.includes(achievementId);
  };

  return (
    <div className="achievements-container">
      <h2 className="achievements-title pixel-text">Achievements</h2>
      
      <div className="achievement-categories">
        {categories.map(category => (
          <motion.button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`category-button pixel-button ${selectedCategory === category.id ? 'active' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.label}
          </motion.button>
        ))}
      </div>

      <div className="achievements-grid">
        {getFilteredAchievements().map((achievement, index) => {
          const unlocked = isUnlocked(achievement.id);
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`achievement-card pixel-card ${unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">
                {unlocked ? (
                  <motion.div
                    className="achievement-badge unlocked"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <span className="achievement-emoji">{achievement.icon}</span>
                    <Trophy size={16} className="trophy-icon" />
                  </motion.div>
                ) : (
                  <div className="achievement-badge locked">
                    <Lock size={24} />
                  </div>
                )}
              </div>
              
              <div className="achievement-info">
                <h3 className="achievement-name pixel-text">{achievement.name}</h3>
                <p className="achievement-description">{achievement.description}</p>
                <div className="achievement-reward pixel-badge">
                  +{achievement.xpReward} XP
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;


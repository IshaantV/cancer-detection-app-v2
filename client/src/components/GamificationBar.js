import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap, Star, Coins } from 'lucide-react';
import { calculateLevel, levelProgress } from '../utils/gamification';
import '../styles/pixelated.css';
import './GamificationBar.css';

const GamificationBar = ({ user, gamification }) => {
  if (!gamification) {
    // Show default values if gamification is not loaded
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gamification-bar"
      >
        <div className="gamification-stats">
          <div className="stat-item level-stat">
            <div className="stat-label pixel-text">LVL</div>
            <div className="stat-value pixel-text-large">1</div>
          </div>
          <div className="stat-item hp-stat">
            <div className="stat-header">
              <Heart size={18} className="stat-icon" />
              <span className="stat-label pixel-text">HP</span>
              <span className="stat-value pixel-text">50/50</span>
            </div>
            <div className="pixel-progress-bar">
              <div className="pixel-progress-fill pixel-progress-red" style={{ width: '100%' }} />
            </div>
          </div>
          <div className="stat-item mp-stat">
            <div className="stat-header">
              <Zap size={18} className="stat-icon" />
              <span className="stat-label pixel-text">MP</span>
              <span className="stat-value pixel-text">20/50</span>
            </div>
            <div className="pixel-progress-bar">
              <div className="pixel-progress-fill pixel-progress-cyan" style={{ width: '40%' }} />
            </div>
          </div>
          <div className="stat-item gold-stat">
            <Coins size={20} className="stat-icon" />
            <span className="stat-value pixel-text-medium">0</span>
          </div>
        </div>
      </motion.div>
    );
  }

  const level = calculateLevel(gamification.xp || 0);
  const progress = levelProgress(gamification.xp || 0);
  const hp = gamification.hp || 50;
  const mp = gamification.mp || 20;
  const gold = gamification.gold || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="gamification-bar pixel-card"
    >
      <div className="gamification-stats">
        {/* Level Display */}
        <div className="stat-item level-stat">
          <div className="stat-label pixel-text">LVL</div>
          <div className="stat-value pixel-text-large">{level}</div>
        </div>

        {/* HP Bar */}
        <div className="stat-item hp-stat">
          <div className="stat-header">
            <Heart size={18} className="stat-icon" />
            <span className="stat-label pixel-text">HP</span>
            <span className="stat-value pixel-text">{hp}/50</span>
          </div>
          <div className="pixel-progress-bar">
            <motion.div
              className="pixel-progress-fill pixel-progress-red"
              initial={{ width: 0 }}
              animate={{ width: `${(hp / 50) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* MP Bar */}
        <div className="stat-item mp-stat">
          <div className="stat-header">
            <Zap size={18} className="stat-icon" />
            <span className="stat-label pixel-text">MP</span>
            <span className="stat-value pixel-text">{mp}/50</span>
          </div>
          <div className="pixel-progress-bar">
            <motion.div
              className="pixel-progress-fill pixel-progress-cyan"
              initial={{ width: 0 }}
              animate={{ width: `${(mp / 50) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* XP Bar */}
        <div className="stat-item xp-stat">
          <div className="stat-header">
            <Star size={18} className="stat-icon" />
            <span className="stat-label pixel-text">XP</span>
            <span className="stat-value pixel-text">{Math.round(progress)}%</span>
          </div>
          <div className="pixel-progress-bar">
            <motion.div
              className="pixel-progress-fill pixel-progress-yellow"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Gold */}
        <div className="stat-item gold-stat">
          <Coins size={20} className="stat-icon" />
          <span className="stat-value pixel-text-medium">{gold}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default GamificationBar;


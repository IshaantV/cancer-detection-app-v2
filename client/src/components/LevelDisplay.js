import React from 'react';
import { motion } from 'framer-motion';
import { calculateLevel, levelProgress, xpToNextLevel } from '../utils/gamification';
import '../styles/pixelated.css';
import './LevelDisplay.css';

const LevelDisplay = ({ xp, showProgress = true }) => {
  const level = calculateLevel(xp || 0);
  const progress = levelProgress(xp || 0);
  const xpNeeded = xpToNextLevel(xp || 0);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="level-display"
    >
      <div className="level-content">
        <div className="level-number pixel-text-large">
          {level}
        </div>
        <div className="level-label pixel-text">LEVEL</div>
        
        {showProgress && (
          <div className="level-progress-section">
            <div className="xp-to-next pixel-text-small">
              {xpNeeded} XP to next level
            </div>
            <div className="pixel-progress-bar">
              <motion.div
                className="pixel-progress-fill pixel-progress-yellow"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="xp-current pixel-text-small">
              {xp || 0} XP
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LevelDisplay;


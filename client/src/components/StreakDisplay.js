import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Pill, Camera } from 'lucide-react';
import '../styles/pixelated.css';
import './StreakDisplay.css';

const StreakDisplay = ({ streaks }) => {
  if (!streaks) return null;

  const streakItems = [
    {
      icon: Flame,
      label: 'Daily Check-in',
      value: streaks.dailyCheckIn || 0,
      color: '#FF6B6B'
    },
    {
      icon: Pill,
      label: 'Medication',
      value: streaks.medicationAdherence || 0,
      color: '#4ECDC4'
    },
    {
      icon: Camera,
      label: 'Weekly Scans',
      value: streaks.weeklyScans || 0,
      color: '#FFE66D'
    }
  ];

  return (
    <div className="streak-display">
      <h3 className="streak-title pixel-text">Streaks</h3>
      <div className="streak-items">
        {streakItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="streak-item pixel-card"
            >
              <div className="streak-icon-wrapper" style={{ background: `${item.color}20` }}>
                <Icon size={24} style={{ color: item.color }} />
              </div>
              <div className="streak-content">
                <div className="streak-value pixel-text-medium" style={{ color: item.color }}>
                  {item.value}
                </div>
                <div className="streak-label pixel-text-small">
                  {item.label}
                </div>
              </div>
              {item.value > 0 && (
                <motion.div
                  className="streak-fire"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🔥
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StreakDisplay;


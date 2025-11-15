/**
 * Achievement definitions for the gamification system
 */

export const ACHIEVEMENTS = [
  // Scanning Achievements
  {
    id: 'first_scan',
    name: 'First Scan',
    description: 'Complete your first skin scan',
    icon: '📸',
    category: 'scanning',
    xpReward: 10,
    unlockCondition: (stats) => stats.scansCompleted >= 1
  },
  {
    id: 'weekly_warrior',
    name: 'Weekly Warrior',
    description: 'Complete 7 scans in one week',
    icon: '⚔️',
    category: 'scanning',
    xpReward: 50,
    unlockCondition: (stats) => stats.weeklyScans >= 7
  },
  {
    id: 'scan_master',
    name: 'Scan Master',
    description: 'Complete 50 scans',
    icon: '🏆',
    category: 'scanning',
    xpReward: 200,
    unlockCondition: (stats) => stats.scansCompleted >= 50
  },
  {
    id: 'monthly_monitor',
    name: 'Monthly Monitor',
    description: 'Complete 30 scans in a month',
    icon: '📅',
    category: 'scanning',
    xpReward: 150,
    unlockCondition: (stats) => stats.monthlyScans >= 30
  },

  // Medication Achievements
  {
    id: 'first_medication',
    name: 'First Medication',
    description: 'Take your first scheduled medication',
    icon: '💊',
    category: 'medication',
    xpReward: 15,
    unlockCondition: (stats) => stats.medicationsTaken >= 1
  },
  {
    id: 'medication_master',
    name: 'Medication Master',
    description: 'Take medications on time for 30 days',
    icon: '👑',
    category: 'medication',
    xpReward: 100,
    unlockCondition: (stats, streaks) => streaks.medicationAdherence >= 30
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Take all medications on time for 7 days',
    icon: '⭐',
    category: 'medication',
    xpReward: 75,
    unlockCondition: (stats, streaks) => streaks.medicationAdherence >= 7
  },
  {
    id: 'medication_hero',
    name: 'Medication Hero',
    description: 'Take 100 medications on time',
    icon: '🦸',
    category: 'medication',
    xpReward: 300,
    unlockCondition: (stats) => stats.medicationsTaken >= 100
  },

  // Chatbot Achievements
  {
    id: 'chat_champion',
    name: 'Chat Champion',
    description: 'Send 10 messages to the chatbot',
    icon: '💬',
    category: 'chatbot',
    xpReward: 25,
    unlockCondition: (stats) => stats.chatbotInteractions >= 10
  },
  {
    id: 'curious_mind',
    name: 'Curious Mind',
    description: 'Send 50 messages to the chatbot',
    icon: '🧠',
    category: 'chatbot',
    xpReward: 100,
    unlockCondition: (stats) => stats.chatbotInteractions >= 50
  },
  {
    id: 'health_expert',
    name: 'Health Expert',
    description: 'Send 100 messages to the chatbot',
    icon: '🎓',
    category: 'chatbot',
    xpReward: 250,
    unlockCondition: (stats) => stats.chatbotInteractions >= 100
  },

  // Streak Achievements
  {
    id: 'streak_star',
    name: 'Streak Star',
    description: 'Maintain a 7-day check-in streak',
    icon: '⭐',
    category: 'streaks',
    xpReward: 75,
    unlockCondition: (stats, streaks) => streaks.dailyCheckIn >= 7
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Maintain a 14-day check-in streak',
    icon: '🔥',
    category: 'streaks',
    xpReward: 150,
    unlockCondition: (stats, streaks) => streaks.dailyCheckIn >= 14
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Maintain a 30-day check-in streak',
    icon: '💪',
    category: 'streaks',
    xpReward: 500,
    unlockCondition: (stats, streaks) => streaks.dailyCheckIn >= 30
  },
  {
    id: 'legendary',
    name: 'Legendary',
    description: 'Maintain a 100-day check-in streak',
    icon: '👑',
    category: 'streaks',
    xpReward: 2000,
    unlockCondition: (stats, streaks) => streaks.dailyCheckIn >= 100
  },

  // Level Achievements
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    category: 'levels',
    xpReward: 100,
    unlockCondition: (stats, level) => level >= 5
  },
  {
    id: 'level_10',
    name: 'Veteran',
    description: 'Reach level 10',
    icon: '🏅',
    category: 'levels',
    xpReward: 300,
    unlockCondition: (stats, level) => level >= 10
  },
  {
    id: 'level_20',
    name: 'Master',
    description: 'Reach level 20',
    icon: '🎖️',
    category: 'levels',
    xpReward: 750,
    unlockCondition: (stats, level) => level >= 20
  },
  {
    id: 'level_50',
    name: 'Grandmaster',
    description: 'Reach level 50',
    icon: '👑',
    category: 'levels',
    xpReward: 2000,
    unlockCondition: (stats, level) => level >= 50
  },

  // Special Achievements
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a scan before 8 AM',
    icon: '🌅',
    category: 'special',
    xpReward: 25,
    unlockCondition: (stats) => stats.earlyScans >= 1
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a scan after 10 PM',
    icon: '🦉',
    category: 'special',
    xpReward: 25,
    unlockCondition: (stats) => stats.lateScans >= 1
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Unlock 10 achievements',
    icon: '🎖️',
    category: 'special',
    xpReward: 200,
    unlockCondition: (stats, achievements) => achievements.length >= 10
  }
];

/**
 * Get achievements by category
 */
export const getAchievementsByCategory = (category) => {
  return ACHIEVEMENTS.filter(ach => ach.category === category);
};

/**
 * Get achievement by ID
 */
export const getAchievementById = (id) => {
  return ACHIEVEMENTS.find(ach => ach.id === id);
};

/**
 * Check which achievements should be unlocked
 */
export const checkAchievements = (userStats, userStreaks, userLevel, unlockedAchievements) => {
  const newAchievements = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    // Skip if already unlocked
    if (unlockedAchievements.includes(achievement.id)) {
      return;
    }
    
    // Check unlock condition
    if (achievement.unlockCondition(userStats, userStreaks, userLevel)) {
      newAchievements.push(achievement);
    }
  });
  
  return newAchievements;
};


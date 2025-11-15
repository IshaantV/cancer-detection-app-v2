/**
 * Gamification utilities for XP, levels, achievements, and streaks
 */

// XP Rewards for different actions
export const XP_REWARDS = {
  SCAN_COMPLETE: 50,
  MEDICATION_TAKEN: 25,
  CHATBOT_MESSAGE: 10,
  DAILY_CHECK_IN: 15,
  WEEKLY_GOAL: 100,
  LEVEL_UP_BONUS: 200,
  ACHIEVEMENT_UNLOCK: 50
};

/**
 * Calculate level from XP
 * Formula: level = floor(sqrt(xp / 100))
 */
export const calculateLevel = (xp) => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

/**
 * Calculate XP required for a specific level
 */
export const xpForLevel = (level) => {
  return Math.pow(level - 1, 2) * 100;
};

/**
 * Calculate XP needed for next level
 */
export const xpToNextLevel = (currentXP) => {
  const currentLevel = calculateLevel(currentXP);
  const nextLevelXP = xpForLevel(currentLevel + 1);
  return nextLevelXP - currentXP;
};

/**
 * Calculate progress percentage to next level
 */
export const levelProgress = (currentXP) => {
  const currentLevel = calculateLevel(currentXP);
  const currentLevelXP = xpForLevel(currentLevel);
  const nextLevelXP = xpForLevel(currentLevel + 1);
  const progressXP = currentXP - currentLevelXP;
  const totalXPNeeded = nextLevelXP - currentLevelXP;
  return Math.min(100, Math.max(0, (progressXP / totalXPNeeded) * 100));
};

/**
 * Check if user leveled up
 */
export const checkLevelUp = (oldXP, newXP) => {
  const oldLevel = calculateLevel(oldXP);
  const newLevel = calculateLevel(newXP);
  return newLevel > oldLevel;
};

/**
 * Calculate HP (Health Points) based on activity
 * Max 50, decreases if inactive
 */
export const calculateHP = (userStats) => {
  const daysSinceLastActivity = userStats.daysSinceLastActivity || 0;
  const baseHP = 50;
  const hpLoss = Math.min(50, daysSinceLastActivity * 5);
  return Math.max(0, baseHP - hpLoss);
};

/**
 * Calculate MP (Mana Points) based on recent activity
 * Max 50, regenerates with activity
 */
export const calculateMP = (userStats) => {
  const recentActivity = userStats.recentActivity || 0;
  const baseMP = 20;
  const mpGain = Math.min(30, recentActivity * 2);
  return Math.min(50, baseMP + mpGain);
};

/**
 * Calculate gold based on level and achievements
 */
export const calculateGold = (user) => {
  const level = calculateLevel(user.xp || 0);
  const achievementBonus = (user.achievements || []).length * 10;
  const baseGold = level * 5;
  return baseGold + achievementBonus + (user.gold || 0);
};

/**
 * Check if streak should reset
 */
export const shouldResetStreak = (lastActivityDate, streakType) => {
  if (!lastActivityDate) return true;
  
  const lastActivity = new Date(lastActivityDate);
  const now = new Date();
  const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (streakType === 'daily') {
    return daysDiff > 1; // Reset if more than 1 day passed
  } else if (streakType === 'weekly') {
    return daysDiff > 7; // Reset if more than 7 days passed
  }
  
  return false;
};

/**
 * Update streak
 */
export const updateStreak = (currentStreak, lastActivityDate, streakType) => {
  if (shouldResetStreak(lastActivityDate, streakType)) {
    return 0;
  }
  
  const lastActivity = new Date(lastActivityDate);
  const now = new Date();
  const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    return currentStreak; // Same day, no change
  } else if (daysDiff === 1) {
    return currentStreak + 1; // Consecutive day
  } else {
    return 0; // Reset
  }
};

/**
 * Get streak milestone rewards
 */
export const getStreakMilestoneXP = (streak) => {
  if (streak === 7) return 50;
  if (streak === 14) return 100;
  if (streak === 30) return 250;
  if (streak === 60) return 500;
  if (streak === 100) return 1000;
  return 0;
};

/**
 * Default gamification state for new users
 */
export const getDefaultGamification = () => {
  return {
    xp: 0,
    level: 1,
    hp: 50,
    mp: 20,
    gold: 0,
    achievements: [],
    streaks: {
      dailyCheckIn: 0,
      medicationAdherence: 0,
      weeklyScans: 0
    },
    stats: {
      scansCompleted: 0,
      medicationsTaken: 0,
      chatbotInteractions: 0,
      daysActive: 1,
      lastCheckIn: null,
      lastActivityDate: new Date().toISOString()
    }
  };
};


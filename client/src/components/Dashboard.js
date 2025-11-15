import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Clock, MessageCircle, User, LogOut, Shield, TrendingUp, Share2, RefreshCw } from 'lucide-react';
import MedicationTracker from './MedicationTracker';
import GamificationBar from './GamificationBar';
import LevelDisplay from './LevelDisplay';
import StreakDisplay from './StreakDisplay';
import Achievements from './Achievements';
import api from '../utils/api';
import '../styles/pixelated.css';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadGamification = useCallback(async (showRefreshing = false) => {
    if (!user || !user.id) return;
    
    if (showRefreshing) {
      setRefreshing(true);
    }
    
    try {
      console.log('🔄 Loading gamification for user:', user.id);
      const response = await api.getGamification(user.id);
      console.log('📥 Gamification response:', response);
      
      if (response && response.gamification) {
        console.log('✅ Setting gamification:', {
          xp: response.gamification.xp,
          level: response.gamification.level,
          scansCompleted: response.gamification.stats?.scansCompleted
        });
        setGamification(response.gamification);
      } else {
        console.warn('⚠️ No gamification data in response, using defaults');
        // Initialize default gamification if none exists
        setGamification({
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
            daysActive: 1
          }
        });
      }
    } catch (error) {
      console.error('❌ Error loading gamification:', error);
      // Set default gamification on error
      setGamification({
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
          daysActive: 1
        }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  const checkInDaily = useCallback(async () => {
    if (!user || !user.id) return null;
    
    try {
      console.log('🔄 Checking in daily...');
      const response = await api.checkIn(user.id);
      console.log('✅ Check-in response:', response);
      
      if (response && response.success) {
        console.log('✅ Daily check-in successful!', {
          xp: response.gamification?.xp,
          level: response.gamification?.level,
          leveledUp: response.leveledUp
        });
        
        // Update gamification state immediately
        if (response.gamification) {
          setGamification(response.gamification);
        }
        
        // Also reload to ensure consistency
        await loadGamification(true);
        
        return response;
      } else {
        console.warn('⚠️ Check-in response missing success flag');
        await loadGamification(true);
        return response;
      }
    } catch (error) {
      console.error('❌ Error checking in:', error);
      // Don't fail silently - still load gamification
      await loadGamification();
      return null;
    }
  }, [user?.id, loadGamification]);

  useEffect(() => {
    if (user && user.id) {
      // Always show default gamification immediately
      setGamification({
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
          daysActive: 1
        }
      });
      setLoading(false);
      
      // Then try to load from server
      const loadData = async () => {
        await loadGamification();
        await checkInDaily();
      };
      loadData();
    }
  }, [user?.id, loadGamification, checkInDaily]);

  // Refresh gamification when navigating back to dashboard
  useEffect(() => {
    if (location.pathname === '/dashboard' && user?.id) {
      console.log('🔄 Dashboard route detected, refreshing gamification...');
      loadGamification(true);
    }
  }, [location.pathname, user?.id, loadGamification]);

  // Refresh gamification when component becomes visible (user returns from other pages)
  useEffect(() => {
    if (!user || !user.id) return;
    
    const handleFocus = () => {
      console.log('🔄 Dashboard focused, refreshing gamification...');
      loadGamification(true);
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Dashboard visible, refreshing gamification...');
        loadGamification(true);
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, loadGamification]);

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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <motion.button
            onClick={async () => {
              console.log('🔄 Manual refresh clicked');
              await loadGamification(true);
            }}
            disabled={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="refresh-button"
            title="Refresh rewards"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '2px solid #22c55e',
              borderRadius: '8px',
              padding: '8px',
              cursor: refreshing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} style={{ color: '#22c55e' }} />
          </motion.button>
          <motion.button
            onClick={async () => {
              console.log('✅ Daily check-in button clicked');
              const response = await checkInDaily();
              if (response && response.leveledUp) {
                setTimeout(() => {
                  alert(`🎉 Level Up! You've reached level ${response.newLevel}!`);
                }, 300);
              } else if (response && response.success) {
                setTimeout(() => {
                  alert(`✅ Daily check-in complete! +15 XP`);
                }, 300);
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="checkin-button"
            title="Daily check-in (+15 XP)"
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '2px solid #8b5cf6',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#8b5cf6',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            <span>✓</span>
            <span>Get XP</span>
          </motion.button>
          <motion.button
            onClick={onLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="logout-button"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </div>

      {gamification && (
        <>
          <GamificationBar user={user} gamification={gamification} />
          <div className="gamification-section">
            <div className="level-streak-container">
              <LevelDisplay xp={gamification.xp || 0} showProgress={true} />
              <StreakDisplay streaks={gamification.streaks || {}} />
            </div>
          </div>
        </>
      )}

      <div className="stats-grid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <TrendingUp className="stat-icon" />
          <div className="stat-content">
            <h3>Health Score</h3>
            <p className="stat-value">{gamification ? `${gamification.hp}%` : '85%'}</p>
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
            <p className="stat-value">{gamification ? gamification.stats.scansCompleted : '0'}</p>
          </div>
        </motion.div>
        {gamification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <MessageCircle className="stat-icon" />
            <div className="stat-content">
              <h3>Chats</h3>
              <p className="stat-value">{gamification.stats.chatbotInteractions}</p>
            </div>
          </motion.div>
        )}
      </div>

      <MedicationTracker user={user} />

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

      {gamification && (
        <Achievements unlockedAchievements={gamification.achievements} />
      )}

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


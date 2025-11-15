import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Calendar, Sun, Heart, Pill, Shield, CalendarCheck, Clock, MapPin, Phone } from 'lucide-react';
import api from '../utils/api';
import './Profile.css';

const Profile = ({ user }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [appointmentSubmitted, setAppointmentSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      console.log('🔄 Fetching profile for user:', user.id);
      const response = await api.getUser(user.id);
      if (response && response.user) {
        console.log('✅ Profile loaded:', response.user);
        setUserProfile(response.user);
      } else {
        console.warn('⚠️ No user data in response, using current user data');
        // Fallback to current user data if API doesn't return it
        setUserProfile(user);
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      // If API fails, use the current user data as fallback
      console.log('ℹ️ Using current user data as fallback');
      setUserProfile(user);
    } finally {
      setLoading(false);
    }
  };

  const getPersonalizedRecommendations = () => {
    const displayUser = userProfile || user;
    if (!displayUser || !displayUser.quizAnswers) return [];

    const { quizAnswers } = displayUser;
    const recommendations = [];

    if (quizAnswers.skinType === 'fair') {
      recommendations.push({
        icon: Sun,
        title: 'Sun Protection',
        description: 'Use SPF 50+ sunscreen daily, even on cloudy days',
        priority: 'high'
      });
    }

    if (quizAnswers.sunExposure === 'high') {
      recommendations.push({
        icon: Shield,
        title: 'Protective Clothing',
        description: 'Wear long sleeves, hats, and UV-protective clothing',
        priority: 'high'
      });
    }

    if (quizAnswers.familyHistory === 'yes') {
      recommendations.push({
        icon: Calendar,
        title: 'Regular Checkups',
        description: 'Schedule annual dermatologist appointments',
        priority: 'high'
      });
    }

    if (quizAnswers.previousSkinIssues !== 'none') {
      recommendations.push({
        icon: Heart,
        title: 'Monitor Changes',
        description: 'Perform monthly self-examinations and track any changes',
        priority: 'medium'
      });
    }

    if (quizAnswers.medications) {
      recommendations.push({
        icon: Pill,
        title: 'Medication Review',
        description: 'Discuss your medications with your doctor regarding sun sensitivity',
        priority: 'medium'
      });
    }

    return recommendations;
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">Loading profile...</div>
      </div>
    );
  }

  if (!userProfile && !user) {
    return (
      <div className="profile-container">
        <div className="error-state">Unable to load profile. Please log in again.</div>
        <motion.button
          onClick={() => navigate('/login')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="back-button"
        >
          Go to Login
        </motion.button>
      </div>
    );
  }

  // Use current user if profile fetch failed
  const displayUser = userProfile || user;

  const recommendations = getPersonalizedRecommendations();

  return (
    <div className="profile-container">
      <motion.button
        onClick={() => navigate('/dashboard')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="back-button"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </motion.button>

      <div className="profile-header">
        <div className="profile-avatar">
          <User size={40} />
        </div>
        <div>
          <h1>{displayUser.name}</h1>
          <p>{displayUser.email}</p>
        </div>
      </div>

      {displayUser.quizAnswers && (
        <>
          <div className="profile-section">
            <h2>Health Profile</h2>
            <div className="profile-grid">
              <div className="profile-item">
                <Calendar size={24} className="profile-icon" />
                <div>
                  <label>Age Range</label>
                  <p>{displayUser.quizAnswers.age || 'Not specified'}</p>
                </div>
              </div>
              <div className="profile-item">
                <Sun size={24} className="profile-icon" />
                <div>
                  <label>Skin Type</label>
                  <p>{displayUser.quizAnswers.skinType || 'Not specified'}</p>
                </div>
              </div>
              <div className="profile-item">
                <Shield size={24} className="profile-icon" />
                <div>
                  <label>Sun Exposure</label>
                  <p>{displayUser.quizAnswers.sunExposure || 'Not specified'}</p>
                </div>
              </div>
              <div className="profile-item">
                <Heart size={24} className="profile-icon" />
                <div>
                  <label>Family History</label>
                  <p>{displayUser.quizAnswers.familyHistory || 'Not specified'}</p>
                </div>
              </div>
              <div className="profile-item">
                <User size={24} className="profile-icon" />
                <div>
                  <label>Previous Issues</label>
                  <p>{displayUser.quizAnswers.previousSkinIssues || 'None'}</p>
                </div>
              </div>
              {displayUser.quizAnswers.medications && (
                <div className="profile-item full-width">
                  <Pill size={24} className="profile-icon" />
                  <div>
                    <label>Medications</label>
                    <p>{displayUser.quizAnswers.medications}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {recommendations.length > 0 && (
            <div className="profile-section">
              <h2>Personalized Recommendations</h2>
              <div className="recommendations-grid">
                {recommendations.map((rec, idx) => {
                  const Icon = rec.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`recommendation-card ${rec.priority}`}
                    >
                      <div className="recommendation-icon">
                        <Icon size={28} />
                      </div>
                      <h3>{rec.title}</h3>
                      <p>{rec.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="profile-section">
        <h2>Account Information</h2>
        <div className="account-info">
          <div className="info-item">
            <label>Member Since</label>
            <p>{displayUser.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : 'Recently'}</p>
          </div>
        </div>
      </div>

      {/* Dermatologist Appointment Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="appointment-box"
      >
        <div className="appointment-header">
          <CalendarCheck size={24} className="appointment-icon" />
          <h2>Schedule Dermatologist Appointment</h2>
        </div>
        
        {appointmentSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="appointment-success"
          >
            <CalendarCheck size={32} color="#22c55e" />
            <h3>Appointment Request Submitted!</h3>
            <p>Your appointment request has been recorded. A dermatologist will contact you to confirm.</p>
            <motion.button
              onClick={() => {
                setAppointmentSubmitted(false);
                setAppointmentDate('');
                setAppointmentTime('');
                setAppointmentNotes('');
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="appointment-button"
            >
              Schedule Another
            </motion.button>
          </motion.div>
        ) : (
          <div className="appointment-form">
            <div className="appointment-info">
              <div className="info-row">
                <MapPin size={18} />
                <span>Find a dermatologist near you</span>
              </div>
              <div className="info-row">
                <Phone size={18} />
                <span>Call to confirm availability</span>
              </div>
              <div className="info-row">
                <Clock size={18} />
                <span>Typical wait time: 2-4 weeks</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="appointment-date">
                <Calendar size={18} />
                Preferred Date
              </label>
              <input
                id="appointment-date"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="appointment-time">
                <Clock size={18} />
                Preferred Time
              </label>
              <select
                id="appointment-time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
              >
                <option value="">Select time</option>
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="17:00">5:00 PM</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="appointment-notes">
                <User size={18} />
                Reason for Visit (Optional)
              </label>
              <textarea
                id="appointment-notes"
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
                placeholder="e.g., Annual skin check, suspicious mole, follow-up..."
                rows="3"
              />
            </div>

            <motion.button
              onClick={() => {
                if (appointmentDate && appointmentTime) {
                  // In a real app, this would send to a backend
                  console.log('Appointment requested:', {
                    date: appointmentDate,
                    time: appointmentTime,
                    notes: appointmentNotes,
                    userId: displayUser.id
                  });
                  setAppointmentSubmitted(true);
                }
              }}
              disabled={!appointmentDate || !appointmentTime}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="appointment-submit-button"
            >
              <CalendarCheck size={20} />
              Request Appointment
            </motion.button>

            <p className="appointment-disclaimer">
              * This is a request form. Please contact your dermatologist directly to confirm the appointment.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import FacebookLogin from 'react-facebook-login';
import { UserPlus, Shield, CheckCircle } from 'lucide-react';
import GoogleLoginButton from './GoogleLoginButton';
import api from '../utils/api';
import './Register.css';

// Get API base URL for direct axios calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Register = ({ onLogin, hasGoogleOAuth = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [quizAnswers, setQuizAnswers] = useState({
    age: '',
    skinType: '',
    sunExposure: '',
    familyHistory: '',
    previousSkinIssues: '',
    medications: ''
  });
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuizChange = (e) => {
    setQuizAnswers({ ...quizAnswers, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      setLoading(true);
      try {
        const response = await api.register({
          ...formData,
          quizAnswers
        });

        if (response.success) {
          onLogin(response.user);
          navigate('/dashboard');
        } else {
          setError(response.message || 'Registration failed. Please try again.');
        }
      } catch (err) {
        console.error('Registration error:', err);
        // Show more helpful error messages
        let errorMessage = err.message || 'Registration failed. Please try again.';
        
        // Check if it's a network error
        if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('Load failed') || err.message.includes('network'))) {
          errorMessage = 'Network error: Cannot connect to server. Please check your internet connection and try again.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleLoginSuccess = async (tokenResponse) => {
    try {
      const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      });
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        token: tokenResponse.access_token
      });

      if (response.data.success) {
        onLogin(response.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google login failed. Please try again.');
    }
  };

  const handleGoogleLoginError = () => {
    setError('Google login failed. Please try again.');
  };

  const handleFacebookLogin = async (response) => {
    try {
      if (response.accessToken) {
        const authResponse = await axios.post(`${API_BASE_URL}/api/auth/facebook`, {
          accessToken: response.accessToken,
          userID: response.userID,
          name: response.name,
          email: response.email,
          picture: response.picture
        });

        if (authResponse.data.success) {
          onLogin(authResponse.data.user);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Facebook login error:', err);
      setError('Facebook login failed. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="register-card"
      >
        <div className="register-header">
          <Shield className="logo-icon" />
          <h1>Create Account</h1>
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && <div className="error-message">{error}</div>}

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="form-step"
            >
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Create a password"
                  minLength="6"
                />
              </div>

              <div className="input-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm your password"
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="register-button"
              >
                Next: Health Quiz
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="form-step"
            >
              <h3>Health & Skin Assessment</h3>
              <p className="quiz-description">Help us personalize your experience</p>

              <div className="input-group">
                <label>Age Range</label>
                <select name="age" value={quizAnswers.age} onChange={handleQuizChange} required>
                  <option value="">Select age range</option>
                  <option value="18-30">18-30</option>
                  <option value="31-45">31-45</option>
                  <option value="46-60">46-60</option>
                  <option value="60+">60+</option>
                </select>
              </div>

              <div className="input-group">
                <label>Skin Type</label>
                <select name="skinType" value={quizAnswers.skinType} onChange={handleQuizChange} required>
                  <option value="">Select skin type</option>
                  <option value="fair">Fair (burns easily)</option>
                  <option value="medium">Medium</option>
                  <option value="olive">Olive</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div className="input-group">
                <label>Sun Exposure</label>
                <select name="sunExposure" value={quizAnswers.sunExposure} onChange={handleQuizChange} required>
                  <option value="">Select exposure level</option>
                  <option value="low">Low (mostly indoors)</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High (outdoor work/activities)</option>
                </select>
              </div>

              <div className="input-group">
                <label>Family History of Skin Cancer</label>
                <select name="familyHistory" value={quizAnswers.familyHistory} onChange={handleQuizChange} required>
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="unsure">Unsure</option>
                </select>
              </div>

              <div className="input-group">
                <label>Previous Skin Issues</label>
                <select name="previousSkinIssues" value={quizAnswers.previousSkinIssues} onChange={handleQuizChange} required>
                  <option value="">Select option</option>
                  <option value="none">None</option>
                  <option value="moles">Moles</option>
                  <option value="rashes">Rashes</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <label>Current Medications</label>
                <input
                  type="text"
                  name="medications"
                  value={quizAnswers.medications}
                  onChange={handleQuizChange}
                  placeholder="List any medications (optional)"
                />
              </div>

              <div className="button-group">
                <motion.button
                  type="button"
                  onClick={() => setStep(1)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="back-button"
                >
                  Back
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="register-button"
                >
                  {loading ? 'Creating Account...' : (
                    <>
                      <UserPlus size={20} />
                      Create Account
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </form>

        <div className="oauth-divider">
          <span>OR</span>
        </div>

        <div className="oauth-buttons">
          {hasGoogleOAuth ? (
            <GoogleLoginButton
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
          ) : (
            <motion.button
              onClick={() => setError('Google OAuth is not configured. Please set REACT_APP_GOOGLE_CLIENT_ID in your .env file.')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="oauth-button google-button"
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.965-2.184l-2.908-2.258c-.806.54-1.837.86-3.057.86-2.35 0-4.34-1.587-5.053-3.72H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.947 10.698c-.18-.54-.282-1.117-.282-1.698s.102-1.158.282-1.698V4.97H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.03l2.99-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.97L3.947 7.302C4.66 5.167 6.65 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </motion.button>
          )}

          {process.env.REACT_APP_FACEBOOK_APP_ID ? (
            <FacebookLogin
              appId={process.env.REACT_APP_FACEBOOK_APP_ID}
              autoLoad={false}
              fields="name,email,picture"
              callback={handleFacebookLogin}
              cssClass="oauth-button facebook-button"
              icon="fa-facebook"
              textButton="Continue with Facebook"
            />
          ) : (
            <motion.button
              onClick={() => setError('Facebook OAuth is not configured. Please set REACT_APP_FACEBOOK_APP_ID in your .env file.')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="oauth-button facebook-button"
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            >
              Continue with Facebook
            </motion.button>
          )}
        </div>

        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import FacebookLogin from 'react-facebook-login';
import { LogIn, Shield, Sparkles } from 'lucide-react';
import GoogleLoginButton from './GoogleLoginButton';
import api from '../utils/api';
import './Login.css';

// Get API base URL for direct axios calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Login = ({ onLogin, hasGoogleOAuth = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login({
        email,
        password
      });

      if (response.success) {
        onLogin(response.user);
        navigate('/dashboard');
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
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
      setError('Facebook login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="login-card"
      >
        <div className="login-header">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Shield className="logo-icon" />
          </motion.div>
          <h1>SkinGuard</h1>
          <p className="tagline">AI-Powered Skin Cancer Detection</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="login-button"
          >
            {loading ? 'Logging in...' : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </motion.button>
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

        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </motion.div>

      <div className="floating-elements">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-circle"
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 20 - 10, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Login;


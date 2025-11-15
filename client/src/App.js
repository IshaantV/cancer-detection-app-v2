import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CameraCapture from './components/CameraCapture';
import Timeline from './components/Timeline';
import Chatbot from './components/Chatbot';
import Profile from './components/Profile';
import Share from './components/Share';
import ApiTest from './components/ApiTest';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  // Only enable Google OAuth if we have a valid, non-empty client ID
  const hasGoogleOAuth = Boolean(googleClientId && googleClientId.trim() !== '' && googleClientId.length > 10);

  const AppContent = () => (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={handleLogin} hasGoogleOAuth={hasGoogleOAuth} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register onLogin={handleLogin} hasGoogleOAuth={hasGoogleOAuth} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/camera" 
            element={user ? <CameraCapture user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/timeline" 
            element={user ? <Timeline user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/chatbot" 
            element={user ? <Chatbot user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/share" 
            element={<Share user={user} />} 
          />
          <Route 
            path="/api-test" 
            element={<ApiTest />} 
          />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );

  return (
    hasGoogleOAuth ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <AppContent />
      </GoogleOAuthProvider>
    ) : (
      <AppContent />
    )
  );
}

export default App;


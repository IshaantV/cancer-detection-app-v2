import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, Camera, Flame, Download } from 'lucide-react';
import axios from 'axios';
import './Share.css';

const Share = ({ user }) => {
  const [copied, setCopied] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [localIp, setLocalIp] = useState(null);
  const qrRef = useRef(null);
  
  // Get the shareable URL
  const getShareableUrl = () => {
    // First, check if there's an environment variable for public URL
    const publicUrl = process.env.REACT_APP_PUBLIC_URL;
    if (publicUrl && publicUrl.trim() !== '') {
      return publicUrl.trim();
    }
    
    // If we're on localhost, try to use the local network IP
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      // If we have the local IP, use it
      if (localIp) {
        const port = window.location.port || '3000';
        return `http://${localIp}:${port}`;
      }
      // Otherwise return localhost (will show warning)
      return origin;
    }
    
    // For production or non-localhost, use the origin
    return origin;
  };
  
  const websiteUrl = getShareableUrl();
  const isLocalhost = websiteUrl.includes('localhost') || websiteUrl.includes('127.0.0.1');

  useEffect(() => {
    if (user) {
      fetchUserStats();
    } else {
      setLoading(false);
    }
    
    // Try to get local network IP for development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Use WebRTC to get local IP (works in most browsers)
      const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
      if (RTCPeerConnection) {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            const match = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
            if (match && match[1] && !match[1].startsWith('127.') && !match[1].startsWith('169.254.')) {
              setLocalIp(match[1]);
              pc.close();
            }
          }
        };
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
      }
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_BASE_URL}/api/images/${user.id}`);
      const images = response.data.images || [];
      setScanCount(images.length);
      
      // Calculate streak: consecutive days with at least one scan
      const streakCount = calculateStreak(images);
      setStreak(streakCount);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (images) => {
    if (images.length === 0) return 0;
    
    // Group images by date (normalize to date only, no time)
    const imagesByDate = {};
    images.forEach(img => {
      const date = new Date(img.uploadedAt);
      date.setHours(0, 0, 0, 0);
      const dateString = date.toDateString();
      if (!imagesByDate[dateString]) {
        imagesByDate[dateString] = [];
      }
      imagesByDate[dateString].push(img);
    });

    // Get all unique dates and sort them (most recent first)
    const dates = Object.keys(imagesByDate).sort((a, b) => new Date(b) - new Date(a));
    
    if (dates.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const mostRecentDate = new Date(dates[0]);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    // Calculate days difference
    const daysDiff = Math.floor((today - mostRecentDate) / (1000 * 60 * 60 * 24));
    
    // If the most recent scan is more than 1 day ago, streak is broken
    if (daysDiff > 1) return 0;
    
    // Start counting from today or most recent date (whichever is earlier)
    let streak = 0;
    let currentDate = new Date(today);
    
    // If most recent scan was yesterday, start from yesterday
    if (daysDiff === 1) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // Check consecutive days backwards
    while (true) {
      const dateString = currentDate.toDateString();
      
      if (imagesByDate[dateString]) {
        streak++;
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Streak broken
        break;
      }
      
      // Safety check to prevent infinite loop
      if (streak > 365) break;
    }
    
    return streak;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(websiteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = async () => {
    if (!qrRef.current) return;
    
    setDownloading(true);
    try {
      const svgElement = qrRef.current.querySelector('svg');
      if (!svgElement) return;

      // Convert SVG to canvas then to image
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          const link = document.createElement('a');
          link.download = `skinguard-qr-code-${Date.now()}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(url);
          setDownloading(false);
        });
      };

      img.src = url;
    } catch (error) {
      console.error('Error downloading QR code:', error);
      setDownloading(false);
    }
  };

  return (
    <div className="share-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="share-card"
      >
        <div className="share-header">
          <Share2 className="share-icon" />
          <h1>Share SkinGuard</h1>
          <p>Scan the QR code to access the app</p>
        </div>

        <div className="qr-section">
          {isLocalhost && !localIp && !process.env.REACT_APP_PUBLIC_URL && (
            <div className="localhost-warning">
              <p className="warning-text">
                ⚠️ <strong>Development Mode:</strong> This QR code points to localhost and won't work on other devices.
              </p>
              <p className="warning-instructions">
                To share with others, either:
                <br />1. Set <code>REACT_APP_PUBLIC_URL</code> in your <code>.env</code> file to your public URL (e.g., http://10.14.177.80:3000)
                <br />2. Restart your dev server after setting the environment variable
                <br />3. Or deploy your app to a hosting service
              </p>
            </div>
          )}
          <div className="qr-wrapper" ref={qrRef}>
            <QRCodeSVG
              value={websiteUrl}
              size={300}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="qr-description">
            Point your camera at this code to open SkinGuard
          </p>
          {process.env.REACT_APP_PUBLIC_URL && (
            <p className="local-ip-info">
              ✅ Using configured URL: <strong>{websiteUrl}</strong>
              <br />
              <small>Make sure your phone is on the same Wi-Fi network</small>
            </p>
          )}
          {isLocalhost && localIp && !process.env.REACT_APP_PUBLIC_URL && (
            <p className="local-ip-info">
              📱 Using local network IP: <strong>{localIp}</strong>
              <br />
              <small>Make sure your phone is on the same Wi-Fi network</small>
            </p>
          )}
          {!isLocalhost && (
            <p className="local-ip-info">
              ✅ QR Code URL: <strong>{websiteUrl}</strong>
            </p>
          )}
          <motion.button
            onClick={downloadQRCode}
            disabled={downloading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="download-qr-button"
          >
            <Download size={18} />
            {downloading ? 'Downloading...' : 'Download QR Code'}
          </motion.button>
        </div>

        {user && !loading && (
          <div className="user-stats">
            <div className="stat-item">
              <Camera className="stat-icon" />
              <div className="stat-content">
                <div className="stat-value">{scanCount}</div>
                <div className="stat-label">Total Scans</div>
              </div>
            </div>
            <div className="stat-item">
              <Flame className="stat-icon streak-icon" />
              <div className="stat-content">
                <div className="stat-value">{streak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>
          </div>
        )}

        <div className="url-section">
          <div className="url-display">
            <input
              type="text"
              value={websiteUrl}
              readOnly
              className="url-input"
            />
            <motion.button
              onClick={copyToClipboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="copy-button"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy
                </>
              )}
            </motion.button>
          </div>
        </div>

        <div className="share-features">
          <h3>What is SkinGuard?</h3>
          <ul>
            <li>AI-powered skin cancer detection</li>
            <li>Track your skin health over time</li>
            <li>Get personalized health advice</li>
            <li>Secure and private</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default Share;


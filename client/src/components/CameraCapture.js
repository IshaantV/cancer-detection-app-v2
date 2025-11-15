import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Camera, Upload, X, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import api from '../utils/api';
import './CameraCapture.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CameraCapture = ({ user }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setCapturedImage(null);
    setAnalysis(null);
    setNotes('');
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setLoading(true);
    try {
      // Simulate AI analysis
      // In production, this would use TensorFlow.js models or API calls
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulated analysis results
      const simulatedAnalysis = {
        cancerPercentage: Math.floor(Math.random() * 30) + 5, // 5-35%
        patterns: {
          asymmetry: Math.random() > 0.5,
          border: Math.random() > 0.5,
          color: Math.random() > 0.5,
          diameter: Math.random() > 0.5,
          evolving: Math.random() > 0.5
        },
        shapes: {
          irregular: Math.random() > 0.6,
          circular: Math.random() > 0.4,
          oval: Math.random() > 0.5
        },
        sizes: {
          width: (Math.random() * 10 + 2).toFixed(2) + 'mm',
          height: (Math.random() * 10 + 2).toFixed(2) + 'mm',
          area: (Math.random() * 50 + 10).toFixed(2) + 'mm²'
        },
        recommendations: [
          'Monitor the area closely',
          'Consult a dermatologist if changes occur',
          'Use sun protection'
        ]
      };

      setAnalysis(simulatedAnalysis);

      // Send analysis to backend
      const formData = new FormData();
      const blob = await fetch(capturedImage).then(r => r.blob());
      formData.append('image', blob, 'capture.jpg');
      formData.append('userId', user.id);
      formData.append('notes', notes);

      const uploadResponse = await api.uploadImage(formData);

      if (uploadResponse.success) {
        console.log('✅ Image uploaded successfully:', uploadResponse.image.id);
        
        // Save analysis to backend
        const analyzeResponse = await api.analyzeImage(uploadResponse.image.id, {
          cancerPercentage: simulatedAnalysis.cancerPercentage,
          patterns: simulatedAnalysis.patterns,
          shapes: simulatedAnalysis.shapes,
          sizes: simulatedAnalysis.sizes
        });
        
        if (analyzeResponse.success) {
          console.log('✅ Analysis saved successfully');
          // Show success message
          alert('Image uploaded and analyzed successfully!');
        } else {
          console.error('❌ Failed to save analysis:', analyzeResponse);
          alert('Image uploaded but analysis failed to save. Please try again.');
        }
      } else {
        console.error('❌ Upload failed:', uploadResponse);
        alert('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('❌ Analysis/Upload error:', error);
      alert(`Error: ${error.message || 'Failed to upload image. Please check your connection and try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (percentage) => {
    if (percentage < 15) return { level: 'Low', color: '#22c55e' };
    if (percentage < 25) return { level: 'Moderate', color: '#f59e0b' };
    return { level: 'High', color: '#ef4444' };
  };

  return (
    <div className="camera-container">
      <motion.button
        onClick={() => navigate('/dashboard')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="back-button"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </motion.button>

      <div className="camera-content">
        {!capturedImage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="camera-section"
          >
            <h2>Capture Skin Image</h2>
            <p className="instruction-text">
              Position the affected area in the frame. Ensure good lighting and focus.
            </p>
            <div className="webcam-wrapper">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: 'user',
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }}
                className="webcam"
              />
            </div>
            <motion.button
              onClick={capture}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="capture-button"
            >
              <Camera size={24} />
              Capture Image
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="preview-section"
          >
            <div className="preview-header">
              <h2>Image Preview</h2>
              <motion.button
                onClick={retake}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="retake-button"
              >
                <X size={20} />
                Retake
              </motion.button>
            </div>

            <div className="preview-image-wrapper">
              <img src={capturedImage} alt="Captured" className="preview-image" />
            </div>

            <div className="notes-section">
              <label>Add Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe the location, any changes you've noticed, etc."
                rows="3"
              />
            </div>

            {!analysis ? (
              <motion.button
                onClick={analyzeImage}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="analyze-button"
              >
                {loading ? 'Analyzing...' : (
                  <>
                    <Upload size={20} />
                    Analyze Image
                  </>
                )}
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="analysis-results"
              >
                <h3>Analysis Results</h3>
                
                <div className="risk-indicator">
                  <div className="risk-percentage">
                    <span className="percentage-value">{analysis.cancerPercentage}%</span>
                    <span className="risk-level" style={{ color: getRiskLevel(analysis.cancerPercentage).color }}>
                      {getRiskLevel(analysis.cancerPercentage).level} Risk
                    </span>
                  </div>
                </div>

                <div className="analysis-details">
                  <div className="detail-section">
                    <h4>Pattern Analysis</h4>
                    <div className="pattern-grid">
                      {Object.entries(analysis.patterns).map(([key, value]) => (
                        <div key={key} className="pattern-item">
                          <span className="pattern-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                          {value ? (
                            <AlertCircle size={16} color="#ef4444" />
                          ) : (
                            <CheckCircle size={16} color="#22c55e" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Size Measurements</h4>
                    <div className="size-info">
                      <p>Width: {analysis.sizes.width}</p>
                      <p>Height: {analysis.sizes.height}</p>
                      <p>Area: {analysis.sizes.area}</p>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Recommendations</h4>
                    <ul className="recommendations-list">
                      {analysis.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="action-buttons">
                  <motion.button
                    onClick={() => {
                      navigate('/timeline');
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="view-timeline-button"
                  >
                    View Timeline
                  </motion.button>
                  
                  {(analysis.cancerPercentage >= 20 || true) && (
                    <motion.button
                      onClick={async () => {
                        try {
                          const response = await axios.get(
                            `${API_BASE_URL}/api/generate-pdf/${user.id}`,
                            { responseType: 'blob' }
                          );
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `SkinGuard-Report-${user.name}-${Date.now()}.pdf`);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                        } catch (error) {
                          console.error('PDF generation error:', error);
                          alert('Failed to generate PDF. Please try again.');
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="pdf-button"
                    >
                      <Upload size={20} />
                      Generate PDF Report
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;


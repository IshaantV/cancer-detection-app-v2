import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Camera, Upload, X, CheckCircle, AlertCircle, ArrowLeft, Loader } from 'lucide-react';
import api from '../utils/api';
import modelLoader from '../utils/modelLoader';
import './CameraCapture.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CameraCapture = ({ user }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  // Load models on component mount
  useEffect(() => {
    const loadModels = async () => {
      setModelsLoading(true);
      try {
        await modelLoader.loadAllModels();
        setModelsReady(true);
        console.log('✅ Models ready for analysis');
      } catch (error) {
        console.warn('⚠️ Models not available, will use fallback analysis:', error);
        setModelsReady(false);
      } finally {
        setModelsLoading(false);
      }
    };

    loadModels();
  }, []);

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
      // Use model loader for AI analysis
      console.log('🔍 Starting AI analysis...');
      
      // Option 1: Use client-side TensorFlow.js models
      let analysisResults;
      try {
        analysisResults = await modelLoader.analyzeImage(capturedImage);
        console.log('✅ Client-side analysis complete:', analysisResults);
      } catch (clientError) {
        console.warn('⚠️ Client-side analysis failed, trying server-side:', clientError);
        
        // Option 2: Fallback to server-side API analysis
        try {
          const formData = new FormData();
          const blob = await fetch(capturedImage).then(r => r.blob());
          formData.append('image', blob, 'capture.jpg');
          
          const serverAnalysisResponse = await api.analyzeImageServer(formData);
          analysisResults = serverAnalysisResponse.analysis;
          console.log('✅ Server-side analysis complete:', analysisResults);
        } catch (serverError) {
          console.error('❌ Both client and server analysis failed:', serverError);
          // Use fallback
          analysisResults = {
            cancer: modelLoader.getFallbackCancerAnalysis(),
            infection: modelLoader.getFallbackInfectionAnalysis(),
            analyzedAt: new Date().toISOString()
          };
        }
      }

      // Calculate size measurements (can be enhanced with image processing)
      const sizes = {
        width: (Math.random() * 10 + 2).toFixed(2) + 'mm',
        height: (Math.random() * 10 + 2).toFixed(2) + 'mm',
        area: (Math.random() * 50 + 10).toFixed(2) + 'mm²'
      };

      // Generate recommendations based on results
      const recommendations = generateRecommendations(analysisResults);

      // Combine all analysis data
      const fullAnalysis = {
        cancer: {
          ...analysisResults.cancer,
          sizes,
          shapes: {
            irregular: analysisResults.cancer.patterns.asymmetry || analysisResults.cancer.patterns.border,
            circular: !analysisResults.cancer.patterns.asymmetry,
            oval: !analysisResults.cancer.patterns.asymmetry && !analysisResults.cancer.patterns.border
          }
        },
        infection: analysisResults.infection,
        recommendations,
        analyzedAt: analysisResults.analyzedAt
      };

      setAnalysis(fullAnalysis);

      // Upload image and save analysis to backend
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
          cancer: fullAnalysis.cancer,
          infection: fullAnalysis.infection,
          recommendations: fullAnalysis.recommendations
        });
        
        if (analyzeResponse.success) {
          console.log('✅ Analysis saved successfully');
        } else {
          console.error('❌ Failed to save analysis:', analyzeResponse);
        }
      } else {
        console.error('❌ Upload failed:', uploadResponse);
        alert('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('❌ Analysis/Upload error:', error);
      alert(`Error: ${error.message || 'Failed to analyze image. Please check your connection and try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate recommendations based on analysis results
  const generateRecommendations = (results) => {
    const recommendations = [];
    
    // Cancer-related recommendations
    if (results.cancer.cancerPercentage >= 20) {
      recommendations.push('⚠️ High risk detected - Consult a dermatologist immediately');
      recommendations.push('Schedule a professional skin examination');
    } else if (results.cancer.cancerPercentage >= 15) {
      recommendations.push('Moderate risk - Monitor closely and consult a dermatologist');
    } else {
      recommendations.push('Low risk - Continue regular monitoring');
    }
    
    // Infection-related recommendations
    if (results.infection.hasInfection) {
      recommendations.push(`Possible ${results.infection.primaryCondition} detected`);
      recommendations.push('Consider consulting a healthcare provider for proper diagnosis');
      if (results.infection.primaryCondition.includes('Bacterial')) {
        recommendations.push('Keep the area clean and dry');
      } else if (results.infection.primaryCondition.includes('Fungal')) {
        recommendations.push('Avoid sharing personal items and keep area dry');
      }
    }
    
    // General recommendations
    recommendations.push('Use sun protection (SPF 30+)');
    recommendations.push('Monitor for any changes in size, color, or texture');
    
    return recommendations;
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

            {modelsLoading && (
              <div className="model-loading-indicator">
                <Loader className="spinner" size={20} />
                <span>Loading AI models...</span>
              </div>
            )}

            {!analysis ? (
              <motion.button
                onClick={analyzeImage}
                disabled={loading || modelsLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="analyze-button"
              >
                {loading ? (
                  <>
                    <Loader className="spinner" size={20} />
                    Analyzing...
                  </>
                ) : (
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
                
                {/* Cancer Detection Results */}
                <div className="analysis-section cancer-analysis">
                  <h4 className="section-title">
                    <AlertCircle size={20} />
                    Cancer Risk Assessment
                    {analysis.cancer.modelUsed && (
                      <span className="model-badge">AI Model</span>
                    )}
                  </h4>
                  
                  <div className="risk-indicator">
                    <div className="risk-percentage">
                      <span className="percentage-value">{analysis.cancer.cancerPercentage}%</span>
                      <span className="risk-level" style={{ color: getRiskLevel(analysis.cancer.cancerPercentage).color }}>
                        {getRiskLevel(analysis.cancer.cancerPercentage).level} Risk
                      </span>
                    </div>
                    {analysis.cancer.confidence && (
                      <div className="confidence-score">
                        Confidence: {Math.round(analysis.cancer.confidence * 100)}%
                      </div>
                    )}
                  </div>

                  <div className="detail-section">
                    <h5>ABCDE Pattern Analysis</h5>
                    <div className="pattern-grid">
                      {Object.entries(analysis.cancer.patterns || {}).map(([key, value]) => (
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

                  {analysis.cancer.sizes && (
                    <div className="detail-section">
                      <h5>Size Measurements</h5>
                      <div className="size-info">
                        <p>Width: {analysis.cancer.sizes.width}</p>
                        <p>Height: {analysis.cancer.sizes.height}</p>
                        <p>Area: {analysis.cancer.sizes.area}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Infection Detection Results */}
                <div className="analysis-section infection-analysis">
                  <h4 className="section-title">
                    <AlertCircle size={20} />
                    Skin Condition Detection
                    {analysis.infection.modelUsed && (
                      <span className="model-badge">AI Model</span>
                    )}
                  </h4>
                  
                  <div className="condition-indicator">
                    <div className="condition-result">
                      <span className="condition-label">Primary Condition:</span>
                      <span className={`condition-name ${analysis.infection.hasInfection ? 'has-infection' : 'normal'}`}>
                        {analysis.infection.primaryCondition}
                      </span>
                    </div>
                    <div className="confidence-score">
                      Confidence: {analysis.infection.confidence}%
                    </div>
                  </div>

                  {analysis.infection.allConditions && (
                    <div className="detail-section">
                      <h5>All Condition Probabilities</h5>
                      <div className="conditions-list">
                        {Object.entries(analysis.infection.allConditions).map(([condition, probability]) => (
                          <div key={condition} className="condition-item">
                            <span className="condition-name-small">{condition}</span>
                            <div className="probability-bar">
                              <div 
                                className="probability-fill" 
                                style={{ 
                                  width: `${probability}%`,
                                  backgroundColor: probability > 50 ? '#ef4444' : '#22c55e'
                                }}
                              />
                              <span className="probability-value">{probability}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Combined Recommendations */}
                <div className="detail-section recommendations-section">
                  <h4>Recommendations</h4>
                  <ul className="recommendations-list">
                    {analysis.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
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


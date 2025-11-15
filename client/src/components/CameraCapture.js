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
      // Use MobileNet for AI analysis (mandatory - no fallback)
      console.log('🔍 Starting AI analysis with MobileNet...');
      
      const analysisResults = await modelLoader.analyzeImage(capturedImage);
      console.log('✅ MobileNet analysis complete:', analysisResults);

      // Calculate size measurements from image (basic estimation)
      // Note: This is a simple estimation - for accurate measurements, 
      // you'd need calibration or object detection
      const img = new Image();
      img.src = capturedImage;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Estimate sizes based on image dimensions (assuming ~1mm per 10 pixels at typical phone distance)
      const pixelToMM = 0.1; // Rough estimate - adjust based on your camera setup
      const estimatedWidth = (img.width * pixelToMM).toFixed(2);
      const estimatedHeight = (img.height * pixelToMM).toFixed(2);
      const estimatedArea = (parseFloat(estimatedWidth) * parseFloat(estimatedHeight)).toFixed(2);
      
      const sizes = {
        width: `${estimatedWidth}mm`,
        height: `${estimatedHeight}mm`,
        area: `${estimatedArea}mm²`
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
          
          // Check if XP was awarded and gamification updated
          if (analyzeResponse.gamification) {
            console.log('✅ XP awarded!', analyzeResponse.gamification);
            console.log('📊 Updated stats:', {
              xp: analyzeResponse.gamification.xp,
              level: analyzeResponse.gamification.level,
              scansCompleted: analyzeResponse.gamification.stats?.scansCompleted
            });
            if (analyzeResponse.leveledUp) {
              console.log('🎉 Level up! New level:', analyzeResponse.newLevel);
              // Show level up notification
              setTimeout(() => {
                alert(`🎉 Level Up! You've reached level ${analyzeResponse.newLevel}!`);
              }, 500);
            }
          }
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

                  {analysis.cancer.lesionDetails && (
                    <div className="detail-section">
                      <h5>Detailed Lesion Analysis</h5>
                      
                      <div className="lesion-measurements">
                        <div className="measurement-group">
                          <h6>Size Measurements</h6>
                          <div className="measurement-grid">
                            <div className="measurement-item">
                              <span className="measurement-label">Width:</span>
                              <span className="measurement-value">{analysis.cancer.lesionDetails.widthMM} mm</span>
                            </div>
                            <div className="measurement-item">
                              <span className="measurement-label">Height:</span>
                              <span className="measurement-value">{analysis.cancer.lesionDetails.heightMM} mm</span>
                            </div>
                            <div className="measurement-item">
                              <span className="measurement-label">Diameter:</span>
                              <span className="measurement-value">{analysis.cancer.lesionDetails.diameterMM} mm</span>
                            </div>
                            <div className="measurement-item">
                              <span className="measurement-label">Area:</span>
                              <span className="measurement-value">{analysis.cancer.lesionDetails.area} px²</span>
                            </div>
                          </div>
                        </div>

                        <div className="measurement-group">
                          <h6>Shape Analysis</h6>
                          <div className="measurement-grid">
                            <div className="measurement-item">
                              <span className="measurement-label">Shape:</span>
                              <span className="measurement-value">{analysis.cancer.lesionDetails.shape}</span>
                            </div>
                            <div className="measurement-item">
                              <span className="measurement-label">Aspect Ratio:</span>
                              <span className="measurement-value">{analysis.cancer.lesionDetails.aspectRatio}</span>
                            </div>
                            <div className="measurement-item">
                              <span className="measurement-label">Circularity:</span>
                              <span className="measurement-value">{analysis.cancer.lesionDetails.circularity}</span>
                            </div>
                          </div>
                        </div>

                        <div className="measurement-group">
                          <h6>Color Analysis</h6>
                          <div className="measurement-grid">
                            <div className="measurement-item">
                              <span className="measurement-label">Color Variation:</span>
                              <span className="measurement-value">{(analysis.cancer.lesionDetails.colorVariation * 100).toFixed(1)}%</span>
                            </div>
                            {analysis.cancer.lesionDetails.dominantColors && analysis.cancer.lesionDetails.dominantColors.length > 0 && (
                              <div className="measurement-item full-width">
                                <span className="measurement-label">Dominant Colors:</span>
                                <div className="color-swatches">
                                  {analysis.cancer.lesionDetails.dominantColors.map((color, idx) => (
                                    <div key={idx} className="color-swatch" style={{ backgroundColor: color.hex }}>
                                      <span className="color-percentage">{color.percentage}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="measurement-group">
                          <h6>Border & Asymmetry</h6>
                          <div className="measurement-grid">
                            <div className="measurement-item">
                              <span className="measurement-label">Border Irregularity:</span>
                              <span className="measurement-value">{(analysis.cancer.lesionDetails.borderIrregularity * 100).toFixed(1)}%</span>
                            </div>
                            <div className="measurement-item">
                              <span className="measurement-label">Border Smoothness:</span>
                              <span className="measurement-value">{(analysis.cancer.lesionDetails.borderSmoothness * 100).toFixed(1)}%</span>
                            </div>
                            <div className="measurement-item">
                              <span className="measurement-label">Asymmetry Score:</span>
                              <span className="measurement-value">{(analysis.cancer.lesionDetails.asymmetryScore * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="measurement-group">
                          <h6>ABCDE Scores</h6>
                          <div className="abcde-scores">
                            <div className="score-item">
                              <span className="score-label">A (Asymmetry):</span>
                              <div className="score-bar">
                                <div 
                                  className="score-fill" 
                                  style={{ 
                                    width: `${analysis.cancer.lesionDetails.asymmetry * 100}%`,
                                    backgroundColor: analysis.cancer.lesionDetails.asymmetry > 0.6 ? '#ef4444' : '#22c55e'
                                  }}
                                />
                                <span className="score-value">{(analysis.cancer.lesionDetails.asymmetry * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                            <div className="score-item">
                              <span className="score-label">B (Border):</span>
                              <div className="score-bar">
                                <div 
                                  className="score-fill" 
                                  style={{ 
                                    width: `${analysis.cancer.lesionDetails.border * 100}%`,
                                    backgroundColor: analysis.cancer.lesionDetails.border > 0.55 ? '#ef4444' : '#22c55e'
                                  }}
                                />
                                <span className="score-value">{(analysis.cancer.lesionDetails.border * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                            <div className="score-item">
                              <span className="score-label">C (Color):</span>
                              <div className="score-bar">
                                <div 
                                  className="score-fill" 
                                  style={{ 
                                    width: `${analysis.cancer.lesionDetails.color * 100}%`,
                                    backgroundColor: analysis.cancer.lesionDetails.color > 0.65 ? '#ef4444' : '#22c55e'
                                  }}
                                />
                                <span className="score-value">{(analysis.cancer.lesionDetails.color * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                            <div className="score-item">
                              <span className="score-label">D (Diameter):</span>
                              <div className="score-bar">
                                <div 
                                  className="score-fill" 
                                  style={{ 
                                    width: `${analysis.cancer.lesionDetails.diameter * 100}%`,
                                    backgroundColor: analysis.cancer.lesionDetails.diameter > 0.5 ? '#ef4444' : '#22c55e'
                                  }}
                                />
                                <span className="score-value">{(analysis.cancer.lesionDetails.diameter * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
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


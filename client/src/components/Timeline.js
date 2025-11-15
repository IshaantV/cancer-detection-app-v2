import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, TrendingUp, Image as ImageIcon, Upload } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../utils/api';
import './Timeline.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Timeline = ({ user }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching images for user:', user.id);
      const response = await api.getImages(user.id);
      if (response && response.images) {
        const sortedImages = response.images.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        console.log(`✅ Loaded ${sortedImages.length} images`);
        setImages(sortedImages);
      } else {
        console.warn('⚠️ No images in response:', response);
        setImages([]);
      }
    } catch (error) {
      console.error('❌ Error fetching images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Refresh images when component becomes visible (user navigates back)
  useEffect(() => {
    const handleFocus = () => {
      fetchImages();
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchImages();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchImages]);

  const chartData = {
    labels: images
      .filter(img => img.analysis)
      .map(img => new Date(img.uploadedAt).toLocaleDateString()),
    datasets: [
      {
        label: 'Cancer Risk Percentage',
        data: images
          .filter(img => img.analysis)
          .map(img => img.analysis.cancerPercentage),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Risk Trend Over Time'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <div className="timeline-container">
      <motion.button
        onClick={() => navigate('/dashboard')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="back-button"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </motion.button>

      <div className="timeline-header">
        <div>
          <h1>Progress Timeline</h1>
          <p>Track your skin condition over time</p>
        </div>
        {images.length > 0 && (
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="pdf-generate-button"
          >
            <Upload size={18} />
            Generate PDF Report
          </motion.button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">Loading your timeline...</div>
      ) : images.length === 0 ? (
        <div className="empty-state">
          <ImageIcon size={64} color="#9ca3af" />
          <h3>No images yet</h3>
          <p>Start tracking by capturing your first image</p>
          <motion.button
            onClick={() => navigate('/camera')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="capture-button"
          >
            Capture Image
          </motion.button>
        </div>
      ) : (
        <>
          {images.filter(img => img.analysis).length > 1 && (
            <div className="chart-section">
              <div className="chart-card">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}

          <div className="timeline-grid">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedImage(image)}
                className="timeline-card"
              >
                <div className="card-image">
                  <img
                    src={image.cloudinaryUrl || `${API_BASE_URL}/${image.path}`}
                    alt={`Scan ${index + 1}`}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZTwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </div>
                <div className="card-content">
                  <div className="card-date">
                    <Calendar size={16} />
                    {new Date(image.uploadedAt).toLocaleDateString()}
                  </div>
                  {image.analysis ? (
                    <div className="card-analysis">
                      <div className="risk-badge" style={{
                        background: image.analysis.cancerPercentage < 15 ? '#dcfce7' :
                                   image.analysis.cancerPercentage < 25 ? '#fef3c7' : '#fee2e2',
                        color: image.analysis.cancerPercentage < 15 ? '#16a34a' :
                               image.analysis.cancerPercentage < 25 ? '#d97706' : '#dc2626'
                      }}>
                        {image.analysis.cancerPercentage}% Risk
                      </div>
                    </div>
                  ) : (
                    <div className="no-analysis">Pending Analysis</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="modal-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal" onClick={() => setSelectedImage(null)}>×</button>
            <img
              src={selectedImage.cloudinaryUrl || `${API_BASE_URL}/${selectedImage.path}`}
              alt="Full size"
              className="modal-image"
            />
            {selectedImage.analysis && (
              <div className="modal-analysis">
                <h3>Analysis Details</h3>
                <div className="analysis-stats">
                  <div className="stat-item">
                    <span className="stat-label">Risk Level:</span>
                    <span className="stat-value">{selectedImage.analysis.cancerPercentage}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Size:</span>
                    <span className="stat-value">{selectedImage.analysis.sizes.width} × {selectedImage.analysis.sizes.height}</span>
                  </div>
                </div>
                {selectedImage.notes && (
                  <div className="modal-notes">
                    <strong>Notes:</strong> {selectedImage.notes}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Timeline;


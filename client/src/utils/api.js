// API utility functions
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Log API URL for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Base URL:', API_BASE_URL);
  console.log('🔧 Environment variable REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
}

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, create a generic error
      errorData = { 
        message: `HTTP error! status: ${response.status} - ${response.statusText}` 
      };
    }
    const error = new Error(errorData.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.url = response.url;
    error.statusText = response.statusText;
    throw error;
  }
  
  // Try to parse JSON, but handle non-JSON responses
  try {
    return await response.json();
  } catch (e) {
    console.warn('Response is not JSON, returning empty object');
    return {};
  }
};

export const api = {
  // User endpoints
  register: async (userData) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const url = `${API_BASE_URL}/api/register`;
      console.log('📤 Register request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      console.log('📥 Register response status:', response.status);
      return await handleResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ Registration API error:', error);
      
      // Better error messages for different error types
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('Load failed')) {
        errorMessage = 'Cannot connect to server. Please check:\n1. Your internet connection\n2. The server is running\n3. Try again in a moment';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.status = error.status;
      enhancedError.url = error.url || `${API_BASE_URL}/api/register`;
      throw enhancedError;
    }
  },

  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  getUser: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Get user API error:', error);
      throw error;
    }
  },

  // Image endpoints
  uploadImage: async (formData) => {
    try {
      const url = `${API_BASE_URL}/api/upload`;
      console.log('📤 Uploading image to:', url);
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });
      console.log('📥 Upload response status:', response.status);
      const result = await handleResponse(response);
      console.log('✅ Upload successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Upload image API error:', error);
      throw error;
    }
  },

  getImages: async (userId) => {
    try {
      const url = `${API_BASE_URL}/api/images/${userId}`;
      console.log('📤 Fetching images from:', url);
      const response = await fetch(url);
      console.log('📥 Get images response status:', response.status);
      const result = await handleResponse(response);
      console.log(`✅ Retrieved ${result.images?.length || 0} images`);
      return result;
    } catch (error) {
      console.error('❌ Get images API error:', error);
      throw error;
    }
  },

  analyzeImage: async (imageId, analysisData) => {
    try {
      const url = `${API_BASE_URL}/api/analyze/${imageId}`;
      console.log('📤 Saving analysis to:', url);
      console.log('Analysis data:', analysisData);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData)
      });
      console.log('📥 Analyze response status:', response.status);
      const result = await handleResponse(response);
      console.log('✅ Analysis saved:', result);
      return result;
    } catch (error) {
      console.error('❌ Analyze image API error:', error);
      throw error;
    }
  },

  // Server-side AI analysis endpoint
  analyzeImageServer: async (formData) => {
    try {
      const url = `${API_BASE_URL}/api/analyze-server`;
      console.log('📤 Requesting server-side analysis from:', url);
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });
      console.log('📥 Server analysis response status:', response.status);
      const result = await handleResponse(response);
      console.log('✅ Server analysis complete:', result);
      return result;
    } catch (error) {
      console.error('❌ Server analysis API error:', error);
      throw error;
    }
  },

  // Chat endpoints
  sendMessage: async (message, userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userId })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Send message API error:', error);
      throw error;
    }
  },

  // Medication endpoints
  getMedications: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/medications/${userId}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Get medications API error:', error);
      throw error;
    }
  },

  addMedication: async (userId, medication) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/medications/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medication)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Add medication API error:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        const enhancedError = new Error('Cannot connect to server. Please make sure the backend server is running on port 5000.\n\nTo start the server:\n1. Open a terminal\n2. Run: cd server && node index.js\n3. You should see: "Server running on port 5000"');
        enhancedError.originalError = error;
        throw enhancedError;
      }
      throw error;
    }
  },

  markMedicationTaken: async (userId, medicationId, time) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/medications/${userId}/${medicationId}/taken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time, date: new Date().toISOString().split('T')[0] })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Mark medication taken API error:', error);
      throw error;
    }
  },

  deleteMedication: async (userId, medicationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/medications/${userId}/${medicationId}`, {
        method: 'DELETE'
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Delete medication API error:', error);
      throw error;
    }
  },

  // Gamification endpoints
  getGamification: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gamification/${userId}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Get gamification API error:', error);
      throw error;
    }
  },

  awardXP: async (userId, xp, action) => {
    try {
      console.log('🎁 Awarding XP:', { userId, xp, action });
      const response = await fetch(`${API_BASE_URL}/api/gamification/${userId}/award-xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp, action })
      });
      const result = await handleResponse(response);
      console.log('✅ XP awarded successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Award XP API error:', error);
      throw error;
    }
  },

  checkIn: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gamification/${userId}/check-in`, {
        method: 'POST'
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Check-in API error:', error);
      throw error;
    }
  },

  getAchievements: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gamification/${userId}/achievements`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Get achievements API error:', error);
      throw error;
    }
  },

  unlockAchievement: async (userId, achievementId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gamification/${userId}/unlock-achievement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievementId })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Unlock achievement API error:', error);
      throw error;
    }
  },

  updateGamificationStats: async (userId, stats, streaks) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gamification/${userId}/update-stats`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats, streaks })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Update gamification stats API error:', error);
      throw error;
    }
  }
};

export default api;


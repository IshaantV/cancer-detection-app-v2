import React, { useState } from 'react';
import api from '../utils/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ApiTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('🧪 Testing API connection...');
      console.log('API URL:', API_BASE_URL);
      console.log('Environment variable:', process.env.REACT_APP_API_URL);
      console.log('Current URL:', window.location.href);
      console.log('User Agent:', navigator.userAgent);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // Try to fetch a simple endpoint
      const response = await fetch(`${API_BASE_URL}/api/user/test`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        apiBaseUrl: API_BASE_URL,
        envVar: process.env.REACT_APP_API_URL,
        currentUrl: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      
      setTestResult(result);
      console.log('✅ Test result:', result);
    } catch (error) {
      const result = {
        success: false,
        error: error.message,
        errorName: error.name,
        apiBaseUrl: API_BASE_URL,
        envVar: process.env.REACT_APP_API_URL,
        currentUrl: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        isNetworkError: error.message.includes('Failed to fetch') || error.message.includes('Load failed'),
        isTimeout: error.name === 'AbortError'
      };
      setTestResult(result);
      console.error('❌ Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', margin: '20px', borderRadius: '8px' }}>
      <h3>API Connection Test</h3>
      <button onClick={testApiConnection} disabled={loading}>
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      
      {testResult && (
        <div style={{ marginTop: '20px', padding: '15px', background: testResult.success ? '#d4edda' : '#f8d7da', borderRadius: '4px' }}>
          <h4>Test Results:</h4>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;


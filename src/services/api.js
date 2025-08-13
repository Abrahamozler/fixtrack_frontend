import axios from 'axios';

// Get the backend URL from Netlify's environment variables.
// Fallback to localhost for local development.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// This interceptor automatically adds the user's auth token to every request.
api.interceptors.request.use(
  (config) => {
    // Get user info from either localStorage or sessionStorage
    const userInfoString = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    
    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString);
      if (userInfo.token) {
        // If a token exists, add it to the request headers
        config.headers['Authorization'] = `Bearer ${userInfo.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

const api = axios.create({
  // IMPORTANT: Replace this with your backend URL before deployment
  // Local development: 'http://localhost:5000/api'
  // Deployed: 'https://your-backend-name.onrender.com/api'
  baseURL: 'http://localhost:5000/api', 
});

// Interceptor to add the auth token to every request
api.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

export default api;

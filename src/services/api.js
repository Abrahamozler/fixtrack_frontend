import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fixtrack-backend.onrender.com/api',
});

// This interceptor is crucial. It adds the user's login token to every API request.
api.interceptors.request.use((config) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
  } catch (error) {
    console.error("Could not parse user info from localStorage", error);
  }
  return config;
});

export default api;

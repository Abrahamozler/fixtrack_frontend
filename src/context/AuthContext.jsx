import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // NEW: Check both localStorage and sessionStorage
    const storedUserInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    
    if (storedUserInfo) {
      try {
        const userInfo = JSON.parse(storedUserInfo);
        const decodedToken = jwtDecode(userInfo.token);
        if (decodedToken.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(userInfo);
        }
      } catch (error) {
        console.error("Failed to process auth token, clearing.", error);
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // NEW: The login function now accepts a 'rememberMe' boolean
  const login = async (email, password, rememberMe) => {
    const { data } = await api.post('/auth/login', { email, password });
    
    // NEW: Choose storage based on the rememberMe flag
    if (rememberMe) {
      localStorage.setItem('userInfo', JSON.stringify(data));
    } else {
      sessionStorage.setItem('userInfo', JSON.stringify(data));
    }

    setUser(data);
    navigate('/');
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    // Registration will always be "remembered" by default for a good user experience
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    navigate('/');
  };

  const logout = () => {
    // NEW: Clear both storages on logout
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userInfo');
    setUser(null);
    navigate('/login');
  };

  const value = { user, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

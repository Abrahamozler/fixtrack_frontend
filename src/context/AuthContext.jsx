import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // NEW: Add a loading state, default to true
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
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
        setUser(null);
      }
    }
    // NEW: Set loading to false after checking is complete
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    navigate('/');
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/login');
  };

  // NEW: Pass the loading state in the value
  const value = { user, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {/* NEW: Don't render children until loading is false */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

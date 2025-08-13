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
    const storedUserInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    
    if (storedUserInfo) {
      try {
        const userInfo = JSON.parse(storedUserInfo);
        const decodedToken = jwtDecode(userInfo.token);
        // Check if token is expired
        if (decodedToken.exp * 1000 < Date.now()) {
          logout(); // This will clear storage and navigate to login
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

  const login = async (email, password, rememberMe) => {
    const { data } = await api.post('/auth/login', { email, password });
    
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
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userInfo');
    setUser(null);
    navigate('/login');
  };

  const value = { user, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {/* --- THIS IS THE FIX --- */}
      {/* The provider now always renders its children. The loading state is handled by PrivateRoute. */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

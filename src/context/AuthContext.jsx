import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { decode as jwtDecode } from 'jwt-decode'; // ✅ fixed named import

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

  const login = async (username, password, rememberMe) => {
    try {
      const { data } = await api.post('/auth/login', { username, password });
      if (rememberMe) {
        localStorage.setItem('userInfo', JSON.stringify(data));
      } else {
        sessionStorage.setItem('userInfo', JSON.stringify(data));
      }
      setUser(data);
      navigate('/');
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const register = async (username, password, referralCode) => {
    try {
      const { data } = await api.post('/auth/register', { username, password, referralCode });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      navigate('/');
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userInfo');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

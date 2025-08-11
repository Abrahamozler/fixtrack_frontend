import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        // NEW: Added a try...catch block. This is the crucial fix.
        const userInfo = JSON.parse(storedUserInfo);
        const decodedToken = jwt_decode(userInfo.token);

        if (decodedToken.exp * 1000 < Date.now()) {
          // Token is expired
          logout();
        } else {
          // Token is valid
          setUser(userInfo);
        }
      } catch (error) {
        // If anything goes wrong (bad token, etc.), clear storage and log out.
        console.error("Failed to parse or decode token:", error);
        localStorage.removeItem('userInfo');
        setUser(null);
      }
    }
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

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

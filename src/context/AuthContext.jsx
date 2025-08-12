import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
// NEW: Correct import style for the new version
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        const userInfo = JSON.parse(storedUserInfo);
        // NEW: Correct function call for the new version
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
  }, []);

  const login = async (email, password) => {
    // NOTE: The backend expects 'email', not 'identifier'. Let's keep it simple for now.
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

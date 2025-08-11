import { createContext, useState, useContext } from 'react';

// 1. Create the context
const AuthContext = createContext();

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
  // 3. For now, we will pretend there is no user.
  // We have removed all logic that reads from localStorage or calls jwt-decode.
  const [user, setUser] = useState(null);

  // 4. Create dummy functions that do nothing for now.
  const login = () => console.log('Login function called');
  const register = () => console.log('Register function called');
  const logout = () => console.log('Logout function called');
  
  // 5. Provide these dummy values to the rest of the app.
  const value = { user, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 6. Create the hook to use the context
export const useAuth = () => {
  return useContext(AuthContext);
};

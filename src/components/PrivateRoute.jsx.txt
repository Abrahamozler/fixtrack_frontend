import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Box, CircularProgress } from '@mui/material'; // Import components for a loading spinner

const PrivateRoute = ({ children }) => {
  // NEW: Get the loading state from the context
  const { user, loading } = useAuth();
  const location = useLocation();

  // NEW: If it's still loading, show a spinner
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If loading is finished AND there's no user, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If loading is finished AND there is a user, show the page
  return children;
};

export default PrivateRoute;

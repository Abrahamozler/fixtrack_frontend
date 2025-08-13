import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Box, CircularProgress } from '@mui/material';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Show a spinner while auth state is being determined
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 2. If loading is done, check if user exists and is an Admin
  if (user && user.role === 'Admin') {
    return children; // User is an admin, show the protected page
  }

  // 3. If user is not an admin or doesn't exist, redirect them
  //    Navigate to home page, or show an "Unauthorized" component.
  //    Redirecting to login might be confusing if they are already logged in.
  return <Navigate to="/" state={{ from: location }} replace />;
};

export default AdminRoute;

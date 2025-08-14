import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // Correct path goes up one level

const AdminRoute = ({ children }) => {
    const { user } = useAuth();

    if (user && user.role === 'Admin') {
        return children;
    }

    // Redirect to dashboard if not an admin
    return <Navigate to="/" replace />;
};

export default AdminRoute;

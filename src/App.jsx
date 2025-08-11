import { Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddRecord from './pages/AddRecord';
import EditRecord from './pages/EditRecord';
import FinancialSummary from './pages/FinancialSummary';
import ManageUsers from './pages/ManageUsers';
import NotFound from './pages/NotFound';

import { useAuth } from './context/AuthContext';
import { useState } from 'react';

function App() {
  const { user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes Layout */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="app-container">
                <Navbar onMenuClick={toggleSidebar} />
                <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
                <Box component="main" className="main-content">
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="/add-record" element={<AddRecord />} />
                    <Route path="/edit-record/:id" element={<EditRecord />} />
                    {/* Admin Routes */}
                    <Route path="/summary" element={<AdminRoute><FinancialSummary /></AdminRoute>} />
                    <Route path="/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Box>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;

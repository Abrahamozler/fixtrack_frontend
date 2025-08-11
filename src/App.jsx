import { Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AddRecord from './pages/AddRecord.jsx';
import EditRecord from './pages/EditRecord.jsx';
import FinancialSummary from './pages/FinancialSummary.jsx';
import ManageUsers from './pages/ManageUsers.jsx';
import NotFound from './pages/NotFound.jsx';

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

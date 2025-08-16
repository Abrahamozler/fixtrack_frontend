// --- All Page Imports ---
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AddRecord from './pages/AddRecord.jsx';
import EditRecord from './pages/EditRecord.jsx';
import FinancialSummary from './pages/FinancialSummary.jsx';
import ManageUsers from './pages/ManageUsers.jsx';
import ServiceAnalysis from './pages/ServiceAnalysis.jsx';
import NotFound from './pages/NotFound.jsx';
import SettingsPage from './pages/SettingsPage.jsx';  // ✅ new import

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
        
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Box sx={{ display: 'flex' }}>
                <Navbar onMenuClick={toggleSidebar} />
                <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                  <Toolbar />
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="/add-record" element={<AddRecord />} />
                    <Route path="/edit-record/:id" element={<EditRecord />} />
                    
                    <Route path="/summary" element={<AdminRoute><FinancialSummary /></AdminRoute>} />
                    <Route path="/analysis" element={<AdminRoute><ServiceAnalysis /></AdminRoute>} />
                    <Route path="/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />

                    {/* ✅ New Settings page route */}
                    <Route path="/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Box>
              </Box>
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

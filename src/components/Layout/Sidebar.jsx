import { Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';   // ✅ new import
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const drawerWidth = 240;

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const NavItem = ({ to, icon, text }) => (
    <ListItem
      disablePadding
      component={Link}
      to={to}
      sx={{ color: 'inherit', textDecoration: 'none' }}
      onClick={handleLinkClick}
    >
      <ListItemButton selected={location.pathname === to}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={text} sx={{ whiteSpace: 'normal' }} />
      </ListItemButton>
    </ListItem>
  );

  const drawerContent = (
    <div>
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <NavItem to="/" icon={<DashboardIcon />} text="Dashboard" />
          <NavItem to="/add-record" icon={<AddCircleOutlineIcon />} text="Add Record" />

          {(user?.role === 'Admin' || user?.role === 'Staff') && (
            <NavItem to="/analysis" icon={<AnalyticsIcon />} text="Service Analysis" />
          )}

          {user?.role === 'Admin' && (
            <>
              <Divider />
              <NavItem to="/summary" icon={<AssessmentIcon />} text="Financial Summary" />
              <NavItem to="/users" icon={<PeopleIcon />} text="Manage Users" />
              {/* ✅ New Settings nav item */}
              <NavItem to="/settings" icon={<SettingsIcon />} text="Settings" />
            </>
          )}
        </List>
      </Box>
    </div>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;

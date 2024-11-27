import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  styled,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Assessment,
  Person,
  Logout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { logout } from '../features/auth/authSlice';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getMenuItems = () => {
    const items = [];

    if (user?.role === 'admin') {
      items.push(
        { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
        { text: 'Users', icon: <People />, path: '/admin/users' },
        { text: 'Analytics', icon: <Assessment />, path: '/admin/analytics' }
      );
    } else if (user?.role === 'manager') {
      items.push(
        { text: 'Dashboard', icon: <Dashboard />, path: '/manager' },
        { text: 'Team', icon: <People />, path: '/manager/team' },
        { text: 'Analytics', icon: <Assessment />, path: '/manager/analytics' }
      );
    } else {
      items.push(
        { text: 'Dashboard', icon: <Dashboard />, path: '/reportee' },
        { text: 'My Evaluations', icon: <Assessment />, path: '/reportee/evaluations' }
      );
    }

    return items;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: open ? `${drawerWidth}px` : 0,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Performance Tracker
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">{user?.name}</Typography>
            <IconButton color="inherit" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {getMenuItems().map((item) => (
              <ListItemButton
                key={item.text}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      <Main open={open}>
        <Toolbar />
        {children}
      </Main>
    </Box>
  );
};

export default Layout;

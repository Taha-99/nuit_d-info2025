import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  Chip,
  Stack,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import OfflineBadge from './OfflineBadge';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const NavBar = () => {
  const { t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [open, setOpen] = React.useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState(null);

  const links = [
    { label: t('nav.dashboard'), path: '/dashboard' },
    { label: t('nav.assistant'), path: '/assistant' },
    { label: t('nav.documents') || 'Documents', path: '/documents' },
    { label: t('nav.appointments') || 'Rendez-vous', path: '/appointments' },
    { label: t('nav.help') || 'Aide', path: '/help' },
    { label: t('nav.about'), path: '/about' },
  ];

  const renderLinks = () =>
    links.map((link) => {
      const isActive = location.pathname.startsWith(link.path);
      return (
        <Button
          key={link.path}
          color="inherit"
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            letterSpacing: 0.8,
            position: 'relative',
            color: isActive ? 'secondary.main' : 'inherit',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
              border: `1px solid ${isActive ? 'rgba(78,240,208,0.8)' : 'rgba(255,255,255,0.08)'}`,
              opacity: isActive ? 1 : 0,
              transition: 'opacity 0.3s',
            },
            '&:hover::after': { opacity: 1 },
          }}
          onClick={() => {
            navigate(link.path);
            setOpen(false);
          }}
        >
          {link.label}
        </Button>
      );
    });

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuAnchor(null);
    navigate('/');
  };

  const renderAuthButtons = () => {
    if (isAuthenticated) {
      return (
        <>
          <IconButton
            color="inherit"
            onClick={(e) => setUserMenuAnchor(e.currentTarget)}
            sx={{
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              px: 1,
            }}
          >
            <AccountCircleIcon />
            <Typography variant="body2" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
              {user?.name || user?.email}
            </Typography>
          </IconButton>
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            PaperProps={{
              sx: {
                background: 'rgba(8, 12, 32, 0.95)',
                backdropFilter: 'blur(18px)',
                border: '1px solid rgba(255,255,255,0.08)',
                mt: 1,
              },
            }}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
              {t('nav.profile') || 'Profil'}
            </MenuItem>
            <MenuItem onClick={() => { navigate('/dashboard'); handleUserMenuClose(); }}>
              {t('nav.dashboard') || 'Dashboard'}
            </MenuItem>
            <MenuItem onClick={() => { navigate('/documents'); handleUserMenuClose(); }}>
              {t('nav.documents') || 'Mes documents'}
            </MenuItem>
            <MenuItem onClick={() => { navigate('/appointments'); handleUserMenuClose(); }}>
              {t('nav.appointments') || 'Mes rendez-vous'}
            </MenuItem>
            <MenuItem onClick={() => { navigate('/help'); handleUserMenuClose(); }}>
              {t('nav.help') || 'Aide'}
            </MenuItem>
            {(user?.role === 'admin' || user?.role === 'moderator') && (
              <MenuItem onClick={() => { navigate('/admin'); handleUserMenuClose(); }}>
                Admin Panel
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>{t('auth.logout') || 'Déconnexion'}</MenuItem>
          </Menu>
        </>
      );
    }

    return (
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate('/login')}
          sx={{
            borderColor: 'rgba(255,255,255,0.2)',
            color: 'inherit',
            textTransform: 'none',
            borderRadius: 999,
          }}
        >
          {t('auth.login') || 'Login'}
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate('/register')}
          sx={{
            textTransform: 'none',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #8c6cff, #4ef0d0)',
          }}
        >
          {t('auth.register') || 'Register'}
        </Button>
      </Stack>
    );
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(3, 3, 12, 0.85)',
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={() => setOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 2 }} sx={{ flexGrow: 1 }}>
            <Box
              onClick={() => navigate('/')}
              sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}
            >
              <Box
                sx={{
                  width: { xs: 28, md: 36 },
                  height: { xs: 28, md: 36 },
                  borderRadius: { xs: 8, md: 12 },
                  background: 'linear-gradient(135deg, #8c6cff, #4ef0d0)',
                  boxShadow: '0 0 24px rgba(142, 91, 255, 0.45)',
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }, display: { xs: 'none', sm: 'block' } }}>
                IA Low-Cost Assistant
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.75rem', display: { xs: 'block', sm: 'none' } }}>
                IA Assistant
              </Typography>
            </Box>
            {!isMobile && (
              <Stack direction="row" spacing={1} alignItems="center">
                {renderLinks()}
              </Stack>
            )}
          </Stack>
          {!isMobile && <Chip label="beta 0.9" color="secondary" variant="outlined" size="small" />}
          <OfflineBadge />
          <LanguageToggle />
          {renderAuthButtons()}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(6, 8, 25, 0.96)',
            backdropFilter: 'blur(24px)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          },
        }}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Navigation
          </Typography>
          <List>
            {links.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <ListItemButton
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    border: isActive ? '1px solid rgba(78,240,208,0.4)' : 'transparent',
                    bgcolor: isActive ? 'rgba(78,240,208,0.1)' : 'transparent',
                  }}
                >
                  <ListItemText primary={link.label} />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default NavBar;

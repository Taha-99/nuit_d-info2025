import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeModeProvider, useThemeMode } from './contexts/ThemeContext';

import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AssistantPage from './pages/AssistantPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import AboutPage from './pages/AboutPage';
import AdminPanelPage from './pages/AdminPanelPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DocumentTrackerPage from './pages/DocumentTrackerPage';
import AppointmentPage from './pages/AppointmentPage';
import HelpPage from './pages/HelpPage';
import FeedbackPage from './pages/FeedbackPage';

const createEmotionCache = (direction) =>
  createCache({
    key: direction === 'rtl' ? 'mui-rtl' : 'mui',
    stylisPlugins: direction === 'rtl' ? [prefixer, rtlPlugin] : [],
  });

const InnerApp = () => {
  const { direction } = useLanguage();
  const { mode } = useThemeMode();

  const theme = useMemo(
    () =>
      createTheme({
        direction,
        palette: {
          mode,
          primary: { main: '#8c6cff' },
          secondary: { main: '#4ef0d0' },
          background: mode === 'dark' ? {
            default: '#03030a',
            paper: 'rgba(8, 12, 32, 0.82)',
          } : {
            default: '#f5f7fa',
            paper: 'rgba(255, 255, 255, 0.95)',
          },
          text: mode === 'dark' ? {
            primary: '#f4f7ff',
            secondary: 'rgba(244, 247, 255, 0.7)',
          } : {
            primary: '#1a1a2e',
            secondary: 'rgba(26, 26, 46, 0.7)',
          },
        },
        typography: {
          fontFamily: '"Space Grotesk", "Chakra Petch", "Cairo", sans-serif',
          button: {
            fontWeight: 600,
            letterSpacing: 0.8,
          },
          h1: { fontWeight: 700, letterSpacing: -1 },
          h2: { fontWeight: 600 },
          h3: { fontWeight: 600 },
        },
        shape: {
          borderRadius: 20,
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: '#01030b',
              },
            },
          },
          MuiPaper: {
            defaultProps: {
              elevation: 0,
            },
            styleOverrides: {
              root: {
                backdropFilter: 'blur(18px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 999,
                textTransform: 'none',
                position: 'relative',
                overflow: 'hidden',
                paddingInline: 24,
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 999,
                backdropFilter: 'blur(10px)',
              },
            },
          },
        },
      }),
    [direction, mode]
  );

  const cache = useMemo(() => createEmotionCache(direction), [direction]);

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <OfflineProvider>
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/assistant" element={<AssistantPage />} />
                  <Route path="/service/:id" element={<ServiceDetailsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/admin" element={<AdminPanelPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/documents" element={<DocumentTrackerPage />} />
                  <Route path="/appointments" element={<AppointmentPage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </OfflineProvider>
        </NotificationProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

const App = () => (
  <LanguageProvider>
    <ThemeModeProvider>
      <InnerApp />
    </ThemeModeProvider>
  </LanguageProvider>
);

export default App;

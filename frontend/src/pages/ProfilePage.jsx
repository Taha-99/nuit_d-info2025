import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Switch,
  FormControlLabel,
  Grid,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import LanguageIcon from '@mui/icons-material/Language';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NavBar from '../components/NavBar';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useThemeMode } from '../contexts/ThemeContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { success, error } = useNotification();
  const { mode, toggleTheme } = useThemeMode();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    privacy: {
      showProfile: true,
      shareData: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
      }));
    }
  }, [user, isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleNotificationChange = (key) => {
    setFormData(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));
    setSaved(false);
  };

  const handlePrivacyChange = (key) => {
    setFormData(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: !prev.privacy[key] },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile?.(formData);
      setSaved(true);
      success(language === 'ar' ? 'تم حفظ الملف الشخصي بنجاح' : 'Profil sauvegardé avec succès');
    } catch (err) {
      error(language === 'ar' ? 'خطأ في حفظ الملف الشخصي' : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <NavBar />
      <Box sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 }, flex: 1, width: '100%', maxWidth: 900, mx: 'auto' }}>
        <Stack spacing={3}>
          {/* Header */}
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Stack spacing={2} alignItems="center">
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                  }}
                >
                  {formData.name?.charAt(0)?.toUpperCase() || <PersonIcon sx={{ fontSize: 60 }} />}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'secondary.main',
                    '&:hover': { bgcolor: 'secondary.dark' },
                  }}
                  size="small"
                >
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="h5" fontWeight={600}>
                {formData.name || (language === 'ar' ? 'مستخدم' : 'Utilisateur')}
              </Typography>
              <Chip 
                label={user?.role === 'admin' ? (language === 'ar' ? 'مدير' : 'Administrateur') : (language === 'ar' ? 'مستخدم' : 'Citoyen')}
                color="primary"
                size="small"
              />
            </Stack>
          </Paper>

          {/* Personal Information */}
          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PersonIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  {language === 'ar' ? 'المعلومات الشخصية' : 'Informations personnelles'}
                </Typography>
              </Stack>
              <Divider />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={language === 'ar' ? 'الاسم الكامل' : 'Nom complet'}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={language === 'ar' ? 'رقم الهاتف' : 'Téléphone'}
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={language === 'ar' ? 'المدينة' : 'Ville'}
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={language === 'ar' ? 'العنوان' : 'Adresse'}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>

          {/* Preferences */}
          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LanguageIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  {language === 'ar' ? 'التفضيلات' : 'Préférences'}
                </Typography>
              </Stack>
              <Divider />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mode === 'dark'}
                        onChange={toggleTheme}
                        color="primary"
                      />
                    }
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <DarkModeIcon fontSize="small" />
                        <span>{language === 'ar' ? 'الوضع الداكن' : 'Mode sombre'}</span>
                      </Stack>
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
                    startIcon={<LanguageIcon />}
                  >
                    {language === 'ar' ? 'Passer en Français' : 'التبديل إلى العربية'}
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          </Paper>

          {/* Notifications */}
          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <NotificationsIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                </Typography>
              </Stack>
              <Divider />
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notifications.email}
                      onChange={() => handleNotificationChange('email')}
                      color="primary"
                    />
                  }
                  label={language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Notifications par email'}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notifications.sms}
                      onChange={() => handleNotificationChange('sms')}
                      color="primary"
                    />
                  }
                  label={language === 'ar' ? 'إشعارات SMS' : 'Notifications SMS'}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notifications.push}
                      onChange={() => handleNotificationChange('push')}
                      color="primary"
                    />
                  }
                  label={language === 'ar' ? 'إشعارات الدفع' : 'Notifications push'}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Privacy */}
          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <SecurityIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  {language === 'ar' ? 'الخصوصية والأمان' : 'Confidentialité et sécurité'}
                </Typography>
              </Stack>
              <Divider />
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.privacy.showProfile}
                      onChange={() => handlePrivacyChange('showProfile')}
                      color="primary"
                    />
                  }
                  label={language === 'ar' ? 'إظهار الملف الشخصي للمسؤولين' : 'Profil visible par les administrateurs'}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.privacy.shareData}
                      onChange={() => handlePrivacyChange('shareData')}
                      color="primary"
                    />
                  }
                  label={language === 'ar' ? 'مشاركة البيانات لتحسين الخدمات' : 'Partager les données pour améliorer les services'}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Save Button */}
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            {saved && (
              <Alert severity="success" sx={{ flex: 1 }}>
                {language === 'ar' ? 'تم الحفظ!' : 'Sauvegardé!'}
              </Alert>
            )}
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
            >
              {loading 
                ? (language === 'ar' ? 'جاري الحفظ...' : 'Enregistrement...')
                : (language === 'ar' ? 'حفظ التغييرات' : 'Enregistrer les modifications')
              }
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default ProfilePage;

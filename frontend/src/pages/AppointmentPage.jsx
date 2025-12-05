import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Stack, Typography, Button, Grid, Card, CardContent, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, MenuItem, FormControl, InputLabel, Select, Alert,
  IconButton, Divider, TextField, Skeleton,
} from '@mui/material';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import 'dayjs/locale/ar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NavBar from '../components/NavBar';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import * as api from '../services/apiService';

const AppointmentPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { success, error, info } = useNotification();
  
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, pending: 0, confirmed: 0 });
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ serviceType: '', date: null, time: null, locationId: '', notes: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [apptsRes, statsRes, servicesRes, locsRes] = await Promise.all([
        api.getAppointments(),
        api.getAppointmentStats(),
        api.getAppointmentServices(),
        api.getAppointmentLocations(),
      ]);
      setAppointments(apptsRes.data || []);
      setStats(statsRes.data || { total: 0, upcoming: 0, pending: 0, confirmed: 0 });
      setServices(servicesRes.data || []);
      setLocations(locsRes.data || []);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadData();
  }, [isAuthenticated, navigate, loadData]);

  const handleOpenDialog = (appt = null) => {
    if (appt) {
      setEditingId(appt._id);
      const svc = services.find(s => s.service === appt.service);
      const loc = locations.find(l => l.location === appt.location);
      setFormData({
        serviceType: svc?.id || '',
        date: dayjs(appt.date),
        time: dayjs(`2025-01-01T${appt.time}`),
        locationId: loc?.id || '',
        notes: appt.notes || '',
      });
    } else {
      setEditingId(null);
      setFormData({ serviceType: '', date: null, time: null, locationId: '', notes: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.serviceType || !formData.date || !formData.time || !formData.locationId) {
      error(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Remplissez tous les champs');
      return;
    }
    try {
      const payload = {
        serviceType: formData.serviceType,
        locationId: formData.locationId,
        date: formData.date.format('YYYY-MM-DD'),
        time: formData.time.format('HH:mm'),
        notes: formData.notes,
      };
      if (editingId) {
        await api.updateAppointment(editingId, payload);
        success(language === 'ar' ? 'تم التحديث' : 'Mis à jour');
      } else {
        await api.createAppointment(payload);
        success(language === 'ar' ? 'تم الحجز' : 'Réservé');
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || (language === 'ar' ? 'خطأ' : 'Erreur'));
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.cancelAppointment(id);
      info(language === 'ar' ? 'تم الإلغاء' : 'Annulé');
      loadData();
    } catch { error(language === 'ar' ? 'خطأ' : 'Erreur'); }
  };

  const getStatusColor = (s) => ({ confirmed: 'success', pending: 'warning', cancelled: 'error' }[s] || 'default');
  const getStatusLabel = (s) => ({ confirmed: { fr: 'Confirmé', ar: 'مؤكد' }, pending: { fr: 'En attente', ar: 'في الانتظار' }, cancelled: { fr: 'Annulé', ar: 'ملغى' } }[s]?.[language] || s);

  const upcomingAppts = appointments.filter(a => dayjs(a.date).isAfter(dayjs()) && a.status !== 'cancelled');
  const pastAppts = appointments.filter(a => dayjs(a.date).isBefore(dayjs()) || a.status === 'cancelled');

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={language === 'ar' ? 'ar' : 'fr'}>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <NavBar />
        <Box sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 }, flex: 1, width: '100%' }}>
          <Stack spacing={4}>
            <Paper sx={{ p: 4, background: 'linear-gradient(135deg, rgba(8,12,30,0.9), rgba(9,16,42,0.9))' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="h4" fontWeight={700}><CalendarMonthIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />{language === 'ar' ? 'المواعيد' : 'Rendez-vous'}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>{language === 'ar' ? 'إدارة مواعيدك' : 'Gérez vos rendez-vous'}</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} size="large" onClick={() => handleOpenDialog()}>{language === 'ar' ? 'حجز' : 'Nouveau'}</Button>
              </Stack>
            </Paper>

            <Grid container spacing={3}>
              {[{ label: language === 'ar' ? 'الإجمالي' : 'Total', value: stats.total, color: '#8c6cff' },
                { label: language === 'ar' ? 'القادمة' : 'À venir', value: stats.upcoming, color: '#4ef0d0' },
                { label: language === 'ar' ? 'في الانتظار' : 'En attente', value: stats.pending, color: '#ffd54f' },
                { label: language === 'ar' ? 'مؤكدة' : 'Confirmés', value: stats.confirmed, color: '#4ef0d0' }].map((s, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <Paper sx={{ p: 3, textAlign: 'center', borderTop: `4px solid ${s.color}` }}>
                    {loading ? <Skeleton width={60} height={50} sx={{ mx: 'auto' }} /> : <Typography variant="h3" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>}
                    <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Box>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>{language === 'ar' ? 'القادمة' : 'À venir'}</Typography>
              {loading ? [1,2].map(i => <Skeleton key={i} height={150} sx={{ mb: 2 }} />) : upcomingAppts.length === 0 ? (
                <Alert severity="info">{language === 'ar' ? 'لا توجد مواعيد' : 'Aucun rendez-vous'}</Alert>
              ) : (
                <Grid container spacing={3}>
                  {upcomingAppts.map(appt => (
                    <Grid item xs={12} md={6} key={appt._id}>
                      <Card sx={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                        <CardContent>
                          <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="h6" fontWeight={600}>{language === 'ar' ? appt.serviceAr : appt.service}</Typography>
                              <Chip label={getStatusLabel(appt.status)} color={getStatusColor(appt.status)} size="small" icon={appt.status === 'confirmed' ? <CheckCircleIcon /> : undefined} />
                            </Stack>
                            <Divider />
                            <Stack spacing={1}>
                              <Stack direction="row" alignItems="center" spacing={1}><CalendarMonthIcon fontSize="small" color="primary" /><Typography variant="body2">{dayjs(appt.date).format('DD/MM/YYYY')}</Typography></Stack>
                              <Stack direction="row" alignItems="center" spacing={1}><AccessTimeIcon fontSize="small" color="primary" /><Typography variant="body2">{appt.time}</Typography></Stack>
                              <Stack direction="row" alignItems="center" spacing={1}><LocationOnIcon fontSize="small" color="primary" /><Typography variant="body2">{language === 'ar' ? appt.locationAr : appt.location}</Typography></Stack>
                            </Stack>
                            <Stack direction="row" justifyContent="flex-end" spacing={1}>
                              <IconButton size="small" color="primary" onClick={() => handleOpenDialog(appt)}><EditIcon fontSize="small" /></IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDelete(appt._id)}><DeleteIcon fontSize="small" /></IconButton>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {pastAppts.length > 0 && (
              <Box>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 2, opacity: 0.7 }}>{language === 'ar' ? 'السابقة' : 'Passés'}</Typography>
                <Stack spacing={2}>
                  {pastAppts.map(appt => (
                    <Paper key={appt._id} sx={{ p: 2, opacity: 0.6 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <CalendarMonthIcon color="disabled" />
                          <Box><Typography>{language === 'ar' ? appt.serviceAr : appt.service}</Typography><Typography variant="caption" color="text.secondary">{dayjs(appt.date).format('DD/MM/YYYY')} - {appt.time}</Typography></Box>
                        </Stack>
                        <Chip label={getStatusLabel(appt.status)} color={getStatusColor(appt.status)} size="small" variant="outlined" />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingId ? (language === 'ar' ? 'تعديل' : 'Modifier') : (language === 'ar' ? 'حجز جديد' : 'Nouveau')}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <FormControl fullWidth><InputLabel>{language === 'ar' ? 'الخدمة' : 'Service'}</InputLabel>
                <Select value={formData.serviceType} label="Service" onChange={(e) => setFormData(p => ({ ...p, serviceType: e.target.value }))}>
                  {services.map(s => <MenuItem key={s.id} value={s.id}>{language === 'ar' ? s.serviceAr : s.service}</MenuItem>)}
                </Select>
              </FormControl>
              <DatePicker label={language === 'ar' ? 'التاريخ' : 'Date'} value={formData.date} onChange={(v) => setFormData(p => ({ ...p, date: v }))} minDate={dayjs()} slotProps={{ textField: { fullWidth: true } }} />
              <TimePicker label={language === 'ar' ? 'الوقت' : 'Heure'} value={formData.time} onChange={(v) => setFormData(p => ({ ...p, time: v }))} slotProps={{ textField: { fullWidth: true } }} />
              <FormControl fullWidth><InputLabel>{language === 'ar' ? 'المكان' : 'Lieu'}</InputLabel>
                <Select value={formData.locationId} label="Lieu" onChange={(e) => setFormData(p => ({ ...p, locationId: e.target.value }))}>
                  {locations.map(l => <MenuItem key={l.id} value={l.id}>{language === 'ar' ? l.locationAr : l.location}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField fullWidth multiline rows={2} label={language === 'ar' ? 'ملاحظات' : 'Notes'} value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>{language === 'ar' ? 'إلغاء' : 'Annuler'}</Button>
            <Button variant="contained" onClick={handleSave}>{editingId ? (language === 'ar' ? 'تحديث' : 'Modifier') : (language === 'ar' ? 'حجز' : 'Réserver')}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AppointmentPage;

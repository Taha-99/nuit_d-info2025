import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Skeleton,
} from '@mui/material';
import NavBar from '../components/NavBar';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import * as api from '../services/apiService';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import FeedbackIcon from '@mui/icons-material/Feedback';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChatIcon from '@mui/icons-material/Chat';

const AdminPanelPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { success, error: showError, info } = useNotification();
  
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServices: 0,
    totalDocuments: 0,
    totalAppointments: 0,
    totalFeedback: 0,
    totalConversations: 0,
    pendingDocuments: 0,
    upcomingAppointments: 0,
  });
  
  // Services
  const [services, setServices] = useState([]);
  const [serviceDialog, setServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: '', titleAr: '', description: '', descriptionAr: '', category: '', icon: ''
  });
  
  // Feedback
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({ total: 0, avgRating: 0, pending: 0, resolved: 0 });
  
  // Documents & Appointments
  const [documents, setDocuments] = useState([]);
  const [docStats, setDocStats] = useState({ total: 0, pending: 0, processing: 0, completed: 0 });
  const [appointments, setAppointments] = useState([]);
  const [apptStats, setApptStats] = useState({ total: 0, upcoming: 0, pending: 0, confirmed: 0 });

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [servicesRes, feedbackRes, feedbackStatsRes, docStatsRes, apptStatsRes] = await Promise.all([
        api.getServices().catch(() => []),
        api.getFeedback().catch(() => ({ feedback: [] })),
        api.getFeedbackStats().catch(() => ({})),
        api.getDocumentStats().catch(() => ({ data: {} })),
        api.getAppointmentStats().catch(() => ({ data: {} })),
      ]);
      
      setServices(Array.isArray(servicesRes) ? servicesRes : []);
      setFeedbackList(feedbackRes?.feedback || []);
      setFeedbackStats(feedbackStatsRes || { total: 0, avgRating: 0, pending: 0, resolved: 0 });
      setDocStats(docStatsRes?.data || { total: 0, pending: 0, processing: 0, completed: 0 });
      setApptStats(apptStatsRes?.data || { total: 0, upcoming: 0, pending: 0, confirmed: 0 });
      
      // Set dashboard stats
      setStats({
        totalServices: Array.isArray(servicesRes) ? servicesRes.length : 0,
        totalFeedback: feedbackRes?.feedback?.length || 0,
        totalDocuments: docStatsRes?.data?.total || 0,
        totalAppointments: apptStatsRes?.data?.total || 0,
        pendingDocuments: docStatsRes?.data?.pending || 0,
        upcomingAppointments: apptStatsRes?.data?.upcoming || 0,
        avgRating: feedbackStatsRes?.avgRating || 0,
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadDashboardData();
    }
  }, [isAuthenticated, user, loadDashboardData]);

  // Service CRUD
  const handleOpenServiceDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        title: service.title || '',
        titleAr: service.titleAr || '',
        description: service.description || '',
        descriptionAr: service.descriptionAr || '',
        category: service.category || '',
        icon: service.icon || '',
      });
    } else {
      setEditingService(null);
      setServiceForm({ title: '', titleAr: '', description: '', descriptionAr: '', category: '', icon: '' });
    }
    setServiceDialog(true);
  };

  const handleSaveService = async () => {
    try {
      if (editingService) {
        await api.updateService(editingService._id, serviceForm);
        success(language === 'ar' ? 'تم التحديث' : 'Service mis à jour');
      } else {
        await api.createService(serviceForm);
        success(language === 'ar' ? 'تم الإنشاء' : 'Service créé');
      }
      setServiceDialog(false);
      loadDashboardData();
    } catch (err) {
      showError(err.message || 'Erreur');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm(language === 'ar' ? 'تأكيد الحذف؟' : 'Confirmer la suppression ?')) return;
    try {
      await api.deleteService(id);
      info(language === 'ar' ? 'تم الحذف' : 'Service supprimé');
      loadDashboardData();
    } catch (err) {
      showError(err.message || 'Erreur');
    }
  };

  // Feedback status update
  const handleUpdateFeedbackStatus = async (id, status) => {
    try {
      await api.updateFeedbackStatus(id, { status });
      success(language === 'ar' ? 'تم التحديث' : 'Statut mis à jour');
      loadDashboardData();
    } catch (err) {
      showError(err.message || 'Erreur');
    }
  };

  // Check authorization
  if (!isAuthenticated || !user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <NavBar />
        <Box sx={{ py: 6, px: { xs: 2, sm: 4, md: 6 }, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Alert severity="warning">
            {language === 'ar' ? 'يرجى تسجيل الدخول للوصول إلى لوحة الإدارة' : 'Connectez-vous pour accéder au panneau d\'administration.'}
          </Alert>
        </Box>
      </Box>
    );
  }

  if (user.role !== 'admin') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <NavBar />
        <Box sx={{ py: 6, px: { xs: 2, sm: 4, md: 6 }, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Alert severity="error">
            {language === 'ar' ? 'غير مصرح لك بالوصول' : 'Accès non autorisé. Réservé aux administrateurs.'}
          </Alert>
        </Box>
      </Box>
    );
  }

  const statCards = [
    { icon: <DescriptionIcon />, label: language === 'ar' ? 'الخدمات' : 'Services', value: stats.totalServices, color: '#8c6cff' },
    { icon: <AssignmentIcon />, label: language === 'ar' ? 'الوثائق' : 'Documents', value: stats.totalDocuments, color: '#4ef0d0' },
    { icon: <CalendarMonthIcon />, label: language === 'ar' ? 'المواعيد' : 'RDV', value: stats.totalAppointments, color: '#ffd54f' },
    { icon: <FeedbackIcon />, label: language === 'ar' ? 'التعليقات' : 'Feedback', value: stats.totalFeedback, color: '#ff8a65' },
    { icon: <PendingIcon />, label: language === 'ar' ? 'وثائق معلقة' : 'Docs en attente', value: stats.pendingDocuments, color: '#f48fb1' },
    { icon: <TrendingUpIcon />, label: language === 'ar' ? 'التقييم' : 'Note moy.', value: stats.avgRating?.toFixed(1) || '0', color: '#81c784' },
  ];

  const categories = ['identity', 'civil', 'transport', 'social', 'education', 'health', 'business', 'other'];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <NavBar />
      <Box sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 }, flex: 1, width: '100%' }}>
        <Stack spacing={4}>
          {/* Header */}
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(8,12,30,0.95), rgba(14,20,50,0.9))' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <DashboardIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {language === 'ar' ? 'لوحة الإدارة' : 'Panneau d\'Administration'}
                  </Typography>
                  <Typography color="text.secondary">
                    {language === 'ar' ? `مرحباً، ${user.name}` : `Bienvenue, ${user.name}`}
                  </Typography>
                </Box>
              </Stack>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadDashboardData}>
                {language === 'ar' ? 'تحديث' : 'Actualiser'}
              </Button>
            </Stack>
          </Paper>

          {loading && <LinearProgress />}

          {/* Stats Grid */}
          <Grid container spacing={2}>
            {statCards.map((stat, i) => (
              <Grid item xs={6} sm={4} md={2} key={i}>
                <Paper sx={{ p: 2, textAlign: 'center', borderTop: `3px solid ${stat.color}` }}>
                  <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                  <Typography variant="h4" fontWeight={700}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Tabs */}
          <Paper>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
              <Tab icon={<DescriptionIcon />} label={language === 'ar' ? 'الخدمات' : 'Services'} />
              <Tab icon={<FeedbackIcon />} label={language === 'ar' ? 'التعليقات' : 'Feedback'} />
              <Tab icon={<AssignmentIcon />} label={language === 'ar' ? 'الوثائق' : 'Documents'} />
              <Tab icon={<BarChartIcon />} label={language === 'ar' ? 'الإحصائيات' : 'Statistiques'} />
            </Tabs>

            {/* Services Tab */}
            {tab === 0 && (
              <Box sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {language === 'ar' ? 'إدارة الخدمات' : 'Gestion des Services'} ({services.length})
                  </Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenServiceDialog()}>
                    {language === 'ar' ? 'إضافة' : 'Ajouter'}
                  </Button>
                </Stack>
                
                {loading ? (
                  <Stack spacing={2}>
                    {[1,2,3].map(i => <Skeleton key={i} variant="rectangular" height={80} />)}
                  </Stack>
                ) : services.length === 0 ? (
                  <Alert severity="info">{language === 'ar' ? 'لا توجد خدمات' : 'Aucun service'}</Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{language === 'ar' ? 'العنوان' : 'Titre'}</TableCell>
                          <TableCell>{language === 'ar' ? 'الفئة' : 'Catégorie'}</TableCell>
                          <TableCell>{language === 'ar' ? 'الوصف' : 'Description'}</TableCell>
                          <TableCell align="right">{language === 'ar' ? 'إجراءات' : 'Actions'}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {services.map((service) => (
                          <TableRow key={service._id} hover>
                            <TableCell>
                              <Typography fontWeight={600}>{service.title}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={service.category || 'N/A'} size="small" />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {service.description}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton color="primary" onClick={() => handleOpenServiceDialog(service)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton color="error" onClick={() => handleDeleteService(service._id)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {/* Feedback Tab */}
            {tab === 1 && (
              <Box sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Grid container spacing={2}>
                    {[
                      { label: language === 'ar' ? 'الإجمالي' : 'Total', value: feedbackStats.total || feedbackList.length, color: '#8c6cff' },
                      { label: language === 'ar' ? 'التقييم' : 'Note moy.', value: (feedbackStats.avgRating || 0).toFixed(1), color: '#4ef0d0' },
                      { label: language === 'ar' ? 'معلق' : 'En attente', value: feedbackStats.pending || 0, color: '#ffd54f' },
                      { label: language === 'ar' ? 'تمت المعالجة' : 'Traités', value: feedbackStats.resolved || 0, color: '#81c784' },
                    ].map((s, i) => (
                      <Grid item xs={6} md={3} key={i}>
                        <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${s.color}` }}>
                          <Typography variant="h5" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
                          <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider />

                  {feedbackList.length === 0 ? (
                    <Alert severity="info">{language === 'ar' ? 'لا توجد تعليقات' : 'Aucun feedback'}</Alert>
                  ) : (
                    <Stack spacing={2}>
                      {feedbackList.slice(0, 10).map((fb) => (
                        <Card key={fb._id} sx={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                          <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Stack spacing={1}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                    {fb.user?.name?.charAt(0) || 'U'}
                                  </Avatar>
                                  <Typography fontWeight={600}>{fb.user?.name || 'Anonyme'}</Typography>
                                  <Rating value={fb.rating || 0} readOnly size="small" />
                                </Stack>
                                <Typography color="text.secondary">{fb.message || fb.comment}</Typography>
                                <Typography variant="caption" color="text.disabled">
                                  {new Date(fb.createdAt).toLocaleDateString()}
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1}>
                                <Chip 
                                  label={fb.status || 'pending'} 
                                  size="small" 
                                  color={fb.status === 'resolved' ? 'success' : 'warning'}
                                />
                                {fb.status !== 'resolved' && (
                                  <IconButton size="small" color="success" onClick={() => handleUpdateFeedbackStatus(fb._id, 'resolved')}>
                                    <CheckCircleIcon />
                                  </IconButton>
                                )}
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Box>
            )}

            {/* Documents Tab */}
            {tab === 2 && (
              <Box sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Grid container spacing={2}>
                    {[
                      { label: language === 'ar' ? 'الإجمالي' : 'Total', value: docStats.total, color: '#8c6cff' },
                      { label: language === 'ar' ? 'مكتملة' : 'Terminés', value: docStats.completed, color: '#4ef0d0' },
                      { label: language === 'ar' ? 'قيد المعالجة' : 'En cours', value: docStats.processing, color: '#ffd54f' },
                      { label: language === 'ar' ? 'في الانتظار' : 'En attente', value: docStats.pending, color: '#ff8a65' },
                    ].map((s, i) => (
                      <Grid item xs={6} md={3} key={i}>
                        <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${s.color}` }}>
                          <Typography variant="h5" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
                          <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider />

                  <Typography variant="h6" fontWeight={600}>
                    {language === 'ar' ? 'إحصائيات المواعيد' : 'Statistiques Rendez-vous'}
                  </Typography>

                  <Grid container spacing={2}>
                    {[
                      { label: language === 'ar' ? 'الإجمالي' : 'Total', value: apptStats.total, color: '#8c6cff' },
                      { label: language === 'ar' ? 'القادمة' : 'À venir', value: apptStats.upcoming, color: '#4ef0d0' },
                      { label: language === 'ar' ? 'مؤكدة' : 'Confirmés', value: apptStats.confirmed, color: '#81c784' },
                      { label: language === 'ar' ? 'في الانتظار' : 'En attente', value: apptStats.pending, color: '#ffd54f' },
                    ].map((s, i) => (
                      <Grid item xs={6} md={3} key={i}>
                        <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${s.color}` }}>
                          <Typography variant="h5" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
                          <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </Box>
            )}

            {/* Statistics Tab */}
            {tab === 3 && (
              <Box sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Typography variant="h6" fontWeight={600}>
                    {language === 'ar' ? 'نظرة عامة على النظام' : 'Vue d\'ensemble du système'}
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          {language === 'ar' ? 'توزيع الوثائق' : 'Répartition des Documents'}
                        </Typography>
                        <Stack spacing={2}>
                          {[
                            { label: language === 'ar' ? 'مكتملة' : 'Terminés', value: docStats.completed, total: docStats.total, color: '#4ef0d0' },
                            { label: language === 'ar' ? 'قيد المعالجة' : 'En cours', value: docStats.processing, total: docStats.total, color: '#ffd54f' },
                            { label: language === 'ar' ? 'في الانتظار' : 'En attente', value: docStats.pending, total: docStats.total, color: '#ff8a65' },
                          ].map((item, i) => (
                            <Box key={i}>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2">{item.label}</Typography>
                                <Typography variant="body2">{item.value} ({item.total ? Math.round(item.value / item.total * 100) : 0}%)</Typography>
                              </Stack>
                              <LinearProgress 
                                variant="determinate" 
                                value={item.total ? (item.value / item.total * 100) : 0} 
                                sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: item.color } }}
                              />
                            </Box>
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          {language === 'ar' ? 'توزيع المواعيد' : 'Répartition des RDV'}
                        </Typography>
                        <Stack spacing={2}>
                          {[
                            { label: language === 'ar' ? 'مؤكدة' : 'Confirmés', value: apptStats.confirmed, total: apptStats.total, color: '#81c784' },
                            { label: language === 'ar' ? 'في الانتظار' : 'En attente', value: apptStats.pending, total: apptStats.total, color: '#ffd54f' },
                            { label: language === 'ar' ? 'القادمة' : 'À venir', value: apptStats.upcoming, total: apptStats.total, color: '#4ef0d0' },
                          ].map((item, i) => (
                            <Box key={i}>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2">{item.label}</Typography>
                                <Typography variant="body2">{item.value} ({item.total ? Math.round(item.value / item.total * 100) : 0}%)</Typography>
                              </Stack>
                              <LinearProgress 
                                variant="determinate" 
                                value={item.total ? (item.value / item.total * 100) : 0} 
                                sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: item.color } }}
                              />
                            </Box>
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      <Paper sx={{ p: 3, background: 'rgba(140,108,255,0.1)' }}>
                        <Stack direction="row" justifyContent="space-around" flexWrap="wrap" gap={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" fontWeight={700} color="primary.main">{stats.totalServices}</Typography>
                            <Typography color="text.secondary">{language === 'ar' ? 'خدمة نشطة' : 'Services actifs'}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" fontWeight={700} color="secondary.main">{stats.avgRating?.toFixed(1) || 'N/A'}</Typography>
                            <Typography color="text.secondary">{language === 'ar' ? 'متوسط التقييم' : 'Note moyenne'}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" fontWeight={700} sx={{ color: '#4ef0d0' }}>{stats.totalDocuments + stats.totalAppointments}</Typography>
                            <Typography color="text.secondary">{language === 'ar' ? 'إجمالي الطلبات' : 'Total demandes'}</Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  </Grid>
                </Stack>
              </Box>
            )}
          </Paper>
        </Stack>
      </Box>

      {/* Service Dialog */}
      <Dialog open={serviceDialog} onClose={() => setServiceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingService 
            ? (language === 'ar' ? 'تعديل الخدمة' : 'Modifier le service')
            : (language === 'ar' ? 'إضافة خدمة' : 'Ajouter un service')
          }
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={language === 'ar' ? 'العنوان (فرنسي)' : 'Titre (FR)'}
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm(p => ({ ...p, title: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={language === 'ar' ? 'العنوان (عربي)' : 'Titre (AR)'}
                  value={serviceForm.titleAr}
                  onChange={(e) => setServiceForm(p => ({ ...p, titleAr: e.target.value }))}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={language === 'ar' ? 'الوصف (فرنسي)' : 'Description (FR)'}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm(p => ({ ...p, description: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={language === 'ar' ? 'الوصف (عربي)' : 'Description (AR)'}
                  value={serviceForm.descriptionAr}
                  onChange={(e) => setServiceForm(p => ({ ...p, descriptionAr: e.target.value }))}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{language === 'ar' ? 'الفئة' : 'Catégorie'}</InputLabel>
                  <Select
                    value={serviceForm.category}
                    label="Catégorie"
                    onChange={(e) => setServiceForm(p => ({ ...p, category: e.target.value }))}
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={language === 'ar' ? 'الأيقونة' : 'Icône (emoji)'}
                  value={serviceForm.icon}
                  onChange={(e) => setServiceForm(p => ({ ...p, icon: e.target.value }))}
                  placeholder="📋"
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServiceDialog(false)}>
            {language === 'ar' ? 'إلغاء' : 'Annuler'}
          </Button>
          <Button variant="contained" onClick={handleSaveService}>
            {language === 'ar' ? 'حفظ' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanelPage;

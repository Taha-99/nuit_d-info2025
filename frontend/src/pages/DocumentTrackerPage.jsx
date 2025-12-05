import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Stack, Typography, TextField, Button, Chip, Grid, Card, CardContent,
  Stepper, Step, StepLabel, IconButton, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, LinearProgress, Collapse, Alert, FormControl, InputLabel, Select, MenuItem, Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import NavBar from '../components/NavBar';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import * as api from '../services/apiService';

const DocumentTrackerPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { success, error, info } = useNotification();
  
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, completed: 0 });
  const [documentTypes, setDocumentTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [trackDialog, setTrackDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [trackNumber, setTrackNumber] = useState('');
  const [newDocType, setNewDocType] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [docsRes, statsRes, typesRes] = await Promise.all([
        api.getDocuments({ search: searchQuery }),
        api.getDocumentStats(),
        api.getDocumentTypes(),
      ]);
      setDocuments(docsRes.data || []);
      setStats(statsRes.data || { total: 0, pending: 0, processing: 0, completed: 0 });
      setDocumentTypes(typesRes.data || []);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadData();
  }, [isAuthenticated, navigate, loadData]);

  const getStatusIcon = (status) => {
    const icons = {
      completed: <CheckCircleIcon sx={{ color: '#4ef0d0' }} />,
      processing: <PendingIcon sx={{ color: '#ffd54f' }} />,
      pending: <PendingIcon sx={{ color: '#ff8a65' }} />,
      rejected: <ErrorIcon sx={{ color: '#f44336' }} />,
    };
    return icons[status] || <DescriptionIcon />;
  };

  const getStatusLabel = (status) => {
    const labels = { completed: { fr: 'Terminé', ar: 'مكتمل' }, processing: { fr: 'En cours', ar: 'قيد المعالجة' }, pending: { fr: 'En attente', ar: 'في الانتظار' }, rejected: { fr: 'Rejeté', ar: 'مرفوض' } };
    return labels[status]?.[language] || status;
  };

  const getStatusColor = (status) => ({ completed: 'success', processing: 'warning', pending: 'info', rejected: 'error' }[status] || 'default');

  const handleTrackExternal = async () => {
    if (!trackNumber.trim()) return;
    try {
      const result = await api.trackDocument(trackNumber);
      if (result.data) {
        setDocuments(prev => [result.data, ...prev.filter(d => d.trackingId !== result.data.trackingId)]);
        success(language === 'ar' ? 'تم العثور على الوثيقة' : 'Document trouvé');
        setTrackDialog(false); setTrackNumber('');
      }
    } catch { error(language === 'ar' ? 'لم يتم العثور على وثيقة' : 'Document non trouvé'); }
  };

  const handleCreateDocument = async () => {
    if (!newDocType) return;
    try {
      const result = await api.createDocument({ type: newDocType });
      if (result.data) {
        setDocuments(prev => [result.data, ...prev]);
        success(language === 'ar' ? 'تم إنشاء الطلب' : 'Demande créée');
        setCreateDialog(false); setNewDocType(''); loadData();
      }
    } catch { error(language === 'ar' ? 'خطأ في الإنشاء' : 'Erreur de création'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR') : '-';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <NavBar />
      <Box sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 }, flex: 1, width: '100%' }}>
        <Stack spacing={4}>
          <Paper sx={{ p: 4, background: 'linear-gradient(135deg, rgba(8,12,30,0.9), rgba(9,16,42,0.9))' }}>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="h4" fontWeight={700}>{language === 'ar' ? 'متابعة الوثائق' : 'Suivi des documents'}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>{language === 'ar' ? 'تتبع طلباتك' : 'Suivez vos demandes'}</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>{language === 'ar' ? 'تحديث' : 'Actualiser'}</Button>
                  <Button variant="outlined" startIcon={<SearchIcon />} onClick={() => setTrackDialog(true)}>{language === 'ar' ? 'تتبع' : 'Suivre'}</Button>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialog(true)}>{language === 'ar' ? 'جديد' : 'Nouveau'}</Button>
                </Stack>
              </Stack>
              <TextField fullWidth placeholder={language === 'ar' ? 'بحث...' : 'Rechercher...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
            </Stack>
          </Paper>

          {loading && <LinearProgress />}

          <Grid container spacing={3}>
            {[{ label: language === 'ar' ? 'الإجمالي' : 'Total', value: stats.total, color: '#8c6cff' },
              { label: language === 'ar' ? 'مكتملة' : 'Terminées', value: stats.completed, color: '#4ef0d0' },
              { label: language === 'ar' ? 'قيد المعالجة' : 'En cours', value: stats.processing, color: '#ffd54f' },
              { label: language === 'ar' ? 'في الانتظار' : 'En attente', value: stats.pending, color: '#ff8a65' }].map((s, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Paper sx={{ p: 3, textAlign: 'center', borderLeft: `4px solid ${s.color}` }}>
                  <Typography variant="h3" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Stack spacing={2}>
            {loading ? [1,2,3].map(i => <Skeleton key={i} height={100} />) : documents.length === 0 ? (
              <Alert severity="info">{language === 'ar' ? 'لا توجد وثائق' : 'Aucun document'}</Alert>
            ) : documents.map(doc => (
              <Card key={doc._id || doc.trackingId} sx={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" onClick={() => setExpandedDoc(expandedDoc === doc.trackingId ? null : doc.trackingId)} sx={{ cursor: 'pointer' }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        {getStatusIcon(doc.status)}
                        <Box>
                          <Typography variant="h6" fontWeight={600}>{language === 'ar' ? doc.titleAr : doc.title}</Typography>
                          <Typography variant="body2" color="text.secondary">{doc.trackingId} • {formatDate(doc.createdAt)}</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Chip label={getStatusLabel(doc.status)} color={getStatusColor(doc.status)} size="small" />
                        <IconButton>{expandedDoc === doc.trackingId ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
                      </Stack>
                    </Stack>
                    <LinearProgress variant="determinate" value={doc.progress || 0} sx={{ height: 8, borderRadius: 4 }} />
                    <Collapse in={expandedDoc === doc.trackingId}>
                      <Stepper orientation="vertical" sx={{ mt: 2 }}>
                        {(doc.steps || []).map((step, i) => (
                          <Step key={i} completed={step.completed}><StepLabel>{language === 'ar' ? step.labelAr : step.label}</StepLabel></Step>
                        ))}
                      </Stepper>
                    </Collapse>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Box>

      <Dialog open={trackDialog} onClose={() => setTrackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{language === 'ar' ? 'تتبع طلب' : 'Suivre'}</DialogTitle>
        <DialogContent><TextField fullWidth label={language === 'ar' ? 'رقم التتبع' : 'Numéro'} value={trackNumber} onChange={(e) => setTrackNumber(e.target.value)} sx={{ mt: 2 }} /></DialogContent>
        <DialogActions><Button onClick={() => setTrackDialog(false)}>{language === 'ar' ? 'إلغاء' : 'Annuler'}</Button><Button variant="contained" onClick={handleTrackExternal}>{language === 'ar' ? 'تتبع' : 'Suivre'}</Button></DialogActions>
      </Dialog>

      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{language === 'ar' ? 'طلب جديد' : 'Nouvelle demande'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}><InputLabel>{language === 'ar' ? 'النوع' : 'Type'}</InputLabel>
            <Select value={newDocType} label="Type" onChange={(e) => setNewDocType(e.target.value)}>
              {documentTypes.map(t => <MenuItem key={t.id} value={t.id}>{language === 'ar' ? t.titleAr : t.title}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions><Button onClick={() => setCreateDialog(false)}>{language === 'ar' ? 'إلغاء' : 'Annuler'}</Button><Button variant="contained" onClick={handleCreateDocument}>{language === 'ar' ? 'إنشاء' : 'Créer'}</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentTrackerPage;

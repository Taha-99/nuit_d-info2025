import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Rating,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import NavBar from '../components/NavBar';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/apiService';
import ChatIcon from '@mui/icons-material/Chat';

const categoryOptions = [
  { value: 'service', fr: 'Service public', ar: 'الخدمة' },
  { value: 'interface', fr: 'Interface / design', ar: 'الواجهة' },
  { value: 'performance', fr: 'Performance', ar: 'الأداء' },
  { value: 'content', fr: 'Contenu', ar: 'المحتوى' },
  { value: 'bug', fr: 'Bug', ar: 'خلل' },
  { value: 'other', fr: 'Autre', ar: 'أخرى' },
];

const baseForm = {
  rating: 4,
  category: 'service',
  comment: '',
  suggestion: '',
  serviceId: '',
  isAnonymous: false,
};

const FeedbackPage = () => {
  const { language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { success, error: showError } = useNotification();
  const isArabic = language === 'ar';

  const [form, setForm] = useState({ ...baseForm });
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const headerCopy = useMemo(() => ({
    title: isArabic ? 'أرسل ملاحظاتك' : 'Partagez votre feedback',
    subtitle: isArabic
      ? 'ساعدنا على تحسين الخدمات الرقمية الحكومية.'
      : 'Aidez-nous à améliorer les démarches publiques numériques.',
    submit: isArabic ? 'إرسال الملاحظة' : 'Envoyer mon avis',
    anonymous: isArabic ? 'إرسال كمستخدم مجهول' : 'Envoyer anonymement',
    thanks: isArabic ? 'شكراً، لقد استلمنا رأيك.' : 'Merci, votre avis a bien été enregistré.',
  }), [isArabic]);

  useEffect(() => {
    let mounted = true;
    const loadServices = async () => {
      setLoadingServices(true);
      try {
        const list = await api.getServices({ limit: 50, sortBy: 'title' });
        if (mounted) {
          setServices(Array.isArray(list) ? list : list?.services || []);
        }
      } catch (err) {
        console.warn('Service list unavailable for feedback page:', err.message);
      } finally {
        if (mounted) setLoadingServices(false);
      }
    };
    loadServices();
    return () => { mounted = false; };
  }, []);

  const handleFormChange = (field) => (event, value) => {
    const inputValue = event?.target ? event.target.value : value;
    setForm((prev) => ({ ...prev, [field]: inputValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.rating) {
      showError(isArabic ? 'اختر تقييماً' : 'Choisissez une note');
      return;
    }

    const payload = {
      rating: form.rating,
      category: form.category,
      comment: form.comment?.trim() || undefined,
      suggestion: form.suggestion?.trim() || undefined,
      isAnonymous: form.isAnonymous || !isAuthenticated,
      serviceId: form.serviceId || undefined,
    };

    setSubmitting(true);
    try {
      await api.submitFeedback(payload);
      success(headerCopy.thanks);
      setForm({ ...baseForm });
    } catch (err) {
      showError(err.message || (isArabic ? 'تعذر إرسال الملاحظة' : 'Impossible d’envoyer le feedback'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <NavBar />
      <Box sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 }, flex: 1 }}>
        <Stack spacing={4}>
          <Paper sx={{ p: 4, background: 'linear-gradient(135deg, rgba(12,8,40,0.95), rgba(8,40,40,0.9))' }}>
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight={700}>{headerCopy.title}</Typography>
              <Typography color="text.secondary">{headerCopy.subtitle}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                <Chip label={isArabic ? 'دعم الخدمات' : 'Services publics'} color="secondary" variant="outlined" />
                <Chip label={isArabic ? 'بيتا' : 'Beta program'} color="primary" variant="outlined" />
                <Chip label={isArabic ? 'أقل من دقيقة' : '< 1 min'} variant="outlined" />
              </Stack>
            </Stack>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <Box>
                    <Typography fontWeight={600} sx={{ mb: 1 }}>
                      {isArabic ? 'قيم التجربة' : 'Notez votre expérience'}
                    </Typography>
                    <Rating
                      value={form.rating}
                      onChange={(event, value) => setForm((prev) => ({ ...prev, rating: value }))}
                      size="large"
                    />
                  </Box>

                  <FormControl fullWidth>
                    <InputLabel>{isArabic ? 'الفئة' : 'Catégorie'} </InputLabel>
                    <Select
                      value={form.category}
                      label={isArabic ? 'الفئة' : 'Catégorie'}
                      onChange={handleFormChange('category')}
                    >
                      {categoryOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {isArabic ? option.ar : option.fr}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth disabled={loadingServices}>
                    <InputLabel>{isArabic ? 'اختر خدمة (اختياري)' : 'Service concerné (optionnel)'}</InputLabel>
                    <Select
                      value={form.serviceId}
                      label={isArabic ? 'اختر خدمة (اختياري)' : 'Service concerné (optionnel)'}
                      onChange={handleFormChange('serviceId')}
                    >
                      <MenuItem value="">{isArabic ? 'بدون تحديد' : 'Sans précision'}</MenuItem>
                      {services.map((service) => (
                        <MenuItem key={service._id || service.id} value={service._id || service.id}>
                          {service.title}
                        </MenuItem>
                      ))}
                    </Select>
                    {loadingServices && <LinearProgress sx={{ mt: 1 }} />}
                  </FormControl>

                  <TextField
                    label={isArabic ? 'ماذا حدث؟' : 'Que s’est-il passé ?'}
                    multiline
                    minRows={3}
                    value={form.comment}
                    onChange={handleFormChange('comment')}
                  />

                  <TextField
                    label={isArabic ? 'اقتراح تحسين (اختياري)' : 'Suggestion (optionnel)'}
                    multiline
                    minRows={2}
                    value={form.suggestion}
                    onChange={handleFormChange('suggestion')}
                  />

                  <FormControlLabel
                    control={(
                      <Switch
                        checked={form.isAnonymous || !isAuthenticated}
                        onChange={(event) => setForm((prev) => ({ ...prev, isAnonymous: event.target.checked }))}
                        disabled={!isAuthenticated}
                      />
                    )}
                    label={headerCopy.anonymous + (!isAuthenticated ? ` (${isArabic ? 'مفعل افتراضياً' : 'activé par défaut'})` : '')}
                  />

                  {submitting && <LinearProgress />}

                  <Button type="submit" variant="contained" size="large" disabled={submitting}>
                    {headerCopy.submit}
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
              <Stack spacing={3}>
                <Paper sx={{ p: 3 }}>
                  <Typography fontWeight={600} gutterBottom>
                    {isArabic ? 'ماذا يحدث بعد الإرسال؟' : 'Que se passe-t-il ensuite ?'}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                      {isArabic
                        ? 'يتم قراءة كل ملاحظة من طرف فريق الجودة. يتم إخفاء الهوية تلقائياً إذا اخترت ذلك.'
                        : 'Chaque retour est lu par notre cellule qualité. L’identification est supprimée si vous le demandez.'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isArabic
                        ? 'أولوية المعالجة تعتمد على تأثير المشكلة على المواطنين وعدد التقارير.'
                        : 'La priorisation dépend de l’impact utilisateur et du nombre de signalements similaires.'}
                    </Typography>
                    <Chip
                      icon={<ChatIcon fontSize="small" />}
                      label={isArabic ? 'يستغرق الرد 48 ساعة كحد أقصى' : 'Réponse sous 48h max'}
                    />
                  </Stack>
                </Paper>

                {!isAuthenticated && (
                  <Alert severity="info">
                    {isArabic
                      ? 'يمكنك إنشاء حساب لمتابعة حالة ملاحظاتك.'
                      : 'Créez un compte pour suivre le traitement de vos retours.'}
                  </Alert>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Box>
  );
};

export default FeedbackPage;

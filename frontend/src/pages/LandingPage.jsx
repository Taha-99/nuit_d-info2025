import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  Grid,
  Chip,
} from '@mui/material';
import NavBar from '../components/NavBar';
import LanguageToggle from '../components/LanguageToggle';
import OfflineBadge from '../components/OfflineBadge';
import { useLanguage } from '../contexts/LanguageContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const featureCards = [
    {
      title: t('landing.feature.offlineTitle'),
      description: t('landing.feature.offlineBody'),
      badge: 'offline-first',
    },
    {
      title: t('landing.feature.aiTitle'),
      description: t('landing.feature.aiBody'),
      badge: 'hybrid-ai',
    },
    {
      title: t('landing.feature.syncTitle'),
      description: t('landing.feature.syncBody'),
      badge: 'synced-data',
    },
  ];

  const stats = [
    { value: '24/7', label: t('landing.stats.availability') },
    { value: '2 langues', label: t('landing.stats.languages') },
    { value: '180+', label: t('landing.stats.services') },
  ];

  const signalChips = [
    t('landing.signals.resilience'),
    t('landing.signals.hybrid'),
    t('landing.signals.sync'),
    t('landing.signals.security'),
  ];

  const timelineSteps = [
    {
      key: 'collect',
      title: t('landing.timeline.collect.title'),
      description: t('landing.timeline.collect.body'),
    },
    {
      key: 'assist',
      title: t('landing.timeline.assist.title'),
      description: t('landing.timeline.assist.body'),
    },
    {
      key: 'sync',
      title: t('landing.timeline.sync.title'),
      description: t('landing.timeline.sync.body'),
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent', width: '100%' }}>
      <NavBar />
      <Box sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, sm: 4, md: 6 }, flex: 1, width: '100%' }}>
        <Stack spacing={6}>
          <Paper
            sx={{
              p: { xs: 3, sm: 4, md: 8 },
              textAlign: 'center',
              background:
                'linear-gradient(135deg, rgba(8,12,32,0.95), rgba(14,20,50,0.9)) padding-box, linear-gradient(135deg, rgba(140,108,255,0.7), rgba(78,240,208,0.6)) border-box',
              border: '1px solid transparent',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box className="hero-aurora" />
            <Stack spacing={{ xs: 2, md: 3 }} alignItems="center">
              <OfflineBadge />
              <Chip label={t('landing.betaTag')} color="secondary" variant="outlined" />
              <Typography variant="h2" sx={{ maxWidth: 720, fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                {t('landing.headline')}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 620, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                {t('landing.subheading')}
              </Typography>
              <LanguageToggle />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', maxWidth: { xs: '100%', sm: 'auto' } }}>
                <Button
                  size="large"
                  variant="contained"
                  sx={{ px: { xs: 4, md: 6 }, width: { xs: '100%', sm: 'auto' } }}
                  onClick={() => navigate('/dashboard')}
                >
                  {t('common.start')}
                </Button>
                <Button
                  size="large"
                  variant="outlined"
                  sx={{ px: { xs: 4, md: 6 }, borderColor: 'rgba(142,91,255,0.5)', width: { xs: '100%', sm: 'auto' } }}
                  onClick={() => navigate('/assistant')}
                >
                  {t('landing.tryAssistant')}
                </Button>
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                justifyContent="center"
                sx={{ maxWidth: 600, gap: 1 }}
              >
                {signalChips.map((pill) => (
                  <Chip key={pill} label={pill} className="badge-pulse" variant="outlined" size="small" />
                ))}
              </Stack>
              <Box className="glow-divider" />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 4 }} justifyContent="center" alignItems="center">
                {stats.map((stat) => (
                  <Stack key={stat.label} spacing={1} alignItems="center">
                    <Typography variant="h3" color="secondary.main" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      {stat.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Paper>

          <Grid container spacing={3}>
            {featureCards.map((card) => (
              <Grid item xs={12} md={4} key={card.badge}>
                <Paper
                  sx={{
                    height: '100%',
                    p: 3,
                    background: 'rgba(5, 10, 28, 0.9)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    transition: 'transform 0.3s, border 0.3s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: 'rgba(78,240,208,0.6)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, rgba(142,91,255,0.25), rgba(78,240,208,0.15))',
                      opacity: 0,
                      transition: 'opacity 0.4s',
                    },
                    '&:hover::after': { opacity: 1 },
                  }}
                >
                  <Chip size="small" label={card.badge} color="primary" variant="outlined" sx={{ mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Paper
            sx={{
              p: { xs: 2, sm: 3, md: 5 },
              background: 'rgba(5, 10, 28, 0.85)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Typography variant="overline" color="secondary.main">
              {language === 'ar' ? 'رحلة المستخدم' : 'Parcours utilisateur'}
            </Typography>
            <Typography variant="h4" sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
              {language === 'ar'
                ? 'من السؤال الأول إلى تقديم الخدمة'
                : 'De la question au service délivré'}
            </Typography>
            <Grid container spacing={3}>
              {timelineSteps.map((step, index) => (
                <Grid item xs={12} md={4} key={step.key}>
                  <Stack spacing={1} sx={{ position: 'relative' }}>
                    <Box className="timeline-axis" />
                    <Typography variant="subtitle2" color="text.secondary">
                      {`0${index + 1}`}
                    </Typography>
                    <Typography variant="h6">{step.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
};

export default LandingPage;

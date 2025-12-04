import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  Skeleton,
  Divider,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NavBar from '../components/NavBar';
import ServiceCard from '../components/ServiceCard';
import { useServices } from '../hooks/useServices';
import { useLanguage } from '../contexts/LanguageContext';
import { useOffline } from '../contexts/OfflineContext';

const DashboardPage = () => {
  const { services, loading } = useServices();
  const { t } = useLanguage();
  const { getAll, isOnline, isSyncing } = useOffline();
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getAll('recentActivities').then((items) => setRecent(items.slice(-5).reverse()));
  }, [getAll]);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return services.filter((service) => service.title.toLowerCase().includes(normalized));
  }, [services, query]);

  const quickLinks = [
    { key: 'documents', color: 'primary' },
    { key: 'forms', color: 'secondary' },
    { key: 'advice', color: 'warning' },
    { key: 'gov', color: 'info' },
  ];

  const statusCards = [
    {
      key: 'connectivity',
      title: t('dashboard.status.connectivity'),
      value: isOnline ? t('common.online') : t('common.offline'),
      helper: isOnline ? t('dashboard.status.live') : t('dashboard.status.cached'),
      accent: isOnline ? '#4ef0d0' : '#ff8a65',
    },
    {
      key: 'sync',
      title: t('dashboard.status.sync'),
      value: isSyncing ? '↻' : '✓',
      helper: isSyncing ? t('dashboard.status.syncing') : t('dashboard.status.synced'),
      accent: isSyncing ? '#ffd54f' : '#8c6cff',
    },
    {
      key: 'activity',
      title: t('dashboard.status.activity'),
      value: recent.length ? recent.length.toString().padStart(2, '0') : '00',
      helper: recent.length ? t('dashboard.status.recentEntries') : t('dashboard.status.empty'),
      accent: '#f48fb1',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3, md: 5 },
              background:
                'linear-gradient(135deg, rgba(8,12,30,0.9), rgba(9,16,42,0.9)) padding-box, linear-gradient(135deg, rgba(142,91,255,0.5), rgba(78,240,208,0.4)) border-box',
              border: '1px solid transparent',
            }}
          >
            <Stack spacing={{ xs: 2, md: 3 }}>
              <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
                {t('dashboard.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                {t('dashboard.subtitle')}
              </Typography>
              <Stack
                spacing={2}
                sx={{
                  p: { xs: 1.5, md: 2 },
                  backgroundColor: 'rgba(2,4,20,0.8)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" alignItems="center" gap={2}>
                  <SearchIcon color="secondary" />
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder={t('common.searchServices')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </Stack>
                <Button 
                  variant="contained" 
                  onClick={() => navigate(`/assistant?topic=${query}`)}
                  fullWidth
                  sx={{ display: { xs: 'block', sm: 'none' } }}
                >
                  {t('dashboard.ask')}
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => navigate(`/assistant?topic=${query}`)}
                  sx={{ display: { xs: 'none', sm: 'inline-flex' }, alignSelf: 'flex-end' }}
                >
                  {t('dashboard.ask')}
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                {quickLinks.map((link) => (
                  <Chip
                    key={link.key}
                    label={t(`dashboard.${link.key}`)}
                    color={link.color}
                    onClick={() => navigate(`/assistant?topic=${link.key}`)}
                    size="small"
                  />
                ))}
              </Stack>
            </Stack>
          </Paper>

          <Grid container spacing={2}>
            {statusCards.map((card) => (
              <Grid item xs={12} sm={4} key={card.key}>
                <Paper
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    background: 'rgba(5,10,28,0.85)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    minHeight: { xs: 100, md: 120 },
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" sx={{ color: card.accent, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                    {card.helper}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: { xs: 2, md: 3 }, height: '100%', maxHeight: { xs: '300px', md: 'none' }, overflowY: { xs: 'auto', md: 'visible' } }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>{t('dashboard.recent')}</Typography>
                <Divider sx={{ my: { xs: 1.5, md: 2 } }} />
                {recent.length === 0 && (
                  <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>{t('dashboard.empty')}</Typography>
                )}
                {recent.map((item) => (
                  <Stack key={item.timestamp} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" sx={{ py: 1, gap: { xs: 0.5, sm: 0 } }}>
                    <Typography sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                      {new Date(item.timestamp).toLocaleString()}
                    </Typography>
                  </Stack>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>{t('dashboard.quickLinks')}</Typography>
                <Divider sx={{ my: { xs: 1.5, md: 2 } }} />
                <Grid container spacing={2}>
                  {loading &&
                    Array.from({ length: 4 }).map((_, idx) => (
                      <Grid item xs={12} sm={6} key={`skeleton-${idx}`}>
                        <Skeleton variant="rectangular" height={160} />
                      </Grid>
                    ))}
                  {!loading &&
                    filtered.map((service) => (
                      <Grid item xs={12} sm={6} key={service.id}>
                        <ServiceCard service={service} />
                      </Grid>
                    ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

export default DashboardPage;

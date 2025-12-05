import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import NavBar from '../components/NavBar';
import { useLanguage } from '../contexts/LanguageContext';
import { useOffline } from '../contexts/OfflineContext';
import { getServiceById } from '../services/apiService';

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { isOnline, cacheRecord, getRecord, addRecentActivity } = useOffline();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let record = null;
        
        if (isOnline) {
          try {
            record = await getServiceById(id);
            if (record) {
              await cacheRecord('services', record);
            }
          } catch (apiError) {
            console.warn('API fetch failed, trying cache:', apiError);
            record = await getRecord('services', id);
          }
        } else {
          record = await getRecord('services', id);
        }
        
        if (!record) {
          setError('Service not found');
        } else {
          setService(record);
          try {
            await addRecentActivity({ serviceId: id, title: record.title });
          } catch (e) {
            console.warn('Failed to add recent activity:', e);
          }
        }
      } catch (err) {
        console.error('Error loading service:', err);
        setError(err.message || 'Failed to load service');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      load();
    }
  }, [id, isOnline]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <NavBar />
        <Box sx={{ py: 6, px: { xs: 2, sm: 4, md: 6 }, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Typography>{t('common.loading')}</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <NavBar />
        <Box sx={{ py: 6, px: { xs: 2, sm: 4, md: 6 }, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Box>
    );
  }

  if (!service) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <NavBar />
        <Box sx={{ py: 6, px: { xs: 2, sm: 4, md: 6 }, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Alert severity="warning">Service not found</Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <NavBar />
      <Box sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 }, flex: 1, width: '100%', maxWidth: 900, mx: 'auto' }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {service.title}
          </Typography>
          <Typography color="text.secondary">{service.description}</Typography>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('services.steps')}
          </Typography>
          <List>
            {service.steps?.map((step) => (
              <ListItem key={step.order}>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={step.title} secondary={step.description} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {service.forms?.length ? (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('services.downloads')}
            </Typography>
            <Stack spacing={1}>
              {service.forms.map((form) => (
                <Button
                  key={form.url}
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  href={form.url}
                  download
                >
                  {form.name}
                </Button>
              ))}
            </Stack>
          </Paper>
        ) : null}

        {service.faq?.length ? (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('services.faq')}
            </Typography>
            {service.faq.map((item) => (
              <Accordion key={item.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{item.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">{item.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        ) : null}

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('services.contact')}
          </Typography>
          <Stack spacing={2}>
            {service.contact?.phone && (
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon color="primary" />
                <Typography>{service.contact.phone}</Typography>
              </Stack>
            )}
            {service.contact?.email && (
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailIcon color="primary" />
                <Typography>{service.contact.email}</Typography>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default ServiceDetailsPage;

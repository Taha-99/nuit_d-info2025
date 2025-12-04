import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
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
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        let record;
        if (isOnline) {
          record = await getServiceById(id);
          await cacheRecord('services', record);
        } else {
          record = await getRecord('services', id);
        }
        setService(record);
        if (record) {
          await addRecentActivity({ serviceId: id, title: record.title });
        }
      } catch (err) {
        setError(err);
      }
    };
    load();
  }, [id, isOnline, cacheRecord, getRecord, addRecentActivity]);

  if (error) {
    return (
      <Box>
        <NavBar />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error">{t('common.loading')}</Alert>
        </Container>
      </Box>
    );
  }

  if (!service) {
    return (
      <Box>
        <NavBar />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography>{t('common.loading')}</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <NavBar />
      <Container maxWidth="md" sx={{ py: 4 }}>
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
      </Container>
    </Box>
  );
};

export default ServiceDetailsPage;

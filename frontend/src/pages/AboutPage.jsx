import React from 'react';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import NavBar from '../components/NavBar';
import { useLanguage } from '../contexts/LanguageContext';

const AboutPage = () => {
  const { t } = useLanguage();
  return (
    <Box>
      <NavBar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, mb: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h4" fontWeight={700}>
              {t('about.title')}
            </Typography>
            <Typography>{t('about.mission')}</Typography>
          </Stack>
        </Paper>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            {t('about.credits')}
          </Typography>
          <Typography>
            Projet piloté par NIRD – Numérique Inclusif et Résilient pour le Développement. Les icônes 
            et illustrations sont libres de droits. Merci aux contributeurs open-source.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default AboutPage;

import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import NavBar from '../components/NavBar';
import { useAuth } from '../contexts/AuthContext';

const AdminPanelPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [servicePayload, setServicePayload] = useState({ title: '', description: '', category: '' });

  if (!user) {
    return (
      <Box>
        <NavBar />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="warning">Connectez-vous pour accéder au panneau d'administration.</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <NavBar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)}>
            <Tab label="Services" />
            <Tab label="FAQs" />
            <Tab label="Feedback" />
            <Tab label="Statistiques" />
          </Tabs>
          {tab === 0 && (
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">Ajouter un service</Typography>
              <TextField
                label="Titre"
                value={servicePayload.title}
                onChange={(e) => setServicePayload((prev) => ({ ...prev, title: e.target.value }))}
              />
              <TextField
                label="Description"
                multiline
                minRows={3}
                value={servicePayload.description}
                onChange={(e) => setServicePayload((prev) => ({ ...prev, description: e.target.value }))}
              />
              <TextField
                label="Catégorie"
                value={servicePayload.category}
                onChange={(e) => setServicePayload((prev) => ({ ...prev, category: e.target.value }))}
              />
              <Button variant="contained">Enregistrer</Button>
            </Box>
          )}
          {tab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography>Gestion des FAQs (à connecter à l'API)</Typography>
            </Box>
          )}
          {tab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography>Liste des feedbacks (connexion API nécessaire)</Typography>
            </Box>
          )}
          {tab === 3 && (
            <Box sx={{ p: 3 }}>
              <Typography>Statistiques d'utilisation (placeholder)</Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminPanelPage;

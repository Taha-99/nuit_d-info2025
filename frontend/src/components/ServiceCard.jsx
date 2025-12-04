import React from 'react';
import { Card, CardContent, Typography, Stack, Button, Box } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        background: 'rgba(8, 12, 32, 0.9)',
        border: '1px solid rgba(255,255,255,0.08)',
        transition: 'transform 0.3s ease, border 0.3s',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(140,108,255,0.15), rgba(78,240,208,0.08))',
          opacity: 0,
          transition: 'opacity 0.4s',
        },
        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor: 'rgba(142, 91, 255, 0.6)',
        },
        '&:hover::after': { opacity: 1 },
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="overline" color="secondary.main" sx={{ letterSpacing: 2 }}>
              #{service.category || 'service'}
            </Typography>
            <Typography variant="h6">{service.title}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {service.description}
          </Typography>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate(`/service/${service.id}`)}
            sx={{ mt: 'auto', alignSelf: 'flex-start' }}
          >
            Détails
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;

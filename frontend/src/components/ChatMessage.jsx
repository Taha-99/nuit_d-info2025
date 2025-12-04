import React from 'react';
import { Avatar, Paper, Stack, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

const ChatMessage = ({ type, text, timestamp, recommendations, onSelectRecommendation }) => (
  <Stack direction="row" justifyContent={type === 'user' ? 'flex-end' : 'flex-start'} sx={{ mb: { xs: 1.5, md: 2 } }}>
    {type === 'bot' && (
      <Avatar sx={{ mr: { xs: 1, md: 2 }, bgcolor: 'rgba(140,108,255,0.4)', border: '1px solid rgba(140,108,255,0.8)', width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }}>
        <SmartToyIcon fontSize="small" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />
      </Avatar>
    )}
    <Stack spacing={1} maxWidth={{ xs: '85%', md: '75%' }} alignItems={type === 'user' ? 'flex-end' : 'flex-start'}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, md: 2 },
          borderRadius: 3,
          background: type === 'user'
            ? 'linear-gradient(135deg, rgba(142,91,255,0.45), rgba(78,240,208,0.3))'
            : 'rgba(11, 16, 40, 0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
        }}
      >
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontSize: { xs: '0.875rem', md: '1rem' } }}>
          {text}
        </Typography>
        {recommendations?.length ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1, gap: 0.5 }}>
            {recommendations.map((rec) => (
              <Paper
                key={rec.id}
                variant="outlined"
                sx={{
                  px: { xs: 1, md: 1.5 },
                  py: { xs: 0.25, md: 0.5 },
                  cursor: 'pointer',
                  borderRadius: 2,
                  borderColor: 'rgba(78,240,208,0.4)',
                  backgroundColor: 'rgba(78,240,208,0.08)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'rgba(78,240,208,0.8)',
                    backgroundColor: 'rgba(78,240,208,0.15)',
                  },
                }}
                onClick={() => onSelectRecommendation(rec.id)}
              >
                <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>{rec.title}</Typography>
              </Paper>
            ))}
          </Stack>
        ) : null}
      </Paper>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
        {new Date(timestamp).toLocaleTimeString()}
      </Typography>
    </Stack>
    {type === 'user' && (
      <Avatar sx={{ ml: { xs: 1, md: 2 }, bgcolor: 'rgba(78,240,208,0.3)', border: '1px solid rgba(78,240,208,0.8)', width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }}>
        <PersonIcon fontSize="small" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />
      </Avatar>
    )}
  </Stack>
);

export default ChatMessage;

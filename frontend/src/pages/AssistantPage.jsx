import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import NavBar from '../components/NavBar';
import ChatMessage from '../components/ChatMessage';
import { useLanguage } from '../contexts/LanguageContext';
import { useOffline } from '../contexts/OfflineContext';
import { getAIResponse } from '../services/aiService';

const AssistantPage = () => {
  const { t } = useLanguage();
  const { isOnline, addRecentActivity } = useOffline();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getGreetingMessage = () => ({
    id: 'welcome',
    type: 'bot',
    text: isOnline ? t('assistant.welcomeOnline') : t('assistant.welcomeOffline'),
    timestamp: Date.now(),
  });

  useEffect(() => {
    setMessages([getGreetingMessage()]);
  }, [isOnline, t]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const topic = params.get('topic');
    if (topic) {
      sendMessage(topic.replace(/-/g, ' '));
    }
  }, [location.search]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  const quickPrompts = [
    t('assistant.quickPrompts.status'),
    t('assistant.quickPrompts.documents'),
    t('assistant.quickPrompts.appointment'),
    t('assistant.quickPrompts.aid'),
  ];

  const resetThread = () => {
    setMessages([getGreetingMessage()]);
  };

  const sendMessage = async (content = input) => {
    if (!content.trim()) return;
    const userMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      text: content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setBusy(true);
    try {
      const response = await getAIResponse(content, { language, offline: !isOnline });
      const botMessage = {
        id: crypto.randomUUID(),
        type: 'bot',
        text: response.message,
        timestamp: Date.now(),
        recommendations: response.recommendations,
      };
      setMessages((prev) => [...prev, botMessage]);
      if (response.recommendations?.length) {
        await addRecentActivity({ title: response.recommendations[0].title, serviceId: response.recommendations[0].id });
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'bot',
          text: 'Une erreur est survenue, merci de réessayer.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <NavBar />
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 }, height: { xs: 'calc(100vh - 64px)', md: 'calc(100vh - 80px)' } }}>
        <Paper
          sx={{
            p: { xs: 1.5, sm: 2, md: 4 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background:
              'linear-gradient(135deg, rgba(6,10,28,0.9), rgba(11,18,46,0.9)) padding-box, linear-gradient(135deg, rgba(142,91,255,0.4), rgba(78,240,208,0.4)) border-box',
            border: '1px solid transparent',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: { xs: 1.5, md: 2 }, gap: { xs: 1, sm: 0 } }}>
            <div>
              <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                {t('assistant.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                {isOnline ? t('assistant.online') : t('assistant.offline')}
              </Typography>
            </div>
            <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/dashboard')}
                sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, flex: { xs: 1, sm: 'none' } }}
              >
                {t('assistant.backToServices')}
              </Button>
              <Button 
                variant="text" 
                size="small" 
                onClick={resetThread}
                sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, flex: { xs: 1, sm: 'none' } }}
              >
                {t('assistant.reset')}
              </Button>
            </Stack>
          </Stack>
          <Stack spacing={1} direction="row" flexWrap="wrap" sx={{ mb: { xs: 1, md: 1 }, gap: 0.5 }}>
            {quickPrompts.map((prompt) => (
              <Chip
                key={prompt}
                label={prompt}
                className="badge-pulse"
                variant="outlined"
                onClick={() => sendMessage(prompt)}
                size="small"
                sx={{ fontSize: { xs: '0.7rem', md: '0.8125rem' } }}
              />
            ))}
          </Stack>
          <Stack spacing={2} sx={{ flex: 1, overflowY: 'auto', py: { xs: 1, md: 2 }, pr: { xs: 0.5, md: 1 } }}>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                type={msg.type}
                text={msg.text}
                timestamp={msg.timestamp}
                recommendations={msg.recommendations}
                onSelectRecommendation={(serviceId) => navigate(`/service/${serviceId}`)}
              />
            ))}
            {busy && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>{t('assistant.thinking')}</Typography>
              </Stack>
            )}
            <div ref={bottomRef} />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1, md: 2 }}>
            <TextField
              fullWidth
              multiline
              maxRows={{ xs: 2, md: 3 }}
              placeholder={t('assistant.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              size="small"
              sx={{
                backgroundColor: 'rgba(1,3,13,0.6)',
                borderRadius: 3,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(142,91,255,0.5)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(142,91,255,0.9)',
                },
                '& .MuiInputBase-input': {
                  fontSize: { xs: '0.875rem', md: '1rem' },
                },
              }}
            />
            <Button
              variant="contained"
              endIcon={<SendIcon sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />}
              disabled={!input.trim() || busy}
              onClick={() => sendMessage()}
              sx={{ 
                minWidth: { xs: 'auto', md: 160 },
                width: { xs: '100%', md: 'auto' },
                fontSize: { xs: '0.875rem', md: '1rem' },
              }}
            >
              {t('assistant.send')}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default AssistantPage;

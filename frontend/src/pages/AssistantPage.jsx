import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Chip,
  IconButton,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Drawer,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import NavBar from '../components/NavBar';
import ChatMessage from '../components/ChatMessage';
import { useLanguage } from '../contexts/LanguageContext';
import { useOffline } from '../contexts/OfflineContext';
import { useAuth } from '../contexts/AuthContext';
import aiService from '../services/aiService';

const AssistantPage = () => {
  const { t, language } = useLanguage();
  const { isOnline, addRecentActivity } = useOffline();
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showConversations, setShowConversations] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [userConversations, setUserConversations] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getGreetingMessage = () => ({
    id: 'welcome',
    type: 'bot',
    text: isAuthenticated && isOnline && user
      ? `${t('assistant.welcomeUser').replace('{{name}}', user.name || user.email)} ${t('assistant.online')}` 
      : isOnline 
        ? t('assistant.welcomeOnline') 
        : t('assistant.welcomeOffline'),
    timestamp: Date.now(),
  });

  // Initialize conversation and load messages
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        if (isAuthenticated && isOnline) {
          // Load user's conversations (don't fail if this fails)
          try {
            const conversations = await aiService.getUserConversations();
            setUserConversations(conversations || []);
          } catch (e) {
            console.warn('Could not load conversations:', e);
            setUserConversations([]);
          }
          
          // Create or continue conversation
          try {
            const conversation = await aiService.createConversation();
            if (conversation && conversation.id) {
              setConversationId(conversation.id);
              
              // Load conversation messages if any
              if (conversation.messages && conversation.messages.length > 0) {
                const formattedMessages = conversation.messages.map(msg => ({
                  id: msg.id || msg._id,
                  type: msg.role === 'user' ? 'user' : 'bot',
                  text: msg.content,
                  timestamp: new Date(msg.timestamp).getTime(),
                }));
                setMessages([getGreetingMessage(), ...formattedMessages]);
              } else {
                setMessages([getGreetingMessage()]);
              }
            } else {
              // Conversation creation returned null/undefined - use fallback mode
              setConversationId(null);
              setMessages([getGreetingMessage()]);
            }
          } catch (convError) {
            console.warn('Could not create conversation, using fallback mode:', convError);
            setConversationId(null);
            setMessages([getGreetingMessage()]);
          }
        } else {
          setMessages([getGreetingMessage()]);
        }
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
        setMessages([getGreetingMessage()]);
      }
    };

    initializeConversation();
  }, [isOnline, isAuthenticated, t]);

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

  const resetThread = async () => {
    try {
      // Create new conversation (don't delete the old one, just start fresh)
      if (isAuthenticated && isOnline) {
        try {
          const newConversation = await aiService.createConversation();
          if (newConversation?.id) {
            setConversationId(newConversation.id);
            // Reload conversations list
            const conversations = await aiService.getUserConversations();
            setUserConversations(conversations || []);
          }
        } catch (e) {
          console.warn('Could not create new conversation:', e);
        }
      }
      
      setMessages([getGreetingMessage()]);
      setError(null);
      setShowSidebar(false);
    } catch (error) {
      console.error('Failed to reset conversation:', error);
      setMessages([getGreetingMessage()]);
    }
  };

  const startNewChat = async () => {
    // Save current conversation and start a new one
    await resetThread();
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
    setError(null);

    try {
      let response;
      
      if (isAuthenticated && isOnline && conversationId) {
        // Use authenticated conversation with backend
        response = await aiService.sendMessage(conversationId, content);
      } else {
        // Fallback to basic AI service (works even without conversationId)
        response = await aiService.getResponse(content, { 
          language: language || 'fr', 
          offline: !isOnline 
        });
      }

      // Ensure response has the expected structure
      const botMessage = {
        id: crypto.randomUUID(),
        type: 'bot',
        text: response?.message || response?.text || (typeof response === 'string' ? response : 'Je suis là pour vous aider.'),
        timestamp: Date.now(),
        recommendations: response?.recommendations || [],
        sources: response?.sources || [],
      };
      
      setMessages((prev) => [...prev, botMessage]);
      
      // Track activity if recommendations provided
      if (response?.recommendations?.length && addRecentActivity) {
        await addRecentActivity({ 
          title: response.recommendations[0].title, 
          serviceId: response.recommendations[0].id 
        });
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Try one more time with offline fallback
      try {
        const fallbackResponse = await aiService.getResponse(content, { 
          language: language || 'fr', 
          offline: true 
        });
        
        const botMessage = {
          id: crypto.randomUUID(),
          type: 'bot',
          text: fallbackResponse?.message || 'Je suis là pour vous aider avec les services publics.',
          timestamp: Date.now(),
          recommendations: fallbackResponse?.recommendations || [],
          sources: [],
        };
        
        setMessages((prev) => [...prev, botMessage]);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setError('Failed to get response. Please try again.');
        
        const errorMessage = {
          id: crypto.randomUUID(),
          type: 'bot',
          text: isOnline 
            ? t('assistant.errors.serverError') || 'Une erreur est survenue, merci de réessayer.'
            : t('assistant.errors.offline') || 'Mode hors ligne activé. Fonctionnalités limitées.',
          timestamp: Date.now(),
        };
        
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setBusy(false);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      setBusy(true);
      const conversation = await aiService.getConversation(conversationId);
      
      if (conversation.messages && conversation.messages.length > 0) {
        const formattedMessages = conversation.messages.map(msg => ({
          id: msg.id || msg._id,
          type: msg.role === 'user' ? 'user' : 'bot',
          text: msg.content,
          timestamp: new Date(msg.timestamp).getTime(),
        }));
        setMessages([getGreetingMessage(), ...formattedMessages]);
      } else {
        setMessages([getGreetingMessage()]);
      }
      
      setConversationId(conversationId);
      setShowConversations(false);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setError('Failed to load conversation.');
    } finally {
      setBusy(false);
    }
  };

  const searchConversations = async (query) => {
    if (!query.trim() || !isAuthenticated || !isOnline) return;
    
    try {
      setBusy(true);
      const results = await aiService.searchConversations(query);
      setUserConversations(results);
    } catch (error) {
      console.error('Failed to search conversations:', error);
      setError('Search failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Conversation History (Desktop) */}
        {isAuthenticated && (
          <Box
            sx={{
              width: 280,
              flexShrink: 0,
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              background: 'linear-gradient(180deg, rgba(6,10,28,0.98), rgba(11,18,46,0.98))',
              borderRight: '1px solid rgba(142,91,255,0.3)',
              height: 'calc(100vh - 64px)',
            }}
          >
            <Box sx={{ p: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={startNewChat}
                sx={{ mb: 2 }}
              >
                + New Chat
              </Button>
            </Box>
            
            <Divider sx={{ borderColor: 'rgba(142,91,255,0.3)' }} />
            
            <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Recent Conversations
              </Typography>
              
              {busy ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {userConversations.map((conversation) => (
                    <ListItem 
                      key={conversation.id || conversation._id}
                      onClick={() => loadConversation(conversation.id || conversation._id)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'rgba(142,91,255,0.1)' },
                        borderRadius: 1,
                        mb: 0.5,
                        px: 1,
                        py: 1,
                        backgroundColor: conversationId === (conversation.id || conversation._id) 
                          ? 'rgba(142,91,255,0.2)' 
                          : 'transparent',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                            {conversation.title || 'Nouvelle conversation'}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {new Date(conversation.updatedAt || conversation.createdAt).toLocaleDateString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                  {userConversations.length === 0 && (
                    <Box sx={{ textAlign: 'center', p: 2, color: 'text.secondary' }}>
                      <Typography variant="body2">No conversations yet</Typography>
                      <Typography variant="caption">Start chatting to save your conversations</Typography>
                    </Box>
                  )}
                </List>
              )}
            </Box>
          </Box>
        )}

        {/* Main Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
          {error && (
            <Alert severity="warning" sx={{ m: 2 }}>
              {error}
            </Alert>
          )}
          
          <Paper
            sx={{
              m: { xs: 1, md: 2 },
              p: { xs: 2, md: 3 },
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              background:
                'linear-gradient(135deg, rgba(6,10,28,0.9), rgba(11,18,46,0.9)) padding-box, linear-gradient(135deg, rgba(142,91,255,0.4), rgba(78,240,208,0.4)) border-box',
              border: '1px solid transparent',
              borderRadius: 2,
            }}
          >
            {/* Chat Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {isAuthenticated && (
                  <IconButton 
                    onClick={() => setShowSidebar(true)}
                    size="small"
                    sx={{ color: 'primary.main', display: { xs: 'flex', md: 'none' } }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}
                <div>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                    {t('assistant.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isAuthenticated && user ? 
                      `${user.name || user.email} • ${isOnline ? t('assistant.online') : t('assistant.offline')}` :
                      isOnline ? t('assistant.online') : t('assistant.offline')
                    }
                  </Typography>
                </div>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => navigate('/dashboard')}
                >
                  {t('assistant.backToServices')}
                </Button>
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={resetThread}
                >
                  {t('assistant.reset')}
                </Button>
              </Stack>
            </Stack>

            {/* Quick Prompts */}
            <Stack spacing={1} direction="row" flexWrap="wrap" sx={{ mb: 2, gap: 0.5 }}>
              {quickPrompts.map((prompt) => (
                <Chip
                  key={prompt}
                  label={prompt}
                  variant="outlined"
                  onClick={() => sendMessage(prompt)}
                  size="small"
                />
              ))}
            </Stack>

            {/* Messages Area */}
            <Box sx={{ flex: 1, overflowY: 'auto', py: 2, pr: 1 }}>
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
                <Typography variant="body2">{t('assistant.thinking')}</Typography>
              </Stack>
            )}
            <div ref={bottomRef} />
          </Box>

            {/* Input Area */}
            <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder={t('assistant.placeholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                size="small"
                sx={{
                  backgroundColor: 'rgba(1,3,13,0.6)',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(142,91,255,0.5)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(142,91,255,0.9)',
                  },
                }}
              />
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                disabled={!input.trim() || busy}
                onClick={() => sendMessage()}
                sx={{ minWidth: 120 }}
              >
                {t('assistant.send')}
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
        
        {/* Conversation History Dialog */}
        <Dialog 
          open={showConversations} 
          onClose={() => setShowConversations(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Conversation History</Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <IconButton 
                        onClick={() => searchConversations(searchQuery)}
                        size="small"
                      >
                        <SearchIcon />
                      </IconButton>
                    )
                  }}
                />
                <IconButton onClick={() => setShowConversations(false)}>
                  <ClearIcon />
                </IconButton>
              </Stack>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {busy ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {userConversations.map((conversation) => (
                  <ListItem 
                    key={conversation.id}
                    onClick={() => loadConversation(conversation.id)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemText
                      primary={conversation.title || 'Untitled Conversation'}
                      secondary={`${new Date(conversation.updatedAt).toLocaleDateString()} • ${conversation.messageCount || 0} messages`}
                    />
                  </ListItem>
                ))}
                {userConversations.length === 0 && (
                  <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                    No conversations found
                  </Box>
                )}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConversations(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        
        {/* Conversation History Sidebar Drawer */}
        <Drawer
          anchor="left"
          open={showSidebar}
          onClose={() => setShowSidebar(false)}
          PaperProps={{
            sx: {
              width: 300,
              background: 'linear-gradient(135deg, rgba(6,10,28,0.98), rgba(11,18,46,0.98))',
              borderRight: '1px solid rgba(142,91,255,0.3)',
            }
          }}
        >
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Chats</Typography>
              <IconButton onClick={() => setShowSidebar(false)} size="small">
                <ClearIcon />
              </IconButton>
            </Stack>
            
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={startNewChat}
              sx={{ mb: 2 }}
            >
              New Chat
            </Button>
            
            <Divider sx={{ mb: 2, borderColor: 'rgba(142,91,255,0.3)' }} />
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Recent Conversations
            </Typography>
            
            {busy ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {userConversations.map((conversation) => (
                  <ListItem 
                    key={conversation.id || conversation._id}
                    onClick={() => {
                      loadConversation(conversation.id || conversation._id);
                      setShowSidebar(false);
                    }}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(142,91,255,0.1)' },
                      borderRadius: 1,
                      mb: 0.5,
                      px: 1,
                      backgroundColor: conversationId === (conversation.id || conversation._id) 
                        ? 'rgba(142,91,255,0.2)' 
                        : 'transparent',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" noWrap>
                          {conversation.title || 'Nouvelle conversation'}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {new Date(conversation.updatedAt || conversation.createdAt).toLocaleDateString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
                {userConversations.length === 0 && (
                  <Box sx={{ textAlign: 'center', p: 2, color: 'text.secondary' }}>
                    <Typography variant="body2">No conversations yet</Typography>
                  </Box>
                )}
              </List>
            )}
          </Box>
        </Drawer>
      
      {/* Quick Actions Fab for Mobile */}
      {isAuthenticated && (
        <Fab
          color="primary"
          size="small"
          onClick={() => setShowSidebar(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' }
          }}
        >
          <HistoryIcon />
        </Fab>
      )}
    </Box>
  );
};

export default AssistantPage;

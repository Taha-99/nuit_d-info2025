import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Alert, 
  Box, 
  Button, 
  Paper, 
  Stack, 
  TextField, 
  Typography,
  Divider,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import NavBar from '../components/NavBar';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <NavBar />
      <Box sx={{ py: 8, px: { xs: 2, sm: 4, md: 6 }, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <Paper sx={{ p: 4, width: '100%', maxWidth: 500 }}>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" fontWeight={700} textAlign="center">
              {t('auth.login') || 'Welcome Back'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Sign in to access your government services
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}
            
            <TextField 
              label="Email Address" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              fullWidth
            />
            
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #8c6cff, #4ef0d0)',
                py: 1.5,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <Divider sx={{ my: 2 }} />
            
            <Stack direction="column" spacing={2}>
              <Stack direction="row" justifyContent="center" spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?
                </Typography>
                <Typography
                  component={Link}
                  to="/register"
                  variant="body2"
                  sx={{
                    color: 'secondary.main',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Create account
                </Typography>
              </Stack>
              
              <Box sx={{ p: 2, bgcolor: 'rgba(142, 91, 255, 0.1)', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Demo Accounts:</strong><br/>
                  Admin: admin@nird.gov / password<br/>
                  User: test@example.com / password
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginPage;

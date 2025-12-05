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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import NavBar from '../components/NavBar';

const RegisterPage = () => {
  const { registerUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...userData } = formData;
      await registerUser(userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <NavBar />
      <Box sx={{ py: 6, px: { xs: 2, sm: 4, md: 6 }, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <Paper sx={{ p: 4, width: '100%', maxWidth: 500 }}>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" fontWeight={700} textAlign="center">
              {t('auth.register') || 'Create Account'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Join IA Low-Cost Assistant and get access to government services
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}
            
            <TextField
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />
            
            <TextField
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel>Account Type</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Account Type"
              >
                <MenuItem value="citizen">Citizen</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="ngo">NGO</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
              helperText="Minimum 6 characters"
            />
            
            <TextField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <Divider sx={{ my: 2 }} />
            
            <Stack direction="row" justifyContent="center" spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?
              </Typography>
              <Typography
                component={Link}
                to="/login"
                variant="body2"
                sx={{
                  color: 'secondary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Sign in
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default RegisterPage;
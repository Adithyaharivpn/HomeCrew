import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, Paper, TextField, Typography, CircularProgress, InputAdornment } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (error) setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        formData
      );
      
      // Store the token in the browser's local storage
      localStorage.setItem('token', response.data.token);
      
      // Redirect to the homepage after successful login
      navigate('/');
      window.location.reload(); // Optional: force a reload to update NavBar state

    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
      <Paper elevation={8} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h4" fontWeight="bold" textAlign="center" mb={3}>
            Login
          </Typography>
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          <TextField
            fullWidth
            margin="normal"
            name="email"
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon /></InputAdornment>) }}
          />
          <TextField
            fullWidth
            margin="normal"
            name="password"
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            InputProps={{ startAdornment: (<InputAdornment position="start"><LockIcon /></InputAdornment>) }}
          />
          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.5 }} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
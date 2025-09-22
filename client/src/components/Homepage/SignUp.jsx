import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

const SignUp = () => {
  // State for form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [tradeCategory, setTradeCategory] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');

  // Trade categories from backend
  const [tradeCategories, setTradeCategories] = useState([]);

  // Feedback messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch trade categories from backend once on mount
  useEffect(() => {
    const fetchTradeCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/service'); // replace with your API URL
        setTradeCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch trade categories:', error);
      }
    };
    fetchTradeCategories();
  }, []);

  const handleRoleChange = (event) => {
    setRole(event.target.value);
    // Reset tradeCategory if role changes
    if (event.target.value !== 'tradesperson') {
      setTradeCategory('');
      setExperience('');
      setLocation('');
    }
  };

  const handleTradeCategoryChange = (event) => {
    setTradeCategory(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Simple validation
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    const payload = {
      name,
      email,
      password,
      role,
    };

    if (role === 'tradesperson') {
      payload.tradeCategory = tradeCategory;
      payload.experience = experience;
      payload.location = location;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', payload);
      setSuccess(response.data.message);
      // Clear fields on success
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('');
      setTradeCategory('');
      setExperience('');
      setLocation('');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'gray.100',
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 500,
          width: '100%',
          p: 4,
          borderRadius: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Sign Up
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Create Your Account
          </Typography>
        </Box>

        {/* Show error or success messages */}
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography color="primary" sx={{ mb: 2 }}>
            {success}
          </Typography>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3} direction="column" alignItems="stretch">
            {/* Full Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="name"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="email"
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Password */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="password"
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Confirm Password */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Role Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={role}
                  onChange={handleRoleChange}
                  label="Role"
                  fullWidth
                >
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="tradesperson">Tradesperson</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Show tradesperson fields if role is tradesperson */}
            {role === 'tradesperson' && (
              <>
                {/* Trade Category loaded from backend */}
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Trade Category</InputLabel>
                    <Select
                      name="tradeCategory"
                      value={tradeCategory}
                      onChange={handleTradeCategoryChange}
                      label="Trade Category"
                    >
                      {tradeCategories.length > 0 ? (
                        tradeCategories.map((category) => (
                          <MenuItem
                            key={category.id || category._id || category.value}
                            value={category.service_name || category.value || category.label}
                          >
                            {category.service_name || category.label}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>Loading categories...</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Years of Experience */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="experience"
                    type="number"
                    placeholder="Years of Experience"
                    required
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </Grid>

                {/* Service Area / Location */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="location"
                    placeholder="City or Area of Service"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Grid>
              </>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  py: 1.5,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                }}
              >
                Sign Up
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default SignUp;

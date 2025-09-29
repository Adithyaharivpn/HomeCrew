import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Paper, Box,
  CircularProgress, Alert, Button
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../api/axiosConfig'; // Your axios instance
import { useAuth } from '../../api/useAuth'; // Your auth hook

const AdminDashboard = () => {
  const { user, logout } = useAuth(); // Assuming user has role
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalTradespeople: 0,
    totalCustomers: 0,
    totalJobs: 0,
    recentActivity: [],
    // You can add more data points here
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/api/admin/dashboard');
        setDashboardData(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
        if (err.response && err.response.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [logout]);

  const chartData = [
    { name: 'Total Users', value: dashboardData.totalUsers },
    { name: 'Tradespeople', value: dashboardData.totalTradespeople },
    { name: 'Customers', value: dashboardData.totalCustomers },
  ];

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Dashboard...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Reload Page
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 8 }}  >
      <Typography variant="h4" component="h1" gutterBottom color='primary'>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary">Total Users</Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>{dashboardData.totalUsers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary">Total Tradespeople</Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>{dashboardData.totalTradespeople}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary">Total Jobs</Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>{dashboardData.totalJobs}</Typography>
          </Paper>
        </Grid>

        {/* User Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>User Distribution</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activity/Other Stats (Placeholder) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
            {dashboardData.recentActivity.length > 0 ? (
              // Map through recent activity if you fetch it
              <Box>
                {/* Example activity item */}
                <Typography variant="body2">- User John Doe posted a new job.</Typography>
                <Typography variant="body2">- Tradesperson Jane Smith updated profile.</Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No recent activity.</Typography>
            )}
          </Paper>
        </Grid>

      </Grid>
    </Container>
  );
};

export default AdminDashboard;
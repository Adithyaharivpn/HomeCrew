import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';
import RestoreIcon from '@mui/icons-material/Restore';
import api from "../../api/axiosConfig"; // Your axios instance
import { useAuth } from "../../api/useAuth"; // Your auth hook

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
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/api/admin/dashboard");
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

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        // Use Promise.all to fetch both sets of data concurrently
        const [dashboardRes, usersRes] = await Promise.all([
          api.get("/api/admin/dashboard"),
          api.get("/api/admin/users"),
        ]);
        setDashboardData(dashboardRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleDeactivateUser = async (userId) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      try {
        await api.delete(`/api/admin/users/${userId}`);
        setUsers(
          users.map((u) => (u._id === userId ? { ...u, isActive: false } : u))
        );
      } catch (err) {
        console.error("Failed to deactivate user", err);
        alert("Failed to deactivate user.");
      }
    }
  };

  const handleReactivateUser = async (userId) => {
    try {
      const response = await api.patch(`/api/admin/users/${userId}/reactivate`);
      setUsers(users.map((u) => (u._id === userId ? response.data : u)));
    } catch (err) {
      console.error("Failed to reactivate user", err);
      alert("Failed to reactivate user.");
    }
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const response = await api.put(
        `/api/admin/users/${editingUser._id}`,
        editingUser
      );
      setUsers(
        users.map((u) => (u._id === editingUser._id ? response.data : u))
      );
      handleCloseEditModal();
    } catch (err) {
      console.error("Failed to update user", err);
      alert("Failed to update user.");
    }
  };

  const handleEditChange = (e) => {
    setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
  };

  const chartData = [
    { name: "Total Users", value: dashboardData.totalUsers },
    { name: "Tradespeople", value: dashboardData.totalTradespeople },
    { name: "Customers", value: dashboardData.totalCustomers },
  ];

  if (loading) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Reload Page
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ mt: 4, mb: 8, p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom color="primary">
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ display: "flex" }}>
        {/* Statistics Cards */}
        <Grid size={{xs:12 , md:4}}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Typography variant="h6" color="text.secondary">
              Total Users
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>
              {dashboardData.totalUsers}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{xs:12 , md:4}}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Typography variant="h6" color="text.secondary">
              Total Tradespeople
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>
              {dashboardData.totalTradespeople}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{xs:12 , md:4}}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Typography variant="h6" color="text.secondary">
              Total Jobs
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>
              {dashboardData.totalJobs}
            </Typography>
          </Paper>
        </Grid>

        {/* User Distribution Chart */}
        <Grid size={{xs:12 , md:6}}>
          <Paper
            sx={{
              p: 2,
              height: 400,
              width: 400,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" gutterBottom>
              User Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
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
      </Grid>
      <Paper sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ p: 2 }}>
          User Management
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>{/* ... Table Headers ... */}</TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? "Active" : "Inactive"}
                      color={user.isActive ? "success" : "error"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {user.isActive ? (
                      <>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEditModal(user)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeactivateUser(user._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        color="success"
                        onClick={() => handleReactivateUser(user._id)}
                      >
                        <RestoreIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={isModalOpen} onClose={handleCloseEditModal}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editingUser && (
            <Box component="form" sx={{ pt: 1 }}>
              <TextField
                fullWidth
                margin="dense"
                label="Full Name"
                name="name"
                value={editingUser.name}
                onChange={handleEditChange}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Email"
                name="email"
                value={editingUser.email}
                onChange={handleEditChange}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Role"
                name="role"
                value={editingUser.role}
                onChange={handleEditChange}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;

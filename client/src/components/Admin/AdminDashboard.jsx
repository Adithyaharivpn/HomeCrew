import React, { useState, useEffect, useMemo } from "react";
import {
  Container, Typography, Grid, Paper, Box, CircularProgress, Alert, Button,
  TableContainer, Table, TableHead, TableRow, TableCell, Chip, IconButton, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider, Tabs, Tab, Avatar, Tooltip
} from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip as RechartsTooltip
} from "recharts";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';
import RestoreIcon from '@mui/icons-material/Restore';
import api from "../../api/axiosConfig";
import { useAuth } from "../../api/useAuth";

const AdminDashboard = () => {
  const { logout } = useAuth();
  
  // --- STATE ---
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0, totalTradespeople: 0, totalCustomers: 0, totalJobs: 0,
  });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]); 
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal & Filter State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filter, setFilter] = useState('');
  
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, usersRes, logsRes, jobsRes] = await Promise.all([
          api.get("/api/admin/dashboard"),
          api.get("/api/admin/users"),
          api.get("/api/admin/logs"),
          api.get("/api/admin/jobs"), 
        ]);
        
        setDashboardData(dashboardRes.data);
        setUsers(usersRes.data);
        setLogs(logsRes.data);
        setJobs(jobsRes.data);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        setError("Failed to load dashboard data.");
        if (err.response && err.response.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [logout]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setFilter('');
  };

  const handleDeactivateUser = async (userId) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      try {
        await api.delete(`/api/admin/users/${userId}`);
        setUsers(users.map((u) => (u._id === userId ? { ...u, isActive: false } : u)));
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

  const handleEditChange = (e) => {
    setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const response = await api.put(
        `/api/admin/users/${editingUser._id}`,
        editingUser
      );
      setUsers(users.map((u) => (u._id === editingUser._id ? response.data : u)));
      handleCloseEditModal();
    } catch (err) {
      console.error("Failed to update user", err);
      alert("Failed to update user.");
    }
  };


  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to permanently delete this job?")) {
        try {
            await api.delete(`/api/admin/jobs/${jobId}`);
            setJobs(jobs.filter(job => job._id !== jobId));
        } catch (err) {
            alert("Failed to delete job.");
        }
    }
  };


  const filteredData = useMemo(() => {
    if (!filter) return tabValue === 0 ? users : jobs;
    const lowerFilter = filter.toLowerCase();
    
    if (tabValue === 0) { 
        return users.filter(u => 
            u.name.toLowerCase().includes(lowerFilter) || 
            u.email.toLowerCase().includes(lowerFilter)
        );
    } else { 
        return jobs.filter(j => 
            j.title.toLowerCase().includes(lowerFilter) || 
            (j.user?.name || "").toLowerCase().includes(lowerFilter)
        );
    }
  }, [users, jobs, filter, tabValue]);

  const getLogColor = (level) => {
    if (level === 'error') return 'error';
    if (level === 'warn') return 'warning';
    return 'info';
  };
  const getStatusColor = (status) => {
      if (status === 'completed') return 'success';
      if (status === 'assigned') return 'warning';
      return 'primary';
  }

  if (loading) return <Box sx={{ mt: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;

  return (
    <Box sx={{ mt: 4, mb: 8, p: 2 }}>
      <Typography variant="h4" gutterBottom color="primary">Admin Dashboard</Typography>

      {/* --- STATS GRID --- */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2, height: 140 }}>
                <Typography color="text.secondary">Total Users</Typography>
                <Typography variant="h3">{dashboardData.totalUsers}</Typography>
            </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2, height: 140 }}>
                <Typography color="text.secondary">Total Jobs</Typography>
                <Typography variant="h3">{dashboardData.totalJobs}</Typography>
            </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2, height: 140 }}>
                <Typography color="text.secondary">Total Tradespeople</Typography>
                <Typography variant="h3">{dashboardData.totalTradespeople}</Typography>
            </Paper>
        </Grid>

        {/* --- CHART & LOGS --- */}
        <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2, height: 400, display: "flex", flexDirection: "column" }}>
                <Typography variant="h6">User Distribution</Typography>
                <Box sx={{ flexGrow: 1, minHeight: 0, width: "100%" }}>
                    <ResponsiveContainer>
                        <BarChart data={[
                            { name: "Users", value: dashboardData.totalUsers },
                            { name: "Trades", value: dashboardData.totalTradespeople },
                            { name: "Customers", value: dashboardData.totalCustomers }
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <RechartsTooltip />
                            <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>
        </Grid>


        <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ 
                p: 2, 
                height: 400, 
                display: 'flex', 
                flexDirection: 'column',
                bgcolor: '#1e1e1e', 
                color: '#cfd8dc',   
                fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace', // Monospace Font
                border: '1px solid #333',
                boxShadow: '0px 4px 20px rgba(0,0,0,0.5)' 
            }}>

                <Typography variant="subtitle2" sx={{ 
                    color: '#00e676', 
                    fontFamily: 'inherit', 
                    mb: 1,
                    borderBottom: '1px solid #333',
                    pb: 1
                }}>
                    root@admin:~/logs# tail -f system.log
                </Typography>
                
                <TableContainer sx={{ 
                    flexGrow: 1,
                    '&::-webkit-scrollbar': { width: '8px' },
                    '&::-webkit-scrollbar-track': { background: '#1e1e1e' },
                    '&::-webkit-scrollbar-thumb': { background: '#424242', borderRadius: '4px' },
                    '&::-webkit-scrollbar-thumb:hover': { background: '#616161' }
                }}>
                    <Table size="small" stickyHeader>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ color: '#757575', border: 'none', fontFamily: 'inherit' }}>
                                        No logs found_
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log, i) => {
                                    let levelColor = '#29b6f6'; 
                                    if (log.level === 'warn') levelColor = '#ffea00'; // Warn = Yellow
                                    if (log.level === 'error') levelColor = '#ff1744'; // Error = Red

                                    return (
                                        <TableRow key={i} sx={{ '&:hover': { bgcolor: '#2c2c2c' } }}>
                                            <TableCell sx={{ color: '#757575', border: 'none', fontFamily: 'inherit', fontSize: '0.75rem', width: '130px', p: '4px 8px' }}>
                                                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '--:--:--'}
                                            </TableCell>
                                            
                                            <TableCell sx={{ color: levelColor, border: 'none', fontFamily: 'inherit', fontWeight: 'bold', width: '80px', p: '4px 8px' }}>
                                                [{log.level.toUpperCase()}]
                                            </TableCell>

                                            <TableCell sx={{ color: '#e0e0e0', border: 'none', fontFamily: 'inherit', p: '4px 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300 }}>
                                                <Tooltip title={log.message} arrow placement="top">
                                                    <span>{log.message}</span>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="User Management" />
                <Tab label="Job Management" />
            </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
            <TextField fullWidth label="Search..." variant="outlined" size="small" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </Box>

        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        {tabValue === 0 ? (          
                            <>
                                <TableCell>Avatar</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </>
                        ) : (
                            <>
                                <TableCell>Job Title</TableCell>
                                <TableCell>Posted By</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredData.map((row) => (
                        <TableRow key={row._id} hover>
                            {tabValue === 0 ? (
                                <>
                                    <TableCell>
                                        <Avatar src={row.profilePictureUrl} sx={{ width: 40, height: 40 }}>
                                            {row.name?.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{row.name}</TableCell>
                                    <TableCell>{row.email}</TableCell>
                                    <TableCell><Chip label={row.role} size="small" variant="outlined" /></TableCell>
                                    <TableCell><Chip label={row.isActive ? "Active" : "Inactive"} color={row.isActive ? "success" : "error"} size="small" /></TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleOpenEditModal(row)} color="primary"><EditIcon /></IconButton>
                                        {row.isActive ? (
                                            <IconButton onClick={() => handleDeactivateUser(row._id)} color="error"><DeleteIcon /></IconButton>
                                        ) : (
                                            <IconButton onClick={() => handleReactivateUser(row._id)} color="success"><RestoreIcon /></IconButton>
                                        )}
                                    </TableCell>
                                </>
                            ) : (                                 
                                <>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{row.title}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar src={row.user?.profilePictureUrl} sx={{ width: 24, height: 24 }} />
                                            {row.user?.name || "Unknown"}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{row.category}</TableCell>
                                    <TableCell><Chip label={row.status} color={getStatusColor(row.status)} size="small" variant="outlined" /></TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleDeleteJob(row._id)} color="error" title="Delete Job">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </>
                            )}
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
                    <TextField fullWidth margin="dense" label="Name" name="name" value={editingUser.name || ''} onChange={handleEditChange} />
                    <TextField fullWidth margin="dense" label="Email" name="email" value={editingUser.email || ''} onChange={handleEditChange} />
                    <TextField fullWidth margin="dense" label="Role" name="role" value={editingUser.role || ''} onChange={handleEditChange} helperText="customer, tradesperson, or admin" />
                </Box>
             )}
         </DialogContent>
         <DialogActions>
             <Button onClick={handleCloseEditModal}>Cancel</Button>
             <Button onClick={handleUpdateUser} variant="contained">Save</Button>
         </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
import React, { useState, useEffect } from "react";
import api from "../../api/axiosConfig.js";
import { useAuth } from "../../api/useAuth.js";
import {
  Container, Grid, Card, CardContent, Typography,
  Box, Chip, Button, CardActions, TextField, MenuItem, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Divider, Stack
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

import KeyIcon from '@mui/icons-material/Key';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatIcon from '@mui/icons-material/Chat';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';
import MapIcon from '@mui/icons-material/Map'; // <--- NEW ICON

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [categoryOptions, setCategoryOptions] = useState([]); 
  const [openCodeDialog, setOpenCodeDialog] = useState(false);
  const [selectedJobCode, setSelectedJobCode] = useState(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = "/api/jobs/";
        if (user) {
          if (user.role === "customer") url = "/api/jobs/userjob";
          else if (user.role === "tradesperson") url = "/api/jobs/feed";
        }
        const [jobsRes, catRes] = await Promise.all([
            api.get(url),
            api.get('/api/service/') 
        ]);

        setJobs(jobsRes.data);
        setCategoryOptions(catRes.data); 

      } catch (error) {
        console.error("Failed to fetch data:", error);
        if (error.response && error.response.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, logout]);

  const handleContactCustomer = async (job) => {
    if (!user) return alert("Please login");
    try {
      const res = await api.post("/api/chat/initiate", {
        jobId: job._id, customerId: job.user._id, tradespersonId: user.id,
      });
      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Could not start chat.");
    }
  };
  
  const handleViewCode = (job) => {
    setSelectedJobTitle(job.title);
    setSelectedJobCode(job.completionCode || "Loading...");
    setOpenCodeDialog(true);
  };

  const getTitle = () => {
    if (user?.role === "customer") return "My Posted Jobs";
    if (user?.role === "tradesperson") return "My Job Feed";
    return "Open Job Listings";
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = 
        categoryFilter === "All" || job.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    return 0;
  });

  if (loading) {
     return <Container><CircularProgress sx={{ mt: 5, display: 'block', mx: 'auto' }} /></Container>; 
  }

  return (
    <Container sx={{ mt: 10, mb: 5, minHeight: "45vh" }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ color: "text.primary", fontWeight: 'bold' }}>
            {getTitle()}
        </Typography>
        {user?.role !== "customer" && (
            <Button 
                variant="outlined" 
                startIcon={<MapIcon />} 
                onClick={() => navigate('/map-search')}
                sx={{ height: 40, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
            >
                Map View
            </Button>
        )}
      </Box>
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField 
            label="Search Jobs..." 
            variant="outlined" 
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
                startAdornment: <Box component="span" sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}><WorkIcon /></Box>
            }}
        />
        <TextField
            select
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 200 }}
        >
            <MenuItem value="All">All Categories</MenuItem>
            {categoryOptions.map((cat) => (
                <MenuItem key={cat._id} value={cat.service_name}>
                    {cat.service_name}
                </MenuItem>
            ))}
        </TextField>
      </Box>

      <Grid container spacing={3}>
        {sortedJobs.length === 0 ? (
            <Box sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
                <Typography variant="h6" color="text.secondary">No jobs found matching criteria.</Typography>
            </Box>
        ) : (
            sortedJobs.map((job) => {
            const isCompleted = job.status === "completed";
            const isAssigned = job.status === "assigned";
            const isMyJob = user && job.user._id === user.id;

            return (
                <Grid key={job._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{
                    height: "100%", 
                    display: "flex", 
                    flexDirection: "column",
                    borderRadius: "16px",
                    bgcolor: isCompleted ? "#f9f9f9" : "white",
                    border: isCompleted ? "1px solid #e0e0e0" : "1px solid #f0f0f0",
                    boxShadow: isCompleted ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                        transform: isCompleted ? "none" : "translateY(-4px)",
                        boxShadow: isCompleted ? "none" : "0 8px 16px rgba(0,0,0,0.1)",
                    }
                }}>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                            <Box>
                                <Typography variant="h6" component="h2" sx={{ fontWeight: '700', lineHeight: 1.2, mb: 0.5, color: isCompleted ? "text.secondary" : "text.primary" }}>
                                    {job.title}
                                </Typography>
                                <Chip 
                                    label={job.category} 
                                    size="small" 
                                    sx={{ 
                                        bgcolor: isCompleted ? '#e0e0e0' : '#e3f2fd', 
                                        color: isCompleted ? '#757575' : '#1976d2',
                                        fontWeight: '500',
                                        fontSize: '0.75rem'
                                    }} 
                                />
                            </Box>
                            
                            <Box>
                                {isCompleted && <Chip label="Closed" size="small" sx={{ fontWeight: 'bold' }} />}
                                {!isCompleted && job.isPaid && (
                                    <Chip 
                                        label="Paid" 
                                        color="success" 
                                        size="small" 
                                        icon={<CheckCircleIcon sx={{ fontSize: '1rem !important' }} />} 
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                )}
                            </Box>
                        </Box>

                        <Divider sx={{ my: 1.5 }} />
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, color: 'text.secondary' }}>
                            <LocationOnIcon fontSize="small" color="action" />
                            <Typography variant="body2" fontWeight="500">
                                {job.city}
                            </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="start" spacing={1} sx={{ mb: 2 }}>
                            <DescriptionIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ 
                                display: '-webkit-box',
                                overflow: 'hidden',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 3,
                            }}>
                                {job.description}
                            </Typography>
                        </Stack>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                            <Avatar 
                                sx={{ width: 32, height: 32, mr: 1.5, bgcolor: '#1976d2', fontSize: '0.875rem' }}
                                src={job.user?.profilePictureUrl}
                            >
                                {job.user?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="caption" display="block" color="text.secondary">
                                    Posted by
                                </Typography>
                                <Link to={`/profile/${job.user._id}`} style={{ textDecoration: "none" }}>
                                    <Typography variant="body2" fontWeight="600" color="text.primary" sx={{ '&:hover': { color: 'primary.main' } }}>
                                        {job.user.name}
                                    </Typography>
                                </Link>
                            </Box>
                        </Box>
                    </CardContent>
                    <CardActions sx={{ px: 3, pb: 3, pt: 0, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        
                        <Button 
                            component={Link} 
                            to={`/job/${job._id}`}
                            size="small" 
                            variant="outlined" 
                            startIcon={<VisibilityIcon />}
                            sx={{ borderRadius: 2, textTransform: 'none', flexGrow: 1, maxWidth: '120px' }}
                        >
                            Details
                        </Button>
                        
                        {user?.role === "customer" && isMyJob && job.isPaid && !isCompleted && (
                            <Button 
                                size="small" 
                                variant="contained" 
                                color="success" 
                                startIcon={<KeyIcon />}
                                onClick={() => handleViewCode(job)}
                                sx={{ borderRadius: 2, textTransform: 'none', boxShadow: 2, flexGrow: 1 }}
                            >
                                View Code
                            </Button>
                        )}

                        {user?.role === "customer" && (
                            <Button 
                                component={Link} 
                                to={`/my-job-proposals/${job._id}`}
                                size="small" 
                                variant="outlined" 
                                sx={{ textTransform: 'none', flexGrow: 1, maxWidth: '100px' }}
                            >
                                Proposals
                            </Button>
                        )}

                        {user?.role === "tradesperson" && !isCompleted && (
                            <Button 
                                size="small" 
                                variant="contained" 
                                color="primary"
                                startIcon={<ChatIcon />}
                                onClick={() => handleContactCustomer(job)}
                                sx={{ borderRadius: 2, textTransform: 'none', boxShadow: 2, flexGrow: 1 }}
                            >
                                Quote
                            </Button>
                        )}

                    </CardActions>
                </Card>
                </Grid>
            );
            })
        )}
      </Grid>
      <Dialog 
        open={openCodeDialog} 
        onClose={() => setOpenCodeDialog(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', bgcolor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
            Job Completion Code
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Share this code with the tradesperson <b>only</b> after the work is completed.
            </Typography>
            <Box sx={{ bgcolor: '#e8f5e9', border: '2px dashed #4caf50', p: 3, borderRadius: 2, mt: 3, mb: 1 }}>
                <Typography variant="h3" sx={{ letterSpacing: '8px', fontWeight: 'bold', color: '#2e7d32', fontFamily: 'monospace' }}>
                    {selectedJobCode || "..."}
                </Typography>
            </Box>
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mt: 2 }}>
                <WorkIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">{selectedJobTitle}</Typography>
            </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button onClick={() => setOpenCodeDialog(false)} variant="outlined" sx={{ borderRadius: 2 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobsPage;
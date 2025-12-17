import React, { useState, useEffect } from "react";
import api from "../../api/axiosConfig.js";
import { useAuth } from "../../api/useAuth.js";
import {
  Container, Grid, Card, CardContent, Typography, Skeleton,
  Box, Chip, Button, CardActions, TextField, MenuItem, CircularProgress
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [categoryOptions, setCategoryOptions] = useState([]); 

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
      <Typography variant="h4" gutterBottom sx={{ color: "text.primary" }}>
        {getTitle()}
      </Typography>
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField 
            label="Search Jobs..." 
            variant="outlined" 
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <TextField
            select
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 200 }}
        >
            <MenuItem value="All">All Categories</MenuItem>
          
            {/* --- FIX: Map object properties properly --- */}
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
                <Typography variant="h6" color="text.secondary">No jobs found.</Typography>
            </Box>
        ) : (
            sortedJobs.map((job) => {
            const isCompleted = job.status === "completed";
            return (
                <Grid key={job._id} item xs={12} sm={6} md={4}>
                <Card sx={{
                    height: "100%", display: "flex", p: "8px", flexDirection: "column",
                    borderRadius: "10px",
                    bgcolor: isCompleted ? "#eeeeee" : "white",
                    border: isCompleted ? "1px solid #bdbdbd" : "none",
                    opacity: isCompleted ? 0.8 : 1,
                }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <Typography variant="h6" component="h2" gutterBottom sx={{ color: isCompleted ? "text.secondary" : "text.primary" }}>
                        {job.title}
                        </Typography>
                        {isCompleted && <Chip label="Closed" size="small" />}
                    </Box>

                    <Chip label={job.category} color={isCompleted ? "default" : "primary"} sx={{ mb: 1 }} />

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {job.description.substring(0, 100)}...
                    </Typography>
                    <Typography variant="subtitle2">Location: {job.city}</Typography>
                    <Typography variant="subtitle2">
                        Posted by: 
                        <Link to={`/profile/${job.user._id}`} style={{ textDecoration: "none", color: "#1976d2", marginLeft: "5px" }}>
                        {job.user.name}
                        </Link>
                    </Typography>
                    </CardContent>
                    <CardActions>
                        <Button component={Link} size="small" sx={{ bgcolor: isCompleted ? "grey" : "#0D47A1", color: "white" }} to={`/job/${job._id}`}>
                            View Details
                        </Button>
                        {user?.role === "tradesperson" && !isCompleted && (
                            <Button size="small" sx={{ bgcolor: "#2e7d32", color: "white" }} onClick={() => handleContactCustomer(job)}>
                            Send Quote
                            </Button>
                        )}
                        {user?.role === "customer" && (
                            <Button component={Link} size="small" variant="outlined" to={`/my-job-proposals/${job._id}`}>
                            Proposals
                            </Button>
                        )}
                    </CardActions>
                </Card>
                </Grid>
            );
            })
        )}
      </Grid>
    </Container>
  );
};

export default JobsPage;
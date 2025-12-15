import React, { useState, useEffect } from "react";
import api from "../../api/axiosConfig.js";
import { useAuth } from "../../api/useAuth.js";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Box,
  Chip,
  Button,
  CardActions,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom"; 

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      let url = "/api/jobs/"; 

      if (user) {
        if (user.role === "customer") {
          url = "/api/jobs/userjob";
        } else if (user.role === "tradesperson") {
          url = "/api/jobs/feed";
        }
      }

      try {
        const response = await api.get(url);
        setJobs(response.data);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        if (error.response && error.response.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user, logout]);

  
  const handleContactCustomer = async (job) => {
    if (!user) {
      alert("Please login to contact customers");
      return;
    }
    try {
      const res = await api.post('/api/chat/initiate', {
        jobId: job._id,
        customerId: job.user._id, 
        tradespersonId: user.id 
      });
      
      navigate(`/chat/${res.data._id}`); 
      
    } catch (err) {
      console.error("Error starting chat:", err);
      alert(err.response?.data?.message || "Could not start chat.");
    }
  };

  const getTitle = () => {
    if (user?.role === "customer") return "My Posted Jobs";
    if (user?.role === "tradesperson") return "My Job Feed";
    return "Open Job Listings";
  };

  if (loading) {
    return (
      <Container sx={{ mt: 10, mb: 5, minHeight: "70vh" }}>
        <Typography variant="h4" gutterBottom sx={{ color: "text.primary" }}>
          {getTitle()}
        </Typography>
        <Grid container spacing={3}>
          {Array.from(new Array(6)).map((item, index) => (
            <Grid key={index} size={{xs:12, sm:6, md:4 }} >
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Skeleton
                    animation="wave"
                    variant="text"
                    sx={{ fontSize: "1.5rem", mb: 1 }}
                  />
                  <Skeleton
                    animation="wave"
                    variant="rectangular"
                    width={80}
                    height={24}
                    sx={{ mb: 2 }}
                  />
                  <Skeleton animation="wave" variant="text" />
                  <Skeleton animation="wave" variant="text" width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 10, mb: 5, minHeight: "45vh" }}>
      <Typography variant="h4" gutterBottom sx={{ color: "text.primary" }}>
        {getTitle()}
      </Typography>
      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid key={job._id} size={{xs:12,sm:6,md:4}} >
            <Card
              sx={{
                height: "100%",
                display: "flex",
                p: "8px",
                flexDirection: "column",
                borderRadius: "10px",
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {job.title}
                </Typography>
                <Chip label={job.category} color="primary" sx={{ mb: 1 }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {job.description.substring(0, 100)}...
                </Typography>
                <Typography variant="subtitle2">
                  Location: {job.city}
                </Typography>
                <Typography variant="subtitle2">
                  Posted by: {job.user ? job.user.name : "A customer"}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  component={Link}
                  size="small"
                  sx={{ bgcolor: "#0D47A1", color: "white" }}
                  to={`/job/${job._id}`}
                >
                  View Details
                </Button>
                
                
                {user?.role === 'tradesperson' && (
                  <Button
                    size="small"
                    sx={{ bgcolor: "#2e7d32", color: "white" }}
                    onClick={() => handleContactCustomer(job)}
                  >
                    Send Quote
                  </Button>
                )}

                 
                 {user?.role === 'customer' && (
                  <Button
                    component={Link}
                    size="small"
                    variant="outlined"
                    to={`/my-job-proposals/${job._id}`} 
                  >
                    Proposals
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default JobsPage;
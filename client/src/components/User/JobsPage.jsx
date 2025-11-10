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
import { Link } from "react-router-dom";

const BrowseJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      let url = "/api/jobs/"; // Default URL for public users

      // 3. Determine the correct URL based on the user's role
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
  }, [user,logout]);

  const getTitle = () => {
    if (user?.role === "customer") return "My Posted Jobs";
    if (user?.role === "tradesperson") return "My Job Feed";
    return "Open Job Listings";
  };
  if (loading) {
    return (
      <Container sx={{ mt: 10, mb: 10 }}>
        <Typography variant="h4" gutterBottom sx={{ color: "text.primary" }}>
          {getTitle()}
        </Typography>
        <Grid container spacing={3}>
          {Array.from(new Array(6)).map((item, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
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
    <Container sx={{ mt: 10, mb: 10 }}>
      <Typography variant="h4" gutterBottom sx={{ color: "text.primary" }}>
        {getTitle()}
      </Typography>
      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid key={job._id} size={{ xs: 12, sm: 6, md: 4 }}>
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
                <Button
                  component={Link}
                  to={`/chat/${job._id}`}
                  size="small"
                  sx={{ bgcolor: "#0D47A1", color: "white" }}
                >
                   Send Quote
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default BrowseJobsPage;

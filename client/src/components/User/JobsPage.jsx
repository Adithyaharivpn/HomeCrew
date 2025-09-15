import React, { useState, useEffect } from "react";
import axios from "axios";
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

const BrowseJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/jobs/");
        setJobs(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      }
    };
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 10, mb: 10 }}>
        <Typography variant="h4" gutterBottom sx={{ color: "text.primary" }}>
          Open Job Listings
        </Typography>
        <Grid container spacing={3}>
          {Array.from(new Array(6)).map((item, index) => (
            <Grid item key={index} size={{ xs: 12, sm: 6, md: 4 }}>
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
        Open Job Listings
      </Typography>
      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid item key={job._id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                p:"8px",
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
                  Posted by:{" "}
                  {job.user
                    ? `${job.user.firstName} ${job.user.lastName}`
                    : "A customer"}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  sx={{ bgcolor: "#0D47A1", color: "white" }}
                >
                  View Details
                </Button>
                <Button
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

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../api/useAuth";
import api from "../../api/axiosConfig";
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
  TextField,
  Button,
} from "@mui/material";

const ViewDetails = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for the quote form
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteDetails, setQuoteDetails] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/api/jobs/${jobId}`);
        setJob(response.data);
        console.log(response.data);
      } catch (err) {
        setError("Failed to fetch job details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    alert(
      `Submitting quote of ₹${quoteAmount} for job ${jobId}. Details: ${quoteDetails}`
    );
    // Here you would make an API call to a new endpoint to save the quote
    // e.g., await api.post(`/api/jobs/${jobId}/quotes`, { amount: quoteAmount, details: quoteDetails });
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!job) return <Typography>Job not found.</Typography>;

  const profilePicUrl = job.user?.profilePictureUrl
    ? `${import.meta.env.VITE_API_BASE_URL}/${job.user.profilePictureUrl}`
    : null;

  return (
    <Box component={Container} maxWidth="lg" sx={{ mt: 10, mb: 5, minHeight: "45vh" }}>
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* Left Column: Job Details */}
          <Grid size={{ xs:12 , md:8 }} >
            <Chip label={job.category} color="primary" sx={{ mb: 2 }} />
            <Typography
              variant="h3"
              component="h1"
              fontWeight="bold"
              gutterBottom
            >
              {job.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Location: {job.city}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {job.description}
            </Typography>
          </Grid>

          {/* Right Column: Customer Info */}
          <Grid size={{ xs:12 , md:4 }}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Posted By
              </Typography>
              <Avatar
                src={profilePicUrl}
                sx={{ width: 80, height: 80, mx: "auto", mb: 1 }}
              />
              <Typography fontWeight="bold">
                {job.user ? job.user.name : "A customer"}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* --- Conditional Quote Form for Tradespeople --- */}
        {user?.role === "tradesperson" || user?.role === "admin" && (
          <Box mt={5}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Submit Your Quote
            </Typography>
            <Box component="form" onSubmit={handleQuoteSubmit}>
              <TextField
                fullWidth
                margin="normal"
                label="Quote Amount (₹)"
                type="number"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                required
              />
              <TextField
                fullWidth
                margin="normal"
                label="Details / Scope of Work"
                multiline
                rows={4}
                value={quoteDetails}
                onChange={(e) => setQuoteDetails(e.target.value)}
                required
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ mt: 2 }}
              >
                Submit Quote
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ViewDetails;

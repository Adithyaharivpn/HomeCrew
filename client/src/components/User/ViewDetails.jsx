import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; 
import { 
  Container, Paper, Typography, Box, Button, Chip, 
  Divider, Avatar, Grid, CircularProgress, Alert 
} from '@mui/material';
import api from '../../api/axiosConfig';
import { useAuth } from '../../api/useAuth';

const ViewDetails = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/jobs/${jobId}`);
        setJob(res.data);
      } catch (err) {
        console.error(err);
        setError("Job not found or deleted.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleContact = async () => {
    if (!user) return alert("Please login to contact.");
    try {
      const res = await api.post("/api/chat/initiate", {
        jobId: job._id,
        customerId: job.user._id,
        tradespersonId: user.id,
      });
      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      alert("Could not initiate chat.");
    }
  };

  if (loading) return <CircularProgress sx={{ display:'block', mx:'auto', mt: 5 }} />;
  if (error) return <Alert severity="error" sx={{ mt: 5 }}>{error}</Alert>;
  if (!job) return <Typography sx={{ mt: 5 }}>Job not found.</Typography>;

  const isMyJob = user && job.user._id === user.id;

  return (
    <Container sx={{ mt: 10, mb: 5 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {job.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={job.category} color="primary" />
                    <Chip label={job.status} variant="outlined" color={job.status === 'open' ? 'success' : 'default'} />
                </Box>
            </Box>
            {user?.role === 'tradesperson' && job.status === 'open' && !isMyJob && (
                <Button variant="contained" size="large" onClick={handleContact} sx={{ bgcolor: '#2e7d32' }}>
                    Send Quote
                </Button>
            )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Description
                </Typography>
                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line', color: 'text.secondary', lineHeight: 1.6 }}>
                    {job.description}
                </Typography>
                
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Location
                    </Typography>
                    <Typography variant="body1">{job.city}</Typography>
                </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f8f9fa', textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                        Posted By
                    </Typography>
                    <Box 
                        component={Link} 
                        to={`/profile/${job.user._id}`}
                        sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}
                    >
                        <Avatar 
                            src={job.user.profilePictureUrl} 
                            alt={job.user.name}
                            sx={{ width: 80, height: 80, mb: 2, border: '3px solid white', boxShadow: 1 }} 
                        />
                        <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }}>
                            {job.user.name}
                        </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Member since {new Date(job.user.createdAt || Date.now()).getFullYear()}
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ViewDetails;
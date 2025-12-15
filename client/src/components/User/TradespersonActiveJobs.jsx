import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, 
  Chip, Button, CardActions, Skeleton 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

const TradespersonActiveJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyWorks = async () => {
      try {
        const res = await api.get('/api/jobs/tradesperson/my-works');
        setJobs(res.data);
      } catch (err) {
        console.error("Error fetching my works", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyWorks();
  }, []);

  if (loading) return <Skeleton variant="rectangular" height={200} />;

  return (
    <Container sx={{ mt: 4 , mb: 4, minHeight: '45vh' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color:'black' }}>
        My Active Works
      </Typography>
      
      {jobs.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          You haven't been assigned any jobs yet. Keep sending proposals!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid item xs={12} md={6} key={job._id}>
              <Card sx={{ borderLeft: '5px solid #4caf50' }}> 
                <CardContent>
                  <Typography variant="h6">{job.title}</Typography>
                  <Chip 
                    label="Assigned to You" 
                    color="success" 
                    size="small" 
                    sx={{ mb: 2, mt: 1 }} 
                  />
                  
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {/* --- FIX 1: Change customerId to user --- */}
                    <strong>Customer:</strong> {job.user?.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> Work in Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {job.description.substring(0, 100)}...
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    variant="contained" 
                    onClick={() => {
                        // --- FIX 2: Change customerId to user._id ---
                        api.post('/api/chat/initiate', { 
                            jobId: job._id, 
                            customerId: job.user._id 
                        }).then(res => navigate(`/chat/${res.data._id}`));
                    }}
                  >
                    Open Chat
                  </Button>
                  <Button 
                    size="small" 
                    color="secondary"
                    onClick={() => navigate(`/job/${job._id}`)}
                  >
                    View Job Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default TradespersonActiveJobs;
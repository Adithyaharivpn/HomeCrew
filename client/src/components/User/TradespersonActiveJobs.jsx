import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, 
  Chip, Button, CardActions, Skeleton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Box, Rating, Paper, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

const TradespersonActiveJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [openVerify, setOpenVerify] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [reviewTargetId, setReviewTargetId] = useState(null); 
  const [openReview, setOpenReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

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


  const completedJobs = jobs.filter(j => j.status === 'completed').length;
  const activeJobs = jobs.filter(j => j.status === 'assigned').length;
  const totalJobs = jobs.length;

  const chartData = [
    { name: 'Active', value: activeJobs },
    { name: 'Completed', value: completedJobs },
  ];
  const COLORS = ['#4caf50', '#9e9e9e']; 

  const handleVerifySubmit = async () => {
    try {
      await api.post('/api/jobs/complete', { jobId: selectedJobId, code: verifyCode });
      setJobs(prevJobs => prevJobs.map(job => 
        job._id === selectedJobId ? { ...job, status: 'completed' } : job
      ));
      alert("Success! Job verified.");
      setOpenVerify(false);
      setVerifyCode("");
      setOpenReview(true); 

    } catch (err) {
      alert(err.response?.data?.message || "Verification Failed");
    }
  };

  const handleReviewSubmit = async () => {
    try {
      await api.post('/api/reviews', {
        jobId: selectedJobId,
        targetUserId: reviewTargetId,
        rating: rating,
        comment: comment,
        visibility: 'internal'
      });
      alert("Review Submitted!");
      setOpenReview(false);
      setComment("");
      setRating(0);
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    }
  };

  if (loading) return <Container sx={{mt:4}}><Skeleton variant="rectangular" height={200} /></Container>;

  return (
    <Container sx={{ mt: 4 , mb: 4, minHeight: '70vh' }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Dashboard
        </Typography>
        
        <Grid container spacing={3}>
            <Grid size={{xs:12, md:8}}>
                <Grid container spacing={2}>
                    <Grid size={{xs:12, sm:4}}>
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%', bgcolor: '#e3f2fd' }}>
                            <WorkHistoryIcon fontSize="large" color="primary" />
                            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>{totalJobs}</Typography>
                            <Typography variant="body2" color="text.secondary">Total Jobs</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{xs:12, sm:4}}>
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%', bgcolor: '#e8f5e9' }}>
                            <PendingActionsIcon fontSize="large" color="success" />
                            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>{activeJobs}</Typography>
                            <Typography variant="body2" color="text.secondary">Active Now</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{xs:12, sm:4}}>
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%', bgcolor: '#f5f5f5' }}>
                            <AssignmentTurnedInIcon fontSize="large" color="action" />
                            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>{completedJobs}</Typography>
                            <Typography variant="body2" color="text.secondary">Completed</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>

            <Grid size={{xs:12, md:4}}>
                <Paper elevation={2} sx={{ p: 2, height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="bold">Job Status Ratio</Typography>
                    {totalJobs > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                            <Typography color="text.secondary">No data yet</Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 4 }} />


      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color:'black' }}>
        Job History
      </Typography>   
      
      {jobs.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          You haven't been assigned any jobs yet. Keep sending proposals!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid size={{xs:12,md:6}} key={job._id}>
              <Card sx={{ borderLeft: job.status === 'completed' ? '5px solid grey' : '5px solid #4caf50', height: '100%', display:'flex', flexDirection:'column' }}> 
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{job.title}</Typography>
                  <Chip 
                    label={job.status === 'completed' ? "Completed" : "Assigned to You"} 
                    color={job.status === 'completed' ? "default" : "success"}
                    size="small" 
                    sx={{ mb: 2, mt: 1 }} 
                  />                
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Customer:</strong> {job.user?.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Location:</strong> {job.city}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  {job.status === 'assigned' && (
                    <Button 
                        size="small" variant="contained" color="warning"
                        onClick={() => { 
                            setSelectedJobId(job._id); 
                            setReviewTargetId(job.user._id);
                            setOpenVerify(true); 
                        }}
                    >
                        Finish Job (Enter Code)
                    </Button>
                  )}
                  {job.status === 'completed' && (
                    <Button 
                        size="small" variant="contained" color="info"
                        onClick={() => { 
                            setSelectedJobId(job._id); 
                            setReviewTargetId(job.user._id);
                            setOpenReview(true); 
                        }}
                    >
                        Review Customer
                    </Button>
                  )}
                  <Button size="small" color="secondary" onClick={() => navigate(`/job/${job._id}`)}>
                    Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      

      <Dialog open={openVerify} onClose={() => setOpenVerify(false)}>
        <DialogTitle>Verify Job Completion</DialogTitle>
        <DialogContent>
            <Typography sx={{mb: 2}}>Ask the customer for the secret code.</Typography>
            <TextField autoFocus margin="dense" label="6-Digit Code" fullWidth value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenVerify(false)}>Cancel</Button>
            <Button onClick={handleVerifySubmit} variant="contained" color="primary">Verify & Complete</Button>
        </DialogActions>
      </Dialog>


      <Dialog open={openReview} onClose={() => setOpenReview(false)} fullWidth maxWidth="sm">
        <DialogTitle>Rate Customer</DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
                <Typography component="legend">Rating</Typography>
                <Rating name="simple-controlled" value={rating} onChange={(event, newValue) => setRating(newValue)} size="large" />
            </Box>
            <TextField 
                margin="normal" fullWidth multiline rows={4} label="Comments" 
                value={comment} onChange={(e) => setComment(e.target.value)} 
                placeholder="How was your experience working with this customer?"
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenReview(false)}>Cancel</Button>
            <Button onClick={handleReviewSubmit} variant="contained" color="success">Submit Review</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TradespersonActiveJobs;
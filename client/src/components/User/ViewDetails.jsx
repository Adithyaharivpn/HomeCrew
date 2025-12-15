import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Paper, Box, Chip, Button, 
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, 
  CircularProgress 
} from '@mui/material';
import api from '../../api/axiosConfig';
import { useAuth } from '../../api/useAuth';

const ViewDetails = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    category: '',
    city: ''
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/api/jobs/${jobId}`);
        setJob(response.data);
        setEditData({
          title: response.data.title,
          description: response.data.description,
          category: response.data.category,
          city: response.data.city
        });
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

 
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Submit Edit
  const handleEditSubmit = async () => {
    try {
      const res = await api.put(`/api/jobs/${jobId}`, editData);
      setJob(res.data); 
      setOpenEdit(false);
      alert("Job updated successfully!");
    } catch (err) {
      alert("Failed to update job.");
      console.error(err);
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 5, display: 'block', mx: 'auto' }} />;
  if (!job) return <Typography sx={{ mt: 5, textAlign: 'center' }}>Job not found</Typography>;

  // Check if current user is the owner
  const isOwner = user && job.user && user.id === job.user._id;

  return (
    <Container sx={{ mt: 10, mb: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom>{job.title}</Typography>
            <Chip label={job.category} color="primary" sx={{ mb: 2 }} />
          </Box>
          
        
          {isOwner && (
            <Button variant="outlined" onClick={() => setOpenEdit(true)}>
              Edit Job
            </Button>
          )}
        </Box>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Description:</Typography>
        <Typography variant="body1" paragraph>{job.description}</Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Location:</Typography>
        <Typography variant="body1" paragraph>{job.city}</Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Posted By:</Typography>
        <Typography variant="body1">{job.user?.name || "Unknown User"}</Typography>
      </Paper>

      {/* --- EDIT DIALOG --- */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Job Details</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal" fullWidth label="Job Title"
            name="title" value={editData.title} onChange={handleEditChange}
          />
          <TextField
            margin="normal" fullWidth label="Category"
            name="category" value={editData.category} onChange={handleEditChange}
          />
          <TextField
            margin="normal" fullWidth label="Location (City)"
            name="city" value={editData.city} onChange={handleEditChange}
          />
          <TextField
            margin="normal" fullWidth multiline rows={4} label="Description"
            name="description" value={editData.description} onChange={handleEditChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default ViewDetails;
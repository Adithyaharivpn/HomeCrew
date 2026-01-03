import React from 'react';
import { Button, Box, Alert, LinearProgress, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

// Icons
import KeyIcon from '@mui/icons-material/Key';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ChatIcon from '@mui/icons-material/Chat';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadarIcon from '@mui/icons-material/Radar';

// --- INTERNAL COMPONENT: LIVE BANNER ---
const JobLiveBanner = ({ job }) => {
  // Check if job is open and has 0 proposals (assuming job.proposals is an array)
  const proposalCount = job.proposals?.length || 0;
  
  if (job.status !== 'open' || proposalCount > 0) return null;

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Alert 
        icon={<RadarIcon sx={{ animation: 'pulse 2s infinite' }} />} 
        severity="info"
        sx={{ 
          bgcolor: '#e3f2fd', 
          color: '#0d47a1',
          '& .MuiAlert-icon': { color: '#1976d2' },
          borderRadius: 2,
          py: 0,
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.5 },
            '100%': { opacity: 1 },
          }
        }}
      >
        <Typography variant="caption" fontWeight="bold">
          Job is Live!
        </Typography>
        <Typography variant="caption" display="block" sx={{ lineHeight: 1.2 }}>
           Notifying workers near {job.city}...
        </Typography>
      </Alert>
      <LinearProgress sx={{ mt: -0.5, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, height: 2 }} />
    </Box>
  );
};

// --- MAIN CONTROLLER ---
const JobActionController = ({ job, user, onContact, onViewCode, onReview }) => {
  const navigate = useNavigate();
  const isCustomer = user?.role === 'customer';
  const isWorker = user?.role === 'tradesperson';
  
  const isMyJob = user && (isCustomer ? job.user._id === user.id : job.assignedTo === user.id);

  // 1. CUSTOMER ACTIONS
  if (isCustomer && isMyJob) {
    switch (job.status) {
      case 'open':
        return (
          <Box sx={{ width: '100%' }}>
            {/* Render Banner Here */}
            <JobLiveBanner job={job} />
            
            <Button
              fullWidth
              variant="contained"
              color="primary"
              component={Link}
              to={`/my-job-proposals/${job._id}`}
              startIcon={<VisibilityIcon />}
            >
              View Proposals
            </Button>
          </Box>
        );

      case 'assigned':
      case 'in_progress':
        return (
          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={() => onContact(job)}
              startIcon={<ChatIcon />}
            >
              Chat
            </Button>
            {job.isPaid && (
              <Button
                fullWidth
                variant="contained"
                color="success"
                onClick={() => onViewCode(job)}
                startIcon={<KeyIcon />}
              >
                Reveal Code
              </Button>
            )}
          </Box>
        );

      case 'completed':
        return (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => onReview(job)}
            startIcon={<RateReviewIcon />}
          >
            Leave Review
          </Button>
        );

      default:
        return null;
    }
  }

  // 2. TRADESPERSON ACTIONS
  if (isWorker) {
    if ((job.assignedTo === user.id || job.assignedTo?._id === user.id) && !['completed', 'cancelled'].includes(job.status)) {
       return (
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={() => onContact(job)}
                startIcon={<ChatIcon />}
            >
                Chat
            </Button>
            <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => navigate('/tradesperson/dashboard')} 
                startIcon={<CheckCircleIcon />}
            >
                Finish Job
            </Button>
        </Box>
       );
    } 
    
    else if (job.status === 'open') {
        return (
            <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => onContact(job)}
                startIcon={<ChatIcon />}
            >
                Send Quote
            </Button>
        );
    }
  }

  // Fallback
  return (
    <Button 
        fullWidth 
        variant="outlined" 
        color="inherit" 
        component={Link} 
        to={`/job/${job._id}`}
        startIcon={<VisibilityIcon />}
    >
        Details
    </Button>
  );
};

export default JobActionController;
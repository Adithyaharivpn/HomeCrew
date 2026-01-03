import React from 'react';
import { 
  Stepper, Step, StepLabel, Box, Typography, useMediaQuery, useTheme 
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import HandshakeIcon from '@mui/icons-material/Handshake';
import EngineeringIcon from '@mui/icons-material/Engineering';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import StarIcon from '@mui/icons-material/Star';

// Map your backend status strings to Step Numbers
const getActiveStep = (status) => {
  switch (status) {
    case 'open': return 0;
    case 'assigned': return 1;
    case 'in_progress': return 2; // If you have this status
    case 'pending_verification': return 3; // Or 'paid' in your case
    case 'completed': return 4;
    default: return 0;
  }
};

const steps = [
  { label: 'Job Posted', icon: <WorkOutlineIcon /> },
  { label: 'Worker Assigned', icon: <HandshakeIcon /> },
  { label: 'Work In Progress', icon: <EngineeringIcon /> },
  { label: 'Verify Code', icon: <VerifiedUserIcon /> },
  { label: 'Completed', icon: <StarIcon /> },
];

const JobStatusStepper = ({ currentStatus }) => {
  const activeStep = getActiveStep(currentStatus);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ width: '100%', mb: 4, mt: 2 }}>
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel={!isMobile} // Horizontal on desktop, better vertical on mobile
        orientation={isMobile ? 'vertical' : 'horizontal'}
      >
        {steps.map((step, index) => {
          // Logic to determine color: Green if passed, Blue if active, Grey if future
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;
          
          return (
            <Step key={step.label} completed={isCompleted}>
              <StepLabel 
                StepIconProps={{
                  sx: { 
                    fontSize: 30,
                    color: isCompleted ? 'success.main' : isActive ? 'primary.main' : 'text.disabled'
                  }
                }}
              >
                <Typography 
                  variant={isMobile ? "body2" : "caption"} 
                  sx={{ 
                    fontWeight: isActive ? 'bold' : 'normal',
                    color: isActive ? 'primary.main' : 'text.secondary'
                  }}
                >
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      
      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, textAlign: 'center', boxShadow: 1 }}>
        <Typography variant="body2" color="text.secondary">
           <strong>Next Step:</strong> 
           {activeStep === 0 && " Wait for tradespeople to send proposals."}
           {activeStep === 1 && " You have accepted a worker. Wait for them to arrive."}
           {activeStep === 2 && " Work is happening."}
           {activeStep === 3 && " Check the work, then share the Secret Code to finish."}
           {activeStep === 4 && " Job done! Leave a review."}
        </Typography>
      </Box>
    </Box>
  );
};

export default JobStatusStepper;
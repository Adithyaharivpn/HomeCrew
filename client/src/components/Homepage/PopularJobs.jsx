import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import PlumbingIcon from '@mui/icons-material/Plumbing';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import CarpenterIcon from '@mui/icons-material/Carpenter';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';


const servicesData = [
  { name: 'Plumbing', icon: <PlumbingIcon sx={{ fontSize: 40 }} />, link: '/jobspage?category=plumbing' },
  { name: 'Electrical', icon: <ElectricalServicesIcon sx={{ fontSize: 40 }} />, link: '/jobspage?category=electrical' },
  { name: 'Carpentry', icon: <CarpenterIcon sx={{ fontSize: 40 }} />, link: '/jobspage?category=carpentry' },
  { name: 'Painting', icon: <FormatPaintIcon sx={{ fontSize: 40 }} />, link: '/jobspage?category=painting' },
  { name: 'AC Service', icon: <AcUnitIcon sx={{ fontSize: 40 }} />, link: '/jobspage?category=ac-service' },
  { name: 'Cleaning', icon: <CleaningServicesIcon sx={{ fontSize: 40 }} />, link: '/jobspage?category=cleaning' },
];

const PopularJobs = () => {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: 15 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" textAlign="center" color='primary' mb={6}>
          Browse by Category
        </Typography>
        
        <Grid container spacing={3} justifyContent="center">
          {servicesData.map((service) => (
            <Grid key={service.name} size={{xs:6,sm:4,md:2}}>
              
              
              <Box
                component={Link}
                to={service.link}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 5,
                  borderRadius: 2,
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'text.primary',
                  bgcolor: '#f5f5f5',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3,
                    bgcolor: 'white',
                  },
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 1 }}>{service.icon}</Box>
                <Typography fontWeight="medium">{service.name}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default PopularJobs;
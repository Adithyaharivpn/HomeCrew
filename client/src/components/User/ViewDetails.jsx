import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; 
import api from '../../api/axiosConfig';
import { useAuth } from '../../api/useAuth'; 
import { 
  Container, Paper, Typography, Box, Button, TextField, 
  CircularProgress, Alert, Avatar, List, ListItem, 
  ListItemAvatar, ListItemText, Rating, Divider, Chip
} from '@mui/material';

const UserProfile = () => {
  const { user: currentUser } = useAuth();
  const { id } = useParams(); 
  
  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]); 
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const viewingUserId = id || 'me'; 
  const isSelfView = !id || id === currentUser.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const endpoint = viewingUserId === 'me' ? '/api/users/me' : `/api/users/${viewingUserId}`;
        const res = await api.get(endpoint);
        setProfileData(res.data);
    
        const targetId = viewingUserId === 'me' ? res.data._id : viewingUserId;
        const reviewRes = await api.get(`/api/reviews/${targetId}`);
        setReviews(reviewRes.data);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [viewingUserId]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  if (!profileData) return <Typography>User not found.</Typography>;

  return (
    <Container sx={{ mt: 10, mb: 5 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar 
                src={profileData.profilePictureUrl} 
                alt={profileData.name}
                sx={{ width: 100, height: 100, mr: 3 }} 
            />
            <Box>
                <Typography variant="h4">{profileData.name}</Typography>
                <Chip label={profileData.role} color="primary" size="small" sx={{ mt: 1 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Rating value={Number(averageRating)} readOnly precision={0.5} />
                    <Typography sx={{ ml: 1 }}>({reviews.length} reviews)</Typography>
                </Box>
            </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom>Reviews</Typography>

        {isSelfView ? (
            <Alert severity="info" sx={{ mt: 2 }}>
                You have an average rating of <strong>{averageRating} stars</strong> from {reviews.length} completed jobs.
                <br/>
                (Individual review comments are hidden from your own profile.)
            </Alert>
        ) : (
            <List>
                {reviews.length === 0 && <Typography>No reviews yet.</Typography>}
                
                {reviews.map((review) => (
                    <Box key={review._id}>
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar src={review.reviewerId?.profilePictureUrl} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={review.reviewerId?.name || "User"}
                                secondary={
                                    <>
                                        <Rating value={review.rating} readOnly size="small" />
                                        <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                                            "{review.comment}"
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                    </Box>
                ))}
            </List>
        )}
      </Paper>
    </Container>
  );
};

export default UserProfile;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../api/useAuth';
import api from '../../api/axiosConfig';
import { Container, Paper, Typography, Box, Button, TextField, CircularProgress, Alert, Avatar } from '@mui/material';

const UserProfile = () => {

  // eslint-disable-next-line no-unused-vars
  const { user, login } = useAuth(); 
  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newProfilePicture, setNewProfilePicture] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/users/me');
        setProfileData(response.data);
      } catch (err) {
        setError('Failed to fetch profile data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };
  
    const handleFileChange = (e) => {
    setNewProfilePicture(e.target.files[0]);
  };

  const handleSave = async () => {

    const data = new FormData();
    data.append('name', profileData.name);
    
    if (profileData.role === 'tradesperson') {
      data.append('location', profileData.location);
      data.append('experience', profileData.experience);
      data.append('tradeCategory', profileData.tradeCategory);
    }
    
    if (newProfilePicture) {
      data.append('profilePicture', newProfilePicture);
    }
    //Update profile API call
    try {
      const response = await api.put('/api/users/me', data);
      setProfileData(response.data);
      setEditMode(false);
      setNewProfilePicture(null);
    } catch (err) {
      setError('Failed to update profile.');
      console.error(err);
    }
  };
  
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profileData) return <Typography>No profile found.</Typography>;

   const profilePicUrl = profileData.profilePictureUrl 
    ? `${profileData.profilePictureUrl}` 
    : null;

  return (
    <Box component={Container} sx={{ mt: 4 ,p: 15,}}>
      <Paper sx={{ p: 3 }}>
        <Avatar src={profilePicUrl} sx={{ width: 80, height: 80, mr: 2 }} />
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        
        {editMode ? (

          /* --- EDIT MODE --- */

          <Box component="form" noValidate autoComplete="off">
            <Button variant="outlined" component="label" sx={{mb: 2}}>
              Change Profile Picture
            <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {newProfilePicture && <Typography>{newProfilePicture.name}</Typography>}
            <TextField fullWidth margin="normal" label="Full Name" name="name" value={profileData.name} onChange={handleChange} />
            <TextField fullWidth margin="normal" label="Email" name="email" value={profileData.email} disabled />
            
            {/* Fields only for tradespeople */}
            {profileData.role === 'tradesperson' && (
              <>
                <TextField fullWidth margin="normal" label="Trade Category" name="tradeCategory" value={profileData.tradeCategory} onChange={handleChange} />
                <TextField fullWidth margin="normal" label="Years of Experience" name="experience" type="number" value={profileData.experience} onChange={handleChange} />
                <TextField fullWidth margin="normal" label="Location / Service Area" name="location" value={profileData.location} onChange={handleChange} />
              </>
            )}

            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={handleSave} sx={{ mr: 1 }}>Save Changes</Button>
              <Button variant="outlined" onClick={() => setEditMode(false)}>Cancel</Button>
            </Box>
          </Box>
        ) : (
          
          /* --- VIEW MODE --- */
          <Box>
            <Typography variant="h6"><strong>Name:</strong> {profileData.name}</Typography>
            <Typography><strong>Email:</strong> {profileData.email}</Typography>
            <Typography><strong>Role:</strong> {profileData.role}</Typography>
            
            {profileData.role === 'tradesperson' && (
              <>
                <Typography><strong>Trade:</strong> {profileData.tradeCategory || 'Not set'}</Typography>
                <Typography><strong>Experience:</strong> {profileData.experience || 0} years</Typography>
                <Typography><strong>Location:</strong> {profileData.location || 'Not set'}</Typography>
              </>
            )}

            <Button variant="contained" onClick={() => setEditMode(true)} sx={{ mt: 3 }}>
              Edit Profile
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default UserProfile;
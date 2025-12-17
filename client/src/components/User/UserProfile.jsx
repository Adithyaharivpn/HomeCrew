import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../api/useAuth";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Rating,
  Divider,
  Chip,
} from "@mui/material";

const UserProfile = () => {
  const { user: currentUser } = useAuth();
  const { id } = useParams();

  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newProfilePicture, setNewProfilePicture] = useState(null);

  const viewingUserId = id || "me";
  const isSelfView = !id || (currentUser && id === currentUser.id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endpoint =
          viewingUserId === "me"
            ? "/api/users/me"
            : `/api/users/${viewingUserId}`;
        const res = await api.get(endpoint);
        setProfileData(res.data);
        const targetId = viewingUserId === "me" ? res.data._id : viewingUserId;
        const reviewRes = await api.get(`/api/reviews/${targetId}`);
        setReviews(reviewRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [viewingUserId]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setNewProfilePicture(e.target.files[0]);
  };

  const handleSave = async () => {
    const data = new FormData();
    data.append("name", profileData.name);

    if (profileData.role === "tradesperson") {
      data.append("location", profileData.location);
      data.append("experience", profileData.experience);
      data.append("tradeCategory", profileData.tradeCategory);
    }

    if (newProfilePicture) {
      data.append("profilePicture", newProfilePicture);
    }

    try {
      const response = await api.put("/api/users/me", data);
      setProfileData(response.data);
      setEditMode(false);
      setNewProfilePicture(null);
    } catch (err) {
      setError("Failed to update profile.");
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  if (loading)
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />;
  if (error)
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  if (!profileData)
    return <Typography sx={{ mt: 2 }}>User not found.</Typography>;

  const profilePicUrl = profileData.profilePictureUrl || null;

  return (
    <Container sx={{ mt: 10, mb: 5 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 4,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Avatar
            src={profilePicUrl}
            alt={profileData.name}
            sx={{
              width: 100,
              height: 100,
              mr: { sm: 3 },
              mb: { xs: 2, sm: 0 },
              border: "1px solid #ddd",
            }}
          >
            {!profilePicUrl && profileData.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography variant="h4">{profileData.name}</Typography>
            <Typography variant="body1" color="text.secondary">
              {profileData.email}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 1,
                justifyContent: { xs: "center", sm: "start" },
              }}
            >
              <Chip
                label={profileData.role}
                color="primary"
                size="small"
                sx={{ textTransform: "capitalize" }}
              />
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Rating
                  value={Number(averageRating)}
                  readOnly
                  size="small"
                  precision={0.5}
                />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  ({reviews.length} reviews)
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        {editMode && isSelfView ? (
          <Box component="form" noValidate autoComplete="off">
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mb: 2 }}
            >
              Upload New Picture
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>

            <TextField
              fullWidth
              margin="normal"
              label="Full Name"
              name="name"
              value={profileData.name}
              onChange={handleChange}
            />

            {profileData.role === "tradesperson" && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Trade Category"
                  name="tradeCategory"
                  value={profileData.tradeCategory}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Years of Experience"
                  name="experience"
                  type="number"
                  value={profileData.experience}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Location / Service Area"
                  name="location"
                  value={profileData.location}
                  onChange={handleChange}
                />
              </>
            )}

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button variant="contained" onClick={handleSave}>
                Save Changes
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            {profileData.role === "tradesperson" && (
              <Box sx={{ mb: 3 }}>
                <Typography>
                  <strong>Trade:</strong>{" "}
                  {profileData.tradeCategory || "Not set"}
                </Typography>
                <Typography>
                  <strong>Experience:</strong> {profileData.experience || 0}{" "}
                  years
                </Typography>
                <Typography>
                  <strong>Location:</strong> {profileData.location || "Not set"}
                </Typography>
              </Box>
            )}

            {isSelfView && (
              <Button variant="contained" onClick={() => setEditMode(true)}>
                Edit Profile
              </Button>
            )}
          </Box>
        )}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h5" gutterBottom>
          Reviews
        </Typography>

        {isSelfView ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            You have an average rating of <strong>{averageRating} stars</strong>{" "}
            from {reviews.length} completed jobs.
            <br />
            (Individual review comments are hidden from your own profile.)
          </Alert>
        ) : (
          <List>
            {reviews.length === 0 && (
              <Typography color="text.secondary">No reviews yet.</Typography>
            )}

            {reviews.map((review) => (
              <Box key={review._id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar src={review.reviewerId?.profilePictureUrl} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="subtitle1">
                          {review.reviewerId?.name || "User"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ mt: 1 }}
                        >
                          "{review.comment}"
                        </Typography>
                        {review.visibility === "internal" && (
                          <Chip
                            label="Internal Note"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        )}
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

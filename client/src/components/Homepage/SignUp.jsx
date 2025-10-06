import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../api/useAuth";

const SignUp = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    tradeCategory: "",
    experience: "",
    location: "",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [tradeCategories, setTradeCategories] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTradeCategories = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/service`
        );
        setTradeCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch trade categories:", error);
      }
    };
    fetchTradeCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleRoleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };

    if (value !== "tradesperson") {
      newFormData.tradeCategory = "";
      newFormData.experience = "";
      newFormData.location = "";
    }
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    
   Object.keys(formData).forEach(key => {
    if (key !== 'confirmPassword') {
      data.append(key, formData[key]);
    }
    });
    // Append the file if it exists
    if (profilePicture) {
      data.append("profilePicture", profilePicture);
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`,
        data
      );
      setSuccess(response.data.message);
      
      if (response.data.token) {
        login(response.data.token);
      }

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        tradeCategory: "",
        experience: "",
        location: "",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const firstError = err.response.data.errors[0];
        setError(firstError.msg);
      } else {
        setError(err.response?.data?.error || "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{ maxWidth: 500, width: "100%", p: 4, borderRadius: 3 }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">
            Sign Up
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Create Your Account
          </Typography>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography color="success.main" sx={{ mb: 2 }}>
            {success}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2} direction="column">
            {/* image */}
            <Grid item>
              <Button variant="outlined" component="label" fullWidth>
                Upload Profile Picture
                <input
                  type="file"
                  name="profilePicture"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {profilePicture && (
                <Typography sx={{ mt: 1 }}>{profilePicture.name}</Typography>
              )}
            </Grid>
            {/* Name */}
            <Grid>
              <TextField
                fullWidth
                name="name"
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            {/* Email */}
            <Grid>
              <TextField
                fullWidth
                name="email"
                type="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            {/* Password */}
            <Grid>
              <TextField
                fullWidth
                name="password"
                type="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            {/* Confirm Password */}
            <Grid>
              <TextField
                fullWidth
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            {/* Role */}
            <Grid>
              <FormControl fullWidth required>
                <InputLabel>I am a...</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  label="I am a..."
                >
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="tradesperson">Tradesperson</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Tradesperson Fields */}
            {formData.role === "tradesperson" && (
              <>
                <Grid>
                  <FormControl fullWidth required>
                    <InputLabel>Trade Category</InputLabel>
                    <Select
                      name="tradeCategory"
                      value={formData.tradeCategory}
                      onChange={handleChange}
                      label="Trade Category"
                    >
                      {tradeCategories.length > 0 ? (
                        tradeCategories.map((category) => (
                          <MenuItem
                            key={category._id}
                            value={category.service_name}
                          >
                            {category.service_name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>Loading categories...</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid>
                  <TextField
                    fullWidth
                    name="experience"
                    type="number"
                    placeholder="Years of Experience"
                    required
                    value={formData.experience}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid>
                  <TextField
                    fullWidth
                    name="location"
                    placeholder="City or Area of Service"
                    required
                    value={formData.location}
                    onChange={handleChange}
                  />
                </Grid>
              </>
            )}
            <Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ py: 1.5, fontWeight: "bold" }}
                disabled={isLoading}
              >
                 {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
              </Button>
            </Grid>
            <Grid>
              <Typography sx={{ mt: 2, textAlign: "center" }}>
                Already a User?<Link to={"/login"}>Login</Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default SignUp;

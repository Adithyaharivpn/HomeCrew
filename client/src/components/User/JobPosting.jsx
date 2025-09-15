import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import LocationPinIcon from "@mui/icons-material/LocationPin";

const JobPosting = () => {
  const [jobDetails, setJobDetails] = useState({
    title: "",
    category: "",
    description: "",
    city: "",
  });
  const handleChange = (e) => {
    setJobDetails({
      ...jobDetails,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", jobDetails);
    
  };
  return (
    <Box
      sx={{
        p: {xs:6,md:3},
        maxWidth: "700px",
        mx: "auto",
        mt: "100px",
        mb: "100px",
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: "0 6px 32px 0 rgba(40,41,61,0.12)",
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: "text.primary" }}>
        Post a New Job
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Job Title"
          name="title"
          value={jobDetails.title}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth required sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            label="Category"
            value={jobDetails.category}
            onChange={handleChange}
          >
            <MenuItem value="plumbing">Plumbing</MenuItem>
            <MenuItem value="electrical">Electrical</MenuItem>
            <MenuItem value="carpentry">Carpentry</MenuItem>
            <MenuItem value="painting">Painting</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Job Description"
          name="description"
          value={jobDetails.description}
          onChange={handleChange}
          multiline
          rows={4}
          fullWidth
          required
          sx={{ mb: 2 }}
        />

        <TextField
          label="City / Town"
          name="city"
          value={jobDetails.city}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <LocationPinIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button variant="contained" type="submit" size="large" fullWidth>
          Post Job
        </Button>
      </form>
    </Box>
  );
};

export default JobPosting;

import React, { useState } from "react";
import api from '../../api/axiosConfig.js';
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
import { useEffect } from "react";
// import { useAuth } from '../../api/Auth.jsx';

const JobPosting = () => {
  const [jobDetails, setJobDetails] = useState({
    title: "",
    category: "",
    description: "",
    city: "",
  });
  const [services, setServices] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    setJobDetails({
      ...jobDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post(
        '/api/jobs/',
        jobDetails
      );

      alert("Job posted successfully!");

      setJobDetails({ title: "", category: "", description: "", city: "" });
    } catch (error) {
      console.error("Failed to post job:", error);

      alert("There was an error posting your job. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get(
          '/api/service/'
        );
        // console.log("Services API Response:", response.data);
        setServices(response.data);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    };

    fetchServices();
  }, []);
  return (
    <Box
      sx={{
        p: { xs: 6, md: 3 },
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
    {Array.isArray(services) &&
      services.map((service) => (
        <MenuItem key={service.id} value={service.service_name}>
          {service.service_name}
        </MenuItem>
      ))}
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

        <Button
          variant="contained"
          type="submit"
          size="large"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? "Posting..." : "Post Job"}
        </Button>
      </form>
    </Box>
  );
};

export default JobPosting;

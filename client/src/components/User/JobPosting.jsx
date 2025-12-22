import React, { useState, useEffect } from "react";
import api from "../../api/axiosConfig.js";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Autocomplete,
  CircularProgress
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useNavigate } from "react-router-dom";

const JobPosting = () => {
  const navigate = useNavigate();
  
  const [jobDetails, setJobDetails] = useState({
    title: "",
    category: "",
    description: "",
    city: "",
    location: { lat: null, lng: null } 
  });

  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  const [locationOptions, setLocationOptions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationInputValue, setLocationInputValue] = useState("");

  const handleChange = (e) => {
    setJobDetails({
      ...jobDetails,
      [e.target.name]: e.target.value,
    });
  };

  const fetchLocations = async (query) => {
      if (!query) return;
      setLocationLoading(true);
      try {
          const openUrl = import.meta.env.VITE_OPENMAP;
          const res = await axios.get(`${openUrl}${query}`);
          setLocationOptions(res.data);
      } catch (error) {
          console.error("Location search failed", error);
      } finally {
          setLocationLoading(false);
      }
  };

  useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
          if (locationInputValue.length > 2) {
              fetchLocations(locationInputValue);
          }
      }, 500);

      return () => clearTimeout(delayDebounceFn);
  }, [locationInputValue]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jobDetails.location.lat || !jobDetails.city) {
        alert("Please select a valid location from the dropdown list.");
        return;
    }

    setIsLoading(true);

    try {
      await api.post("/api/jobs/", jobDetails);
      alert("Job posted successfully!");
      navigate("/jobspage");
      setJobDetails({ title: "", category: "", description: "", city: "", location: { lat: null, lng: null } });
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
        const response = await api.get("/api/service/");
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
      <Typography variant="h4" gutterBottom sx={{ color: "text.primary", fontWeight: 'bold' }}>
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

        <Autocomplete
            fullWidth
            options={locationOptions}
            loading={locationLoading}
            getOptionLabel={(option) => option.display_name}
            filterOptions={(x) => x} 
            onInputChange={(event, newInputValue) => {
                setLocationInputValue(newInputValue);
            }}

            onChange={(event, newValue) => {
                if (newValue) {
                    setJobData({
                        ...jobDetails,
                        city: newValue.display_name.split(',')[0],
                        location: {
                            lat: parseFloat(newValue.lat),
                            lng: parseFloat(newValue.lon)
                        }
                    });
                }
                function setJobData(newData) {
                    setJobDetails(newData);
                }
            }}

            renderInput={(params) => (
              <TextField 
                {...params} 
                label="City / Location" 
                required
                sx={{ mb: 2 }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {locationLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            
            renderOption={(props, option) => (
                <li {...props}>
                    <LocationOnIcon sx={{ color: 'text.secondary', mr: 2 }} />
                    <Typography variant="body2">{option.display_name}</Typography>
                </li>
            )}
        />

        <Button
          variant="contained"
          type="submit"
          size="large"
          fullWidth
          disabled={isLoading}
          sx={{ fontWeight: 'bold', py: 1.5 }}
        >
          {isLoading ? "Posting..." : "Post Job"}
        </Button>
      </form>
    </Box>
  );
};

export default JobPosting;
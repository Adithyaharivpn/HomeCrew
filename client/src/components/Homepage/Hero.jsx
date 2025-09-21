import {
  Box,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import BgImage from "../../assets/bg.jpg";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <>
      <Box
        component="section"
        sx={{
          position: "relative",
          px: { xs: 2, md: 10 },
          py: { xs: 10, md: 20 },
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          backgroundImage: `url(${BgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1,
          }}
        />

        <Grid
          container
          alignItems="center"
          sx={{
            position: "relative",
            zIndex: 2,
            ml: { xs: 0, md: 17 },
          }}
          
        >
          <Grid size={{xs:12,md:10}}>
            <Typography
              variant="h4"
              component="h1"
              color="white"
              fontWeight="bold"
              gutterBottom
            >
              Reliable Home Services, On-Demand.
            </Typography>
            <Typography
              variant="h6"
              component="p"
              color="rgba(255, 255, 255, 0.85)"
              sx={{ mb: 4 }}
            >
              Your one-stop platform to find and book verified experts for all
              your home service needs.
            </Typography>
            <Box
              component="form"
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                maxWidth: 780,
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: "0 6px 32px 0 rgba(40,41,61,0.12)",
                px: 1,
                py: 1,
              }}
            >
              <TextField
                placeholder="Your Location"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton>
                          <LocationPinIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  p: 1,
                  flexGrow: 1,
                }}
              />
              <TextField
                placeholder="Search a Job"
                variant="outlined"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          sx={{
                            bgcolor: "#0D47A1",
                            "--IconButton-hoverBg": "#08306b",
                            color: "white",
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            p: 1.6,
                            mr: -1.7,
                            flex: 2,
                          }}
                        >
                          <Link
                            style={{ color: "white", textDecoration: "none" }}
                            to={"/jobspage"} //temp
                          >
                            <SearchOutlinedIcon />
                          </Link>
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  p: 1,
                  flexGrow: 10,
                  "& .MuiOutlinedInput-root": {
                    borderTopRightRadius: "50px",
                    borderBottomRightRadius: "50px",
                  },
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Hero;

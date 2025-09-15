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
import BgImage from "../../assets/Job.jpg"

const Hero = () => {
  return (
    <>
    <Box
      component="section"
      sx={{
        px: { xs: 2, md: 10 },
        py: { xs: 2, md: 40 },
        mx: "auto",
        
        backgroundImage:`url(${BgImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat', 
        minHeight: '70vh', 
        
        alignItems: 'center', 
      
      }}
    >
      <Grid container spacing={4} alignItems="center" sx={{ml: { xs: 0, md: 17 },}}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            variant="h4"
            component="h1"
            color="text.primary"
            fontWeight="bold"
            gutterBottom
          >
            Reliable Home Services, On-Demand.
          </Typography>
          <Typography
            variant="h6"
            component="p"
            color="text.secondary"
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
                          p: 1.9,
                          mr: -1.7,
                          flex: 2,
                        }}
                      >
                        <SearchOutlinedIcon />
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
        {/* <Grid size={{xs:12,md:6}} sx={{ textAlign: "right", height: "100%" }}>
          <Box
            component="img"
            src={workerImage}
            alt="Worker with toolbox"
            sx={{
              width: "100%",
              height: "auto",
              maxHeight: 500,
              filter: "drop-shadow(0 0 15px rgba(0,0,0,0.1))",
              borderRadius: 2,
              objectFit: "contain",
            }}
          />
        </Grid> */}
      </Grid>
    </Box>
   {/* <Box
        component="img"
        src={workerImage}
        alt="Worker with toolbox"
        sx={{
          position: 'absolute', 
          zIndex: -1,
          top: '60%',            
          right: '5%',            
          transform: 'translateY(-50%)', 
          filter: "drop-shadow(0 0 200px rgba(0,0,0,0.1))",
          width: 'auto',
          height: { lg: "100vh", xl: "100vh" },
          maxHeight:'900px',
          display: { xs: 'none', lg: 'block' },
        }}
      >
    </Box> */}
    </>
  );
};

export default Hero;

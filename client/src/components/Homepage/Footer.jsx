import React from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Link,
  IconButton,
  Divider,
  Stack,
} from "@mui/material";

// Import relevant social media icons
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#1a2027",
        color: "grey.400",
        p: { xs: 4, md: 8 },
      }}
    >
      <Grid container spacing={4} justifyContent="space-between">
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" fontWeight="bold" color="white" gutterBottom>
            HomeCrew
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Your one-stop platform for reliable home services in Kerala.
          </Typography>
          <Typography variant="body1" color="white" gutterBottom>
            Join our newsletter
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Your email address"
              sx={{
                bgcolor: "grey.800",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "grey.700" },
                  "&:hover fieldset": { borderColor: "primary.main" },
                },
                "& .MuiInputBase-input": { color: "white" },
              }}
            />
            <Button variant="contained" color="primary" sx={{ py: 1 }}>
              Subscribe
            </Button>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 6, md: 4 }}>
              <Typography
                variant="body1"
                fontWeight="bold"
                color="white"
                gutterBottom
              >
                For Customers
              </Typography>
              <Link
                href="#"
                color="inherit"
                display="block"
                sx={{
                  mb: 1,
                  textDecoration: "none",
                  "&:hover": { color: "primary.main" },
                }}
              >
                How It Works
              </Link>
              <Link
                href="#"
                color="inherit"
                display="block"
                sx={{
                  mb: 1,
                  textDecoration: "none",
                  "&:hover": { color: "primary.main" },
                }}
              >
                Browse Services
              </Link>
              <Link
                href="#"
                color="inherit"
                display="block"
                sx={{
                  mb: 1,
                  textDecoration: "none",
                  "&:hover": { color: "primary.main" },
                }}
              >
                Testimonials
              </Link>
              <Link
                href="#"
                color="inherit"
                display="block"
                sx={{
                  mb: 1,
                  textDecoration: "none",
                  "&:hover": { color: "primary.main" },
                }}
              >
                FAQs
              </Link>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography
                variant="body1"
                fontWeight="bold"
                color="white"
                gutterBottom
              >
                Company
              </Typography>
              <Link
                href="#"
                color="inherit"
                display="block"
                sx={{
                  mb: 1,
                  textDecoration: "none",
                  "&:hover": { color: "primary.main" },
                }}
              >
                About Us
              </Link>
              <Link
                href="#"
                color="inherit"
                display="block"
                sx={{
                  mb: 1,
                  textDecoration: "none",
                  "&:hover": { color: "primary.main" },
                }}
              >
                Contact Us
              </Link>
              <Link
                href="#"
                color="inherit"
                display="block"
                sx={{
                  mb: 1,
                  textDecoration: "none",
                  "&:hover": { color: "primary.main" },
                }}
              >
                Careers
              </Link>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography
                variant="body1"
                fontWeight="bold"
                color="white"
                gutterBottom
              >
                Credits
              </Typography>
              <Link
                href="https://www.flaticon.com/free-animated-icons/activity-feed"
                color="inherit"
                display="block"
                sx={{
                  mb: 1,
                  textDecoration: "none",
                  "&:hover": { color: "primary.main" },
                }}
              >
                Flaticon
              </Link>
              <Link
                href="https://unsplash.com/"
                color="inherit"
                display="block"
                sx={{
                  mb: 1,
                  textDecoration: "none",
                  "&:hover": { color: "primary.main" },
                }}
              >
                Unsplash
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4, bgcolor: "grey.800" }} />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="body2">
          Copyright © {new Date().getFullYear()} HomeCrew. All Rights Reserved.
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: { xs: 2, sm: 0 } }}>
          <IconButton
            href="#"
            sx={{ color: "grey.400", "&:hover": { color: "primary.main" } }}
          >
            <FacebookIcon />
          </IconButton>
          <IconButton
            href="#"
            sx={{ color: "grey.400", "&:hover": { color: "primary.main" } }}
          >
            <TwitterIcon />
          </IconButton>
          <IconButton
            href="#"
            sx={{ color: "grey.400", "&:hover": { color: "primary.main" } }}
          >
            <InstagramIcon />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
};

export default Footer;

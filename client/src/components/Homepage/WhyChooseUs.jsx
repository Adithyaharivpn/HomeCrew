import { Box, Grid, Stack, Typography } from "@mui/material";
import React from "react";
import PlaceHolder from "../../assets/Job.jpg";
import VerifiedIcon from "@mui/icons-material/Verified";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

const WhyChooseUs = () => {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        py: { xs: 6, md: 10 },
        boxShadow:
          "0px -10px 30px rgba(0, 0, 0, 0.08),0px 10px 30px rgba(0, 0, 0, 0.08)",
      }}
    >
      <Grid
        container
        alignItems="center"
        spacing={{ xs: 4, md: 8 }}
        sx={{ maxWidth: "1400px", mx: "auto", px: 3 }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            component="img"
            src={PlaceHolder}
            alt="A happy customer with a service professional"
            sx={{
              width: "100%",
              height: "auto",
              borderRadius: 4,
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.82)",
              boxShadow: "0 6px 32px 0 rgba(40,41,61,0.12)",
              borderRadius: 3,
              p: 4,
              width: { sm: "500px", md: "1000px" },
              backdropFilter: "blur(8px)",
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "black" }}
            >
              Your Peace of Mind is Our Priority
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              We're committed to providing not just expert service, but also a
              safe and trustworthy experience from start to finish.
            </Typography>
            <Stack spacing={3} sx={{ color: "black" }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <VerifiedIcon color="primary" />
                <Typography variant="body1">
                  Verified & Vetted Professionals: Every expert is
                  background-checked.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <PermIdentityIcon color="primary" />
                <Typography variant="body1">
                  Satisfaction Guaranteed: We stand by our work until you're
                  happy.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <CurrencyRupeeIcon color="primary" />
                <Typography variant="body1">
                  Upfront Pricing: Compare quotes with no hidden fees.
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WhyChooseUs;

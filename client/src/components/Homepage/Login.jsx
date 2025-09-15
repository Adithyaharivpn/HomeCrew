import { Alert, Box, Button, Grid, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material'
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";


const Login = () => {
  return (
 <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "gray.100", // Light blue background
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 500,
          width: "100%",
          p: 4,
          borderRadius: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Login
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Login In To Your Account
          </Typography>
        </Box>




        {/* Form */}
        <Box component="form" >
          <Grid container spacing={3}>
            {/* Email */}
            <Grid size={12}>
              <TextField
                fullWidth
                name="email"
                type="email"
                placeholder="Email Address"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Password */}
            <Grid size={12}>
              <TextField
                fullWidth
                name="password"
                
                placeholder="Password"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Submit Button */}
            <Grid size={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  py: 1.5,
                  fontWeight: "bold",
                  textTransform: "none",
                  fontSize: "1.1rem",
                }}
              >
                Login
              </Button>
            </Grid>
          </Grid>
          </Box>
      </Paper>
    </Box>
  )
}

export default Login

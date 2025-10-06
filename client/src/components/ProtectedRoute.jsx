import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../api/useAuth";
import { Box, CircularProgress } from "@mui/material";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Then, check if this route requires specific roles AND if the user has one of them.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If the user's role is not in the allowed list, redirect them to the homepage.
    return <Navigate to="/" replace />;
  }

 
  return children;
};

export default ProtectedRoute;

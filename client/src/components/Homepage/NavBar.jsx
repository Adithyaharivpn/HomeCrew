import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  Drawer,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AdbIcon from "@mui/icons-material/Adb";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../api/useAuth';

// const pages = ["Post a Job", "Signup", "Login"];
// const settings = ["Profile", "Account", "Dashboard", "Logout"];
const drawerWidth = 240;


const NavBar = (props) => {
const { user, logout } = useAuth(); 
const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleDrawerToggle = () => setMobileOpen((prevState) => !prevState);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/'); 
  };
  const { window } = props;
 
  const profilePicUrl = user?.profilePictureUrl 
    ? `${user.profilePictureUrl}` 
    : null;

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Pages
      </Typography>
      <Divider sx={{ bgcolor: "white" }} />
      <List>
        <ListItem
          disablePadding
          sx={{ display: "flex", justifyContent: "center", py: 1 }}
        >
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/jobposting"
          >
            Post a Job
          </Button>
        </ListItem>

        <Divider sx={{ bgcolor: "white" }} />

        <ListItem
          disablePadding
          sx={{ display: "flex", justifyContent: "center", py: 1 }}
        >
          <Button color="inherit" component={Link} to="/Signup">
            Signup
          </Button>
        </ListItem>

        <Divider sx={{ bgcolor: "white" }} />

        <ListItem
          disablePadding
          sx={{ display: "flex", justifyContent: "center", py: 1 }}
        >
          <Button color="inherit" component={Link} to="/Login">
            Login
          </Button>
        </ListItem>

        <Divider sx={{ bgcolor: "white" }} />
      </List>
    </Box>
  );
  return (
    <AppBar position="static" sx={{ bgcolor: "#1a2027" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* mobile */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* icon */}

          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,  
              color: "inherit",
              textDecoration: "none",
            }}
          >
            HomeCrew
          </Typography>

          <nav>
            <Drawer
              container={container}
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                display: { xs: "block", sm: "none" },
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: drawerWidth,
                  backgroundColor: "#1E1E1E",
                  color: "white",
                },
              }}
            >
              {drawer}
            </Drawer>
          </nav>

          {/* Desktop */}
          <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />

          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            LOGO
          </Typography>


          {/* Pages */}
        <Box sx={{ flexGrow: 1 }} /> {/* This is a spacer */}

         
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: 'center', gap: 1 }}>
            
            {!user && (
              <>
                <Button color="secondary" variant="contained" component={Link} to="/jobposting">
                  Post a Job
                </Button>
                <Button color="inherit" component={Link} to="/signup">Signup</Button>
                <Button color="inherit" component={Link} to="/login">Login</Button>
              </>
            )}

            
            {user && user.role === 'customer' && (
              <Button color="secondary" variant="contained" component={Link} to="/jobposting">
                Post a Job
              </Button>
            )}
            {user && (
              <Button color="inherit" component={Link} to="/jobspage">
                Browse Jobs
              </Button>
            )}

          
          </Box>

          {user && (
            <Box sx={{ ml: 2 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user.name || 'User'} src={profilePicUrl} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {/* --- Menu Items for ALL Logged-In Users --- */}
                <MenuItem onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}>
                  <Typography>Profile</Typography>
                </MenuItem>
                
                {/* --- Role-Specific Menu Items --- */}
                {user.role === 'admin' && (
                  <MenuItem onClick={() => { navigate('/admin/admin-dashboard'); handleCloseUserMenu(); }}>
                    <Typography>Admin Dashboard</Typography>
                  </MenuItem>
                )}
                {user.role === 'tradesperson' && (
                  <MenuItem onClick={() => { navigate('/tradesperson-dashboard'); handleCloseUserMenu(); }}>
                    <Typography>My Dashboard</Typography>
                  </MenuItem>
                )}
                
                {/* --- Logout Button --- */}
                <MenuItem onClick={handleLogout}>
                  <Typography>Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}

        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;

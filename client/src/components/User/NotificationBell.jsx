import React, { useState, useEffect } from "react";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  Tooltip
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DoneAllIcon from "@mui/icons-material/DoneAll"; 
import api from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { useAuth } from "../../api/useAuth";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();


  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get("/api/notifications/");
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notifications");
      }
    };
    fetchNotifs();
  }, []);


  useEffect(() => {
    if (!user) return;
    const socket = io(import.meta.env.VITE_API_BASE_URL);
    socket.emit("addUser", user.id);

    socket.on("receiveNotification", (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);


  const handleClickNotif = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.put(`/api/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
      handleClose();
      if (notif.link) navigate(notif.link);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);
    if (unreadIds.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await Promise.all(
        unreadIds.map((id) => api.put(`/api/notifications/${id}/read`))
      );
    } catch (err) {
      console.error("Failed to mark all as read");
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 500, 
            width: 450,     
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Notifications
          </Typography>
          
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <Button
                size="small"
                onClick={handleMarkAllRead}
                startIcon={<DoneAllIcon />}
                sx={{ textTransform: "none", fontSize: "0.85rem" }}
              >
                Mark all read
              </Button>
            </Tooltip>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled sx={{ justifyContent: "center", py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notif) => (
            <MenuItem
              key={notif._id}
              onClick={() => handleClickNotif(notif)}
              sx={{
                backgroundColor: notif.isRead ? "inherit" : "#e3f2fd", 
                whiteSpace: "normal", 
                py: 1.5,
                borderBottom: "1px solid #f0f0f0",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: notif.isRead ? "normal" : "bold",
                    color: "text.primary",
                  }}
                >
                  {notif.message}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    {' - '}
                    {new Date(notif.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
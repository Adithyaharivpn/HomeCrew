import React, { useState, useEffect } from 'react';
import { 
  List, ListItem, ListItemAvatar, Avatar, ListItemText, 
  Button, Typography, Paper, Container, Chip 
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom'; 
import api from '../../api/axiosConfig'; 

const Chatroom = () => { 
  const { jobId } = useParams(); 
  const [chatRooms, setChatRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get(`/api/chat/job/${jobId}`);
        setChatRooms(res.data);
      } catch (err) {
        console.error("Error fetching chats", err);
      }
    };
    if (jobId) fetchRooms();
  }, [jobId]);

  return (
    <Container sx={{ mt: 10, mb: 5, minHeight: "45vh" }}>
      <Typography variant="h5" gutterBottom sx={{color:'black'}}>Proposals & Chats</Typography>
      {chatRooms.length === 0 ? (
        <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography>No tradespeople have contacted you yet.</Typography>
        </Paper>
      ) : (
        <List>
          {chatRooms.map((room) => (
            <Paper key={room._id} sx={{ mb: 2, p: 1 }} elevation={2}>
              <ListItem
                secondaryAction={
                  <Button 
                    variant={room.isArchived ? "outlined" : "contained"}
                    color={room.isArchived ? "error" : "primary"}
                    onClick={() => navigate(`/chat/${room._id}`)}
                    disabled={room.isArchived}
                  >
                    {room.isArchived ? "Closed" : "Open Chat"}
                  </Button>
                }
              >
                <ListItemAvatar>
                  <Avatar src={room.tradespersonId?.profilePictureUrl} />
                </ListItemAvatar>
                <ListItemText
                  primary={room.tradespersonId?.name || "Tradesperson"}
                  secondary={
                    room.isArchived 
                    ? <Chip label="Archived" size="small" /> 
                    : "Active Proposal"
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Container>
  );
};

export default Chatroom;
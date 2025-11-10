import React, { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom'; 
import io from 'socket.io-client';
import { Box, TextField, Button, Paper, Typography, List, ListItem, Container, Avatar } from '@mui/material';
import { useAuth } from '../../api/useAuth';
import api from '../../api/axiosConfig.js';

const ChatBox = () => {
  const { user } = useAuth();
  const { roomId } = useParams(); 
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  
 
  
 useEffect(() => {
    //Fetch all previous messages first
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/api/messages/${roomId}`);
        setMessages(response.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    if (roomId) {
      fetchMessages();
    }

    //connect to Socket.IO for new messages
    const newSocket = io(import.meta.env.VITE_API_BASE_URL);
    setSocket(newSocket);
    newSocket.emit('joinRoom', roomId);

    newSocket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => newSocket.disconnect();
  }, [roomId]);

const handleSendMessage = () => {
    if (currentMessage.trim() !== '' && socket) {
      const messageData = {
        roomId: roomId,
        senderId: user.id,
        sender: {
          _id: user.id,
          name: user.name,
          profilePictureUrl: user.profilePictureUrl
        },
        text: currentMessage,
      };
      socket.emit('sendMessage', messageData);

      setMessages((prevMessages) => [...prevMessages, messageData]);
      setCurrentMessage('');
    }
  };

  // const profilePicUrl = setMessages.profilePictureUrl 
  //   ? `${setMessages.profilePictureUrl}` 
  //   : null;

  return (
<Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 2, height: '500px', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6">Chat Room</Typography>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #ccc', p: 1, my: 1, bgcolor: 'grey.50' }}>
<List>
            {messages.map((msg, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  flexDirection: msg.sender._id === user.id ? 'row-reverse' : 'row',
                  alignItems: 'flex-start'
                }}
              >
                <Avatar 
                  src={msg.sender.profilePictureUrl}
                  sx={{ 
                    mx: 1, 
                    order: msg.sender._id === user.id ? 2 : 1 
                  }} 
                />
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1, 
                    bgcolor: msg.sender._id === user.id ? 'primary.light' : 'white',
                    order: 1
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {msg.sender.name}
                  </Typography>
                  <Typography>{msg.text}</Typography>
                </Paper>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} sx={{ display: 'flex' }}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
          />
          <Button type="submit" variant="contained" sx={{ ml: 1 }}>
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatBox;
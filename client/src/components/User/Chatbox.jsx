import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; 
import io from 'socket.io-client';
import { Box, TextField, Button, Paper, Typography, List, ListItem, Container } from '@mui/material';
import { useAuth } from '../../api/useAuth';

const ChatBox = () => {
  const { user } = useAuth();
  
  const { roomId } = useParams(); 
  
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');

  
  useEffect(() => {
   
    if (!roomId) return; 

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
        sender: user.name, 
        text: currentMessage,
      };
      socket.emit('sendMessage', messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]); 
      setCurrentMessage('');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6">Chat Room: {roomId}</Typography>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #ccc', p: 1, my: 1 }}>
          <List>
            {messages.map((msg, index) => (
              <ListItem key={index}>
                <Typography><strong>{msg.sender}:</strong> {msg.text}</Typography>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box sx={{ display: 'flex' }}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button variant="contained" onClick={handleSendMessage} sx={{ ml: 1 }}>
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatBox;
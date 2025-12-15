import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import {
  Box, TextField, Button, Paper, Typography, List, ListItem,
  Container, Avatar, Dialog, DialogTitle, DialogContent, DialogActions,
  Card, CardContent, Stack
} from "@mui/material";

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { useAuth } from "../../api/useAuth"; 
import api from "../../api/axiosConfig";

const ChatBox = () => {
  const { user } = useAuth();
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isArchived, setIsArchived] = useState(false); 
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        const msgRes = await api.get(`/api/chat/messages/${roomId}`);
        setMessages(msgRes.data);     
        const lastMsg = msgRes.data[msgRes.data.length - 1];
        if (lastMsg?.type === 'system' && lastMsg?.text.includes('Confirmed')) {
            setIsArchived(true);
        }

      } catch (err) {
        console.error("Chat Error", err);
        if(err.response?.status === 403) navigate('/');
      }
    };

    if (roomId) initChat();

    const newSocket = io(import.meta.env.VITE_API_BASE_URL); 
    setSocket(newSocket);
    newSocket.emit("joinRoom", roomId);

    newSocket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
      if(message.type === 'system') setIsArchived(true);
    });
    
    return () => newSocket.disconnect();
  }, [roomId, navigate]);

  const handleSendMessage = (customText = null, type = "text", extraData = {}) => {
    if(isArchived) return; 

    const textToSend = customText || currentMessage;
    if (textToSend.trim() !== "" && socket) {
      const messageData = {
        roomId,
        senderId: user.id,
        sender: { _id: user.id, name: user.name, profilePictureUrl: user.profilePictureUrl },
        text: textToSend,
        type,
        ...extraData
      };
      
      socket.emit("sendMessage", messageData);

      setMessages((prev) => [...prev, messageData]);
      if (!customText) setCurrentMessage("");
    }
  };

  const handleScheduleSubmit = async () => {
    if (!appointmentDate) return;
    try {
      const formattedDate = appointmentDate.toISOString();
      
      const response = await api.post("/api/appointments", {
        roomId,
        providerId: user.id,
        date: formattedDate,
        status: "pending",
      });

      const appointmentId = response.data._id;
      const displayDate = appointmentDate.format('MM/DD/YYYY h:mm A');

      handleSendMessage(
        `Appointment Proposed: ${displayDate}`,
        "appointment",
        { appointmentId, appointmentDate: formattedDate }
      );
      
      setIsScheduleOpen(false);
      setAppointmentDate(null);
    } catch (error) {
      console.error("Error scheduling:", error);
    }
  };

  const handleAppointmentAction = async (appointmentId, action, tradespersonId) => {
    try {
        if(action === 'confirmed') {
            
            await api.post(`/api/chat/confirm-appointment`, { 
                appointmentId, 
                tradespersonId 
            });
          
            alert("Job Confirmed! Other chats closed.");
            window.location.reload();
        } else {
             await api.put(`/api/appointments/${appointmentId}`, { status: 'rejected' });
             handleSendMessage("Appointment Proposal Declined.", "text");
        }
    } catch (error) {
        console.error("Action failed", error);
    }
  };
 

  const renderMessage = (msg) => {
    if (msg.type === "appointment") {
        const isMyMessage = msg.sender._id === user.id;
        return (
            <Card sx={{ mt: 1, minWidth: 200 }}>
                <CardContent>
                    <Typography variant="subtitle2">Appointment Request</Typography>
                    <Typography variant="body1">{new Date(msg.appointmentDate).toLocaleString()}</Typography>
                    {!isMyMessage && user.role === 'customer' && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Button variant="contained" color="success" size="small"
                                onClick={() => handleAppointmentAction(msg.appointmentId, 'confirmed', msg.sender._id)}>
                                Accept Job
                            </Button>
                            <Button variant="outlined" color="error" size="small"
                                onClick={() => handleAppointmentAction(msg.appointmentId, 'rejected', msg.sender._id)}>
                                Decline
                            </Button>
                        </Stack>
                    )}
                </CardContent>
            </Card>
        );
    }
    return <Typography>{msg.text}</Typography>;
  };

  return (
    <Container sx={{ mt: 10 }}> 
      <Paper sx={{ p: 2, height: "500px", display: "flex", flexDirection: "column" }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Private Chat {isArchived && "(Closed)"}</Typography>
          {user.role === 'tradesperson' && !isArchived && (
            <Button variant="contained" onClick={() => setIsScheduleOpen(true)}>
              Propose Time
            </Button>
          )}
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: "auto", border: "1px solid #eee", p: 1, mb: 1 }}>
          <List>
            {messages.map((msg, i) => (
              <ListItem key={i} sx={{ flexDirection: msg.sender?._id === user.id ? "row-reverse" : "row" }}>
                <Avatar src={msg.sender?.profilePictureUrl} sx={{ mx: 1 }} />
                <Paper sx={{ p: 1, bgcolor: msg.sender?._id === user.id ? "#e3f2fd" : "#f5f5f5" }}>
                    <Typography variant="caption" display="block">{msg.sender?.name}</Typography>
                    {renderMessage(msg)}
                </Paper>
              </ListItem>
            ))}
          </List>
        </Box>

       
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField 
            fullWidth size="small" 
            disabled={isArchived}
            placeholder={isArchived ? "This job has been completed/closed." : "Type a message..."}
            value={currentMessage} 
            onChange={(e) => setCurrentMessage(e.target.value)} 
          />
          <Button variant="contained" disabled={isArchived} onClick={() => handleSendMessage()}>
            Send
          </Button>
        </Box>
      </Paper>

      
      <Dialog open={isScheduleOpen} onClose={() => setIsScheduleOpen(false)}>
        <DialogTitle>Propose Time</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Select Date & Time"
              value={appointmentDate}
              onChange={(newValue) => setAppointmentDate(newValue)}
              sx={{ mt: 2, width: '100%' }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleScheduleSubmit}>Send Proposal</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChatBox;
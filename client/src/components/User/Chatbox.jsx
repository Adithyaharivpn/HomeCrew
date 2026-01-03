import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import {
  Box, TextField, Button, Paper, Typography, List, ListItem, Container,
  Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Stack,
  InputAdornment, Alert
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
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
  
  const [jobDetails, setJobDetails] = useState(null);
  const [completionCodeInput, setCompletionCodeInput] = useState("");

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [quotePrice, setQuotePrice] = useState(""); 

  useEffect(() => {
    const initData = async () => {
        try {
            const msgRes = await api.get(`/api/chat/messages/${roomId}`);
            setMessages(msgRes.data);
            const roomRes = await api.get(`/api/chat/${roomId}`);
            const realJobId = roomRes.data.jobId;

            if (realJobId) {
                const jobRes = await api.get(`/api/jobs/${realJobId}`); 
                setJobDetails(jobRes.data);
                if (jobRes.data.status === 'assigned' || jobRes.data.status === 'completed') {
                    setIsArchived(true);
                }
            }
        } catch (err) { console.error(err); }
    };
    if (roomId) initData();

    const newSocket = io(import.meta.env.VITE_API_BASE_URL);
    setSocket(newSocket);
    newSocket.emit("joinRoom", roomId);
    newSocket.on("receiveMessage", (message) => {
        if (message.sender._id !== user.id) setMessages((prev) => [...prev, message]);
        if (message.type === "system") setIsArchived(true);
    });
    return () => newSocket.disconnect();
  }, [roomId, navigate, user.id]);

  const handleScheduleSubmit = async () => {
    if (!appointmentDate || !quotePrice) return; 
    try {
      const formattedDate = appointmentDate.toISOString();
      const response = await api.post("/api/appointments", {
        roomId, providerId: user.id, date: formattedDate, status: "pending", price: Number(quotePrice) 
      });
      const appointmentId = response.data._id;
      const displayDate = appointmentDate.format("MM/DD/YYYY h:mm A");

      if(socket) {
          socket.emit("sendMessage", {
            roomId, senderId: user.id, text: `Appointment Proposed: ${displayDate} for ₹${quotePrice}`,
            type: "appointment", price: Number(quotePrice), appointmentId, appointmentDate: formattedDate
          });
      }
      setMessages(prev => [...prev, {
          sender: { _id: user.id, name: user.name, profilePictureUrl: user.profilePictureUrl },
          text: `Appointment Proposed: ${displayDate} for ₹${quotePrice}`,
          type: "appointment", price: Number(quotePrice), appointmentId, appointmentDate: formattedDate
      }]);
      setIsScheduleOpen(false); setAppointmentDate(null); setQuotePrice("");
    } catch (error) { console.error("Error scheduling:", error); }
  };

  const handleSendMessage = () => {
      if(currentMessage.trim() && socket) {
          socket.emit("sendMessage", { roomId, senderId: user.id, text: currentMessage, type: 'text' });
          setMessages(prev => [...prev, { sender: { _id: user.id, name: user.name, profilePictureUrl: user.profilePictureUrl }, text: currentMessage, type: 'text' }]);
          setCurrentMessage("");
      }
  };

  const handleAcceptBooking = async (msg) => {
      try {
          await api.post(`/api/chat/confirm-appointment`, { appointmentId: msg.appointmentId, tradespersonId: msg.sender._id });
          window.location.reload();
      } catch (err) { alert("Failed to confirm booking."); }
  };

  const handleDeclineBooking = async (appointmentId) => {
    try {
        await api.put(`/api/appointments/${appointmentId}`, { status: "rejected" });
        if(socket) {
            socket.emit("sendMessage", { roomId, senderId: user.id, text: "Appointment Declined", type: 'text' });
        }
        setMessages(prev => [...prev, { sender: { _id: user.id, name: user.name, profilePictureUrl: user.profilePictureUrl }, text: "Appointment Declined", type: 'text' }]);
    } catch (error) { console.error(error); }
  };

  const handleVerifyCode = async () => {
      try {
          await api.post(`/api/jobs/complete`, { jobId: jobDetails._id, code: completionCodeInput });
          alert("Success! Job Closed.");
          window.location.reload();
      } catch (err) { alert("Invalid Code"); }
  };

  const renderMessage = (msg) => {
    if (msg.type === "appointment") {
      const isMyMessage = msg.sender._id === user.id;
      return (
        <Card sx={{ mt: 1, minWidth: 250, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" color="primary">📅 Appointment Request</Typography>
            <Typography variant="h6" sx={{ my: 1 }}>₹{msg.price || "0"}</Typography>
            <Typography variant="body2" color="text.secondary">{new Date(msg.appointmentDate).toLocaleString()}</Typography>
            {!isMyMessage && user.role === "customer" && !isArchived && (
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button variant="contained" size="small" onClick={() => handleAcceptBooking(msg)} fullWidth>Accept</Button>
                <Button variant="outlined" color="error" size="small" onClick={() => handleDeclineBooking(msg.appointmentId)}>Decline</Button>
              </Stack>
            )}
            
            {isMyMessage && <Typography variant="caption" color="text.secondary">Waiting for response...</Typography>}
          </CardContent>
        </Card>
      );
    }
    return <Typography>{msg.text}</Typography>;
  };

  const shouldShowPayButton = user.role === "customer" && 
                              (isArchived || jobDetails?.status === 'assigned') && 
                              !jobDetails?.isPaid;

  return (
    <Container sx={{ mt: 10 , minHeight: '70vh' }}>
      <Paper sx={{ p: 0, height: "600px", display: "flex", flexDirection: "column" }}>
        
        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="h6">{jobDetails?.title || "Chat"}</Typography>
                {user.role === "tradesperson" && !isArchived && (
                    <Button variant="contained" size="small" onClick={() => setIsScheduleOpen(true)}>Propose Quote</Button>
                )}
            </Box>
            {shouldShowPayButton && (
                <Alert severity="info" action={
                    <Button 
                        color="inherit" 
                        size="small" 
                        disabled={!jobDetails?.price} 
                        onClick={() => navigate('/payment', { 
                            state: { 
                                amount: jobDetails?.price, 
                                jobId: jobDetails?._id, 
                                type: 'escrow' 
                            } 
                        })}
                    >
                        {jobDetails?.price ? `PAY NOW ₹${jobDetails.price}` : "Waiting for Price..."}
                    </Button>
                }>
                    Job confirmed. {jobDetails?.price ? "Pay to secure code." : "Error: Price not found."}
                </Alert>
            )}      

            {user.role === "customer" && jobDetails?.isPaid && !jobDetails?.isCompleted && (
                <Alert severity="success">Code: <strong>{jobDetails.completionCode}</strong></Alert>
            )}

            {user.role === "tradesperson" && jobDetails?.isPaid && !jobDetails?.isCompleted && (
                 <Box sx={{ display: 'flex', gap: 1 }}>
                     <TextField size="small" placeholder="Enter Code" value={completionCodeInput} onChange={(e) => setCompletionCodeInput(e.target.value)} />
                     <Button variant="contained" onClick={handleVerifyCode}>Finish</Button>
                 </Box>
            )}
             {jobDetails?.isCompleted && <Alert severity="success">Job Completed</Alert>}
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
          <List>
            {messages.map((msg, i) => (
              <ListItem key={i} sx={{ flexDirection: msg.sender?._id === user.id ? "row-reverse" : "row" }}>
                <Avatar src={msg.sender?.profilePictureUrl} sx={{ mx: 1 }} />
                <Paper sx={{ p: 1.5, bgcolor: msg.sender?._id === user.id ? "#e3f2fd" : "#f5f5f5" }}>
                  <Typography variant="caption">{msg.sender?.name}</Typography>
                  {renderMessage(msg)}
                </Paper>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ display: "flex", gap: 1, p: 2, bgcolor: '#f8f9fa' }}>
          <TextField fullWidth size="small" value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} />
          <Button variant="contained" onClick={handleSendMessage}>Send</Button>
        </Box>
      </Paper>

      <Dialog open={isScheduleOpen} onClose={() => setIsScheduleOpen(false)}>
        <DialogTitle>Propose Quote</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker label="Date" value={appointmentDate} onChange={setAppointmentDate} sx={{ mt: 2, width: '100%' }} />
          </LocalizationProvider>
          <TextField label="Price (₹)" type="number" fullWidth sx={{ mt: 2 }} value={quotePrice} onChange={(e) => setQuotePrice(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsScheduleOpen(false)}>Cancel</Button>
          <Button onClick={handleScheduleSubmit}>Send</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChatBox;
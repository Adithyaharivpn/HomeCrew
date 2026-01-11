import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import api from "../../api/axiosConfig";
import { useAuth } from "../../api/useAuth";

// Icons
import { 
  Send, Calendar, CheckCircle, XCircle, AlertCircle, 
  Lock, Loader2, DollarSign, ArrowLeft 
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ChatBox = () => {
  const { user } = useAuth();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isArchived, setIsArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState(null);
  const [completionCodeInput, setCompletionCodeInput] = useState("");

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [quotePrice, setQuotePrice] = useState("");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
          if (["assigned", "completed"].includes(jobRes.data.status)) {
            setIsArchived(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
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
  }, [roomId, user.id]);

  const handleSendMessage = () => {
    if (currentMessage.trim() && socket) {
      const payload = { roomId, senderId: user.id, text: currentMessage, type: "text" };
      socket.emit("sendMessage", payload);
      setMessages((prev) => [
        ...prev,
        { sender: { _id: user.id, name: user.name, profilePictureUrl: user.profilePictureUrl }, ...payload },
      ]);
      setCurrentMessage("");
    }
  };

  const handleScheduleSubmit = async () => {
    if (!appointmentDate || !quotePrice) return;
    try {
      const dateObj = new Date(appointmentDate);
      const res = await api.post("/api/appointments", {
        roomId, providerId: user.id, date: dateObj.toISOString(), status: "pending", price: Number(quotePrice),
      });
      const payload = {
        roomId, senderId: user.id, text: `Quote Proposed: ₹${quotePrice}`, 
        type: "appointment", price: Number(quotePrice), 
        appointmentId: res.data._id, appointmentDate: dateObj.toISOString(),
      };
      if (socket) socket.emit("sendMessage", payload);
      setMessages((prev) => [...prev, { sender: { ...user, _id: user.id }, ...payload }]);
      setIsScheduleOpen(false);
    } catch (error) { toast.error("Failed to propose quote"); }
  };

  const handleAcceptBooking = async (msg) => {
    try {
      await api.post(`/api/chat/confirm-appointment`, {
        appointmentId: msg.appointmentId, tradespersonId: msg.sender._id,
      });
      toast.success("Job Confirmed!");
      window.location.reload();
    } catch (err) { toast.error("Failed to confirm booking."); }
  };

  const handleVerifyCode = async () => {
    try {
      await api.post(`/api/jobs/complete`, { jobId: jobDetails._id, code: completionCodeInput });
      toast.success("Job marked as completed!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) { toast.error("Invalid Code"); }
  };

  const renderMessage = (msg) => {
    if (msg.type === "appointment") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest">
            <Calendar className="h-3 w-3" /> Proposed Quote
          </div>
          <div className="text-xl font-black italic">₹{msg.price}</div>
          <div className="text-[10px] font-bold opacity-70">{new Date(msg.appointmentDate).toLocaleString()}</div>
          {msg.sender._id !== user.id && user.role === "customer" && !isArchived && (
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] h-8 px-4 rounded-lg" onClick={() => handleAcceptBooking(msg)}>Accept</Button>
            </div>
          )}
        </div>
      );
    }
    return <p className="text-sm font-medium leading-relaxed">{msg.text}</p>;
  };

  const shouldShowPayButton = user.role === "customer" && (isArchived || jobDetails?.status === "assigned") && !jobDetails?.isPaid;

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500">
      {/* Header / Back Button */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Badge className="bg-blue-600/10 text-blue-600 border-none font-black text-[9px] tracking-[0.2em] uppercase">
          {jobDetails?.status}
        </Badge>
      </div>

      <Card className="flex-1 flex flex-col bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        {/* Chat Header */}
        <div className="p-6 border-b border-border bg-muted/20 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter italic leading-none">{jobDetails?.title}</h2>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Active Conversation</p>
            </div>
            {user.role === "tradesperson" && !isArchived && (
              <Button onClick={() => setIsScheduleOpen(true)} className="bg-blue-600 font-black text-[10px] uppercase rounded-xl h-10 px-6 border-none shadow-lg shadow-blue-500/20">
                <DollarSign className="mr-2 h-3 w-3" /> Propose Quote
              </Button>
            )}
          </div>

          {/* Action Alerts */}
          <div className="mt-4 space-y-2">
            {shouldShowPayButton && (
              <Alert className="bg-blue-600 border-none text-white rounded-2xl animate-pulse">
                <AlertDescription className="flex justify-between items-center font-black text-[11px] uppercase tracking-wide">
                  <span>Job Assigned. Secure the booking.</span>
                  <Button variant="secondary" className="h-8 font-black text-[10px]" onClick={() => navigate("/dashboard/payment", { state: { amount: jobDetails?.price, jobId: jobDetails?._id, type: "escrow" }})}>
                    PAY ₹{jobDetails.price}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {user.role === "tradesperson" && jobDetails?.isPaid && !jobDetails?.isCompleted && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Enter Customer Code:</span>
                <div className="flex gap-2">
                  <Input className="h-8 w-24 bg-background font-black text-center text-xs" value={completionCodeInput} onChange={(e) => setCompletionCodeInput(e.target.value)} />
                  <Button onClick={handleVerifyCode} className="h-8 bg-emerald-600 text-white text-[10px] font-black uppercase">Finish</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {messages.map((msg, i) => {
              const isMe = msg.sender?._id === user.id;
              return (
                <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <Avatar className="h-10 w-10 border-2 border-border shadow-md">
                      <AvatarImage src={msg.sender?.profilePictureUrl} />
                      <AvatarFallback className="font-black bg-blue-600 text-white">{msg.sender?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`p-4 rounded-[1.5rem] shadow-sm ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-muted text-foreground rounded-tl-none border border-border"}`}>
                        {renderMessage(msg)}
                      </div>
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-2 px-1">
                        {msg.sender?.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-6 bg-card border-t border-border flex gap-3">
          <Input 
            placeholder="Type your message..." 
            className="h-14 bg-background rounded-2xl px-6 font-bold focus-visible:ring-blue-600/20 border-border"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} className="h-14 w-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-600/20">
            <Send className="h-6 w-6" />
          </Button>
        </div>
      </Card>

      {/* Quote Dialog */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="bg-card border-border rounded-[2.5rem]">
          <DialogHeader><DialogTitle className="font-black uppercase tracking-tight">Propose Job Quote</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Appointment Date</label>
              <Input type="datetime-local" className="h-12 bg-muted rounded-xl" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Proposed Price (₹)</label>
              <Input type="number" placeholder="1500" className="h-12 bg-muted rounded-xl font-bold" value={quotePrice} onChange={(e) => setQuotePrice(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="font-bold uppercase text-[10px]" onClick={() => setIsScheduleOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white font-black uppercase text-[10px] px-8 rounded-xl" onClick={handleScheduleSubmit}>Send Proposal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatBox;
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../api/useAuth";
import VerifiedBadge from "../Utils/VerifiedBadge.jsx";

// Icons
import {
  MessageSquare,
  ArrowLeft,
  User,
  Loader2,
  ChevronRight,
  Lock,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Chatroom = () => {
  const { jobId } = useParams();
  const { user } = useAuth(); // Now being used for security & identity
  const [chatRooms, setChatRooms] = useState([]);
  const [jobOwnerId, setJobOwnerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/chat/job/${jobId}`);
        setChatRooms(res.data);

        // Use the first room to identify the customer/owner if available
        if (res.data.length > 0) {
          setJobOwnerId(res.data[0].customerId?._id || res.data[0].customerId);
        }
      } catch (err) {
        console.error("Error fetching chats", err);
        toast.error("Failed to load proposals");
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchRooms();
  }, [jobId]);

  // Security Check: If user is not the owner and not an admin, block the view
  const isAuthorized = user?.role === "admin" || user?.id === jobOwnerId;

  const handleViewProfile = (userId) => {
    navigate(`/dashboard/profile/${userId}`);
  };

  // If data is loaded and user is a Tradesperson trying to peek at other proposals
  if (!loading && !isAuthorized && chatRooms.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <Lock className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-black uppercase italic">Access Denied</h2>
        <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-2">
          You are not authorized to view these proposals.
        </p>
        <Button
          className="mt-6 bg-blue-600 rounded-2xl"
          onClick={() => navigate("/dashboard/jobs")}
        >
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 mb-8">
          <Button
            variant="ghost"
            className="w-fit hover:bg-muted font-bold text-muted-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase leading-none">
                  Proposals
                </h2>
                <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-[0.2em] mt-1">
                  {chatRooms.length} bids received
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="h-7 px-3 border-border font-black text-xs uppercase tracking-tighter shrink-0"
            >
              {chatRooms.length}
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-[9px]">
              Loading proposals...
            </p>
          </div>
        ) : chatRooms.length === 0 ? (
          <Card className="bg-card border-dashed border-2 border-border rounded-xl">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-muted p-4 rounded-full mb-4 text-muted-foreground">
                <User className="h-8 w-8 opacity-20" />
              </div>
              <h3 className="text-lg font-bold uppercase text-foreground tracking-tight">
                No proposals yet
              </h3>
              <p className="text-muted-foreground font-medium max-w-xs mt-2 text-xs">
                Keep your job post open. Tradespeople will contact you soon.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {chatRooms.map((room) => {
              const profile = room.tradespersonId;

              return (
                <Card
                  key={room._id}
                  className="bg-card border-border rounded-xl overflow-hidden transition-all hover:shadow-lg hover:border-blue-600/30"
                >
                  <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 w-full">
                      <Avatar
                        className="h-16 w-16 border-3 border-background shadow-lg cursor-pointer hover:scale-105 transition-transform shrink-0"
                        onClick={() => handleViewProfile(profile?._id)}
                      >
                        <AvatarImage src={profile?.profilePictureUrl} />
                        <AvatarFallback className="bg-blue-600 text-white font-black text-lg uppercase">
                          {profile?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col gap-2 text-left flex-1 min-w-0">
                        <div
                          className="flex items-center gap-2 font-black text-lg uppercase tracking-tighter text-foreground cursor-pointer hover:text-blue-600 transition-colors truncate"
                          onClick={() => handleViewProfile(profile?._id)}
                        >
                          <span className="truncate">
                            {profile?.name || "Anonymous User"}
                          </span>
                          <VerifiedBadge isVerified={profile?.isVerified} />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {room.isArchived ? (
                            <Badge className="bg-slate-600 text-white uppercase text-[8px] px-2 py-0.5 font-black tracking-widest border-none">
                              Archived
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-600 text-white uppercase text-[8px] px-2 py-0.5 font-black tracking-widest border-none">
                              Active
                            </Badge>
                          )}
                          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest hidden md:inline">
                            Profile Review
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      className={`font-black rounded-lg px-6 h-10 uppercase text-[9px] tracking-widest shadow-md transition-all active:scale-95 shrink-0 ${
                        room.isArchived
                          ? "bg-muted text-muted-foreground cursor-not-allowed border-none"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 border-none"
                      }`}
                      onClick={() =>
                        !room.isArchived &&
                        navigate(`/dashboard/chat/${room._id}`)
                      }
                      disabled={room.isArchived}
                    >
                      {room.isArchived ? "Closed" : "Message"}{" "}
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatroom;

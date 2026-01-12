
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../api/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCheck, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

import { useNotifications } from "../../api/NotificationProvider";

const timeAgo = (dateString) => {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "Just now";
  let interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "Just now";
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All marked as read");
    } catch (err) {
      toast.error("Failed to update");
    }
  };
  
  const handleNotifClick = async (n) => {
    await markAsRead(n._id);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="container mx-auto max-w-4xl py-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/10 rounded-2xl">
                <Bell className="h-8 w-8 text-blue-600" />
            </div>
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tight">Notifications</h1>
                <p className="text-muted-foreground font-medium">Updates and Alerts</p>
            </div>
        </div>
        
        {notifications.length > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead} className="rounded-xl border-border font-bold uppercase text-xs">
                <CheckCheck className="mr-2 h-4 w-4" /> Mark All Read
            </Button>
        )}
      </div>

      <Card className="border-border bg-card shadow-xl rounded-[2.5rem] overflow-hidden min-h-[500px]">
        <ScrollArea className="h-[600px] p-0">
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground gap-4">
                    <Bell className="h-16 w-16 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-sm">No new notifications</p>
                </div>
            ) : (
                <div className="divide-y divide-border/50">
                    {notifications.map((n) => (
                        <div 
                            key={n._id} 
                            onClick={() => handleNotifClick(n)}
                            className={`p-6 flex items-start gap-4 hover:bg-muted/30 transition-colors cursor-pointer group ${!n.isRead ? "bg-blue-600/5" : ""}`}
                        >
                            <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${!n.isRead ? "bg-blue-600 animate-pulse" : "bg-muted-foreground/30"}`} />
                            <div className="flex-1 space-y-1">
                                <p className={`text-sm leading-relaxed ${!n.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                                    {n.message}
                                </p>
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                    {timeAgo(n.createdAt)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {!n.isRead && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(n._id);
                                        }}
                                        className="h-9 w-9 rounded-xl hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                                    >
                                        <CheckCheck className="h-4 w-4" />
                                    </Button>
                                )}
                                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ScrollArea>
      </Card>
    </div>
  );
};

export default NotificationsPage;

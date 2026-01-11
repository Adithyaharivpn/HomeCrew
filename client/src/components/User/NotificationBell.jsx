import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import api from "../../api/axiosConfig";
import { useAuth } from "../../api/useAuth";

// Icons
import { Bell, CheckCheck, Inbox } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false); // Controls the popover
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- Initial Fetch ---
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

  // --- Socket.io Listener ---
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

  // --- Handlers ---

  const handleClickNotif = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.put(`/api/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
      setOpen(false); // Close popover
      if (notif.link) navigate(notif.link);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);
    if (unreadIds.length === 0) return;

    // Optimistic update
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6 text-foreground" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[380px] p-0 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-card">
          <h4 className="font-semibold text-foreground">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50/10"
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <Separator />

        {/* List */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Inbox className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <button
                  key={notif._id}
                  onClick={() => handleClickNotif(notif)}
                  className={`w-full text-left px-4 py-3 border-b border-border/40 transition-colors last:border-0
                    ${
                      notif.isRead
                        ? "bg-card hover:bg-muted"
                        : "bg-blue-50/60 dark:bg-blue-900/30 hover:brightness-105"
                    }
                  `}
                >
                  <div className="flex flex-col gap-1">
                    <p
                      className={`text-sm leading-snug ${
                        notif.isRead
                          ? "text-muted-foreground"
                          : "text-foreground font-semibold"
                      }`}
                    >
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleDateString()} •{" "}
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;

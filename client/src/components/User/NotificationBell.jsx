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

import { useNotifications } from "../../api/NotificationProvider";

const NotificationBell = ({ children, isSolid }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClickNotif = async (notif) => {
    await markAsRead(notif._id);
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ? (
          <div className="relative cursor-pointer w-full">
            {children}
          </div>
        ) : (
          <Button variant="ghost" size="icon" className={`relative rounded-xl hover:bg-muted transition-colors ${isSolid ? 'text-foreground' : 'text-white'}`}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-red-600 rounded-full border-2 border-background animate-pulse" />
            )}
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0 bg-card border-border rounded-2xl shadow-2xl overflow-hidden mt-2">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-muted/20">
          <h4 className="font-black uppercase text-[10px] tracking-widest text-foreground">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 px-3 font-black uppercase text-[9px] tracking-widest text-blue-600 hover:text-blue-700 hover:bg-blue-500/10 rounded-lg"
            >
              <CheckCheck className="mr-2 h-3.5 w-3.5" />
              Mark as read
            </Button>
          )}
        </div>

        <Separator className="bg-border/50" />

        {/* List */}
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-muted-foreground opacity-50">
              <Inbox className="h-10 w-10 mb-3" />
              <p className="font-black uppercase text-[9px] tracking-widest">No activity found</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <button
                  key={notif._id}
                  onClick={() => handleClickNotif(notif)}
                  className={`w-full text-left px-5 py-4 border-b border-border/40 transition-all hover:bg-muted
                    ${
                      !notif.isRead
                        ? "bg-blue-500/5 dark:bg-blue-400/5"
                        : "opacity-70"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <p className={`text-xs font-bold leading-normal ${!notif.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2">
                           {!notif.isRead && <span className="h-1.5 w-1.5 bg-blue-600 rounded-full" />}
                           <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                             {new Date(notif.createdAt).toLocaleDateString()}
                           </span>
                      </div>
                    </div>
                    {!notif.isRead && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif._id);
                        }}
                        className="h-8 w-8 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 transition-colors shrink-0"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t border-border/50 bg-muted/10 text-center">
            <Button variant="ghost" onClick={() => { navigate('/dashboard/notifications'); setOpen(false); }} className="w-full h-8 font-black uppercase text-[9px] tracking-widest text-muted-foreground hover:text-foreground">
                View Full Archive
            </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;

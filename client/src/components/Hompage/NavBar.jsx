import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../api/useAuth"; 
import api from "../../api/axiosConfig"; 
import { useTheme } from "../Utils/Themeprovider";

// UI Components
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../Utils/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Icons
import { 
  LogOut, 
  User, 
  Bell, 
  History, 
  CreditCard, 
  LayoutDashboard, 
  CheckCheck, 
  Zap 
} from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";

// --- Helper Function for Time Formatting ---
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

const NavBar = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]); 

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const isHomePage = location.pathname === "/";
  const isSolid = !isHomePage || isScrolled;

  // --- LOGIC: Notifications & Polling ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Fetch unread count and recent notifications
        const [notifRes, countRes] = await Promise.all([
          api.get("/api/notifications").catch(() => ({ data: [] })),
          api.get("/api/chat/unread-count").catch(() => ({ data: { count: 0 } }))
        ]);
        
        setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
        setUnreadCount(countRes.data.count || 0);
      } catch (err) {
        console.error("NavBar Data Fetch Failed");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // Poll every 15s

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, [user]);

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await api.put("/api/notifications/mark-read"); 
      setNotifications([]);
      setUnreadCount(0);
      toast.success("Inbox Cleared");
    } catch (err) { toast.error("Action Failed"); }
  };

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-500 border-b ${
      isSolid ? "bg-background/95 border-border backdrop-blur-md shadow-sm py-3" : "bg-transparent border-transparent py-5"
    }`}>
      <div className="container mx-auto flex items-center justify-between px-6">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
             <Zap className="h-5 w-5 text-white fill-white" />
          </div>
          <span className={`text-2xl font-black tracking-tighter uppercase  transition-colors duration-500 ${
            isSolid ? "text-foreground" : "text-white"
          }`}>
            HomeCrew
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-5">
          <ModeToggle />
          
          {user ? (
            <div className="flex items-center gap-3 md:gap-5">
              
              {/* Dashboard Link */}
              <Link to="/dashboard">
                <Button variant="ghost" className={`font-black uppercase text-[10px] tracking-widest hidden sm:flex ${
                  isSolid ? "text-foreground" : "text-white"
                }`}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </Button>
              </Link>

              {/* NOTIFICATIONS DROPDOWN */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={`relative rounded-xl hover:bg-muted transition-colors ${
                    isSolid ? "text-foreground" : "text-white"
                  }`}>
                    <Bell className="h-5 w-5" />
                    {(unreadCount > 0 || notifications.length > 0) && (
                      <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-red-600 rounded-full border-2 border-background animate-pulse" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 mt-4 bg-card border-border rounded-2xl shadow-2xl p-0 overflow-hidden" align="end">
                  <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border">
                    <span className="font-black uppercase text-[10px] tracking-widest ">Signal Inbox</span>
                    {notifications.length > 0 && (
                      <button onClick={handleMarkAllAsRead} className="text-[9px] font-black uppercase text-blue-500 hover:text-blue-600">
                        Dismiss All
                      </button>
                    )}
                  </div>
                  <ScrollArea className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center flex flex-col items-center gap-2">
                        <CheckCheck className="h-8 w-8 text-muted-foreground opacity-20" />
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">System Clear</span>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <DropdownMenuItem 
                          key={n._id} 
                          onSelect={() => navigate(n.link || "/dashboard")}
                          className="p-5 flex flex-col items-start gap-1 cursor-pointer border-b border-border/50 last:border-0 hover:bg-muted/50"
                        >
                          <p className="text-xs font-bold leading-tight text-foreground">{n.message}</p>
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{timeAgo(n.createdAt)}</span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* PROFILE DROPDOWN */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-11 w-11 rounded-2xl border-2 border-border/50 p-0 overflow-hidden shadow-inner group">
                    <Avatar className="h-full w-full rounded-none">
                      <AvatarImage src={user.profilePictureUrl} />
                      <AvatarFallback className="bg-blue-600 text-white font-black text-xs uppercase">{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mt-4 bg-card border-border rounded-2xl shadow-2xl overflow-hidden" align="end">
                  <DropdownMenuLabel className="p-6 bg-muted/20 border-b border-border">
                    <p className="text-sm font-black uppercase  tracking-tight">{user.name}</p>
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1">{user.role}</p>
                  </DropdownMenuLabel>
                  <div className="p-2">
                    <DropdownMenuItem onSelect={() => navigate("/dashboard")} className="py-4 px-4 rounded-xl cursor-pointer font-bold text-xs uppercase tracking-widest">
                      <User className="mr-3 h-4 w-4 text-muted-foreground" /> Account Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => navigate("/dashboard/history")} className="py-4 px-4 rounded-xl cursor-pointer font-bold text-xs uppercase tracking-widest">
                      <History className="mr-3 h-4 w-4 text-muted-foreground" /> Activity logs
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => navigate("/dashboard/billing")} className="py-4 px-4 rounded-xl cursor-pointer font-bold text-xs uppercase tracking-widest">
                      <CreditCard className="mr-3 h-4 w-4 text-muted-foreground" /> Financials
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem onSelect={logout} className="py-4 px-4 rounded-xl text-red-500 font-black uppercase text-[10px] tracking-[0.2em] cursor-pointer hover:bg-red-500/10">
                      <LogOut className="mr-3 h-4 w-4" /> Terminate Session
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          ) : (
            /* Logged Out State */
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className={`font-black uppercase text-[10px] tracking-widest ${
                  isSolid ? "text-foreground" : "text-white"
                }`}>
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="rounded-xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest px-8 h-11 shadow-lg shadow-blue-500/20 border-none">
                  Establish Profile
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
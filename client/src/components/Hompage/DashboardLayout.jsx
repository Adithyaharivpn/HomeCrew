import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Briefcase, MessageSquare, 
  ShieldCheck, User, Zap, Wallet, Map as MapIcon, 
  List, CreditCard, Users, Terminal, LogOut, ArrowLeft, Sun, Moon, Bell
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "../../api/useAuth";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "../Utils/Themeprovider";
import { useNotifications } from "../../api/NotificationProvider";
import NotificationBell from "../User/NotificationBell";

const Logo = () => {
    return (
      <Link
        to="/"
        className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
      >
        <div className="h-5 w-6 bg-foreground dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0 flex items-center justify-center">
            <Zap className="h-3 w-3 text-background dark:text-black" />
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-medium text-foreground whitespace-pre"
        >
          HomeCrew
        </motion.span>
      </Link>
    );
  };
  
  const LogoIcon = () => {
    return (
      <Link
        to="/"
        className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
      >
        <div className="h-5 w-6 bg-foreground dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0 flex items-center justify-center">
             <Zap className="h-3 w-3 text-background dark:text-black" />
        </div>
      </Link>
    );
  };

const DashboardLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { setTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  
  // Define menu items per role
  const roleMenus = {
    admin: [
      { label: "Overview", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0 text-foreground" /> },
      { label: "Users", href: "/dashboard/admin-panel", icon: <Users className="h-5 w-5 flex-shrink-0 text-foreground" /> },
      { 
        label: "Notifications", 
        icon: <Bell className="h-5 w-5 flex-shrink-0 text-foreground" />,
        badge: unreadCount 
      },
      { label: "System Logs", href: "/dashboard/system-logs", icon: <Terminal className="h-5 w-5 flex-shrink-0 text-foreground" /> },
      { label: "Verify", href: "/dashboard/verifications", icon: <ShieldCheck className="h-5 w-5 flex-shrink-0 text-foreground" /> },
      { label: "Market", href: "/dashboard/jobs", icon: <List className="h-5 w-5 flex-shrink-0 text-foreground" /> },
    ],
    tradesperson: [
      { label: "Overview", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0 text-foreground" /> },
      { 
        label: "Notifications", 
        icon: <Bell className="h-5 w-5 flex-shrink-0 text-foreground" />,
        badge: unreadCount 
      },
      { label: "Market", href: "/dashboard/jobs", icon: <List className="h-5 w-5 flex-shrink-0 text-foreground" /> },
      { label: "Map", href: "/dashboard/map", icon: <MapIcon className="h-5 w-5 flex-shrink-0 text-foreground" /> },
      { label: "Wallet", href: "/dashboard/billing", icon: <Wallet className="h-5 w-5 flex-shrink-0 text-foreground" /> },
      // Conditionally add Verify
      ...(!user?.isVerified ? [{ label: "Verify", href: "/dashboard/get-verified", icon: <ShieldCheck className="h-5 w-5 flex-shrink-0 text-foreground" /> }] : []),
    ],
    customer: [
      { label: "Overview", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0 text-foreground" /> },
      { 
        label: "Notifications", 
        icon: <Bell className="h-5 w-5 flex-shrink-0 text-foreground" />,
        badge: unreadCount 
      },
      { label: "Market", href: "/dashboard/jobs", icon: <List className="h-5 w-5 flex-shrink-0 text-foreground" /> },
      { label: "Post Job", href: "/dashboard/post-job", icon: <Briefcase className="h-5 w-5 flex-shrink-0 text-foreground" /> },
      { label: "Payments", href: "/dashboard/billing", icon: <CreditCard className="h-5 w-5 flex-shrink-0 text-foreground" /> },
    ]
  };

  const menuItems = (user && roleMenus[user.role]) ? roleMenus[user.role] : [];

  // Add Profile and Logout
  const commonLinks = [
      { label: "Profile", href: "/dashboard/profile", icon: <User className="h-5 w-5 flex-shrink-0 text-foreground" /> },
  ];

  return (
    <div className={cn(
        "flex flex-col md:flex-row bg-background w-full flex-1 mx-auto overflow-hidden",
        "h-screen" 
      )}>
        <Sidebar open={open} setOpen={setOpen}>
            <SidebarBody className="justify-between gap-10">
                <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    {open ? <Logo /> : <LogoIcon />}
                    <div className="mt-8 flex flex-col gap-2">
                        {menuItems.map((link, idx) => {
                            if (link.label === "Notifications") {
                                return (
                                    <NotificationBell key={idx}>
                                        <SidebarLink link={link} />
                                    </NotificationBell>
                                );
                            }
                            return <SidebarLink key={idx} link={link} />;
                        })}
                        {commonLinks.map((link, idx) => (
                            <SidebarLink key={`common-${idx}`} link={link} />
                        ))}
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center justify-start gap-2 group/sidebar py-2 cursor-pointer">
                                    <div className="h-5 w-5 flex-shrink-0 relative"> 
                                        <Sun className="h-5 w-5 absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
                                        <Moon className="h-5 w-5 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
                                    </div>
                                    <motion.span 
                                        animate={{ display: open ? "inline-block" : "none", opacity: open ? 1 : 0 }}
                                        className="text-foreground text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                                    >
                                        Theme
                                    </motion.span>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="ml-10 bg-card border-border"> 
                                 <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">Light</DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">Dark</DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">System</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                         <div onClick={logout} className="cursor-pointer">
                            <SidebarLink link={{
                                label: "Log Out",
                                href: "#", // Dummy
                                icon: <LogOut className="h-5 w-5 flex-shrink-0 text-foreground" />
                            }} />
                        </div>
                    </div>
                </div>
                <div>
                   <SidebarLink
                    link={{
                        label: user?.name || "User",
                        href: "/dashboard/profile",
                        icon: (
                        <div className="h-7 w-7 flex-shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-xs uppercase">
                            {user?.name?.charAt(0)}
                        </div>
                        ),
                    }}
                    />
                </div>
            </SidebarBody>
        </Sidebar>
        
        {/* MAIN CONTENT AREA */}
        <div className="flex flex-1 overflow-hidden relative bg-background border-l border-neutral-200 dark:border-neutral-700 rounded-tl-2xl">
          {location.pathname.includes("/map") ? (
            <div className="h-full w-full p-0">
               <Outlet />
            </div>
          ) : (
            <ScrollArea className="h-full w-full">
              <div className="mx-auto h-full w-full p-2 md:p-10 transition-all duration-300">
                <Outlet />
              </div>
            </ScrollArea>
          )}
        </div>
    </div>
  );
};

export default DashboardLayout;
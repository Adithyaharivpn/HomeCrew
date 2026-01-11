import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, Briefcase, Settings, 
  Wallet, ShieldCheck, List, Map as MapIcon, CreditCard, User
} from "lucide-react";
import { cn } from "@/lib/utils";

const DashboardSidebar = ({ role, userId }) => {
  const location = useLocation();

  const menuItems = {
    admin: [
      { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
      { label: "User Management", icon: Users, path: "/dashboard/admin-panel" },
      { label: "Verifications", icon: ShieldCheck, path: "/dashboard/verifications" },
      { label: "Marketplace", icon: List, path: "/dashboard/jobs" },
    ],
    tradesperson: [
      { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
      { label: "Marketplace", icon: List, path: "/dashboard/jobs" },
      { label: "Map Search", icon: MapIcon, path: "/dashboard/map" },
      { label: "Earnings", icon: Wallet, path: "/dashboard/billing" },
    ],
    customer: [
      { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
      { label: "Marketplace", icon: List, path: "/dashboard/jobs" },
      { label: "Post New Job", icon: Briefcase, path: "/dashboard/post-job" },
      { label: "Payments", icon: CreditCard, path: "/dashboard/billing" },
    ]
  };

  const links = menuItems[role] || [];

  return (
    <div className="w-72 bg-card border-r border-border h-screen flex flex-col sticky top-0">
      <div className="p-8">
        <h2 className="text-xl font-black  tracking-tighter ">Home<span className="text-blue-600">Crew</span></h2>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all",
              location.pathname === link.path ? "bg-blue-600 text-white shadow-lg" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        {/* Fix for Profile/Settings */}
        <Link 
          to={`/dashboard/profile/${userId}`}
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest text-muted-foreground hover:bg-muted"
        >
          <User className="h-4 w-4" /> My Profile
        </Link>
      </div>
    </div>
  );
};

export default DashboardSidebar;
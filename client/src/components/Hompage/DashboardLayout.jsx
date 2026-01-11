import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Briefcase, MessageSquare, 
  ShieldCheck, User, Zap 
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavBar from "../Hompage/NavBar";

const DashboardLayout = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Home", path: "/dashboard", icon: LayoutDashboard },
    { name: "Jobs", path: "/dashboard/jobs", icon: Briefcase },
    { name: "Chat", path: "/dashboard/messages", icon: MessageSquare },
    { name: "Verify", path: "/dashboard/get-verified", icon: ShieldCheck },
    { name: "Profile", path: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* GLOBAL TOP NAV */}
      <NavBar />
      
      <div className="flex flex-1 pt-20 pb-20 md:pb-0 h-screen overflow-hidden">
        
        {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
        <aside className="hidden md:flex w-72 border-r border-border bg-card flex-col">
          <div className="p-8 space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="text-xl font-black uppercase  tracking-tighter">HomeCrew</span>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                    location.pathname === item.path 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[11px] uppercase tracking-widest font-black">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full w-full">
            <div className="p-4 md:p-10 max-w-5xl mx-auto">
              <Outlet />
            </div>
          </ScrollArea>
        </main>

        {/* MOBILE BOTTOM NAVIGATION (Hidden on Desktop) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border px-4 pb-6 pt-3">
          <div className="flex justify-between items-center max-w-md mx-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className="flex flex-col items-center gap-1 min-w-[64px]"
                >
                  <div className={`p-2 rounded-xl transition-all ${
                    isActive ? "bg-blue-600 text-white" : "text-muted-foreground"
                  }`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${
                    isActive ? "text-blue-600" : "text-muted-foreground"
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

      </div>
    </div>
  );
};

export default DashboardLayout;
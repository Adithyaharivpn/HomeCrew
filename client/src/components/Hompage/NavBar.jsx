import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../api/useAuth";
import { useTheme } from "../Utils/Themeprovider";

// UI Components
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../Utils/ModeToggle";
import MobileNav from "./MobileNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import {
  LogOut,
  User,
  Bell,
  History,
  CreditCard,
  LayoutDashboard,
  CheckCheck,
  Zap,
} from "lucide-react";
import NotificationBell from "../User/NotificationBell";

const NavBar = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = location.pathname === "/";
  const isSolid = !isHomePage || isScrolled;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-500 border-b ${
        isSolid
          ? "bg-background/95 border-border backdrop-blur-md shadow-sm py-3"
          : "bg-transparent border-transparent py-5"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Zap className="h-5 w-5 text-white fill-white" />
          </div>
          <span
            className={`text-2xl font-bold tracking-tight transition-colors duration-500 ${
              isSolid ? "text-foreground" : "text-white"
            }`}
          >
            HomeCrew
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-5">
          <div className="hidden md:block">
            <ModeToggle isSolid={isSolid} />
          </div>

          {user ? (
            <div className="flex items-center gap-3 md:gap-5">
              {/* Dashboard Link */}
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  className={`font-semibold text-xs hidden sm:flex ${
                    isSolid ? "text-foreground" : "text-white"
                  }`}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </Button>
              </Link>

              {/* NOTIFICATIONS DROPDOWN */}
              <div className="hidden md:block">
                <NotificationBell isSolid={isSolid} />
              </div>

              {/* PROFILE DROPDOWN */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-11 w-11 rounded-2xl border-2 border-border/50 p-0 overflow-hidden shadow-inner group"
                  >
                    <Avatar className="h-full w-full rounded-none">
                      <AvatarImage src={user.profilePictureUrl} />
                      <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                        {user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 mt-4 bg-card border-border rounded-2xl shadow-2xl overflow-hidden"
                  align="end"
                >
                  <DropdownMenuLabel className="p-6 bg-muted/20 border-b border-border">
                    <p className="text-sm font-bold">{user.name}</p>
                    <p className="text-[10px] font-semibold text-blue-500 mt-1 capitalize">
                      {user.role}
                    </p>
                  </DropdownMenuLabel>
                  <div className="p-2">
                    <DropdownMenuItem
                      onSelect={() => navigate("/dashboard/profile")}
                      className="py-4 px-4 rounded-xl cursor-pointer font-semibold text-xs"
                    >
                      <User className="mr-3 h-4 w-4 text-muted-foreground" />{" "}
                      Account Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onSelect={() => navigate("/dashboard/billing")}
                      className="py-4 px-4 rounded-xl cursor-pointer font-semibold text-xs"
                    >
                      <CreditCard className="mr-3 h-4 w-4 text-muted-foreground" />{" "}
                      Financials
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      onSelect={logout}
                      className="py-4 px-4 rounded-xl text-red-500 font-bold text-xs cursor-pointer hover:bg-red-500/10"
                    >
                      <LogOut className="mr-3 h-4 w-4" /> Terminate Session
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Dropdown Ends */}
            </div>
          ) : (
            /* Logged Out State */
            <div className="flex items-center gap-2 md:gap-3">
              <Link to="/login">
                <Button
                  variant="ghost"
                  className={`font-semibold text-xs ${
                    isSolid ? "text-foreground" : "text-white"
                  }`}
                >
                  Log In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="rounded-xl bg-blue-600 text-white font-bold text-xs px-4 md:px-8 h-10 md:h-11 shadow-lg shadow-blue-500/20 border-none">
                  <span className="md:hidden">Join</span>
                  <span className="hidden md:inline">Establish Profile</span>
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Navigation */}
          <MobileNav user={user} isSolid={isSolid} />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

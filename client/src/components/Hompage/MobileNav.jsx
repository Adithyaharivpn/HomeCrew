import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "../Utils/ModeToggle";
import { Bell } from "lucide-react";

const MobileNav = ({ user, isSolid }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`md:hidden ${isSolid ? "text-foreground" : "text-white"}`}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-60 bg-background text-foreground border-r-border"
      >
        <SheetHeader>
          <SheetTitle className="text-foreground text-left">Pages</SheetTitle>
        </SheetHeader>
        <Separator className="my-4 bg-border" />

        <div className="flex flex-col gap-2">
          {/* Mobile Specific Controls */}
          <div className="flex items-center justify-between px-2 py-2">
            <span className="text-sm font-medium">Theme</span>
            <ModeToggle isSolid={true} />
          </div>

          {user && (
            <Button
              onClick={() => setIsOpen(false)}
              asChild
              variant="ghost"
              className="justify-start w-full hover:bg-muted hover:text-foreground"
            >
              <Link to="/dashboard/notifications">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Link>
            </Button>
          )}

          <Separator className="my-2 bg-border" />
          {!user ? (
            <>
              <Button
                onClick={() => setIsOpen(false)}
                asChild
                variant="ghost"
                className="justify-start w-full hover:bg-muted hover:text-foreground"
              >
                <Link to="/signup">Signup</Link>
              </Button>
              <Separator className="bg-border" />
              <Button
                onClick={() => setIsOpen(false)}
                asChild
                variant="ghost"
                className="justify-start w-full hover:bg-muted hover:text-foreground"
              >
                <Link to="/login">Login</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setIsOpen(false)}
                asChild
                variant="ghost"
                className="justify-start w-full hover:bg-muted hover:text-foreground"
              >
                <Link to="/dashboard">Dashboard</Link>
              </Button>

              {user.role === "customer" && (
                <Button
                  onClick={() => setIsOpen(false)}
                  asChild
                  className="justify-start w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link to="/dashboard/post-job">Post a Job</Link>
                </Button>
              )}

              <Button
                onClick={() => setIsOpen(false)}
                asChild
                variant="ghost"
                className="justify-start w-full hover:bg-muted hover:text-foreground"
              >
                <Link to="/dashboard/jobs">Browse Jobs</Link>
              </Button>

              {user.role === "tradesperson" && (
                <Button
                  onClick={() => setIsOpen(false)}
                  asChild
                  variant="ghost"
                  className="justify-start w-full hover:bg-muted hover:text-foreground"
                >
                  <Link to="/dashboard/active-works">My Active Jobs</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;

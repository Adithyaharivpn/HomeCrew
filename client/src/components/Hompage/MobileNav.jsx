import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const MobileNav = ({ user }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-white">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] bg-slate-900 text-white border-r-slate-800">
        <SheetHeader>
          <SheetTitle className="text-white text-left">Pages</SheetTitle>
        </SheetHeader>
        <Separator className="my-4 bg-slate-700" />
        
        <div className="flex flex-col gap-2">
          {!user ? (
            <>
              <Button asChild variant="ghost" className="justify-start w-full">
                <Link to="/signup">Signup</Link>
              </Button>
              <Separator className="bg-slate-700" />
              <Button asChild variant="ghost" className="justify-start w-full">
                <Link to="/login">Login</Link>
              </Button>
            </>
          ) : (
            <>
               <Button asChild variant="ghost" className="justify-start w-full hover:bg-slate-800 hover:text-white">
                <Link to="/dashboard">Dashboard</Link>
              </Button>

              {user.role === "customer" && (
                <Button asChild className="justify-start w-full bg-blue-600 hover:bg-blue-700">
                  <Link to="/dashboard/post-job">Post a Job</Link>
                </Button>
              )}
              
              <Button asChild variant="ghost" className="justify-start w-full hover:bg-slate-800 hover:text-white">
                <Link to="/dashboard/jobs">Browse Jobs</Link>
              </Button>

              {user.role === "tradesperson" && (
                <Button asChild variant="ghost" className="justify-start w-full hover:bg-slate-800 hover:text-white">
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
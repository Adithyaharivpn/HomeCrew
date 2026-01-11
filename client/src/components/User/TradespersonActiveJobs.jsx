import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../api/useAuth";
import Confetti from "react-confetti";

// Icons
import {
  MapPin,
  Briefcase,
  Clock,
  ArrowRight,
  Map as MapIcon,
  Loader2,
  Star,
  Plus,
} from "lucide-react";

import JobActionController from "../User/JobActionController";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const timeAgo = (dateString) => {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "Just now";
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  return Math.floor(seconds / 60) + "m ago";
};

const JobsPage = () => {
  const [jobs, setJobs] = useState([]); // Global Feed or User's posted jobs
  const [myWorks, setMyWorks] = useState([]); // Specifically for Tradesperson's assigned/completed jobs
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [activeTab, setActiveTab] = useState("open");

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Modal States
  const [codeDialog, setCodeDialog] = useState({ open: false, code: "" });
  const [reviewDialog, setReviewDialog] = useState({ open: false, jobId: null, targetId: null });
  const [verifyDialog, setVerifyDialog] = useState({ open: false, jobId: null, customerId: null });
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Step 1: Get the main job list (Feed for tradesperson, My Jobs for customer)
        let mainUrl = user?.role === "customer" ? "/api/jobs/userjob" : "/api/jobs/feed";
        const promises = [api.get(mainUrl), api.get("/api/service/")];
        
        // Step 2: If tradesperson, fetch their specific dashboard data (My Works)
        if (user?.role === "tradesperson") {
          promises.push(api.get("/api/jobs/tradesperson/my-works"));
        }
        
        const [mainRes, serviceRes, worksRes] = await Promise.all(promises);
        
        setJobs(mainRes.data || []);
        setCategoryOptions(serviceRes.data || []);
        if (worksRes) setMyWorks(worksRes.data || []);

      } catch (error) {
        if (error.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, logout]);

  // --- LOGIC: COUNTS ---
  const getCounts = (tabType) => {
    if (tabType === "open") return jobs.filter(j => j.status === "open").length;
    
    // For Active and History, we check myWorks for tradespeople and jobs for customers
    const source = user?.role === "tradesperson" ? myWorks : jobs;
    if (tabType === "active") return source.filter(j => j.status === "assigned" || j.status === "in_progress").length;
    if (tabType === "history") return source.filter(j => j.status === "completed" || j.status === "cancelled").length;
    return 0;
  };

  // --- LOGIC: VERIFY & COMPLETE ---
  const handleVerifySubmit = async () => {
    try {
      await api.post("/api/jobs/complete", { jobId: verifyDialog.jobId, code: verifyCode });
      toast.success("Work Verified & Completed!");
      
      const completedJobId = verifyDialog.jobId;
      const completedCustomerId = verifyDialog.customerId;

      // Update local state so it moves to History tab instantly
      setMyWorks(prev => prev.map(j => j._id === completedJobId ? { ...j, status: "completed" } : j));
      
      setVerifyDialog({ open: false, jobId: null, customerId: null });
      setVerifyCode("");
      setShowConfetti(true);

      // Trigger Review for the tradesperson to rate the customer
      setTimeout(() => {
        setShowConfetti(false);
        setReviewDialog({ open: true, jobId: completedJobId, targetId: completedCustomerId });
      }, 3000);

    } catch (err) {
      toast.error("Invalid verification code.");
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) return toast.warning("Please select stars");
    try {
      await api.post("/api/reviews", { 
        jobId: reviewDialog.jobId, 
        targetUserId: reviewDialog.targetId, 
        rating, 
        comment 
      });
      toast.success("Review Saved!");
      setReviewDialog({ open: false, jobId: null, targetId: null });
      setRating(0); setComment("");
    } catch {
      toast.error("Review failed.");
    }
  };

  // --- FILTERING LOGIC ---
  const getFilteredJobs = () => {
    // Determine which list to use
    let source = (user?.role === "tradesperson" && activeTab !== "open") ? myWorks : jobs;

    return source.filter((job) => {
      const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "All" || job.category === categoryFilter;
      
      let matchesTab = false;
      if (activeTab === "open") matchesTab = job.status === "open";
      else if (activeTab === "active") matchesTab = (job.status === "assigned" || job.status === "in_progress");
      else if (activeTab === "history") matchesTab = (job.status === "completed" || job.status === "cancelled");
      
      return matchesSearch && matchesCategory && matchesTab;
    });
  };

  const sortedJobs = [...getFilteredJobs()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="bg-background pt-32 min-h-screen relative transition-colors duration-500">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} className="z-[100]" />}

      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tight">
            {user?.role === "customer" ? "My Posted Jobs" : "Jobs Marketplace"}
          </h1>
          {user?.role === "customer" && (
            <Button onClick={() => navigate("/jobposting")} className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl h-12 px-8 shadow-lg">
              <Plus className="mr-2 h-6 w-6" /> Post a Job
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-12 bg-card border-border rounded-xl" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[250px] h-12 bg-card border-border rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="All">All Categories</SelectItem>
              {categoryOptions.map((cat) => <SelectItem key={cat._id} value={cat.service_name}>{cat.service_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs with Badge Counts */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-10">
          <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-2xl h-14 border border-border">
            <TabsTrigger value="open" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-card font-black">
              {user?.role === "tradesperson" ? "Available" : "Open"} 
              <Badge variant="secondary" className="ml-1 text-[10px] h-5">{getCounts("open")}</Badge>
            </TabsTrigger>
            <TabsTrigger value="active" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-card font-black">
              Active <Badge variant="secondary" className="ml-1 text-[10px] h-5">{getCounts("active")}</Badge>
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-card font-black">
              History <Badge variant="secondary" className="ml-1 text-[10px] h-5">{getCounts("history")}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedJobs.map((job) => (
            <Card key={job._id} className="bg-card border-border shadow-md rounded-[2.5rem] overflow-hidden flex flex-col transition-all hover:shadow-2xl">
              <CardHeader className="p-8 pb-5">
                <h3 onClick={() => navigate(`/job/${job._id}`)} className="text-2xl font-black leading-tight cursor-pointer hover:text-blue-600 line-clamp-1 uppercase tracking-tight">{job.title}</h3>
                <div className="flex gap-2 mt-3">
                  <Badge className="bg-blue-600 text-white border-none font-black uppercase text-[11px] px-5 py-1">{job.category}</Badge>
                  <Badge className={`uppercase text-[11px] font-black border-none text-white px-5 py-1 ${job.status === "completed" ? "bg-slate-500" : "bg-emerald-600"}`}>{job.status}</Badge>
                </div>
              </CardHeader>
              <Separator className="bg-border/40 mx-8" />
              <CardContent className="p-8 flex-1">
                 <p className="text-foreground/90 text-lg font-medium leading-relaxed line-clamp-3">{job.description}</p>
                 <div className="mt-6 flex justify-between items-center text-xs font-black text-muted-foreground uppercase">
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-500" /> {job.city}</div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /> {timeAgo(job.createdAt)}</div>
                 </div>
              </CardContent>
              <CardFooter className="p-6 bg-muted/20 border-t border-border/50 flex gap-3">
                 <div className="flex-1">
                    {user?.role === "tradesperson" && job.status === "assigned" ? (
                      <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black h-12 rounded-2xl uppercase text-[11px]" 
                        onClick={() => setVerifyDialog({ open: true, jobId: job._id, customerId: job.user?._id || job.user })}>
                        Finish Job
                      </Button>
                    ) : (
                      <JobActionController 
                        job={job} user={user} 
                        onContact={() => navigate(`/chat/${job._id}`)} 
                        onViewCode={() => setCodeDialog({open: true, code: job.completionCode})} 
                        onReview={() => {
                          const targetId = user.role === "customer" ? job.assignedTo : job.user;
                          setReviewDialog({ open: true, jobId: job._id, targetId: targetId?._id || targetId });
                        }} 
                      />
                    )}
                 </div>
                 <Button variant="outline" size="icon" onClick={() => navigate(`/job/${job._id}`)} className="h-12 w-12 rounded-2xl border-border bg-card"><ArrowRight className="h-6 w-6" /></Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Verification Dialog (Finish Job) */}
      <Dialog open={verifyDialog.open} onOpenChange={(o) => setVerifyDialog({ ...verifyDialog, open: o })}>
        <DialogContent className="sm:max-w-md bg-card border-border rounded-[2.5rem] p-10 text-center">
          <DialogHeader><DialogTitle className="text-2xl font-black uppercase">Verify Completion</DialogTitle><DialogDescription>Enter code from customer</DialogDescription></DialogHeader>
          <Input placeholder="000000" className="text-center text-3xl tracking-[0.6em] font-mono h-20 bg-muted/20 border-border rounded-2xl my-6" maxLength={6} value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} />
          <Button onClick={handleVerifySubmit} className="w-full bg-blue-600 h-14 rounded-2xl font-black text-lg">FINISH WORK</Button>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(o) => setReviewDialog({ ...reviewDialog, open: o })}>
        <DialogContent className="sm:max-w-lg bg-card border-border rounded-[2.5rem] p-10 text-center">
          <DialogHeader><DialogTitle className="text-3xl font-black uppercase">Leave Feedback</DialogTitle></DialogHeader>
          <div className="py-8 space-y-8">
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} onClick={() => setRating(s)} className={`h-12 w-12 cursor-pointer ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
              ))}
            </div>
            <Textarea placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} className="bg-muted/30 border-border h-36 rounded-2xl p-5 text-lg" />
          </div>
          <Button onClick={handleSubmitReview} className="bg-blue-600 w-full h-14 rounded-2xl font-black text-lg">SUBMIT</Button>
        </DialogContent>
      </Dialog>

      {/* Code Viewer Modal */}
      <Dialog open={codeDialog.open} onOpenChange={(o) => setCodeDialog({ ...codeDialog, open: o })}>
        <DialogContent className="max-w-xs rounded-[2.5rem] text-center bg-card border-border p-10 shadow-2xl">
          <DialogHeader><DialogTitle className="text-center font-black uppercase text-xs text-muted-foreground">Completion Code</DialogTitle></DialogHeader>
          <div className="py-10 text-6xl font-black text-emerald-600 tracking-widest font-mono">{codeDialog.code}</div>
          <Button onClick={() => setCodeDialog({ open: false, code: "" })} className="w-full rounded-2xl bg-blue-600 h-14 font-black">CLOSE</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobsPage;
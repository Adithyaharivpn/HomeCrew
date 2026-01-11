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
  Loader2,
  Star,
  Plus,
  Trash2,
  CalendarDays,
} from "lucide-react";

import JobActionController from "../User/JobActionController";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [jobs, setJobs] = useState([]);
  const [myWorks, setMyWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [activeTab, setActiveTab] = useState("open");

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Dialog States
  const [codeDialog, setCodeDialog] = useState({ open: false, code: "" });
  const [reviewDialog, setReviewDialog] = useState({
    open: false,
    jobId: null,
    targetId: null,
  });
  const [verifyDialog, setVerifyDialog] = useState({
    open: false,
    jobId: null,
    customerId: null,
  });
  const [rescheduleDialog, setRescheduleDialog] = useState({
    open: false,
    jobId: null,
  });
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    jobId: null,
  });

  // Input States
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [newDate, setNewDate] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let mainUrl =
          user?.role === "customer" ? "/api/jobs/userjob" : "/api/jobs/feed";
        const promises = [api.get(mainUrl), api.get("/api/service/")];
        if (user?.role === "tradesperson") {
          promises.push(api.get("/api/jobs/tradesperson/my-works"));
        }
        const results = await Promise.all(promises);
        setJobs(results[0].data || []);
        setCategoryOptions(results[1].data || []);
        if (user?.role === "tradesperson" && results[2]) {
          setMyWorks(results[2].data || []);
        }
      } catch (error) {
        if (error.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, logout]);

  const handleContactCustomer = async (job) => {
    try {
      const res = await api.post("/api/chat/initiate", {
        jobId: job._id,
        customerId: job.user?._id || job.user,
        tradespersonId: user.id,
      });
      navigate(`/dashboard/chat/${res.data._id}`);
      toast.success("Conversation started!");
    } catch (err) {
      toast.error("Could not start chat.");
    }
  };

  const handleCancelJob = async () => {
    try {
      await api.put(`/api/jobs/${cancelDialog.jobId}/cancel`);
      toast.success("Job cancelled");
      setCancelDialog({ open: false, jobId: null });
      navigate("/dashboard/jobs");
    } catch (err) {
      toast.error("Failed to cancel");
    }
  };

  const handleRescheduleSubmit = async () => {
    try {
      await api.put(`/api/jobs/${rescheduleDialog.jobId}/reschedule`, {
        scheduledDate: newDate,
      });
      toast.success("Rescheduled!");
      setRescheduleDialog({ open: false, jobId: null });
      navigate("/dashboard/jobs");
    } catch (err) {
      toast.error("Failed");
    }
  };

  const handleVerifySubmit = async () => {
    try {
      await api.post("/api/jobs/complete", {
        jobId: verifyDialog.jobId,
        code: verifyCode,
      });
      setShowConfetti(true);
      setVerifyDialog({ open: false, jobId: null, customerId: null });
      toast.success("Job Completed!");
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      toast.error("Invalid Code");
    }
  };

  const handleSubmitReview = async () => {
    try {
      await api.post("/api/reviews", {
        jobId: reviewDialog.jobId,
        targetUserId: reviewDialog.targetId,
        rating,
        comment,
      });
      toast.success("Review submitted!");
      setReviewDialog({ open: false, jobId: null, targetId: null });
    } catch {
      toast.error("Failed");
    }
  };

  const getFilteredJobs = () => {
    let source =
      user?.role === "tradesperson" && activeTab !== "open" ? myWorks : jobs;
    return source.filter((job) => {
      const matchesSearch = job.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || job.category === categoryFilter;
      let matchesTab = false;
      if (activeTab === "open") matchesTab = job.status === "open";
      else if (activeTab === "active")
        matchesTab = job.status === "assigned" || job.status === "in_progress";
      else if (activeTab === "history")
        matchesTab = job.status === "completed" || job.status === "cancelled";
      return matchesSearch && matchesCategory && matchesTab;
    });
  };

  const getCounts = (tabType) => {
    let source =
      user?.role === "tradesperson" && tabType !== "open" ? myWorks : jobs;
    if (tabType === "open")
      return jobs.filter((j) => j.status === "open").length;
    if (tabType === "active")
      return source.filter((j) =>
        ["assigned", "in_progress"].includes(j.status)
      ).length;
    if (tabType === "history")
      return source.filter((j) => ["completed", "cancelled"].includes(j.status))
        .length;
    return 0;
  };

  const sortedJobs = [...getFilteredJobs()].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="bg-background min-h-full pb-20 animate-in fade-in duration-700">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          className="z-[100]"
        />
      )}

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tight text-foreground ">
              {user?.role === "customer" ? "My Projects" : "Job Market"}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {activeTab === "open"
                ? "Browse Available Jobs"
                : "Track Ongoing Progress"}
            </p>
          </div>
          {user?.role === "customer" && (
            <Button
              onClick={() => navigate("/dashboard/post-job")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl h-14 px-8 shadow-xl shadow-blue-600/20 uppercase text-xs tracking-widest border-none"
            >
              <Plus className="mr-2 h-5 w-5" /> New Job
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Input
            placeholder="Search title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-14 bg-card border-border rounded-2xl px-6 font-bold"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[250px] h-14 bg-card border-border rounded-2xl font-black uppercase text-[10px] tracking-widest px-6">
              <SelectValue placeholder="Categories" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border rounded-xl">
              <SelectItem
                value="All"
                className="font-black uppercase text-[10px]"
              >
                All Trades
              </SelectItem>
              {categoryOptions.map((cat) => (
                <SelectItem
                  key={cat._id}
                  value={cat.service_name}
                  className="font-black uppercase text-[10px]"
                >
                  {cat.service_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-10">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1.5 rounded-[1.5rem] h-16 border border-border">
            <TabsTrigger
              value="open"
              className="rounded-xl font-black uppercase text-[10px] tracking-widest"
            >
              Available{" "}
              <Badge
                variant="secondary"
                className="ml-2 bg-blue-600 text-white border-none"
              >
                {getCounts("open")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="rounded-xl font-black uppercase text-[10px] tracking-widest"
            >
              Active{" "}
              <Badge variant="secondary" className="ml-2">
                {getCounts("active")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-xl font-black uppercase text-[10px] tracking-widest"
            >
              History{" "}
              <Badge variant="secondary" className="ml-2">
                {getCounts("history")}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedJobs.map((job) => (
            <Card
              key={job._id}
              className={`bg-card border-border shadow-md rounded-[2.5rem] overflow-hidden flex flex-col transition-all hover:shadow-2xl hover:border-blue-600/20 ${
                job.status === "completed" ? "opacity-70" : ""
              }`}
            >
              <CardHeader className="p-8 pb-5">
                <h3
                  onClick={() => navigate(`/dashboard/job/${job._id}`)}
                  className="text-2xl font-black uppercase leading-tight cursor-pointer hover:text-blue-600 line-clamp-1  tracking-tighter"
                >
                  {job.title}
                </h3>
                <div className="flex gap-2 mt-4">
                  <Badge className="bg-blue-600 text-white border-none font-black uppercase text-[9px] px-3 py-1 tracking-widest">
                    {job.category}
                  </Badge>
                  <Badge
                    className={`text-[9px] font-black uppercase border-none text-white px-3 py-1 tracking-widest ${
                      job.status === "completed"
                        ? "bg-slate-500"
                        : job.status === "assigned"
                        ? "bg-amber-500"
                        : "bg-emerald-600"
                    }`}
                  >
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <Separator className="bg-border/40 mx-8" />
              <CardContent className="p-8 flex-1">
                <p className="text-foreground/80 text-sm font-medium leading-relaxed line-clamp-3">
                  {job.description}
                </p>
                <div className="mt-8 flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" /> {job.city}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />{" "}
                    {timeAgo(job.createdAt)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 bg-muted/20 border-t border-border/50">
                <div className="w-full flex flex-col gap-3">
                  {user?.role === "tradesperson" &&
                  job.status === "assigned" ? (
                    <Button
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black h-14 rounded-2xl uppercase text-[10px] border-none shadow-lg shadow-amber-500/20"
                      onClick={() =>
                        setVerifyDialog({
                          open: true,
                          jobId: job._id,
                          customerId: job.user?._id || job.user,
                        })
                      }
                    >
                      Finish Job
                    </Button>
                  ) : (
                    <JobActionController
                      job={job}
                      user={user}
                      onContact={() => handleContactCustomer(job)}
                      onViewCode={() =>
                        setCodeDialog({ open: true, code: job.completionCode })
                      }
                      onReview={() => {
                        const targetId =
                          user.role === "customer"
                            ? job.assignedTo?._id || job.assignedTo
                            : job.user?._id || job.user;
                        setReviewDialog({
                          open: true,
                          jobId: job._id,
                          targetId,
                        });
                      }}
                    suppressDefaultDetails={true}
                    />
                  )}
                  <Button
                    variant="outline"
                    className="w-full h-10 rounded-xl border-border bg-card font-bold text-xs"
                    onClick={() => navigate(`/dashboard/job/${job._id}`)}
                  >
                    Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleDialog.open}
        onOpenChange={(o) =>
          setRescheduleDialog({ ...rescheduleDialog, open: o })
        }
      >
        <DialogContent className="bg-card border-border rounded-[2.5rem] p-10 max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase text-center tracking-tight">
              Reschedule
            </DialogTitle>
          </DialogHeader>
          <Input
            type="datetime-local"
            style={{ colorScheme: "dark" }}
            className="h-16 rounded-2xl border-border bg-muted/30 px-5 font-bold text-lg mt-6"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <Button
            onClick={handleRescheduleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl font-black text-lg uppercase mt-6"
          >
            Confirm
          </Button>
        </DialogContent>
      </Dialog>

      {/* Code Reveal Dialog */}
      <Dialog
        open={codeDialog.open}
        onOpenChange={(o) => setCodeDialog({ ...codeDialog, open: o })}
      >
        <DialogContent className="sm:max-w-md bg-card border-border rounded-[2.5rem] p-10 text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase">
              Completion Code
            </DialogTitle>
          </DialogHeader>
          <div className="bg-muted/30 rounded-2xl p-6 my-6 border border-border">
            <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-3">
              Your Code
            </p>
            <p className="text-3xl font-mono font-black tracking-[0.3em] text-blue-600 break-all">
              {codeDialog.code || "N/A"}
            </p>
          </div>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(codeDialog.code);
              toast.success("Code copied!");
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl font-black text-lg uppercase"
          >
            Copy Code
          </Button>
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog
        open={verifyDialog.open}
        onOpenChange={(o) => setVerifyDialog({ ...verifyDialog, open: o })}
      >
        <DialogContent className="sm:max-w-md bg-card border-border rounded-[2.5rem] p-10 text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase">
              Enter Verify Code
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder="000000"
            className="text-center text-3xl tracking-[0.6em] font-mono h-20 bg-muted/20 border-border rounded-2xl my-6"
            maxLength={6}
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
          />
          <Button
            onClick={handleVerifySubmit}
            className="w-full bg-blue-600 h-14 rounded-2xl font-bold text-lg uppercase"
          >
            Verify & Finish
          </Button>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog.open}
        onOpenChange={(o) => setReviewDialog({ ...reviewDialog, open: o })}
      >
        <DialogContent className="sm:max-w-lg bg-card border-border rounded-[2.5rem] p-10 text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase">
              Rate Experience
            </DialogTitle>
          </DialogHeader>
          <div className="py-8 space-y-8">
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  onClick={() => setRating(s)}
                  className={`h-12 w-12 cursor-pointer ${
                    s <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted"
                  }`}
                />
              ))}
            </div>
            <Textarea
              placeholder="Share details..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-muted/30 border-border h-36 rounded-2xl p-5 text-lg font-medium"
            />
          </div>
          <Button
            onClick={handleSubmitReview}
            className="bg-blue-600 w-full h-14 rounded-2xl font-bold text-lg uppercase"
          >
            Submit Feedback
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobsPage;

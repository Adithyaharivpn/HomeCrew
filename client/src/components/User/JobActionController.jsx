import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Icons
import {
  Key,
  Star,
  MessageCircle,
  Eye,
  ShieldCheck,
  SendHorizontal,
  Clock,
} from "lucide-react";

const JobActionController = ({
  job,
  user,
  onContact,
  onViewCode,
  onReview,
  suppressDefaultDetails = false,
}) => {
  const navigate = useNavigate();

  const isCustomer = user?.role === "customer";
  const isWorker = user?.role === "tradesperson";

  // Ownership check
  const isMyJob =
    user &&
    (isCustomer
      ? job.user?._id === user.id || job.user === user.id
      : job.assignedTo === user.id || job.assignedTo?._id === user.id);

  // SHARED BUTTON STYLING - Ensures mouse doesn't have to move
  const btnStyle = "w-full font-black rounded-2xl h-14 uppercase text-[10px] tracking-widest shadow-lg border-none transition-all active:scale-[0.98]";

  // --- CUSTOMER VIEW ---
  if (isCustomer && isMyJob) {
    switch (job.status) {
      case "open":
        return (
          <Button
            asChild
            className={`${btnStyle} bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20`}
          >
            <Link to={`/dashboard/proposals/${job._id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Proposals
            </Link>
          </Button>
        );

      case "assigned":
      case "in_progress":
        if (job.isPaid && job.completionCode && onViewCode) {
          return (
            <Button
              className={`${btnStyle} bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20`}
              onClick={() => onViewCode(job)}
            >
              <Key className="mr-2 h-4 w-4" />
              Reveal Code
            </Button>
          );
        }
        return (
          <Button
            className={`${btnStyle} bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20`}
            onClick={() => onContact(job)}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat with Worker
          </Button>
        );

      case "completed":
        return (
          <Button
            className={`${btnStyle} bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20`}
            onClick={() => onReview && onReview(job)}
          >
            <Star className="mr-2 h-4 w-4" />
            Review Worker
          </Button>
        );

      default:
        return null;
    }
  }

  // --- WORKER (TRADESPERSON) VIEW ---
  if (isWorker) {
    // Already assigned to this job
    if (isMyJob && !["completed", "cancelled"].includes(job.status)) {
      return (
        <Button
          className={`${btnStyle} bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20`}
          onClick={() => onContact(job)}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Open Chatroom
        </Button>
      );
    }

    if (job.status === "open") {
      // FIX: Check verification status dynamically
      if (user.verificationStatus === "pending") {
        return (
          <Button
            disabled
            className={`${btnStyle} bg-amber-500/50 text-white cursor-not-allowed opacity-70`}
          >
            <Clock className="mr-2 h-4 w-4 animate-spin" />
            Verification Pending
          </Button>
        );
      }

      if (user.verificationStatus !== "approved") {
        return (
          <Button
            className={`${btnStyle} bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20`}
            onClick={() => navigate("/dashboard/get-verified")}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Verify to Apply
          </Button>
        );
      }

      return (
        <Button
          className={`${btnStyle} bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20`}
          onClick={() => onContact(job)}
        >
          <SendHorizontal className="mr-2 h-4 w-4" />
          Send Quote
        </Button>
      );
    }

    if (job.status === "completed") {
      return (
        <Button
          className={`${btnStyle} bg-card hover:bg-muted border border-border text-foreground shadow-sm`}
          onClick={() => onReview && onReview(job)}
        >
          <Star className="mr-2 h-4 w-4 text-amber-500" />
          Rate Customer
        </Button>
      );
    }
  }

  // --- DEFAULT VIEW ---
  if (suppressDefaultDetails) return null;

  return (
    <Button
      variant="outline"
      className={`${btnStyle} border-border text-foreground hover:bg-muted shadow-sm`}
      asChild
    >
      <Link to={`/dashboard/job/${job._id}`}>
        <Eye className="mr-2 h-4 w-4" />
        View Details
      </Link>
    </Button>
  );
};

export default JobActionController;
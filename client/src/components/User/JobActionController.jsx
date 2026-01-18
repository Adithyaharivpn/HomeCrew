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
  CalendarClock,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const JobActionController = ({
  job,
  user,
  onContact,
  onViewCode,
  onReview,
  onReschedule,
  onCancel,
  suppressDefaultDetails = false,
}) => {
  const navigate = useNavigate();

  const isCustomer = user?.role === "customer";
  const isWorker = user?.role === "tradesperson";

  // Ownership check
  const isMyJob =
    user &&
    (isCustomer
      ? job.user &&
        user &&
        (job.user?._id === user._id ||
          job.user === user._id ||
          job.user === user.id)
      : job.assignedTo &&
        user &&
        (job.assignedTo === user._id ||
          job.assignedTo === user.id ||
          job.assignedTo?._id === user._id));

  // SHARED BUTTON STYLING - Ensures mouse doesn't have to move
  const btnStyle =
    "w-full font-black rounded-2xl h-14 uppercase text-[10px] tracking-widest shadow-lg border-none transition-all active:scale-[0.98]";

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
        // ESCROW STEP: If funds not deposited, show Deposit Button
        if (!job.fundsDeposited) {
          return (
            <div className="flex w-full gap-2">
              <Button
                className={`${btnStyle} bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20`}
                onClick={() =>
                  navigate("/dashboard/payment", {
                    state: {
                      amount: job.price,
                      jobId: job._id,
                      type: "escrow",
                    },
                  })
                }
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Deposit Funds to Start
              </Button>
              {onCancel && (
                <Button
                  variant="outline"
                  className="h-14 w-14 rounded-2xl border-border bg-card p-0 shadow-sm hover:bg-muted"
                  onClick={() => onCancel(job)}
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                </Button>
              )}
            </div>
          );
        }
      // Fallthrough if funds deposited but somehow status stuck (should be in_progress)

      case "in_progress":
        return (
          <div className="flex w-full gap-2">
            {/* Primary Action Section */}
            <div className="flex-1">
              {!job.isPaid ? (
                // This state might happen if we want a 2-step (deposit -> release).
                // For now, let's assume if fundsDeposited, we show "Release Funds" or just show the code.
                // Since our backend sets status to in_progress on deposit, we are here.

                job.completionCode && onViewCode ? (
                  <Button
                    className={`${btnStyle} bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20`}
                    onClick={() => onViewCode(job)}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Reveal Completion Code
                  </Button>
                ) : (
                  <Button
                    disabled
                    className={`${btnStyle} bg-blue-600/50 text-white opacity-80 cursor-wait`}
                  >
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Work in Progress
                  </Button>
                )
              ) : (
                // If isPaid is true (old flow or final release done)
                <Button
                  className={`${btnStyle} bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20`}
                  onClick={() => onContact(job)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat with Worker
                </Button>
              )}
            </div>

            {/* Secondary Actions Dropdown */}
            {(onReschedule || onCancel) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-14 w-14 rounded-2xl border-border bg-card p-0 shadow-sm hover:bg-muted"
                  >
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-xl p-2"
                >
                  {onReschedule && (
                    <DropdownMenuItem
                      onClick={() => onReschedule(job)}
                      className="rounded-lg p-3 font-medium cursor-pointer"
                    >
                      <CalendarClock className="mr-2 h-4 w-4 text-amber-500" />
                      Reschedule
                    </DropdownMenuItem>
                  )}
                  {onCancel && (
                    <DropdownMenuItem
                      onClick={() => onCancel(job)}
                      className="rounded-lg p-3 font-medium text-red-500 cursor-pointer focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Cancel Job
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
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
      if (!job.isPaid && !job.fundsDeposited) {
        return (
          <Button
            disabled
            className={`${btnStyle} bg-amber-500/50 text-white cursor-not-allowed opacity-70`}
          >
            <Clock className="mr-2 h-4 w-4 animate-spin" />
            Waiting for Customer Payment
          </Button>
        );
      }

      return (
        <Button
          className={`${btnStyle} bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20`}
          onClick={() => onContact(job)}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Start Work & Open Chat
        </Button>
      );
    }

    if (job.status === "open") {
      // FIX: Check verification status dynamically
      if (!user.isVerified) {
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

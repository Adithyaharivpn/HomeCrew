import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../api/useAuth";

// Icons
import {
  AlertCircle,
  ArrowLeft,
  Send,
  CheckCircle,
  Upload,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const ReportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Get pre-filled data from navigation state if available
  const { reportedUserId, jobId, roomId } = location.state || {};

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("reportedUserId", reportedUserId);
      formData.append("jobId", jobId);
      if (roomId) formData.append("roomId", roomId); // Added
      formData.append("reason", category);
      formData.append("description", description);
      if (evidence) {
        formData.append("evidence", evidence);
      }

      // Note: You'll need to create this endpoint in backend
      await api.post("/api/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsSubmitted(true);
      toast.success("Report submitted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in zoom-in-50 duration-500">
        <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/20">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight">
            Report Received
          </h2>
          <p className="text-muted-foreground max-w-sm">
            Thank you for bringing this to our attention. Our safety team will
            review your report and take appropriate action within 24 hours.
          </p>
        </div>
        <Button
          onClick={() => navigate(-1)}
          className="bg-primary text-primary-foreground font-bold uppercase text-xs h-12 px-8 rounded-xl"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground pl-0"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Cancel & Go Back
      </Button>

      <Card className="border-border bg-card rounded-[2.5rem] overflow-hidden shadow-2xl">
        <CardHeader className="p-10 pb-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-destructive/10 rounded-2xl">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Submit Incident Report
              </CardTitle>
              <CardDescription className="font-medium mt-1">
                Help us maintain a safe community. Your report is confidential.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-10 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground ml-1">
                Issue Category
              </Label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger className="h-14 rounded-xl">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_off_platform">
                    Asked to pay outside platform
                  </SelectItem>
                  <SelectItem value="harassment">
                    Harassment or abusive behavior
                  </SelectItem>
                  <SelectItem value="scam">
                    Suspicious activity / Scam
                  </SelectItem>
                  <SelectItem value="no_show">
                    Did not show up / Incomplete work
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground ml-1">
                Detailed Description
              </Label>
              <Textarea
                placeholder="Please provide specific details about what happened..."
                className="min-h-[150px] rounded-xl p-4 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground ml-1">
                Supporting Evidence (Optional)
              </Label>
              <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer relative">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-xs font-bold text-muted-foreground">
                  {evidence ? evidence.name : "Click to upload screenshots"}
                </span>
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={(e) => setEvidence(e.target.files[0])}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-destructive hover:bg-destructive/90 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-destructive/20"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportPage;

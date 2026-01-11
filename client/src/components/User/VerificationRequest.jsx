import React, { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { useAuth } from "../../api/useAuth";
import { useNavigate } from "react-router-dom"; // Added for redirect

// Icons
import { CloudUpload, ShieldCheck, Clock, Loader2, AlertCircle } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const VerificationRequest = () => {
  const { user, setUser } = useAuth(); // Added setUser to update global state
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async () => {
  if (selectedFiles.length === 0) {
    toast.error("Please select documents first.");
    return;
  }

  const formData = new FormData();
  for (let i = 0; i < selectedFiles.length; i++) {
    formData.append("documents", selectedFiles[i]);
  }

  try {
    setUploading(true);
    // Ensure the endpoint is exactly what the backend expects
    const response = await api.post("/api/users/request-verification", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // CHECK: Does your backend return the updated user or a success message?
    console.log("Upload Success:", response.data);

    // 1. SAFE GLOBAL AUTH UPDATE
    if (user && setUser) {
      setUser((prev) => ({
        ...prev,
        verificationStatus: "pending",
      }));
    }

    toast.success("Documents submitted! Redirecting...");

    setTimeout(() => {
      navigate("/jobs"); // Adjusted to match your usual jobs route
    }, 2000);

  } catch (err) {
    console.error("Actual Upload Error:", err.response?.data || err.message);
   
    toast.error(err.response?.data?.message || "Upload failed. Try again.");
  } finally {
    setUploading(false);
  }
};

  return (
    <div className="max-w-2xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-black uppercase tracking-tight italic text-foreground leading-none">Identity Check</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-2">Required for tradesperson bidding privileges</p>
      </div>

      <Card className="bg-card border-border rounded-[2.5rem] shadow-2xl overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <div 
            className="group border-2 border-dashed border-border rounded-[2rem] p-16 text-center hover:border-blue-600 hover:bg-muted/30 transition-all cursor-pointer bg-muted/10"
            onClick={() => document.getElementById('file-upload').click()}
          >
            <input id="file-upload" type="file" className="hidden" multiple onChange={handleFileChange} />
            <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-background rounded-2xl flex items-center justify-center border border-border group-hover:scale-110 transition-transform shadow-sm">
                    <CloudUpload className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-foreground">
                    {selectedFiles.length > 0 ? `${selectedFiles.length} Documents Selected` : "Upload Credentials"}
                </p>
            </div>
          </div>

          {uploading && <Progress value={75} className="h-2" />}

          <Button 
            className="w-full h-14 text-sm font-black uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-600/20"
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? "Transmitting..." : "Submit for Approval"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationRequest;
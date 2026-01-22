import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import LocationSearchInput from "../Hompage/LocationSearchInput";

// Icons
import { Loader2, Briefcase, ChevronRight } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const JobPosting = () => {
  const navigate = useNavigate();

  const [jobDetails, setJobDetails] = useState({
    title: "",
    category: "",
    description: "",
    city: "",
    location: { lat: null, lng: null },
  });

  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [locationInputValue, setLocationInputValue] = useState("");

  const handleChange = (e) => {
    setJobDetails({
      ...jobDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryChange = (value) => {
    setJobDetails({ ...jobDetails, category: value });
  };

  const handleLocationSelect = (locData) => {
    setJobDetails((prev) => ({
      ...prev,
      city: locData.city || locData.fullAddress.split(",")[0],
      location: {
        lat: parseFloat(locData.lat),
        lng: parseFloat(locData.lng),
      },
    }));
    setLocationInputValue(locData.city || locData.fullAddress.split(",")[0]);
  };

  const handleLocationInputChange = (e) => {
    setLocationInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jobDetails.location.lat || !jobDetails.city) {
      toast.warning("Please select a valid location from the list.");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/api/jobs/", jobDetails);
      toast.success("Job posted successfully!");
      setTimeout(() => navigate("/dashboard/jobs"), 1500);
      setJobDetails({
        title: "",
        category: "",
        description: "",
        city: "",
        location: { lat: null, lng: null },
      });
    } catch (error) {
      console.error("Failed to post job:", error);
      toast.error("Error posting your job.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get("/api/service/");
        setServices(response.data);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="flex justify-center items-start min-h-full bg-background text-foreground pt-6 pb-20 px-4 relative overflow-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/3 blur-[120px] pointer-events-none -z-10" />

      <Card className="w-full max-w-3xl border-border bg-card shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardHeader className="pt-10 pb-2">
          <CardTitle className="text-3xl font-bold tracking-tight text-center leading-none">
            Post a New Job
          </CardTitle>
          <p className="text-center text-muted-foreground text-sm mt-2">
            Connect with verified tradespeople
          </p>
        </CardHeader>

        <CardContent className="p-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-xs font-semibold ml-1 text-muted-foreground"
              >
                The Job Title
              </Label>
              <div className="relative group">
                <Briefcase className="absolute z-10 left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Fixing Leaking Pipe"
                  className="pl-12 h-14 rounded-xl"
                  value={jobDetails.title}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold ml-1 text-muted-foreground">
                Category
              </Label>
              <Select
                onValueChange={handleCategoryChange}
                value={jobDetails.category}
                required
              >
                <SelectTrigger className="h-14 rounded-xl px-5">
                  <SelectValue placeholder="What trade do you need?" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  {Array.isArray(services) &&
                    services.map((service) => (
                      <SelectItem
                        key={service.id || service._id}
                        value={service.service_name}
                        className="py-2 text-sm"
                      >
                        {service.service_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 relative">
              <Label className="text-xs font-semibold ml-1 text-muted-foreground">
                Service Location
              </Label>
              <LocationSearchInput
                value={locationInputValue}
                onChange={handleLocationInputChange}
                onLocationSelect={handleLocationSelect}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-xs font-semibold ml-1 text-muted-foreground"
              >
                Describe the problem
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide details about the job..."
                className="rounded-xl min-h-[150px] p-5 resize-none"
                value={jobDetails.description}
                onChange={handleChange}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base h-14 rounded-xl shadow-lg transition-all active:scale-95 mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  Post Job Now <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobPosting;

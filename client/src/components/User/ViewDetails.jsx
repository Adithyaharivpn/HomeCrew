import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../api/useAuth";
import InvoiceModal from "../Payment/InvoiceModel";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Icons
import {
  Receipt,
  ShieldCheck,
  MapPin,
  User,
  Calendar,
  MessageCircle,
  Loader2,
  ChevronLeft,
  Edit3,
  Save,
  X,
  Key,
  Clock,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Fix for Leaflet Icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const ViewDetails = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);

  // --- EDIT STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editLocation, setEditLocation] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- LOCATION SEARCH ---
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobRes, catRes] = await Promise.all([
          api.get(`/api/jobs/${jobId}`),
          api.get("/api/service/"),
        ]);

        setJob(jobRes.data);
        setCategories(catRes.data);
        setEditTitle(jobRes.data.title || "");
        setEditDescription(jobRes.data.description || "");
        setEditCategory(jobRes.data.category || "");
        setEditCity(jobRes.data.city || "");
        setEditLocation(jobRes.data.location || null);
        setAddressQuery(jobRes.data.city || "");
      } catch (err) {
        setError("Job not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  const handleLocationSearch = async (query) => {
    setAddressQuery(query);
    if (query.length < 3) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5`,
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectLocation = (sug) => {
    setEditCity(sug.display_name);
    setAddressQuery(sug.display_name);
    setEditLocation({ lat: parseFloat(sug.lat), lng: parseFloat(sug.lon) });
    setSuggestions([]);
  };

  const handleSaveEdit = async () => {
    setIsUpdating(true);
    try {
      const res = await api.put(`/api/jobs/${jobId}`, {
        title: editTitle,
        description: editDescription,
        category: editCategory,
        city: editCity,
        location: editLocation,
      });
      setJob(res.data);
      setIsEditing(false);
      toast.success("Job updated!");
    } catch (err) {
      toast.error("Update failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContact = async () => {
    try {
      if (user.role === "tradesperson" && !user.isVerified) {
        toast.error("Account pending verification.", {
          description: "You cannot initiate chats until approved.",
        });
        return;
      }

      const res = await api.post("/api/chat/initiate", {
        jobId: job._id,
        customerId: job.user._id,
        tradespersonId: user._id || user.id,
      });
      // FIXED: Navigating to the correct dashboard path
      navigate(`/dashboard/chat/${res.data._id}`);
    } catch (err) {
      toast.error("Chat error.");
    }
  };

  const jobTransaction = job
    ? {
        _id: job.paymentId || "PENDING",
        amount: job.price,
        date: job.updatedAt,
        status: "success",
        job: { title: job.title, _id: job._id },
        user: job.user,
      }
    : null;

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (!job) return null;

  const isMyJob = user && (job?.user?._id === user.id || job?.user === user.id);

  return (
    <div className="bg-background pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          className="mb-6 font-bold"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card className="shadow-2xl border-border bg-card rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="space-y-4 flex-1 w-full">
                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-14 font-black bg-muted/50 border-blue-600/30 rounded-2xl px-4"
                    />
                    <Select
                      value={editCategory}
                      onValueChange={setEditCategory}
                    >
                      <SelectTrigger className="h-12 bg-muted/50 border-blue-600/30 font-bold uppercase text-xs rounded-xl">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat.service_name}>
                            {cat.service_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl font-black uppercase leading-tight tracking-tight">
                      {job.title}
                    </h1>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest px-3 py-1 border-none">
                        {job.category}
                      </Badge>
                      <Badge className="bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest px-3 py-1 border-none">
                        {job.status}
                      </Badge>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                {isMyJob &&
                  job.status === "open" &&
                  (isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        className="bg-emerald-600 h-14 px-8 rounded-2xl shadow-lg shadow-emerald-500/20 font-black"
                        onClick={handleSaveEdit}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                          <>
                            <Save className="mr-2 h-5 w-5" /> Save
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        className="border h-14 px-8 rounded-2xl font-black"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="mr-2 h-5 w-5 text-red-500" /> Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="border border-border h-14 px-8 rounded-2xl font-black hover:bg-muted"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="mr-2 h-5 w-5 text-blue-500" /> Edit
                    </Button>
                  ))}

                {!isMyJob && user.role === "tradesperson" && (
                  <>
                    {/* OPEN JOB: Apply */}
                    {job.status === "open" && (
                      <Button
                        className={`h-14 px-8 rounded-2xl shadow-lg font-black w-full ${user.isVerified ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20" : "bg-muted text-muted-foreground shadow-none cursor-not-allowed"}`}
                        onClick={handleContact}
                        disabled={!user.isVerified}
                      >
                        {!user.isVerified ? (
                          <>
                            <ShieldCheck className="mr-2 h-5 w-5" />{" "}
                            Verification Pending
                          </>
                        ) : (
                          <>
                            <MessageCircle className="mr-2 h-5 w-5" /> Send
                            Quote
                          </>
                        )}
                      </Button>
                    )}

                    {/* ASSIGNED TO ME: Chat or Completed */}
                    {(job.status === "assigned" ||
                      job.status === "in_progress") &&
                      job.assignedTo?._id === user._id &&
                      (job.isPaid === true ? (
                        <Button
                          className="h-14 px-8 rounded-2xl shadow-lg font-black w-full bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                          onClick={handleContact}
                        >
                          <MessageCircle className="mr-2 h-5 w-5" /> Open
                          Chatroom
                        </Button>
                      ) : (
                        <Button
                          disabled
                          className="h-14 px-8 rounded-2xl shadow-lg font-black w-full bg-amber-500/50 text-white cursor-not-allowed"
                        >
                          <Clock className="mr-2 h-5 w-5 animate-spin" />{" "}
                          Waiting for Payment
                        </Button>
                      ))}

                    {/* CLOSED */}
                    {(job.status === "completed" ||
                      job.status === "cancelled") && (
                      <div className="w-full text-center p-4 bg-muted/30 rounded-2xl border border-border">
                        <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">
                          Job is {job.status}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Reveal Code Section - Compact */}
            {isMyJob &&
              job.isPaid === true &&
              (job.status === "assigned" || job.status === "in_progress") &&
              job.completionCode && (
                <div className="bg-emerald-600/5 border border-emerald-600/30 rounded-xl p-4 my-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Key className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">
                        Code
                      </p>
                      <p className="text-sm font-mono font-black text-emerald-600 truncate">
                        {job.completionCode}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(job.completionCode);
                      toast.success("Copied!");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg h-9 px-4 text-[9px] shrink-0"
                  >
                    Copy
                  </Button>
                </div>
              )}

            <Separator className="my-10 bg-border/50" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-10">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">
                    Details
                  </h3>
                  <div className="bg-muted/30 rounded-3xl p-8 border border-border/50">
                    {isEditing ? (
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="min-h-[200px] bg-transparent border-none p-0 resize-none text-lg leading-relaxed focus-visible:ring-0"
                      />
                    ) : (
                      <p className="text-lg leading-relaxed text-foreground/90 font-medium">
                        {job.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">
                    Location
                  </h3>
                  <div className="relative">
                    <div className="flex items-center gap-2 text-xl font-bold mb-4 ml-1">
                      <MapPin className="h-6 w-6 text-blue-600" />
                      {isEditing ? (
                        <div className="w-full relative">
                          <Input
                            value={addressQuery}
                            onChange={(e) =>
                              handleLocationSearch(e.target.value)
                            }
                            placeholder="Search location..."
                            className="h-12 bg-muted/50 border-blue-600/30 rounded-xl"
                          />
                          {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-card border border-border z-100 rounded-xl shadow-2xl mt-1 overflow-hidden">
                              {suggestions.map((sug, i) => (
                                <div
                                  key={i}
                                  className="p-3 hover:bg-muted cursor-pointer text-sm font-medium border-b border-border/50 last:border-none"
                                  onClick={() => selectLocation(sug)}
                                >
                                  {sug.display_name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-foreground tracking-tight">
                          {job.city}
                        </span>
                      )}
                    </div>
                  </div>

                  {(editLocation?.lat || job.location?.lat) && (
                    <div className="h-[400px] w-full rounded-[2.5rem] overflow-hidden border border-border shadow-xl relative z-0">
                      <MapContainer
                        key={`${editLocation?.lat || job.location.lat}`}
                        center={[
                          editLocation?.lat || job.location.lat,
                          editLocation?.lng || job.location.lng,
                        ]}
                        zoom={14}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker
                          position={[
                            editLocation?.lat || job.location.lat,
                            editLocation?.lng || job.location.lng,
                          ]}
                        >
                          <Popup>
                            <div className="font-bold">{editTitle}</div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="bg-muted/30 border border-border rounded-[2.5rem] p-10 text-center sticky top-32">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-8">
                    Posted By
                  </p>
                  <Link
                    to={`/dashboard/profile/${job.user?._id}`}
                    className="block hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="h-32 w-32 border-4 border-background shadow-2xl mb-6 mx-auto hover:scale-105 transition-transform duration-300">
                      <AvatarImage src={job.user?.profilePictureUrl} />
                      <AvatarFallback className="bg-blue-600 text-white text-3xl font-black">
                        {job.user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="text-2xl font-black uppercase tracking-tight text-foreground">
                      {job.user?.name}
                    </h4>
                  </Link>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground uppercase mt-4 tracking-widest">
                    <Calendar className="h-4 w-4 text-blue-600" /> Member since{" "}
                    {new Date(job.user?.createdAt || Date.now()).getFullYear()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <InvoiceModal
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
        transaction={jobTransaction}
      />
    </div>
  );
};

export default ViewDetails;

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../api/useAuth"; 
import api from "../../api/axiosConfig"; // Strictly using your api instance

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; 
import { Loader2, Mail, User, CloudUpload, Upload } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "", tradeCategory: "", experience: "", location: "",
    agreeToTerms: false 
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [verificationDocs, setVerificationDocs] = useState([]); 
  const [tradeCategories, setTradeCategories] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // FETCH: Using 'api' instance
  useEffect(() => {
    const fetchTradeCategories = async () => {
      try {
        const response = await api.get("/api/service");
        setTradeCategories(Array.isArray(response.data) ? response.data : []);
      } catch (err) { console.error("Service fetch failed"); }
    };
    fetchTradeCategories();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSelectChange = (name, value) => setFormData({ ...formData, [name]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const data = new FormData();
    
    Object.keys(formData).forEach(key => {
        if (!['confirmPassword', 'agreeToTerms'].includes(key)) {
            data.append(key, formData[key]);
        }
    });

    if (profilePicture) data.append("profilePicture", profilePicture);
    if (verificationDocs.length > 0) {
        Array.from(verificationDocs).forEach(doc => data.append("documents", doc));
    }

    try {
      // SUBMIT: Using 'api' instance
      const response = await api.post("/api/auth/signup", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.token) {
        await login(response.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 pt-24 pb-20">
      <Card className="w-full max-w-[550px] border-border bg-card rounded-[2.5rem] shadow-2xl overflow-hidden">
        <CardHeader className="pt-10 text-center text-foreground">
          <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">Create Entity</CardTitle>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-4 italic">Initialize Global Profile</p>
        </CardHeader>

        <CardContent className="pb-10 space-y-6 px-10">
          {error && <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-[10px] font-black uppercase text-destructive text-center tracking-widest">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Label className="group cursor-pointer border-2 border-dashed border-border rounded-[1.5rem] p-8 flex flex-col items-center hover:bg-muted/50 transition-all bg-muted/20">
              <CloudUpload className="h-8 w-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                  {profilePicture ? profilePicture.name : "Establish Biometric ID (Profile Photo)"}
              </span>
              <input type="file" hidden onChange={(e) => setProfilePicture(e.target.files[0])} accept="image/*" />
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="name" placeholder="FULL NAME" className="h-14 bg-muted/20 border-border rounded-2xl font-bold uppercase text-xs" value={formData.name} onChange={handleChange} required />
                <Input name="email" type="email" placeholder="EMAIL ADDRESS" className="h-14 bg-muted/20 border-border rounded-2xl font-bold uppercase text-xs" value={formData.email} onChange={handleChange} required />
                <Input name="password" type="password" placeholder="PASSWORD" className="h-14 bg-muted/20 border-border rounded-2xl font-bold" value={formData.password} onChange={handleChange} required />
                <Input name="confirmPassword" type="password" placeholder="CONFIRM ACCESS KEY" className="h-14 bg-muted/20 border-border rounded-2xl font-bold" value={formData.confirmPassword} onChange={handleChange} required />
            </div>

            <Select onValueChange={(val) => handleSelectChange("role", val)} value={formData.role}>
              <SelectTrigger className="h-14 bg-muted/20 border-border rounded-2xl font-black uppercase text-[10px] tracking-widest px-6">
                <SelectValue placeholder="SELECT ROLE" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">CUSTOMER (REQUESTER)</SelectItem>
                <SelectItem value="tradesperson">TRADESPERSON (PROVIDER)</SelectItem>
              </SelectContent>
            </Select>

            {formData.role === "tradesperson" && (
                <div className="p-6 bg-muted/30 rounded-[2rem] border border-border space-y-4 animate-in slide-in-from-top-4">
                    <Select onValueChange={(val) => handleSelectChange("tradeCategory", val)}>
                        <SelectTrigger className="bg-background rounded-xl h-12">
                            <SelectValue placeholder="Specialization Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {tradeCategories.map(c => <SelectItem key={c._id} value={c.service_name}>{c.service_name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input name="location" placeholder="PRIMARY SERVICE CITY" className="bg-background rounded-xl h-12 uppercase text-xs font-bold" value={formData.location} onChange={handleChange} required />
                    <Label className="cursor-pointer border border-border h-12 rounded-xl flex items-center justify-center bg-background hover:bg-muted text-[10px] font-black uppercase tracking-widest">
                        <Upload className="mr-2 h-4 w-4" /> {verificationDocs.length > 0 ? `${verificationDocs.length} Documents Staged` : "Identity / Trade Licenses"}
                        <input type="file" multiple hidden onChange={(e) => setVerificationDocs(e.target.files)} />
                    </Label>
                </div>
            )}

            <div className="flex items-center space-x-2 ml-1">
                <Checkbox id="terms" checked={formData.agreeToTerms} onCheckedChange={(val) => setFormData({...formData, agreeToTerms: val})} />
                <Label htmlFor="terms" className="text-[10px] font-black uppercase tracking-widest cursor-pointer opacity-70">Acknowledge Terms & Protocols</Label>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 rounded-2xl shadow-xl uppercase text-[11px] tracking-widest border-none" type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Initiate Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
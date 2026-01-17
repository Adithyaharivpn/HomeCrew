import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../api/useAuth"; 
import api from "../../api/axiosConfig"; // Using your custom instance

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react"; 

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleChange = (e) => {
    if (error) setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Use 'api' instance instead of raw axios
      const response = await api.post("/api/auth/login", formData);

      if (response.data.token) {
        await login(response.data.token);
        navigate('/dashboard'); // Direct to unified dashboard
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid Credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/3 blur-[120px] pointer-events-none -z-10" />

      <Card className="w-full max-w-105 border-border bg-card rounded-3xl shadow-2xl overflow-hidden">
        <CardHeader className="pt-12 text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-600/20">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground leading-none">
            Secure Login
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-4">Platform Authentication Required</p>
        </CardHeader>

        <CardContent className="pb-12 px-10 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-[10px] font-black uppercase text-destructive text-center tracking-widest animate-in fade-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-semibold ml-1 text-muted-foreground">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute z-10 left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                <Input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-12 h-14 rounded-xl"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold ml-1 text-muted-foreground">Password</Label>
              <div className="relative group">
                <Lock className="absolute z-10 left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-12 pr-12 h-14 rounded-xl"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 rounded-xl text-sm tracking-wide border-none shadow-lg" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
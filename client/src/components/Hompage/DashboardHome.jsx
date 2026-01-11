import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { IndianRupee, Users, Briefcase, Star, ShieldCheck, Zap, Clock, Loader2, ArrowRight, Badge } from "lucide-react";
import api from "../../api/axiosConfig";
import { useAuth } from "../../api/useAuth";
import { useNavigate } from "react-router-dom";

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Parallel fetch for stats and activity
        const [statsRes, activityRes] = await Promise.all([
          api.get("/api/dashboard/stats"),
          api.get("/api/dashboard/recent-activity").catch(() => ({ data: [] })) 
        ]);

        setStats(statsRes.data);
        setActivities(activityRes.data || []);
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  const getRoleContent = () => {
    // Safe access variable
    const s = stats || {};
    
    switch (user?.role) {
      case "admin":
        return [
          { title: "Platform Revenue", value: `₹${s.totalRevenue || 0}`, icon: IndianRupee, color: "text-emerald-500" },
          { title: "Active Users", value: s.totalUsers || 0, icon: Users, color: "text-blue-500" },
          { 
            title: "Pending Verifs", 
            value: s.pendingVerifications || 0, 
            icon: ShieldCheck, 
            color: "text-rose-500",
            alert: s.pendingVerifications > 0,
            path: "/dashboard/verifications"
          },
        ];
      case "tradesperson":
        return [
          { title: "Total Earned", value: `₹${s.totalEarned || 0}`, icon: IndianRupee, color: "text-emerald-500" },
          { title: "Active Jobs", value: s.activeJobs || 0, icon: Briefcase, color: "text-blue-500" },
          { title: "Average Rating", value: `${s.rating || 0}/5`, icon: Star, color: "text-amber-500" },
        ];
      case "customer":
        return [
          { title: "Total Spent", value: `₹${s.totalSpent || 0}`, icon: IndianRupee, color: "text-blue-500" },
          { title: "Jobs Posted", value: s.totalJobs || 0, icon: Zap, color: "text-purple-500" },
          { title: "Ongoing Tasks", value: s.ongoingTasks || 0, icon: Briefcase, color: "text-emerald-500" },
        ];
      default: return [];
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
    </div>
  );

  const cards = getRoleContent();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tight italic leading-none">
            Welcome, <span className="text-blue-600 underline decoration-blue-600/20 underline-offset-8">{user?.name?.split(' ')[0]}</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-4 ml-1">
            System Access Level: <span className="text-foreground">{user?.role}</span>
          </p>
        </div>
      </div>

      {/* Grid: All cards are standardized h-14/rounded-2xl */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <Card 
            key={i} 
            onClick={() => card.path && navigate(card.path)}
            className={`bg-card border-border rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group ${card.alert ? "ring-2 ring-rose-500/50 bg-rose-500/5" : ""}`}
          >
            <CardContent className="p-8 flex items-center gap-6">
              <div className="h-16 w-16 bg-muted rounded-[1.5rem] flex items-center justify-center relative shadow-inner group-hover:bg-background transition-colors">
                <card.icon className={`h-8 w-8 ${card.color}`} />
                {card.alert && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-600 rounded-full border-4 border-card animate-pulse" />
                )}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{card.title}</p>
                <h3 className="text-3xl font-black italic tracking-tighter mt-1">{card.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity / Feed Section */}
      <div className="bg-card border border-border rounded-[3rem] overflow-hidden shadow-2xl">
         <div className="p-8 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                <Clock className="h-4 w-4 text-blue-600" /> Live Platform Feed
            </h3>
            <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest px-3 border-border">Real-time updates</Badge>
         </div>
         
         <div className="p-4 space-y-2">
            {activities.length > 0 ? (
              activities.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 hover:bg-muted/40 rounded-[2rem] transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 bg-background rounded-2xl flex items-center justify-center border border-border group-hover:scale-110 transition-transform">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{activity.type.replace('_', ' ')}</p>
                      <p className="text-sm font-bold text-foreground leading-none">{activity.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">
                        {new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[2.5rem] m-4 bg-muted/5">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-muted-foreground opacity-20" />
                </div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    No recent events in your pipeline
                </p>
              </div>
            )}
         </div>
         {activities.length > 0 && (
             <div className="p-6 bg-muted/10 border-t border-border flex justify-center">
                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-600/10 rounded-xl h-10 px-8">
                    View Full Audit Log <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
             </div>
         )}
      </div>
    </div>
  );
};

export default DashboardHome;
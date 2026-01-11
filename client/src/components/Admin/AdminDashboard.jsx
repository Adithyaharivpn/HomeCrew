import React, { useState, useEffect, useMemo } from "react";
import api from "../../api/axiosConfig";
import { useAuth } from "../../api/useAuth";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell
} from "recharts";

// Icons
import { 
  Users, Briefcase, HardHat, Terminal, Trash2, Edit3, RefreshCcw, 
  Search, LogOut, Loader2, ShieldAlert 
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { logout } = useAuth();
  
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0, totalTradespeople: 0, totalCustomers: 0, totalJobs: 0,
  });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]); 
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, usersRes, logsRes, jobsRes] = await Promise.all([
          api.get("/api/admin/dashboard"),
          api.get("/api/admin/users"),
          api.get("/api/admin/logs"),
          api.get("/api/admin/jobs"), 
        ]);
        
        setDashboardData(dashboardRes.data);
        setUsers(usersRes.data);
        setLogs(logsRes.data);
        setJobs(jobsRes.data);
      } catch (err) {
        setError("Failed to load dashboard data.");
        if (err.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [logout]);

  const handleDeactivateUser = async (userId) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers(users.map((u) => (u._id === userId ? { ...u, isActive: false } : u)));
      toast.success("User deactivated");
    } catch (err) { toast.error("Action failed"); }
  };

  const handleReactivateUser = async (userId) => {
    try {
      const response = await api.patch(`/api/admin/users/${userId}/reactivate`);
      setUsers(users.map((u) => (u._id === userId ? response.data : u)));
      toast.success("User reactivated");
    } catch (err) { toast.error("Action failed"); }
  };

  const handleUpdateUser = async () => {
    try {
      const response = await api.put(`/api/admin/users/${editingUser._id}`, editingUser);
      setUsers(users.map((u) => (u._id === editingUser._id ? response.data : u)));
      setIsModalOpen(false);
      toast.success("User updated");
    } catch (err) { toast.error("Update failed"); }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Permanently delete job?")) return;
    try {
      await api.delete(`/api/admin/jobs/${jobId}`);
      setJobs(jobs.filter(j => j._id !== jobId));
      toast.success("Job deleted");
    } catch (err) { toast.error("Delete failed"); }
  };

  const filteredData = useMemo(() => {
    const lowerFilter = filter.toLowerCase();
    if (activeTab === "users") {
      return users.filter(u => u.name.toLowerCase().includes(lowerFilter) || u.email.toLowerCase().includes(lowerFilter));
    }
    return jobs.filter(j => j.title.toLowerCase().includes(lowerFilter) || (j.user?.name || "").toLowerCase().includes(lowerFilter));
  }, [users, jobs, filter, activeTab]);

  const chartData = [
    { name: "Users", value: dashboardData.totalUsers, color: "#6366f1" },
    { name: "Trades", value: dashboardData.totalTradespeople, color: "#f59e0b" },
    { name: "Customers", value: dashboardData.totalCustomers, color: "#10b981" }
  ];

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (error) return <div className="p-8 text-center text-destructive font-black uppercase tracking-widest">{error}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic text-foreground">Admin Console</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">Platform management and surveillance</p>
        </div>
        <Button variant="destructive" size="sm" onClick={logout} className="font-black uppercase text-[10px] tracking-widest rounded-xl">
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
            { label: "Ecosystem Users", val: dashboardData.totalUsers, icon: Users, color: "text-indigo-500", border: "border-l-indigo-500" },
            { label: "Active Postings", val: dashboardData.totalJobs, icon: Briefcase, color: "text-amber-500", border: "border-l-amber-500" },
            { label: "Registered Trades", val: dashboardData.totalTradespeople, icon: HardHat, color: "text-emerald-500", border: "border-l-emerald-500" }
        ].map((stat, i) => (
            <Card key={i} className={`bg-card border-border shadow-sm border-l-4 ${stat.border} rounded-2xl overflow-hidden`}>
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                        <div className="text-3xl font-black italic">{stat.val}</div>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CHART CARD */}
        <Card className="bg-card border-border rounded-[2rem] overflow-hidden shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest italic">User Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pr-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 900}} />
                <RechartsTooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '1rem', fontWeight: 'bold' }} 
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LOGS CARD (Optimized Dark Mode Terminal) */}
        <Card className="bg-slate-950 border-slate-800 rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-white/5">
          <CardHeader className="bg-slate-900/50 border-b border-slate-800 flex flex-row items-center gap-2 py-3 px-6">
            <Terminal className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400">Live_System_Logs</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[300px]">
            <div className="p-4 space-y-2 font-mono">
              {logs.length === 0 ? (
                <div className="text-slate-600 text-xs italic">_listening_for_system_events...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex gap-4 hover:bg-white/5 p-1 rounded transition-colors text-[11px]">
                    <span className="text-slate-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={log.level === 'error' ? 'text-rose-500' : log.level === 'warn' ? 'text-amber-400' : 'text-sky-400'}>
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className="text-slate-300 truncate font-medium">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* MANAGEMENT TABS */}
      <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-8 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-border pb-6 bg-muted/20">
            <TabsList className="bg-muted h-12 p-1 rounded-xl border border-border">
              <TabsTrigger value="users" className="font-black uppercase text-[10px] tracking-widest px-6 data-[state=active]:bg-card">Users</TabsTrigger>
              <TabsTrigger value="jobs" className="font-black uppercase text-[10px] tracking-widest px-6 data-[state=active]:bg-card">Jobs</TabsTrigger>
            </TabsList>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={`Filter ${activeTab}...`} 
                className="pl-10 h-12 bg-background border-border rounded-xl font-bold focus-visible:ring-primary/20" 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)} 
              />
            </div>
          </div>

          <TabsContent value="users" className="m-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border">
                  <TableHead className="w-16 px-8"></TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest py-5">User Details</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Role</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-widest px-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((user) => (
                  <TableRow key={user._id} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="px-8 py-4">
                      <Avatar className="h-10 w-10 border-2 border-border shadow-sm">
                        <AvatarImage src={user.profilePictureUrl} />
                        <AvatarFallback className="font-black bg-primary/10 text-primary uppercase">{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div className="font-black uppercase tracking-tight text-foreground">{user.name}</div>
                      <div className="text-[10px] font-bold text-muted-foreground lowercase">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-black uppercase text-[9px] tracking-widest px-3 border-primary/20 text-primary">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={user.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black uppercase text-[9px]" : "bg-destructive/10 text-destructive border-destructive/20 font-black uppercase text-[9px]"}>
                        {user.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-blue-500" onClick={() => {setEditingUser(user); setIsModalOpen(true);}}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        {user.isActive ? (
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-destructive" onClick={() => handleDeactivateUser(user._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-emerald-500/10 text-emerald-500" onClick={() => handleReactivateUser(user._id)}>
                            <RefreshCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="jobs" className="m-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border">
                  <TableHead className="font-black uppercase text-[10px] tracking-widest py-5 px-8">Job Title</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Posted By</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Category</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-widest px-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((job) => (
                  <TableRow key={job._id} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="font-black uppercase tracking-tight py-4 px-8">{job.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={job.user?.profilePictureUrl} />
                          <AvatarFallback className="text-[8px] font-black">{job.user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{job.user?.name || "Unknown"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] font-black uppercase tracking-widest opacity-70">{job.category}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-black uppercase text-[9px] tracking-widest border-none px-3">{job.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-destructive" onClick={() => handleDeleteJob(job._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Card>

      {/* EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-primary" /> Modify Entity
            </DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin-level authorization required</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Legal Name</label>
                <Input className="h-12 bg-muted/30 rounded-xl font-bold border-border" value={editingUser.name || ""} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Email Identifier</label>
                <Input className="h-12 bg-muted/30 rounded-xl font-bold border-border" value={editingUser.email || ""} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">System Privilege</label>
                <Input className="h-12 bg-muted/30 rounded-xl font-bold border-border" value={editingUser.role || ""} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} placeholder="customer, tradesperson, admin" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-3">
            <Button variant="ghost" className="font-bold uppercase text-[10px]" onClick={() => setIsModalOpen(false)}>Discard</Button>
            <Button onClick={handleUpdateUser} className="bg-primary hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest rounded-xl h-11 px-8 border-none">Commit Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
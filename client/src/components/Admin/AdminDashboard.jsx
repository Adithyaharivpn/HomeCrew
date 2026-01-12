import React, { useState, useEffect, useMemo } from "react";
import api from "../../api/axiosConfig";
import { useAuth } from "../../api/useAuth";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

import { 
  Search, LogOut, Loader2, ShieldAlert,
  Users, Briefcase, HardHat, Trash2, Edit3, RefreshCcw, MoreHorizontal
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminDashboard = () => {
  const { logout } = useAuth();
  
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0, totalTradespeople: 0, totalCustomers: 0, totalJobs: 0,
  });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]); 

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
        const [dashboardRes, usersRes, jobsRes] = await Promise.all([
          api.get("/api/admin/dashboard"),
          api.get("/api/admin/users"),
          api.get("/api/admin/jobs"), 
        ]);
        
        setDashboardData(dashboardRes.data);
        setUsers(usersRes.data);
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

  if (loading) return (
    <div className="space-y-8 py-12">
        <div className="flex justify-between items-center px-2">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-3 w-64" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <Card key={i} className="bg-card border-border border-l-4 rounded-2xl">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-8 w-12" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
        <Card className="bg-card border-border rounded-[2rem] h-[350px] p-8">
            <Skeleton className="h-full w-full rounded-xl" />
        </Card>
        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden">
            <div className="p-8 flex justify-between gap-6 bg-muted/20">
                <Skeleton className="h-12 w-48 rounded-xl" />
                <Skeleton className="h-12 w-80 rounded-xl" />
            </div>
            <Table>
                <TableBody>
                    {[1, 2, 3, 4].map(i => (
                        <TableRow key={i} className="border-border">
                            <TableCell className="px-8 py-6"><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                            <TableCell><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            <TableCell className="text-right px-8"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    </div>
  );
  if (error) return <div className="p-8 text-center text-destructive font-black uppercase tracking-widest">{error}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic text-foreground">Admin Console</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">Platform management and surveillance</p>
        </div>
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

      <div className="grid grid-cols-1">
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
            <div className="overflow-x-auto">
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {setEditingUser(user); setIsModalOpen(true);}}>
                              <Edit3 className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.isActive ? (
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeactivateUser(user._id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Deactivate Account
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-emerald-500 focus:text-emerald-500" onClick={() => handleReactivateUser(user._id)}>
                                <RefreshCcw className="mr-2 h-4 w-4" /> Reactivate Account
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="m-0">
            <div className="overflow-x-auto">
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteJob(job._id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Job
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
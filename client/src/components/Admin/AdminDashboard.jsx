import React, { useState, useEffect, useMemo } from "react";
import api from "../../api/axiosConfig";
import { useAuth } from "../../api/useAuth";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell,
  Area, AreaChart
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

import { 
  Search, LogOut, Loader2, ShieldAlert,
  Users, Briefcase, HardHat, Trash2, Edit3, RefreshCcw, MoreHorizontal, Plus, Tags,
  TrendingUp, TrendingDown 
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
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
    totalUsers: 0, totalTradespeople: 0, totalCustomers: 0, totalJobs: 0, totalRevenue: 0,
  });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]); 
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newService, setNewService] = useState({ service_name: "", description: "", keywords: "" });
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState("users");

  const [timeRange, setTimeRange] = React.useState("7d");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, usersRes, jobsRes, servicesRes] = await Promise.all([
          api.get("/api/admin/dashboard"),
          api.get("/api/admin/users"),
          api.get("/api/admin/jobs"),
          api.get("/api/service"),
        ]);
        
        setDashboardData(dashboardRes.data);
        setUsers(usersRes.data);
        setJobs(jobsRes.data);
        setServices(servicesRes.data);
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

  const handleCreateService = async () => {
    try {
      const response = await api.post("/api/service", {
        ...newService,
        keywords: newService.keywords.split(',').map(k => k.trim())
      });
      setServices([...services, response.data]);
      setIsServiceModalOpen(false);
      setNewService({ service_name: "", description: "", keywords: "" });
      toast.success("Category added");
    } catch (err) { toast.error("Failed to add category"); }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/api/service/${serviceId}`);
      setServices(services.filter(s => s._id !== serviceId));
      toast.success("Category deleted");
    } catch (err) { toast.error("Delete failed"); }
  };

  const filteredData = useMemo(() => {
    const lowerFilter = filter.toLowerCase();
    if (activeTab === "users") {
      return users.filter(u => u.name.toLowerCase().includes(lowerFilter) || u.email.toLowerCase().includes(lowerFilter));
    }
    if (activeTab === "jobs") {
      return jobs.filter(j => j.title.toLowerCase().includes(lowerFilter) || (j.user?.name || "").toLowerCase().includes(lowerFilter));
    }
    return services.filter(s => s.service_name.toLowerCase().includes(lowerFilter) || s.description.toLowerCase().includes(lowerFilter));
  }, [users, jobs, services, filter, activeTab]);

  // Process Real Data for Chart
  const processedChartData = useMemo(() => {
    // 1. Create a map of date -> { customers: 0, trades: 0, jobs: 0 }
    const dataMap = new Map();
    const today = new Date();
    
    // Initialize last 90 days with 0
    for (let i = 0; i < 90; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dataMap.set(dateStr, { date: dateStr, customers: 0, trades: 0, jobs: 0 });
    }

    // 2. Populate with user data
    users.forEach(user => {
        if (!user.createdAt) return;
        const dateStr = new Date(user.createdAt).toISOString().split('T')[0];
        if (dataMap.has(dateStr)) {
            const entry = dataMap.get(dateStr);
            if (user.role === 'customer') entry.customers += 1;
            else if (user.role === 'tradesperson') entry.trades += 1;
        }
    });

    // 3. Populate with job data
    jobs.forEach(job => {
        if (!job.createdAt) return;
        const dateStr = new Date(job.createdAt).toISOString().split('T')[0];
        if (dataMap.has(dateStr)) {
            const entry = dataMap.get(dateStr);
            entry.jobs += 1;
        }
    });

    // 4. Convert to array and sort
    return Array.from(dataMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [users, jobs]);

  const filteredChartData = processedChartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date() // Use current date as reference
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  });

  const chartConfig = {
    registrations: {
      label: "Platform Activity",
    },
    customers: {
      label: "New Customers",
      color: "hsl(var(--chart-1))",
    },
    trades: {
      label: "New Tradespeople",
      color: "hsl(var(--chart-2))",
    },
    jobs: {
        label: "Jobs Posted",
        color: "hsl(var(--chart-3))",
    }
  };

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
        <Card className="bg-card border-border rounded-4xl h-87.5 p-8">
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="grid gap-1">
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Total Revenue</CardDescription>
            <CardTitle className="text-2xl font-black tabular-nums">
                ₹{(dashboardData.totalRevenue || 0).toLocaleString()}
            </CardTitle>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1 font-bold">
              <TrendingUp className="h-3 w-3" />
              +12.5%
            </Badge>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 p-6 pt-0 text-[10px] font-medium text-muted-foreground">
          <div className="flex gap-1.5 items-center">
             <span className="text-emerald-500 flex items-center gap-1 font-bold">Training up <TrendingUp className="h-3 w-3" /></span> 
             <span>this month</span>
          </div>
        </CardFooter>
      </Card>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="grid gap-1">
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">New Customers</CardDescription>
            <CardTitle className="text-2xl font-black tabular-nums">
                {dashboardData.totalCustomers.toLocaleString()}
            </CardTitle>
          </div>
           <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 gap-1 font-bold">
              <TrendingDown className="h-3 w-3" />
              -2.1%
            </Badge>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 p-6 pt-0 text-[10px] font-medium text-muted-foreground">
          <div className="flex gap-1.5 items-center">
             <span className="text-rose-500 flex items-center gap-1 font-bold">Down <TrendingDown className="h-3 w-3" /></span> 
             <span>from last month</span>
          </div>
        </CardFooter>
      </Card>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
           <div className="grid gap-1">
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Active Accounts</CardDescription>
                <CardTitle className="text-2xl font-black tabular-nums">
                    {dashboardData.totalUsers.toLocaleString()}
                </CardTitle>
           </div>
           <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1 font-bold">
              <TrendingUp className="h-3 w-3" />
              +4.3%
            </Badge>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 p-6 pt-0 text-[10px] font-medium text-muted-foreground">
          <div className="flex gap-1.5 items-center">
             <span className="text-emerald-500 flex items-center gap-1 font-bold">Strong retention <TrendingUp className="h-3 w-3" /></span> 
             <span>+1.2%</span>
          </div>
        </CardFooter>
      </Card>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="grid gap-1">
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Active Jobs</CardDescription>
            <CardTitle className="text-2xl font-black tabular-nums">
                {dashboardData.totalJobs.toLocaleString()}
            </CardTitle>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1 font-bold">
              <TrendingUp className="h-3 w-3" />
              +8.1%
            </Badge>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 p-6 pt-0 text-[10px] font-medium text-muted-foreground">
          <div className="flex gap-1.5 items-center">
             <span className="text-emerald-500 flex items-center gap-1 font-bold">Growing demand <TrendingUp className="h-3 w-3" /></span> 
             <span>on platform</span>
          </div>
        </CardFooter>
      </Card>
      </div>

      {/* CHART CARD */}
      <div className="grid grid-cols-1">
        <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-xl border">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b border-border/50 py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
                <CardTitle className="text-xl font-black uppercase tracking-tight italic">
                Platform Growth
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">
                Showing new registration trends
                </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger
                className="w-[160px] rounded-xl font-bold uppercase text-[10px] tracking-widest sm:ml-auto"
                aria-label="Select a value"
                >
                <SelectValue placeholder="Last 3 months" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                <SelectItem value="90d" className="rounded-lg font-bold uppercase text-[10px] tracking-widest">
                    Last 3 months
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg font-bold uppercase text-[10px] tracking-widest">
                    Last 30 days
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg font-bold uppercase text-[10px] tracking-widest">
                    Last 7 days
                </SelectItem>
                </SelectContent>
            </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[250px] w-full"
            >
                <AreaChart data={filteredChartData}>
                <defs>
                    <linearGradient id="fillCustomers" x1="0" y1="0" x2="0" y2="1">
                    <stop
                        offset="5%"
                        stopColor="var(--color-customers)"
                        stopOpacity={0.8}
                    />
                    <stop
                        offset="95%"
                        stopColor="var(--color-customers)"
                        stopOpacity={0.1}
                    />
                    </linearGradient>
                    <linearGradient id="fillTrades" x1="0" y1="0" x2="0" y2="1">
                    <stop
                        offset="5%"
                        stopColor="var(--color-trades)"
                        stopOpacity={0.8}
                    />
                    <stop
                        offset="95%"
                        stopColor="var(--color-trades)"
                        stopOpacity={0.1}
                    />
                    </linearGradient>
                    <linearGradient id="fillJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop
                        offset="5%"
                        stopColor="var(--color-jobs)"
                        stopOpacity={0.8}
                    />
                    <stop
                        offset="95%"
                        stopColor="var(--color-jobs)"
                        stopOpacity={0.1}
                    />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    })
                    }}
                />
                <ChartTooltip
                    cursor={false}
                    content={
                    <ChartTooltipContent
                        labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        })
                        }}
                        indicator="dot"
                    />
                    }
                />
                <Area
                    dataKey="jobs"
                    type="natural"
                    fill="url(#fillJobs)"
                    stroke="var(--color-jobs)"
                    stackId="a"
                />
                 <Area
                    dataKey="trades"
                    type="natural"
                    fill="url(#fillTrades)"
                    stroke="var(--color-trades)"
                    stackId="a"
                />
                <Area
                    dataKey="customers"
                    type="natural"
                    fill="url(#fillCustomers)"
                    stroke="var(--color-customers)"
                    stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
            </ChartContainer>
            </CardContent>
        </Card>
      </div>

      {/* MANAGEMENT TABS */}
      <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="p-4 sm:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-border bg-muted/20">
            <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
               <TabsList className="bg-muted h-12 p-1 rounded-xl border border-border inline-flex w-full lg:w-auto min-w-max">
                <TabsTrigger value="users" className="flex-1 lg:flex-none font-black uppercase text-[10px] tracking-widest px-4 md:px-6 data-[state=active]:bg-card">Users</TabsTrigger>
                <TabsTrigger value="jobs" className="flex-1 lg:flex-none font-black uppercase text-[10px] tracking-widest px-4 md:px-6 data-[state=active]:bg-card">Jobs</TabsTrigger>
                <TabsTrigger value="services" className="flex-1 lg:flex-none font-black uppercase text-[10px] tracking-widest px-4 md:px-6 data-[state=active]:bg-card">Categories</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={`Filter ${activeTab}...`} 
                  className="pl-10 h-12 bg-background border-border rounded-xl font-bold focus-visible:ring-primary/20 w-full" 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)} 
                />
              </div>
              {activeTab === "services" && (
                <Button onClick={() => setIsServiceModalOpen(true)} className="h-12 w-full sm:w-auto px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg whitespace-nowrap">
                  <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
              )}
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
          <TabsContent value="services" className="m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border">
                    <TableHead className="font-black uppercase text-[10px] tracking-widest py-5 px-8">Category Name</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Description</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Keywords</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px] tracking-widest px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((service) => (
                    <TableRow key={service._id} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell className="font-black uppercase tracking-tight py-4 px-8">{service.service_name}</TableCell>
                      <TableCell className="text-[12px] font-medium text-muted-foreground">{service.description}</TableCell>
                      <TableCell>
                         <div className="flex flex-wrap gap-1">
                            {(service.keywords || []).map((k, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] uppercase tracking-wider">{k}</Badge>
                            ))}
                         </div>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteService(service._id)}>
                             <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* ADD SERVICE MODAL */}
      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-2">
                <Tags className="h-6 w-6 text-primary" /> Add Category
            </DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Define new service taxonomy</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Category Name</label>
              <Input className="h-12 bg-muted/30 rounded-xl font-bold border-border" value={newService.service_name} onChange={(e) => setNewService({...newService, service_name: e.target.value})} placeholder="e.g. Plumbing" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Description</label>
              <Input className="h-12 bg-muted/30 rounded-xl font-bold border-border" value={newService.description} onChange={(e) => setNewService({...newService, description: e.target.value})} placeholder="Brief overview..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Keywords (comma separated)</label>
              <Input className="h-12 bg-muted/30 rounded-xl font-bold border-border" value={newService.keywords} onChange={(e) => setNewService({...newService, keywords: e.target.value})} placeholder="leak, pipe, water..." />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" className="font-bold uppercase text-[10px]" onClick={() => setIsServiceModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateService} className="bg-primary hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest rounded-xl h-11 px-8 border-none">Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
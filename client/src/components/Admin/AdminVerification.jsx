import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import {
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  ShieldCheck,
  Loader2,
  FileText,
  Search,
  Info
} from "lucide-react";
// UI Components
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const AdminVerification = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [filter, setFilter] = useState("");
  
  // AlertDialog state
  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    userId: null, 
    status: "",
    title: "",
    description: "" 
  });
  
  // Details Dialog state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/tradespeople");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to load pipeline data");
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (userId, status) => {
    setConfirmDialog({
        open: true,
        userId,
        status,
        title: `Confirm ${status === 'approved' ? 'Verification' : 'Rejection'}`,
        description: `Are you sure you want to ${status === 'approved' ? 'approve' : 'reject'} this tradesperson's verification request? This will affect their ability to work on the platform.`
    });
  };

  const executeAction = async () => {
    const { userId, status } = confirmDialog;
    try {
      await api.put("/api/admin/verify", { userId, status });
      toast.success(`Entity updated to ${status}`);
      setConfirmDialog({ ...confirmDialog, open: false });
      fetchUsers();
    } catch (err) {
      toast.error("Action rejected by server");
    }
  };

  const handleViewDetails = (user) => {
      setSelectedUser(user);
      setDetailsOpen(true);
  };

  // Filter Logic
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(filter.toLowerCase()) || 
    u.email?.toLowerCase().includes(filter.toLowerCase())
  );

  const pendingUsers = filteredUsers.filter((u) => u.verificationStatus === "pending");
  const approvedUsers = filteredUsers.filter((u) => u.verificationStatus === "approved");
  const rejectedUsers = filteredUsers.filter((u) => ["rejected", "unverified"].includes(u.verificationStatus));

    const renderTable = (data) => (
    <div className="overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="font-black uppercase text-[10px] tracking-widest py-6 px-8">Tradesperson</TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest">Credentials</TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest">Status</TableHead>
            <TableHead className="text-right font-black uppercase text-[10px] tracking-widest px-8">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-64 text-center text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em]">
                No pending records in pipeline
              </TableCell>
            </TableRow>
          ) : (
            data.map((user) => (
              <TableRow key={user._id} className="border-border hover:bg-muted/30 transition-colors">
                <TableCell className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border-2 border-border shadow-md">
                      <AvatarImage src={user.profilePictureUrl} />
                      <AvatarFallback className="font-black bg-primary/10 text-primary">{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-black uppercase tracking-tight text-foreground">{user.name}</span>
                      <span className="text-[10px] font-bold text-muted-foreground lowercase">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {user.verificationDocuments?.length > 0 ? (
                    <Button variant="ghost" size="sm" asChild className="h-10 rounded-xl font-black text-[10px] uppercase text-blue-500 hover:bg-blue-500/10 tracking-widest">
                      <a href={user.verificationDocuments[0]} target="_blank" rel="noopener noreferrer">
                        <Eye className="mr-2 h-4 w-4" /> View ID
                      </a>
                    </Button>
                  ) : (
                    <span className="text-[9px] font-black uppercase text-muted-foreground opacity-40">Missing Docs</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={`font-black uppercase text-[9px] tracking-widest px-3 py-1 border-none ${
                    user.verificationStatus === 'approved' ? "bg-emerald-500/10 text-emerald-500" : 
                    user.verificationStatus === 'pending' ? "bg-amber-500/10 text-amber-500" : "bg-destructive/10 text-destructive"
                  }`}>
                    {user.verificationStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-8">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" className="rounded-xl h-10 w-10 p-0 hover:bg-muted" onClick={() => handleViewDetails(user)}>
                        <Info className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    {user.verificationStatus !== "approved" && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] h-10 px-6 rounded-xl shadow-lg shadow-emerald-600/20" onClick={() => handleActionClick(user._id, "approved")}>
                        Approve
                      </Button>
                    )}
                    {user.verificationStatus !== "rejected" && (
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 font-black uppercase text-[9px] h-10 px-6 rounded-xl" onClick={() => handleActionClick(user._id, "rejected")}>
                        Reject
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) return (
    <div className="space-y-8 py-12">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
        <Skeleton className="h-14 w-40 rounded-xl" />
      </div>
      <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden">
        <div className="p-8 flex justify-between gap-6 border-b border-border bg-muted/20">
          <Skeleton className="h-14 w-96 rounded-2xl" />
          <Skeleton className="h-14 w-full max-w-md rounded-2xl" />
        </div>
        <Table>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i} className="border-border">
                <TableCell className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 text-left">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-8 w-24 rounded-xl" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell className="text-right px-8"><Skeleton className="h-10 w-48 ml-auto rounded-xl" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
                <ShieldCheck className="h-7 w-7 text-blue-600" />
            </div>
            <div>
                <h1 className="text-3xl font-black tracking-tight uppercase italic text-foreground leading-none">Entity Validation</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-2">Security protocol: identity verification pipeline</p>
            </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} className="font-black uppercase text-[10px] tracking-widest rounded-xl border-border hover:bg-muted h-14 px-8 shadow-inner">
          <RefreshCw className="mr-3 h-4 w-4" /> Refresh Data
        </Button>
      </div>

      {/* Main Container */}
      <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="p-4 sm:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-border bg-muted/20">
            <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
               <TabsList className="bg-muted h-14 p-1.5 rounded-2xl border border-border inline-flex w-full lg:w-auto min-w-max">
                <TabsTrigger value="pending" className="relative font-black uppercase text-[10px] tracking-widest px-8 h-full data-[state=active]:bg-card rounded-xl">
                  Pending
                  {pendingUsers.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white font-black shadow-xl">
                      {pendingUsers.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="verified" className="font-black uppercase text-[10px] tracking-widest px-8 h-full data-[state=active]:bg-card rounded-xl">
                  Verified ({approvedUsers.length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="font-black uppercase text-[10px] tracking-widest px-8 h-full data-[state=active]:bg-card rounded-xl">
                  Rejected ({rejectedUsers.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="relative w-full lg:w-[400px] group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search pipeline by name..." 
                className="pl-12 h-14 bg-background border-border rounded-2xl font-bold focus-visible:ring-primary/20 shadow-inner italic w-full" 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)} 
              />
            </div>
          </div>

          <CardContent className="p-0">
            <TabsContent value="pending" className="m-0 outline-none">{renderTable(pendingUsers)}</TabsContent>
            <TabsContent value="verified" className="m-0 outline-none">{renderTable(approvedUsers)}</TabsContent>
            <TabsContent value="rejected" className="m-0 outline-none">{renderTable(rejectedUsers)}</TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border rounded-[2.5rem] p-0 overflow-hidden">
          {selectedUser && (
            <>
              <div className="bg-muted/30 p-8 border-b border-border flex items-center gap-6">
                 <Avatar className="h-24 w-24 border-4 border-card shadow-xl">
                    <AvatarImage src={selectedUser.profilePictureUrl} />
                    <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">{selectedUser.name?.charAt(0)}</AvatarFallback>
                 </Avatar>
                 <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">{selectedUser.name}</h2>
                    <p className="text-sm font-bold text-muted-foreground">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-3">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-background/50">{selectedUser.role}</Badge>
                        <Badge className={`${selectedUser.isVerified ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"} text-[10px] uppercase tracking-widest border-none`}>
                            {selectedUser.isVerified ? "Email Verified" : "Email Unverified"}
                        </Badge>
                    </div>
                 </div>
              </div>
              
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Phone</label>
                        <p className="font-bold text-sm">{selectedUser.phoneNumber || "Not provided"}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</label>
                        <p className="font-bold text-sm">{selectedUser.location || "Not provided"}</p>
                    </div>
                    {selectedUser.role === 'tradesperson' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trade Specialization</label>
                                <p className="font-bold text-sm">{selectedUser.tradeCategory || "General/Unspecified"}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Experience</label>
                                <p className="font-bold text-sm">{selectedUser.experience ? `${selectedUser.experience} Years` : "Not specified"}</p>
                            </div>
                        </>
                    )}
                 </div>
                 
                 {selectedUser.bio && (
                    <div className="space-y-2 bg-muted/20 p-4 rounded-xl">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Professional Bio</label>
                        <p className="text-sm font-medium leading-relaxed">{selectedUser.bio}</p>
                    </div>
                 )}
                 
                 <div className="pt-4 flex justify-end">
                    <Button onClick={() => setDetailsOpen(false)} className="bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest rounded-xl h-10 px-6">
                        Close Record
                    </Button>
                 </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDialog.open} onOpenChange={(o) => setConfirmDialog(prev => ({ ...prev, open: o }))}>
        <AlertDialogContent className="bg-card border-border rounded-[2.5rem] p-10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase italic tracking-tight">{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium text-lg leading-relaxed pt-4">
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-8">
            <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest border-border">Cancel Action</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeAction}
              className={`h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest border-none ${
                confirmDialog.status === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-destructive hover:bg-destructive/90 shadow-destructive/20'
              } shadow-xl`}
            >
              Confirm System Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminVerification;
import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";

// Icons
import {
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  ShieldCheck,
  Loader2,
  FileText,
  Search
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
import { toast } from "sonner";

const AdminVerification = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [filter, setFilter] = useState("");

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

  const handleVerify = async (userId, status) => {
    if (!window.confirm(`Set status to ${status.toUpperCase()} for this entity?`)) return;
    try {
      await api.put("/api/admin/verify", { userId, status });
      toast.success(`Entity updated to ${status}`);
      fetchUsers();
    } catch (err) {
      toast.error("Action rejected by server");
    }
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
                    {user.verificationStatus !== "approved" && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] h-10 px-6 rounded-xl shadow-lg shadow-emerald-600/20" onClick={() => handleVerify(user._id, "approved")}>
                        Approve
                      </Button>
                    )}
                    {user.verificationStatus !== "rejected" && (
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 font-black uppercase text-[9px] h-10 px-6 rounded-xl" onClick={() => handleVerify(user._id, "rejected")}>
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

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

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
          <div className="px-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-border pb-6 bg-muted/20">
            <TabsList className="bg-muted h-14 p-1.5 rounded-2xl border border-border w-full md:w-auto">
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

            <div className="relative w-full md:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search pipeline by name..." 
                className="pl-12 h-14 bg-background border-border rounded-2xl font-bold focus-visible:ring-primary/20 shadow-inner italic" 
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
    </div>
  );
};

export default AdminVerification;
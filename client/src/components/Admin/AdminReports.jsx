import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await api.get('/api/reports');
            setReports(res.data);
        } catch (error) {
            console.error("Failed to fetch reports", error);
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-600 bg-yellow-50">Pending</Badge>;
            case 'reviewed': return <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50">Reviewed</Badge>;
            case 'resolved': return <Badge variant="outline" className="text-emerald-600 border-emerald-600 bg-emerald-50">Resolved</Badge>;
            default: return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const handleUpdateStatus = async (reportId, newStatus) => {
        try {
            await api.put(`/api/reports/${reportId}`, { status: newStatus });
            toast.success("Report status updated");
            fetchReports(); 
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div className="p-8">Loading reports...</div>;

    return (
        <div className="p-6 space-y-6 animate-in fade-in">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-destructive/10 rounded-2xl">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Incident Reports</h1>
                    <p className="text-muted-foreground font-medium">Manage user safety and platform violations.</p>
                </div>
            </div>

            <Card className="rounded-[2rem] overflow-hidden border-border shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-bold uppercase text-[10px] tracking-widest pl-6 py-6">Date</TableHead>
                                <TableHead className="font-bold uppercase text-[10px] tracking-widest py-6">Reporter</TableHead>
                                <TableHead className="font-bold uppercase text-[10px] tracking-widest py-6">Reported User</TableHead>
                                <TableHead className="font-bold uppercase text-[10px] tracking-widest py-6">Reason</TableHead>
                                <TableHead className="font-bold uppercase text-[10px] tracking-widest py-6">Status</TableHead>
                                <TableHead className="font-bold uppercase text-[10px] tracking-widest text-right pr-6 py-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground font-medium italic">All safe! No active reports.</TableCell>
                                </TableRow>
                            ) : (
                                reports.map((report) => (
                                    <TableRow key={report._id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="pl-6 font-bold text-xs text-muted-foreground">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback>{report.reporterId?.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-bold text-sm">{report.reporterId?.name || "Unknown"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                 <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="bg-destructive/10 text-destructive">{report.reportedUserId?.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-bold text-sm text-destructive">{report.reportedUserId?.name || "Unknown"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-xs uppercase text-muted-foreground">
                                            {report.reason.replace(/_/g, " ")}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(report.status)}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="outline" className="h-8 rounded-lg font-bold text-[10px] uppercase">View Details</Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl bg-card border-border rounded-[2rem] p-8">
                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between border-b border-border pb-4">
                                                            <h2 className="text-xl font-black uppercase tracking-tight">Report Details</h2>
                                                            {getStatusBadge(report.status)}
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Reporter</p>
                                                                <p className="font-bold">{report.reporterId?.name} ({report.reporterId?.email})</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Reported User</p>
                                                                <p className="font-bold">{report.reportedUserId?.name} ({report.reportedUserId?.email})</p>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Description</p>
                                                            <div className="bg-muted/30 p-4 rounded-xl text-sm font-medium leading-relaxed">
                                                                "{report.description}"
                                                            </div>
                                                        </div>

                                                        {report.evidenceUrl && (
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Evidence</p>
                                                                <div className="border border-border rounded-xl overflow-hidden max-h-60">
                                                                    <img src={report.evidenceUrl} alt="Evidence" className="w-full object-cover" />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex justify-between items-center pt-4 border-t border-border">
            {report.roomId && (
                <Button variant="secondary" className="font-bold uppercase text-xs h-10 rounded-xl" onClick={() => window.open(`/dashboard/chat/${report.roomId}`, '_blank')}>
                    View Chat Log
                </Button>
            )}
            <div className="flex gap-2 ml-auto">
                <Button variant="outline" className="font-bold uppercase text-xs h-10 rounded-xl" onClick={() => handleUpdateStatus(report._id, 'reviewed')}>Mark Reviewed</Button>
                <Button className="bg-emerald-600 font-bold uppercase text-xs h-10 rounded-xl" onClick={() => handleUpdateStatus(report._id, 'resolved')}>Resolve Case</Button>
            </div>
        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminReports;

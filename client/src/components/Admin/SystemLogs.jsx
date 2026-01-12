import React, { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { Terminal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const SystemLogs = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const logsRes = await api.get("/api/admin/logs");
                setLogs(logsRes.data);
            } catch (err) {
                console.error("Failed to fetch logs", err);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic text-foreground">System Logs</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">Real-time platform events</p>
                </div>
            </div>

            <Card className="bg-slate-950 border-slate-800 rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-white/5 h-[80vh]">
                <CardHeader className="bg-slate-900/50 border-b border-slate-800 flex flex-row items-center gap-2 py-3 px-6">
                    <Terminal className="h-4 w-4 text-emerald-500" />
                    <CardTitle className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400">Live_Console_Output</CardTitle>
                </CardHeader>
                <ScrollArea className="h-full">
                    <div className="p-4 space-y-2 font-mono pb-20">
                        {logs.length === 0 ? (
                            <div className="text-slate-600 text-xs italic">_listening_for_system_events...</div>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className="flex gap-4 hover:bg-white/5 p-1 rounded transition-colors text-[11px]">
                                    <span className="text-slate-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    <span className={log.level === 'error' ? 'text-rose-500' : log.level === 'warn' ? 'text-amber-400' : 'text-sky-400'}>
                                        [{log.level.toUpperCase()}]
                                    </span>
                                    <span className="text-slate-300 font-medium break-all">{log.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </Card>
        </div>
    );
};

export default SystemLogs;

import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import InvoiceModal from "../Payment/InvoiceModel";
import { Eye, ReceiptText, Loader2, IndianRupee } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AdminTransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await api.get("/api/transactions/all-transactions");
        setTransactions(res.data);
      } catch (err) {
        console.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, []);

  const handleViewInvoice = (tx) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
          <ReceiptText className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            All System Payments
          </h1>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Global transaction monitoring
          </p>
        </div>
      </div>

      <Card className="shadow-2xl border-border bg-card rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-bold text-xs text-muted-foreground px-8 py-5">
                  Date
                </TableHead>
                <TableHead className="font-bold text-xs text-muted-foreground">
                  Job
                </TableHead>
                <TableHead className="font-bold text-xs text-muted-foreground">
                  Payer (Customer)
                </TableHead>
                <TableHead className="font-bold text-xs text-muted-foreground">
                  Payee (Provider)
                </TableHead>
                <TableHead className="font-bold text-xs text-muted-foreground">
                  Amount
                </TableHead>
                <TableHead className="font-bold text-xs text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-center font-bold text-xs text-muted-foreground">
                  Invoice
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-48 text-center text-muted-foreground font-bold text-sm"
                  >
                    No transactions found yet.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow
                    key={tx._id}
                    className="border-border hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="px-8 py-5 font-bold text-sm">
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <span className="text-foreground font-bold text-sm">
                        {tx.job?.title || "Direct Payment"}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      {tx.user?.name || "Unknown"}
                      <br />
                      <span className="text-muted-foreground text-[10px]">
                        {tx.user?.email}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      {tx.tradesperson?.name || "Unknown"}
                      <br />
                      <span className="text-muted-foreground text-[10px]">
                        {tx.tradesperson?.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center font-bold text-foreground">
                        <IndianRupee className="h-3 w-3 mr-0.5 text-blue-600" />
                        {tx.amount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          tx.status === "success"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 capitalize font-bold text-[10px] px-3 py-1"
                            : "bg-destructive/10 text-destructive border-destructive/20 capitalize font-bold text-[10px] px-3 py-1"
                        }
                        variant="outline"
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:text-white hover:bg-blue-600 rounded-xl transition-all"
                        onClick={() => handleViewInvoice(tx)}
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InvoiceModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTx}
      />
    </div>
  );
};

export default AdminTransactionHistory;

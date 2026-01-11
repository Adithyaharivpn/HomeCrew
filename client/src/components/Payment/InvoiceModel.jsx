import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, X } from "lucide-react";

const InvoiceModal = ({ open, onClose, transaction }) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white print:shadow-none print:border-none">        
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">INVOICE</h1>
              <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider">
                Order #{transaction._id.slice(-6).toUpperCase()}
              </p>
            </div>
            <div className="md:text-right">
              <h2 className="text-xl font-bold text-slate-900">The HomeCrew</h2>
              <p className="text-sm text-slate-500">123 Service Lane</p>
              <p className="text-sm text-slate-500">Kerala, India</p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Details Section */}
          <div className="flex flex-col md:flex-row justify-between mb-10 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Billed To:</p>
              <p className="text-lg font-bold text-slate-900">{transaction.user?.name || "Customer"}</p>
              <p className="text-sm text-slate-500">{transaction.user?.email}</p>
            </div>
            <div className="md:text-right space-y-1">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date:</p>
                <p className="text-lg font-bold text-slate-900">{new Date(transaction.date).toLocaleDateString()}</p>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Method:</p>
                <p className="text-sm text-slate-700">Stripe (Card)</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border border-slate-100 overflow-hidden mb-8">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-slate-900 px-6 py-4">Service / Job Description</TableHead>
                  <TableHead className="text-right font-bold text-slate-900 px-6 py-4">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-transparent">
                  <TableCell className="px-6 py-6">
                    <p className="font-bold text-slate-900">{transaction.job?.title}</p>
                    <p className="text-xs text-slate-400 mt-1 font-mono">ID: {transaction.job?._id}</p>
                  </TableCell>
                  <TableCell className="text-right text-lg font-medium text-slate-900 px-6 py-6">
                    ₹{transaction.amount}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-full md:w-64 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal:</span>
                <span>₹{transaction.amount}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax (0%):</span>
                <span>₹0</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="text-xl font-bold text-blue-600">Total:</span>
                <span className="text-2xl font-black text-slate-900">₹{transaction.amount}</span>
              </div>
            </div>
          </div>

          {/* Footer / Buttons (Hidden during print) */}
          <div className="mt-12 flex justify-center gap-3 print:hidden">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 px-8 font-bold"
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-5 w-5" />
              Print Invoice
            </Button>
            <Button variant="outline" size="lg" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;
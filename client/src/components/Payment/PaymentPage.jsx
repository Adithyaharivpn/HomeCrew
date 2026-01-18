import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import CheckoutForm from "./CheckoutForm";

// Icons
import { ShieldCheck, Loader2, IndianRupee } from "lucide-react";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";

import { useTheme } from "../Utils/Themeprovider";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentPage = () => {
  const [clientSecret, setClientSecret] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { amount, jobId, type } = location.state || { amount: 0 };

  useEffect(() => {
    if (!amount) return;
    const createIntent = async () => {
      try {
        const res = await api.post("/api/payment/create-payment-intent", {
          amount,
        });
        setClientSecret(res.data.clientSecret);
      } catch (err) {
        console.error(err);
        toast.error("Failed to initialize payment gateway");
      }
    };
    createIntent();
  }, [amount]);

  const handleSuccess = async (paymentId) => {
    try {
      if (type === "escrow" && jobId) {
        // Use the new deposit endpoint for Escrow logic
        await api.put(`/api/jobs/${jobId}/deposit`, { paymentId });
        toast.success("Funds Deposited to Escrow! Job Started.");
      }

      setTimeout(() => {
        navigate("/dashboard/jobs");
      }, 2000);
    } catch (err) {
      console.error("Payment update failed", err);
      toast.error(
        "Payment succeeded but server update failed. Please contact support.",
      );
    }
  };

  const options = {
    clientSecret,
    appearance: {
      theme: theme === "dark" ? "night" : "stripe",
      variables: {
        colorPrimary: "#2563eb", // Matches blue-600
        colorBackground: theme === "dark" ? "#0f172a" : "#ffffff", // Optional: match slate-950
        colorText: theme === "dark" ? "#f8fafc" : "#0f172a",
      },
    },
  };

  if (!amount)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground font-medium">
            Initializing Secure Checkout...
          </p>
        </div>
      </div>
    );

  return (
    <div className="container max-w-lg mx-auto py-20 px-4">
      <Card className="shadow-xl border-border bg-card overflow-hidden">
        {/* Header Section */}
        <CardHeader className="bg-muted/30 border-b border-border text-center py-8">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Secure Payment
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Escrow protection active for this transaction
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          {/* Summary Section */}
          <div className="flex items-center justify-between bg-blue-500/5 p-4 rounded-lg mb-8 border border-blue-500/10">
            <span className="text-blue-600 font-medium">Total Amount Due</span>
            <div className="flex items-center text-2xl font-black text-foreground">
              <IndianRupee className="h-5 w-5 mr-1" />
              {amount}
            </div>
          </div>

          {/* Stripe Elements */}
          {clientSecret ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm onSuccess={handleSuccess} />
              </Elements>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-12 bg-muted/50 animate-pulse rounded mt-6" />
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Powered by Stripe • PCI DSS Compliant
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPage;

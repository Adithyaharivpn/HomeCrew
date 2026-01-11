import React, { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Icons
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CheckoutForm = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Detect theme from document
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if dark mode is active
    const checkTheme = () => {
      const htmlElement = document.documentElement;
      const isDarkMode = 
        htmlElement.classList.contains('dark') || 
        htmlElement.getAttribute('data-theme') === 'dark' ||
        document.body.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/payment-success",
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      setMessage("Payment Successful! Redirecting...");
      setIsProcessing(false);
      if (onSuccess) onSuccess(paymentIntent.id);
    } else {
      setMessage("Something went wrong.");
      setIsProcessing(false);
    }
  };

  const isSuccess = message?.includes("Success");

  // Stripe PaymentElement appearance options
  const paymentElementOptions = {
    layout: "tabs",
    appearance: {
      theme: isDark ? 'night' : 'stripe',
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: isDark ? '#1f2937' : '#ffffff',
        colorText: isDark ? '#f9fafb' : '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          backgroundColor: isDark ? '#374151' : '#f9fafb',
          border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
          color: isDark ? '#f9fafb' : '#1f2937',
        },
        '.Input:focus': {
          border: '1px solid #3b82f6',
          boxShadow: '0 0 0 1px #3b82f6',
        },
        '.Label': {
          color: isDark ? '#d1d5db' : '#6b7280',
          fontWeight: '500',
        },
        '.Tab': {
          backgroundColor: isDark ? '#374151' : '#f9fafb',
          border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
          color: isDark ? '#d1d5db' : '#6b7280',
        },
        '.Tab:hover': {
          backgroundColor: isDark ? '#4b5563' : '#f3f4f6',
        },
        '.Tab--selected': {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          color: isDark ? '#f9fafb' : '#1f2937',
          borderColor: '#3b82f6',
        },
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Stripe Payment Element */}
      <div className="rounded-xl border border-border p-6 bg-card shadow-sm">
        <PaymentElement id="payment-element" options={paymentElementOptions} />
      </div>

      {/* Message Feedback */}
      {message && (
        <Alert 
          variant={isSuccess ? "default" : "destructive"} 
          className={isSuccess ? "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400" : ""}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{isSuccess ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 transition-colors"
        type="submit"
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </Button>
    </form>
  );
};

export default CheckoutForm;
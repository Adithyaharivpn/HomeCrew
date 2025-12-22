import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button, Alert, CircularProgress } from "@mui/material";

const CheckoutForm = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
      setMessage("Payment Successful! ");
      setIsProcessing(false);
      if (onSuccess) onSuccess(paymentIntent.id);
    } else {
      setMessage("Something went wrong.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      
      {message && (
        <Alert severity={message.includes("Success") ? "success" : "error"} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}

      <Button 
        fullWidth 
        variant="contained" 
        type="submit" 
        disabled={isProcessing || !stripe || !elements}
        sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
      >
        {isProcessing ? <CircularProgress size={24} color="inherit" /> : "Pay Now"}
      </Button>
    </form>
  );
};

export default CheckoutForm;
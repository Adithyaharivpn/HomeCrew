import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Container, Paper, Typography } from "@mui/material";
import CheckoutForm from "./CheckoutForm";
import api from "../../api/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY); 

const PaymentPage = () => {
  const [clientSecret, setClientSecret] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  
  const { amount, jobId, type } = location.state || { amount: 0 }; 

  useEffect(() => {
    if (!amount) return;
    const createIntent = async () => {
        try {
            const res = await api.post("/api/payment/create-payment-intent", { amount });
            setClientSecret(res.data.clientSecret);
        } catch (err) { console.error(err); }
    };
    createIntent();
  }, [amount]);

const handleSuccess = async (paymentId) => {
    try {
        if (type === 'escrow' && jobId) {
            await api.put(`/api/jobs/${jobId}/pay`, { paymentId });
            alert("Payment Secured! Code Generated.");
        }
      
        setTimeout(() => {
             navigate(-1);
             setTimeout(() => window.location.reload(), 100); 
        }, 1500);

    } catch (err) {
        console.error("Payment update failed", err);
        alert("Payment succeeded but server update failed.");
    }
  };

  const options = { clientSecret, appearance: { theme: 'stripe' } };

  if (!amount) return <Typography align="center" sx={{mt:5}}>Loading...</Typography>;

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom align="center">Secure Payment</Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>Total: ₹{amount}</Typography>
        {clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm onSuccess={handleSuccess} />
          </Elements>
        )}
      </Paper>
    </Container>
  );
};

export default PaymentPage;
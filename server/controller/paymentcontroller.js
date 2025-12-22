const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger'); // Don't forget your logger!

const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = "inr" } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, 
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        logger.info(`Payment Intent created for ₹${amount}`);

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        logger.error(`Payment Error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createPaymentIntent };
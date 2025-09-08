import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      amount, 
      currency = 'usd', 
      metadata = {},
      barOwnerAccountId,
      platformFeePercentage = 15 // Default 15% platform fee
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const amountInCents = Math.round(amount * 100);
    const platformFeeInCents = Math.round(amountInCents * (platformFeePercentage / 100));

    let paymentIntentConfig = {
      amount: amountInCents,
      currency,
      metadata: {
        ...metadata,
        platform_fee_percentage: platformFeePercentage.toString(),
        platform_fee_amount: platformFeeInCents.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // If bar owner has Stripe Connect account, use platform fees
    if (barOwnerAccountId) {
      paymentIntentConfig.application_fee_amount = platformFeeInCents;
      paymentIntentConfig.transfer_data = {
        destination: barOwnerAccountId,
      };
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      platformFee: platformFeeInCents / 100,
      barOwnerPayout: (amountInCents - platformFeeInCents) / 100,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
} 
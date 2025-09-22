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
      barId, 
      ownerId, 
      connectAccountId,
      metadata = {} 
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!connectAccountId) {
      return res.status(400).json({ error: 'Connect account ID required' });
    }

    // Calculate platform fee (e.g., 3% of the transaction)
    const platformFeeAmount = Math.round(amount * 0.03); // 3% platform fee
    const ownerAmount = amount - platformFeeAmount;

    // Create PaymentIntent with Connect account
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      application_fee_amount: Math.round(platformFeeAmount * 100), // Platform fee in cents
      transfer_data: {
        destination: connectAccountId, // Bar owner's Connect account
      },
      metadata: {
        ...metadata,
        barId,
        ownerId,
        platformFee: platformFeeAmount.toString(),
        ownerAmount: ownerAmount.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    }, {
      stripeAccount: connectAccountId, // Use Connect account context
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      platformFee: platformFeeAmount,
      ownerAmount: ownerAmount,
    });
  } catch (error) {
    console.error('Error creating Connect payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
}

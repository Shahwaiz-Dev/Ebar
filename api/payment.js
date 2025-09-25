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
      type, // 'standard' or 'connect'
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

    if (type === 'connect') {
      // Handle Connect payment intent
      if (!connectAccountId) {
        return res.status(400).json({ error: 'Connect account ID required for connect payments' });
      }

      // Calculate platform fee (e.g., 3% of the transaction)
      const platformFeeAmount = Math.round(amount * 0.03); // 3% platform fee
      const ownerAmount = amount - platformFeeAmount;

      // Verify Connect account is active and can receive payments
      const connectAccount = await stripe.accounts.retrieve(connectAccountId);
      console.log('Connect account status:', {
        id: connectAccount.id,
        chargesEnabled: connectAccount.charges_enabled,
        payoutsEnabled: connectAccount.payouts_enabled,
        detailsSubmitted: connectAccount.details_submitted,
      });

      if (!connectAccount.charges_enabled) {
        return res.status(400).json({ 
          error: 'Connect account is not ready to receive payments. Please complete the onboarding process.' 
        });
      }

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
      });

      console.log('Connect PaymentIntent created:', {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        applicationFee: paymentIntent.application_fee_amount,
        destination: paymentIntent.transfer_data?.destination,
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        platformFee: platformFeeAmount,
        ownerAmount: ownerAmount,
        type: 'connect'
      });

    } else {
      // Handle standard payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log('Standard PaymentIntent created:', {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        type: 'standard'
      });
    }

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
}

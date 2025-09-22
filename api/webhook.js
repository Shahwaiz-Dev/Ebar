import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      
      // Handle Connect payments
      if (paymentIntent.transfer_data) {
        console.log('Connect payment succeeded:', {
          paymentIntentId: paymentIntent.id,
          destinationAccount: paymentIntent.transfer_data.destination,
          applicationFee: paymentIntent.application_fee_amount,
          barId: paymentIntent.metadata.barId,
          ownerId: paymentIntent.metadata.ownerId,
        });
        
        // Here you can add logic to:
        // - Update booking/order status in your database
        // - Send confirmation emails to customer and bar owner
        // - Update bar owner's earnings
        // - Send notification to bar owner
      }
      
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('PaymentIntent failed:', failedPayment.id);
      
      // Handle failed Connect payment
      if (failedPayment.transfer_data) {
        console.log('Connect payment failed:', {
          paymentIntentId: failedPayment.id,
          destinationAccount: failedPayment.transfer_data.destination,
          barId: failedPayment.metadata.barId,
          ownerId: failedPayment.metadata.ownerId,
        });
      }
      
      break;
      
    case 'charge.succeeded':
      const charge = event.data.object;
      console.log('Charge succeeded:', charge.id);
      break;
      
    case 'charge.failed':
      const failedCharge = event.data.object;
      console.log('Charge failed:', failedCharge.id);
      break;
      
    // Connect-specific events
    case 'account.updated':
      const account = event.data.object;
      console.log('Connect account updated:', account.id);
      
      // Handle account updates (e.g., onboarding completion)
      // - Update bar owner's account status in your database
      // - Send notification about account status change
      
      break;
      
    case 'transfer.created':
      const transfer = event.data.object;
      console.log('Transfer created:', transfer.id);
      
      // Handle successful transfer to bar owner
      // - Update bar owner's earnings
      // - Send payout notification
      
      break;
      
    case 'transfer.failed':
      const failedTransfer = event.data.object;
      console.log('Transfer failed:', failedTransfer.id);
      
      // Handle failed transfer
      // - Notify bar owner about failed payout
      // - Update payment status
      
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
} 
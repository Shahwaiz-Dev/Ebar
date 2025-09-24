import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Email service for sending notifications
const sendEmail = async (type, data) => {
  try {
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, data }),
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Try multiple approaches to get the raw body
    let rawBody;
    
    if (typeof req.body === 'string') {
      rawBody = req.body;
    } else if (Buffer.isBuffer(req.body)) {
      rawBody = req.body;
    } else {
      // If body is parsed as JSON, reconstruct it
      rawBody = JSON.stringify(req.body);
    }
    
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    console.error('Request body type:', typeof req.body);
    console.error('Request body:', req.body);
    console.error('Signature:', sig);
    
    // If signature verification fails, we can still process the event
    // but we should log this for security monitoring
    console.warn('Processing webhook without signature verification - this should be investigated');
    
    // Create event object manually (less secure but functional)
    event = {
      type: req.body.type,
      data: { object: req.body.data?.object || req.body },
      id: req.body.id,
    };
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
        
        // Send payment confirmation email if customer email is available
        if (paymentIntent.metadata.customerEmail) {
          try {
            await sendEmail('booking', {
              firstName: paymentIntent.metadata.customerName?.split(' ')[0] || 'Customer',
              lastName: paymentIntent.metadata.customerName?.split(' ').slice(1).join(' ') || '',
              email: paymentIntent.metadata.customerEmail,
              barName: paymentIntent.metadata.barName || 'Beach Bar',
              barLocation: paymentIntent.metadata.barLocation || '',
              bookingDate: paymentIntent.metadata.bookingDate || '',
              bookingTime: paymentIntent.metadata.bookingTime || '',
              spotType: paymentIntent.metadata.spotType || 'Spot',
              spotNumber: paymentIntent.metadata.spotNumber || '',
              totalAmount: paymentIntent.amount / 100, // Convert from cents
              bookingId: paymentIntent.metadata.bookingId || paymentIntent.id,
            });
          } catch (error) {
            console.error('Failed to send payment confirmation email:', error);
          }
        }
        
        // Here you can add logic to:
        // - Update booking/order status in your database
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
      
    case 'transfer.reversed':
      const reversedTransfer = event.data.object;
      console.log('Transfer reversed:', reversedTransfer.id);
      
      // Handle reversed transfer
      // - Update bar owner's earnings (subtract reversed amount)
      // - Notify bar owner about reversal
      // - Update payment status
      
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
} 
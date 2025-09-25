import Stripe from 'stripe';
import { doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

const endpointSecret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET;

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

  console.log('Received Stripe subscription webhook:', event.type);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleSubscriptionCreated(subscription) {
  const userId = subscription.metadata.userId;
  const tier = subscription.metadata.tier;

  if (!userId || !tier) {
    console.error('Missing userId or tier in subscription metadata');
    return;
  }

  const subscriptionData = {
    userId,
    tier,
    status: 'active',
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    bookingsUsed: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(doc(db, 'subscriptions', subscription.id), subscriptionData);
  console.log(`Created subscription for user ${userId} with tier ${tier}`);
}

async function handleSubscriptionUpdated(subscription) {
  const subscriptionRef = doc(db, 'subscriptions', subscription.id);
  const subscriptionDoc = await getDoc(subscriptionRef);

  if (!subscriptionDoc.exists()) {
    console.error(`Subscription ${subscription.id} not found in Firestore`);
    return;
  }

  const updates = {
    status: subscription.status === 'active' ? 'active' : 
            subscription.status === 'canceled' ? 'cancelled' :
            subscription.status === 'past_due' ? 'past_due' : 'inactive',
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    updatedAt: new Date(),
  };

  await updateDoc(subscriptionRef, updates);
  console.log(`Updated subscription ${subscription.id}`);
}

async function handleSubscriptionDeleted(subscription) {
  const subscriptionRef = doc(db, 'subscriptions', subscription.id);
  await deleteDoc(subscriptionRef);
  console.log(`Deleted subscription ${subscription.id}`);
}

async function handlePaymentSucceeded(invoice) {
  if (invoice.subscription) {
    const subscriptionRef = doc(db, 'subscriptions', invoice.subscription);
    const subscriptionDoc = await getDoc(subscriptionRef);

    if (subscriptionDoc.exists()) {
      await updateDoc(subscriptionRef, {
        status: 'active',
        updatedAt: new Date(),
        // Reset booking count on successful payment (new billing period)
        bookingsUsed: 0,
      });
      console.log(`Payment succeeded for subscription ${invoice.subscription}`);
    }
  }
}

async function handlePaymentFailed(invoice) {
  if (invoice.subscription) {
    const subscriptionRef = doc(db, 'subscriptions', invoice.subscription);
    const subscriptionDoc = await getDoc(subscriptionRef);

    if (subscriptionDoc.exists()) {
      await updateDoc(subscriptionRef, {
        status: 'past_due',
        updatedAt: new Date(),
      });
      console.log(`Payment failed for subscription ${invoice.subscription}`);
    }
  }
}

// Configure to receive raw body for signature verification
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

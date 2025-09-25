import Stripe from 'stripe';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCoaxqngH8sPXfMb5ecVOz6mdSEYYNLMoM",
  authDomain: "barweb-2cb4c.firebaseapp.com",
  projectId: "barweb-2cb4c",
  storageBucket: "barweb-2cb4c.firebasestorage.app",
  messagingSenderId: "715821711318",
  appId: "1:715821711318:web:43235b10b576777b016e77"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// Product and Price IDs for each subscription tier
const SUBSCRIPTION_PRODUCTS = {
  starter: {
    productId: 'prod_starter_beach_bar', // Replace with actual Stripe Product ID
    priceId: 'price_starter_monthly', // Replace with actual Stripe Price ID
  },
  professional: {
    productId: 'prod_professional_beach_bar',
    priceId: 'price_professional_monthly',
  },
  premium: {
    productId: 'prod_premium_beach_bar',
    priceId: 'price_premium_monthly',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, tier, successUrl, cancelUrl } = req.body;

    if (!userId || !tier) {
      return res.status(400).json({ error: 'User ID and tier are required' });
    }

    if (!SUBSCRIPTION_PRODUCTS[tier]) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const userEmail = userData.email;

    // Create or get Stripe customer
    let customer;
    if (userData.stripeCustomerId) {
      customer = await stripe.customers.retrieve(userData.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
        },
      });

      // Save customer ID to user document
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        stripeCustomerId: customer.id,
      }, { merge: true });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: SUBSCRIPTION_PRODUCTS[tier].priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${req.headers.origin}/dashboard?subscription=success`,
      cancel_url: cancelUrl || `${req.headers.origin}/dashboard?subscription=cancelled`,
      metadata: {
        userId: userId,
        tier: tier,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          tier: tier,
        },
      },
    });

    res.status(200).json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create subscription'
    });
  }
}

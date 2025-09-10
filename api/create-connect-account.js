import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, country = 'US' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if required environment variables are set
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      return res.status(500).json({ error: 'Stripe configuration error' });
    }

    const appUrl = process.env.VITE_APP_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      console.error('VITE_APP_URL or NEXT_PUBLIC_APP_URL is not set');
      return res.status(500).json({ error: 'App URL configuration error' });
    }

    console.log('Creating Stripe Connect account for:', email);
    console.log('App URL:', appUrl);

    // Create a Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${appUrl}/dashboard/connect/refresh`,
      return_url: `${appUrl}/dashboard/connect/success?account_id=${account.id}`,
      type: 'account_onboarding',
    });

    console.log('Account created:', account.id);
    console.log('Onboarding URL:', accountLink.url);

    res.status(200).json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error('Error creating connect account:', error);
    res.status(500).json({ error: 'Failed to create connect account' });
  }
}

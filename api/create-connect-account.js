import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, businessName, ownerId } = req.body;

    if (!email || !businessName || !ownerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email: email,
      business_profile: {
        name: businessName,
        product_description: 'Beach bar services and rentals',
      },
      metadata: {
        ownerId: ownerId,
        platform: 'ebar',
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/dashboard/connect/refresh`,
      return_url: `${process.env.FRONTEND_URL}/dashboard/connect/success`,
      type: 'account_onboarding',
    });

    res.status(200).json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error('Error creating Connect account:', error);
    res.status(500).json({ error: 'Failed to create Connect account' });
  }
}

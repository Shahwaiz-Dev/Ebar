import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accountId, barId } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: 'Account ID required' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return res.status(500).json({ error: 'Stripe configuration missing' });
    }

    if (!process.env.FRONTEND_URL) {
      console.error('FRONTEND_URL is not configured');
      return res.status(500).json({ error: 'Frontend URL configuration missing' });
    }

    console.log('Creating account link for existing account:', accountId);

    const returnUrl = barId 
      ? `${process.env.FRONTEND_URL}/dashboard/connect/success?account=${accountId}&barId=${barId}`
      : `${process.env.FRONTEND_URL}/dashboard/connect/success?account=${accountId}`;
    
    const refreshUrl = barId 
      ? `${process.env.FRONTEND_URL}/dashboard/connect/refresh?account=${accountId}&barId=${barId}`
      : `${process.env.FRONTEND_URL}/dashboard/connect/refresh?account=${accountId}`;

    // Create account link for re-onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    console.log('Account link created for re-onboarding:', accountLink.url);

    res.status(200).json({
      accountId: accountId,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error('Error creating account link:', error);
    res.status(500).json({ error: 'Failed to create account link' });
  }
}

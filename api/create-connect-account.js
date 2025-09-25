import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, businessName, ownerId, barId } = req.body;

    console.log('Creating Connect account with:', { email, businessName, ownerId });

    if (!email || !businessName || !ownerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return res.status(500).json({ error: 'Stripe configuration missing' });
    }

    if (!process.env.FRONTEND_URL) {
      console.error('FRONTEND_URL is not configured');
      return res.status(500).json({ error: 'Frontend URL configuration missing' });
    }

    // Create Express account
    console.log('Creating Stripe Express account...');
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

    console.log('Stripe account created:', account.id);

    // Create account link for onboarding
    console.log('Creating account link...');
    const returnUrl = barId 
      ? `${process.env.FRONTEND_URL}/dashboard/connect/success?account=${account.id}&barId=${barId}`
      : `${process.env.FRONTEND_URL}/dashboard/connect/success?account=${account.id}`;
    
    const refreshUrl = barId 
      ? `${process.env.FRONTEND_URL}/dashboard/connect/refresh?account=${account.id}&barId=${barId}`
      : `${process.env.FRONTEND_URL}/dashboard/connect/refresh?account=${account.id}`;
    
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    console.log('Account link created:', accountLink.url);

    res.status(200).json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error('Error creating Connect account:', error);
    res.status(500).json({ error: 'Failed to create Connect account' });
  }
}

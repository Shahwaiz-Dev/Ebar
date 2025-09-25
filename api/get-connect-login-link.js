import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: 'Account ID required' });
    }

    console.log('Creating login link for account:', accountId);

    // Create a login link for the Connect Express account
    const loginLink = await stripe.accounts.createLoginLink(accountId);

    console.log('Login link created successfully:', loginLink.url);

    res.status(200).json({
      success: true,
      loginUrl: loginLink.url
    });

  } catch (error) {
    console.error('Error creating login link:', error);
    res.status(500).json({ 
      error: 'Failed to create login link',
      details: error.message 
    });
  }
}

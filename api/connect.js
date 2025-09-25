import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(req, res) {
  const { action } = req.query;

  try {
    if (action === 'get-account') {
      // Handle GET request for account details
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { accountId } = req.query;

      if (!accountId) {
        return res.status(400).json({ error: 'Account ID required' });
      }

      // Get Connect account details
      const account = await stripe.accounts.retrieve(accountId);

      // Check if account is fully onboarded
      const isOnboarded = account.details_submitted && 
                         account.charges_enabled && 
                         account.payouts_enabled;

      res.status(200).json({
        accountId: account.id,
        isOnboarded,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        businessProfile: account.business_profile,
        requirements: account.requirements,
      });

    } else if (action === 'create-login-link') {
      // Handle POST request for creating login link
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

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

    } else {
      return res.status(400).json({ error: 'Invalid action. Use ?action=get-account or ?action=create-login-link' });
    }

  } catch (error) {
    console.error('Error in connect API:', error);
    res.status(500).json({ error: 'Failed to process connect request' });
  }
}

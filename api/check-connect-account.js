import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).json({ error: 'Account ID is required' });
    }

    // Retrieve the account details
    const account = await stripe.accounts.retrieve(accountId);

    // Check if account is fully set up
    const isComplete = account.details_submitted && account.charges_enabled;

    res.status(200).json({
      accountId: account.id,
      isComplete,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
    });
  } catch (error) {
    console.error('Error checking connect account:', error);
    res.status(500).json({ error: 'Failed to check connect account' });
  }
}

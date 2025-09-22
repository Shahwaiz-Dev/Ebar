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
  } catch (error) {
    console.error('Error retrieving Connect account:', error);
    res.status(500).json({ error: 'Failed to retrieve Connect account' });
  }
}

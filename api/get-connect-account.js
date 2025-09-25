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

    // Determine account status
    let status = 'pending';
    if (isOnboarded) {
      status = 'active';
    } else if (account.details_submitted) {
      status = 'restricted';
    }

    // Log detailed status for debugging
    console.log(`Connect account ${accountId} status:`, {
      status,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements: account.requirements,
      currently_due: account.requirements?.currently_due || [],
      eventually_due: account.requirements?.eventually_due || [],
      past_due: account.requirements?.past_due || [],
      pending_verification: account.requirements?.pending_verification || []
    });

    res.status(200).json({
      accountId: account.id,
      isOnboarded,
      status,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      businessProfile: account.business_profile,
      requirements: account.requirements,
      // Add helpful debugging info
      currentlyDue: account.requirements?.currently_due || [],
      eventuallyDue: account.requirements?.eventually_due || [],
      pastDue: account.requirements?.past_due || [],
      pendingVerification: account.requirements?.pending_verification || [],
      disabled_reason: account.requirements?.disabled_reason,
    });
  } catch (error) {
    console.error('Error retrieving Connect account:', error);
    res.status(500).json({ error: 'Failed to retrieve Connect account' });
  }
}

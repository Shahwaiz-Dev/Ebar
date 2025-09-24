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

    console.log('Fetching payment stats for account:', accountId);

    // Get account balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId,
    });

    // Get recent charges (last 30 days)
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    
    const charges = await stripe.charges.list({
      limit: 100,
      created: {
        gte: thirtyDaysAgo,
      },
    }, {
      stripeAccount: accountId,
    });

    // Get recent payouts
    const payouts = await stripe.payouts.list({
      limit: 50,
    }, {
      stripeAccount: accountId,
    });

    // Calculate stats
    const totalEarnings = charges.data.reduce((sum, charge) => {
      return sum + (charge.amount / 100); // Convert from cents to dollars
    }, 0);

    const platformFees = charges.data.reduce((sum, charge) => {
      const applicationFee = charge.application_fee_amount || 0;
      return sum + (applicationFee / 100);
    }, 0);

    const netEarnings = totalEarnings - platformFees;

    // Calculate pending payouts (available balance)
    const pendingPayouts = balance.available.reduce((sum, balanceItem) => {
      return sum + (balanceItem.amount / 100);
    }, 0);

    // Calculate completed payouts
    const completedPayouts = payouts.data
      .filter(payout => payout.status === 'paid')
      .reduce((sum, payout) => {
        return sum + (payout.amount / 100);
      }, 0);

    // Format recent transactions
    const recentTransactions = charges.data.slice(0, 10).map(charge => ({
      id: charge.id,
      amount: charge.amount / 100,
      platformFee: (charge.application_fee_amount || 0) / 100,
      netAmount: (charge.amount - (charge.application_fee_amount || 0)) / 100,
      status: charge.status,
      createdAt: new Date(charge.created * 1000).toISOString(),
      customerEmail: charge.billing_details?.email || charge.receipt_email,
      description: charge.description || 'Beach bar booking',
    }));

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        platformFees,
        netEarnings,
        pendingPayouts,
        completedPayouts,
        recentTransactions,
        balance: {
          available: balance.available.map(item => ({
            amount: item.amount / 100,
            currency: item.currency,
          })),
          pending: balance.pending.map(item => ({
            amount: item.amount / 100,
            currency: item.currency,
          })),
        },
      },
    });

  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment statistics',
      details: error.message 
    });
  }
}

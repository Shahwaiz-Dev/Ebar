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

    console.log('Disconnecting Stripe account:', accountId);

    // Delete the Connect account from Stripe
    const deletedAccount = await stripe.accounts.del(accountId);
    
    console.log('Stripe account deleted:', deletedAccount.id);

    res.status(200).json({
      success: true,
      message: 'Stripe account disconnected successfully',
      deletedAccountId: deletedAccount.id
    });

  } catch (error) {
    console.error('Error disconnecting Stripe account:', error);
    
    // If account is already deleted or doesn't exist, that's okay
    if (error.code === 'resource_missing') {
      res.status(200).json({
        success: true,
        message: 'Stripe account was already disconnected',
        deletedAccountId: req.body.accountId
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to disconnect Stripe account',
        details: error.message 
      });
    }
  }
}

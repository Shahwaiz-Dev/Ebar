import Stripe from 'stripe';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    console.log(`Deleting all Stripe Connect accounts for user: ${userId}`);

    // Get all bars owned by the user
    const barsRef = collection(db, 'beachBars');
    const q = query(barsRef, where('ownerId', '==', userId));
    const querySnapshot = await getDocs(q);

    const userBars = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Extract Connect account IDs
    const connectAccountIds = userBars
      .filter(bar => bar.connectAccountId)
      .map(bar => bar.connectAccountId);

    if (connectAccountIds.length === 0) {
      console.log(`No Stripe Connect accounts found for user ${userId}`);
      return res.status(200).json({
        success: true,
        message: 'No Stripe Connect accounts found',
        deletedCount: 0
      });
    }

    console.log(`Found ${connectAccountIds.length} Stripe Connect accounts to delete`);

    // Delete each Connect account from Stripe
    const deleteResults = [];
    for (const accountId of connectAccountIds) {
      try {
        console.log(`Deleting Stripe Connect account: ${accountId}`);
        const deletedAccount = await stripe.accounts.del(accountId);
        deleteResults.push({
          accountId,
          success: true,
          deletedAccountId: deletedAccount.id
        });
        console.log(`Successfully deleted Stripe Connect account: ${accountId}`);
      } catch (error) {
        console.error(`Error deleting Stripe Connect account ${accountId}:`, error);
        deleteResults.push({
          accountId,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = deleteResults.filter(result => result.success).length;
    const failureCount = deleteResults.filter(result => !result.success).length;

    console.log(`Stripe Connect account deletion summary: ${successCount} successful, ${failureCount} failed`);

    res.status(200).json({
      success: true,
      message: `Deleted ${successCount} Stripe Connect accounts`,
      deletedCount: successCount,
      failedCount: failureCount,
      results: deleteResults
    });

  } catch (error) {
    console.error('Error deleting user Stripe Connect accounts:', error);
    res.status(500).json({ 
      error: 'Failed to delete Stripe Connect accounts',
      details: error.message 
    });
  }
}

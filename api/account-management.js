import Stripe from 'stripe';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, accountId, barId, userId } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    if (action === 'disconnect-single') {
      // Handle single account disconnection
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

    } else if (action === 'delete-user-accounts') {
      // Handle deletion of all user's Stripe accounts
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
          console.log(`Attempting to delete Stripe Connect account: ${accountId}`);
          
          // First, check the account status and balance
          const account = await stripe.accounts.retrieve(accountId);
          console.log(`Account ${accountId} status:`, {
            livemode: account.livemode,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            type: account.type
          });

          // Check if account can be deleted based on Stripe's rules
          if (account.livemode) {
            // For live accounts, check if they have zero balance
            const balance = await stripe.balance.retrieve({
              stripeAccount: accountId
            });
            
            const totalBalance = balance.available.reduce((sum, bal) => sum + bal.amount, 0) +
                               balance.pending.reduce((sum, bal) => sum + bal.amount, 0);
            
            console.log(`Account ${accountId} balance:`, {
              available: balance.available,
              pending: balance.pending,
              total: totalBalance
            });

            if (totalBalance > 0) {
              console.log(`Cannot delete live account ${accountId} - has non-zero balance: ${totalBalance}`);
              deleteResults.push({
                accountId,
                success: false,
                error: `Cannot delete live account with non-zero balance: ${totalBalance} cents`,
                reason: 'non_zero_balance'
              });
              continue;
            }
          }

          // Attempt to delete the account
          const deletedAccount = await stripe.accounts.del(accountId);
          deleteResults.push({
            accountId,
            success: true,
            deletedAccountId: deletedAccount.id,
            livemode: account.livemode
          });
          console.log(`Successfully deleted Stripe Connect account: ${accountId}`);
          
        } catch (error) {
          console.error(`Error deleting Stripe Connect account ${accountId}:`, error);
          
          // Provide more specific error messages based on Stripe error codes
          let errorMessage = error.message;
          let reason = 'unknown';
          
          if (error.code === 'resource_missing') {
            errorMessage = 'Account already deleted or does not exist';
            reason = 'already_deleted';
          } else if (error.message.includes('balance')) {
            errorMessage = 'Cannot delete account with non-zero balance';
            reason = 'non_zero_balance';
          } else if (error.message.includes('live')) {
            errorMessage = 'Cannot delete live account';
            reason = 'live_mode_restriction';
          }
          
          deleteResults.push({
            accountId,
            success: false,
            error: errorMessage,
            reason: reason
          });
        }
      }

      const successCount = deleteResults.filter(result => result.success).length;
      const failureCount = deleteResults.filter(result => !result.success).length;
      const balanceIssues = deleteResults.filter(result => result.reason === 'non_zero_balance').length;
      const alreadyDeleted = deleteResults.filter(result => result.reason === 'already_deleted').length;

      console.log(`Stripe Connect account deletion summary: ${successCount} successful, ${failureCount} failed`);
      console.log(`Breakdown: ${balanceIssues} with balance issues, ${alreadyDeleted} already deleted`);

      // Determine overall success
      const overallSuccess = failureCount === 0 || (failureCount === balanceIssues + alreadyDeleted);

      res.status(200).json({
        success: overallSuccess,
        message: overallSuccess 
          ? `Successfully processed ${connectAccountIds.length} Stripe Connect accounts`
          : `Processed ${connectAccountIds.length} accounts with some issues`,
        deletedCount: successCount,
        failedCount: failureCount,
        balanceIssues: balanceIssues,
        alreadyDeleted: alreadyDeleted,
        results: deleteResults,
        summary: {
          total: connectAccountIds.length,
          successful: successCount,
          failed: failureCount,
          withBalanceIssues: balanceIssues,
          alreadyDeleted: alreadyDeleted
        }
      });

    } else {
      return res.status(400).json({ error: 'Invalid action. Use "disconnect-single" or "delete-user-accounts"' });
    }

  } catch (error) {
    console.error('Error in account management API:', error);
    
    // If account is already deleted or doesn't exist, that's okay
    if (error.code === 'resource_missing') {
      res.status(200).json({
        success: true,
        message: 'Stripe account was already disconnected',
        deletedAccountId: req.body.accountId
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to process account management request',
        details: error.message 
      });
    }
  }
}

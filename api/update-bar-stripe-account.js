import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { barId, stripeAccountId } = req.body;

    if (!barId || !stripeAccountId) {
      return res.status(400).json({ error: 'Bar ID and Stripe Account ID are required' });
    }

    // Update the bar document with Stripe account ID
    const barRef = doc(db, 'beachBars', barId);
    await updateDoc(barRef, {
      stripeAccountId,
      isStripeConnected: true,
      platformFeePercentage: 15, // Default 15% platform fee
      updatedAt: new Date(),
    });

    res.status(200).json({ 
      success: true, 
      message: 'Bar updated with Stripe account successfully' 
    });
  } catch (error) {
    console.error('Error updating bar with Stripe account:', error);
    res.status(500).json({ error: 'Failed to update bar with Stripe account' });
  }
}

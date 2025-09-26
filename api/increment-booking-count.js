import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';

// Initialize Firebase (server-side)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase app if it doesn't exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default async function handler(req, res) {
  console.log('Increment booking count API called:', req.method, req.body);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;
    console.log('Processing booking count increment for userId:', userId);

    if (!userId) {
      console.log('No userId provided');
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user's subscription
    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(
      subscriptionsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    
    console.log('Querying subscriptions for user:', userId);
    const subscriptionQuery = await getDocs(q);
    console.log('Found subscriptions:', subscriptionQuery.size);

    if (subscriptionQuery.empty) {
      console.log(`No active subscription found for user ${userId}`);
      return res.status(200).json({ message: 'No active subscription found' });
    }

    const subscriptionDoc = subscriptionQuery.docs[0];
    const subscriptionData = subscriptionDoc.data();
    console.log('Current subscription data:', subscriptionData);

    const newBookingCount = (subscriptionData.bookingsUsed || 0) + 1;
    console.log(`Incrementing booking count from ${subscriptionData.bookingsUsed || 0} to ${newBookingCount}`);

    // Increment booking count
    await updateDoc(subscriptionDoc.ref, {
      bookingsUsed: newBookingCount,
      updatedAt: serverTimestamp()
    });

    console.log(`Successfully incremented booking count for user ${userId} to ${newBookingCount}`);
    return res.status(200).json({ 
      success: true, 
      bookingsUsed: newBookingCount 
    });

  } catch (error) {
    console.error('Error incrementing booking count:', error);
    return res.status(500).json({ error: 'Failed to increment booking count', details: error.message });
  }
}

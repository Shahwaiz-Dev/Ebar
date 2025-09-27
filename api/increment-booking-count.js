import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';

// Initialize Firebase (server-side)
const firebaseConfig = {
  apiKey: "AIzaSyCoaxqngH8sPXfMb5ecVOz6mdSEYYNLMoM",
  authDomain: "barweb-2cb4c.firebaseapp.com",
  projectId: "barweb-2cb4c",
  storageBucket: "barweb-2cb4c.firebasestorage.app",
  messagingSenderId: "715821711318",
  appId: "1:715821711318:web:43235b10b576777b016e77"
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

    // If no active subscription found, try to find any subscription for this user
    if (subscriptionQuery.empty) {
      console.log(`No active subscription found for user ${userId}, checking for any subscription...`);
      const allSubscriptionsQuery = query(
        subscriptionsRef,
        where('userId', '==', userId)
      );
      const allSubscriptions = await getDocs(allSubscriptionsQuery);
      console.log('Found total subscriptions for user:', allSubscriptions.size);
      
      if (allSubscriptions.size > 0) {
        allSubscriptions.forEach((doc, index) => {
          console.log(`Subscription ${index + 1}:`, doc.data());
        });
      }
      
      // If we found subscriptions but none are active, try to use the first one anyway
      if (allSubscriptions.size > 0) {
        console.log('No active subscription found, but using the first available subscription...');
        const firstSubscription = allSubscriptions.docs[0];
        const subscriptionData = firstSubscription.data();
        console.log('Using subscription data:', subscriptionData);
        
        const newBookingCount = (subscriptionData.bookingsUsed || 0) + 1;
        console.log(`Incrementing booking count from ${subscriptionData.bookingsUsed || 0} to ${newBookingCount}`);
        
        await updateDoc(firstSubscription.ref, {
          bookingsUsed: newBookingCount,
          updatedAt: serverTimestamp()
        });
        
        console.log(`Successfully incremented booking count for user ${userId} to ${newBookingCount} (using non-active subscription)`);
        return res.status(200).json({ 
          success: true, 
          bookingsUsed: newBookingCount,
          message: 'Used non-active subscription'
        });
      }
      
      return res.status(200).json({ 
        message: 'No subscription found',
        totalSubscriptions: allSubscriptions.size
      });
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

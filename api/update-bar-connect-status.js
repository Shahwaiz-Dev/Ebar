import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCoaxqngH8sPXfMb5ecVOz6mdSEYYNLMoM",
  authDomain: "barweb-2cb4c.firebaseapp.com",
  projectId: "barweb-2cb4c",
  storageBucket: "barweb-2cb4c.firebasestorage.app",
  messagingSenderId: "715821711318",
  appId: "1:715821711318:web:43235b10b576777b016e77"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      connectAccountId, 
      chargesEnabled, 
      payoutsEnabled, 
      detailsSubmitted 
    } = req.body;

    if (!connectAccountId) {
      return res.status(400).json({ error: 'Connect account ID required' });
    }

    // Find the bar with this Connect account ID
    const barsRef = collection(db, 'beachBars');
    const q = query(barsRef, where('connectAccountId', '==', connectAccountId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No bar found with Connect account ID:', connectAccountId);
      return res.status(404).json({ error: 'Bar not found' });
    }

    // Update the bar's Connect account status
    const barDoc = querySnapshot.docs[0];
    const barId = barDoc.id;
    
    let connectAccountStatus = 'pending';
    if (chargesEnabled && payoutsEnabled) {
      connectAccountStatus = 'active';
    } else if (detailsSubmitted) {
      // More nuanced status for partial enablement
      if (chargesEnabled || payoutsEnabled) {
        connectAccountStatus = 'restricted'; // Partially enabled
      } else {
        connectAccountStatus = 'restricted'; // Under review
      }
    }

    await updateDoc(doc(db, 'beachBars', barId), {
      connectAccountStatus,
      paymentSetupComplete: connectAccountStatus === 'active',
      updatedAt: serverTimestamp(),
    });

    console.log('Updated bar Connect account status:', {
      barId,
      connectAccountId,
      connectAccountStatus,
      chargesEnabled,
      payoutsEnabled,
    });

    res.status(200).json({ 
      success: true, 
      barId,
      connectAccountStatus 
    });
  } catch (error) {
    console.error('Error updating bar Connect account status:', error);
    res.status(500).json({ error: 'Failed to update bar Connect account status' });
  }
}

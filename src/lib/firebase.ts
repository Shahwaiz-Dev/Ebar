import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCoaxqngH8sPXfMb5ecVOz6mdSEYYNLMoM",
  authDomain: "barweb-2cb4c.firebaseapp.com",
  projectId: "barweb-2cb4c",
  storageBucket: "barweb-2cb4c.firebasestorage.app",
  messagingSenderId: "715821711318",
  appId: "1:715821711318:web:43235b10b576777b016e77"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 
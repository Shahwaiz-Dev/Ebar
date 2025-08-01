import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface BeachBar {
  id?: string;
  ownerId: string;
  name: string;
  location: string;
  description: string;
  image: string;
  amenities: string[];
  category: 'premium' | 'standard' | 'budget';
  rating: number;
  reviewCount: number;
  priceRange: 'low' | 'medium' | 'high';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  sunbeds: Array<{
    id: string;
    type: string;
    price: number;
    available: boolean;
  }>;
  umbrellas: Array<{
    id: string;
    type: string;
    price: number;
    available: boolean;
  }>;
  menuItems: Array<{
    id: string;
    name: string;
    price: number;
    description: string;
    category: 'drinks' | 'food';
    available: boolean;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Booking {
  id?: string;
  userId: string;
  barId: string;
  barName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  guests: number;
  type: 'sunbed' | 'umbrella' | 'food_order';
  spotId?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Review {
  id?: string;
  userId: string;
  barId: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}

export interface Favorite {
  id?: string;
  userId: string;
  barId: string;
  createdAt: Timestamp;
}

// Beach Bars Collection
export const beachBarsCollection = collection(db, 'beachBars');

export const createBeachBar = async (barData: Omit<BeachBar, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(beachBarsCollection, {
      ...barData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...barData };
  } catch (error) {
    console.error('Error creating beach bar:', error);
    throw error;
  }
};

export const getBeachBars = async () => {
  try {
    const querySnapshot = await getDocs(beachBarsCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BeachBar[];
  } catch (error) {
    console.error('Error getting beach bars:', error);
    throw error;
  }
};

export const getBeachBarById = async (id: string) => {
  try {
    const docRef = doc(db, 'beachBars', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as BeachBar;
    } else {
      throw new Error('Beach bar not found');
    }
  } catch (error) {
    console.error('Error getting beach bar:', error);
    throw error;
  }
};

export const getBeachBarsByOwner = async (ownerId: string) => {
  try {
    const q = query(
      beachBarsCollection,
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BeachBar[];
  } catch (error) {
    console.error('Error getting beach bars by owner:', error);
    throw error;
  }
};

export const updateBeachBar = async (id: string, updates: Partial<BeachBar>) => {
  try {
    const docRef = doc(db, 'beachBars', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating beach bar:', error);
    throw error;
  }
};

export const deleteBeachBar = async (id: string) => {
  try {
    const docRef = doc(db, 'beachBars', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting beach bar:', error);
    throw error;
  }
};

// Bookings Collection
export const bookingsCollection = collection(db, 'bookings');

export const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(bookingsCollection, {
      ...bookingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...bookingData };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getBookingsByUser = async (userId: string) => {
  try {
    const q = query(
      bookingsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
  } catch (error) {
    console.error('Error getting bookings by user:', error);
    throw error;
  }
};

export const getBookingsByBar = async (barId: string) => {
  try {
    const q = query(
      bookingsCollection,
      where('barId', '==', barId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
  } catch (error) {
    console.error('Error getting bookings by bar:', error);
    throw error;
  }
};

export const updateBookingStatus = async (id: string, status: Booking['status']) => {
  try {
    const docRef = doc(db, 'bookings', id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Reviews Collection
export const reviewsCollection = collection(db, 'reviews');

export const createReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(reviewsCollection, {
      ...reviewData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...reviewData };
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const getReviewsByBar = async (barId: string) => {
  try {
    const q = query(
      reviewsCollection,
      where('barId', '==', barId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error getting reviews by bar:', error);
    throw error;
  }
};

// Favorites Collection
export const favoritesCollection = collection(db, 'favorites');

export const addToFavorites = async (favoriteData: Omit<Favorite, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(favoritesCollection, {
      ...favoriteData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...favoriteData };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (userId: string, barId: string) => {
  try {
    const q = query(
      favoritesCollection,
      where('userId', '==', userId),
      where('barId', '==', barId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'favorites', querySnapshot.docs[0].id);
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

export const getFavoritesByUser = async (userId: string) => {
  try {
    const q = query(
      favoritesCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Favorite[];
  } catch (error) {
    console.error('Error getting favorites by user:', error);
    throw error;
  }
};

export const isFavorite = async (userId: string, barId: string) => {
  try {
    const q = query(
      favoritesCollection,
      where('userId', '==', userId),
      where('barId', '==', barId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}; 
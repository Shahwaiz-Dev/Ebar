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
  Timestamp,
  setDoc
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
  // Stripe Connect fields
  connectAccountId?: string;
  connectAccountStatus?: 'pending' | 'active' | 'restricted';
  paymentSetupComplete?: boolean;
  // Admin verification fields
  isVerified: boolean;
  verifiedAt?: Timestamp;
  verifiedBy?: string;
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
  type: 'sunbed' | 'umbrella';
  spotId: string;
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Order {
  id?: string;
  userId: string;
  barId: string;
  barName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    category: 'drinks' | 'food';
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  deliveryLocation?: {
    sunbedNumber?: string;
    umbrellaNumber?: string;
  };
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
  user?: {
    uid: string;
    firstName: string;
    lastName: string;
    email: string | null;
    type: 'user' | 'owner';
    avatar?: string;
    displayName: string;
    photoURL?: string;
    isVerified: boolean;
  };
}

export interface Favorite {
  id?: string;
  userId: string;
  barId: string;
  createdAt: Timestamp;
}

// Beach Bars Collection
export const beachBarsCollection = collection(db, 'beachBars');

export const createBeachBar = async (barData: Omit<BeachBar, 'id' | 'createdAt' | 'updatedAt' | 'isVerified' | 'verifiedAt' | 'verifiedBy'>) => {
  try {
    const docRef = await addDoc(beachBarsCollection, {
      ...barData,
      isVerified: false, // New bars are not verified by default
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...barData, isVerified: false };
  } catch (error) {
    console.error('Error creating beach bar:', error);
    throw error;
  }
};

export const getBeachBars = async (includeUnverified: boolean = false) => {
  try {
    const querySnapshot = await getDocs(beachBarsCollection);
    let bars = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BeachBar[];

    // Filter out unverified bars for public display unless specifically requested
    if (!includeUnverified) {
      bars = bars.filter(bar => bar.isVerified);
    }

    // Get reviews for all bars to calculate real ratings
    const barIds = bars.map(bar => bar.id!).filter(Boolean);
    const reviewsByBar = await getReviewsForMultipleBars(barIds);

    // Update bars with real rating and review count
    const barsWithRealData = bars.map(bar => {
      const barReviews = reviewsByBar[bar.id!] || [];
      const totalRating = barReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = barReviews.length > 0 ? totalRating / barReviews.length : 0;
      
      return {
        ...bar,
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        reviewCount: barReviews.length
      };
    });

    return barsWithRealData;
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

export const updateBeachBarConnectAccount = async (
  id: string, 
  connectAccountId: string, 
  connectAccountStatus: 'pending' | 'active' | 'restricted' = 'pending'
) => {
  try {
    const docRef = doc(db, 'beachBars', id);
    await updateDoc(docRef, {
      connectAccountId,
      connectAccountStatus,
      paymentSetupComplete: connectAccountStatus === 'active',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating beach bar Connect account:', error);
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

export const deleteAllBarsByOwner = async (ownerId: string) => {
  try {
    // Get all bars owned by this user
    const bars = await getBeachBarsByOwner(ownerId);
    
    // Delete each bar
    const deletePromises = bars.map(bar => {
      if (bar.id) {
        return deleteBeachBar(bar.id);
      }
      return Promise.resolve();
    });
    
    await Promise.all(deletePromises);
    
    console.log(`Deleted ${bars.length} bars owned by user ${ownerId}`);
    return bars.length;
  } catch (error) {
    console.error('Error deleting bars by owner:', error);
    throw error;
  }
};

export const deleteAllUserData = async (userId: string) => {
  try {
    const results = {
      bars: 0,
      bookings: 0,
      orders: 0,
      reviews: 0,
      favorites: 0,
    };

    // Delete all bars owned by user (if they're an owner)
    try {
      results.bars = await deleteAllBarsByOwner(userId);
    } catch (error) {
      console.error('Error deleting user bars:', error);
    }

    // Delete all bookings by user
    try {
      const bookings = await getBookingsByUser(userId);
      const bookingDeletePromises = bookings.map(booking => {
        if (booking.id) {
          return deleteDoc(doc(db, 'bookings', booking.id));
        }
        return Promise.resolve();
      });
      await Promise.all(bookingDeletePromises);
      results.bookings = bookings.length;
      console.log(`Deleted ${bookings.length} bookings for user ${userId}`);
    } catch (error) {
      console.error('Error deleting user bookings:', error);
    }

    // Delete all orders by user
    try {
      const orders = await getOrdersByUser(userId);
      const orderDeletePromises = orders.map(order => {
        if (order.id) {
          return deleteDoc(doc(db, 'orders', order.id));
        }
        return Promise.resolve();
      });
      await Promise.all(orderDeletePromises);
      results.orders = orders.length;
      console.log(`Deleted ${orders.length} orders for user ${userId}`);
    } catch (error) {
      console.error('Error deleting user orders:', error);
    }

    // Delete all reviews by user
    try {
      const reviews = await getReviewsByUser(userId);
      const reviewDeletePromises = reviews.map(review => {
        if (review.id) {
          return deleteDoc(doc(db, 'reviews', review.id));
        }
        return Promise.resolve();
      });
      await Promise.all(reviewDeletePromises);
      results.reviews = reviews.length;
      console.log(`Deleted ${reviews.length} reviews for user ${userId}`);
    } catch (error) {
      console.error('Error deleting user reviews:', error);
    }

    // Delete all favorites by user
    try {
      const favorites = await getFavoritesByUser(userId);
      const favoriteDeletePromises = favorites.map(favorite => {
        if (favorite.id) {
          return deleteDoc(doc(db, 'favorites', favorite.id));
        }
        return Promise.resolve();
      });
      await Promise.all(favoriteDeletePromises);
      results.favorites = favorites.length;
      console.log(`Deleted ${favorites.length} favorites for user ${userId}`);
    } catch (error) {
      console.error('Error deleting user favorites:', error);
    }

    console.log(`User data deletion summary for ${userId}:`, results);
    return results;
  } catch (error) {
    console.error('Error deleting all user data:', error);
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
    const bookings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
    return bookings;
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

// Orders Collection
export const ordersCollection = collection(db, 'orders');

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(ordersCollection, {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrdersByUser = async (userId: string) => {
  try {
    const q = query(
      ordersCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error('Error getting orders by user:', error);
    throw error;
  }
};

export const getOrdersByBar = async (barId: string) => {
  try {
    const q = query(
      ordersCollection,
      where('barId', '==', barId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
    return orders;
  } catch (error) {
    console.error('Error getting orders by bar:', error);
    throw error;
  }
};

export const updateOrderStatus = async (id: string, status: Order['status']) => {
  try {
    const docRef = doc(db, 'orders', id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating order status:', error);
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
    
    // Fetch user data for each review
    const reviewsWithUsers = await Promise.all(
      querySnapshot.docs.map(async (reviewDoc) => {
        const reviewData = reviewDoc.data() as Review;
        const review = {
          id: reviewDoc.id,
          ...reviewData
        };
        
        // Fetch user data
        try {
          const userDoc = await getDoc(doc(db, 'users', reviewData.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data() as {
              uid: string;
              firstName: string;
              lastName: string;
              email: string | null;
              type: 'user' | 'owner';
              avatar?: string;
            };
            return {
              ...review,
              user: {
                uid: userData.uid,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                type: userData.type,
                avatar: userData.avatar,
                displayName: `${userData.firstName} ${userData.lastName}`,
                photoURL: userData.avatar,
                isVerified: userData.type === 'owner' // Owners are verified
              }
            };
          } else {
            // User not found, return review with anonymous user
            return {
              ...review,
              user: {
                uid: reviewData.userId,
                firstName: 'Anonymous',
                lastName: 'User',
                email: null,
                type: 'user',
                avatar: null,
                displayName: 'Anonymous User',
                photoURL: null,
                isVerified: false
              }
            };
          }
        } catch (error) {
          console.error('Error fetching user data for review:', error);
          // Return review with anonymous user if user fetch fails
          return {
            ...review,
            user: {
              uid: reviewData.userId,
              firstName: 'Anonymous',
              lastName: 'User',
              email: null,
              type: 'user',
              avatar: null,
              displayName: 'Anonymous User',
              photoURL: null,
              isVerified: false
            }
          };
        }
      })
    );
    
    return reviewsWithUsers;
  } catch (error) {
    console.error('Error getting reviews by bar:', error);
    throw error;
  }
};

export const getReviewsByUser = async (userId: string) => {
  try {
    const q = query(
      reviewsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error getting reviews by user:', error);
    throw error;
  }
};

// Get reviews for multiple bars
export const getReviewsForMultipleBars = async (barIds: string[]) => {
  try {
    const reviewsByBar: { [barId: string]: any[] } = {};
    
    // Get reviews for each bar
    await Promise.all(
      barIds.map(async (barId) => {
        try {
          const reviews = await getReviewsByBar(barId);
          reviewsByBar[barId] = reviews;
        } catch (error) {
          console.error(`Error getting reviews for bar ${barId}:`, error);
          reviewsByBar[barId] = [];
        }
      })
    );
    
    return reviewsByBar;
  } catch (error) {
    console.error('Error getting reviews for multiple bars:', error);
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

// Sample data creation function
export const createSampleBeachBars = async () => {
  const sampleBars = [
    {
      ownerId: 'sample-owner-1',
      name: 'Sunset Paradise',
      location: 'Santorini, Greece',
      description: 'Iconic cliffside bar with breathtaking sunset views and world-class cocktails.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      amenities: ['Infinity Pool', 'Live DJ', 'Sunset Views', 'Premium Service'],
      category: 'premium' as const,
      rating: 4.9,
      reviewCount: 128,
      priceRange: 'high' as const,
      coordinates: {
        latitude: 36.3932,
        longitude: 25.4615
      },
      sunbeds: [
        { id: 'A1', type: 'Premium', price: 45, available: true },
        { id: 'A2', type: 'Premium', price: 45, available: true },
        { id: 'A3', type: 'Standard', price: 35, available: false },
        { id: 'B1', type: 'Premium', price: 45, available: true },
        { id: 'B2', type: 'Standard', price: 35, available: true },
      ],
      umbrellas: [
        { id: 'U1', type: 'Large', price: 25, available: true },
        { id: 'U2', type: 'Standard', price: 20, available: true },
        { id: 'U3', type: 'Large', price: 25, available: false },
        { id: 'U4', type: 'Standard', price: 20, available: true },
      ],
      menuItems: [
        {
          id: 'drink-1',
          name: 'Santorini Sunset',
          price: 18,
          description: 'Local wine with fresh herbs',
          category: 'drinks' as const,
          available: true,
        },
        {
          id: 'food-1',
          name: 'Greek Meze Platter',
          price: 28,
          description: 'Assorted Mediterranean appetizers',
          category: 'food' as const,
          available: true,
        },
      ],
    },
    {
      ownerId: 'sample-owner-2',
      name: 'Ocean Breeze',
      location: 'Bali, Indonesia',
      description: 'Tropical beachfront bar with fresh seafood and exotic cocktails.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      amenities: ['Beach Access', 'Water Sports', 'Live Music', 'Spa Services'],
      category: 'standard' as const,
      rating: 4.7,
      reviewCount: 89,
      priceRange: 'medium' as const,
      coordinates: {
        latitude: -8.3405,
        longitude: 115.0920
      },
      sunbeds: [
        { id: 'C1', type: 'Premium', price: 40, available: true },
        { id: 'C2', type: 'Standard', price: 30, available: true },
        { id: 'C3', type: 'Standard', price: 30, available: false },
      ],
      umbrellas: [
        { id: 'U5', type: 'Large', price: 20, available: true },
        { id: 'U6', type: 'Standard', price: 15, available: true },
      ],
      menuItems: [
        {
          id: 'drink-2',
          name: 'Bali Bliss',
          price: 15,
          description: 'Coconut rum with tropical fruits',
          category: 'drinks' as const,
          available: true,
        },
        {
          id: 'food-2',
          name: 'Grilled Mahi Mahi',
          price: 32,
          description: 'Fresh local fish with rice',
          category: 'food' as const,
          available: true,
        },
      ],
    },
  ];

  for (const barData of sampleBars) {
    try {
      await createBeachBar(barData);
      console.log(`Created beach bar: ${barData.name}`);
    } catch (error) {
      console.error(`Error creating beach bar ${barData.name}:`, error);
    }
  }
};

// Sample reviews creation function
export const createSampleReviews = async () => {
  const sampleUsers = [
    {
      uid: 'user-1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com',
      type: 'user' as const,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=80&h=80&fit=crop&crop=face',
    },
    {
      uid: 'user-2',
      firstName: 'Marcus',
      lastName: 'Chen',
      email: 'marcus@example.com',
      type: 'user' as const,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    },
    {
      uid: 'user-3',
      firstName: 'Emma',
      lastName: 'Rodriguez',
      email: 'emma@example.com',
      type: 'user' as const,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    },
  ];

  // Create sample users first
  for (const userData of sampleUsers) {
    try {
      await setDoc(doc(db, 'users', userData.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`Created user: ${userData.firstName} ${userData.lastName}`);
    } catch (error) {
      console.error(`Error creating user ${userData.firstName}:`, error);
    }
  }

  const sampleReviews = [
    {
      userId: 'user-1',
      barId: 'sample-bar-1', // You'll need to replace with actual bar ID
      rating: 5,
      comment: 'Absolutely stunning sunset views! The service was impeccable and the cocktails were amazing. Highly recommend for a romantic evening.',
    },
    {
      userId: 'user-2',
      barId: 'sample-bar-1',
      rating: 4,
      comment: 'Great atmosphere and friendly staff. The food was delicious and the location is perfect for watching the sunset.',
    },
    {
      userId: 'user-3',
      barId: 'sample-bar-1',
      rating: 5,
      comment: 'This place exceeded all expectations! The infinity pool overlooking the sea was breathtaking. Will definitely return.',
    },
  ];

  for (const reviewData of sampleReviews) {
    try {
      await createReview(reviewData);
      console.log(`Created review for user: ${reviewData.userId}`);
    } catch (error) {
      console.error(`Error creating review for user ${reviewData.userId}:`, error);
    }
  }
};

// Admin functions for bar verification
export const getUnverifiedBars = async () => {
  try {
    const q = query(beachBarsCollection, where('isVerified', '==', false));
    const querySnapshot = await getDocs(q);
    const bars = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BeachBar[];
    return bars;
  } catch (error) {
    console.error('Error getting unverified bars:', error);
    throw error;
  }
};

export const verifyBar = async (barId: string, adminId: string) => {
  try {
    const barRef = doc(db, 'beachBars', barId);
    await updateDoc(barRef, {
      isVerified: true,
      verifiedAt: serverTimestamp(),
      verifiedBy: adminId,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error verifying bar:', error);
    throw error;
  }
};

export const unverifyBar = async (barId: string) => {
  try {
    const barRef = doc(db, 'beachBars', barId);
    await updateDoc(barRef, {
      isVerified: false,
      verifiedAt: null,
      verifiedBy: null,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error unverifying bar:', error);
    throw error;
  }
}; 
import { createBeachBar } from '@/lib/firestore';
import { BeachBar } from '@/lib/firestore';

// Sample beach bar data for seeding
export const sampleBeachBars: Omit<BeachBar, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    ownerId: 'demo-owner-1',
    name: 'Sunset Paradise',
    location: 'Santorini, Greece',
    description: 'Iconic cliffside bar with breathtaking sunset views and premium amenities',
    image: '/src/assets/featured-bar-1.jpg',
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Bar', 'Beach Access', 'Parking'],
    category: 'premium',
    rating: 4.8,
    reviewCount: 156,
    priceRange: 'high',
    coordinates: {
      latitude: 36.3932,
      longitude: 25.4615
    },
    sunbeds: [
      { id: 'A1', type: 'Premium', price: 45, available: true },
      { id: 'A2', type: 'Premium', price: 45, available: true },
      { id: 'A3', type: 'Standard', price: 35, available: false },
      { id: 'A4', type: 'Standard', price: 35, available: true },
    ],
    umbrellas: [
      { id: 'U1', type: 'Large', price: 25, available: true },
      { id: 'U2', type: 'Standard', price: 20, available: true },
      { id: 'U3', type: 'Standard', price: 20, available: false },
    ],
    menuItems: [
      { 
        id: '1', 
        name: 'Sunset Margarita', 
        price: 12, 
        description: 'Fresh lime, tequila, and triple sec', 
        category: 'drinks',
        available: true
      },
      { 
        id: '2', 
        name: 'Pina Colada', 
        price: 10, 
        description: 'Coconut cream, pineapple juice, and rum', 
        category: 'drinks',
        available: true
      },
      { 
        id: '3', 
        name: 'Grilled Fish Tacos', 
        price: 18, 
        description: 'Fresh catch with tropical salsa', 
        category: 'food',
        available: true
      },
      { 
        id: '4', 
        name: 'Beach Burger', 
        price: 15, 
        description: 'Angus beef with fresh vegetables', 
        category: 'food',
        available: true
      },
    ],
  },
  {
    ownerId: 'demo-owner-2',
    name: 'Azure Beach Club',
    location: 'Maldives',
    description: 'Luxury beach club with crystal clear waters and white sand beaches',
    image: '/src/assets/featured-bar-2.jpg',
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Bar', 'Beach Access', 'Spa', 'Water Sports'],
    category: 'premium',
    rating: 4.9,
    reviewCount: 203,
    priceRange: 'high',
    coordinates: {
      latitude: 3.2028,
      longitude: 73.2207
    },
    sunbeds: [
      { id: 'B1', type: 'Luxury', price: 60, available: true },
      { id: 'B2', type: 'Luxury', price: 60, available: true },
      { id: 'B3', type: 'Premium', price: 45, available: true },
      { id: 'B4', type: 'Premium', price: 45, available: false },
    ],
    umbrellas: [
      { id: 'V1', type: 'Premium', price: 30, available: true },
      { id: 'V2', type: 'Standard', price: 20, available: true },
    ],
    menuItems: [
      { 
        id: '5', 
        name: 'Tropical Punch', 
        price: 14, 
        description: 'Fresh tropical fruits with rum', 
        category: 'drinks',
        available: true
      },
      { 
        id: '6', 
        name: 'Seafood Platter', 
        price: 28, 
        description: 'Fresh local seafood with sides', 
        category: 'food',
        available: true
      },
    ],
  },
  {
    ownerId: 'demo-owner-3',
    name: 'Tiki Cove',
    location: 'Bali, Indonesia',
    description: 'Charming beach bar with authentic Indonesian cuisine and tropical vibes',
    image: '/src/assets/featured-bar-3.jpg',
    amenities: ['WiFi', 'Restaurant', 'Bar', 'Beach Access', 'Live Music'],
    category: 'standard',
    rating: 4.6,
    reviewCount: 89,
    priceRange: 'medium',
    coordinates: {
      latitude: -8.3405,
      longitude: 115.0920
    },
    sunbeds: [
      { id: 'C1', type: 'Standard', price: 25, available: true },
      { id: 'C2', type: 'Standard', price: 25, available: true },
      { id: 'C3', type: 'Standard', price: 25, available: false },
    ],
    umbrellas: [
      { id: 'W1', type: 'Standard', price: 15, available: true },
      { id: 'W2', type: 'Standard', price: 15, available: true },
      { id: 'W3', type: 'Standard', price: 15, available: true },
    ],
    menuItems: [
      { 
        id: '7', 
        name: 'Bali Breeze', 
        price: 8, 
        description: 'Local rum with tropical fruits', 
        category: 'drinks',
        available: true
      },
      { 
        id: '8', 
        name: 'Nasi Goreng', 
        price: 12, 
        description: 'Traditional Indonesian fried rice', 
        category: 'food',
        available: true
      },
      { 
        id: '9', 
        name: 'Satay Skewers', 
        price: 10, 
        description: 'Grilled chicken with peanut sauce', 
        category: 'food',
        available: true
      },
    ],
  },
];

// Function to seed data (for development/testing purposes)
export const seedBeachBars = async (ownerId: string) => {
  try {
    console.log('Starting to seed beach bars data...');
    
    for (const barData of sampleBeachBars) {
      // Update the ownerId to use the current user's ID
      const barDataWithOwner = {
        ...barData,
        ownerId: ownerId
      };
      await createBeachBar(barDataWithOwner);
      console.log(`Created beach bar: ${barData.name}`);
    }
    
    console.log('Beach bars seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding beach bars:', error);
  }
};

// Function to check if data already exists
export const checkIfDataExists = async () => {
  try {
    const { getBeachBars } = await import('@/lib/firestore');
    const bars = await getBeachBars();
    return bars.length > 0;
  } catch (error) {
    console.error('Error checking existing data:', error);
    return false;
  }
}; 
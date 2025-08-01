# 🏖️ BeachVibe - Beach Bar Booking Platform

A modern, responsive web application for discovering and booking beach bars around the world. Built with React, TypeScript, and Firebase.

## 🌟 Features

### For Beach Goers
- **Search & Discovery**: Find beach bars by location, amenities, and price
- **Advanced Filtering**: Filter by price range, amenities, categories, and distance
- **Smart Sorting**: Sort by rating, price, distance, and reviews
- **Favorites System**: Save and manage favorite beach bars
- **Booking Management**: Book sunbeds, umbrellas, and tables
- **Digital Menu**: Order food and drinks directly from your spot
- **QR Code Integration**: Easy access to menus and services
- **Review System**: Rate and review your experiences
- **Booking History**: Track past and upcoming bookings
- **Real-time Updates**: Live booking status and notifications

### For Bar Owners
- **Dashboard**: Comprehensive analytics and management tools
- **Bar Management**: Add, edit, and manage beach bar listings
- **Booking Management**: Handle reservations and availability
- **Menu Management**: Create and update digital menus
- **Analytics**: Revenue tracking, booking trends, and performance metrics
- **Customer Management**: View customer details and preferences

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **TanStack Query** - Server state management
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **GSAP** - Smooth animations and transitions
- **Lucide React** - Beautiful icons

### Backend (Planned)
- **Firebase** - Authentication, database, and storage
- **Vercel Functions** - Serverless API endpoints
- **Stripe** - Payment processing
- **Firebase Cloud Messaging** - Push notifications

## 📱 Screenshots

*Screenshots will be added here*

## 🏗️ Architecture Overview

```
Frontend (React) → Vercel Functions → Firebase
                ↓
            Real-time Updates
                ↓
        Firebase Auth + Firestore
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/beachvibe.git
   cd beachvibe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Site footer
│   ├── Hero.tsx        # Landing page hero
│   └── ...
├── pages/              # Page components
│   ├── Index.tsx       # Home page
│   ├── Search.tsx      # Search results
│   ├── Booking.tsx     # Booking flow
│   ├── Order.tsx       # Menu ordering
│   ├── Auth.tsx        # Authentication
│   ├── Dashboard.tsx   # Owner dashboard
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── assets/             # Static assets
└── types/              # TypeScript type definitions
```

## 🚀 Backend Implementation Plan

### Firebase Services
- **Authentication** - User management (email/password, Google, Facebook)
- **Firestore** - NoSQL database for all app data
- **Storage** - Image uploads (bar photos, user avatars)
- **Functions** - Serverless backend logic
- **Hosting** - Static file hosting (optional)

### Firestore Collections Structure

```javascript
// Users Collection
users/{userId}
{
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  type: 'user' | 'owner',
  avatar?: string,
  phone?: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  preferences: {
    notifications: boolean,
    language: string,
    currency: string
  }
}

// Beach Bars Collection
beachBars/{barId}
{
  id: string,
  name: string,
  description: string,
  location: {
    address: string,
    city: string,
    country: string,
    coordinates: { lat: number, lng: number }
  },
  ownerId: string,
  images: string[],
  amenities: string[],
  priceRange: '$' | '$$' | '$$$' | '$$$$',
  basePrice: number,
  capacity: {
    min: number,
    max: number
  },
  rating: number,
  reviewCount: number,
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp,
  category: string,
  tags: string[]
}

// Bookings Collection
bookings/{bookingId}
{
  id: string,
  userId: string,
  barId: string,
  barName: string,
  type: 'sunbed' | 'umbrella' | 'table',
  quantity: number,
  date: timestamp,
  timeSlot: string,
  totalPrice: number,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
  paymentStatus: 'pending' | 'paid' | 'refunded',
  paymentId?: string,
  specialRequests?: string,
  createdAt: timestamp,
  updatedAt: timestamp
}

// Reviews Collection
reviews/{reviewId}
{
  id: string,
  userId: string,
  barId: string,
  bookingId: string,
  rating: number,
  comment: string,
  images?: string[],
  isVerified: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}

// Favorites Collection
favorites/{favoriteId}
{
  id: string,
  userId: string,
  barId: string,
  createdAt: timestamp
}

// Menu Items Collection
menuItems/{itemId}
{
  id: string,
  barId: string,
  name: string,
  description: string,
  price: number,
  category: 'food' | 'drink' | 'dessert',
  image?: string,
  isAvailable: boolean,
  allergens?: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}

// Orders Collection
orders/{orderId}
{
  id: string,
  userId: string,
  barId: string,
  items: [{
    itemId: string,
    name: string,
    price: number,
    quantity: number
  }],
  totalAmount: number,
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled',
  paymentStatus: 'pending' | 'paid' | 'refunded',
  paymentId?: string,
  specialInstructions?: string,
  createdAt: timestamp,
  updatedAt: timestamp
}

// Notifications Collection
notifications/{notificationId}
{
  id: string,
  userId: string,
  type: 'booking' | 'order' | 'payment' | 'system',
  title: string,
  message: string,
  data?: object,
  isRead: boolean,
  createdAt: timestamp
}
```

### Vercel Functions API Endpoints

#### Authentication Routes
```typescript
// /api/auth/register
POST /api/auth/register
{
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  type: 'user' | 'owner'
}

// /api/auth/login
POST /api/auth/login
{
  email: string,
  password: string
}

// /api/auth/logout
POST /api/auth/logout

// /api/auth/profile
GET /api/auth/profile
PUT /api/auth/profile
```

#### Beach Bars Routes
```typescript
// /api/bars
GET /api/bars?search=&category=&priceRange=&amenities=&location=&sort=&page=&limit=
POST /api/bars (owner only)

// /api/bars/[id]
GET /api/bars/[id]
PUT /api/bars/[id] (owner only)
DELETE /api/bars/[id] (owner only)

// /api/bars/[id]/images
POST /api/bars/[id]/images (owner only)
DELETE /api/bars/[id]/images/[imageId] (owner only)

// /api/bars/[id]/reviews
GET /api/bars/[id]/reviews?page=&limit=
POST /api/bars/[id]/reviews (authenticated users)
```

#### Bookings Routes
```typescript
// /api/bookings
GET /api/bookings (user's bookings)
POST /api/bookings

// /api/bookings/[id]
GET /api/bookings/[id]
PUT /api/bookings/[id] (cancel/modify)
DELETE /api/bookings/[id] (cancel)

// /api/bookings/[id]/payment
POST /api/bookings/[id]/payment
```

#### Favorites Routes
```typescript
// /api/favorites
GET /api/favorites (user's favorites)
POST /api/favorites
DELETE /api/favorites/[barId]
```

#### Orders Routes
```typescript
// /api/orders
GET /api/orders (user's orders)
POST /api/orders

// /api/orders/[id]
GET /api/orders/[id]
PUT /api/orders/[id]/status (owner only)
```

#### Owner Dashboard Routes
```typescript
// /api/owner/dashboard
GET /api/owner/dashboard

// /api/owner/bars
GET /api/owner/bars
POST /api/owner/bars

// /api/owner/bookings
GET /api/owner/bookings?barId=&status=&date=

// /api/owner/analytics
GET /api/owner/analytics?period=&barId=
```

### Implementation Phases

#### Phase 1: Foundation (Week 1-2)
- [ ] Firebase project setup
- [ ] Authentication system
- [ ] Basic user management
- [ ] Firestore security rules
- [ ] Vercel functions setup

#### Phase 2: Core Features (Week 3-4)
- [ ] Beach bars CRUD operations
- [ ] Search and filtering
- [ ] Image upload to Firebase Storage
- [ ] Basic booking system

#### Phase 3: Advanced Features (Week 5-6)
- [ ] Payment integration (Stripe)
- [ ] Reviews and ratings
- [ ] Favorites system
- [ ] Real-time notifications

#### Phase 4: Owner Features (Week 7-8)
- [ ] Owner dashboard
- [ ] Booking management
- [ ] Analytics and reporting
- [ ] Menu management

#### Phase 5: Optimization (Week 9-10)
- [ ] Performance optimization
- [ ] Caching strategies
- [ ] Error handling
- [ ] Testing and deployment

### Security Rules (Firestore)

```javascript
// Users can only read/write their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Beach bars are readable by all, writable by owners
match /beachBars/{barId} {
  allow read: if true;
  allow write: if request.auth != null && 
    resource.data.ownerId == request.auth.uid;
}

// Bookings are readable by user and bar owner
match /bookings/{bookingId} {
  allow read: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     get(/databases/$(database.name)/documents/beachBars/$(resource.data.barId)).data.ownerId == request.auth.uid);
  allow create: if request.auth != null;
  allow update: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     get(/databases/$(database.name)/documents/beachBars/$(resource.data.barId)).data.ownerId == request.auth.uid);
}
```

### Environment Variables

```env
# Firebase
FIREBASE_PROJECT_ID=beachvibe-app
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Vercel
VERCEL_ENV=production
VERCEL_URL=https://your-app.vercel.app

# Other
JWT_SECRET=your-jwt-secret
SENDGRID_API_KEY=your-sendgrid-key
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage
```bash
npm run test:coverage
```

## 📦 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [Lucide](https://lucide.dev/) for beautiful icons
- [Firebase](https://firebase.google.com/) for backend services
- [Vercel](https://vercel.com/) for deployment and serverless functions

## 📞 Support

For support, email support@beachvibe.com or join our Slack channel.

## 🔗 Links

- [Live Demo](https://beachvibe.vercel.app)
- [Documentation](https://docs.beachvibe.com)
- [API Reference](https://api.beachvibe.com)

---

Made with ❤️ by the BeachVibe team

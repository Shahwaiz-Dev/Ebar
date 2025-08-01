import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MapPin, 
  Star, 
  Users, 
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import featuredBar1 from '@/assets/featured-bar-1.jpg';
import featuredBar2 from '@/assets/featured-bar-2.jpg';
import featuredBar3 from '@/assets/featured-bar-3.jpg';

// Enhanced mock data for beach bars (same as Search page)
const beachBars = [
  {
    id: 1,
    name: 'Sunset Paradise',
    location: 'Santorini, Greece',
    rating: 4.9,
    reviews: 128,
    image: featuredBar1,
    description: 'Iconic cliffside bar with breathtaking sunset views and world-class cocktails.',
    price: 85,
    priceRange: '$$$',
    amenities: ['Infinity Pool', 'Live DJ', 'Sunset Views', 'Beachfront', 'Fine Dining'],
    capacity: '2-12 guests',
    distance: 0.5,
    category: 'Luxury',
  },
  {
    id: 2,
    name: 'Azure Beach Club',
    location: 'Mykonos, Greece',
    rating: 4.8,
    reviews: 95,
    image: featuredBar2,
    description: 'Luxury beach club featuring modern architecture and premium beachside service.',
    price: 120,
    priceRange: '$$$$',
    amenities: ['Beach Beds', 'Fine Dining', 'VIP Service', 'Infinity Pool', 'Live DJ'],
    capacity: '2-8 guests',
    distance: 1.2,
    category: 'Premium',
  },
  {
    id: 3,
    name: 'Tiki Cove',
    location: 'Maui, Hawaii',
    rating: 4.7,
    reviews: 156,
    image: featuredBar3,
    description: 'Tropical paradise with authentic Hawaiian cocktails and beachfront dining.',
    price: 95,
    priceRange: '$$$',
    amenities: ['Tiki Bar', 'Live Music', 'Beach Access', 'Local Cuisine'],
    capacity: '2-10 guests',
    distance: 2.1,
    category: 'Tropical',
  },
  {
    id: 4,
    name: 'Ocean Breeze',
    location: 'Bali, Indonesia',
    rating: 4.6,
    reviews: 89,
    image: featuredBar1,
    description: 'Serene beachfront bar with traditional Indonesian cuisine and sunset views.',
    price: 75,
    priceRange: '$$',
    amenities: ['Beachfront', 'Local Cuisine', 'Spa Services', 'Sunset Views'],
    capacity: '2-6 guests',
    distance: 3.5,
    category: 'Relaxed',
  },
  {
    id: 5,
    name: 'Coral Reef',
    location: 'Maldives',
    rating: 4.5,
    reviews: 67,
    image: featuredBar2,
    description: 'Overwater bar with stunning coral reef views and fresh seafood.',
    price: 150,
    priceRange: '$$$$',
    amenities: ['Overwater', 'Coral Views', 'Fresh Seafood', 'Snorkeling'],
    capacity: '2-6 guests',
    distance: 5.2,
    category: 'Luxury',
  },
  {
    id: 6,
    name: 'Beach Shack',
    location: 'Miami, Florida',
    rating: 4.3,
    reviews: 234,
    image: featuredBar3,
    description: 'Casual beachfront bar with great cocktails and live music.',
    price: 45,
    priceRange: '$',
    amenities: ['Live Music', 'Casual Dining', 'Beach Access', 'Happy Hour'],
    capacity: '2-15 guests',
    distance: 0.8,
    category: 'Casual',
  },
];

export const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoriteBars, setFavoriteBars] = useState<typeof beachBars>([]);
  const navigate = useNavigate();

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      const favoriteIds = JSON.parse(savedFavorites);
      setFavorites(favoriteIds);
      const bars = beachBars.filter(bar => favoriteIds.includes(bar.id));
      setFavoriteBars(bars);
    }
  }, []);

  const removeFavorite = (barId: number) => {
    const newFavorites = favorites.filter(id => id !== barId);
    setFavorites(newFavorites);
    setFavoriteBars(prev => prev.filter(bar => bar.id !== barId));
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const handleBarSelect = (barId: number) => {
    navigate(`/order/${barId}`);
  };

  const getPriceColor = (priceRange: string) => {
    switch (priceRange) {
      case '$': return 'text-green-600';
      case '$$': return 'text-yellow-600';
      case '$$$': return 'text-orange-600';
      case '$$$$': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/search')} 
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
            
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-foreground mb-4">
                Your <span className="text-gradient">Favorites</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                {favoriteBars.length} beach bar{favoriteBars.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>

          {favoriteBars.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No favorites yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start exploring beach bars and save your favorites for later
              </p>
              <Button onClick={() => navigate('/search')}>
                Explore Beach Bars
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteBars.map((bar) => (
                <Card 
                  key={bar.id} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  onClick={() => handleBarSelect(bar.id)}
                >
                  <div className="relative">
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={bar.image}
                        alt={bar.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(bar.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="absolute top-2 left-2">
                      <Badge className={`${getPriceColor(bar.priceRange)} bg-white/90`}>
                        {bar.priceRange}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-foreground mb-2">
                          {bar.name}
                        </CardTitle>
                        <div className="flex items-center text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{bar.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span className="font-semibold">{bar.rating}</span>
                          <span className="text-muted-foreground text-sm ml-1">
                            ({bar.reviews})
                          </span>
                        </div>
                        <div className="text-lg font-bold text-primary">
                          ${bar.price}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {bar.description}
                    </p>
                    
                    {/* Amenities */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {bar.amenities.slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {bar.amenities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{bar.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{bar.capacity}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{bar.distance}km</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-white">
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FavoritesPage; 
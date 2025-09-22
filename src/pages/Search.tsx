import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Star, 
  Users, 
  Heart,
  HeartOff,
  Sun,
  Umbrella,
  TrendingUp,
  Clock,
  DollarSign
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { LazyImage } from '@/components/ui/lazy-image';
import { SearchResultsSkeleton } from '@/components/ui/loading-skeleton';
import { QuickShareButton } from '@/components/ui/share-button';
import { useBeachBars } from '@/hooks/useBeachBars';
import { useFavoritesByUser, useAddToFavorites, useRemoveFromFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import LocationPicker from '@/components/LocationPicker';
import featuredBar1 from '@/assets/featured-bar-1.jpg';
import featuredBar2 from '@/assets/featured-bar-2.jpg';
import featuredBar3 from '@/assets/featured-bar-3.jpg';

// Helper function to get image based on bar name
const getBarImage = (barName: string) => {
  if (barName.includes('Sunset') || barName.includes('Paradise')) return featuredBar1;
  if (barName.includes('Azure') || barName.includes('Club')) return featuredBar2;
  return featuredBar3;
};


export const SearchPage = () => {
  const { currentUser } = useAuth();
  const { data: beachBars = [], isLoading: barsLoading } = useBeachBars();
  const { data: userFavorites = [] } = useFavoritesByUser(currentUser?.uid || '');
  const addToFavoritesMutation = useAddToFavorites();
  const removeFromFavoritesMutation = useRemoveFromFavorites();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [searchCoordinates, setSearchCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [filteredBars, setFilteredBars] = useState(beachBars);
  const navigate = useNavigate();

  // Update filtered bars when beachBars data changes
  useEffect(() => {
    setFilteredBars(beachBars);
  }, [beachBars]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters(value, locationSearch);
  };

  const handleLocationSearch = (value: string) => {
    setLocationSearch(value);
    applyFilters(searchTerm, value);
  };

  const handleLocationCoordinatesChange = (coordinates: { lat: number; lng: number }) => {
    setSearchCoordinates(coordinates);
  };

  const toggleFavorite = (barId: string) => {
    if (!currentUser?.uid) return;
    
    const isFavorite = userFavorites.some(fav => fav.barId === barId);
    
    if (isFavorite) {
      removeFromFavoritesMutation.mutate({ userId: currentUser.uid, barId });
    } else {
      addToFavoritesMutation.mutate({
        userId: currentUser.uid,
        barId: barId
      });
    }
  };

  const applyFilters = (searchValue = searchTerm, locationValue = locationSearch) => {
    let filtered = beachBars.filter(bar => {
      // Search filter
      const matchesSearch = searchValue === '' || 
        bar.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        bar.location.toLowerCase().includes(searchValue.toLowerCase());

      // Location filter - check if location search matches bar location
      const matchesLocation = locationValue === '' || 
        bar.location.toLowerCase().includes(locationValue.toLowerCase());

      return matchesSearch && matchesLocation;
    });

    setFilteredBars(filtered);
  };


  const handleBarSelect = (barId: string) => {
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
          {/* Search Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-foreground mb-6">
              Find Your Perfect <span className="text-gradient">Beach Bar</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Search, filter, and discover amazing beach bars around the world
            </p>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search beach bars..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <div className="relative">
                  <LocationPicker
                    initialAddress={locationSearch}
                    onAddressChange={handleLocationSearch}
                    onCoordinatesChange={handleLocationCoordinatesChange}
                    showSearchBoxOnly={true}
                    placeholder="Search by location..."
                    inputClassName="h-12 text-lg"
                  />
                </div>
              </div>
            </div>
          </div>


          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {filteredBars.length} beach bar{filteredBars.length !== 1 ? 's' : ''} found
            </p>
            {userFavorites.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/favorites')}>
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                {userFavorites.length} Favorites
              </Button>
            )}
          </div>

          {/* Beach Bars Grid */}
          {barsLoading ? (
            <SearchResultsSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {filteredBars.map((bar) => {
                
                return (
                  <Card 
                    key={bar.id} 
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
                    onClick={() => handleBarSelect(bar.id)}
                  >
                    <div className="relative">
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <LazyImage
                          src={getBarImage(bar.name)}
                          alt={bar.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <QuickShareButton
                          title={bar.name}
                          url={`${window.location.origin}/search?bar=${bar.id}`}
                          className="bg-white/90 hover:bg-white"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(bar.id!);
                          }}
                        >
                          {userFavorites.some(fav => fav.barId === bar.id) ? (
                            <Heart className="h-4 w-4 text-red-500 fill-current" />
                          ) : (
                            <HeartOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge className={`${getPriceColor(bar.priceRange)} bg-white/90`}>
                          {bar.priceRange}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold text-foreground mb-2 truncate">
                            {bar.name}
                          </CardTitle>
                          <div className="flex items-center text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="text-sm truncate">{bar.location}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="flex items-center mb-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span className="font-semibold text-sm">{bar.rating}</span>
                            <span className="text-muted-foreground text-xs ml-1">
                              ({bar.reviewCount})
                            </span>
                          </div>
                          <div className="text-base font-bold text-primary">
                            ${bar.sunbeds.length > 0 ? bar.sunbeds[0].price : 50}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 flex-1 flex flex-col">
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2 flex-1">
                        {bar.description}
                      </p>
                      
                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {bar.amenities.slice(0, 2).map((amenity) => (
                          <Badge key={amenity} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {bar.amenities.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{bar.amenities.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {filteredBars.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No beach bars found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage; 
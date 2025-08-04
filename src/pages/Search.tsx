import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  MapPin, 
  Star, 
  Users, 
  Filter, 
  SortAsc, 
  SortDesc,
  Heart,
  HeartOff,
  SlidersHorizontal,
  X,
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
import featuredBar1 from '@/assets/featured-bar-1.jpg';
import featuredBar2 from '@/assets/featured-bar-2.jpg';
import featuredBar3 from '@/assets/featured-bar-3.jpg';

// Helper function to get image based on bar name
const getBarImage = (barName: string) => {
  if (barName.includes('Sunset') || barName.includes('Paradise')) return featuredBar1;
  if (barName.includes('Azure') || barName.includes('Club')) return featuredBar2;
  return featuredBar3;
};

// Available amenities for filtering
const availableAmenities = [
  'Infinity Pool', 'Live DJ', 'Sunset Views', 'Beachfront', 'Fine Dining',
  'Beach Beds', 'VIP Service', 'Tiki Bar', 'Live Music', 'Local Cuisine',
  'Spa Services', 'Overwater', 'Coral Views', 'Fresh Seafood', 'Snorkeling',
  'Casual Dining', 'Happy Hour'
];

// Sort options
const sortOptions = [
  { value: 'rating', label: 'Rating (High to Low)', icon: SortDesc },
  { value: 'rating-asc', label: 'Rating (Low to High)', icon: SortAsc },
  { value: 'price', label: 'Price (High to Low)', icon: SortDesc },
  { value: 'price-asc', label: 'Price (Low to High)', icon: SortAsc },
  { value: 'distance', label: 'Distance (Near to Far)', icon: SortAsc },
  { value: 'reviews', label: 'Most Reviews', icon: SortDesc },
];

export const SearchPage = () => {
  const { currentUser } = useAuth();
  const { data: beachBars = [], isLoading: barsLoading } = useBeachBars();
  const { data: userFavorites = [] } = useFavoritesByUser(currentUser?.uid || '');
  const addToFavoritesMutation = useAddToFavorites();
  const removeFromFavoritesMutation = useRemoveFromFavorites();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBars, setFilteredBars] = useState(beachBars);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('rating');
  const navigate = useNavigate();

  // Update filtered bars when beachBars data changes
  useEffect(() => {
    setFilteredBars(beachBars);
  }, [beachBars]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters(value);
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

  const applyFilters = (searchValue = searchTerm) => {
    let filtered = beachBars.filter(bar => {
      // Search filter
      const matchesSearch = searchValue === '' || 
        bar.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        bar.location.toLowerCase().includes(searchValue.toLowerCase());

      // Amenities filter
      const matchesAmenities = selectedAmenities.length === 0 ||
        selectedAmenities.every(amenity => bar.amenities.includes(amenity));

      // Price filter - use sunbed prices as reference
      const avgPrice = bar.sunbeds.length > 0 
        ? bar.sunbeds.reduce((sum, bed) => sum + bed.price, 0) / bar.sunbeds.length 
        : 50;
      const matchesPrice = avgPrice >= priceRange[0] && avgPrice <= priceRange[1];

      // Category filter
      const matchesCategory = selectedCategories.length === 0 ||
        selectedCategories.includes(bar.category);

      return matchesSearch && matchesAmenities && matchesPrice && matchesCategory;
    });

    // Apply sorting
    filtered = sortBars(filtered, sortBy);
    setFilteredBars(filtered);
  };

  const sortBars = (bars: any[], sortOption: string) => {
    return [...bars].sort((a, b) => {
      switch (sortOption) {
        case 'rating':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        case 'price':
          const avgPriceA = a.sunbeds.length > 0 
            ? a.sunbeds.reduce((sum: number, bed: any) => sum + bed.price, 0) / a.sunbeds.length 
            : 50;
          const avgPriceB = b.sunbeds.length > 0 
            ? b.sunbeds.reduce((sum: number, bed: any) => sum + bed.price, 0) / b.sunbeds.length 
            : 50;
          return avgPriceB - avgPriceA;
        case 'price-asc':
          const avgPriceA2 = a.sunbeds.length > 0 
            ? a.sunbeds.reduce((sum: number, bed: any) => sum + bed.price, 0) / a.sunbeds.length 
            : 50;
          const avgPriceB2 = b.sunbeds.length > 0 
            ? b.sunbeds.reduce((sum: number, bed: any) => sum + bed.price, 0) / b.sunbeds.length 
            : 50;
          return avgPriceA2 - avgPriceB2;
        case 'distance':
          return (a.coordinates?.latitude || 0) - (b.coordinates?.latitude || 0);
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    const sorted = sortBars(filteredBars, newSort);
    setFilteredBars(sorted);
  };

  const clearFilters = () => {
    setSelectedAmenities([]);
    setPriceRange([0, 200]);
    setSelectedCategories([]);
    setSortBy('rating');
    setFilteredBars(beachBars);
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
            
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search beach bars..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-12 px-6"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    Filters & Sorting
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sort Options */}
                <div>
                  <h3 className="font-semibold mb-3">Sort By</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {sortOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <Button
                          key={option.value}
                          variant={sortBy === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSortChange(option.value)}
                          className="justify-start"
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold mb-3">Price Range</h3>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-24"
                    />
                    <span>to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-24"
                    />
                    <Button size="sm" onClick={() => applyFilters()}>
                      Apply
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Categories */}
                <div>
                  <h3 className="font-semibold mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Luxury', 'Premium', 'Tropical', 'Relaxed', 'Casual'].map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategories.includes(category) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedCategories(prev => 
                            prev.includes(category)
                              ? prev.filter(c => c !== category)
                              : [...prev, category]
                          );
                        }}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Amenities */}
                <div>
                  <h3 className="font-semibold mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableAmenities.map((amenity) => (
                      <Button
                        key={amenity}
                        variant={selectedAmenities.includes(amenity) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedAmenities(prev => 
                            prev.includes(amenity)
                              ? prev.filter(a => a !== amenity)
                              : [...prev, amenity]
                          );
                        }}
                      >
                        {amenity}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                Try adjusting your search terms or filters
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage; 
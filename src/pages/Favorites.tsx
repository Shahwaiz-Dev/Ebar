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
  ArrowLeft,
  Sun,
  Umbrella
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFavoritesByUser, useRemoveFromFavorites } from '@/hooks/useFavorites';
import { useBeachBars } from '@/hooks/useBeachBars';
import { toast } from 'sonner';

export const FavoritesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { data: userFavorites = [], isLoading: favoritesLoading } = useFavoritesByUser(currentUser?.uid || '');
  const { data: beachBars = [], isLoading: barsLoading } = useBeachBars();
  const removeFromFavoritesMutation = useRemoveFromFavorites();

  // Get the actual beach bar data for favorited bars
  const favoriteBars = beachBars.filter(bar => 
    userFavorites.some(fav => fav.barId === bar.id)
  );

  const handleRemoveFavorite = async (barId: string) => {
    if (!currentUser) {
      toast.error('Please log in to manage favorites');
      return;
    }

    try {
      await removeFromFavoritesMutation.mutateAsync({ userId: currentUser.uid, barId });
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove from favorites');
    }
  };

  const handleBarSelect = (barId: string) => {
    navigate(`/order/${barId}`);
  };

  const getPriceColor = (priceRange: string) => {
    switch (priceRange) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  // Show loading while data is being fetched
  if (favoritesLoading || barsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your favorites...</p>
        </div>
      </div>
    );
  }

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {favoriteBars.map((bar) => (
                <Card 
                  key={bar.id} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
                  onClick={() => handleBarSelect(bar.id!)}
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
                        handleRemoveFavorite(bar.id!);
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
                          €{bar.sunbeds.length > 0 ? bar.sunbeds[0].price : 50}
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

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Sun className="h-3 w-3 mr-1" />
                          <span>{bar.sunbeds.filter(s => s.available).length}</span>
                        </div>
                        <div className="flex items-center">
                          <Umbrella className="h-3 w-3 mr-1" />
                          <span>{bar.umbrellas.filter(u => u.available).length}</span>
                        </div>
                      </div>
                      <Button variant="sunset" size="sm" className="text-xs">
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
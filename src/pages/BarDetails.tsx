import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Loader2 } from 'lucide-react';
import { 
  MapPin, 
  Star, 
  Users, 
  Clock, 
  Phone, 
  Mail, 
  ArrowLeft,
  Sun,
  Umbrella,
  Calendar,
  Heart,
  Share2,
  Navigation,
  Wifi,
  Waves,
  Music,
  Utensils,
  Car
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useBeachBar } from '@/hooks/useBeachBars';
import { useReviewsByBar } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { addToFavorites, removeFromFavorites, isFavorite } from '@/lib/firestore';
import { toast } from 'sonner';

export const BarDetailsPage = () => {
  const { barId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { data: bar, isLoading, error } = useBeachBar(barId || '');
  const { data: reviews = [], isLoading: reviewsLoading } = useReviewsByBar(barId || '');
  
  const [isFavoriteBar, setIsFavoriteBar] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock images for the bar
  const barImages = [
    bar?.image || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
  ];

  useEffect(() => {
    if (currentUser && bar) {
      checkFavoriteStatus();
    }
  }, [currentUser, bar]);

  const checkFavoriteStatus = async () => {
    if (!currentUser || !bar) return;
    try {
      const favorite = await isFavorite(currentUser.uid, bar.id!);
      setIsFavoriteBar(favorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      toast.error('Please log in to add favorites');
      return;
    }

    try {
      if (isFavoriteBar) {
        await removeFromFavorites(currentUser.uid, bar!.id!);
        setIsFavoriteBar(false);
        toast.success('Removed from favorites');
      } else {
        await addToFavorites({
          userId: currentUser.uid,
          barId: bar!.id!,
        });
        setIsFavoriteBar(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleBookNow = () => {
    navigate(`/order/${barId}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: bar?.name,
        text: `Check out ${bar?.name} - ${bar?.description}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: any } = {
      'Infinity Pool': Waves,
      'Live DJ': Music,
      'Fine Dining': Utensils,
      'VIP Service': Users,
      'Beach Access': Navigation,
      'WiFi': Wifi,
      'Parking': Car,
    };
    return iconMap[amenity] || Users;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bar details...</p>
        </div>
      </div>
    );
  }

  if (error || !bar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Bar not found</h1>
            <Button onClick={() => navigate('/search')}>Back to Search</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Image Gallery */}
            <div className="lg:col-span-2">
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                <img
                  src={barImages[selectedImage]}
                  alt={bar.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h1 className="text-3xl font-bold mb-2">{bar.name}</h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{bar.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span>{bar.rating}</span>
                      <span className="ml-1">({bar.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {barImages.map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-video rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedImage === index ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image}
                      alt={`${bar.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Info & Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Quick Info</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleFavorite}
                        className={isFavoriteBar ? 'text-red-500' : ''}
                      >
                        <Heart className={`h-4 w-4 ${isFavoriteBar ? 'fill-current' : ''}`} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{bar.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm">{bar.rating} ({bar.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Capacity: 2-12 guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Open: 10:00 AM - 10:00 PM</span>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sunbeds Available</span>
                      <span className="font-semibold">{bar.sunbeds.filter(s => s.available).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Umbrellas Available</span>
                      <span className="font-semibold">{bar.umbrellas.filter(u => u.available).length}</span>
                    </div>
                  </div>
                  <Button onClick={handleBookNow} className="w-full" size="lg">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {bar.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {bar.description}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location & Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{bar.location}</p>
                      <p className="text-sm text-muted-foreground">Exact address available after booking</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>info@{bar.name.toLowerCase().replace(/\s+/g, '')}.com</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Amenities Tab */}
            <TabsContent value="amenities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Amenities & Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bar.amenities.map((amenity) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div key={amenity} className="flex items-center gap-3 p-3 rounded-lg border">
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="font-medium">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Menu Tab */}
            <TabsContent value="menu" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Food & Drinks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Drinks</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bar.menuItems
                          .filter(item => item.category === 'drinks')
                          .map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                              <span className="font-bold text-primary">${item.price}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Food</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bar.menuItems
                          .filter(item => item.category === 'food')
                          .map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                              <span className="font-bold text-primary">${item.price}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                              {review.user?.photoURL ? (
                                <img 
                                  src={review.user.photoURL} 
                                  alt={review.user.displayName || 'User'} 
                                  className="h-full w-full object-cover" 
                                />
                              ) : (
                                <User className="h-5 w-5" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{review.user?.firstName ? `${review.user.firstName} ${review.user.lastName}` : review.user?.displayName || review.userId || 'Anonymous User'}</h4>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${review.rating > i ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill={review.rating > i ? 'currentColor' : 'none'}
                                    strokeWidth={review.rating > i ? 0 : 1.5}
                                  />
                                ))}
                              </div>
                              <span className="ml-2 text-sm text-muted-foreground">{review.rating} out of 5</span>
                            </div>
                            <p className="mt-1 text-muted-foreground">{review.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No reviews yet.</p>
                      <p className="text-sm">Be the first to review this beach bar</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BarDetailsPage; 
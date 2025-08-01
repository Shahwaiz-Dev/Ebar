import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Home, 
  MapPin, 
  Heart, 
  ArrowLeft,
  Waves,
  Compass
} from 'lucide-react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const popularDestinations = [
    { name: 'Santorini, Greece', path: '/search?location=santorini' },
    { name: 'Mykonos, Greece', path: '/search?location=mykonos' },
    { name: 'Maui, Hawaii', path: '/search?location=maui' },
    { name: 'Bali, Indonesia', path: '/search?location=bali' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* 404 Illustration */}
            <div className="mb-8">
              <div className="relative mx-auto w-48 h-48 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-200 rounded-full flex items-center justify-center">
                  <Waves className="h-24 w-24 text-primary" />
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg">
                  <Compass className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="mb-12">
              <h1 className="text-6xl lg:text-8xl font-playfair font-bold text-foreground mb-4">
                404
              </h1>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Oops! Page not found
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                The page you're looking for seems to have drifted away with the tide. 
                Let's get you back to discovering amazing beach bars!
              </p>
            </div>

            {/* Search Section */}
            <Card className="mb-8 max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Search className="h-5 w-5" />
                  Find Beach Bars
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for beach bars..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={!searchTerm.trim()}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Popular Destinations */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Popular Destinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {popularDestinations.map((destination) => (
                    <Button
                      key={destination.name}
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(destination.path)}
                      className="h-auto py-3 px-4 flex flex-col items-center gap-1"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs">{destination.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1" onClick={() => navigate('/')}>
                <CardContent className="p-6 text-center">
                  <Home className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Go Home</h3>
                  <p className="text-sm text-muted-foreground">
                    Return to the main page
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1" onClick={() => navigate('/search')}>
                <CardContent className="p-6 text-center">
                  <Search className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Explore Bars</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover amazing beach bars
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1" onClick={() => navigate('/favorites')}>
                <CardContent className="p-6 text-center">
                  <Heart className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Your Favorites</h3>
                  <p className="text-sm text-muted-foreground">
                    View saved beach bars
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Error Details (for debugging) */}
            <div className="text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, ShoppingCart, QrCode, MapPin, Star, Users } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useBeachBar } from '@/hooks/useBeachBars';
import featuredBar1 from '@/assets/featured-bar-1.jpg';
import featuredBar2 from '@/assets/featured-bar-2.jpg';
import featuredBar3 from '@/assets/featured-bar-3.jpg';

// Helper function to get image based on bar name
const getBarImage = (barName: string) => {
  if (barName.includes('Sunset') || barName.includes('Paradise')) return featuredBar1;
  if (barName.includes('Azure') || barName.includes('Club')) return featuredBar2;
  return featuredBar3;
};



interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export const QRMenuPage = () => {
  const { barId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'drinks' | 'food'>('drinks');
  const [showCart, setShowCart] = useState(false);

  // Get QR code data from URL parameters
  const sunbedNumber = searchParams.get('sunbed') || '';
  const umbrellaNumber = searchParams.get('umbrella') || '';
  const spotId = sunbedNumber || umbrellaNumber;

  // Fetch the specific bar using Firebase data
  const { data: selectedBar, isLoading, error } = useBeachBar(barId || '');

  useEffect(() => {
    // Auto-detect if user is on mobile (QR code scan)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && spotId && selectedBar) {
      // Show a welcome message for QR code users
      console.log(`Welcome to ${selectedBar.name}! You're at spot ${spotId}`);
    }
  }, [selectedBar, spotId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Loading...</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !selectedBar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
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

  const addToCart = (item: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevCart.filter(item => item.id !== itemId);
      }
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      alert('Please add items to your cart');
      return;
    }
    
    const orderData = {
      barId: selectedBar.id,
      barName: selectedBar.name,
      sunbedNumber,
      umbrellaNumber,
      spotId,
      items: cart,
      total: getTotalPrice(),
      type: 'qr-menu',
    };
    
    localStorage.setItem('currentOrder', JSON.stringify(orderData));
    navigate('/payment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* QR Code Welcome Banner */}
          {spotId && (
            <Card className="mb-6 bg-gradient-to-r from-primary/10 to-orange-100 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <QrCode className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Welcome to {selectedBar.name}!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You're at spot {spotId}. Order food & drinks to be delivered to your location.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bar Info */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={selectedBar.image || getBarImage(selectedBar.name)}
                    alt={selectedBar.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-2">{selectedBar.name}</h1>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{selectedBar.location}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span>{selectedBar.rating}</span>
                      <span className="text-muted-foreground ml-1">({selectedBar.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="secondary">{selectedBar.category}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Menu Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Digital Menu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Tab Navigation */}
                  <div className="flex gap-4 mb-6">
                    <Button
                      variant={activeTab === 'drinks' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('drinks')}
                    >
                      Drinks
                    </Button>
                    <Button
                      variant={activeTab === 'food' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('food')}
                    >
                      Food
                    </Button>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-4">
                    {selectedBar.menuItems
                      .filter(item => item.category === activeTab && item.available)
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{item.name}</h3>
                              <Badge variant="secondary">{item.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <p className="text-lg font-bold text-primary mt-1">${item.price}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addToCart(item)}
                            className="ml-4"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cart Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Your Order ({cart.length} items)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Your cart is empty
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ${item.price} × {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToCart(item)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>${getTotalPrice()}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {spotId && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Delivery to: {spotId}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={handleProceedToPayment}
                disabled={cart.length === 0}
                className="w-full"
                size="lg"
              >
                {cart.length > 0 ? `Pay $${getTotalPrice()}` : 'Add Items to Cart'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QRMenuPage; 
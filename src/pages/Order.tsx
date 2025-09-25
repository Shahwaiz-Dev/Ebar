import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, MapPin, Star, Users, ShoppingCart } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useBeachBar } from '@/hooks/useBeachBars';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateOrder } from '@/hooks/useBookings';
import { toast } from 'sonner';
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

export const OrderPage = () => {
  const { barId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sunbedNumber, setSunbedNumber] = useState('');
  const [umbrellaNumber, setUmbrellaNumber] = useState('');
  const [activeTab, setActiveTab] = useState<'drinks' | 'food'>('drinks');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Fetch the specific bar using Firebase data
  const { data: selectedBar, isLoading, error } = useBeachBar(barId || '');
  const createOrderMutation = useCreateOrder();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <Header />
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

  const handleProceedToPayment = async () => {
    if (!currentUser) {
      toast.error('Please log in to place an order');
      navigate('/auth');
      return;
    }

    if (cart.length === 0) {
      toast.error('Please add items to your cart');
      return;
    }

    if (!customerName || !customerEmail || !customerPhone) {
      toast.error('Please fill in all customer details');
      return;
    }

    const orderData: any = {
      userId: currentUser.uid,
      barId: selectedBar.id!,
      barName: selectedBar.name,
      customerName,
      customerEmail,
      customerPhone,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: item.category as 'drinks' | 'food'
      })),
      total: getTotalPrice(),
      status: 'pending' as const,
    };

    if (sunbedNumber || umbrellaNumber) {
      orderData.deliveryLocation = {};
      if (sunbedNumber) {
        orderData.deliveryLocation.sunbedNumber = sunbedNumber;
      }
      if (umbrellaNumber) {
        orderData.deliveryLocation.umbrellaNumber = umbrellaNumber;
      }
    }

    try {
      await createOrderMutation.mutateAsync(orderData);
      toast.success('Food order placed successfully! Please wait for confirmation.');
      navigate('/booking-history');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bar Info */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" onClick={() => navigate('/search')} className="text-muted-foreground">
                ← Back to Search
              </Button>
            </div>
            
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Menu Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Menu & Order
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
                            <p className="text-lg font-bold text-primary mt-1">€{item.price}</p>
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

            {/* Cart & Location Section */}
            <div className="space-y-6">
              {/* Customer Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">Full Name</Label>
                    <Input
                      id="customerName"
                      placeholder="Enter your full name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sunbed">Sunbed Number</Label>
                    <Input
                      id="sunbed"
                      placeholder="e.g., A12, B5"
                      value={sunbedNumber}
                      onChange={(e) => setSunbedNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="umbrella">Umbrella Number</Label>
                    <Input
                      id="umbrella"
                      placeholder="e.g., U3, U7"
                      value={umbrellaNumber}
                      onChange={(e) => setUmbrellaNumber(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cart */}
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
                              €{item.price} × {item.quantity}
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

              <Button
                onClick={handleProceedToPayment}
                disabled={cart.length === 0 || !customerName || !customerEmail || !customerPhone}
                className="w-full"
                size="lg"
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderPage; 
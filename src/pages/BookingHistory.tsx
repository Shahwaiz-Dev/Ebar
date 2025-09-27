import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Receipt,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Loader2,
  ShoppingCart
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ReviewModal } from '@/components/ReviewModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBookingsByUser, useOrdersByUser } from '@/hooks/useBookings';
import { useBeachBars } from '@/hooks/useBeachBars';
import { toast } from 'sonner';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return CheckCircle;
    case 'confirmed':
      return CheckCircle;
    case 'pending':
      return ClockIcon;
    case 'cancelled':
      return XCircle;
    default:
      return ClockIcon;
  }
};

export const BookingHistoryPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { data: bookings = [], isLoading: bookingsLoading } = useBookingsByUser(currentUser?.uid || '');
  const { data: orders = [], isLoading: ordersLoading } = useOrdersByUser(currentUser?.uid || '');
  const { data: beachBars = [], isLoading: barsLoading } = useBeachBars();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Get bar details for each booking and order
  const bookingsWithBarDetails = bookings.map(booking => {
    const bar = beachBars.find(b => b.id === booking.barId);
    return {
      ...booking,
      barImage: bar?.image || '',
      barLocation: bar?.location || '',
      barRating: bar?.rating || 0,
      barCategory: bar?.category || 'standard'
    };
  });

  const ordersWithBarDetails = orders.map(order => {
    const bar = beachBars.find(b => b.id === order.barId);
    return {
      ...order,
      barImage: bar?.image || '',
      barLocation: bar?.location || '',
      barRating: bar?.rating || 0,
      barCategory: bar?.category || 'standard'
    } as typeof order & {
      barImage: string;
      barLocation: string;
      barRating: number;
      barCategory: string;
    };
  });

  const filteredBookings = bookingsWithBarDetails.filter(booking => {
    if (activeTab === 'all' || activeTab === 'bookings') return true;
    return booking.status === activeTab;
  });

  const filteredOrders = ordersWithBarDetails.filter(order => {
    if (activeTab === 'all' || activeTab === 'orders') return true;
    return order.status === activeTab;
  });

  const handleBarSelect = (barId: string) => {
    navigate(`/order/${barId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading state
  if (bookingsLoading || ordersLoading || barsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your booking history...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!currentUser) {
    navigate('/auth');
    return null;
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
              onClick={() => navigate('/')} 
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-foreground mb-4">
                Booking <span className="text-gradient">History</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                View and manage your beach bar bookings
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Bookings</p>
                    <p className="text-lg sm:text-2xl font-bold">{bookings.length}</p>
                  </div>
                  <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-lg sm:text-2xl font-bold">{orders.length}</p>
                  </div>
                  <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-600">
                      {bookings.filter(b => b.status === 'completed').length + orders.filter(o => o.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Spent</p>
                    <p className="text-lg sm:text-2xl font-bold text-primary">
                      €{bookings.reduce((sum, b) => sum + b.total, 0) + orders.reduce((sum, o) => sum + o.total, 0)}
                    </p>
                  </div>
                  <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap w-full">
              <TabsTrigger value="all" className="text-xs sm:text-sm flex-1">All</TabsTrigger>
              <TabsTrigger value="bookings" className="text-xs sm:text-sm flex-1">Bookings</TabsTrigger>
              <TabsTrigger value="orders" className="text-xs sm:text-sm flex-1">Orders</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm flex-1">Pending</TabsTrigger>
              <TabsTrigger value="confirmed" className="text-xs sm:text-sm flex-1">Confirmed</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm flex-1">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredBookings.length === 0 && filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No {activeTab} bookings or orders
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {activeTab === 'all' 
                      ? 'Start booking your first beach bar experience'
                      : `You don't have any ${activeTab} bookings or orders yet`
                    }
                  </p>
                  <Button onClick={() => navigate('/search')}>
                    Explore Beach Bars
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Bookings Section */}
                  {filteredBookings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Your Bookings</h3>
                      <div className="space-y-4">
                        {filteredBookings.map((booking) => {
                          const StatusIcon = getStatusIcon(booking.status);
                          return (
                            <Card key={booking.id} className="overflow-hidden">
                              <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                      <img
                                        src={booking.barImage}
                                        alt={booking.barName}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <CardTitle className="text-xl mb-2">{booking.barName}</CardTitle>
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center">
                                          <MapPin className="h-4 w-4 mr-1" />
                                          <span>{booking.barLocation}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                          <span>{booking.barRating}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <Users className="h-4 w-4 mr-1" />
                                          <span>{booking.guests} guests</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <Badge className={getStatusColor(booking.status)}>
                                      <StatusIcon className="h-3 w-3 mr-1" />
                                      {booking.status}
                                    </Badge>
                                    <p className="text-lg font-bold text-primary mt-2">
                                      €{booking.total}
                                    </p>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold mb-3">Booking Details</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>{formatDate(booking.date)}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>{formatTime(booking.time)}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>Booking ID: {booking.id}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>Booked on {formatTimestamp(booking.createdAt)}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Badge variant="secondary">{booking.type}</Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-3">Booking Summary</h4>
                                    <div className="space-y-2">
                                      <p className="text-sm text-muted-foreground">
                                        {booking.type === 'sunbed' ? 'Sunbed booking' : 
                                         booking.type === 'umbrella' ? 'Umbrella booking' : 
                                         'No items specified'}
                                      </p>
                                      <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between font-semibold">
                                          <span>Total</span>
                                          <span>€{booking.total}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                  <div className="flex gap-3 mt-6 pt-4 border-t">
                                    <Button
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        setSelectedBarId(booking.barId);
                                        setIsReviewModalOpen(true);
                                      }}
                                    >
                                      Leave Review
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleBarSelect(booking.barId)}
                                    >
                                      Book Again
                                    </Button>
                                    {booking.status === 'pending' && (
                                      <Button variant="outline" size="sm" className="text-red-600">
                                        Cancel Booking
                                      </Button>
                                    )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Orders Section */}
                  {filteredOrders.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Your Orders</h3>
                      <div className="space-y-4">
                        {filteredOrders.map((order) => {
                          const StatusIcon = getStatusIcon(order.status);
                          return (
                            <Card key={order.id} className="overflow-hidden">
                              <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                      <img
                                        src={order.barImage}
                                        alt={order.barName}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <CardTitle className="text-xl mb-2">{order.barName}</CardTitle>
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center">
                                          <MapPin className="h-4 w-4 mr-1" />
                                          <span>{order.barLocation}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                          <span>{order.barRating}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <ShoppingCart className="h-4 w-4 mr-1" />
                                          <span>{order.items.length} items</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <Badge className={getStatusColor(order.status)}>
                                      <StatusIcon className="h-3 w-3 mr-1" />
                                      {order.status}
                                    </Badge>
                                    <p className="text-lg font-bold text-primary mt-2">
                                      €{order.total}
                                    </p>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold mb-3">Order Details</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>Ordered on {formatTimestamp(order.createdAt)}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>Order ID: {order.id}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>
                                          {order.deliveryLocation?.sunbedNumber && `Sunbed ${order.deliveryLocation.sunbedNumber}`}
                                          {order.deliveryLocation?.umbrellaNumber && `Umbrella ${order.deliveryLocation.umbrellaNumber}`}
                                          {!order.deliveryLocation?.sunbedNumber && !order.deliveryLocation?.umbrellaNumber && 'No location specified'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-3">Order Items</h4>
                                    <div className="space-y-2">
                                      {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                          <span>
                                            {item.name} {item.quantity > 1 && `× ${item.quantity}`}
                                          </span>
                                          <span className="font-medium">
                                            €{item.price * item.quantity}
                                          </span>
                                        </div>
                                      ))}
                                      <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between font-semibold">
                                          <span>Total</span>
                                          <span>€{order.total}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                  <div className="flex gap-3 mt-6 pt-4 border-t">
                                    <Button
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        setSelectedBarId(order.barId);
                                        setIsReviewModalOpen(true);
                                      }}
                                    >
                                      Leave Review
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleBarSelect(order.barId)}
                                    >
                                      Order Again
                                    </Button>
                                    {order.status === 'pending' && (
                                      <Button variant="outline" size="sm" className="text-red-600">
                                        Cancel Order
                                      </Button>
                                    )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      <ReviewModal
        barId={selectedBarId}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
};

export default BookingHistoryPage; 
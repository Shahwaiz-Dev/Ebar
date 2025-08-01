import { useState, useEffect } from 'react';
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
  Clock as ClockIcon
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import featuredBar1 from '@/assets/featured-bar-1.jpg';
import featuredBar2 from '@/assets/featured-bar-2.jpg';
import featuredBar3 from '@/assets/featured-bar-3.jpg';

// Mock booking history data
const mockBookings = [
  {
    id: 'BK001',
    barId: 1,
    barName: 'Sunset Paradise',
    barImage: featuredBar1,
    barLocation: 'Santorini, Greece',
    barRating: 4.9,
    date: '2024-01-15',
    time: '14:00',
    guests: 2,
    type: 'booking',
    items: [
      { name: 'Premium Sunbed A1', price: 45, quantity: 1 },
      { name: 'Large Umbrella U1', price: 25, quantity: 1 }
    ],
    total: 70,
    status: 'completed',
    bookingDate: '2024-01-10T10:00:00Z',
    review: {
      rating: 5,
      comment: 'Amazing experience! The sunset views were breathtaking and the service was impeccable.'
    }
  },
  {
    id: 'BK002',
    barId: 2,
    barName: 'Azure Beach Club',
    barImage: featuredBar2,
    barLocation: 'Mykonos, Greece',
    barRating: 4.8,
    date: '2024-01-20',
    time: '15:30',
    guests: 4,
    type: 'food_order',
    items: [
      { name: 'Sunset Margarita', price: 12, quantity: 2 },
      { name: 'Grilled Fish Tacos', price: 18, quantity: 1 },
      { name: 'Pina Colada', price: 10, quantity: 1 }
    ],
    total: 52,
    status: 'upcoming',
    bookingDate: '2024-01-12T14:30:00Z'
  },
  {
    id: 'BK003',
    barId: 3,
    barName: 'Tiki Cove',
    barImage: featuredBar3,
    barLocation: 'Maui, Hawaii',
    barRating: 4.7,
    date: '2024-01-25',
    time: '16:00',
    guests: 3,
    type: 'booking',
    items: [
      { name: 'Tiki Style Sunbed T1', price: 55, quantity: 1 },
      { name: 'Tiki Umbrella UT1', price: 30, quantity: 1 }
    ],
    total: 85,
    status: 'cancelled',
    bookingDate: '2024-01-14T09:15:00Z',
    cancellationReason: 'Weather conditions'
  },
  {
    id: 'BK004',
    barId: 4,
    barName: 'Ocean Breeze',
    barImage: featuredBar1,
    barLocation: 'Bali, Indonesia',
    barRating: 4.6,
    date: '2024-01-30',
    time: '17:00',
    guests: 2,
    type: 'food_order',
    items: [
      { name: 'Ceviche', price: 22, quantity: 1 },
      { name: 'Tropical Fruit Salad', price: 12, quantity: 1 },
      { name: 'Fresh Coconut Water', price: 6, quantity: 2 }
    ],
    total: 46,
    status: 'upcoming',
    bookingDate: '2024-01-16T11:45:00Z'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'upcoming':
      return 'bg-blue-100 text-blue-800';
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
    case 'upcoming':
      return ClockIcon;
    case 'cancelled':
      return XCircle;
    default:
      return ClockIcon;
  }
};

export const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState(mockBookings);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });

  const handleBarSelect = (barId: number) => {
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">{bookings.length}</p>
                  </div>
                  <Receipt className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {bookings.filter(b => b.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {bookings.filter(b => b.status === 'upcoming').length}
                    </p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold text-primary">
                      ${bookings.reduce((sum, b) => sum + b.total, 0)}
                    </p>
                  </div>
                  <Receipt className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Bookings</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No {activeTab} bookings
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {activeTab === 'all' 
                      ? 'Start booking your first beach bar experience'
                      : `You don't have any ${activeTab} bookings yet`
                    }
                  </p>
                  <Button onClick={() => navigate('/search')}>
                    Explore Beach Bars
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
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
                                ${booking.total}
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
                                  <span>Booked on {formatDate(booking.bookingDate)}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-3">Order Items</h4>
                              <div className="space-y-2">
                                {booking.items.map((item, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span>
                                      {item.name} {item.quantity > 1 && `× ${item.quantity}`}
                                    </span>
                                    <span className="font-medium">
                                      ${item.price * item.quantity}
                                    </span>
                                  </div>
                                ))}
                                <div className="border-t pt-2 mt-2">
                                  <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>${booking.total}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Review Section */}
                          {booking.review && (
                            <div className="mt-6 pt-4 border-t">
                              <h4 className="font-semibold mb-3">Your Review</h4>
                              <div className="flex items-start gap-3">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < booking.review!.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {booking.review.comment}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Cancellation Reason */}
                          {booking.status === 'cancelled' && (
                            <div className="mt-4 p-3 bg-red-50 rounded-lg">
                              <p className="text-sm text-red-700">
                                <strong>Cancellation Reason:</strong> {booking.cancellationReason}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-3 mt-6 pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBarSelect(booking.barId)}
                            >
                              Book Again
                            </Button>
                            {booking.status === 'upcoming' && (
                              <Button variant="outline" size="sm" className="text-red-600">
                                Cancel Booking
                              </Button>
                            )}
                            {booking.status === 'completed' && !booking.review && (
                              <Button variant="outline" size="sm">
                                Write Review
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingHistoryPage; 
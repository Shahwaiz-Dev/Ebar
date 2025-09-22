import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, MapPin, Star, Users, Calendar, Clock, Umbrella, Sun } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateBooking } from '@/hooks/useBookings';
import { useBeachBars } from '@/hooks/useBeachBars';
import { createSampleBeachBars } from '@/lib/firestore';
import { toast } from 'sonner';
import LocationPicker from '@/components/LocationPicker';
import featuredBar1 from '@/assets/featured-bar-1.jpg';
import featuredBar2 from '@/assets/featured-bar-2.jpg';
import featuredBar3 from '@/assets/featured-bar-3.jpg';

interface BookingItem {
  id: string;
  type: string;
  price: number;
  category: 'sunbed' | 'umbrella';
}

export const BookingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { data: beachBars = [], isLoading: barsLoading } = useBeachBars();
  const createBookingMutation = useCreateBooking();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedBar, setSelectedBar] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<BookingItem[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Filter bars based on search term and location
  const filteredBars = beachBars.filter(bar => {
    const matchesSearch = searchTerm === '' || 
      bar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bar.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationSearch === '' || 
      bar.location.toLowerCase().includes(locationSearch.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleLocationSearch = (value: string) => {
    setLocationSearch(value);
  };

  const handleBarSelect = (bar: any) => {
    setSelectedBar(bar);
    setSelectedItems([]);
  };

  const handleItemSelect = (item: any, category: 'sunbed' | 'umbrella') => {
    const existingItem = selectedItems.find(selected => selected.id === item.id);
    
    if (existingItem) {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, {
        id: item.id,
        type: item.type,
        price: item.price,
        category
      }]);
    }
  };

  const getTotalPrice = () => {
    return selectedItems.reduce((total, item) => total + item.price, 0);
  };

  const handleCreateBooking = async () => {
    if (!currentUser) {
      toast.error('Please log in to make a booking');
      navigate('/auth');
      return;
    }

    if (!selectedBar || selectedItems.length === 0) {
      toast.error('Please select a beach bar and at least one item');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time');
      return;
    }

    if (!customerName || !customerEmail || !customerPhone) {
      toast.error('Please fill in all customer details');
      return;
    }

    const bookingData = {
      userId: currentUser.uid,
      barId: selectedBar.id,
      barName: selectedBar.name,
      customerName,
      customerEmail,
      customerPhone,
      date: selectedDate,
      time: selectedTime,
      guests: selectedItems.length,
      type: selectedItems[0]?.category === 'sunbed' ? 'sunbed' : 'umbrella' as 'sunbed' | 'umbrella',
      spotId: selectedItems[0]?.id,
      items: selectedItems.map(item => ({
        name: item.type,
        quantity: 1,
        price: item.price
      })),
      total: getTotalPrice(),
      status: 'pending' as const,
    };

    try {
      const result = await createBookingMutation.mutateAsync(bookingData);
      toast.success('Booking created successfully! Proceeding to payment.');
      
      // Store order data for payment page
      const orderData = {
        barId: selectedBar.id,
        barName: selectedBar.name,
        date: selectedDate,
        time: selectedTime,
        spotId: selectedItems[0]?.id,
        sunbedNumber: selectedItems[0]?.category === 'sunbed' ? selectedItems[0]?.id : undefined,
        umbrellaNumber: selectedItems[0]?.category === 'umbrella' ? selectedItems[0]?.id : undefined,
        items: selectedItems.map(item => ({
          id: item.id,
          name: item.type,
          price: item.price,
          quantity: 1,
          category: item.category
        })),
        total: getTotalPrice(),
        type: 'booking'
      };
      
      // Save order data to localStorage for the payment page
      localStorage.setItem('currentOrder', JSON.stringify(orderData));
      
      // Navigate to payment page
      navigate('/payment');
    } catch (error) {
      toast.error('Failed to create booking. Please try again.');
    }
  };

  const isItemSelected = (itemId: string) => {
    return selectedItems.some(item => item.id === itemId);
  };

  // Show loading while bars are being fetched
  if (barsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading beach bars...</p>
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
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-foreground mb-6">
              Book Your Perfect <span className="text-gradient">Beach Spot</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Reserve sunbeds and umbrellas at the finest beach bars
            </p>
          </div>

          {!selectedBar ? (
            <>
              {/* Search Section */}
              <div className="max-w-4xl mx-auto mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <LocationPicker
                      initialAddress={locationSearch}
                      onAddressChange={handleLocationSearch}
                      showSearchBoxOnly={true}
                      placeholder="Search by location..."
                      inputClassName="h-12 text-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Create Sample Data Button for Testing */}
              {beachBars.length === 0 && (
                <div className="text-center mb-8">
                  <p className="text-muted-foreground mb-4">No beach bars found. Create sample data for testing:</p>
                  <Button 
                    onClick={createSampleBeachBars}
                    variant="outline"
                    className="mx-auto"
                  >
                    Create Sample Beach Bars
                  </Button>
                </div>
              )}

              {/* Beach Bars Grid */}
              {barsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted h-48 rounded-t-lg"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                        <div className="h-3 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {filteredBars.map((bar) => (
                      <Card 
                        key={bar.id} 
                        className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
                        onClick={() => handleBarSelect(bar)}
                      >
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={bar.image}
                            alt={bar.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
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
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 flex-1 flex flex-col">
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2 flex-1">
                            {bar.description}
                          </p>
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Sun className="h-3 w-3 mr-1" />
                                <span>{bar.sunbeds.filter(s => s.available).length} available</span>
                              </div>
                              <div className="flex items-center">
                                <Umbrella className="h-3 w-3 mr-1" />
                                <span>{bar.umbrellas.filter(u => u.available).length} available</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/bar-details/${bar.id}`);
                                }}
                              >
                                View Details
                              </Button>
                              <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-white">
                                Select Bar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            /* Booking Selection */
            <div className="max-w-6xl mx-auto">
              {/* Bar Info */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={selectedBar.image}
                        alt={selectedBar.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-foreground mb-2">{selectedBar.name}</h2>
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
                          <Users className="h-4 w-4 mr-1" />
                          <span>{selectedBar.capacity}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => setSelectedBar(null)}>
                      Change Bar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Date & Time Selection */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Select Date & Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Date</label>
                          <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Time</label>
                          <Input
                            type="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Customer Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Full Name</label>
                          <Input
                            type="text"
                            placeholder="Enter your full name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Email</label>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Phone Number</label>
                        <Input
                          type="tel"
                          placeholder="Enter your phone number"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sunbeds Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sun className="h-5 w-5" />
                        Available Sunbeds
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedBar.sunbeds.map((sunbed: any) => (
                          <div
                            key={sunbed.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              isItemSelected(sunbed.id)
                                ? 'border-primary bg-primary/5'
                                : sunbed.available
                                ? 'border-border hover:border-primary'
                                : 'border-border bg-muted/50 cursor-not-allowed'
                            }`}
                            onClick={() => sunbed.available && handleItemSelect(sunbed, 'sunbed')}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">Sunbed {sunbed.id}</h3>
                              <Badge variant={sunbed.available ? 'default' : 'secondary'}>
                                {sunbed.available ? 'Available' : 'Booked'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{sunbed.type}</p>
                            <p className="font-bold text-primary">${sunbed.price}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Umbrellas Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Umbrella className="h-5 w-5" />
                        Available Umbrellas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedBar.umbrellas.map((umbrella: any) => (
                          <div
                            key={umbrella.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              isItemSelected(umbrella.id)
                                ? 'border-primary bg-primary/5'
                                : umbrella.available
                                ? 'border-border hover:border-primary'
                                : 'border-border bg-muted/50 cursor-not-allowed'
                            }`}
                            onClick={() => umbrella.available && handleItemSelect(umbrella, 'umbrella')}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">Umbrella {umbrella.id}</h3>
                              <Badge variant={umbrella.available ? 'default' : 'secondary'}>
                                {umbrella.available ? 'Available' : 'Booked'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{umbrella.type}</p>
                            <p className="font-bold text-primary">${umbrella.price}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Booking Summary */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedItems.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          No items selected
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {selectedItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{item.category === 'sunbed' ? 'Sunbed' : 'Umbrella'} {item.id}</p>
                                <p className="text-sm text-muted-foreground">{item.type}</p>
                              </div>
                              <span className="font-medium">${item.price}</span>
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
                    onClick={handleCreateBooking}
                    disabled={selectedItems.length === 0 || !selectedDate || !selectedTime || !customerName || !customerEmail || !customerPhone}
                    className="w-full"
                    size="lg"
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
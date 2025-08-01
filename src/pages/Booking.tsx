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
import featuredBar1 from '@/assets/featured-bar-1.jpg';
import featuredBar2 from '@/assets/featured-bar-2.jpg';
import featuredBar3 from '@/assets/featured-bar-3.jpg';

// Mock data for beach bars with sunbed/umbrella availability
const beachBars = [
  {
    id: 1,
    name: 'Sunset Paradise',
    location: 'Santorini, Greece',
    rating: 4.9,
    reviews: 128,
    image: featuredBar1,
    description: 'Iconic cliffside bar with breathtaking sunset views and world-class cocktails.',
    price: '$85',
    amenities: ['Infinity Pool', 'Live DJ', 'Sunset Views'],
    capacity: '2-12 guests',
    sunbeds: [
      { id: 'A1', type: 'Premium', price: 45, available: true },
      { id: 'A2', type: 'Premium', price: 45, available: true },
      { id: 'A3', type: 'Standard', price: 35, available: false },
      { id: 'B1', type: 'Premium', price: 45, available: true },
      { id: 'B2', type: 'Standard', price: 35, available: true },
    ],
    umbrellas: [
      { id: 'U1', type: 'Large', price: 25, available: true },
      { id: 'U2', type: 'Standard', price: 20, available: true },
      { id: 'U3', type: 'Large', price: 25, available: false },
      { id: 'U4', type: 'Standard', price: 20, available: true },
    ],
  },
  {
    id: 2,
    name: 'Azure Beach Club',
    location: 'Mykonos, Greece',
    rating: 4.8,
    reviews: 95,
    image: featuredBar2,
    description: 'Luxury beach club featuring modern architecture and premium beachside service.',
    price: '$120',
    amenities: ['Beach Beds', 'Fine Dining', 'VIP Service'],
    capacity: '2-8 guests',
    sunbeds: [
      { id: 'VIP1', type: 'VIP', price: 80, available: true },
      { id: 'VIP2', type: 'VIP', price: 80, available: true },
      { id: 'P1', type: 'Premium', price: 60, available: true },
      { id: 'P2', type: 'Premium', price: 60, available: false },
    ],
    umbrellas: [
      { id: 'UVIP1', type: 'VIP Large', price: 40, available: true },
      { id: 'UVIP2', type: 'VIP Large', price: 40, available: true },
      { id: 'U1', type: 'Standard', price: 25, available: true },
      { id: 'U2', type: 'Standard', price: 25, available: true },
    ],
  },
  {
    id: 3,
    name: 'Tiki Cove',
    location: 'Maui, Hawaii',
    rating: 4.7,
    reviews: 156,
    image: featuredBar3,
    description: 'Tropical paradise with authentic Hawaiian cocktails and beachfront dining.',
    price: '$95',
    amenities: ['Tiki Bar', 'Live Music', 'Beach Access'],
    capacity: '2-10 guests',
    sunbeds: [
      { id: 'T1', type: 'Tiki Style', price: 55, available: true },
      { id: 'T2', type: 'Tiki Style', price: 55, available: true },
      { id: 'T3', type: 'Standard', price: 40, available: true },
      { id: 'T4', type: 'Standard', price: 40, available: true },
    ],
    umbrellas: [
      { id: 'UT1', type: 'Tiki Umbrella', price: 30, available: true },
      { id: 'UT2', type: 'Tiki Umbrella', price: 30, available: true },
      { id: 'U1', type: 'Standard', price: 20, available: true },
      { id: 'U2', type: 'Standard', price: 20, available: true },
    ],
  },
];

interface BookingItem {
  id: string;
  type: string;
  price: number;
  category: 'sunbed' | 'umbrella';
}

export const BookingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBars, setFilteredBars] = useState(beachBars);
  const [selectedBar, setSelectedBar] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedItems, setSelectedItems] = useState<BookingItem[]>([]);
  const navigate = useNavigate();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = beachBars.filter(bar =>
      bar.name.toLowerCase().includes(value.toLowerCase()) ||
      bar.location.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredBars(filtered);
  };

  const handleBarSelect = (bar: any) => {
    setSelectedBar(bar);
    setSelectedItems([]);
  };

  const handleItemSelect = (item: any, category: 'sunbed' | 'umbrella') => {
    const bookingItem: BookingItem = {
      id: item.id,
      type: item.type,
      price: item.price,
      category,
    };

    setSelectedItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, bookingItem];
      }
    });
  };

  const getTotalPrice = () => {
    return selectedItems.reduce((total, item) => total + item.price, 0);
  };

  const handleProceedToPayment = () => {
    if (!selectedBar || selectedItems.length === 0) {
      alert('Please select a beach bar and at least one item');
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert('Please select date and time');
      return;
    }

    const bookingData = {
      barId: selectedBar.id,
      barName: selectedBar.name,
      date: selectedDate,
      time: selectedTime,
      items: selectedItems,
      total: getTotalPrice(),
      type: 'booking',
    };

    localStorage.setItem('currentOrder', JSON.stringify(bookingData));
    navigate('/payment');
  };

  const isItemSelected = (itemId: string) => {
    return selectedItems.some(item => item.id === itemId);
  };

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
              <div className="max-w-2xl mx-auto mb-12">
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
                  <Button variant="sunset" size="lg" className="h-12 px-8">
                    Search
                  </Button>
                </div>
              </div>

              {/* Beach Bars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBars.map((bar) => (
                  <Card 
                    key={bar.id} 
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    onClick={() => handleBarSelect(bar)}
                  >
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={bar.image}
                        alt={bar.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold text-foreground mb-2">
                            {bar.name}
                          </CardTitle>
                          <div className="flex items-center text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">{bar.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span className="font-semibold">{bar.rating}</span>
                            <span className="text-muted-foreground text-sm ml-1">
                              ({bar.reviews})
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {bar.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Sun className="h-4 w-4 mr-1" />
                            <span>{bar.sunbeds.filter(s => s.available).length} available</span>
                          </div>
                          <div className="flex items-center">
                            <Umbrella className="h-4 w-4 mr-1" />
                            <span>{bar.umbrellas.filter(u => u.available).length} available</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-white">
                          Select Bar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                          <span className="text-muted-foreground ml-1">({selectedBar.reviews} reviews)</span>
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
                    onClick={handleProceedToPayment}
                    disabled={selectedItems.length === 0 || !selectedDate || !selectedTime}
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
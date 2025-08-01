import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';

interface BookingManagementProps {
  barId: string;
}

export const BookingManagement = ({ barId }: BookingManagementProps) => {
  // Mock booking data - in real app, this would come from Firestore
  const mockBookings = [
    {
      id: '1',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      date: '2024-01-15',
      time: '14:00',
      guests: 4,
      type: 'sunbed' as const,
      status: 'confirmed' as const,
      total: 100
    },
    {
      id: '2',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      date: '2024-01-16',
      time: '10:00',
      guests: 2,
      type: 'umbrella' as const,
      status: 'pending' as const,
      total: 50
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateBookingStatus = (bookingId: string, newStatus: string) => {
    // In real app, this would update the booking in Firestore
    console.log(`Updating booking ${bookingId} to status: ${newStatus}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockBookings.map((booking) => (
          <div key={booking.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{booking.customerName}</h4>
                <p className="text-sm text-muted-foreground">{booking.customerEmail}</p>
              </div>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{booking.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{booking.guests} guests</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{booking.type}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <span className="font-semibold">${booking.total}</span>
              </div>
              <div className="flex gap-2">
                <Select 
                  value={booking.status} 
                  onValueChange={(value) => updateBookingStatus(booking.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {mockBookings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No bookings yet</p>
            <p className="text-sm">Bookings will appear here when customers make reservations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
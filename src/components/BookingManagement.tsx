import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, MapPin, Check, X } from 'lucide-react';
import { useBookingsByBar, useUpdateBookingStatus } from '@/hooks/useBookings';
import { toast } from 'sonner';

interface BookingManagementProps {
  barId: string;
}

export const BookingManagement = ({ barId }: BookingManagementProps) => {
  const { data: bookings = [], isLoading } = useBookingsByBar(barId);
  const updateBookingStatusMutation = useUpdateBookingStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await updateBookingStatusMutation.mutateAsync({ id: bookingId, status: newStatus });
      toast.success(`Booking ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status. Please try again.');
    }
  };

  const handleAcceptBooking = (bookingId: string) => {
    handleUpdateBookingStatus(bookingId, 'confirmed');
  };

  const handleRejectBooking = (bookingId: string) => {
    handleUpdateBookingStatus(bookingId, 'cancelled');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="border rounded-lg p-3 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm sm:text-base truncate">{booking.customerName}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{booking.customerEmail}</p>
              </div>
              <Badge className={`${getStatusColor(booking.status)} text-xs`}>
                {booking.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{booking.date}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{booking.time}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{booking.guests} guests</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{booking.type}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t">
              <div>
                <span className="font-semibold text-sm sm:text-base">${booking.total}</span>
              </div>
              <div className="flex gap-2">
                {booking.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      className="text-xs h-7 sm:h-8"
                      onClick={() => handleAcceptBooking(booking.id!)}
                    >
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs h-7 sm:h-8"
                      onClick={() => handleRejectBooking(booking.id!)}
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <Button
                    size="sm"
                    className="text-xs h-7 sm:h-8"
                    onClick={() => handleUpdateBookingStatus(booking.id!, 'completed')}
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {bookings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm sm:text-base">No bookings found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
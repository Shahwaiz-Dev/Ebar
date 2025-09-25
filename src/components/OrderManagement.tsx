import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, MapPin, Check, X, ShoppingCart, Utensils } from 'lucide-react';
import { useOrdersByBar, useUpdateOrderStatus } from '@/hooks/useBookings';
import { toast } from 'sonner';

interface OrderManagementProps {
  barId: string;
}

export const OrderManagement = ({ barId }: OrderManagementProps) => {
  const { data: orders = [], isLoading } = useOrdersByBar(barId);
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await updateOrderStatusMutation.mutateAsync({ id: orderId, status: newStatus });
      toast.success(`Order ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status. Please try again.');
    }
  };

  const handleAcceptOrder = (orderId: string) => {
    handleUpdateOrderStatus(orderId, 'confirmed');
  };

  const handleRejectOrder = (orderId: string) => {
    handleUpdateOrderStatus(orderId, 'cancelled');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Orders</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Customer Orders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-3 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm sm:text-base truncate">{order.customerName}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{order.customerEmail}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{order.customerPhone}</p>
              </div>
              <Badge className={`${getStatusColor(order.status)} text-xs`}>
                {order.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{new Date(order.createdAt.toDate()).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{new Date(order.createdAt.toDate()).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{order.items.length} items</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">
                  {order.deliveryLocation?.sunbedNumber && `Sunbed ${order.deliveryLocation.sunbedNumber}`}
                  {order.deliveryLocation?.umbrellaNumber && `Umbrella ${order.deliveryLocation.umbrellaNumber}`}
                  {!order.deliveryLocation?.sunbedNumber && !order.deliveryLocation?.umbrellaNumber && 'No location'}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h5 className="text-xs sm:text-sm font-medium">Order Items:</h5>
              <div className="space-y-1">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <span className="truncate">{item.name}</span>
                      <span className="text-muted-foreground">x{item.quantity}</span>
                    </div>
                    <span className="font-medium">€{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t">
              <div>
                <span className="font-semibold text-sm sm:text-base">€{order.total}</span>
              </div>
              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      className="text-xs h-7 sm:h-8"
                      onClick={() => handleAcceptOrder(order.id!)}
                    >
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs h-7 sm:h-8"
                      onClick={() => handleRejectOrder(order.id!)}
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <Button
                    size="sm"
                    className="text-xs h-7 sm:h-8"
                    onClick={() => handleUpdateOrderStatus(order.id!, 'completed')}
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {orders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm sm:text-base">No orders found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
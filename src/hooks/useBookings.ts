import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getBookingsByUser, 
  getBookingsByBar,
  createBooking,
  updateBookingStatus,
  getOrdersByUser,
  getOrdersByBar,
  createOrder,
  updateOrderStatus,
  Booking,
  Order
} from '@/lib/firestore';
import { toast } from 'sonner';

// Query keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: string) => [...bookingKeys.lists(), { filters }] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  user: (userId: string) => [...bookingKeys.all, 'user', userId] as const,
  bar: (barId: string) => [...bookingKeys.all, 'bar', barId] as const,
};

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: string) => [...orderKeys.lists(), { filters }] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  user: (userId: string) => [...orderKeys.all, 'user', userId] as const,
  bar: (barId: string) => [...orderKeys.all, 'bar', barId] as const,
};

// Get bookings by user
export const useBookingsByUser = (userId: string) => {
  return useQuery({
    queryKey: bookingKeys.user(userId),
    queryFn: () => getBookingsByUser(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get bookings by bar
export const useBookingsByBar = (barId: string) => {
  return useQuery({
    queryKey: bookingKeys.bar(barId),
    queryFn: () => getBookingsByBar(barId),
    enabled: !!barId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get orders by user
export const useOrdersByUser = (userId: string) => {
  return useQuery({
    queryKey: orderKeys.user(userId),
    queryFn: () => getOrdersByUser(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get orders by bar
export const useOrdersByBar = (barId: string) => {
  return useQuery({
    queryKey: orderKeys.bar(barId),
    queryFn: () => getOrdersByBar(barId),
    enabled: !!barId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Create booking mutation
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: async (data, variables) => {
      // Invalidate and refetch bookings lists
      queryClient.invalidateQueries({ queryKey: bookingKeys.user(variables.userId) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.bar(variables.barId) });
      
      toast.success('Booking created successfully! You will receive a confirmation email once the bar owner approves your booking.');
    },
    onError: (error) => {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    },
  });
};

// Create order mutation
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data, variables) => {
      // Invalidate and refetch orders lists
      queryClient.invalidateQueries({ queryKey: orderKeys.user(variables.userId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.bar(variables.barId) });
      
      toast.success('Order placed successfully!');
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      toast.error('Failed to place order. Please try again.');
    },
  });
};

// Update booking status mutation
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Booking['status'] }) =>
      updateBookingStatus(id, status),
    onSuccess: (data, variables) => {
      // Invalidate all booking queries to refetch
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      
      toast.success(`Booking ${variables.status} successfully!`);
    },
    onError: (error) => {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status. Please try again.');
    },
  });
};

// Update order status mutation
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
      updateOrderStatus(id, status),
    onSuccess: (data, variables) => {
      // Invalidate all order queries to refetch
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      
      toast.success(`Order ${variables.status} successfully!`);
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status. Please try again.');
    },
  });
}; 
import { useQuery } from '@tanstack/react-query';
import { getBeachBarsByOwner, getBookingsByBar, getOrdersByBar } from '@/lib/firestore';

interface DashboardStats {
  totalBars: number;
  activeBookings: number;
  todayRevenue: number;
  totalCustomers: number;
  totalRevenue: number;
  totalBookings: number;
  totalOrders: number;
}

export const useDashboardStats = (ownerId: string) => {
  return useQuery({
    queryKey: ['dashboard-stats', ownerId],
    queryFn: async (): Promise<DashboardStats> => {
      // Get all bars owned by the user
      const bars = await getBeachBarsByOwner(ownerId);
      
      // Get all bookings and orders for all bars
      const allBookings = await Promise.all(
        bars.map(bar => getBookingsByBar(bar.id!))
      );
      
      const allOrders = await Promise.all(
        bars.map(bar => getOrdersByBar(bar.id!))
      );

      // Flatten the arrays
      const bookings = allBookings.flat();
      const orders = allOrders.flat();

      // Calculate today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Calculate active bookings (pending and confirmed)
      const activeBookings = bookings.filter(booking => 
        booking.status === 'pending' || booking.status === 'confirmed'
      ).length;

      // Calculate today's revenue
      const todayBookings = bookings.filter(booking => {
        const bookingDate = booking.createdAt.toDate();
        return bookingDate >= today && bookingDate < tomorrow;
      });

      const todayOrders = orders.filter(order => {
        const orderDate = order.createdAt.toDate();
        return orderDate >= today && orderDate < tomorrow;
      });

      const todayRevenue = todayBookings.reduce((sum, booking) => sum + booking.total, 0) +
                          todayOrders.reduce((sum, order) => sum + order.total, 0);

      // Calculate total revenue
      const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total, 0) +
                          orders.reduce((sum, order) => sum + order.total, 0);

      // Calculate unique customers
      const uniqueCustomers = new Set([
        ...bookings.map(booking => booking.customerEmail),
        ...orders.map(order => order.customerEmail)
      ]).size;

      return {
        totalBars: bars.length,
        activeBookings,
        todayRevenue,
        totalCustomers: uniqueCustomers,
        totalRevenue,
        totalBookings: bookings.length,
        totalOrders: orders.length
      };
    },
    enabled: !!ownerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}; 
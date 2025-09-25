import { useQuery } from '@tanstack/react-query';
import { getBookingsByBar, getOrdersByBar, getReviewsByBar } from '@/lib/firestore';

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  totalOrders: number;
  averageRating: number;
  monthlyRevenue: number[];
  topItems: Array<{ name: string; sales: number; revenue: number }>;
  recentActivity: Array<{
    type: 'booking' | 'order' | 'review';
    message: string;
    timestamp: Date;
  }>;
}

export const useAnalytics = (barId: string) => {
  return useQuery({
    queryKey: ['analytics', barId],
    queryFn: async (): Promise<AnalyticsData> => {
      // Fetch all data for the bar
      const [bookings, orders, reviews] = await Promise.all([
        getBookingsByBar(barId),
        getOrdersByBar(barId),
        getReviewsByBar(barId)
      ]);

      // Calculate total revenue
      const bookingsRevenue = bookings.reduce((sum, booking) => sum + booking.total, 0);
      const ordersRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const totalRevenue = bookingsRevenue + ordersRevenue;

      // Calculate average rating
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      // Calculate monthly revenue (last 6 months)
      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        const monthBookings = bookings.filter(booking => {
          const bookingDate = booking.createdAt.toDate();
          return bookingDate >= monthStart && bookingDate <= monthEnd;
        });

        const monthOrders = orders.filter(order => {
          const orderDate = order.createdAt.toDate();
          return orderDate >= monthStart && orderDate <= monthEnd;
        });

        return monthBookings.reduce((sum, b) => sum + b.total, 0) + 
               monthOrders.reduce((sum, o) => sum + o.total, 0);
      }).reverse();

      // Calculate top selling items
      const itemSales: { [key: string]: { sales: number; revenue: number } } = {};
      
      orders.forEach(order => {
        order.items.forEach(item => {
          if (!itemSales[item.name]) {
            itemSales[item.name] = { sales: 0, revenue: 0 };
          }
          itemSales[item.name].sales += item.quantity;
          itemSales[item.name].revenue += item.price * item.quantity;
        });
      });

      const topItems = Object.entries(itemSales)
        .map(([name, data]) => ({
          name,
          sales: data.sales,
          revenue: data.revenue
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      // Generate recent activity
      const recentActivity = [
        ...bookings.slice(0, 3).map(booking => ({
          type: 'booking' as const,
          message: `${booking.customerName} booked ${booking.guests} ${booking.type} for ${booking.date}`,
          timestamp: booking.createdAt.toDate()
        })),
        ...orders.slice(0, 3).map(order => ({
          type: 'order' as const,
          message: `${order.customerName} placed order for €${order.total}`,
          timestamp: order.createdAt.toDate()
        })),
        ...reviews.slice(0, 3).map(review => ({
          type: 'review' as const,
          message: `${review.user?.firstName || 'Anonymous'} left a ${review.rating}-star review`,
          timestamp: review.createdAt.toDate()
        }))
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
       .slice(0, 5);

      return {
        totalRevenue,
        totalBookings: bookings.length,
        totalOrders: orders.length,
        averageRating: Math.round(averageRating * 10) / 10,
        monthlyRevenue,
        topItems,
        recentActivity
      };
    },
    enabled: !!barId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 
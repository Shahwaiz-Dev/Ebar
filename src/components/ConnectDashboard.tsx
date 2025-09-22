import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  CreditCard,
  ExternalLink,
  Download,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentStats {
  totalEarnings: number;
  platformFees: number;
  netEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
  recentTransactions: Array<{
    id: string;
    amount: number;
    platformFee: number;
    netAmount: number;
    status: string;
    createdAt: string;
    customerEmail?: string;
  }>;
}

interface ConnectDashboardProps {
  accountId: string;
  barName: string;
}

export const ConnectDashboard = ({ accountId, barName }: ConnectDashboardProps) => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPaymentStats = async () => {
    try {
      setIsRefreshing(true);
      
      // In a real implementation, you'd fetch this from your backend
      // which would aggregate data from Stripe Connect
      const mockStats: PaymentStats = {
        totalEarnings: 2450.00,
        platformFees: 73.50,
        netEarnings: 2376.50,
        pendingPayouts: 450.00,
        completedPayouts: 1926.50,
        recentTransactions: [
          {
            id: 'pi_1234567890',
            amount: 150.00,
            platformFee: 4.50,
            netAmount: 145.50,
            status: 'completed',
            createdAt: '2024-01-15T10:30:00Z',
            customerEmail: 'customer@example.com'
          },
          {
            id: 'pi_0987654321',
            amount: 75.00,
            platformFee: 2.25,
            netAmount: 72.75,
            status: 'pending',
            createdAt: '2024-01-14T15:45:00Z',
            customerEmail: 'guest@example.com'
          }
        ]
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      toast.error('Failed to load payment statistics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPaymentStats();
  }, [accountId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payment Dashboard</h2>
          <p className="text-muted-foreground">Manage payments for {barName}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchPaymentStats}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.totalEarnings || 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platform Fees</p>
                <p className="text-2xl font-bold text-red-500">{formatCurrency(stats?.platformFees || 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Earnings</p>
                <p className="text-2xl font-bold text-blue-500">{formatCurrency(stats?.netEarnings || 0)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payouts</p>
                <p className="text-2xl font-bold text-orange-500">{formatCurrency(stats?.pendingPayouts || 0)}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentTransactions.map((transaction) => (
              <div key={transaction.id}>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Payment #{transaction.id.slice(-8)}</span>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.customerEmail && `Customer: ${transaction.customerEmail}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-medium">{formatCurrency(transaction.amount)}</div>
                    <div className="text-sm text-red-500">
                      Fee: {formatCurrency(transaction.platformFee)}
                    </div>
                    <div className="text-sm text-green-500 font-medium">
                      Net: {formatCurrency(transaction.netAmount)}
                    </div>
                  </div>
                </div>
                <Separator className="my-2" />
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              View All Transactions in Stripe Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

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
  RefreshCw,
  Unlink
} from 'lucide-react';
import { toast } from 'sonner';
import { useDisconnectStripeAccount } from '@/hooks/useBeachBars';

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
    description?: string;
  }>;
  balance?: {
    available: Array<{
      amount: number;
      currency: string;
    }>;
    pending: Array<{
      amount: number;
      currency: string;
    }>;
  };
}

interface ConnectDashboardProps {
  accountId: string;
  barName: string;
  barId: string;
}

export const ConnectDashboard = ({ accountId, barName, barId }: ConnectDashboardProps) => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const disconnectStripeAccountMutation = useDisconnectStripeAccount();

  const fetchPaymentStats = async () => {
    try {
      setIsRefreshing(true);
      console.log('Fetching payment stats for account:', accountId);
      
      const response = await fetch(`/api/get-payment-stats?accountId=${accountId}`);
      const result = await response.json();

      console.log('Payment stats response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch payment stats');
      }

      setStats(result.data);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      toast.error('Failed to load payment statistics');
      
      // Set empty stats on error
      setStats({
        totalEarnings: 0,
        platformFees: 0,
        netEarnings: 0,
        pendingPayouts: 0,
        completedPayouts: 0,
        recentTransactions: [],
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (accountId) {
      fetchPaymentStats();
    } else {
      console.log('No accountId provided to ConnectDashboard');
      setIsLoading(false);
    }
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

  const handleDisconnectAccount = async () => {
    console.log('Disconnect button clicked for bar:', barId, 'account:', accountId);
    if (window.confirm('Are you sure you want to disconnect this Stripe account? This will remove payment processing for this bar.')) {
      try {
        console.log('Proceeding with disconnect...');
        await disconnectStripeAccountMutation.mutateAsync({ 
          barId, 
          accountId 
        });
      } catch (error) {
        console.error('Error disconnecting account:', error);
      }
    }
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
        {/* Header with disconnect button even during loading */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Payment Dashboard</h2>
            <p className="text-muted-foreground">Manage payments for {barName}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={true}
            >
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </Button>
            <Button variant="outline" size="sm" disabled={true}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDisconnectAccount}
              disabled={disconnectStripeAccountMutation.isPending}
            >
              <Unlink className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
        
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
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDisconnectAccount}
            disabled={disconnectStripeAccountMutation.isPending}
          >
            <Unlink className="h-4 w-4 mr-2" />
            Disconnect
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

      {/* Account Balance */}
      {stats?.balance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Account Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">Available Balance</h4>
                {stats.balance.available.length > 0 ? (
                  stats.balance.available.map((balance, index) => (
                    <div key={index} className="text-2xl font-bold">
                      {formatCurrency(balance.amount)} {balance.currency.toUpperCase()}
                    </div>
                  ))
                ) : (
                  <div className="text-2xl font-bold text-gray-500">€0.00</div>
                )}
                <p className="text-sm text-muted-foreground">
                  Ready for payout
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-orange-600">Pending Balance</h4>
                {stats.balance.pending.length > 0 ? (
                  stats.balance.pending.map((balance, index) => (
                    <div key={index} className="text-2xl font-bold">
                      {formatCurrency(balance.amount)} {balance.currency.toUpperCase()}
                    </div>
                  ))
                ) : (
                  <div className="text-2xl font-bold text-gray-500">€0.00</div>
                )}
                <p className="text-sm text-muted-foreground">
                  Processing payments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
              stats.recentTransactions.map((transaction) => (
              <div key={transaction.id}>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Payment #{transaction.id.slice(-8)}</span>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.description || 'Beach bar booking'}
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
              ))
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No recent transactions</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Transactions will appear here once customers make payments
                </p>
              </div>
            )}
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

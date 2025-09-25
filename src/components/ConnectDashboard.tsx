import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink,
  Unlink,
  CheckCircle,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { useDisconnectStripeAccount } from '@/hooks/useBeachBars';

interface ConnectDashboardProps {
  accountId: string;
  barName: string;
  barId: string;
}

export const ConnectDashboard = ({ accountId, barName, barId }: ConnectDashboardProps) => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isOpeningDashboard, setIsOpeningDashboard] = useState(false);
  const disconnectStripeAccountMutation = useDisconnectStripeAccount();

  const handleDisconnectAccount = async () => {
    if (window.confirm('Are you sure you want to disconnect this Stripe account? This will remove payment processing for this bar.')) {
      try {
        setIsDisconnecting(true);
        await disconnectStripeAccountMutation.mutateAsync({ 
          barId, 
          accountId 
        });
      } catch (error) {
        console.error('Disconnect failed:', error);
        toast.error('Failed to disconnect account');
      } finally {
        setIsDisconnecting(false);
      }
    }
  };

  const handleViewStripeDashboard = async () => {
    try {
      setIsOpeningDashboard(true);
      
      // Create a login link for the Stripe Connect Express account
      const response = await fetch('/api/get-connect-login-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create login link');
      }

      // Open the login link in a new tab
      window.open(result.loginUrl, '_blank');
      toast.success('Opening Stripe Connect dashboard...');
      
    } catch (error) {
      console.error('Error opening Stripe dashboard:', error);
      toast.error('Failed to open Stripe Connect dashboard');
    } finally {
      setIsOpeningDashboard(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payment Management</h2>
          <p className="text-muted-foreground">Stripe Connect account for {barName}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewStripeDashboard}
            disabled={isOpeningDashboard}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {isOpeningDashboard ? 'Opening...' : 'Open Stripe Connect'}
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDisconnectAccount}
            disabled={isDisconnecting || disconnectStripeAccountMutation.isPending}
          >
            <Unlink className="h-4 w-4 mr-2" />
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Stripe Connect Account Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Account Status</h4>
                <p className="text-sm text-muted-foreground">
                  Your Stripe Connect account is active and ready to accept payments.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Account ID</h4>
                <p className="text-sm text-muted-foreground font-mono">
                  {accountId}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Payment Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Accept customer payments</li>
                <li>✓ Automatic payouts to your bank account</li>
                <li>✓ Real-time payment processing</li>
                <li>✓ Integrated with your bar's booking system</li>
              </ul>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Manage Your Account</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Access your complete Stripe Connect dashboard to view payment statistics, manage payouts, configure account settings, and more.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                  Payment history & analytics
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4 mr-2 text-green-500" />
                  Revenue reports & insights
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="default" 
                  onClick={handleViewStripeDashboard}
                  className="flex-1 sm:flex-none"
                  disabled={isOpeningDashboard}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {isOpeningDashboard ? 'Opening Dashboard...' : 'Open Stripe Connect Account'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleViewStripeDashboard}
                  className="flex-1 sm:flex-none"
                  disabled={isOpeningDashboard}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {isOpeningDashboard ? 'Opening Reports...' : 'View Payment Reports'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
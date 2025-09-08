import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  DollarSign,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBeachBarsByOwner } from '@/hooks/useBeachBars';
import { toast } from 'sonner';

interface ConnectAccount {
  accountId: string;
  isComplete: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  payoutsEnabled: boolean;
  requirements: any;
}

export const StripeConnectDashboard = () => {
  const { currentUser } = useAuth();
  const { data: userBars = [] } = useBeachBarsByOwner(currentUser?.uid || '');
  const [connectAccount, setConnectAccount] = useState<ConnectAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Check if user has a Stripe Connect account
  useEffect(() => {
    if (currentUser?.uid) {
      checkConnectAccount();
    }
  }, [currentUser]);

  const checkConnectAccount = async () => {
    try {
      setIsLoading(true);
      
      // Check if any of user's bars have Stripe Connect
      const barWithConnect = userBars.find(bar => bar.stripeAccountId);
      
      if (barWithConnect?.stripeAccountId) {
        const response = await fetch(`/api/check-connect-account?accountId=${barWithConnect.stripeAccountId}`);
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setConnectAccount(data);
      }
    } catch (error) {
      console.error('Error checking connect account:', error);
      toast.error('Failed to check Stripe Connect status');
    } finally {
      setIsLoading(false);
    }
  };

  const createConnectAccount = async () => {
    if (!currentUser?.email) {
      toast.error('Email is required to create Stripe Connect account');
      return;
    }

    try {
      setIsCreating(true);
      
      const response = await fetch('/api/create-connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: currentUser.email,
          country: 'US', // You can make this dynamic
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Update the first bar with the Stripe account ID
      if (userBars.length > 0) {
        // You'll need to implement this API endpoint
        await updateBarWithStripeAccount(userBars[0].id!, data.accountId);
      }

      // Redirect to Stripe onboarding
      window.open(data.onboardingUrl, '_blank');
      
      toast.success('Stripe Connect account created! Complete onboarding to start receiving payments.');
    } catch (error) {
      console.error('Error creating connect account:', error);
      toast.error('Failed to create Stripe Connect account');
    } finally {
      setIsCreating(false);
    }
  };

  const updateBarWithStripeAccount = async (barId: string, stripeAccountId: string) => {
    try {
      const response = await fetch('/api/update-bar-stripe-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barId,
          stripeAccountId,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      toast.success('Stripe account connected successfully!');
      
      // Refresh the connect account status
      checkConnectAccount();
    } catch (error) {
      console.error('Error updating bar with Stripe account:', error);
      toast.error('Failed to connect Stripe account');
    }
  };

  const getStatusBadge = () => {
    if (!connectAccount) {
      return <Badge variant="secondary">Not Connected</Badge>;
    }
    
    if (connectAccount.isComplete) {
      return <Badge variant="default" className="bg-green-500">Active</Badge>;
    }
    
    return <Badge variant="destructive">Incomplete</Badge>;
  };

  const getStatusIcon = () => {
    if (!connectAccount) {
      return <XCircle className="h-5 w-5 text-muted-foreground" />;
    }
    
    if (connectAccount.isComplete) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading Stripe Connect status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Connect Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="font-medium">Payment Processing</p>
                <p className="text-sm text-muted-foreground">
                  {connectAccount?.isComplete 
                    ? 'Your account is set up and ready to receive payments'
                    : 'Set up Stripe Connect to receive payments directly'
                  }
                </p>
              </div>
            </div>
            {getStatusBadge()}
          </div>
          
          {!connectAccount && (
            <div className="mt-4">
              <Button 
                onClick={createConnectAccount}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? 'Creating Account...' : 'Set Up Stripe Connect'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Fee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Platform Fee Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">15%</div>
              <div className="text-sm text-muted-foreground">Platform Fee</div>
              <div className="text-xs text-muted-foreground mt-1">
                You keep 15% of each transaction
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">85%</div>
              <div className="text-sm text-muted-foreground">Your Payout</div>
              <div className="text-xs text-muted-foreground mt-1">
                You receive 85% of each transaction
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">$0</div>
              <div className="text-sm text-muted-foreground">Setup Fee</div>
              <div className="text-xs text-muted-foreground mt-1">
                No monthly or setup fees
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">Example Transaction:</h4>
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Customer pays:</span>
                <span className="font-medium">$100.00</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Platform fee (15%):</span>
                <span>-$15.00</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>You receive:</span>
                <span className="text-green-600">$85.00</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Benefits of Stripe Connect
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Automatic Payouts</h4>
                <p className="text-sm text-muted-foreground">
                  Money is automatically transferred to your bank account
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Secure Payments</h4>
                <p className="text-sm text-muted-foreground">
                  All payments are processed securely through Stripe
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Tax Reporting</h4>
                <p className="text-sm text-muted-foreground">
                  Automatic tax forms and reporting for your business
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Dispute Management</h4>
                <p className="text-sm text-muted-foreground">
                  Handle payment disputes directly through Stripe
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

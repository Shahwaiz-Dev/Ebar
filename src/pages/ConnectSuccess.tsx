import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  ArrowRight, 
  CreditCard,
  DollarSign,
  Shield,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { updateBeachBarConnectAccount } from '@/lib/firestore';

export const ConnectSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [accountStatus, setAccountStatus] = useState<{
    accountId: string;
    isOnboarded: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
  } | null>(null);

  // Get account ID from URL params only (don't rely on localStorage)
  const accountId = searchParams.get('account');

  useEffect(() => {
    if (accountId) {
      checkAccountStatus(accountId);
    }
  }, [accountId]);

  const checkAccountStatus = async (accountId: string) => {
    setIsCheckingStatus(true);
    try {
      const response = await fetch(`/api/get-connect-account?accountId=${accountId}`);
      const data = await response.json();

      if (data.error) {
        console.error('Error checking account status:', data.error);
        toast.error('Failed to check account status');
        return;
      }

      setAccountStatus({
        accountId: data.accountId || accountId,
        isOnboarded: data.isOnboarded,
        chargesEnabled: data.chargesEnabled,
        payoutsEnabled: data.payoutsEnabled,
        detailsSubmitted: data.detailsSubmitted,
      });

      if (data.isOnboarded) {
        toast.success('Account setup completed successfully!');
        
        // Update the bar's Connect account status to 'active'
        try {
          const barId = searchParams.get('barId');
          if (barId) {
            await updateBeachBarConnectAccount(barId, accountId, 'active');
            console.log('Updated bar Connect account status to active');
          }
        } catch (error) {
          console.error('Error updating bar Connect account status:', error);
          // Don't show error to user as the main success is still valid
        }
      } else if (data.detailsSubmitted) {
        toast.info('Account details submitted and under review');
      }
    } catch (error) {
      console.error('Error checking account status:', error);
      toast.error('Failed to check account status');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleRefreshStatus = () => {
    if (accountId) {
      checkAccountStatus(accountId);
    }
  };

  const getStatusMessage = () => {
    if (!accountStatus) return 'Checking account status...';

    if (accountStatus.isOnboarded) {
      return 'Your Stripe Connect account is fully set up and ready to accept payments!';
    } else if (accountStatus.detailsSubmitted) {
      return 'Your account details have been submitted and are under review by Stripe.';
    } else {
      return 'Account setup is in progress. Please complete all required steps.';
    }
  };

  const getStatusIcon = () => {
    if (!accountStatus) return <RefreshCw className="h-6 w-6 animate-spin" />;
    
    if (accountStatus.isOnboarded) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    } else if (accountStatus.detailsSubmitted) {
      return <RefreshCw className="h-6 w-6 text-blue-500" />;
    } else {
      return <RefreshCw className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    if (!accountStatus) return 'text-gray-500';
    
    if (accountStatus.isOnboarded) {
      return 'text-green-600';
    } else if (accountStatus.detailsSubmitted) {
      return 'text-blue-600';
    } else {
      return 'text-yellow-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl font-bold">Stripe Connect Setup</CardTitle>
          <p className={`text-lg font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Account Status Details */}
          {accountStatus && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Account Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Charges:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    accountStatus.chargesEnabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {accountStatus.chargesEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Payouts:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    accountStatus.payoutsEnabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {accountStatus.payoutsEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Success Message for Completed Setup */}
          {accountStatus?.isOnboarded && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Congratulations! Your account is ready.</p>
                  <p>You can now:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Accept payments from customers</li>
                    <li>Receive automatic payouts to your bank account</li>
                    <li>View your earnings in the dashboard</li>
                    <li>Manage your payment settings</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Pending Review Message */}
          {accountStatus?.detailsSubmitted && !accountStatus.isOnboarded && (
            <Alert>
              <RefreshCw className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Account Under Review</p>
                  <p>Stripe is reviewing your account details. This usually takes a few minutes to a few hours.</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an email notification once your account is approved.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Benefits Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What's Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center space-y-2 p-4 bg-blue-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-500" />
                <span className="font-medium">Start Earning</span>
                <span className="text-sm text-muted-foreground text-center">
                  Accept payments from customers and receive automatic payouts
                </span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 bg-green-50 rounded-lg">
                <Shield className="h-8 w-8 text-blue-500" />
                <span className="font-medium">Secure Payments</span>
                <span className="text-sm text-muted-foreground text-center">
                  Bank-level security with fraud protection
                </span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 bg-purple-50 rounded-lg">
                <ExternalLink className="h-8 w-8 text-purple-500" />
                <span className="font-medium">Easy Management</span>
                <span className="text-sm text-muted-foreground text-center">
                  Manage everything from your dashboard
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleGoToDashboard}
              className="flex-1"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            {!accountStatus?.isOnboarded && (
              <Button 
                onClick={handleRefreshStatus}
                variant="outline"
                disabled={isCheckingStatus}
                className="flex-1"
                size="lg"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                {isCheckingStatus ? 'Checking...' : 'Refresh Status'}
              </Button>
            )}
          </div>

          {/* Help Section */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Need help? Contact our support team or check the Stripe documentation.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectSuccessPage;

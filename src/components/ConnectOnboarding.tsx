import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  DollarSign,
  Shield,
  Clock,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface ConnectAccount {
  accountId: string;
  isOnboarded: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  businessProfile?: {
    name?: string;
  };
  requirements?: {
    currently_due?: string[];
    eventually_due?: string[];
  };
  // Enhanced debug properties
  currentlyDue?: string[];
  pastDue?: string[];
  pendingVerification?: string[];
  eventuallyDue?: string[];
  disabled_reason?: string;
}

interface ConnectOnboardingProps {
  ownerId: string;
  barName: string;
  barId: string;
  ownerEmail: string;
  onAccountCreated?: (accountId: string) => void;
}

export const ConnectOnboarding = ({ 
  ownerId, 
  barName, 
  barId,
  ownerEmail,
  onAccountCreated 
}: ConnectOnboardingProps) => {
  const [account, setAccount] = useState<ConnectAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const createConnectAccount = async () => {
    setIsCreating(true);
    try {
      console.log('Creating Connect account with:', {
        email: ownerEmail,
        businessName: barName,
        ownerId: ownerId,
      });

      const response = await fetch('/api/stripe-connect?action=create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: ownerEmail,
          businessName: barName,
          ownerId: ownerId,
          barId: barId,
        }),
      });

      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (!data.onboardingUrl) {
        throw new Error('No onboarding URL received from server');
      }

      // Open onboarding in new window
      console.log('Opening onboarding URL:', data.onboardingUrl);
      const newWindow = window.open(data.onboardingUrl, '_blank');
      
      if (!newWindow) {
        throw new Error('Failed to open new window. Please check your popup blocker settings.');
      }
      
      if (onAccountCreated) {
        onAccountCreated(data.accountId);
      }

      toast.success('Onboarding started! Complete the setup in the new window.');
    } catch (error) {
      console.error('Error creating Connect account:', error);
      toast.error(`Failed to create Connect account: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const checkAccountStatus = async (accountId: string) => {
    try {
      const response = await fetch(`/api/stripe-connect?action=get-account&accountId=${accountId}`);
      const data = await response.json();

      if (data.error) {
        console.error('Error checking account status:', data.error);
        return;
      }

      console.log('Connect account status retrieved:', {
        accountId: data.accountId,
        status: data.status,
        isOnboarded: data.isOnboarded,
        chargesEnabled: data.chargesEnabled,
        payoutsEnabled: data.payoutsEnabled,
        detailsSubmitted: data.detailsSubmitted,
        currentlyDue: data.currentlyDue,
        pastDue: data.pastDue,
        pendingVerification: data.pendingVerification,
        disabledReason: data.disabled_reason
      });

      setAccount(data);
    } catch (error) {
      console.error('Error checking account status:', error);
    }
  };

  const refreshAccountStatus = async () => {
    if (!account?.accountId) return;
    
    setIsLoading(true);
    try {
      await checkAccountStatus(account.accountId);
      toast.success('Account status refreshed');
    } catch (error) {
      toast.error('Failed to refresh account status');
    } finally {
      setIsLoading(false);
    }
  };

  const debugAccount = async () => {
    if (!account?.accountId) return;
    
    try {
      const response = await fetch(`/api/stripe-connect?action=debug-account&accountId=${account.accountId}`);
      const debugData = await response.json();
      
      console.group('🔍 STRIPE CONNECT ACCOUNT DEBUG REPORT');
      console.log('📊 Account Analysis:', debugData.analysis);
      console.log('⚠️ Recommendations:', debugData.recommendations);
      console.log('🔧 Raw Requirements:', debugData.debug_info);
      console.groupEnd();
      
      // Show recommendations in a toast
      if (debugData.recommendations?.length > 0) {
        const urgentItems = debugData.recommendations.filter(r => r.priority === 'URGENT');
        if (urgentItems.length > 0) {
          toast.error(`URGENT: ${urgentItems[0].issue} - Check console for details`);
        } else {
          toast.info('Debug report generated - Check browser console for detailed analysis');
        }
      } else {
        toast.success('No immediate issues found - Check console for full report');
      }
    } catch (error) {
      console.error('Error debugging account:', error);
      toast.error('Failed to generate debug report');
    }
  };

  const reOpenOnboarding = async () => {
    if (!account?.accountId) return;
    
    setIsCreating(true);
    try {
      console.log('Re-opening onboarding for account:', account.accountId);

      const response = await fetch('/api/stripe-connect?action=create-account-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: account.accountId,
          barId: barId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (!data.onboardingUrl) {
        throw new Error('No onboarding URL received from server');
      }

      // Open onboarding in new window
      console.log('Opening re-onboarding URL:', data.onboardingUrl);
      const newWindow = window.open(data.onboardingUrl, '_blank');
      
      if (!newWindow) {
        throw new Error('Failed to open new window. Please check your popup blocker settings.');
      }

      toast.success('Re-onboarding started! Complete the setup in the new window.');
    } catch (error) {
      console.error('Error re-opening onboarding:', error);
      toast.error(`Failed to re-open onboarding: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    // Clear any stale localStorage data when component mounts
    // This ensures fresh state for each user session
    localStorage.removeItem('connectAccountId');
    localStorage.removeItem('currentBarId');
  }, []);

  const getStatusBadge = () => {
    if (!account) return null;

    if (account.isOnboarded) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Ready to Accept Payments</Badge>;
    } else if (account.detailsSubmitted) {
      if (account.chargesEnabled && !account.payoutsEnabled) {
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Charges Enabled - Payouts Pending</Badge>;
      } else if (!account.chargesEnabled && account.payoutsEnabled) {
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Payouts Enabled - Charges Pending</Badge>;
      } else {
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
      }
    } else {
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Setup Required</Badge>;
    }
  };

  const getRequirementsAlert = () => {
    if (!account) return null;

    const currentlyDue = account.currentlyDue || [];
    const pastDue = account.pastDue || [];
    const pendingVerification = account.pendingVerification || [];
    const eventuallyDue = account.eventuallyDue || [];

    if (currentlyDue.length === 0 && pastDue.length === 0 && pendingVerification.length === 0 && eventuallyDue.length === 0) {
      return null;
    }

    return (
      <Alert className={pastDue.length > 0 ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            {pastDue.length > 0 && (
              <div className="text-red-800">
                <strong>⚠️ Past Due (Account may be restricted):</strong> {pastDue.join(', ')}
              </div>
            )}
            {currentlyDue.length > 0 && (
              <div>
                <strong>Currently Required:</strong> {currentlyDue.join(', ')}
              </div>
            )}
            {pendingVerification.length > 0 && (
              <div className="text-blue-800">
                <strong>Pending Verification:</strong> {pendingVerification.join(', ')}
              </div>
            )}
            {eventuallyDue.length > 0 && (
              <div className="text-gray-600">
                <strong>Eventually Required:</strong> {eventuallyDue.join(', ')}
              </div>
            )}
            {account.disabled_reason && (
              <div className="text-red-800 mt-2">
                <strong>Disabled Reason:</strong> {account.disabled_reason}
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Setup
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!account ? (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Set up payments for {barName}</h3>
                <p className="text-muted-foreground">
                  Connect your bank account to start receiving payments from customers
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col items-center space-y-2">
                  <Shield className="h-8 w-8 text-blue-500" />
                  <span className="font-medium">Secure</span>
                  <span className="text-muted-foreground text-center">
                    Bank-level security with Stripe
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <DollarSign className="h-8 w-8 text-green-500" />
                  <span className="font-medium">Fast Payouts</span>
                  <span className="text-muted-foreground text-center">
                    Receive payments within 2 business days
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <ExternalLink className="h-8 w-8 text-purple-500" />
                  <span className="font-medium">Easy Setup</span>
                  <span className="text-muted-foreground text-center">
                    Complete onboarding in minutes
                  </span>
                </div>
              </div>

              <Button 
                onClick={createConnectAccount}
                disabled={isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? 'Creating Account...' : 'Start Payment Setup'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Account Status</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={debugAccount}
                    variant="secondary"
                    size="sm"
                  >
                    🔍 Debug
                  </Button>
                  <Button
                    onClick={refreshAccountStatus}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Charges:</span>{' '}
                  <Badge variant={account.chargesEnabled ? "default" : "secondary"}>
                    {account.chargesEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Payouts:</span>{' '}
                  <Badge variant={account.payoutsEnabled ? "default" : "secondary"}>
                    {account.payoutsEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>

            {getRequirementsAlert()}

            {!account.isOnboarded && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Complete your account setup to start receiving payments.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={createConnectAccount}
                    variant="outline"
                    className="flex-1"
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating Account...' : 'Continue Setup'}
                  </Button>
                  {account.detailsSubmitted && (
                    <Button 
                      onClick={reOpenOnboarding}
                      variant="secondary"
                      className="flex-1"
                      disabled={isCreating}
                    >
                      {isCreating ? 'Opening...' : 'Re-open Onboarding'}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {account.isOnboarded && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your account is fully set up! You can now receive payments from customers.
                </AlertDescription>
              </Alert>
            )}

            {!account.isOnboarded && account.detailsSubmitted && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <strong>Account Under Review:</strong>
                    <p className="text-sm">
                      Your account information has been submitted and is being reviewed by Stripe. 
                      This process typically takes 1-2 business days.
                    </p>
                    {(account.currentlyDue?.length > 0 || account.pastDue?.length > 0) && (
                      <p className="text-sm">
                        <strong>Action needed:</strong> Use the "Re-open Onboarding" button above to provide missing information.
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

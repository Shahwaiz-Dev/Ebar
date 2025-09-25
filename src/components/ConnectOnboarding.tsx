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
  Clock
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

      const response = await fetch('/api/create-connect-account', {
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
      const response = await fetch(`/api/get-connect-account?accountId=${accountId}`);
      const data = await response.json();

      if (data.error) {
        console.error('Error checking account status:', data.error);
        return;
      }

      setAccount(data);
    } catch (error) {
      console.error('Error checking account status:', error);
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
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
    } else {
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Setup Required</Badge>;
    }
  };

  const getRequirementsAlert = () => {
    if (!account?.requirements) return null;

    const currentlyDue = account.requirements.currently_due || [];
    const eventuallyDue = account.requirements.eventually_due || [];

    if (currentlyDue.length === 0 && eventuallyDue.length === 0) {
      return null;
    }

    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            {currentlyDue.length > 0 && (
              <div>
                <strong>Required:</strong> {currentlyDue.join(', ')}
              </div>
            )}
            {eventuallyDue.length > 0 && (
              <div>
                <strong>Eventually required:</strong> {eventuallyDue.join(', ')}
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
              <h3 className="font-semibold">Account Status</h3>
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
                <Button 
                  onClick={createConnectAccount}
                  variant="outline"
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating Account...' : 'Continue Setup'}
                </Button>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

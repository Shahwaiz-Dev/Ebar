import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, CreditCard, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useBeachBarsByOwner } from '@/hooks/useBeachBars';
import { toast } from 'sonner';

export const ConnectSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { data: userBars = [] } = useBeachBarsByOwner(currentUser?.uid || '');
  const [countdown, setCountdown] = useState(5);
  const [isConnecting, setIsConnecting] = useState(false);

  // Get account ID from URL parameters
  const accountId = searchParams.get('account_id');

  useEffect(() => {
    if (accountId && userBars.length > 0) {
      connectStripeAccount();
    }
  }, [accountId, userBars]);

  const connectStripeAccount = async () => {
    if (!accountId || userBars.length === 0) return;

    try {
      setIsConnecting(true);
      
      // Update the first bar with the Stripe account ID
      const response = await fetch('/api/update-bar-stripe-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barId: userBars[0].id,
          stripeAccountId: accountId,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      toast.success('Stripe account connected successfully!');
    } catch (error) {
      console.error('Error connecting Stripe account:', error);
      toast.error('Failed to connect Stripe account');
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                Stripe Connect Setup Complete!
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isConnecting ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Connecting your Stripe account...</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Please wait while we set up your payment processing.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Your account is now ready to receive payments!</h3>
                  <p className="text-muted-foreground">
                    You can now accept bookings and orders from customers. 
                    All payments will be automatically processed and transferred to your bank account.
                  </p>
                </div>
              )}

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Payment processing is now active</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  You'll receive 85% of each transaction, with 15% going to the platform
                </p>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  Redirecting to dashboard in {countdown} seconds...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

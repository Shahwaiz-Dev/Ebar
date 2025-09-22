import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, CreditCard, DollarSign } from 'lucide-react';

// Safely load Stripe with error handling
const getStripePromise = () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.error('Stripe publishable key is not set');
    return null;
  }
  
  if (!publishableKey.startsWith('pk_test_') && !publishableKey.startsWith('pk_live_')) {
    console.error('Invalid Stripe publishable key format');
    return null;
  }
  
  try {
    return loadStripe(publishableKey);
  } catch (error) {
    console.error('Failed to load Stripe:', error);
    return null;
  }
};

const stripePromise = getStripePromise();

interface ConnectPaymentFormProps {
  amount: number;
  barId: string;
  ownerId: string;
  connectAccountId: string;
  barName: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  buttonText?: string;
  metadata?: Record<string, string>;
}

const ConnectPaymentFormComponent = ({ 
  amount, 
  barId, 
  ownerId, 
  connectAccountId, 
  barName,
  onSuccess, 
  onError, 
  buttonText = 'Pay Now', 
  metadata = {} 
}: ConnectPaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{
    platformFee: number;
    ownerAmount: number;
  } | null>(null);

  useEffect(() => {
    // Debug: Check if Stripe is loaded
    if (stripe) {
      console.log('Stripe loaded successfully');
      setStripeLoaded(true);
      setStripeError(null);
    } else {
      console.log('Stripe not loaded yet');
    }
  }, [stripe]);

  useEffect(() => {
    // Create Connect PaymentIntent as soon as the page loads
    if (stripeLoaded && connectAccountId) {
      createConnectPaymentIntent();
    }
  }, [stripeLoaded, connectAccountId]);

  const createConnectPaymentIntent = async () => {
    try {
      console.log('Creating Connect payment intent for amount:', amount);
      const response = await fetch('/api/create-connect-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'usd',
          barId,
          ownerId,
          connectAccountId,
          metadata: {
            ...metadata,
            email: email,
            barName,
          },
        }),
      });

      const data = await response.json();
      console.log('Connect payment intent response:', data);

      if (data.error) {
        console.error('Connect payment intent error:', data.error);
        onError(data.error);
        return;
      }

      setClientSecret(data.clientSecret);
      setPaymentDetails({
        platformFee: data.platformFee,
        ownerAmount: data.ownerAmount,
      });
      console.log('Client secret set successfully');
    } catch (error) {
      console.error('Error creating Connect payment intent:', error);
      onError('Failed to initialize payment');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      console.error('Stripe not ready:', { stripe: !!stripe, elements: !!elements, clientSecret: !!clientSecret });
      onError('Stripe has not loaded yet. Please try again.');
      return;
    }

    if (!email) {
      onError('Please enter your email address');
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        onError('Card element not found');
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: email,
          },
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful! The bar owner will receive their portion.');
        onSuccess(paymentIntent.id);
      } else {
        onError('Payment was not successful');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '12px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        backgroundColor: 'white',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  // Show error if Stripe failed to load
  if (!stripePromise) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Stripe is not properly configured. Please check your environment variables.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment to {barName}
        </CardTitle>
        <CardDescription>
          Secure payment powered by Stripe Connect
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Breakdown */}
        {paymentDetails && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="font-bold">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Platform Fee (3%):</span>
              <span>-${paymentDetails.platformFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Bar Owner Receives:</span>
              <span className="font-bold text-green-600">${paymentDetails.ownerAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Card Information</Label>
            <div className="p-3 border rounded-md">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!stripeLoaded || !clientSecret || isProcessing}
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                {buttonText}
              </>
            )}
          </Button>
        </form>

        <div className="text-xs text-center text-gray-500">
          <div className="flex items-center justify-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Secured by Stripe</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ConnectPaymentForm = (props: ConnectPaymentFormProps) => {
  if (!stripePromise) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Stripe is not properly configured. Please check your environment variables.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <ConnectPaymentFormComponent {...props} />
    </Elements>
  );
};

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle } from 'lucide-react';

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

// Debug: Check if Stripe key is available
console.log('Stripe Publishable Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Not Set');

interface StripePaymentFormProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  buttonText?: string;
  metadata?: Record<string, string>;
}

const PaymentForm = ({ amount, onSuccess, onError, buttonText = 'Pay', metadata = {} }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

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
    // Create PaymentIntent as soon as the page loads
    if (stripeLoaded) {
      createPaymentIntent();
    }
  }, [stripeLoaded]);

  const createPaymentIntent = async () => {
    try {
      console.log('Creating payment intent for amount:', amount);
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'standard',
          amount,
          currency: 'usd',
          metadata: {
            ...metadata,
            email: email,
          },
        }),
      });

      const data = await response.json();
      console.log('Payment intent response:', data);

      if (data.error) {
        console.error('Payment intent error:', data.error);
        onError(data.error);
        return;
      }

      setClientSecret(data.clientSecret);
      console.log('Client secret set successfully');
    } catch (error) {
      console.error('Error creating payment intent:', error);
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
        toast.success('Payment successful!');
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
  if (stripeError) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Payment Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-sm text-red-600 mb-4">{stripeError}</p>
            <p className="text-xs text-muted-foreground">
              Please check your Stripe configuration and try again.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show loading if Stripe is not loaded
  if (!stripeLoaded) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Loading payment form...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">
              {!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
                ? 'Stripe key not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in your environment variables.'
                : 'Initializing payment form...'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Enter your payment information to complete the transaction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email for Receipt</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Card Information</Label>
            <div className="border rounded-md p-3 bg-white">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isProcessing || !stripe || !clientSecret}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                `${buttonText} €${amount.toFixed(2)}`
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Your payment is secured by Stripe. We never store your card details.
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export const StripePaymentForm = (props: StripePaymentFormProps) => {
  // Don't render if Stripe failed to load
  if (!stripePromise) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Payment Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-sm text-red-600 mb-4">
              Stripe is not properly configured. Please check your environment variables.
            </p>
            <p className="text-xs text-muted-foreground">
              Make sure VITE_STRIPE_PUBLISHABLE_KEY is set correctly.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}; 
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

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

const TestPaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  const createTestPaymentIntent = async () => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 10.00, // $10 test payment
          currency: 'usd',
          metadata: {
            test: 'true',
            description: 'Test payment'
          },
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setClientSecret(data.clientSecret);
      toast.success('Payment intent created successfully!');
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error('Failed to create payment intent');
    }
  };

  const handleTestPayment = async () => {
    if (!stripe || !elements || !clientSecret) {
      toast.error('Stripe not ready');
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast.error('Card element not found');
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: 'test@example.com',
          },
        },
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('Test payment successful!');
      } else {
        toast.error('Payment was not successful');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Stripe Test Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={createTestPaymentIntent}
          disabled={!!clientSecret}
          className="w-full"
        >
          {clientSecret ? 'Payment Intent Created' : 'Create Test Payment Intent'}
        </Button>

        {clientSecret && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Card Information</label>
              <div className="border rounded-md p-3 bg-white">
                <CardElement options={cardElementOptions} />
              </div>
            </div>

            <Button
              onClick={handleTestPayment}
              disabled={isProcessing || !stripe}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Test Payment $10.00'
              )}
            </Button>
          </>
        )}

        <div className="text-xs text-muted-foreground text-center">
          Use test card: 4242 4242 4242 4242
        </div>
      </CardContent>
    </Card>
  );
};

export const StripeTest = () => {
  // Don't render if Stripe failed to load
  if (!stripePromise) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Stripe Test Payment</CardTitle>
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
      <TestPaymentForm />
    </Elements>
  );
}; 
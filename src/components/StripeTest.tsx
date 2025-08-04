import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
      },
      invalid: {
        color: '#9e2146',
      },
    },
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
              <div className="border rounded-md p-3">
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
  return (
    <Elements stripe={stripePromise}>
      <TestPaymentForm />
    </Elements>
  );
}; 
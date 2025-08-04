import { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useStripePayment } from '@/hooks/useStripePayment';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  metadata?: Record<string, string>;
  buttonText?: string;
}

export const StripePaymentForm = ({
  amount,
  onSuccess,
  onError,
  metadata = {},
  buttonText = 'Pay',
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { createPaymentIntent, isLoading, error } = useStripePayment();
  const [clientSecret, setClientSecret] = useState('');
  const [cardError, setCardError] = useState('');
  const [isCardComplete, setIsCardComplete] = useState(false);

  useEffect(() => {
    if (amount <= 0) return;

    // Create a payment intent when the component mounts
    createPaymentIntent(
      { amount, metadata },
      {
        onSuccess: (data) => {
          setClientSecret(data.clientSecret);
        },
        onError: (error) => {
          onError(error.message);
        },
      }
    );
  }, [amount, createPaymentIntent, metadata, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      return;
    }

    const { error: submitError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (submitError) {
      setCardError(submitError.message || 'An error occurred while processing your payment');
      onError(submitError.message || 'Payment failed');
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {cardError && <div className="text-red-500 text-sm">{cardError}</div>}

      <div className="p-3 border rounded-md bg-card">
        <CardElement
          options={{
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
          }}
          onChange={(e) => setIsCardComplete(e.complete)}
        />
      </div>

      <Button
        type="submit"
        disabled={!stripe || !elements || !clientSecret || !isCardComplete || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          `${buttonText} $${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
};
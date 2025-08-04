import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}

interface PaymentIntentResponse {
  clientSecret: string;
}

export const useStripePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntentMutation = useMutation<
    PaymentIntentResponse,
    Error,
    CreatePaymentIntentParams
  >({
    mutationFn: async ({ amount, currency = 'usd', metadata = {} }) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            currency,
            metadata,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        return await response.json();
      } catch (err) {
        setError(err.message || 'An error occurred while processing your payment');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
  });

  return {
    createPaymentIntent: createPaymentIntentMutation.mutate,
    isLoading: isLoading || createPaymentIntentMutation.isPending,
    error,
    reset: () => {
      setError(null);
      createPaymentIntentMutation.reset();
    },
  };
};
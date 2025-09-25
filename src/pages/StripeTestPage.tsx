import { useState } from 'react';
import { StripeTest } from '@/components/StripeTest';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const StripeTestPage = () => {
  const [envStatus, setEnvStatus] = useState({
    publishableKey: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    secretKey: !!import.meta.env.STRIPE_SECRET_KEY,
    webhookSecret: !!import.meta.env.STRIPE_WEBHOOK_SECRET,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Stripe Integration Test
              </h1>
              <p className="text-muted-foreground">
                Debug and test your Stripe payment integration
              </p>
            </div>

            {/* Environment Status */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Environment Variables Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>VITE_STRIPE_PUBLISHABLE_KEY:</span>
                    <Badge variant={envStatus.publishableKey ? "default" : "destructive"}>
                      {envStatus.publishableKey ? "Set" : "Not Set"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>STRIPE_SECRET_KEY:</span>
                    <Badge variant={envStatus.secretKey ? "default" : "destructive"}>
                      {envStatus.secretKey ? "Set" : "Not Set"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>STRIPE_WEBHOOK_SECRET:</span>
                    <Badge variant={envStatus.webhookSecret ? "default" : "destructive"}>
                      {envStatus.webhookSecret ? "Set" : "Not Set"}
                    </Badge>
                  </div>
                </div>
                
                {!envStatus.publishableKey && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <h3 className="font-medium text-yellow-800 mb-2">Missing Environment Variables</h3>
                    <p className="text-sm text-yellow-700">
                      To test Stripe payments, you need to set up your environment variables. 
                      Create a <code>.env.local</code> file in your project root with:
                    </p>
                    <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded">
{`VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here`}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stripe Test Component */}
            {envStatus.publishableKey && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <StripeTest />
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Testing Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Test Card Numbers:</h3>
                    <ul className="text-sm space-y-1">
                      <li><strong>Success:</strong> 4242 4242 4242 4242</li>
                      <li><strong>Decline:</strong> 4000 0000 0000 0002</li>
                      <li><strong>Requires Authentication:</strong> 4000 0025 0000 3155</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Test Details:</h3>
                    <ul className="text-sm space-y-1">
                      <li><strong>CVC:</strong> Any 3 digits (e.g., 123)</li>
                      <li><strong>Expiry:</strong> Any future date (e.g., 12/25)</li>
                      <li><strong>Amount:</strong> €10.00 (test payment)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Debug Steps:</h3>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      <li>Check browser console for error messages</li>
                      <li>Verify environment variables are set correctly</li>
                      <li>Ensure your API endpoints are working</li>
                      <li>Check Stripe Dashboard for payment attempts</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}; 
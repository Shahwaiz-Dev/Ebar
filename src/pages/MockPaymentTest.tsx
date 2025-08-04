import { useState } from 'react';
import { MockPaymentForm } from '@/components/MockPaymentForm';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const MockPaymentTest = () => {
  const [amount, setAmount] = useState(25.99);
  const [testResult, setTestResult] = useState<string>('');

  const handlePaymentSuccess = (paymentId: string) => {
    setTestResult(`✅ Payment successful! Mock Payment ID: ${paymentId}`);
  };

  const handlePaymentError = (error: string) => {
    setTestResult(`❌ Payment failed: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">Mock Payment System Test</h1>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Test Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>This is a mock payment system for testing purposes.</p>
                    <p>No real payments will be processed.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <MockPaymentForm
              amount={amount}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              buttonText="Test Payment"
            />

            {testResult && (
              <Card className="mt-6">
                <CardContent className="p-4">
                  <p className="text-sm">{testResult}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}; 
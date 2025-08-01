import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Mail, ArrowLeft, MapPin } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface OrderData {
  barId: number;
  barName: string;
  sunbedNumber?: string;
  umbrellaNumber?: string;
  spotId?: string;
  date?: string;
  time?: string;
  items: Array<{
    id: number | string;
    name: string;
    price: number;
    quantity?: number;
    category?: string;
    type?: string;
  }>;
  total: number;
  type?: 'booking' | 'qr-menu' | 'order';
}

export const PaymentPage = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: '',
  });

  useEffect(() => {
    const storedOrder = localStorage.getItem('currentOrder');
    if (storedOrder) {
      setOrderData(JSON.parse(storedOrder));
    } else {
      navigate('/search');
    }
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = async () => {
    if (!orderData) return;

    // Validate form
    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardholderName || !formData.email) {
      alert('Please fill in all fields');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Send email receipt (simulated)
      sendEmailReceipt();
      
      // Clear order data
      localStorage.removeItem('currentOrder');
    }, 3000);
  };

  const sendEmailReceipt = () => {
    // Simulate sending email receipt
    console.log('Sending email receipt to:', formData.email);
    console.log('Order details:', orderData);
    
    // In a real application, this would call your backend API
    // to send the actual email receipt
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">No order found</h1>
            <Button onClick={() => navigate('/search')}>Back to Search</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Payment Successful! 🎉
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Your order has been confirmed and a receipt has been sent to your email.
                </p>
              </div>

                                <Card className="mb-8">
                    <CardHeader>
                      <CardTitle>
                        {orderData.type === 'booking' ? 'Booking Summary' : 'Order Summary'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Beach Bar:</span>
                          <span>{orderData.barName}</span>
                        </div>
                        
                        {orderData.type === 'booking' && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Date:</span>
                              <span>{orderData.date}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Time:</span>
                              <span>{orderData.time}</span>
                            </div>
                          </>
                        )}
                        
                        {(orderData.sunbedNumber || orderData.umbrellaNumber || orderData.spotId) && (
                          <>
                            {orderData.sunbedNumber && (
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Sunbed Number:</span>
                                <span>{orderData.sunbedNumber}</span>
                              </div>
                            )}
                            {orderData.umbrellaNumber && (
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Umbrella Number:</span>
                                <span>{orderData.umbrellaNumber}</span>
                              </div>
                            )}
                            {orderData.spotId && (
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Spot ID:</span>
                                <span>{orderData.spotId}</span>
                              </div>
                            )}
                          </>
                        )}
                        
                        <Separator />
                        <div className="space-y-2">
                          {orderData.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                              <span>
                                {item.name} 
                                {item.quantity && ` × ${item.quantity}`}
                                {item.type && ` (${item.type})`}
                              </span>
                              <span>
                                ${item.quantity ? item.price * item.quantity : item.price}
                              </span>
                            </div>
                          ))}
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Total:</span>
                          <span>${orderData.total}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/search')} variant="outline">
                  Order Again
                </Button>
                <Button onClick={() => navigate('/')}>
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/order/${orderData.barId}`)} 
                className="text-muted-foreground mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Order
              </Button>
              
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Complete Your Order
              </h1>
              <p className="text-muted-foreground">
                Secure payment for {orderData.barName}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                      maxLength={19}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                        maxLength={4}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      placeholder="John Doe"
                      value={formData.cardholderName}
                      onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email for Receipt</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">{orderData.barName}</p>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {orderData.sunbedNumber && (
                              <p>Sunbed: {orderData.sunbedNumber}</p>
                            )}
                            {orderData.umbrellaNumber && (
                              <p>Umbrella: {orderData.umbrellaNumber}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        {orderData.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.category} • Qty: {item.quantity}
                              </p>
                            </div>
                            <span className="font-medium">${item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>${orderData.total}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>Receipt will be sent to your email</span>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    `Pay $${orderData.total}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentPage; 
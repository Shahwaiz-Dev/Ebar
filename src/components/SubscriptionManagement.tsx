import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, Crown, Star, Zap, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSubscription, useBookingLimits, useSubscriptionPlans, useCurrentPlan } from '@/hooks/useSubscription';
import { SubscriptionTier } from '@/lib/firestore';
import { toast } from 'sonner';

interface SubscriptionManagementProps {
  className?: string;
}

export const SubscriptionManagement = ({ className }: SubscriptionManagementProps) => {
  const { currentUser } = useAuth();
  const { data: subscription } = useUserSubscription(currentUser?.uid);
  const { data: bookingLimits } = useBookingLimits(currentUser?.uid);
  const plans = useSubscriptionPlans();
  const currentPlan = useCurrentPlan(subscription?.tier);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    try {
      toast.info(`Redirecting to payment for ${tier} plan...`);
      
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: currentUser?.uid, 
          tier,
          successUrl: `${window.location.origin}/dashboard?subscription=success&tab=subscription`,
          cancelUrl: `${window.location.origin}/dashboard?subscription=cancelled&tab=subscription`
        })
      });
      
      const result = await response.json();
      
      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error(result.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('Failed to upgrade subscription. Please try again.');
    }
  };

  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'starter':
        return <Zap className="h-5 w-5" />;
      case 'professional':
        return <Star className="h-5 w-5" />;
      case 'premium':
        return <Crown className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'starter':
        return 'text-blue-600 bg-blue-100';
      case 'professional':
        return 'text-purple-600 bg-purple-100';
      case 'premium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const usagePercentage = bookingLimits 
    ? Math.round((bookingLimits.currentUsage / bookingLimits.limit) * 100)
    : 0;

  return (
    <div className={className}>
      {/* Current Subscription Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${getTierColor(subscription.tier)}`}>
                    {getTierIcon(subscription.tier)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{currentPlan?.name}</h3>
                    <p className="text-sm text-muted-foreground">€{currentPlan?.price}/month</p>
                  </div>
                </div>
                <Badge 
                  variant={subscription.status === 'active' ? 'default' : 'destructive'}
                  className="capitalize"
                >
                  {subscription.status}
                </Badge>
              </div>

              {bookingLimits && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Monthly Bookings Used</span>
                    <span>{bookingLimits.currentUsage} / {bookingLimits.limit}</span>
                  </div>
                  <Progress 
                    value={usagePercentage} 
                    className="h-2"
                  />
                  {usagePercentage >= 80 && (
                    <p className="text-sm text-orange-600">
                      You're approaching your booking limit. Consider upgrading your plan.
                    </p>
                  )}
                  {usagePercentage >= 100 && (
                    <p className="text-sm text-red-600">
                      You've reached your booking limit. Upgrade to continue booking.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Active Subscription</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Subscribe to start accepting bookings and access premium features.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative h-full flex flex-col ${subscription?.tier === plan.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                {subscription?.tier === plan.id && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-500">
                    Current Plan
                  </Badge>
                )}
                <CardHeader className="text-center pb-2 flex-shrink-0">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${getTierColor(plan.id)}`}>
                    {getTierIcon(plan.id)}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    €{plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  <ul className="space-y-3 mb-6 flex-grow">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-auto" 
                    variant={subscription?.tier === plan.id ? "outline" : "default"}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={subscription?.tier === plan.id}
                  >
                    {subscription?.tier === plan.id ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

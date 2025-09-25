import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getUserSubscription, 
  createUserSubscription, 
  updateUserSubscription,
  checkBookingLimit,
  incrementBookingCount,
  hasFeatureAccess,
  SUBSCRIPTION_PLANS,
  UserSubscription,
  SubscriptionTier
} from '@/lib/firestore';
import { toast } from 'sonner';

// Query keys
export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  user: (userId: string) => [...subscriptionKeys.all, 'user', userId] as const,
  limits: (userId: string) => [...subscriptionKeys.all, 'limits', userId] as const,
};

// Get user subscription
export const useUserSubscription = (userId: string | undefined) => {
  return useQuery({
    queryKey: subscriptionKeys.user(userId || ''),
    queryFn: () => getUserSubscription(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Check booking limits
export const useBookingLimits = (userId: string | undefined) => {
  return useQuery({
    queryKey: subscriptionKeys.limits(userId || ''),
    queryFn: () => checkBookingLimit(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Create subscription mutation
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUserSubscription,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.user(data.userId) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.limits(data.userId) });
      toast.success('Subscription created successfully!');
    },
    onError: (error) => {
      console.error('Error creating subscription:', error);
      toast.error('Failed to create subscription');
    },
  });
};

// Update subscription mutation
export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<UserSubscription> }) =>
      updateUserSubscription(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      toast.success('Subscription updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    },
  });
};

// Increment booking count mutation
export const useIncrementBookingCount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: incrementBookingCount,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.limits(userId) });
    },
    onError: (error) => {
      console.error('Error incrementing booking count:', error);
    },
  });
};

// Helper function to check if user has access to a feature
export const useFeatureAccess = (userTier: SubscriptionTier | null | undefined, requiredTier: SubscriptionTier) => {
  return hasFeatureAccess(userTier || null, requiredTier);
};

// Get all subscription plans
export const useSubscriptionPlans = () => {
  return SUBSCRIPTION_PLANS;
};

// Helper function to get current plan details
export const useCurrentPlan = (tier: SubscriptionTier | null | undefined) => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === tier) || null;
};

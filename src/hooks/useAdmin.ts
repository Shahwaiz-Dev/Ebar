import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getUnverifiedBars, 
  getBeachBars, 
  verifyBar, 
  unverifyBar 
} from '@/lib/firestore';
import { toast } from 'sonner';

// Query keys for admin operations
export const adminKeys = {
  all: ['admin'] as const,
  unverifiedBars: () => [...adminKeys.all, 'unverified-bars'] as const,
  allBars: () => [...adminKeys.all, 'all-bars'] as const,
};

// Get unverified bars
export const useUnverifiedBars = () => {
  return useQuery({
    queryKey: adminKeys.unverifiedBars(),
    queryFn: getUnverifiedBars,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get all bars (including unverified)
export const useAllBars = () => {
  return useQuery({
    queryKey: adminKeys.allBars(),
    queryFn: () => getBeachBars(true), // Include unverified
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Verify bar mutation
export const useVerifyBar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ barId, adminId }: { barId: string; adminId: string }) =>
      verifyBar(barId, adminId),
    onSuccess: () => {
      // Invalidate admin queries
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      // Invalidate public beach bars query
      queryClient.invalidateQueries({ queryKey: ['beachBars'] });
      toast.success('Bar verified successfully!');
    },
    onError: (error) => {
      console.error('Error verifying bar:', error);
      toast.error('Failed to verify bar. Please try again.');
    },
  });
};

// Unverify bar mutation
export const useUnverifyBar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unverifyBar,
    onSuccess: () => {
      // Invalidate admin queries
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      // Invalidate public beach bars query
      queryClient.invalidateQueries({ queryKey: ['beachBars'] });
      toast.success('Bar verification removed successfully!');
    },
    onError: (error) => {
      console.error('Error unverifying bar:', error);
      toast.error('Failed to remove verification. Please try again.');
    },
  });
};

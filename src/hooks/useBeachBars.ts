import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getBeachBars, 
  getBeachBarsByOwner, 
  getBeachBarById,
  createBeachBar,
  updateBeachBar,
  deleteBeachBar,
  disconnectStripeAccount,
  BeachBar
} from '@/lib/firestore';
import { toast } from 'sonner';

// Query keys
export const beachBarKeys = {
  all: ['beachBars'] as const,
  lists: () => [...beachBarKeys.all, 'list'] as const,
  list: (filters: string) => [...beachBarKeys.lists(), { filters }] as const,
  details: () => [...beachBarKeys.all, 'detail'] as const,
  detail: (id: string) => [...beachBarKeys.details(), id] as const,
  owner: (ownerId: string) => [...beachBarKeys.all, 'owner', ownerId] as const,
};

// Get all beach bars (verified only by default)
export const useBeachBars = (includeUnverified: boolean = false) => {
  return useQuery({
    queryKey: beachBarKeys.lists(),
    queryFn: () => getBeachBars(includeUnverified),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get beach bars by owner
export const useBeachBarsByOwner = (ownerId: string) => {
  return useQuery({
    queryKey: beachBarKeys.owner(ownerId),
    queryFn: () => getBeachBarsByOwner(ownerId),
    enabled: !!ownerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single beach bar
export const useBeachBar = (id: string) => {
  return useQuery({
    queryKey: beachBarKeys.detail(id),
    queryFn: () => getBeachBarById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create beach bar mutation
export const useCreateBeachBar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBeachBar,
    onSuccess: (data, variables) => {
      // Invalidate and refetch beach bars lists
      queryClient.invalidateQueries({ queryKey: beachBarKeys.lists() });
      queryClient.invalidateQueries({ queryKey: beachBarKeys.owner(variables.ownerId) });
      
      toast.success('Beach bar submitted for verification! You will receive an email notification once verified (1-2 business days).');
    },
    onError: (error) => {
      console.error('Error creating beach bar:', error);
      toast.error('Failed to create beach bar. Please try again.');
    },
  });
};

// Update beach bar mutation
export const useUpdateBeachBar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<BeachBar> }) =>
      updateBeachBar(id, updates),
    onSuccess: (data, variables) => {
      // Update the specific beach bar in cache
      queryClient.setQueryData(
        beachBarKeys.detail(variables.id),
        (oldData: BeachBar | undefined) => {
          if (oldData) {
            return { ...oldData, ...variables.updates };
          }
          return oldData;
        }
      );
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: beachBarKeys.lists() });
      
      toast.success('Beach bar updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating beach bar:', error);
      toast.error('Failed to update beach bar. Please try again.');
    },
  });
};

// Delete beach bar mutation
export const useDeleteBeachBar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBeachBar,
    onSuccess: (data, barId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: beachBarKeys.detail(barId) });
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: beachBarKeys.lists() });
      
      toast.success('Beach bar deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting beach bar:', error);
      toast.error('Failed to delete beach bar. Please try again.');
    },
  });
};

// Disconnect Stripe account mutation
export const useDisconnectStripeAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ barId, accountId }: { barId: string; accountId: string }) => {
      // Call the disconnect API
      const response = await fetch('/api/disconnect-stripe-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId, barId }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to disconnect Stripe account');
      }

      // Remove the connect account ID from the bar in Firestore
      await disconnectStripeAccount(barId);
      
      return result;
    },
    onSuccess: () => {
      // Invalidate beach bar queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: beachBarKeys.all });
      toast.success('Stripe account disconnected successfully!');
    },
    onError: (error) => {
      console.error('Error disconnecting Stripe account:', error);
      toast.error('Failed to disconnect Stripe account. Please try again.');
    },
  });
}; 
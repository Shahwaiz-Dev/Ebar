import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getBeachBars, 
  getBeachBarsByOwner, 
  getBeachBarById,
  createBeachBar,
  updateBeachBar,
  deleteBeachBar,
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

// Get all beach bars
export const useBeachBars = () => {
  return useQuery({
    queryKey: beachBarKeys.lists(),
    queryFn: getBeachBars,
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
      
      toast.success('Beach bar created successfully!');
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
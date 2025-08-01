import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getFavoritesByUser,
  addToFavorites,
  removeFromFavorites,
  isFavorite
} from '@/lib/firestore';
import { toast } from 'sonner';

// Query keys
export const favoriteKeys = {
  all: ['favorites'] as const,
  lists: () => [...favoriteKeys.all, 'list'] as const,
  list: (filters: string) => [...favoriteKeys.lists(), { filters }] as const,
  user: (userId: string) => [...favoriteKeys.all, 'user', userId] as const,
  status: (userId: string, barId: string) => [...favoriteKeys.all, 'status', userId, barId] as const,
};

// Get favorites by user
export const useFavoritesByUser = (userId: string) => {
  return useQuery({
    queryKey: favoriteKeys.user(userId),
    queryFn: () => getFavoritesByUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Check if bar is favorited by user
export const useIsFavorite = (userId: string, barId: string) => {
  return useQuery({
    queryKey: favoriteKeys.status(userId, barId),
    queryFn: () => isFavorite(userId, barId),
    enabled: !!userId && !!barId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Add to favorites mutation
export const useAddToFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToFavorites,
    onSuccess: (data, variables) => {
      // Invalidate and refetch favorites lists
      queryClient.invalidateQueries({ queryKey: favoriteKeys.user(variables.userId) });
      queryClient.invalidateQueries({ queryKey: favoriteKeys.status(variables.userId, variables.barId) });
      
      toast.success('Added to favorites!');
    },
    onError: (error) => {
      console.error('Error adding to favorites:', error);
      toast.error('Failed to add to favorites. Please try again.');
    },
  });
};

// Remove from favorites mutation
export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, barId }: { userId: string; barId: string }) =>
      removeFromFavorites(userId, barId),
    onSuccess: (data, variables) => {
      // Invalidate and refetch favorites lists
      queryClient.invalidateQueries({ queryKey: favoriteKeys.user(variables.userId) });
      queryClient.invalidateQueries({ queryKey: favoriteKeys.status(variables.userId, variables.barId) });
      
      toast.success('Removed from favorites!');
    },
    onError: (error) => {
      console.error('Error removing from favorites:', error);
      toast.error('Failed to remove from favorites. Please try again.');
    },
  });
}; 
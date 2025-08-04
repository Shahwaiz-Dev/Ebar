import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createReview, getReviewsByBar, getReviewsForMultipleBars } from '@/lib/firestore';
import { toast } from 'sonner';

export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (filters: string) => [...reviewKeys.lists(), { filters }] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
  bar: (barId: string) => [...reviewKeys.all, 'bar', barId] as const,
  multiple: (barIds: string[]) => [...reviewKeys.all, 'multiple', barIds] as const,
};

export const useReviewsByBar = (barId: string) => {
  return useQuery({
    queryKey: reviewKeys.bar(barId),
    queryFn: () => getReviewsByBar(barId),
    enabled: !!barId,
  });
};

export const useReviewsForMultipleBars = (barIds: string[]) => {
  return useQuery({
    queryKey: reviewKeys.multiple(barIds),
    queryFn: () => getReviewsForMultipleBars(barIds),
    enabled: barIds.length > 0,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReview,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.bar(variables.barId) });
      toast.success('Review submitted successfully!');
    },
    onError: (error) => {
      console.error('Error creating review:', error);
      toast.error('Failed to submit review. Please try again.');
    },
  });
};
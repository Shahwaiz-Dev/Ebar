import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Loader } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateReview } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { Star } from 'lucide-react';

interface ReviewModalProps {
  barId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal = ({ barId, isOpen, onClose }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { currentUser } = useAuth();
  const createReviewMutation = useCreateReview();

  const handleSubmit = async () => {
    try {
      if (!currentUser) {
        toast.error('You must be logged in to submit a review');
        return;
      }
      if (rating === 0) {
        toast.error('Please select a rating');
        return;
      }
      if (comment.length < 10) {
        toast.error('Comment must be at least 10 characters');
        return;
      }

      await createReviewMutation.mutateAsync({
        barId,
        userId: currentUser.uid,
        rating,
        comment,
      });
      toast.success('Thank you for your review!');
      onClose();
    } catch (error) {
      toast.error('Failed to submit review. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <Label>Rating</Label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer transition-colors ${
                    rating >= star 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="comment">Comment</Label>
            <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={createReviewMutation.isPending}
          >
            {createReviewMutation.isPending && (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            )}
            {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
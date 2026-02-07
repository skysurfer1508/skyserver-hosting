import { useState } from 'react';
import { MessageSquare, Bug, Lightbulb, MessageCircle, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFeedback, FeedbackType } from '@/hooks/useFeedback';
import { cn } from '@/lib/utils';

const feedbackTypes: { value: FeedbackType; label: string; icon: React.ElementType; emoji: string }[] = [
  { value: 'bug', label: 'Bug Report', icon: Bug, emoji: '🐞' },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb, emoji: '💡' },
  { value: 'general', label: 'General', icon: MessageCircle, emoji: '💭' },
];

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [message, setMessage] = useState('');
  const { createFeedback } = useFeedback();

  const resetForm = () => {
    setFeedbackType('general');
    setRating(0);
    setHoveredRating(0);
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) return;
    if (!message.trim()) return;

    await createFeedback.mutateAsync({
      feedback_type: feedbackType,
      message: message.trim(),
      rating,
    });

    resetForm();
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105 glow-primary"
        aria-label="Open feedback form"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Feedback Modal */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md gaming-card">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Send Feedback</DialogTitle>
            <DialogDescription>
              Help us improve SkyServer by sharing your thoughts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback Type Selector */}
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {feedbackTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFeedbackType(type.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-all',
                      feedbackType === type.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span className="text-lg">{type.emoji}</span>
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        'h-7 w-7 transition-colors',
                        (hoveredRating || rating) >= star
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      )}
                    />
                  </button>
                ))}
              </div>
              {rating === 0 && (
                <p className="text-xs text-muted-foreground">Click to rate</p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Tell us what you think or what went wrong..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={rating === 0 || !message.trim() || createFeedback.isPending}
                className="glow-primary"
              >
                {createFeedback.isPending ? 'Sending...' : 'Send Feedback'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { CheckCircle, Star, MessageSquare } from 'lucide-react';
import { Card, Button } from '../../../components/common';
import { StarRating } from '../../../components/features/reviews/StarRating';

export function BookingReviewSection({ booking, user, activeReview, setActiveReview, reviewMutation, onSubmit }) {
    const hasReviewed = (booking.reviews || []).some(r => {
        const reviewerId = r.reviewerId || r.reviewer?.id;
        return String(reviewerId) === String(user?.id);
    });

    if (hasReviewed) {
        const review = booking.reviews.find(r => String(r.reviewerId || r.reviewer?.id) === String(user?.id));
        return (
            <Card className="p-6 border-none ring-1 ring-black/5 dark:ring-white/10 shadow-lg bg-gradient-to-br from-yellow-50/50 to-white dark:from-yellow-900/5 dark:to-dark-800">
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-success-50 dark:bg-success-900/20 text-success-600 rounded-full">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-lg">Feedback Submitted</h4>
                        <p className="text-sm text-gray-500 font-medium">You rated the customer {review.rating} stars.</p>
                    </div>
                    {review.comment && (
                        <p className="text-sm italic text-gray-400">&ldquo;{review.comment}&rdquo;</p>
                    )}
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 border-none ring-1 ring-black/5 dark:ring-white/10 shadow-lg bg-gradient-to-br from-yellow-50/50 to-white dark:from-yellow-900/5 dark:to-dark-800">
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-lg">
                        <Star size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h4 className="font-black text-lg">Rate your experience</h4>
                        <p className="text-sm text-gray-500 font-medium">How was working with {booking.customer?.name}?</p>
                    </div>
                </div>

                <div className="flex flex-col items-center space-y-6 py-2">
                    <StarRating
                        value={activeReview.rating}
                        onChange={(r) => setActiveReview(s => ({ ...s, rating: r }))}
                        size={40}
                    />

                    <div className="w-full space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <MessageSquare size={14} className="text-gray-400" />
                            <span className="text-2xs font-black uppercase tracking-widest text-gray-400">Add a Public Comment</span>
                        </div>
                        <textarea
                            placeholder="How was the customer? Polite? Job as described?"
                            value={activeReview.comment}
                            onChange={(e) => setActiveReview(s => ({ ...s, comment: e.target.value }))}
                            className="w-full p-4 rounded-xl border transition-all text-sm outline-none focus:ring-4 focus:ring-brand-500/10 bg-gray-50 border-gray-100 focus:border-brand-500 dark:bg-dark-900 dark:border-dark-700 dark:text-white"
                            rows={3}
                        />
                    </div>

                    <Button
                        fullWidth
                        size="lg"
                        onClick={onSubmit}
                        loading={reviewMutation.isPending}
                        disabled={!activeReview.rating}
                        className="h-14 rounded-2xl font-black bg-brand-600 shadow-xl shadow-brand-500/20"
                    >
                        Submit Feedback
                    </Button>
                </div>
            </div>
        </Card>
    );
}

import { useState } from 'react';
import { Star, MessageSquare, Send, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { StarRating } from '../features/reviews/StarRating';

/**
 * QuickReview Component
 * 
 * A centralized, interactive review UI that can be embedded anywhere.
 * Handles star selection, optional comments, and submission with loaders.
 */
export function QuickReview({
    bookingId,
    onReviewSubmit,
    isSubmitting = false,
    className = '',
    role = 'CUSTOMER' // 'CUSTOMER' or 'WORKER'
}) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [showComment, setShowComment] = useState(false);

    const handleSubmit = (e) => {
        e.stopPropagation();
        if (rating === 0) return;
        onReviewSubmit({ bookingId, rating, comment, type: role === 'CUSTOMER' ? 'WORKER' : 'CUSTOMER' });
    };

    const handleToggleComment = (e) => {
        e.stopPropagation();
        setShowComment(!showComment);
    };

    return (
        <div className={`flex flex-col gap-3 py-2 pr-4 ${className}`}>
            <div className="flex items-center gap-3">
                <StarRating
                    value={rating}
                    size={20}
                    onChange={(val) => setRating(val)}
                />

                <button
                    onClick={handleToggleComment}
                    className={`p-2 rounded-xl transition-all duration-200 
            ${showComment
                            ? 'bg-brand-500 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-white'
                        }`}
                    title="Add a comment"
                >
                    <MessageSquare size={18} />
                </button>

                {rating > 0 && !showComment && (
                    <Button
                        size="sm"
                        variant="primary"
                        className="rounded-full px-6 shadow-brand-500/20"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                    >
                        Submit
                    </Button>
                )}
            </div>

            {showComment && (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300" onClick={(e) => e.stopPropagation()}>
                    <textarea
                        placeholder={`Tell us about your experience with this ${role === 'CUSTOMER' ? 'worker' : 'customer'}...`}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className={`w-full max-w-lg p-4 rounded-[1.5rem] border outline-none transition-all text-sm
              bg-white dark:bg-dark-900 border-gray-100 dark:border-dark-700 text-gray-900 dark:text-white focus:border-brand-500 shadow-sm dark:shadow-none
              `}
                        rows={3}
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="primary"
                            className="rounded-xl px-10 h-11"
                            onClick={handleSubmit}
                            loading={isSubmitting}
                            icon={Send}
                        >
                            Submit Rating
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400"
                            onClick={() => setShowComment(false)}
                            icon={X}
                        >
                            Dismiss
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

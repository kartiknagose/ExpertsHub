import { Star, Phone, Mail, User } from 'lucide-react';
import { resolveProfilePhotoUrl } from '../../../utils/profilePhoto';

/**
 * UserMiniProfile Component
 * Used to introduce Customer to Worker and vice-versa in the Booking context.
 * 
 * @param {object} user - The user object (customer or worker.user)
 * @param {string} label - e.g., "Assigned Worker" or "Customer"
 * @param {boolean} showContact - Whether to show mobile/email
 */
export function UserMiniProfile({ user, label, showContact = false, onClick }) {
    if (!user) return null;

    const profilePhotoUrl = resolveProfilePhotoUrl(user.profilePhotoUrl);
    const profileInitial = (user.name || 'U').slice(0, 1).toUpperCase();
    const rating = Number(user.rating || 0).toFixed(1);
    const totalReviews = user.totalReviews || 0;

    return (
        <div
            onClick={onClick}
            className={`p-3 rounded-xl border transition-all ${onClick ? 'cursor-pointer' : ''} bg-gray-50/30 dark:bg-dark-800/30 border-gray-100 dark:border-dark-700/50 hover:border-brand-200 dark:hover:border-brand-500/30
                `}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="shrink-0">
                        {profilePhotoUrl ? (
                            <img
                                src={profilePhotoUrl}
                                alt={user.name}
                                className="w-10 h-10 rounded-lg object-cover border border-brand-500/10"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-base font-bold shadow-sm">
                                {profileInitial}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 text-gray-400 dark:text-gray-500">
                            {label}
                        </p>
                        <h4 className="font-bold text-sm truncate leading-tight text-gray-900 dark:text-gray-100">
                            {user.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Star size={10} className="fill-yellow-400 text-yellow-400 shrink-0" />
                            <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">
                                {rating}
                            </span>
                            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-550">
                                ({totalReviews})
                            </span>
                        </div>
                    </div>
                </div>

                {showContact && (
                    <div className="flex items-center gap-2 pr-1">
                        <a
                            href={`tel:${user.mobile}`}
                            title={`Call ${user.name}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/50"
                        >
                            <Phone size={14} />
                        </a>
                        <a
                            href={`mailto:${user.email}`}
                            title={`Email ${user.name}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 hover:bg-accent-100 dark:hover:bg-accent-900/50"
                        >
                            <Mail size={14} />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

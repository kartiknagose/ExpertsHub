import { Star, Phone, Mail, User } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { resolveProfilePhotoUrl } from '../../../utils/profilePhoto';

/**
 * UserMiniProfile Component
 * Used to introduce Customer to Worker and vice-versa in the Booking context.
 * 
 * @param {object} user - The user object (customer or worker.user)
 * @param {string} label - e.g., "Assigned Worker" or "Customer"
 * @param {boolean} showContact - Whether to show mobile/email
 */
export function UserMiniProfile({ user, label, showContact = false }) {
    const { isDark } = useTheme();

    if (!user) return null;

    const profilePhotoUrl = resolveProfilePhotoUrl(user.profilePhotoUrl);
    const profileInitial = (user.name || 'U').slice(0, 1).toUpperCase();
    const rating = Number(user.rating || 0).toFixed(1);
    const totalReviews = user.totalReviews || 0;

    return (
        <div className={`p-4 rounded-xl border transition-all ${isDark ? 'bg-dark-800/50 border-dark-700' : 'bg-gray-50/50 border-gray-100'
            }`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                {label}
            </p>

            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="shrink-0">
                    {profilePhotoUrl ? (
                        <img
                            src={profilePhotoUrl}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-brand-500/20"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-lg font-bold">
                            {profileInitial}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h4 className={`font-bold truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        {user.name}
                    </h4>

                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                {rating}
                            </span>
                        </div>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            ({totalReviews} reviews)
                        </span>
                    </div>

                    {showContact && (
                        <div className="mt-3 space-y-1.5 border-t border-inherit pt-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Phone size={14} className="text-brand-500" />
                                <a
                                    href={`tel:${user.mobile}`}
                                    className={`hover:underline ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                                >
                                    {user.mobile || 'No mobile'}
                                </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Mail size={14} className="text-accent-500" />
                                <a
                                    href={`mailto:${user.email}`}
                                    className={`hover:underline truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                                >
                                    {user.email}
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

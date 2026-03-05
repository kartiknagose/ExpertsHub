import { User, Phone, Mail, MessageCircle } from 'lucide-react';
import { Card, Button, Badge } from '../../../components/common';
import { resolveProfilePhotoUrl } from '../../../utils/profilePhoto';
import { ChatToggle } from '../../../components/features/chat/ChatWindow';

export function WorkerContactSidebar({ booking, isOnline, toggleOnline, isUpdating }) {
    return (
        <Card className="border-none ring-1 ring-black/5 dark:ring-white/10 shadow-xl overflow-hidden sticky top-8">
            <div className="p-3 border-b bg-gray-50 border-gray-100 dark:bg-dark-900/50 dark:border-dark-700">
                <h3 className="text-2xs font-black uppercase tracking-widest text-gray-400 text-center flex items-center justify-center gap-2">
                    <User size={12} /> Contact Client
                </h3>
            </div>
            <div className="p-5">
                {/* Customer Profile */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative mb-3">
                        {booking.customer?.profilePhotoUrl ? (
                            <img
                                src={resolveProfilePhotoUrl(booking.customer.profilePhotoUrl)}
                                alt=""
                                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-brand-500/10 shadow-lg"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 text-2xl font-black shadow-inner">
                                {booking.customer?.name?.charAt(0) || '?'}
                            </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-success-500 border-4 border-white dark:border-dark-800 w-6 h-6 rounded-full" />
                    </div>
                    <h4 className="text-lg font-black text-gray-900 dark:text-white">{booking.customer?.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-2xs">
                            ★ {booking.customer?.rating || '0.0'}
                        </Badge>
                        <span className="text-2xs font-bold text-gray-400 uppercase">({booking.customer?.totalReviews || 0} Reviews)</span>
                    </div>
                </div>

                {/* Tracking Status */}
                <div className={`mb-6 p-4 rounded-2xl border ${isOnline ? 'bg-success-50/50 border-success-100 dark:bg-success-950/10 dark:border-success-900/30' : 'bg-gray-50 border-gray-100 dark:bg-dark-900/50 dark:border-dark-700'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Tracking</span>
                        <Badge variant={isOnline ? "success" : "secondary"} className="text-[9px] font-black uppercase">
                            {isOnline ? 'Active' : 'Paused'}
                        </Badge>
                    </div>
                    <Button
                        fullWidth
                        size="sm"
                        variant={isOnline ? "outline" : "primary"}
                        onClick={toggleOnline}
                        loading={isUpdating}
                        className="h-10 rounded-xl font-bold text-xs"
                    >
                        {isOnline ? 'Stop Tracking' : 'Share Location'}
                    </Button>
                    {isOnline && (
                        <p className="text-[10px] text-center mt-2 text-success-600 font-bold animate-pulse">
                            You are visible to the customer
                        </p>
                    )}
                </div>

                {/* Contact Actions */}
                {['CONFIRMED', 'IN_PROGRESS'].includes(booking.status) ? (
                    <div className="space-y-4">
                        <div className="p-3 rounded-xl border bg-gray-50 border-gray-100 dark:bg-dark-900/30 dark:border-dark-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Phone size={14} className="text-brand-500" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                    {booking.customer?.mobile}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={14} className="text-brand-500" />
                                <span className="text-xs font-bold truncate text-gray-700 dark:text-gray-300">
                                    {booking.customer?.email}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                size="sm"
                                variant="primary"
                                icon={Phone}
                                className="rounded-xl font-bold h-10"
                                onClick={() => window.location.href = `tel:${booking.customer.mobile}`}
                            >
                                Call
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                icon={MessageCircle}
                                className="rounded-xl font-bold h-10"
                                onClick={() => window.location.href = `sms:${booking.customer.mobile}`}
                            >
                                SMS
                            </Button>
                        </div>
                        <Button
                            fullWidth
                            variant="ghost"
                            size="sm"
                            icon={Mail}
                            className="h-10 rounded-xl font-bold text-gray-500"
                            onClick={() => window.location.href = `mailto:${booking.customer.email}`}
                        >
                            Email Client
                        </Button>
                        <ChatToggle bookingId={booking.id} label="Chat with Customer" />
                    </div>
                ) : (
                    <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-dark-900/50 border border-dashed border-gray-200 dark:border-dark-700">
                        <p className="text-2xs font-black text-gray-400 uppercase mb-1">Contact Hidden</p>
                        <p className="text-2xs leading-tight text-gray-500">Confirm the job to see client contact details.</p>
                    </div>
                )}
            </div>
        </Card>
    );
}

import { ShieldAlert, Info } from 'lucide-react';

export function CustomerOTPSection({ booking }) {
    const hasOtp = (booking.status === 'CONFIRMED' && booking.startOtp) || (booking.status === 'IN_PROGRESS' && booking.completionOtp);
    const isStart = booking.status === 'CONFIRMED';

    return (
        <section>
            <h3 className="text-xs font-black uppercase tracking-widest mb-3 text-gray-400 dark:text-gray-500">
                Security Verification
            </h3>
            {hasOtp ? (
                <div className={`relative px-5 py-6 rounded-2xl border flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-500 ${isStart ? 'bg-white border-brand-200 shadow-xl dark:bg-brand-950/30 dark:border-brand-800 dark:shadow-lg dark:shadow-brand-500/10' : 'bg-white border-success-200 shadow-xl dark:bg-success-950/30 dark:border-success-800 dark:shadow-lg dark:shadow-green-500/10'}`}>
                    <div className="relative z-10 w-full">
                        <p className={`text-2xs font-black uppercase tracking-[0.2em] mb-2 ${isStart ? 'text-brand-500' : 'text-green-500'}`}>
                            {isStart ? 'Share to Start Job' : 'Share to Complete Job'}
                        </p>
                        <div className="relative inline-block group">
                            <p className="text-5xl font-black tracking-[0.2em] font-mono py-2 text-gray-900 group-hover:text-brand-600 dark:text-white">
                                {isStart ? booking.startOtp : booking.completionOtp}
                            </p>
                            <div className={`h-1.5 w-full rounded-full transition-all duration-500 opacity-20 ${isStart ? 'bg-brand-500' : 'bg-green-500'}`} />
                        </div>
                        <p className="text-2xs text-gray-500 mt-4 font-bold flex items-center justify-center gap-1.5">
                            <ShieldAlert size={12} className={isStart ? 'text-brand-500' : 'text-green-500'} />
                            Only share with the assigned professional
                        </p>
                    </div>
                    <ShieldAlert className={`absolute -right-6 -top-6 w-32 h-32 opacity-5 ${isStart ? 'text-brand-500' : 'text-green-500'}`} />
                </div>
            ) : (
                <div className="p-8 rounded-2xl border border-dashed text-center flex flex-col items-center gap-2 bg-gray-50/50 border-gray-100 dark:bg-dark-800/20 dark:border-dark-700">
                    <Info className="text-gray-300" size={24} />
                    <p className="text-xs font-semibold text-gray-400">Security codes will appear here once ready.</p>
                </div>
            )}
        </section>
    );
}

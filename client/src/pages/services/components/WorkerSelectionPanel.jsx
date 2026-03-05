import { User, Target, FileText, Zap, Search, CheckCircle2, Star, MessageSquare } from 'lucide-react';
import { Input, Badge } from '../../../components/common';
import { resolveProfilePhotoUrl } from '../../../utils/profilePhoto';
import { toast } from 'sonner';

const bookingModes = [
  {
    id: 'DIRECT',
    title: 'Direct Worker Booking',
    description: 'Pick a worker and request a slot. The worker confirms.',
    icon: User,
    enabled: true,
  },
  {
    id: 'AUTO_ASSIGN',
    title: 'Service-First (Open Booking)',
    description: 'We broadcast your job to nearby workers.',
    icon: Target,
    enabled: true,
  },
  {
    id: 'BIDS',
    title: 'Request + Bids',
    description: 'Post a job and compare worker quotes.',
    icon: FileText,
    enabled: false,
  },
  {
    id: 'INSTANT',
    title: 'Instant / On-Demand',
    description: 'Get the nearest available worker now.',
    icon: Zap,
    enabled: false,
  },
];

export { bookingModes };

export function WorkerSelectionPanel({
  service,
  bookingMode,
  setBookingMode,
  workers,
  workersLoading,
  filteredWorkers,
  workerSearch,
  setWorkerSearch,
  selectedWorkerId,
  onQuickPick,
  onOpenWorkerProfile,
}) {
  return (
    <>
      {/* Step 1: Booking Mode */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-600 text-white text-sm">1</span>
          Choose Your Preference
        </h3>

        <div className="p-1.5 rounded-2xl flex gap-1 bg-white border border-gray-200 shadow-sm dark:bg-dark-800 dark:border-transparent dark:shadow-none">
          {bookingModes.filter(m => m.enabled).map((mode) => {
            const isActive = bookingMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setBookingMode(mode.id)}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 py-4 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
              >
                <mode.icon size={20} className={isActive ? 'text-brand-100' : ''} />
                <span className="text-base font-semibold">{mode.title}</span>
                {isActive && <CheckCircle2 size={18} className="text-white hidden sm:block" fill="currentColor" />}
              </button>
            );
          })}
        </div>

        {/* Contextual Helper Text */}
        <div className="pl-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {bookingMode === 'DIRECT'
              ? "Browse profiles and pick the specific professional you want."
              : "We'll broadcast your request to all nearby pros. The first one to accept gets the job."}
          </p>
        </div>
      </div>

      {/* Auto-Assign View */}
      {bookingMode === 'AUTO_ASSIGN' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative overflow-hidden rounded-3xl p-8 border bg-brand-50 border-brand-100 dark:bg-brand-900/10 dark:border-brand-500/20">
            <div className="relative z-10 flex flex-col sm:flex-row items-center text-center sm:text-left gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-dark-800 shadow-lg flex items-center justify-center shrink-0">
                <Zap size={40} className="text-brand-500" fill="currentColor" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Smart Match Technology</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  Get the fastest service! We notify top-rated {service.name} experts near you instantly.
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Badge variant="success" className="bg-green-100 text-green-700 border-green-200">Avg. 5 min response</Badge>
                  <Badge variant="info" className="bg-blue-100 text-blue-700 border-blue-200">Verified Pros Only</Badge>
                </div>
              </div>
            </div>
            {/* Decor */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      )}

      {/* Direct Selection View */}
      {bookingMode === 'DIRECT' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-600 text-white text-sm">2</span>
              Select Verified Pro
            </h3>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Input
                type="text"
                placeholder="Search by name..."
                value={workerSearch}
                onChange={(e) => setWorkerSearch(e.target.value)}
                icon={Search}
              />
            </div>
          </div>

          {workersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 rounded-2xl animate-pulse bg-gray-100 dark:bg-dark-800"></div>
              ))}
            </div>
          ) : filteredWorkers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWorkers.map((worker) => {
                const isSelected = String(worker.id) === String(selectedWorkerId);
                return (
                  <div
                    key={worker.id}
                    onClick={() => onQuickPick(worker.id)}
                    className={`relative cursor-pointer group rounded-2xl border p-5 transition-all duration-300 ${isSelected
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-2 ring-brand-500 shadow-xl shadow-brand-500/10 scale-[1.02]'
                      : 'border-gray-200 bg-white hover:border-brand-200 hover:shadow-lg dark:border-dark-700 dark:bg-dark-800 dark:hover:border-dark-600'
                      }`}
                  >
                    <div className="flex gap-4">
                      <div className="relative shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-dark-700 bg-cover bg-center shadow-md overflow-hidden flex items-center justify-center"
                          style={{ backgroundImage: worker.user?.profilePhotoUrl ? `url(${resolveProfilePhotoUrl(worker.user.profilePhotoUrl)})` : undefined }}
                        >
                          {!worker.user?.profilePhotoUrl && <User className="w-8 h-8 text-gray-400" />}
                        </div>
                        {worker.isVerified && (
                          <div className="absolute -bottom-2 -right-2 bg-white dark:bg-dark-800 rounded-full p-0.5 shadow-sm">
                            <div className="bg-blue-500 text-white p-0.5 rounded-full">
                              <CheckCircle2 size={12} strokeWidth={3} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold truncate text-base text-gray-900 dark:text-gray-100">
                              {worker.user?.name || 'UrbanPro Worker'}
                            </h4>
                            <span className="font-bold text-lg leading-none text-gray-900 dark:text-white">
                              ₹{worker.hourlyRate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center text-yellow-500 gap-0.5">
                              <Star size={12} fill="currentColor" />
                              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{worker.rating?.toFixed(1) || 'N/A'}</span>
                            </div>
                            <span className="text-xs text-gray-400">• {worker.totalReviews} jobs</span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenWorkerProfile(worker.id);
                            }}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm dark:bg-dark-700 dark:text-gray-100 dark:hover:bg-dark-600 dark:border-dark-600 dark:shadow-lg"
                          >
                            <User size={14} className="text-brand-500" />
                            Profile
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(`Direct chat with ${worker.user?.name} becomes available once you secure your booking slot.`);
                            }}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm dark:bg-dark-700 dark:text-gray-100 dark:hover:bg-dark-600 dark:border-dark-600 dark:shadow-lg"
                          >
                            <MessageSquare size={14} className="text-brand-500" />
                            Chat
                          </button>
                          <button
                            type="button"
                            className={`col-span-2 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg ${isSelected
                              ? 'bg-brand-600 text-white ring-2 ring-brand-500/20'
                              : 'bg-brand-50 text-brand-700 border border-brand-100 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30 dark:hover:bg-brand-500/20'
                              }`}
                          >
                            {isSelected ? (
                              <span className="flex items-center justify-center gap-2">
                                <CheckCircle2 size={14} /> Selected for Hire
                              </span>
                            ) : (
                              'Choose This Expert'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 rounded-3xl border border-dashed border-gray-200 bg-gray-50 dark:border-dark-700 dark:bg-dark-800/50">
              <Search className="mx-auto text-gray-400 mb-4" size={48} />
              <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">No workers found</h4>
              <p className="text-gray-500">Try changing your search terms</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

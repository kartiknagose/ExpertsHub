import { useState } from "react";
import { Search, CheckCircle2, Star, MessageSquare, User, ShieldCheck, Filter } from "lucide-react";
import { Input, Badge } from "../../../components/common";
import { resolveProfilePhotoUrl } from "../../../utils/profilePhoto";
import { toast } from "sonner";
import { bookingModes } from "./bookingModes";

const getVerificationLevelVariant = (level) => {
  switch (level) {
    case "VERIFIED":
      return "success";
    case "PREMIUM":
      return "warning";
    case "DOCUMENTS":
      return "default";
    case "BASIC":
      return "secondary";
    default:
      return "secondary";
  }
};

const VERIFICATION_FILTERS = [
  { id: "ALL", label: "All Workers", icon: null },
  { id: "PREMIUM", label: "Premium", icon: ShieldCheck },
  { id: "VERIFIED", label: "Verified", icon: CheckCircle2 },
  { id: "DOCUMENTS", label: "Docs Submitted", icon: null },
  { id: "BASIC", label: "Basic", icon: null },
];

export function WorkerSelectionPanel({
  bookingMode,
  setBookingMode,
  workersLoading,
  filteredWorkers,
  selectedWorkerId,
  onQuickPick,
  onOpenWorkerProfile,
}) {
  const [verificationFilter, setVerificationFilter] = useState("ALL");

  // Apply the verification filter
  const displayWorkers = filteredWorkers
    ? filteredWorkers.filter(
      (worker) =>
        verificationFilter === "ALL" ||
        worker.verificationLevel === verificationFilter
    )
    : [];

  return (
    <>
      {/* Step 1: Booking Mode */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-600 text-white text-sm">
            1
          </span>
          Choose Your Preference
        </h3>

        <div className="p-1.5 rounded-2xl flex gap-1 bg-white border">
          {bookingModes
            .filter((m) => m.enabled)
            .map((mode) => {
              const isActive = bookingMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => setBookingMode(mode.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-xl transition ${isActive
                      ? "bg-brand-600 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                    }`}
                >
                  <mode.icon size={20} />
                  <span>{mode.title}</span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Verification Level Filter */}
      <div className="mt-5">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter by Verification</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {VERIFICATION_FILTERS.map((filter) => {
            const isActive = verificationFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setVerificationFilter(filter.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${isActive
                    ? "bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-500/20"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:bg-brand-50 dark:bg-dark-800 dark:text-gray-300 dark:border-dark-600 dark:hover:border-brand-700"
                  }`}
              >
                {filter.icon && <filter.icon size={13} />}
                {filter.label}
                {isActive && verificationFilter !== "ALL" && (
                  <span className="ml-1 bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {displayWorkers.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Worker Cards */}
      <div className="mt-6">
        {workersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-40 rounded-2xl animate-pulse bg-gray-100"
              ></div>
            ))}
          </div>
        ) : displayWorkers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayWorkers.map((worker) => {
              const isSelected =
                String(worker.id) === String(selectedWorkerId);

              return (
                <div
                  key={worker.id}
                  onClick={() => onQuickPick(worker.id)}
                  className={`relative cursor-pointer rounded-2xl border p-5 transition ${isSelected
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 bg-white hover:shadow-lg"
                    }`}
                >
                  <div className="flex gap-4">
                    <div className="relative">
                      <div
                        className="w-16 h-16 rounded-2xl bg-gray-200 bg-cover bg-center flex items-center justify-center"
                        style={{
                          backgroundImage: worker.user?.profilePhotoUrl
                            ? `url(${resolveProfilePhotoUrl(
                              worker.user.profilePhotoUrl
                            )})`
                            : undefined,
                        }}
                      >
                        {!worker.user?.profilePhotoUrl && (
                          <User className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      {worker.verificationLevel && (
                        <div className="absolute -bottom-2 -right-2">
                          <Badge
                            variant={getVerificationLevelVariant(
                              worker.verificationLevel
                            )}
                          >
                            <ShieldCheck size={12} />{" "}
                            {worker.verificationLevel}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-bold">
                          {worker.user?.name || "Worker"}
                        </h4>

                        <span className="font-bold">
                          ₹{worker.hourlyRate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <Star size={12} fill="currentColor" />
                        <span>
                          {worker.rating?.toFixed(1) || "N/A"}
                        </span>
                        <span className="text-xs text-gray-400">
                          • {worker.totalReviews} jobs
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenWorkerProfile(worker.id);
                          }}
                          className="border rounded-xl py-2 text-xs"
                        >
                          Profile
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info(
                              `Chat with ${worker.user?.name} after booking`
                            );
                          }}
                          className="border rounded-xl py-2 text-xs"
                        >
                          <MessageSquare size={14} />
                          Chat
                        </button>

                        <button
                          type="button"
                          className={`col-span-2 py-3 rounded-xl text-xs ${isSelected
                              ? "bg-brand-600 text-white"
                              : "bg-brand-50 text-brand-700"
                            }`}
                        >
                          {isSelected
                            ? "Selected for Hire"
                            : "Choose This Expert"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="mx-auto text-gray-400 mb-4" size={48} />
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">
              {verificationFilter !== "ALL"
                ? `No ${verificationFilter.toLowerCase()} workers found`
                : "No workers found"
              }
            </h4>
            {verificationFilter !== "ALL" && (
              <button
                onClick={() => setVerificationFilter("ALL")}
                className="mt-3 text-sm text-brand-600 hover:underline"
              >
                Clear filter to see all workers
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
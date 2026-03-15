// WorkerAvailabilityPage - Premium scheduling interface

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, PlusCircle, Trash2 } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { MainLayout } from '../../components/layout/MainLayout';
import { Card, Button, AsyncState } from '../../components/common';
import { createAvailability, deleteAvailability, getMyAvailability } from '../../api/availability';
import { getPageLayout } from '../../constants/layout';
import { queryKeys } from '../../utils/queryKeys';
import { usePageTitle } from '../../hooks/usePageTitle';

const rawDayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function WorkerAvailabilityPage() {
  const { t } = useTranslation();
  usePageTitle(t('Availability'));
  const dayLabels = useMemo(() => rawDayLabels.map(day => t(day)), [t]);
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    dayOfWeek: String(new Date().getDay()),
    startTime: '09:00',
    endTime: '17:00',
  });
  const [formError, setFormError] = useState('');

  const availabilityQuery = useQuery({
    queryKey: queryKeys.worker.availability(),
    queryFn: getMyAvailability,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createAvailability(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.worker.availability() });
      setFormError('');
      // Reset time but keep day for easier multiple entries
      setFormState(prev => ({ ...prev, startTime: '09:00', endTime: '17:00' }));
    },
    onError: (err) => {
      setFormError(err.response?.data?.error || err.message || t('Failed to add availability.'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (availabilityId) => deleteAvailability(availabilityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.worker.availability() });
    },
  });

  const availability = useMemo(() => availabilityQuery.data?.availability || [], [availabilityQuery.data?.availability]);

  const grouped = useMemo(() => {
    const initial = dayLabels.map(() => []);
    availability.forEach((slot) => {
      initial[slot.dayOfWeek]?.push(slot);
    });
    return initial;
  }, [availability, dayLabels]);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError('');

    if (formState.startTime >= formState.endTime) {
      setFormError(t('End time must be after start time.'));
      return;
    }

    createMutation.mutate({
      dayOfWeek: Number(formState.dayOfWeek),
      startTime: formState.startTime,
      endTime: formState.endTime,
    });
  };

  return (
    <MainLayout>
      <div className={getPageLayout('default')}>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <Motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-xs font-black uppercase tracking-widest text-brand-500 mb-2 block">{t('Scheduling')}</span>
            <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
              {t('Availability')}
            </h1>
          </Motion.div>
          <Motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <p className="text-neutral-500 font-medium">{t('Define your working hours so customers know when they can book you.')}</p>
          </Motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8">
          
          <Motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="sticky top-24 border border-neutral-200 dark:border-dark-700">
              <div className="px-5 py-4 border-b border-neutral-200 dark:border-dark-700">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{t('Add Time Slot')}</h3>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">{t('Configure a new active window')}</p>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 block mb-2.5">{t('Day of Week')}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {dayLabels.map((label, index) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => handleChange('dayOfWeek', String(index))}
                        className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                          formState.dayOfWeek === String(index)
                            ? 'bg-brand-500 text-white'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-dark-700 dark:text-neutral-300 dark:hover:bg-dark-600'
                        }`}
                      >
                        {label.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 block mb-2">{t('Start Time')}</label>
                    <input
                      type="time"
                      step="900"
                      value={formState.startTime}
                      onChange={(event) => handleChange('startTime', event.target.value)}
                      className="w-full h-10 px-3 text-sm font-semibold rounded-lg border border-neutral-200 bg-white text-neutral-900 [font-variant-numeric:tabular-nums] dark:border-dark-700 dark:bg-dark-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 block mb-2">{t('End Time')}</label>
                    <input
                      type="time"
                      step="900"
                      value={formState.endTime}
                      onChange={(event) => handleChange('endTime', event.target.value)}
                      className="w-full h-10 px-3 text-sm font-semibold rounded-lg border border-neutral-200 bg-white text-neutral-900 [font-variant-numeric:tabular-nums] dark:border-dark-700 dark:bg-dark-800 dark:text-white"
                    />
                  </div>
                </div>

                {formError && (
                  <div className="px-3 py-2 rounded-lg bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/30 text-error-700 dark:text-error-200 text-xs font-medium">
                    {formError}
                  </div>
                )}

                <Button
                  type="submit"
                  fullWidth
                  icon={PlusCircle}
                  loading={createMutation.isPending}
                  className="h-10 rounded-lg"
                >
                  {t('Add Slot')}
                </Button>
              </form>
            </Card>
          </Motion.div>

          <Motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="h-full border-neutral-200 dark:border-dark-700 flex flex-col">
              <div className="p-6 border-b border-neutral-100 dark:border-dark-700">
                <h3 className="text-xl font-black text-neutral-900 dark:text-white">{t('Your Weekly Schedule')}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('Current availability configuration')}</p>
              </div>

              <AsyncState
                isLoading={availabilityQuery.isLoading}
                isError={availabilityQuery.isError}
                error={availabilityQuery.error}
                isEmpty={!availabilityQuery.isLoading && !availabilityQuery.isError && availability.length === 0}
                emptyTitle={t("No schedule defined")}
                emptyMessage={t("You currently have no available time slots. Add slots to start receiving bookings.")}
              >
                <div className="p-6 flex-1 space-y-6">
                  {grouped.map((slots, index) => (
                    <div key={dayLabels[index]} className="flex flex-col md:flex-row md:items-start gap-4 pb-6 border-b border-neutral-100 dark:border-dark-700 last:border-0 last:pb-0">
                      
                      <div className="w-32 shrink-0 pt-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-black text-sm uppercase tracking-wide ${slots.length > 0 ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
                            {dayLabels[index]}
                          </span>
                        </div>
                        {slots.length > 0 && (
                          <div className="mt-1">
                            <span className="text-[10px] uppercase font-black tracking-widest text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full">
                              {slots.length} {slots.length === 1 ? t('SLOT') : t('SLOTS')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        {slots.length === 0 ? (
                          <div className="h-10 flex items-center px-4 rounded-xl bg-neutral-50 dark:bg-dark-800 border border-neutral-100 dark:border-dark-700/50 text-neutral-400 text-sm font-medium italic">
                            {t('Unavailable')}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2.5">
                            {slots.map((slot) => (
                              <Motion.div 
                                key={slot.id} 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group flex items-center gap-2 rounded-xl border border-success-200 dark:border-success-500/30 bg-success-50 dark:bg-success-950/20 px-3 py-1.5 shadow-sm hover:shadow-md transition-all"
                              >
                                <Clock size={14} className="text-success-600 dark:text-success-400" />
                                <span className="text-sm font-bold text-success-900 dark:text-success-100">
                                  {slot.startTime} <span className="text-success-500 mx-1">→</span> {slot.endTime}
                               </span>
                                <button
                                  type="button"
                                  onClick={() => deleteMutation.mutate(slot.id)}
                                  disabled={deleteMutation.isPending}
                                  className="ml-2 w-6 h-6 rounded-md flex items-center justify-center text-success-600 bg-white dark:bg-dark-800 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/20 dark:hover:text-error-400 transition-colors focus:outline-none focus:ring-2 focus:ring-error-500/50"
                                >
                                  <Trash2 size={12} strokeWidth={2.5} />
                                </button>
                              </Motion.div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </AsyncState>
            </Card>
          </Motion.div>

        </div>
      </div>
    </MainLayout>
  );
}

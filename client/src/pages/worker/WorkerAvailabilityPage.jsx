import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, PlusCircle, Trash2 } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Button, Spinner, Badge } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { createAvailability, deleteAvailability, getMyAvailability } from '../../api/availability';

const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function WorkerAvailabilityPage() {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    dayOfWeek: '1',
    startTime: '09:00',
    endTime: '17:00',
  });

  const availabilityQuery = useQuery({
    queryKey: ['availability'],
    queryFn: getMyAvailability,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createAvailability(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (availabilityId) => deleteAvailability(availabilityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });

  const availability = availabilityQuery.data?.availability || [];

  const grouped = useMemo(() => {
    const initial = dayLabels.map(() => []);
    availability.forEach((slot) => {
      initial[slot.dayOfWeek]?.push(slot);
    });
    return initial;
  }, [availability]);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    createMutation.mutate({
      dayOfWeek: Number(formState.dayOfWeek),
      startTime: formState.startTime,
      endTime: formState.endTime,
    });
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Availability
          </h1>
          <p className={isDark ? 'text-gray-400 mt-2' : 'text-gray-600 mt-2'}>
            Add time slots so customers know when you are available.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Availability</CardTitle>
              <CardDescription>Keep your schedule up to date.</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
              <div>
                <label className={isDark ? 'block text-sm font-medium text-gray-200 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                  Day of Week
                </label>
                <select
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-dark-800 border-dark-600 text-gray-100 focus:border-brand-500 focus:ring-brand-500/50'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-brand-600 focus:ring-brand-600/50'
                  }`}
                  value={formState.dayOfWeek}
                  onChange={(event) => handleChange('dayOfWeek', event.target.value)}
                >
                  {dayLabels.map((label, index) => (
                    <option key={label} value={index}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={isDark ? 'block text-sm font-medium text-gray-200 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                  Start Time
                </label>
                <input
                  type="time"
                  value={formState.startTime}
                  onChange={(event) => handleChange('startTime', event.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-dark-800 border-dark-600 text-gray-100 focus:border-brand-500 focus:ring-brand-500/50'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-brand-600 focus:ring-brand-600/50'
                  }`}
                />
              </div>

              <div>
                <label className={isDark ? 'block text-sm font-medium text-gray-200 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                  End Time
                </label>
                <input
                  type="time"
                  value={formState.endTime}
                  onChange={(event) => handleChange('endTime', event.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-dark-800 border-dark-600 text-gray-100 focus:border-brand-500 focus:ring-brand-500/50'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-brand-600 focus:ring-brand-600/50'
                  }`}
                />
              </div>

              {createMutation.isError && (
                <p className="text-sm text-error-500">
                  {createMutation.error?.response?.data?.error || createMutation.error?.message || 'Failed to add availability.'}
                </p>
              )}

              <Button
                type="submit"
                fullWidth
                icon={PlusCircle}
                loading={createMutation.isPending}
              >
                Add Slot
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Weekly Schedule</CardTitle>
              <CardDescription>Manage active availability slots.</CardDescription>
            </CardHeader>

            {availabilityQuery.isLoading && (
              <div className="flex items-center justify-center py-16">
                <Spinner size="lg" />
              </div>
            )}

            {availabilityQuery.isError && (
              <div className="px-6 pb-6">
                <p className="text-sm text-error-500">
                  {availabilityQuery.error?.response?.data?.error || availabilityQuery.error?.message || 'Failed to load availability.'}
                </p>
              </div>
            )}

            {!availabilityQuery.isLoading && !availabilityQuery.isError && availability.length === 0 && (
              <div className="px-6 pb-6">
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  No availability added yet.
                </p>
              </div>
            )}

            {!availabilityQuery.isLoading && !availabilityQuery.isError && availability.length > 0 && (
              <div className="space-y-5 px-6 pb-6">
                {grouped.map((slots, index) => (
                  <div key={dayLabels[index]}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-brand-500" />
                      <span className={isDark ? 'text-gray-200 font-medium' : 'text-gray-800 font-medium'}>
                        {dayLabels[index]}
                      </span>
                      <Badge variant={slots.length > 0 ? 'info' : 'default'}>
                        {slots.length} slot{slots.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    {slots.length === 0 && (
                      <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                        No slots for this day.
                      </p>
                    )}

                    {slots.length > 0 && (
                      <div className="space-y-2">
                        {slots.map((slot) => (
                          <div key={slot.id} className="flex items-center justify-between rounded-lg border px-4 py-2">
                            <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              icon={Trash2}
                              loading={deleteMutation.isPending}
                              onClick={() => deleteMutation.mutate(slot.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

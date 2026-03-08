import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, PlusCircle, Trash2 } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Button, Badge, AsyncState, PageHeader, Select, Input } from '../../components/common';
import { createAvailability, deleteAvailability, getMyAvailability } from '../../api/availability';
import { getPageLayout } from '../../constants/layout';
import { queryKeys } from '../../utils/queryKeys';
import { usePageTitle } from '../../hooks/usePageTitle';

const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function WorkerAvailabilityPage() {
    usePageTitle('Availability');
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
  }, [availability]);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError('');

    if (formState.startTime >= formState.endTime) {
      setFormError('End time must be after start time.');
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
        <PageHeader
          title="Availability"
          subtitle="Add time slots so customers know when you are available."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Availability</CardTitle>
              <CardDescription>Keep your schedule up to date.</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
              <Select
                label="Day of Week"
                value={formState.dayOfWeek}
                onChange={(event) => handleChange('dayOfWeek', event.target.value)}
              >
                {dayLabels.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </Select>

              <Input
                type="time"
                label="Start Time"
                icon={Clock}
                value={formState.startTime}
                onChange={(event) => handleChange('startTime', event.target.value)}
              />

              <Input
                type="time"
                label="End Time"
                icon={Clock}
                value={formState.endTime}
                onChange={(event) => handleChange('endTime', event.target.value)}
              />

              {createMutation.isError && (
                <p className="text-sm text-error-500">
                  {createMutation.error?.response?.data?.error || createMutation.error?.message || 'Failed to add availability.'}
                </p>
              )}

              {formError && (
                <p className="text-sm text-error-500">
                  {formError}
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
            <AsyncState
              isLoading={availabilityQuery.isLoading}
              isError={availabilityQuery.isError}
              error={availabilityQuery.error}
              isEmpty={!availabilityQuery.isLoading && !availabilityQuery.isError && availability.length === 0}
              emptyTitle="No availability yet"
              emptyMessage="Add slots so customers know when you are available."
              errorFallback={
                <div className="px-6 pb-6">
                  <p className="text-sm text-error-500">
                    {availabilityQuery.error?.response?.data?.error || availabilityQuery.error?.message || 'Failed to load availability.'}
                  </p>
                </div>
              }
            >
              <div className="space-y-5 px-6 pb-6">
                {grouped.map((slots, index) => (
                  <div key={dayLabels[index]}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-brand-500" />
                      <span className="text-gray-800 dark:text-gray-200 font-medium">
                        {dayLabels[index]}
                      </span>
                      <Badge variant={slots.length > 0 ? 'info' : 'default'}>
                        {slots.length} slot{slots.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    {slots.length === 0 && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        No slots for this day.
                      </p>
                    )}

                    {slots.length > 0 && (
                      <div className="space-y-2">
                        {slots.map((slot) => (
                          <div key={slot.id} className="flex items-center justify-between rounded-lg border px-4 py-2">
                            <span className="text-gray-800 dark:text-gray-200">
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
            </AsyncState>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

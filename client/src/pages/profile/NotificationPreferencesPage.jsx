import { useState, useEffect } from 'react';
import { Bell, BellOff, Smartphone, Mail, MessageSquare, CreditCard, Star, Megaphone, Shield, Loader2 } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '../../components/common';
import { usePushNotification } from '../../hooks/usePushNotification';
import { getNotificationPreferences, updateNotificationPreferences } from '../../api/notifications';
import { useNotification } from '../../hooks/useNotification';
import { usePageTitle } from '../../hooks/usePageTitle';

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'bg-brand-600' : 'bg-gray-200 dark:bg-dark-600'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

const EVENT_SETTINGS = [
  { key: 'bookingUpdates', label: 'Booking Updates', description: 'New bookings, status changes, cancellations', icon: MessageSquare },
  { key: 'chatMessages', label: 'Chat Messages', description: 'New messages from customers or workers', icon: MessageSquare },
  { key: 'paymentAlerts', label: 'Payment Alerts', description: 'Payment confirmations and refunds', icon: CreditCard },
  { key: 'reviewAlerts', label: 'Review Alerts', description: 'New reviews and rating updates', icon: Star },
  { key: 'promotions', label: 'Promotions', description: 'Deals, discounts, and special offers', icon: Megaphone },
  { key: 'systemAlerts', label: 'System Alerts', description: 'Security alerts and important updates', icon: Shield },
];

export function NotificationPreferencesPage() {
  usePageTitle('Notification Preferences');
  const { showSuccess, showError } = useNotification();
  const { isSupported, permission, isSubscribed, isLoading: pushLoading, subscribe, unsubscribe } = usePushNotification();

  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNotificationPreferences()
      .then(setPreferences)
      .catch(() => showError('Failed to load notification preferences'))
      .finally(() => setLoading(false));
  }, [showError]);

  const handleToggle = async (key, value) => {
    const prev = { ...preferences };
    setPreferences((p) => ({ ...p, [key]: value }));

    setSaving(true);
    try {
      const updated = await updateNotificationPreferences({ [key]: value });
      setPreferences(updated);
    } catch {
      setPreferences(prev);
      showError('Failed to update preference');
    } finally {
      setSaving(false);
    }
  };

  const handlePushToggle = async () => {
    if (isSubscribed) {
      const ok = await unsubscribe();
      if (ok) showSuccess('Push notifications disabled');
      else showError('Failed to disable push notifications');
    } else {
      const ok = await subscribe();
      if (ok) showSuccess('Push notifications enabled!');
      else if (permission === 'denied') showError('Notifications blocked. Please enable them in your browser settings.');
      else showError('Failed to enable push notifications');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-brand-500" size={32} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Preferences</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Control how and when you receive notifications
          </p>
        </div>

        {/* Push Notification Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone size={20} />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Receive real-time push notifications on this device
            </CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            {!isSupported ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Push notifications are not supported in this browser.
              </p>
            ) : permission === 'denied' ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                <BellOff size={20} />
                <div>
                  <p className="text-sm font-medium">Notifications are blocked</p>
                  <p className="text-xs mt-0.5">Enable notifications in your browser settings to use this feature.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isSubscribed ? (
                    <Bell size={20} className="text-brand-500" />
                  ) : (
                    <BellOff size={20} className="text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {isSubscribed ? 'Push notifications are enabled' : 'Push notifications are disabled'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isSubscribed ? 'You will receive notifications on this device' : 'Enable to get real-time alerts'}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={isSubscribed ? 'ghost' : 'primary'}
                  onClick={handlePushToggle}
                  disabled={pushLoading}
                >
                  {pushLoading ? <Loader2 className="animate-spin" size={16} /> : isSubscribed ? 'Disable' : 'Enable'}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Channel Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>Choose which channels to receive notifications on</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Push</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Browser push notifications</p>
                </div>
              </div>
              <Toggle
                checked={preferences?.pushEnabled ?? true}
                onChange={(v) => handleToggle('pushEnabled', v)}
                disabled={saving}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">In-App</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Notifications within the app</p>
                </div>
              </div>
              <Toggle
                checked={preferences?.inAppEnabled ?? true}
                onChange={(v) => handleToggle('inAppEnabled', v)}
                disabled={saving}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email notifications (coming soon)</p>
                </div>
              </div>
              <Toggle
                checked={preferences?.emailEnabled ?? false}
                onChange={(v) => handleToggle('emailEnabled', v)}
                disabled={saving}
              />
            </div>
          </div>
        </Card>

        {/* Event Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Event Types</CardTitle>
            <CardDescription>Choose which events trigger notifications</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6 space-y-4">
            {EVENT_SETTINGS.map(({ key, label, description, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                  </div>
                </div>
                <Toggle
                  checked={preferences?.[key] ?? true}
                  onChange={(v) => handleToggle(key, v)}
                  disabled={saving}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

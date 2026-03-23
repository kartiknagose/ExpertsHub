import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff, Smartphone, Mail, MessageSquare, CreditCard, Star, Megaphone, Shield, Loader2 } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge } from '../../components/common';
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

export function NotificationPreferencesPage() {
  const { t } = useTranslation();
  usePageTitle(t('Notification Preferences'));
  const { showSuccess, showError } = useNotification();
  const { isSupported, permission, isSubscribed, isLoading: pushLoading, subscribe, unsubscribe } = usePushNotification();

  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  const EVENT_SETTINGS = [
    { key: 'bookingUpdates', label: t('Booking Updates'), description: t('New bookings, status changes, cancellations'), icon: MessageSquare },
    { key: 'chatMessages', label: t('Chat Messages'), description: t('New messages from customers or workers'), icon: MessageSquare },
    { key: 'paymentAlerts', label: t('Payment Alerts'), description: t('Payment confirmations and refunds'), icon: CreditCard },
    { key: 'reviewAlerts', label: t('Review Alerts'), description: t('New reviews and rating updates'), icon: Star },
    { key: 'promotions', label: t('Promotions'), description: t('Deals, discounts, and special offers'), icon: Megaphone },
    { key: 'systemAlerts', label: t('System Alerts'), description: t('Security alerts and important updates'), icon: Shield },
  ];

  useEffect(() => {
    let mounted = true;

    const loadPreferences = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const data = await getNotificationPreferences();
        if (!mounted) return;
        setPreferences(data);
      } catch {
        if (!mounted) return;
        setLoadError(t('Failed to load notification preferences'));
        showError(t('Failed to load notification preferences'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPreferences();
    return () => {
      mounted = false;
    };
  }, [showError, t]);

  const retryLoadPreferences = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await getNotificationPreferences();
      setPreferences(data);
    } catch {
      setLoadError(t('Failed to load notification preferences'));
      showError(t('Failed to load notification preferences'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key, value) => {
    const prev = { ...preferences };
    setPreferences((p) => ({ ...p, [key]: value }));

    setSaving(true);
    try {
      const updated = await updateNotificationPreferences({ [key]: value });
      setPreferences(updated);
    } catch {
      setPreferences(prev);
      showError(t('Failed to update preference'));
    } finally {
      setSaving(false);
    }
  };

  const handlePushToggle = async () => {
    if (isSubscribed) {
      const ok = await unsubscribe();
      if (ok) showSuccess(t('Push notifications disabled'));
      else showError(t('Failed to disable push notifications'));
    } else {
      const ok = await subscribe();
      if (ok) showSuccess(t('Push notifications enabled!'));
      else if (permission === 'denied') showError(t('Notifications blocked. Please enable them in your browser settings.'));
      else showError(t('Failed to enable push notifications'));
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

  if (loadError || !preferences) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Card className="p-8 rounded-3xl border border-error-200 bg-error-50 dark:border-error-500/30 dark:bg-error-500/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-error-700 dark:text-error-300">
                  {t('Unable to load preferences')}
                </h2>
                <p className="text-sm mt-1 text-error-600 dark:text-error-400">
                  {loadError || t('Please try again.')}
                </p>
              </div>
              <Button variant="outline" onClick={retryLoadPreferences}>
                {t('Retry')}
              </Button>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10 module-canvas module-canvas--utility">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{t('Notification Controls')}</h1>
          <p className="text-base text-gray-500 dark:text-gray-400 font-medium italic">
            {t('Fine-tune how your personal service hub communicates with you.')}
          </p>
        </header>

        {/* Push Notification Command Card */}
        <Card className="overflow-hidden border-none ring-1 ring-black/5 dark:ring-white/10 shadow-2xl">
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                  <span className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
                    <Smartphone size={22} />
                  </span>
                  {t('Push Notifications')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {t('Receive real-time mission updates on this device')}
                </p>
              </div>

              {!isSupported || permission === 'denied' ? null : (
                <Button
                  size="sm"
                  variant={isSubscribed ? 'ghost' : 'gradient'}
                  onClick={handlePushToggle}
                  disabled={pushLoading}
                  className="rounded-xl h-11 px-6 font-bold uppercase text-[10px] tracking-widest"
                >
                  {pushLoading ? <Loader2 className="animate-spin" size={16} /> : isSubscribed ? t('Disable') : t('Enable System')}
                </Button>
              )}
            </div>

            {!isSupported ? (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-800 text-gray-500 text-center border border-dashed border-gray-200 dark:border-dark-700">
                <p className="text-sm font-medium">
                  {t('Push notifications are not supported in this browser.')}
                </p>
              </div>
            ) : permission === 'denied' ? (
              <div className="relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-error-500/10 to-transparent animate-pulse" />
                <div className="relative flex items-center gap-5 p-5 shadow-inner rounded-[1.5rem] bg-error-50 dark:bg-error-500/5 border border-error-200/50 dark:border-error-500/20 text-error-700 dark:text-error-400 transition-all group-hover:bg-error-50/80 dark:group-hover:bg-error-500/10">
                  <div className="w-12 h-12 rounded-2xl bg-error-500/10 flex items-center justify-center shrink-0">
                    <BellOff size={24} className="animate-bounce-slow" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-bold tracking-tight">{t('Notifications are blocked')}</p>
                    <p className="text-sm font-medium opacity-80 leading-relaxed">
                      {t('To receive real-time job alerts, please enable notifications in your browser settings and refresh the page.')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-5 p-5 rounded-[1.5rem] bg-gray-50/50 dark:bg-dark-800/50 border border-gray-100 dark:border-dark-700">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isSubscribed ? 'bg-brand-500/10 text-brand-500' : 'bg-gray-200/50 dark:bg-dark-700 text-gray-400'}`}>
                  {isSubscribed ? <Bell size={24} /> : <BellOff size={24} />}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {isSubscribed ? t('Direct Link Established') : t('Interface Standby')}
                  </p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                    {isSubscribed ? t('You are currently receiving high-priority signals.') : t('Enable the toggle to start receiving real-time alerts.')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Channel Preferences Matrix */}
        <Card className="overflow-hidden border-none ring-1 ring-black/5 dark:ring-white/10 shadow-xl">
          <div className="p-8 space-y-8">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('Notification Channels')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('Configure the spectrum of communication channels')}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {[
                { label: t('Push'), description: t('Browser-level real-time signals'), icon: Smartphone, key: 'pushEnabled' },
                { label: t('In-App'), description: t('Strategic alerts within the interface'), icon: Bell, key: 'inAppEnabled' },
                { label: t('Email'), description: t('Detailed logs and reports (Coming Soon)'), icon: Mail, key: 'emailEnabled', soon: true },
              ].map((channel) => (
                <div key={channel.key} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-dark-800 flex items-center justify-center text-gray-400 group-hover:text-brand-500 transition-colors">
                      <channel.icon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{channel.label}</p>
                        {channel.soon && <Badge variant="outline" className="text-[8px] uppercase tracking-tighter px-1 opacity-50">{t('SOON')}</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{channel.description}</p>
                    </div>
                  </div>
                  <Toggle
                    checked={preferences?.[channel.key] ?? true}
                    onChange={(v) => handleToggle(channel.key, v)}
                    disabled={saving || channel.soon}
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Event Intelligence Preferences */}
        <Card className="overflow-hidden border-none ring-1 ring-black/5 dark:ring-white/10 shadow-xl">
          <div className="p-8 space-y-8">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('Mission Intelligence')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('Select which operational updates require immediate attention')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {EVENT_SETTINGS.map(({ key, label, description, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4 max-w-[200px]">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-dark-800 flex items-center justify-center text-gray-400 group-hover:text-brand-500 transition-colors">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{label}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold leading-tight line-clamp-2 uppercase tracking-wide">{description}</p>
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
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

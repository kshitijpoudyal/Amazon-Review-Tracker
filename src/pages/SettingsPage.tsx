import React, { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { typography } from '../utils/typography';
import { colors, getBadgeClasses } from '../utils/colors';
import { VendorSettings } from '../components/Settings/VendorSettings';
import { GmailIntegration } from '../components/Settings/GmailIntegration';
import { VendorAdminUtils } from '../components/VendorAdminUtils';

const TRIGGER_STATUS_CHECK_URL = 'https://us-central1-productreview-52e51.cloudfunctions.net/triggerStuckStatusCheck';

const SettingsPage: React.FC = () => {
  const { status, error, enable, disable } = usePushNotifications();

  const isSubscribed = status === 'subscribed';
  const isLoading = status === 'loading';

  const [isSendingPush, setIsSendingPush] = useState(false);
  const [pushResult, setPushResult] = useState<{ sent: number; failed: number } | null>(null);

  const handleSendPush = async () => {
    setIsSendingPush(true);
    try {
      const response = await fetch(TRIGGER_STATUS_CHECK_URL, { method: 'POST' });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      const result = await response.json();
      setPushResult({ sent: result.totalPushSent ?? 0, failed: result.totalPushFailed ?? 0 });
    } catch (err) {
      console.error('Error sending push notifications:', err);
      setPushResult({ sent: 0, failed: 1 });
    } finally {
      setIsSendingPush(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className={typography.pageTitle}>Settings</h1>
        <p className={`${typography.caption} mt-1`}>
          Manage notification triggers, connected integrations, and your vendor roster.
        </p>
      </div>

      <section className={`${colors.card.background} rounded-2xl ${colors.card.border} ${colors.card.shadow} overflow-hidden`}>
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#006a68]/10 text-[#006a68] border border-[#006a68]/20 flex items-center justify-center shrink-0">
              <BellIcon className="w-6 h-6" />
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className={typography.sectionTitle}>Stuck-item notifications</h2>
                {isSubscribed && (
                  <span className={getBadgeClasses('complete')}>Active</span>
                )}
                {status === 'unsubscribed' && (
                  <span className={getBadgeClasses('void')}>Paused</span>
                )}
              </div>
              <p className={typography.caption}>
                Get a push notification when a product sits in the same status too long
                (e.g. &ldquo;Add Review&rdquo; for 5+ days), so you don&apos;t have to keep checking the dashboard.
              </p>

              {status === 'unsupported' && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl text-sm">
                  Push notifications aren&apos;t supported in this browser. On iPhone/iPad, install this app to
                  your Home Screen first (Share → Add to Home Screen), then enable notifications from there.
                </div>
              )}

              {status === 'unconfigured' && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl text-sm">
                  Push notifications aren&apos;t configured for this app yet.
                </div>
              )}

              {status === 'denied' && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-sm">
                  Notifications are blocked for this site. Enable them in your browser or device settings, then reload this page.
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-sm">{error}</div>
              )}

              {pushResult && (
                <div className={`p-3 rounded-xl text-sm ${
                  pushResult.failed === 0
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {pushResult.sent > 0 && (
                    <div>✅ {pushResult.sent} push notification{pushResult.sent === 1 ? '' : 's'} sent</div>
                  )}
                  {pushResult.failed > 0 && (
                    <div>❌ {pushResult.failed} push notification{pushResult.failed === 1 ? '' : 's'} failed</div>
                  )}
                  {pushResult.sent === 0 && pushResult.failed === 0 && (
                    <div>ℹ️ No pending notifications right now</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[rgba(196,198,207,0.15)] flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              onClick={handleSendPush}
              disabled={isSendingPush}
              className={`${colors.button.secondary} w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSendingPush ? 'Sending...' : 'Push notification'}
            </button>
            {(status === 'subscribed' || status === 'unsubscribed' || status === 'loading') && (
              <button
                onClick={isSubscribed ? disable : enable}
                disabled={isLoading}
                className={`${isSubscribed ? colors.button.secondary : colors.button.primary} w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Working...' : isSubscribed ? 'Disable notifications' : 'Enable notifications'}
              </button>
            )}
          </div>
        </div>
      </section>

      <GmailIntegration />

      <VendorSettings />

      <VendorAdminUtils />
    </div>
  );
};

export default SettingsPage;

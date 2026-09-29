import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { typography } from '../utils/typography';
import { colors, getBadgeClasses } from '../utils/colors';
import { VendorSettings } from '../components/Settings/VendorSettings';
import { GmailIntegration } from '../components/Settings/GmailIntegration';

const SettingsPage: React.FC = () => {
  const { status, error, enable, disable } = usePushNotifications();

  const isSubscribed = status === 'subscribed';
  const isLoading = status === 'loading';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className={typography.pageTitle}>Settings</h1>
        <p className={`${typography.caption} mt-1`}>
          Manage notification triggers, connected integrations, and your vendor roster.
        </p>
      </div>

      <section className={`${colors.card.background} rounded-2xl ${colors.card.border} ${colors.card.shadow} overflow-hidden`}>
        <div className="p-6 md:p-8">
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
            </div>
          </div>

          {(status === 'subscribed' || status === 'unsubscribed' || status === 'loading') && (
            <div className="mt-6 pt-5 border-t border-[rgba(196,198,207,0.15)] flex justify-end">
              <button
                onClick={isSubscribed ? disable : enable}
                disabled={isLoading}
                className={`${isSubscribed ? colors.button.secondary : colors.button.primary} px-6 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Working...' : isSubscribed ? 'Disable notifications' : 'Enable notifications'}
              </button>
            </div>
          )}
        </div>
      </section>

      <GmailIntegration />

      <VendorSettings />
    </div>
  );
};

export default SettingsPage;

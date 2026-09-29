import React from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { typography } from '../utils/typography';
import { colors } from '../utils/colors';

const SettingsPage: React.FC = () => {
  const { status, error, enable, disable } = usePushNotifications();

  const isSubscribed = status === 'subscribed';
  const isLoading = status === 'loading';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className={`${typography.pageTitle} mb-6`}>Settings</h1>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <h2 className={typography.bodyStrong}>Stuck-item notifications</h2>
          <p className={`${typography.caption} mt-1`}>
            Get a push notification when a product sits in the same status too long
            (e.g. &ldquo;Add Review&rdquo; for 5+ days), so you don&apos;t have to keep checking the dashboard.
          </p>
        </div>

        {status === 'unsupported' && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm">
            Push notifications aren&apos;t supported in this browser. On iPhone/iPad, install this app to
            your Home Screen first (Share → Add to Home Screen), then enable notifications from there.
          </div>
        )}

        {status === 'unconfigured' && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm">
            Push notifications aren&apos;t configured for this app yet.
          </div>
        )}

        {status === 'denied' && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">
            Notifications are blocked for this site. Enable them in your browser or device settings, then reload this page.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">{error}</div>
        )}

        {(status === 'subscribed' || status === 'unsubscribed' || status === 'loading') && (
          <button
            onClick={isSubscribed ? disable : enable}
            disabled={isLoading}
            className={`${isSubscribed ? colors.button.secondary : colors.button.primary} px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Working...' : isSubscribed ? 'Disable notifications' : 'Enable notifications'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;

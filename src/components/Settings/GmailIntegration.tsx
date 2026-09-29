import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { useGmailIntegration } from '../../hooks/useGmailIntegration';
import { typography } from '../../utils/typography';
import { colors, getBadgeClasses } from '../../utils/colors';

export const GmailIntegration: React.FC = () => {
  const { connected, lastCheckedAt, loading, connectUrl } = useGmailIntegration();
  const [searchParams] = useSearchParams();
  const gmailParam = searchParams.get('gmail');

  return (
    <section className={`${colors.card.background} rounded-2xl ${colors.card.border} ${colors.card.shadow} overflow-hidden`}>
      <div className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="w-12 h-12 rounded-xl bg-[#ba1a1a]/8 text-[#ba1a1a] border border-[#ba1a1a]/20 flex items-center justify-center shrink-0">
              <EnvelopeIcon className="w-6 h-6" />
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className={typography.sectionTitle}>Gmail review alerts</h2>
                {!loading && (
                  <span className={getBadgeClasses(connected ? 'complete' : 'refund-pending')}>
                    {connected ? 'Connected' : 'Not connected'}
                  </span>
                )}
              </div>
              <p className={typography.caption}>
                Connect Gmail and we&apos;ll check hourly for emails that look like an Amazon review
                confirmation, then send a push notification so you can update the tracker yourself.
                This never reads your emails for anything else, and never changes a product automatically.
              </p>

              {gmailParam === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-sm">
                  Couldn&apos;t connect Gmail. Please try again.
                </div>
              )}

              {gmailParam === 'connected' && connected && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl text-sm">
                  Gmail connected.
                </div>
              )}

              {connected && lastCheckedAt && (
                <p className={typography.caption}>
                  Last checked {new Date(lastCheckedAt).toLocaleString()}
                </p>
              )}

              {connected && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl text-sm">
                  You&apos;ll need to reconnect roughly every 7 days — Google requires that until this app
                  goes through full verification. We&apos;ll push a reminder notification when it expires.
                </div>
              )}
            </div>
          </div>

          {connectUrl && (
            <a
              href={connectUrl}
              className={`inline-block shrink-0 ${connected ? colors.button.secondary : colors.button.primary} px-6 py-2.5 rounded-xl font-medium text-sm text-center transition-colors`}
            >
              {connected ? 'Reconnect Gmail' : 'Connect Gmail'}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

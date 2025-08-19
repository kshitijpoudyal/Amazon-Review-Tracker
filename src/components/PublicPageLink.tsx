import React from 'react';
import { User } from 'firebase/auth';

interface PublicPageLinkProps {
  user: User | null;
}

const PublicPageLink: React.FC<PublicPageLinkProps> = ({ user }) => {
  if (!user || !user.email) return null;

  const publicPageUrl = `${window.location.origin}/${user.email}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicPageUrl);
    // You could add a toast notification here
    alert('Public page link copied to clipboard!');
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-blue-800 mb-1">Your Public Page</h3>
          <p className="text-xs text-blue-600">Share this link to show your Amazon review products publicly</p>
        </div>
        <div className="flex gap-2">
          <a
            href={publicPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded hover:bg-blue-200 transition-colors"
          >
            View
          </a>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-colors"
          >
            Copy Link
          </button>
        </div>
      </div>
      <div className="mt-2 p-2 bg-white rounded border">
        <code className="text-xs text-gray-600 break-all">{publicPageUrl}</code>
      </div>
    </div>
  );
};

export default PublicPageLink;

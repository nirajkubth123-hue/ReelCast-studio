import React, { useState } from 'react';
import { X, Shield, FileText, Trash2, ExternalLink, Copy, Check } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'deletion';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy'
}) => {
  const [tab, setTab] = useState<'privacy' | 'terms' | 'deletion'>(initialTab);
  const [copied, setCopied] = useState(false);

  // Sync initial tab when changed
  React.useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  const sharedUrl = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://ais-dev-kfeiq3ekgs3ctyqtmewwca-946555399286.asia-east1.run.app';
  const currentUrl =
    tab === 'privacy'
      ? `${sharedUrl}/privacy`
      : tab === 'terms'
      ? `${sharedUrl}/terms`
      : `${sharedUrl}/data-deletion`;

  const copyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden text-[#14181f] dark:text-[#f1f3f7]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e4e1da] dark:border-[#222834] flex items-center justify-between bg-[#fbfaf8] dark:bg-[#131720]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2f6f4f]/15 text-[#2f6f4f] dark:text-[#52b788] flex items-center justify-center">
              {tab === 'privacy' && <Shield className="w-4 h-4" />}
              {tab === 'terms' && <FileText className="w-4 h-4" />}
              {tab === 'deletion' && <Trash2 className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-[#14181f] dark:text-[#f1f3f7]">
                Legal & Compliance Documents
              </h2>
              <p className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                Official policies formatted for Meta Platform & Google OAuth compliance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyUrl}
              className="px-2.5 py-1 text-xs font-medium border border-[#e4e1da] dark:border-[#2f3847] rounded-md hover:bg-[#f2efe9] dark:hover:bg-[#252c3a] flex items-center gap-1.5 transition-colors"
              title="Copy public URL to paste into Meta Developer Portal"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied URL' : 'Copy Live Link'}</span>
            </button>
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-[#6b6f76] hover:text-[#14181f] dark:hover:text-[#f1f3f7] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] rounded-md transition-colors"
              title="Open full page in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-[#6b6f76] hover:text-[#14181f] dark:hover:text-[#f1f3f7] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#e4e1da] dark:border-[#222834] bg-[#f7f6f3] dark:bg-[#1a202c] px-6 gap-2">
          <button
            onClick={() => setTab('privacy')}
            className={`py-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              tab === 'privacy'
                ? 'border-[#2f6f4f] text-[#2f6f4f] dark:text-[#52b788] dark:border-[#52b788]'
                : 'border-transparent text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setTab('terms')}
            className={`py-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              tab === 'terms'
                ? 'border-[#2f6f4f] text-[#2f6f4f] dark:text-[#52b788] dark:border-[#52b788]'
                : 'border-transparent text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setTab('deletion')}
            className={`py-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              tab === 'deletion'
                ? 'border-[#2f6f4f] text-[#2f6f4f] dark:text-[#52b788] dark:border-[#52b788]'
                : 'border-transparent text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Data Deletion Instructions</span>
          </button>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs sm:text-sm text-[#4b5563] dark:text-[#9aa1b0] space-y-4 leading-relaxed">
          {tab === 'privacy' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#e4e1da] dark:border-[#262e3d] pb-2">
                <span className="font-semibold text-[#14181f] dark:text-[#f1f3f7]">
                  Privacy Policy for Reelcast Studio
                </span>
                <span className="text-[11px] text-[#6b6f76]">Last Updated: September 2026</span>
              </div>
              <p>
                Reelcast Studio ("we", "our", or "the App") is committed to protecting your privacy. This policy explains how our multi-platform video publishing and scheduling platform handles information when you connect your Instagram, Facebook, and YouTube accounts.
              </p>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14181f] dark:text-[#f1f3f7] mt-3">
                1. Information We Collect
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Profile Metadata:</strong> Account usernames, handles, and identifiers returned via OAuth.</li>
                <li><strong>Media Files:</strong> Vertical video files, thumbnails, and captions uploaded for distribution.</li>
                <li><strong>OAuth Tokens:</strong> Encrypted access tokens required to perform user-authorized actions.</li>
              </ul>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14181f] dark:text-[#f1f3f7] mt-3">
                2. Use of Data
              </h4>
              <p>
                Data is utilized strictly to upload, schedule, and publish video content directly to your authorized channels. We do <strong>NOT</strong> sell user data, share data with third-party advertisers, or analyze content for ad profiling.
              </p>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14181f] dark:text-[#f1f3f7] mt-3">
                3. Contact Information
              </h4>
              <p>
                For data protection inquiries, contact us at: <strong>nirajkubth123@gmail.com</strong>
              </p>
            </div>
          )}

          {tab === 'terms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#e4e1da] dark:border-[#262e3d] pb-2">
                <span className="font-semibold text-[#14181f] dark:text-[#f1f3f7]">
                  Terms of Service
                </span>
                <span className="text-[11px] text-[#6b6f76]">Last Updated: September 2026</span>
              </div>
              <p>
                By connecting social accounts or uploading content through Reelcast Studio, you agree to these Terms of Service.
              </p>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14181f] dark:text-[#f1f3f7] mt-3">
                1. Content Ownership & Responsibility
              </h4>
              <p>
                You retain full ownership and intellectual property rights to all media and text you publish. You affirm you possess all necessary broadcasting rights for music, video footage, and voiceovers.
              </p>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14181f] dark:text-[#f1f3f7] mt-3">
                2. Compliance with Platform Guidelines
              </h4>
              <p>
                All published content must adhere to Meta Community Standards and YouTube Community Guidelines.
              </p>
            </div>
          )}

          {tab === 'deletion' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#e4e1da] dark:border-[#262e3d] pb-2">
                <span className="font-semibold text-[#14181f] dark:text-[#f1f3f7]">
                  User Data Deletion Instructions (Meta Compliance)
                </span>
                <span className="text-[11px] text-[#6b6f76]">Official Callback Policy</span>
              </div>
              <p>
                Reelcast Studio provides users with instant, complete control over their authenticated account data.
              </p>
              <div className="bg-[#f7f6f3] dark:bg-[#1a202c] p-4 rounded-xl border border-[#e4e1da] dark:border-[#262e3d] space-y-2">
                <div className="font-semibold text-[#14181f] dark:text-[#f1f3f7]">
                  Three Ways to Delete Your Data:
                </div>
                <ol className="list-decimal pl-5 space-y-2 text-xs">
                  <li>
                    <strong>In-App Disconnection:</strong> Open <em>Manage Accounts</em> in the top header and click <em>Disconnect</em> next to any account. Stored access tokens and profile identifiers are wiped immediately.
                  </li>
                  <li>
                    <strong>Facebook / Meta App Settings:</strong> Go to Facebook &gt; <em>Settings &amp; Privacy &gt; Apps and Websites &gt; Reelcast Studio &gt; Remove</em>. Meta will automatically trigger our Data Deletion callback.
                  </li>
                  <li>
                    <strong>Email Request:</strong> Send an email to <em>nirajkubth123@gmail.com</em> with the subject <em>"Data Deletion Request"</em>.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#e4e1da] dark:border-[#222834] bg-[#fbfaf8] dark:bg-[#131720] flex items-center justify-between">
          <span className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
            Host: {sharedUrl}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2f6f4f] hover:bg-[#25593f] text-white rounded-md text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

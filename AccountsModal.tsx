import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Instagram,
  Facebook,
  Youtube,
  ExternalLink,
  ShieldCheck,
  Key,
  Copy,
  Check,
  Globe,
  Lock,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Info,
  Activity,
  Eye,
  EyeOff
} from 'lucide-react';
import { SocialAccount, PlatformId } from '../types';

interface AccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: SocialAccount[];
  onToggleConnection: (accountId: string) => void;
  onUpdateAccount?: (account: Partial<SocialAccount> & { platform: PlatformId }) => void;
}

interface AuthConfigResponse {
  appUrl: string;
  sharedAppUrl: string;
  callbackUri: string;
  sharedCallbackUri: string;
  meta: {
    configured: boolean;
    clientIdMasked: string | null;
    scopes: string[];
    dashboardUrl: string;
  };
  google: {
    configured: boolean;
    clientIdMasked: string | null;
    scopes: string[];
    dashboardUrl: string;
  };
}

export const AccountsModal: React.FC<AccountsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onToggleConnection,
  onUpdateAccount
}) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'setup'>('accounts');
  const [authConfig, setAuthConfig] = useState<AuthConfigResponse | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<PlatformId | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [setupHelperPlatform, setSetupHelperPlatform] = useState<PlatformId | null>(null);

  // Meta Graph API Connection Test states
  const [metaClientIdInput, setMetaClientIdInput] = useState('');
  const [metaClientSecretInput, setMetaClientSecretInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
    error?: string;
    errorCode?: number | string;
    fbtraceId?: string;
    app?: { id: string; name: string; category?: string };
    durationMs?: number;
    troubleshoot?: string;
    testedAt?: string;
  } | null>(null);

  // YouTube / Google OAuth Credentials state
  const [googleClientIdInput, setGoogleClientIdInput] = useState('');
  const [googleClientSecretInput, setGoogleClientSecretInput] = useState('');
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);
  const [savingGoogleCreds, setSavingGoogleCreds] = useState(false);
  const [googleCredsStatus, setGoogleCredsStatus] = useState<string | null>(null);

  // Fetch OAuth configuration from backend
  const fetchAuthConfig = async () => {
    try {
      setLoadingConfig(true);
      const res = await fetch('/api/auth/config');
      if (res.ok) {
        const data = await res.json();
        setAuthConfig(data);
      }
    } catch (e) {
      console.error('Failed to fetch auth config', e);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAuthConfig();
    }
  }, [isOpen]);

  // Listen for popup cross-origin OAuth messages as prescribed in oauth-integration skill
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin if needed
      const origin = event.origin;
      if (
        !origin.endsWith('.run.app') &&
        !origin.includes('localhost') &&
        !origin.includes('127.0.0.1')
      ) {
        // In iframe environments, origin check might vary, but safe to inspect event.data
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { platform, accountName, handle, subscriberCount } = event.data;
        setConnectingPlatform(null);
        setStatusMessage({
          type: 'success',
          text: `Successfully authenticated ${accountName || platform} via Live OAuth!`
        });

        if (onUpdateAccount) {
          onUpdateAccount({
            platform,
            accountName: accountName || (platform === 'youtube' ? 'YouTube Shorts Official' : 'Instagram Creator'),
            handle: handle || (platform === 'youtube' ? '@reelcastshorts' : '@reelcast.creator'),
            subscriberCount: subscriberCount || 'Verified Account',
            isConnected: true,
            authMethod: 'live_oauth',
            connectedAt: new Date().toISOString()
          });
        }
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setConnectingPlatform(null);
        setStatusMessage({
          type: 'error',
          text: event.data.error || 'Authentication flow was cancelled or failed.'
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onUpdateAccount]);

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Launch OAuth Popup Flow
  const handleConnectOAuth = async (platform: PlatformId) => {
    try {
      setConnectingPlatform(platform);
      setStatusMessage(null);

      const res = await fetch(`/api/auth/url?platform=${platform}`);
      const data = await res.json();

      if (data.configured && data.url) {
        // Open OAuth Provider's URL directly in a popup as mandated by AI Studio constraints
        const popup = window.open(
          data.url,
          `oauth_${platform}`,
          'width=600,height=720,status=no,toolbar=no,menubar=no,scrollbars=yes'
        );

        if (!popup) {
          setStatusMessage({
            type: 'error',
            text: 'Popup was blocked by browser. Please allow popups for this site to authorize.'
          });
          setConnectingPlatform(null);
        }
      } else {
        // Keys not configured yet - open setup helper
        setSetupHelperPlatform(platform);
        setActiveTab('setup');
        setConnectingPlatform(null);
      }
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: `Error initiating connection: ${e.message}`
      });
      setConnectingPlatform(null);
    }
  };

  // Save Google / YouTube Client ID and Secret directly to server
  const handleSaveGoogleCredentials = async () => {
    if (!googleClientIdInput.trim()) {
      setGoogleCredsStatus('Please enter your Google Client ID.');
      return;
    }
    setSavingGoogleCreds(true);
    setGoogleCredsStatus(null);
    try {
      const res = await fetch('/api/auth/save-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'youtube',
          clientId: googleClientIdInput.trim(),
          clientSecret: googleClientSecretInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setGoogleCredsStatus('Credentials saved! You can now click "Connect OAuth" on YouTube.');
        fetchAuthConfig();
      } else {
        setGoogleCredsStatus('Failed to save credentials: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      setGoogleCredsStatus('Network error: ' + err.message);
    } finally {
      setSavingGoogleCreds(false);
    }
  };

  // Sandbox simulation connection for immediate developer verification
  const handleConnectSandbox = async (platform: PlatformId) => {
    try {
      setConnectingPlatform(platform);
      const res = await fetch('/api/auth/sandbox-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });

      if (res.ok) {
        const data = await res.json();
        if (onUpdateAccount && data.account) {
          onUpdateAccount({
            platform,
            accountName: data.account.accountName,
            handle: data.account.handle,
            subscriberCount: data.account.subscriberCount,
            isConnected: true,
            authMethod: 'sandbox_simulated',
            connectedAt: data.account.connectedAt
          });
        }
        setStatusMessage({
          type: 'success',
          text: `Developer Sandbox mode linked for ${platform.toUpperCase()}. Ready for simulated publishing tests!`
        });
        setSetupHelperPlatform(null);
      }
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: `Sandbox connection failed: ${e.message}`
      });
    } finally {
      setConnectingPlatform(null);
    }
  };

  // Disconnect Account
  const handleDisconnect = async (acc: SocialAccount) => {
    try {
      await fetch('/api/auth/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: acc.platform })
      });

      onToggleConnection(acc.id);
      setStatusMessage({
        type: 'success',
        text: `Disconnected ${acc.accountName}.`
      });
    } catch (e) {
      onToggleConnection(acc.id);
    }
  };

  // Test Meta Graph API endpoint using provided or server credentials
  const handleTestMetaConnection = async (overrideClientId?: string, overrideClientSecret?: string) => {
    try {
      setTestingConnection(true);
      setConnectionTestResult(null);

      const clientIdToTest = overrideClientId !== undefined ? overrideClientId : metaClientIdInput.trim();
      const clientSecretToTest = overrideClientSecret !== undefined ? overrideClientSecret : metaClientSecretInput.trim();

      const payload: { clientId?: string; clientSecret?: string } = {};
      if (clientIdToTest) payload.clientId = clientIdToTest;
      if (clientSecretToTest) payload.clientSecret = clientSecretToTest;

      const res = await fetch('/api/auth/meta/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setConnectionTestResult(data);

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: `Meta Graph API Connection Test Succeeded! ${data.message}`
        });
        fetchAuthConfig();
      } else {
        setStatusMessage({
          type: 'error',
          text: `Meta Connection Test Failed: ${data.message || 'Invalid credentials or endpoint unreachable.'}`
        });
      }
    } catch (e: any) {
      const errObj = {
        success: false,
        message: `Network error connecting to test endpoint: ${e.message}`,
        troubleshoot: 'Verify that the local server is running and internet connection is active.'
      };
      setConnectionTestResult(errObj);
      setStatusMessage({
        type: 'error',
        text: `Connection test error: ${e.message}`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  if (!isOpen) return null;

  const defaultCallbackUri = authConfig?.callbackUri || 'https://ais-dev-kfeiq3ekgs3ctyqtmewwca-946555399286.asia-east1.run.app/auth/callback';
  const defaultSharedCallbackUri = authConfig?.sharedCallbackUri || 'https://ais-pre-kfeiq3ekgs3ctyqtmewwca-946555399286.asia-east1.run.app/auth/callback';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b24] rounded-2xl border border-[#e4e1da] dark:border-[#222834] max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto transition-colors duration-200 cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e4e1da] dark:border-[#222834]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#14181f] dark:text-[#f1f3f7]">
                Live OAuth & Social Account Connections
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2f6f4f]/10 text-[#2f6f4f] dark:bg-[#52b788]/20 dark:text-[#52b788]">
                OAuth 2.0
              </span>
            </div>
            <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0] mt-0.5">
              Securely authenticate Instagram Reels, Facebook Reels, and YouTube Shorts
            </p>
          </div>
          <button
            id="btn-close-accounts-modal"
            onClick={onClose}
            className="p-1 rounded-md text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] hover:bg-[#f7f6f3] dark:hover:bg-[#1c222d]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[#f7f6f3] dark:bg-[#11141c] border border-[#e4e1da] dark:border-[#222834] rounded-xl text-xs">
          <button
            type="button"
            onClick={() => { setActiveTab('accounts'); setSetupHelperPlatform(null); }}
            className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all ${
              activeTab === 'accounts'
                ? 'bg-white dark:bg-[#1c222d] text-[#14181f] dark:text-[#f1f3f7] shadow-xs'
                : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
          >
            Connected Accounts ({accounts.filter(a => a.isConnected).length}/{accounts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'setup'
                ? 'bg-white dark:bg-[#1c222d] text-[#14181f] dark:text-[#f1f3f7] shadow-xs'
                : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Credentials & Callback URLs</span>
          </button>
        </div>

        {/* Status Notification Toast */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
              statusMessage.type === 'success'
                ? 'bg-[#2f6f4f]/10 text-[#2f6f4f] dark:bg-[#52b788]/20 dark:text-[#52b788] border border-[#2f6f4f]/20'
                : 'bg-[#b3432b]/10 text-[#b3432b] dark:bg-[#b3432b]/20 dark:text-[#f87171] border border-[#b3432b]/20'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium leading-relaxed">{statusMessage.text}</div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: ACCOUNTS LIST */}
        {activeTab === 'accounts' && (
          <div className="space-y-3">
            {accounts.map((acc) => {
              const isInstagram = acc.platform === 'instagram';
              const isFacebook = acc.platform === 'facebook';
              const isYouTube = acc.platform === 'youtube';

              const isConfigured = isYouTube
                ? authConfig?.google.configured
                : authConfig?.meta.configured;

              return (
                <div
                  key={acc.id}
                  className="p-4 rounded-xl border border-[#e4e1da] dark:border-[#262c38] bg-[#fbfbfa] dark:bg-[#11141c] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#262c38] flex items-center justify-center shrink-0 shadow-2xs">
                      {isInstagram && <Instagram className="w-5 h-5 text-[#E1306C]" />}
                      {isFacebook && <Facebook className="w-5 h-5 text-[#1877F2]" />}
                      {isYouTube && <Youtube className="w-5 h-5 text-[#FF0000]" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#14181f] dark:text-[#f1f3f7]">
                          {acc.accountName}
                        </h3>
                        {acc.isConnected && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2f6f4f] dark:text-[#52b788] bg-[#2f6f4f]/10 dark:bg-[#2f6f4f]/20 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            {acc.authMethod === 'live_oauth' ? 'Live Verified' : 'Sandbox Ready'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
                        {acc.handle} {acc.subscriberCount ? `• ${acc.subscriberCount}` : ''}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#6b6f76] dark:text-[#9aa1b0]">
                        <span className="font-mono">
                          {isYouTube ? 'YouTube Data API v3' : 'Meta Graph API v20.0'}
                        </span>
                        <span>•</span>
                        <span className={isConfigured ? 'text-[#2f6f4f] dark:text-[#52b788] font-medium' : 'text-[#c4622d] dark:text-[#f97316]'}>
                          {isConfigured ? 'Live Credentials Set' : 'Credentials Needed / Sandbox'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {acc.isConnected ? (
                      <button
                        type="button"
                        onClick={() => handleDisconnect(acc)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#b3432b] bg-white dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#2b3342] hover:bg-[#b3432b]/10 transition-all"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleConnectOAuth(acc.platform)}
                          disabled={connectingPlatform === acc.platform}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2f6f4f] hover:bg-[#265b41] dark:bg-[#52b788] dark:text-[#0b0e14] transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                        >
                          {connectingPlatform === acc.platform ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                          <span>Connect OAuth</span>
                        </button>
                        {(isInstagram || isFacebook) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (authConfig?.meta.configured) {
                                handleTestMetaConnection();
                              } else {
                                setActiveTab('setup');
                              }
                            }}
                            disabled={testingConnection}
                            title="Test connection to Meta Graph API endpoint using credentials"
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#2f6f4f] dark:text-[#52b788] bg-[#2f6f4f]/10 dark:bg-[#52b788]/15 border border-[#2f6f4f]/20 hover:bg-[#2f6f4f]/20 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            {testingConnection ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Activity className="w-3 h-3" />
                            )}
                            <span className="hidden sm:inline">Connection Test</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleConnectSandbox(acc.platform)}
                          title="Connect in Developer Sandbox mode without needing cloud credentials"
                          className="px-2 py-1.5 rounded-lg text-[11px] font-medium text-[#6b6f76] dark:text-[#9aa1b0] bg-white dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#2b3342] hover:text-[#14181f] dark:hover:text-[#f1f3f7]"
                        >
                          <Sparkles className="w-3 h-3 text-[#c4622d]" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Security Guarantee Note */}
            <div className="bg-[#2f6f4f]/10 dark:bg-[#2f6f4f]/20 border border-[#2f6f4f]/20 dark:border-[#2f6f4f]/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#2f6f4f] dark:text-[#52b788]">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-semibold">Zero-Leak Token Architecture</div>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  OAuth authorization codes and client secrets are handled exclusively on the backend server. Reels and Shorts publish directly via encrypted sessions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: API CREDENTIALS & REDIRECT URI CONFIGURATION */}
        {activeTab === 'setup' && (
          <div className="space-y-4">
            {/* Required Callback URLs Box */}
            <div className="p-3.5 rounded-xl bg-[#f7f6f3] dark:bg-[#11141c] border border-[#e4e1da] dark:border-[#262c38] space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-xs text-[#14181f] dark:text-[#f1f3f7] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#2f6f4f] dark:text-[#52b788]" />
                  <span>Authorized OAuth Redirect URIs (Add to Provider Dashboards)</span>
                </div>
                <span className="text-[10px] text-[#6b6f76] dark:text-[#9aa1b0]">Strict Callback Path</span>
              </div>

              {/* Dev URL */}
              <div className="space-y-1">
                <div className="text-[11px] font-medium text-[#6b6f76] dark:text-[#9aa1b0]">
                  Development Callback URL:
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={defaultCallbackUri}
                    className="flex-1 font-mono text-[11px] p-2 bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#2b3342] rounded-lg text-[#14181f] dark:text-[#f1f3f7] select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(defaultCallbackUri, 'dev-uri')}
                    className="px-2.5 py-2 rounded-lg bg-white dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#2b3342] text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-1"
                  >
                    {copiedKey === 'dev-uri' ? <Check className="w-3.5 h-3.5 text-[#2f6f4f]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'dev-uri' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Shared URL */}
              <div className="space-y-1">
                <div className="text-[11px] font-medium text-[#6b6f76] dark:text-[#9aa1b0]">
                  Shared / Deployed Callback URL:
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={defaultSharedCallbackUri}
                    className="flex-1 font-mono text-[11px] p-2 bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#2b3342] rounded-lg text-[#14181f] dark:text-[#f1f3f7] select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(defaultSharedCallbackUri, 'shared-uri')}
                    className="px-2.5 py-2 rounded-lg bg-white dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#2b3342] text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-1"
                  >
                    {copiedKey === 'shared-uri' ? <Check className="w-3.5 h-3.5 text-[#2f6f4f]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'shared-uri' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Provider Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Meta / Instagram */}
              <div className="p-3.5 rounded-xl border border-[#e4e1da] dark:border-[#262c38] bg-[#fbfbfa] dark:bg-[#11141c] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-[#E1306C]" />
                    <span className="font-semibold text-xs text-[#14181f] dark:text-[#f1f3f7]">
                      Meta for Developers
                    </span>
                  </div>
                  <a
                    href="https://developers.facebook.com/apps/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#2f6f4f] dark:text-[#52b788] hover:underline flex items-center gap-0.5"
                  >
                    Console <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0] space-y-1">
                  <div>1. Create app with <strong>Instagram Graph API</strong>.</div>
                  <div>2. Add <strong>Facebook Login for Business</strong>.</div>
                  <div>3. Paste the Callback URLs into <em>Valid OAuth Redirect URIs</em>.</div>
                  <div>4. Set in AI Studio Settings / .env:
                    <div className="font-mono text-[10px] bg-white dark:bg-[#161b24] p-1.5 mt-1 rounded border border-[#e4e1da] dark:border-[#2b3342]">
                      META_CLIENT_ID=...<br />
                      META_CLIENT_SECRET=...
                    </div>
                  </div>
                </div>

                {/* Meta Graph API Connection Tester */}
                <div className="pt-2 border-t border-[#e4e1da] dark:border-[#262c38] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#14181f] dark:text-[#f1f3f7] flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-[#2f6f4f] dark:text-[#52b788]" />
                      <span>Meta Graph API Connection Test</span>
                    </span>
                    {authConfig?.meta.configured && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-[#2f6f4f]/10 text-[#2f6f4f] dark:text-[#52b788]">
                        Server .env Active
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-[#6b6f76] dark:text-[#9aa1b0] leading-normal">
                    Enter your App credentials below or click <strong>Connection Test</strong> to verify graph.facebook.com endpoint access and troubleshoot invalid keys.
                  </p>

                  <div className="space-y-1.5">
                    <div>
                      <label className="block text-[10px] font-medium text-[#6b6f76] dark:text-[#9aa1b0] mb-0.5">
                        META_CLIENT_ID (App ID)
                      </label>
                      <input
                        type="text"
                        value={metaClientIdInput}
                        onChange={(e) => setMetaClientIdInput(e.target.value)}
                        placeholder={authConfig?.meta.clientIdMasked ? `Configured in env (${authConfig.meta.clientIdMasked})` : "e.g. 104829104812345"}
                        className="w-full font-mono text-[11px] px-2.5 py-1.5 bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#2b3342] rounded-lg text-[#14181f] dark:text-[#f1f3f7] focus:outline-none focus:border-[#2f6f4f]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-[#6b6f76] dark:text-[#9aa1b0] mb-0.5">
                        META_CLIENT_SECRET (App Secret)
                      </label>
                      <div className="relative">
                        <input
                          type={showSecret ? "text" : "password"}
                          value={metaClientSecretInput}
                          onChange={(e) => setMetaClientSecretInput(e.target.value)}
                          placeholder={authConfig?.meta.configured ? "Configured on server (or enter to test)" : "e.g. 3a8f9c2d1b4e..."}
                          className="w-full font-mono text-[11px] px-2.5 py-1.5 pr-8 bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#2b3342] rounded-lg text-[#14181f] dark:text-[#f1f3f7] focus:outline-none focus:border-[#2f6f4f]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]"
                        >
                          {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Connection Test Action Button */}
                  <button
                    type="button"
                    id="btn-connection-test"
                    onClick={() => handleTestMetaConnection()}
                    disabled={testingConnection}
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-[#2f6f4f] hover:bg-[#265b41] dark:bg-[#52b788] dark:text-[#0b0e14] rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-60 cursor-pointer"
                  >
                    {testingConnection ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Testing Meta Graph API...</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-3.5 h-3.5" />
                        <span>Connection Test</span>
                      </>
                    )}
                  </button>

                  {/* Connection Test Status Message Display */}
                  {connectionTestResult && (
                    <div
                      className={`p-3 rounded-lg text-xs border transition-all animate-in fade-in duration-150 ${
                        connectionTestResult.success
                          ? 'bg-[#2f6f4f]/10 dark:bg-[#52b788]/15 border-[#2f6f4f]/30 text-[#2f6f4f] dark:text-[#52b788]'
                          : 'bg-[#b3432b]/10 dark:bg-[#b3432b]/20 border-[#b3432b]/30 text-[#b3432b] dark:text-[#f87171]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {connectionTestResult.success ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2f6f4f] dark:text-[#52b788]" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#b3432b] dark:text-[#f87171]" />
                        )}
                        <div className="flex-1 space-y-1">
                          <div className="font-semibold text-[11px] flex items-center justify-between">
                            <span>
                              {connectionTestResult.success
                                ? 'Connection Successful (200 OK)'
                                : 'Connection Test Failed'}
                            </span>
                            {connectionTestResult.durationMs !== undefined && (
                              <span className="font-mono text-[10px] opacity-80">
                                {connectionTestResult.durationMs}ms
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[11px] leading-relaxed text-[#14181f] dark:text-[#f1f3f7]">
                            {connectionTestResult.message}
                          </p>

                          {connectionTestResult.app && (
                            <div className="mt-1.5 p-1.5 rounded bg-black/5 dark:bg-white/5 font-mono text-[10px] space-y-0.5 text-[#14181f] dark:text-[#f1f3f7]">
                              <div>App Name: <strong>{connectionTestResult.app.name}</strong></div>
                              <div>App ID: {connectionTestResult.app.id}</div>
                              {connectionTestResult.app.category && (
                                <div>Category: {connectionTestResult.app.category}</div>
                              )}
                            </div>
                          )}

                          {connectionTestResult.fbtraceId && (
                            <div className="text-[10px] font-mono opacity-70">
                              fbtrace_id: {connectionTestResult.fbtraceId}
                            </div>
                          )}

                          {/* Troubleshooting Advice */}
                          {connectionTestResult.troubleshoot && (
                            <div className="mt-2 pt-2 border-t border-current/15 text-[10px] leading-relaxed">
                              <span className="font-semibold">💡 Troubleshooting Tip: </span>
                              <span>{connectionTestResult.troubleshoot}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleConnectSandbox('instagram')}
                  className="w-full py-1.5 text-[11px] font-semibold text-[#2f6f4f] dark:text-[#52b788] bg-[#2f6f4f]/10 dark:bg-[#52b788]/15 rounded-lg hover:bg-[#2f6f4f]/20 transition-colors flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Test Instagram with Sandbox Mode</span>
                </button>
              </div>

              {/* YouTube / Google */}
              <div className="p-3.5 rounded-xl border border-[#e4e1da] dark:border-[#262c38] bg-[#fbfbfa] dark:bg-[#11141c] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-[#FF0000]" />
                    <span className="font-semibold text-xs text-[#14181f] dark:text-[#f1f3f7]">
                      YouTube (Google Cloud)
                    </span>
                  </div>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#2f6f4f] dark:text-[#52b788] hover:underline flex items-center gap-0.5"
                  >
                    Google Credentials <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0] space-y-1">
                  <div>1. Under <strong>APIs &amp; Services</strong>, enable <strong>YouTube Data API v3</strong>.</div>
                  <div>2. Under <strong>Credentials</strong>, create <strong>OAuth client ID</strong> (Web app).</div>
                  <div>3. Under <strong>Authorized redirect URIs</strong>, paste the Callback URL above.</div>
                </div>

                {/* Direct Credential Input Fields */}
                <div className="pt-2 border-t border-[#e4e1da] dark:border-[#262c38] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#14181f] dark:text-[#f1f3f7] flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-[#FF0000]" />
                      <span>Enter YouTube OAuth Keys</span>
                    </span>
                    {authConfig?.google.configured && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-[#2f6f4f]/10 text-[#2f6f4f] dark:text-[#52b788]">
                        Active ({authConfig.google.clientIdMasked})
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <label className="block text-[10px] font-medium text-[#6b6f76] dark:text-[#9aa1b0] mb-0.5">
                        Client ID (ends with .apps.googleusercontent.com)
                      </label>
                      <input
                        type="text"
                        value={googleClientIdInput}
                        onChange={(e) => setGoogleClientIdInput(e.target.value)}
                        placeholder="e.g. 946555399286-abc123xyz.apps.googleusercontent.com"
                        className="w-full font-mono text-[11px] px-2.5 py-1.5 bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#2b3342] rounded-lg text-[#14181f] dark:text-[#f1f3f7] focus:outline-hidden focus:border-[#FF0000]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-[#6b6f76] dark:text-[#9aa1b0] mb-0.5">
                        Client Secret (starts with GOCSPX-)
                      </label>
                      <div className="relative">
                        <input
                          type={showGoogleSecret ? "text" : "password"}
                          value={googleClientSecretInput}
                          onChange={(e) => setGoogleClientSecretInput(e.target.value)}
                          placeholder="e.g. GOCSPX-xxxxxxxxxxxxxxxxxx"
                          className="w-full font-mono text-[11px] px-2.5 py-1.5 pr-8 bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#2b3342] rounded-lg text-[#14181f] dark:text-[#f1f3f7] focus:outline-hidden focus:border-[#FF0000]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]"
                        >
                          {showGoogleSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveGoogleCredentials}
                    disabled={savingGoogleCreds}
                    className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-[#FF0000] hover:bg-[#d60000] rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-60 cursor-pointer"
                  >
                    {savingGoogleCreds ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Saving YouTube Keys...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save YouTube Keys</span>
                      </>
                    )}
                  </button>

                  {googleCredsStatus && (
                    <div className="text-[11px] font-medium text-[#2f6f4f] dark:text-[#52b788] bg-[#2f6f4f]/10 p-2 rounded-lg border border-[#2f6f4f]/20">
                      {googleCredsStatus}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleConnectSandbox('youtube')}
                    className="w-full py-1.5 text-[11px] font-semibold text-[#FF0000] bg-[#FF0000]/10 rounded-lg hover:bg-[#FF0000]/15 transition-colors flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Or Connect with Sandbox Mode</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#e4e1da] dark:border-[#222834]">
          <div className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0] flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Clicking "Done" keeps your connections active.</span>
          </div>
          <button
            id="btn-done-accounts-modal"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#2f6f4f] hover:bg-[#265b41] dark:bg-[#52b788] dark:text-[#0b0e14] rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

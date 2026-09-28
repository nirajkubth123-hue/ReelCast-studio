import React, { useState } from 'react';
import {
  Rocket,
  Globe,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileText,
  Server,
  Sparkles,
  HelpCircle,
  X,
  AlertTriangle,
  ArrowRight,
  Share2,
  Smartphone,
  Layers,
  Download,
  Github,
  Code
} from 'lucide-react';

interface PublishAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLegal: (tab: 'privacy' | 'terms' | 'deletion') => void;
  onOpenAccounts: () => void;
}

export const PublishAppModal: React.FC<PublishAppModalProps> = ({
  isOpen,
  onClose,
  onOpenLegal,
  onOpenAccounts
}) => {
  const [activeTab, setActiveTab] = useState<'vercel' | 'playstore' | 'live' | 'meta' | 'hosting'>('vercel');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [packageName, setPackageName] = useState('app.reelcast.studio');
  const [sha256Fingerprint, setSha256Fingerprint] = useState('');
  const [isSavingAssetLinks, setIsSavingAssetLinks] = useState(false);
  const [assetLinksStatus, setAssetLinksStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Dynamic active URL of this app
  const liveUrl = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://ais-dev-kfeiq3ekgs3ctyqtmewwca-946555399286.asia-east1.run.app';
  const privacyUrl = `${liveUrl}/privacy`;
  const termsUrl = `${liveUrl}/terms`;
  const deletionUrl = `${liveUrl}/data-deletion`;
  const deletionCallbackUrl = `${liveUrl}/api/meta/data-deletion`;
  const oauthCallbackUrl = `${liveUrl}/auth/callback`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleSaveAssetLinks = async () => {
    setIsSavingAssetLinks(true);
    setAssetLinksStatus(null);
    try {
      const res = await fetch('/api/playstore/assetlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageName: packageName.trim(),
          sha256Fingerprint: sha256Fingerprint.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setAssetLinksStatus('AssetLinks successfully updated and active on server!');
      } else {
        setAssetLinksStatus('Failed to update: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      setAssetLinksStatus('Network error: ' + err.message);
    } finally {
      setIsSavingAssetLinks(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-[#14181f] dark:text-[#f1f3f7]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#e4e1da] dark:border-[#222834] flex items-center justify-between bg-[#fbfaf8] dark:bg-[#131720]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2f6f4f] to-[#52b788] text-white flex items-center justify-center shadow-md shadow-[#2f6f4f]/20">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-[#14181f] dark:text-[#f1f3f7]">
                  Publish & Deploy Reelcast Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2f6f4f]/10 text-[#2f6f4f] dark:text-[#52b788] border border-[#2f6f4f]/30">
                  Live Ready
                </span>
              </div>
              <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
                Everything you need to share your live website and publish your Meta App to Live Mode
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#6b6f76] hover:text-[#14181f] dark:hover:text-[#f1f3f7] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e4e1da] dark:border-[#222834] bg-[#f7f6f3] dark:bg-[#1a202c] px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('vercel')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'vercel'
                ? 'border-[#2f6f4f] text-[#2f6f4f] dark:text-[#52b788] dark:border-[#52b788]'
                : 'border-transparent text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
          >
            <Github className="w-4 h-4 text-[#14181f] dark:text-[#f1f3f7]" />
            <span>GitHub &amp; Vercel</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-bold">
              1-Click Steps
            </span>
          </button>

          <button
            onClick={() => setActiveTab('playstore')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'playstore'
                ? 'border-[#2f6f4f] text-[#2f6f4f] dark:text-[#52b788] dark:border-[#52b788]'
                : 'border-transparent text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#2f6f4f] dark:text-[#52b788]" />
            <span>Google Play Store</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-[#2f6f4f]/15 text-[#2f6f4f] dark:text-[#52b788] font-bold">
              Android .aab
            </span>
          </button>

          <button
            onClick={() => setActiveTab('live')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'live'
                ? 'border-[#2f6f4f] text-[#2f6f4f] dark:text-[#52b788] dark:border-[#52b788]'
                : 'border-transparent text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Web URL</span>
          </button>

          <button
            onClick={() => setActiveTab('meta')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'meta'
                ? 'border-[#2f6f4f] text-[#2f6f4f] dark:text-[#52b788] dark:border-[#52b788]'
                : 'border-transparent text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Meta App Live</span>
          </button>

          <button
            onClick={() => setActiveTab('hosting')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'hosting'
                ? 'border-[#2f6f4f] text-[#2f6f4f] dark:text-[#52b788] dark:border-[#52b788]'
                : 'border-transparent text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Self-Hosting</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: GITHUB & VERCEL */}
          {activeTab === 'vercel' && (
            <div className="space-y-6">
              {/* Ready Status Card */}
              <div className="bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-transparent border border-purple-200 dark:border-purple-800/40 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    GitHub &amp; Vercel Deployment Guide
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold">
                    1-Click ZIP Ready
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#14181f] dark:text-[#f1f3f7] mb-1">
                  How to push your latest updates to GitHub and Vercel
                </h3>
                <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0] leading-relaxed mb-4">
                  Download the full codebase ZIP below, unpack it, and drag it right into GitHub's "uploading an existing file" screen.
                </p>

                {/* 1-Click Download Project ZIP Banner */}
                <div className="bg-white dark:bg-[#161b24] p-3.5 rounded-xl border border-purple-200 dark:border-purple-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">
                        Download Complete Codebase (.ZIP)
                      </div>
                      <div className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                        Includes all components, Gemini AI prompt logic, A/B testing &amp; vercel.json
                      </div>
                    </div>
                  </div>
                  <a
                    href="/api/download-project"
                    download="reelcast-studio-export.zip"
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Project ZIP</span>
                  </a>
                </div>
              </div>

              {/* Step 1: Git Push */}
              <div className="bg-[#fcfbf9] dark:bg-[#12161f] border border-[#e4e1da] dark:border-[#222834] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <span className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">
                      Push Latest Code to GitHub
                    </span>
                  </div>
                  <a
                    href="https://github.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    <span>Create New GitHub Repo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
                  Run these commands in your project folder to commit and push all files:
                </p>
                <div className="bg-[#161b24] p-3 rounded-lg font-mono text-[11px] text-[#9aa1b0] space-y-1 relative group">
                  <button
                    onClick={() => copyToClipboard(`git init\ngit add .\ngit commit -m "feat: Initial ReelCast Studio commit"\ngit branch -M main\ngit remote add origin https://github.com/nirajkubth123-hue/ReelCast-studio.git\ngit push -u origin main --force`, 'git-cmds')}
                    className="absolute top-2 right-2 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] flex items-center gap-1 transition-colors"
                  >
                    {copiedKey === 'git-cmds' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'git-cmds' ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                  <div className="text-purple-300 font-semibold"># Clean start from zero: initialize &amp; force push to main</div>
                  <div className="text-[#52b788]">git init</div>
                  <div className="text-[#52b788]">git add .</div>
                  <div className="text-[#52b788]">git commit -m "feat: Initial ReelCast Studio commit"</div>
                  <div className="text-purple-300 font-semibold mt-2"># Connect to your GitHub repository</div>
                  <div className="text-[#52b788]">git branch -M main</div>
                  <div className="text-[#52b788]">git remote add origin https://github.com/nirajkubth123-hue/ReelCast-studio.git</div>
                  <div className="text-[#52b788]">git push -u origin main --force</div>
                </div>
              </div>

              {/* Step 2: Vercel Deploy */}
              <div className="bg-[#fcfbf9] dark:bg-[#12161f] border border-[#e4e1da] dark:border-[#222834] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <span className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">
                      Import &amp; Deploy on Vercel
                    </span>
                  </div>
                  <a
                    href="https://vercel.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white hover:bg-neutral-800 rounded-md text-[11px] font-semibold transition-colors"
                  >
                    <span>Deploy on Vercel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
                  On Vercel, select your GitHub repo. The build settings are already pre-configured:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d]">
                    <span className="text-[10px] uppercase font-bold text-[#6b6f76] dark:text-[#9aa1b0] block mb-0.5">Framework</span>
                    <span className="text-[#14181f] dark:text-[#f1f3f7] font-semibold">Vite</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d]">
                    <span className="text-[10px] uppercase font-bold text-[#6b6f76] dark:text-[#9aa1b0] block mb-0.5">Build Command</span>
                    <span className="text-[#2f6f4f] dark:text-[#52b788] font-semibold">npm run build</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d]">
                    <span className="text-[10px] uppercase font-bold text-[#6b6f76] dark:text-[#9aa1b0] block mb-0.5">Output Directory</span>
                    <span className="text-[#14181f] dark:text-[#f1f3f7] font-semibold">dist</span>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 p-3 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-purple-700 dark:text-purple-300 block">
                    Optional Environment Variable in Vercel:
                  </span>
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#2b303c] dark:text-[#d3d8e2]">
                    <span>GEMINI_API_KEY = your-google-gemini-key</span>
                    <span className="text-[10px] text-[#6b6f76] dark:text-[#9aa1b0]">(Built-in fallbacks active if omitted)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GOOGLE PLAY STORE (ANDROID) */}
          {activeTab === 'playstore' && (
            <div className="space-y-6">
              {/* Ready Status Card */}
              <div className="bg-gradient-to-r from-[#2f6f4f]/15 via-[#2f6f4f]/5 to-transparent border border-[#2f6f4f]/30 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#2f6f4f] dark:text-[#52b788] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#52b788] animate-pulse" />
                    Android App Bundle (.aab) Architecture Ready
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#2f6f4f]/20 text-[#2f6f4f] dark:text-[#52b788]">
                    TWA / PWA
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#14181f] dark:text-[#f1f3f7] mb-1">
                  Publish Reelcast Studio directly to Google Play Store
                </h3>
                <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0] leading-relaxed">
                  Your application is pre-configured with a Web App Manifest, Service Worker offline caching, 192x192 &amp; 512x512 adaptive icons, and Digital Asset Links (<code className="font-mono text-[11px] bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">/.well-known/assetlinks.json</code>) required by Google Play Console.
                </p>

                {/* Pre-flight feature chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#2f6f4f]/20">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#2f6f4f] dark:text-[#52b788]">
                    <Check className="w-3.5 h-3.5" />
                    <span>Manifest v2</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#2f6f4f] dark:text-[#52b788]">
                    <Check className="w-3.5 h-3.5" />
                    <span>512px Maskable Icon</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#2f6f4f] dark:text-[#52b788]">
                    <Check className="w-3.5 h-3.5" />
                    <span>Service Worker</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#2f6f4f] dark:text-[#52b788]">
                    <Check className="w-3.5 h-3.5" />
                    <span>AssetLinks Active</span>
                  </div>
                </div>
              </div>

              {/* Step 1: Package with PWABuilder */}
              <div className="bg-[#fcfbf9] dark:bg-[#12161f] border border-[#e4e1da] dark:border-[#222834] rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#2f6f4f] text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h4 className="text-sm font-bold text-[#14181f] dark:text-[#f1f3f7]">
                    Generate Android Package (.aab) with PWABuilder (Free &amp; Official)
                  </h4>
                </div>
                <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0] leading-relaxed">
                  PWABuilder (backed by Google and Microsoft) turns your live URL into a signed, production-ready <strong>Android App Bundle (.aab)</strong> for Google Play with zero Android Studio coding needed.
                </p>

                <div className="p-3 bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d] rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">Your App URL to Package:</div>
                    <div className="text-xs font-mono text-[#2f6f4f] dark:text-[#52b788] font-semibold truncate max-w-md">
                      {liveUrl}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(liveUrl, 'pwa-url')}
                      className="px-3 py-1.5 bg-[#f7f6f3] dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#2f3847] text-[#14181f] dark:text-[#f1f3f7] rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      {copiedKey === 'pwa-url' ? <Check className="w-3.5 h-3.5 text-[#2f6f4f]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy URL</span>
                    </button>
                    <a
                      href={`https://www.pwabuilder.com?url=${encodeURIComponent(liveUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#2f6f4f] hover:bg-[#25593f] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Open PWABuilder</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="text-xs text-[#6b6f76] dark:text-[#9aa1b0] space-y-1 pl-1">
                  <p>• On PWABuilder: Click <strong>"Start"</strong> ➔ click <strong>"Package for Stores"</strong> ➔ select <strong>"Google Play (Android)"</strong>.</p>
                  <p>• Download the generated <strong>.aab (Android App Bundle)</strong> file to your computer.</p>
                </div>
              </div>

              {/* Step 2: Digital Asset Links (assetlinks.json) */}
              <div className="bg-[#fcfbf9] dark:bg-[#12161f] border border-[#e4e1da] dark:border-[#222834] rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#2f6f4f] text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h4 className="text-sm font-bold text-[#14181f] dark:text-[#f1f3f7]">
                    Connect Digital Asset Links (Removes Chrome URL bar on Android)
                  </h4>
                </div>
                <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0] leading-relaxed">
                  Google Play uses <code className="font-mono text-[11px] bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">/.well-known/assetlinks.json</code> to verify that your app bundle belongs to your web domain so the app runs completely full-screen without a browser header.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6b6f76] dark:text-[#9aa1b0] mb-1">
                      Android Package Name
                    </label>
                    <input
                      type="text"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      placeholder="app.reelcast.studio"
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d] text-[#14181f] dark:text-[#e2e8f0] focus:outline-hidden focus:border-[#2f6f4f]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6b6f76] dark:text-[#9aa1b0] mb-1">
                      SHA-256 App Fingerprint (from Play Console)
                    </label>
                    <input
                      type="text"
                      value={sha256Fingerprint}
                      onChange={(e) => setSha256Fingerprint(e.target.value)}
                      placeholder="14:6D:E9:7F:0F:52:EA:CB:54:60:4F:78:..."
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d] text-[#14181f] dark:text-[#e2e8f0] focus:outline-hidden focus:border-[#2f6f4f]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveAssetLinks}
                      disabled={isSavingAssetLinks}
                      className="px-3 py-1.5 bg-[#2f6f4f] hover:bg-[#25593f] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {isSavingAssetLinks ? 'Saving...' : 'Update Server AssetLinks'}
                    </button>
                    <a
                      href={`${liveUrl}/.well-known/assetlinks.json`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#ece8df] dark:hover:bg-[#262e3d] text-[#14181f] dark:text-[#f1f3f7] border border-[#e4e1da] dark:border-[#2f3847] rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <span>View Live assetlinks.json</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {assetLinksStatus && (
                    <span className="text-xs text-[#2f6f4f] dark:text-[#52b788] font-medium">
                      {assetLinksStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Step 3: Google Play Console Submission Checklist */}
              <div className="bg-[#fcfbf9] dark:bg-[#12161f] border border-[#e4e1da] dark:border-[#222834] rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#2f6f4f] text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h4 className="text-sm font-bold text-[#14181f] dark:text-[#f1f3f7]">
                    Upload &amp; Submit on Google Play Console
                  </h4>
                </div>

                <div className="space-y-2 text-xs text-[#6b6f76] dark:text-[#9aa1b0] leading-relaxed">
                  <div className="p-3 bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d] rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#14181f] dark:text-[#f1f3f7]">1. Create App on Play Console</span>
                      <a
                        href="https://play.google.com/console"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2f6f4f] dark:text-[#52b788] flex items-center gap-1 font-semibold"
                      >
                        play.google.com/console <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p>Log into Google Play Console (one-time $25 developer account), click <strong>"Create app"</strong>, choose <strong>"App"</strong>, and select <strong>"Free"</strong>.</p>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d] rounded-lg space-y-2">
                    <span className="font-semibold text-[#14181f] dark:text-[#f1f3f7]">2. Fill Required Policy URLs</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[11px] font-medium text-[#6b6f76] dark:text-[#9aa1b0]">Privacy Policy:</div>
                        <div className="font-mono text-[#2f6f4f] dark:text-[#52b788] truncate">{privacyUrl}</div>
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-[#6b6f76] dark:text-[#9aa1b0]">Target Audience:</div>
                        <div className="font-medium text-[#14181f] dark:text-[#f1f3f7]">13+ / General Audience</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d] rounded-lg space-y-2">
                    <span className="font-semibold text-[#14181f] dark:text-[#f1f3f7]">3. Upload the .aab Release</span>
                    <p>Go to <strong>Releases ➔ Production</strong> (or <em>Closed testing</em>), click <strong>Create new release</strong>, and drag the <strong>.aab file</strong> you downloaded from PWABuilder into the upload zone.</p>
                    <p>Click <strong>Review and roll out</strong> ➔ Google Play will review and approve your app within 24–48 hours!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: LIVE WEBSITE & SHARING */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              {/* Live URL Highlight Card */}
              <div className="bg-gradient-to-r from-[#2f6f4f]/10 via-[#2f6f4f]/5 to-transparent border border-[#2f6f4f]/30 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#2f6f4f] dark:text-[#52b788] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#52b788] animate-pulse" />
                    Your App is Already Live Online
                  </span>
                  <span className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                    Powered by Google Cloud
                  </span>
                </div>
                <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0] mb-3">
                  This web application is currently built and hosted on Google Cloud Run. Anyone with this link can view the studio, format captions, and connect accounts.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white dark:bg-[#12161f] border border-[#e4e1da] dark:border-[#262e3d] rounded-lg p-2">
                  <input
                    type="text"
                    readOnly
                    value={liveUrl}
                    className="flex-1 text-xs font-mono bg-transparent px-2 py-1 outline-hidden text-[#14181f] dark:text-[#e2e8f0] select-all truncate"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(liveUrl, 'live-url')}
                      className="px-3 py-1.5 bg-[#2f6f4f] hover:bg-[#25593f] text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      {copiedKey === 'live-url' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#ece8df] dark:hover:bg-[#262e3d] text-[#14181f] dark:text-[#f1f3f7] border border-[#e4e1da] dark:border-[#2f3847] rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Live</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Sharing Instructions */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#14181f] dark:text-[#f1f3f7] flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#2f6f4f] dark:text-[#52b788]" />
                  How to Share & Give Access to Clients / Team
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#fcfbf9] dark:bg-[#12161f] border border-[#e4e1da] dark:border-[#222834] rounded-xl p-4">
                    <div className="w-6 h-6 rounded-full bg-[#2f6f4f]/20 text-[#2f6f4f] dark:text-[#52b788] text-xs font-bold flex items-center justify-center mb-2">
                      1
                    </div>
                    <h4 className="text-xs font-semibold text-[#14181f] dark:text-[#f1f3f7] mb-1">
                      Direct Public Link
                    </h4>
                    <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0] leading-relaxed">
                      Copy the Shared App URL above and send it directly via Slack, WhatsApp, email, or client portals. It opens instantly on mobile & desktop browsers.
                    </p>
                  </div>

                  <div className="bg-[#fcfbf9] dark:bg-[#12161f] border border-[#e4e1da] dark:border-[#222834] rounded-xl p-4">
                    <div className="w-6 h-6 rounded-full bg-[#2f6f4f]/20 text-[#2f6f4f] dark:text-[#52b788] text-xs font-bold flex items-center justify-center mb-2">
                      2
                    </div>
                    <h4 className="text-xs font-semibold text-[#14181f] dark:text-[#f1f3f7] mb-1">
                      AI Studio Share Button
                    </h4>
                    <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0] leading-relaxed">
                      Look at the top-right corner of Google AI Studio: click the <strong>"Share"</strong> icon to create a shareable preview link or invite collaborators by email.
                    </p>
                  </div>
                </div>
              </div>

              {/* Installable PWA Banner */}
              <div className="bg-[#f4f7f5] dark:bg-[#14201a] border border-[#2f6f4f]/20 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#2f6f4f] text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">
                      Install as a Native Web App (PWA)
                    </h4>
                    <p className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                      Open the live URL in Google Chrome, Edge, or Safari mobile, then click "Install App" or "Add to Home Screen" to run Reelcast as a standalone desktop or mobile application.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: META DEVELOPER "GO LIVE" */}
          {activeTab === 'meta' && (
            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-[#241a10] border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Why does Meta require publishing to "Live Mode"?
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-1 leading-relaxed">
                      While your Meta App is in <strong>Development Mode</strong>, only yourself and registered Test Users can log in. To allow real Instagram accounts and Facebook Pages to connect and publish Reels, Meta requires you to switch your App Mode to <strong>Live</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step by Step Checklist for Meta */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#14181f] dark:text-[#f1f3f7]">
                  Meta Go-Live Checklist (Required URLs)
                </h3>

                {/* Checklist Item 1: Privacy Policy URL */}
                <div className="bg-[#fcfbf9] dark:bg-[#12161f] border border-[#e4e1da] dark:border-[#222834] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#2f6f4f] text-white text-[11px] font-bold flex items-center justify-center">
                        1
                      </span>
                      <span className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">
                        Privacy Policy URL
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Required by Meta
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenLegal('privacy')}
                      className="text-xs text-[#2f6f4f] dark:text-[#52b788] hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Preview Document</span>
                    </button>
                  </div>
                  <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
                    Paste this into <strong>Meta for Developers &gt; App Settings &gt; Basic &gt; Privacy Policy URL</strong>:
                  </p>
                  <div className="flex items-center gap-2 bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d] rounded-lg p-1.5">
                    <input
                      type="text"
                      readOnly
                      value={privacyUrl}
                      className="flex-1 text-xs font-mono bg-transparent px-2 py-0.5 outline-hidden text-[#14181f] dark:text-[#e2e8f0] select-all truncate"
                    />
                    <button
                      onClick={() => copyToClipboard(privacyUrl, 'privacy-url')}
                      className="px-2.5 py-1 bg-[#2f6f4f] hover:bg-[#25593f] text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === 'privacy-url' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                {/* Checklist Item 2: Terms of Service URL */}
                <div className="bg-[#fcfbf9] dark:bg-[#12161f] border border-[#e4e1da] dark:border-[#222834] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#2f6f4f] text-white text-[11px] font-bold flex items-center justify-center">
                        2
                      </span>
                      <span className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">
                        Terms of Service URL
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Required by Meta
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenLegal('terms')}
                      className="text-xs text-[#2f6f4f] dark:text-[#52b788] hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Preview Document</span>
                    </button>
                  </div>
                  <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
                    Paste this into <strong>Meta for Developers &gt; App Settings &gt; Basic &gt; Terms of Service URL</strong>:
                  </p>
                  <div className="flex items-center gap-2 bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d] rounded-lg p-1.5">
                    <input
                      type="text"
                      readOnly
                      value={termsUrl}
                      className="flex-1 text-xs font-mono bg-transparent px-2 py-0.5 outline-hidden text-[#14181f] dark:text-[#e2e8f0] select-all truncate"
                    />
                    <button
                      onClick={() => copyToClipboard(termsUrl, 'terms-url')}
                      className="px-2.5 py-1 bg-[#2f6f4f] hover:bg-[#25593f] text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === 'terms-url' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                {/* Checklist Item 3: User Data Deletion Callback URL */}
                <div className="bg-[#fcfbf9] dark:bg-[#12161f] border border-[#e4e1da] dark:border-[#222834] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#2f6f4f] text-white text-[11px] font-bold flex items-center justify-center">
                        3
                      </span>
                      <span className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">
                        User Data Deletion Callback URL
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Live Ready
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
                    Paste this into <strong>App Settings &gt; Basic &gt; User Data Deletion &gt; Data Deletion Request Callback URL</strong>:
                  </p>
                  <div className="flex items-center gap-2 bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d] rounded-lg p-1.5">
                    <input
                      type="text"
                      readOnly
                      value={deletionCallbackUrl}
                      className="flex-1 text-xs font-mono bg-transparent px-2 py-0.5 outline-hidden text-[#14181f] dark:text-[#e2e8f0] select-all truncate"
                    />
                    <button
                      onClick={() => copyToClipboard(deletionCallbackUrl, 'del-url')}
                      className="px-2.5 py-1 bg-[#2f6f4f] hover:bg-[#25593f] text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === 'del-url' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                {/* Checklist Item 4: OAuth Redirect URI */}
                <div className="bg-[#fcfbf9] dark:bg-[#12161f] border border-[#e4e1da] dark:border-[#222834] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#2f6f4f] text-white text-[11px] font-bold flex items-center justify-center">
                        4
                      </span>
                      <span className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">
                        Valid OAuth Redirect URI
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
                    Paste this into <strong>Facebook Login for Business &gt; Settings &gt; Valid OAuth Redirect URIs</strong>:
                  </p>
                  <div className="flex items-center gap-2 bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d] rounded-lg p-1.5">
                    <input
                      type="text"
                      readOnly
                      value={oauthCallbackUrl}
                      className="flex-1 text-xs font-mono bg-transparent px-2 py-0.5 outline-hidden text-[#14181f] dark:text-[#e2e8f0] select-all truncate"
                    />
                    <button
                      onClick={() => copyToClipboard(oauthCallbackUrl, 'oauth-url')}
                      className="px-2.5 py-1 bg-[#2f6f4f] hover:bg-[#25593f] text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === 'oauth-url' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                {/* Checklist Item 5: Flip the Switch */}
                <div className="bg-gradient-to-r from-[#2f6f4f]/15 to-[#52b788]/10 border border-[#2f6f4f]/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#2f6f4f] text-white text-[11px] font-bold flex items-center justify-center">
                      5
                    </span>
                    <span className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">
                      Toggle App Mode: "Development" ➔ "Live"
                    </span>
                  </div>
                  <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0] leading-relaxed">
                    At the very top header of your dashboard on <strong>developers.facebook.com</strong>, toggle the switch from <strong>Development</strong> to <strong>Live</strong>. Meta will verify that the Privacy Policy URL is reachable (returns HTTP 200) and publish your app immediately!
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <a
                      href="https://developers.facebook.com/apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#2f6f4f] hover:bg-[#25593f] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Open Meta App Dashboard</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={onOpenAccounts}
                      className="px-3 py-1.5 bg-white dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#2f3847] text-[#14181f] dark:text-[#f1f3f7] rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Test Meta Connection</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SELF-HOSTING / CUSTOM DOMAIN */}
          {activeTab === 'hosting' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#14181f] dark:text-[#f1f3f7]">
                  Deploying to Custom Hosting / Custom Domains
                </h3>
                <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0] leading-relaxed">
                  Reelcast Studio is built with standard Node.js, Express, and Vite. You can deploy it to any cloud host with zero vendor lock-in.
                </p>
              </div>

              {/* Hosting Option Cards */}
              <div className="space-y-3">
                {/* Option 1: Vercel / Render / Railway */}
                <div className="bg-[#fcfbf9] dark:bg-[#12161f] border border-[#e4e1da] dark:border-[#222834] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">
                      Option A: Render / Railway / Fly.io / Heroku (Full-Stack)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f0eee9] dark:bg-[#1f2633] text-[#6b6f76] dark:text-[#9aa1b0]">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
                    These services run both the React frontend and the Express backend server (which handles OAuth callbacks and token exchanges).
                  </p>
                  <div className="bg-[#161b24] p-3 rounded-lg font-mono text-[11px] text-[#9aa1b0] space-y-1">
                    <div># Build Command:</div>
                    <div className="text-[#52b788]">npm run build</div>
                    <div className="mt-1"># Start Command:</div>
                    <div className="text-[#52b788]">npm start</div>
                  </div>
                </div>

                {/* Option 2: Docker / Google Cloud Run */}
                <div className="bg-[#fcfbf9] dark:bg-[#12161f] border border-[#e4e1da] dark:border-[#222834] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">
                      Option B: Docker / Container
                    </span>
                  </div>
                  <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
                    Package as a lightweight container exposing port 3000:
                  </p>
                  <div className="bg-[#161b24] p-3 rounded-lg font-mono text-[11px] text-[#9aa1b0] space-y-1">
                    <div>FROM node:20-alpine</div>
                    <div>WORKDIR /app &amp;&amp; COPY package*.json ./ &amp;&amp; RUN npm install</div>
                    <div>COPY . . &amp;&amp; RUN npm run build</div>
                    <div>EXPOSE 3000</div>
                    <div className="text-[#52b788]">CMD ["node", "dist/server.cjs"]</div>
                  </div>
                </div>

                {/* Environment Variables Summary */}
                <div className="bg-[#fcfbf9] dark:bg-[#12161f] border border-[#e4e1da] dark:border-[#222834] rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">
                    Production Environment Variables (.env)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d]">
                      <div className="text-[#2f6f4f] dark:text-[#52b788] font-semibold">PORT</div>
                      <div className="text-[#6b6f76] dark:text-[#9aa1b0] text-[11px]">3000</div>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d]">
                      <div className="text-[#2f6f4f] dark:text-[#52b788] font-semibold">APP_URL</div>
                      <div className="text-[#6b6f76] dark:text-[#9aa1b0] text-[11px]">https://your-domain.com</div>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d]">
                      <div className="text-[#2f6f4f] dark:text-[#52b788] font-semibold">META_CLIENT_ID</div>
                      <div className="text-[#6b6f76] dark:text-[#9aa1b0] text-[11px]">Your Meta App ID</div>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262e3d]">
                      <div className="text-[#2f6f4f] dark:text-[#52b788] font-semibold">META_CLIENT_SECRET</div>
                      <div className="text-[#6b6f76] dark:text-[#9aa1b0] text-[11px]">Your Meta App Secret</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#e4e1da] dark:border-[#222834] bg-[#fbfaf8] dark:bg-[#131720] flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-[#2f6f4f] dark:hover:text-[#52b788] underline underline-offset-2"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenLegal('terms')}
              className="hover:text-[#2f6f4f] dark:hover:text-[#52b788] underline underline-offset-2"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenLegal('deletion')}
              className="hover:text-[#2f6f4f] dark:hover:text-[#52b788] underline underline-offset-2"
            >
              Data Deletion
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2f6f4f] hover:bg-[#25593f] text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

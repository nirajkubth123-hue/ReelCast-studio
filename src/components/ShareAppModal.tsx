import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  MessageCircle,
  Twitter,
  Linkedin,
  Mail,
  Send,
  QrCode,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  // Use current live window URL or fallback
  const shareUrl = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://ais-pre-kfeiq3ekgs3ctyqtmewwca-946555399286.asia-east1.run.app';

  const shareTitle = 'Reelcast Social Studio - AI Video Publisher for Reels & Shorts';
  const shareText = 'Check out Reelcast Social Studio! Cross-publish your vertical videos to Instagram Reels, Facebook Reels, and YouTube Shorts simultaneously with AI captioning and hashtags.';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Native Web Share API if supported (mobile browsers, macOS Safari, etc.)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  // Social sharing links
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} \n${shareUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\nAccess here: ${shareUrl}`)}`;

  // Quick QR code via reliable Google Charts API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareUrl)}&color=14-18-24&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#151922] border border-[#e4e1da] dark:border-[#262c3a] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Brand Gradient */}
        <div className="relative p-6 pb-5 border-b border-[#ece8df] dark:border-[#222836] bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-orange-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-orange-500 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-white dark:bg-[#151922] rounded-[10px] flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#14181f] dark:text-[#f1f3f7] flex items-center gap-2">
                  Share Reelcast Studio
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                    Live Web
                  </span>
                </h3>
                <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
                  Invite creators, teammates, or friends to use this application
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#6b6f76] hover:text-[#14181f] dark:hover:text-white rounded-lg hover:bg-[#ece8df] dark:hover:bg-[#202735] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Quick Copy Link Box */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6f76] dark:text-[#9aa1b0] mb-2">
              Application Web Link
            </label>
            <div className="flex items-center gap-2 p-1.5 bg-[#f7f6f3] dark:bg-[#1a202c] border border-[#e4e1da] dark:border-[#262c3a] rounded-xl">
              <div className="flex-1 px-3 py-1.5 text-xs font-mono text-[#14181f] dark:text-[#e2e8f0] truncate select-all">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#14181f] dark:bg-white text-white dark:text-[#14181f] hover:opacity-90'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1 font-medium animate-in fade-in">
                <Check className="w-3 h-3" /> Link copied to clipboard! Paste it anywhere to share.
              </p>
            )}
          </div>

          {/* Instant Social Channels */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6f76] dark:text-[#9aa1b0] mb-2.5">
              Share directly via
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200/60 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 transition-all hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-medium">WhatsApp</span>
              </a>

              {/* Twitter / X */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-sky-50 dark:bg-sky-950/20 hover:bg-sky-100 dark:hover:bg-sky-900/30 border border-sky-200/60 dark:border-sky-800/30 text-sky-700 dark:text-sky-400 transition-all hover:-translate-y-0.5"
              >
                <Twitter className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-medium">X (Twitter)</span>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200/60 dark:border-blue-800/30 text-blue-700 dark:text-blue-400 transition-all hover:-translate-y-0.5"
              >
                <Send className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-medium">Telegram</span>
              </a>

              {/* LinkedIn */}
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border border-indigo-200/60 dark:border-indigo-800/30 text-indigo-700 dark:text-indigo-400 transition-all hover:-translate-y-0.5"
              >
                <Linkedin className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-medium">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Action Row: QR Code & Native Share */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Device Share Menu</span>
              </button>
            )}

            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#f7f6f3] dark:bg-[#1a202c] hover:bg-[#ede9df] dark:hover:bg-[#252c3c] text-[#14181f] dark:text-[#f1f3f7] border border-[#e4e1da] dark:border-[#262c3a] rounded-xl text-xs font-semibold transition-all"
            >
              <QrCode className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{showQR ? 'Hide QR Code' : 'Scan on Mobile (QR)'}</span>
            </button>
          </div>

          {/* QR Code Expansion */}
          {showQR && (
            <div className="p-4 bg-white dark:bg-[#10141d] border border-[#e4e1da] dark:border-[#262c3a] rounded-xl flex flex-col items-center justify-center gap-3 animate-in zoom-in-95 duration-200">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <img 
                  src={qrCodeUrl} 
                  alt="App Link QR Code" 
                  className="w-44 h-44 object-contain rounded" 
                />
              </div>
              <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0] text-center max-w-xs">
                Scan with any smartphone camera to open and use <strong>Reelcast Studio</strong> immediately!
              </p>
            </div>
          )}

          {/* Info Card */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-[#525760] dark:text-[#a0a6b5]">
              <span className="font-semibold text-[#14181f] dark:text-[#f1f3f7]">100% Free & Open: </span>
              Anyone with this link can open Reelcast Studio, preview Reels, test AI captions, and cross-publish with zero download required.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#fbfaf8] dark:bg-[#121620] border-t border-[#ece8df] dark:border-[#222836] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#14181f] dark:text-white bg-white dark:bg-[#1c222e] hover:bg-[#f2efe9] dark:hover:bg-[#252c3c] border border-[#e4e1da] dark:border-[#262c3a] rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

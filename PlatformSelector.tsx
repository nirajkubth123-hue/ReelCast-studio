import React from 'react';
import { Layers, Check, Instagram, Facebook, Youtube, AlertCircle, Info } from 'lucide-react';
import { PlatformId, SocialAccount, VideoMetadata } from '../types';
import { PLATFORMS } from '../data/mockData';
import { useI18n } from '../i18n/I18nContext';

interface PlatformSelectorProps {
  selectedPlatforms: PlatformId[];
  onTogglePlatform: (platform: PlatformId) => void;
  onSelectAll: () => void;
  accounts: SocialAccount[];
  video: VideoMetadata | null;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatforms,
  onTogglePlatform,
  onSelectAll,
  accounts,
  video
}) => {
  const { t } = useI18n();

  const getPlatformAccount = (platformId: PlatformId) => {
    return accounts.find(a => a.platform === platformId);
  };

  const getPlatformName = (platformId: PlatformId) => {
    switch (platformId) {
      case 'instagram': return t('platforms.igName');
      case 'facebook': return t('platforms.fbName');
      case 'youtube': return t('platforms.ytName');
    }
  };

  const getPlatformDesc = (platformId: PlatformId) => {
    switch (platformId) {
      case 'instagram': return t('platforms.igDesc');
      case 'facebook': return t('platforms.fbDesc');
      case 'youtube': return t('platforms.ytDesc');
    }
  };

  const getPlatformIcon = (platformId: PlatformId) => {
    switch (platformId) {
      case 'instagram':
        return <Instagram className="w-5 h-5 text-[#E1306C]" />;
      case 'facebook':
        return <Facebook className="w-5 h-5 text-[#1877F2]" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-[#FF0000]" />;
    }
  };

  const effectiveDuration = video?.trim ? video.trim.durationSec : (video?.durationSec || 0);

  return (
    <div className="bg-white dark:bg-[#161b24] rounded-xl border border-[#e4e1da] dark:border-[#222834] p-5 shadow-xs transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#2f6f4f]/10 dark:bg-[#2f6f4f]/20 text-[#2f6f4f] dark:text-[#52b788] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#14181f] dark:text-[#f1f3f7]">
              {t('platforms.stepTitle')}
            </h2>
            <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
              {t('platforms.stepSubtitle')}
            </p>
          </div>
        </div>

        <button
          id="btn-select-all-platforms"
          type="button"
          onClick={onSelectAll}
          className="text-xs font-medium text-[#2f6f4f] dark:text-[#52b788] hover:text-[#265b41] dark:hover:text-[#6ee7b7] hover:underline"
        >
          {selectedPlatforms.length === 3 ? t('platforms.deselectAll') : t('platforms.selectAll', { count: 3 })}
        </button>
      </div>

      {/* Grid of Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(['instagram', 'facebook', 'youtube'] as PlatformId[]).map((platformId) => {
          const config = PLATFORMS[platformId];
          const account = getPlatformAccount(platformId);
          const isSelected = selectedPlatforms.includes(platformId);
          const isConnected = account?.isConnected ?? false;

          // Check for video constraint warning based on effective trimmed duration
          let warningText = '';
          if (video && effectiveDuration > config.maxDurationSec) {
            warningText = t('platforms.durationWarning', {
              duration: effectiveDuration,
              platform: config.shortName,
              max: config.maxDurationSec
            });
          }

          return (
            <div
              key={platformId}
              id={`platform-card-${platformId}`}
              onClick={() => onTogglePlatform(platformId)}
              className={`relative rounded-xl border p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#2f6f4f] dark:border-[#52b788] bg-[#fcfbfa] dark:bg-[#11161f] ring-1 ring-[#2f6f4f]/30 dark:ring-[#52b788]/30 shadow-xs'
                  : 'border-[#e4e1da] dark:border-[#222834] bg-white dark:bg-[#131720] hover:border-[#c8c4b9] dark:hover:border-[#353e50] opacity-80'
              }`}
            >
              {/* Header: Icon + Toggle Box */}
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#f7f6f3] dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#262c38] flex items-center justify-center">
                    {getPlatformIcon(platformId)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#14181f] dark:text-[#f1f3f7]">
                      {getPlatformName(platformId)}
                    </h3>
                    <span className="text-[10px] font-medium text-[#6b6f76] dark:text-[#9aa1b0] bg-[#f0ede6] dark:bg-[#1e2430] px-1.5 py-0.5 rounded-sm">
                      {config.badge}
                    </span>
                  </div>
                </div>

                {/* Custom Checkbox Switch */}
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[#2f6f4f] dark:bg-[#52b788] border-[#2f6f4f] dark:border-[#52b788] text-white dark:text-[#0b0e14]'
                      : 'border-[#d2cdc2] dark:border-[#3d475a] bg-white dark:bg-[#1c222d]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Account Handle & Connection Status */}
              <div className="mb-2.5 pt-2 border-t border-[#f0ede6] dark:border-[#222834] flex items-center justify-between text-xs">
                <div className="truncate text-[#14181f] dark:text-[#f1f3f7] font-medium">
                  {account?.handle || 'No account linked'}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-[#2f6f4f] dark:bg-[#52b788]' : 'bg-[#e4e1da] dark:bg-[#343d4d]'
                    }`}
                  />
                  <span className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                    {isConnected ? t('platforms.connected') : t('platforms.disconnected')}
                  </span>
                </div>
              </div>

              {/* Rules description */}
              <p className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0] line-clamp-2 leading-relaxed">
                {getPlatformDesc(platformId)}
              </p>

              {/* Warning note if any */}
              {warningText && isSelected && (
                <div className="mt-2 text-[10px] text-[#b3432b] bg-[#b3432b]/10 dark:bg-[#b3432b]/20 p-1.5 rounded flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{warningText}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedPlatforms.length === 0 && (
        <div className="mt-3 p-2.5 rounded-lg bg-[#b98221]/10 dark:bg-[#b98221]/20 border border-[#b98221]/20 text-xs text-[#b98221] dark:text-[#eab308] flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>Please select at least one platform to publish or schedule your video.</span>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, ExternalLink, Instagram, Facebook, Youtube, Share2, Sparkles, X } from 'lucide-react';
import { PlatformId, PublishMode, PublishTargetStatus, VideoMetadata } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoMetadata | null;
  selectedPlatforms: PlatformId[];
  mode: PublishMode;
  scheduledTime?: string;
  onViewHistory: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  video,
  selectedPlatforms,
  mode,
  scheduledTime,
  onViewHistory
}) => {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [targetStatuses, setTargetStatuses] = useState<Record<PlatformId, 'idle' | 'uploading' | 'published'>>({
    instagram: 'idle',
    facebook: 'idle',
    youtube: 'idle'
  });

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setTargetStatuses({ instagram: 'idle', facebook: 'idle', youtube: 'idle' });
      return;
    }

    if (mode === 'schedule') {
      setCurrentStep(4);
      return;
    }

    // Step 1: Uploading video asset
    setCurrentStep(1);
    const t1 = setTimeout(() => {
      // Step 2: Preparing tokens & signed link
      setCurrentStep(2);
    }, 1200);

    // Step 3: Fan-out publishing
    const t2 = setTimeout(() => {
      setCurrentStep(3);
      setTargetStatuses(prev => ({
        ...prev,
        instagram: selectedPlatforms.includes('instagram') ? 'uploading' : 'idle',
        facebook: selectedPlatforms.includes('facebook') ? 'uploading' : 'idle',
        youtube: selectedPlatforms.includes('youtube') ? 'uploading' : 'idle'
      }));
    }, 2200);

    // Complete individual platforms sequentially
    const t3 = setTimeout(() => {
      setTargetStatuses(prev => ({
        ...prev,
        instagram: selectedPlatforms.includes('instagram') ? 'published' : 'idle'
      }));
    }, 3400);

    const t4 = setTimeout(() => {
      setTargetStatuses(prev => ({
        ...prev,
        facebook: selectedPlatforms.includes('facebook') ? 'published' : 'idle'
      }));
    }, 4000);

    const t5 = setTimeout(() => {
      setTargetStatuses(prev => ({
        ...prev,
        youtube: selectedPlatforms.includes('youtube') ? 'published' : 'idle'
      }));
      setCurrentStep(4);
    }, 4600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isOpen, mode, selectedPlatforms]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-[#161b24] rounded-2xl border border-[#e4e1da] dark:border-[#222834] max-w-md w-full p-6 shadow-2xl space-y-5 transition-colors duration-200 cursor-default"
      >
        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] hover:bg-[#f0ede6] dark:hover:bg-[#1f2633] transition-colors"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-[#2f6f4f]/10 dark:bg-[#2f6f4f]/20 text-[#2f6f4f] dark:text-[#52b788] flex items-center justify-center mx-auto mb-2">
            {currentStep === 4 ? (
              <CheckCircle2 className="w-6 h-6 text-[#2f6f4f] dark:text-[#52b788]" />
            ) : mode === 'schedule' ? (
              <Clock className="w-6 h-6 text-[#2f6f4f] dark:text-[#52b788]" />
            ) : (
              <Share2 className="w-6 h-6 text-[#2f6f4f] dark:text-[#52b788] animate-pulse" />
            )}
          </div>

          <h3 className="text-base font-semibold text-[#14181f] dark:text-[#f1f3f7]">
            {mode === 'schedule'
              ? t('modal.scheduledSuccess')
              : currentStep === 4
              ? t('modal.publishedSuccess')
              : t('modal.fanoutProgress')}
          </h3>
          <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
            {mode === 'schedule'
              ? t('modal.scheduledSub', { time: scheduledTime || '' })
              : currentStep === 4
              ? t('modal.liveSub')
              : t('modal.orchestratingSub')}
          </p>
        </div>

        {/* Progress Timeline */}
        {mode === 'now' && (
          <div className="space-y-3 py-2">
            {/* Step 1 */}
            <div className="flex items-center gap-3 text-xs">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep > 1
                    ? 'bg-[#2f6f4f] text-white'
                    : currentStep === 1
                    ? 'bg-[#2f6f4f]/20 dark:bg-[#2f6f4f]/30 text-[#2f6f4f] dark:text-[#52b788] animate-pulse'
                    : 'bg-[#f0ede6] dark:bg-[#1e2430] text-[#6b6f76] dark:text-[#9aa1b0]'
                }`}
              >
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span className={currentStep >= 1 ? 'text-[#14181f] dark:text-[#f1f3f7] font-medium' : 'text-[#6b6f76] dark:text-[#9aa1b0]'}>
                {t('modal.step1', { name: video?.name || 'video.mp4' })}
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3 text-xs">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep > 2
                    ? 'bg-[#2f6f4f] text-white'
                    : currentStep === 2
                    ? 'bg-[#2f6f4f]/20 dark:bg-[#2f6f4f]/30 text-[#2f6f4f] dark:text-[#52b788] animate-pulse'
                    : 'bg-[#f0ede6] dark:bg-[#1e2430] text-[#6b6f76] dark:text-[#9aa1b0]'
                }`}
              >
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <span className={currentStep >= 2 ? 'text-[#14181f] dark:text-[#f1f3f7] font-medium' : 'text-[#6b6f76] dark:text-[#9aa1b0]'}>
                {t('modal.step2')}
              </span>
            </div>

            {/* Step 3: Platform Delivery Cards */}
            <div className="pt-2 space-y-2 border-t border-[#f0ede6] dark:border-[#222834]">
              {selectedPlatforms.map((platform) => {
                const isIg = platform === 'instagram';
                const isFb = platform === 'facebook';
                const isYt = platform === 'youtube';
                const status = targetStatuses[platform];

                return (
                  <div
                    key={platform}
                    className="p-2.5 rounded-lg border border-[#e4e1da] dark:border-[#262c38] bg-[#fbfbfa] dark:bg-[#11141c] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {isIg && <Instagram className="w-4 h-4 text-[#E1306C]" />}
                      {isFb && <Facebook className="w-4 h-4 text-[#1877F2]" />}
                      {isYt && <Youtube className="w-4 h-4 text-[#FF0000]" />}
                      <span className="font-medium text-[#14181f] dark:text-[#f1f3f7]">
                        {isIg ? 'Instagram Reels' : isFb ? 'Facebook Reels' : 'YouTube Shorts'}
                      </span>
                    </div>

                    <div>
                      {status === 'published' ? (
                        <span className="text-[11px] font-semibold text-[#2f6f4f] dark:text-[#52b788] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t('modal.statusPublished')}
                        </span>
                      ) : status === 'uploading' ? (
                        <span className="text-[11px] font-medium text-[#c4622d] flex items-center gap-1">
                          <div className="w-2.5 h-2.5 border-2 border-[#c4622d] border-t-transparent rounded-full animate-spin" />
                          {t('modal.statusPublishing')}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">{t('modal.statusQueued')}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0ede6] dark:border-[#222834]">
          <button
            type="button"
            onClick={onViewHistory}
            className="px-3.5 py-2 text-xs font-medium text-[#14181f] dark:text-[#f1f3f7] bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#262c38] rounded-lg transition-colors cursor-pointer"
          >
            {t('modal.viewHistory')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#2f6f4f] hover:bg-[#265b41] rounded-lg transition-colors cursor-pointer"
          >
            {t('modal.createAnother')}
          </button>
        </div>
      </div>
    </div>
  );
};

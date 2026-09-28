import React, { useState } from 'react';
import { Send, Calendar, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { PlatformId, PublishMode, VideoMetadata } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface SchedulePublishBarProps {
  video: VideoMetadata | null;
  selectedPlatforms: PlatformId[];
  isPublishing: boolean;
  onPublish: (mode: PublishMode, scheduledTime?: string) => void;
  onReset: () => void;
}

export const SchedulePublishBar: React.FC<SchedulePublishBarProps> = ({
  video,
  selectedPlatforms,
  isPublishing,
  onPublish,
  onReset
}) => {
  const { t } = useI18n();

  const [mode, setMode] = useState<PublishMode>('now');
  const [scheduleDate, setScheduleDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduleTime, setScheduleTime] = useState('18:00');

  const canPublish = video !== null && selectedPlatforms.length > 0 && !isPublishing;

  const handleAction = () => {
    if (!canPublish) return;
    if (mode === 'now') {
      onPublish('now');
    } else {
      onPublish('schedule', `${scheduleDate} at ${scheduleTime}`);
    }
  };

  const setSuggestedTime = (dayOffset: number, timeStr: string) => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    setScheduleDate(d.toISOString().split('T')[0]);
    setScheduleTime(timeStr);
    setMode('schedule');
  };

  return (
    <div className="bg-white dark:bg-[#161b24] rounded-xl border border-[#e4e1da] dark:border-[#222834] p-5 shadow-xs space-y-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#2f6f4f]/10 dark:bg-[#2f6f4f]/20 text-[#2f6f4f] dark:text-[#52b788] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#14181f] dark:text-[#f1f3f7]">
              {t('schedule.stepTitle')}
            </h2>
            <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
              {t('schedule.stepSubtitle')}
            </p>
          </div>
        </div>

        {/* Mode Toggle Radio/Pills */}
        <div className="flex items-center p-1 bg-[#f7f6f3] dark:bg-[#11141c] border border-[#e4e1da] dark:border-[#262c38] rounded-lg">
          <button
            id="btn-mode-now"
            type="button"
            onClick={() => setMode('now')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              mode === 'now'
                ? 'bg-white dark:bg-[#1e2430] text-[#14181f] dark:text-[#f1f3f7] shadow-xs'
                : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
          >
            {t('schedule.modeNow')}
          </button>
          <button
            id="btn-mode-schedule"
            type="button"
            onClick={() => setMode('schedule')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              mode === 'schedule'
                ? 'bg-white dark:bg-[#1e2430] text-[#14181f] dark:text-[#f1f3f7] shadow-xs'
                : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
          >
            {t('schedule.modeSchedule')}
          </button>
        </div>
      </div>

      {/* Schedule Picker Sub-box if Schedule Mode is Active */}
      {mode === 'schedule' && (
        <div className="p-3.5 bg-[#fbfbfa] dark:bg-[#11141c] border border-[#e4e1da] dark:border-[#222834] rounded-lg space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="input-schedule-date" className="block text-xs font-medium text-[#14181f] dark:text-[#f1f3f7] mb-1">
                {t('schedule.dateLabel')}
              </label>
              <div className="relative">
                <input
                  id="input-schedule-date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-[#e4e1da] dark:border-[#262c38] bg-white dark:bg-[#161b24] text-[#14181f] dark:text-[#f1f3f7] focus:border-[#2f6f4f] dark:focus:border-[#52b788] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label htmlFor="input-schedule-time" className="block text-xs font-medium text-[#14181f] dark:text-[#f1f3f7] mb-1">
                {t('schedule.timeLabel')}
              </label>
              <div className="relative">
                <input
                  id="input-schedule-time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-[#e4e1da] dark:border-[#262c38] bg-white dark:bg-[#161b24] text-[#14181f] dark:text-[#f1f3f7] focus:border-[#2f6f4f] dark:focus:border-[#52b788] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Optimal Posting Times Recommendations */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-medium text-[#6b6f76] dark:text-[#9aa1b0] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#c4622d]" />
              {t('schedule.peakSlots')}
            </span>
            <button
              type="button"
              onClick={() => setSuggestedTime(0, '18:30')}
              className="text-[11px] bg-white dark:bg-[#1c222d] hover:bg-[#f4f1ea] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#2b3342] text-[#14181f] dark:text-[#f1f3f7] px-2 py-0.5 rounded-md transition-colors cursor-pointer"
            >
              {t('schedule.today630')}
            </button>
            <button
              type="button"
              onClick={() => setSuggestedTime(1, '12:00')}
              className="text-[11px] bg-white dark:bg-[#1c222d] hover:bg-[#f4f1ea] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#2b3342] text-[#14181f] dark:text-[#f1f3f7] px-2 py-0.5 rounded-md transition-colors cursor-pointer"
            >
              {t('schedule.tomorrow12')}
            </button>
            <button
              type="button"
              onClick={() => setSuggestedTime(1, '19:00')}
              className="text-[11px] bg-white dark:bg-[#1c222d] hover:bg-[#f4f1ea] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#2b3342] text-[#14181f] dark:text-[#f1f3f7] px-2 py-0.5 rounded-md transition-colors cursor-pointer"
            >
              {t('schedule.tomorrow19')}
            </button>
          </div>
        </div>
      )}

      {/* Warnings if unable to publish */}
      {!video && (
        <div className="flex items-center gap-1.5 text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
          <AlertCircle className="w-4 h-4 text-[#b98221]" />
          <span>{t('schedule.noVideoWarning')}</span>
        </div>
      )}

      {/* Action Footer Button Bar */}
      <div className="pt-2 border-t border-[#f0ede6] dark:border-[#222834] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
          {selectedPlatforms.length > 0 ? (
            <span>
              {t('schedule.targeting')}{' '}
              <strong className="text-[#14181f] dark:text-[#f1f3f7]">
                {t('schedule.platformsSelected', { count: selectedPlatforms.length })}
              </strong>{' '}
              (
              {selectedPlatforms
                .map((p) => (p === 'instagram' ? 'Instagram' : p === 'facebook' ? 'Facebook' : 'YouTube'))
                .join(', ')}
              )
            </span>
          ) : (
            <span className="text-[#b3432b]">{t('schedule.noPlatforms')}</span>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            id="btn-reset-studio"
            type="button"
            onClick={onReset}
            disabled={isPublishing}
            className="px-3.5 py-2.5 text-xs font-medium text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] hover:bg-[#f7f6f3] dark:hover:bg-[#1c222d] rounded-lg transition-colors cursor-pointer"
          >
            {t('schedule.resetForm')}
          </button>

          <button
            id="btn-execute-publish"
            type="button"
            onClick={handleAction}
            disabled={!canPublish}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-all ${
              canPublish
                ? 'bg-[#2f6f4f] hover:bg-[#265b41] hover:shadow cursor-pointer'
                : 'bg-[#a3b8ad] dark:bg-[#283930] dark:text-[#6a7f74] cursor-not-allowed'
            }`}
          >
            {isPublishing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('schedule.processing')}</span>
              </>
            ) : mode === 'now' ? (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{t('schedule.publishNowBtn', { count: selectedPlatforms.length })}</span>
              </>
            ) : (
              <>
                <Calendar className="w-3.5 h-3.5" />
                <span>{t('schedule.scheduleForBtn', { date: scheduleDate })}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

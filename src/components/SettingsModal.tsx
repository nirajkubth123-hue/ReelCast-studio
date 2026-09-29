import React, { useState } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Bell,
  Globe,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Database,
  ShieldCheck,
  Video,
  Volume2
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export interface AppSettingsState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoSaveDrafts: boolean;
  highQualityPreview: boolean;
  soundEffects: boolean;
  desktopNotifications: boolean;
  defaultPublishMode: 'now' | 'schedule';
  defaultVideoQuality: '1080p' | '720p' | 'original';
  autoAddHashtags: boolean;
  simulateAbTesting: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettingsState = {
  theme: 'system',
  language: 'en',
  autoSaveDrafts: true,
  highQualityPreview: true,
  soundEffects: false,
  desktopNotifications: true,
  defaultPublishMode: 'now',
  defaultVideoQuality: '1080p',
  autoAddHashtags: true,
  simulateAbTesting: true,
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: 'light' | 'dark';
  onSetTheme: (theme: 'light' | 'dark') => void;
  settings: AppSettingsState;
  onUpdateSettings: (newSettings: Partial<AppSettingsState>) => void;
  onResetAllData?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSetTheme,
  settings,
  onUpdateSettings,
  onResetAllData,
}) => {
  const { t, language, setLanguage } = useI18n();
  const [activeTab, setActiveTab] = useState<'appearance' | 'studio' | 'notifications' | 'storage'>('appearance');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    onUpdateSettings({ theme: newTheme });
    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      onSetTheme(systemDark ? 'dark' : 'light');
    } else {
      onSetTheme(newTheme);
    }
  };

  const triggerSaveNotification = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#151a24] border border-[#e4e1da] dark:border-[#262f3e] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-[#14181f] dark:text-[#f1f3f7]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e4e1da] dark:border-[#222834] flex items-center justify-between bg-[#fbfaf8] dark:bg-[#121620]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2f6f4f]/15 dark:bg-[#52b788]/20 text-[#2f6f4f] dark:text-[#52b788] flex items-center justify-center shadow-2xs">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-[#14181f] dark:text-[#f1f3f7]">
                App Settings
              </h2>
              <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
                Customize appearance, theme, studio defaults &amp; app behavior
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e4e1da] dark:border-[#222834] bg-[#f7f6f3] dark:bg-[#10141d] px-4 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-2.5 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'border-[#2f6f4f] text-[#2f6f4f] dark:text-[#52b788] dark:border-[#52b788]'
                : 'border-transparent text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Appearance &amp; Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`py-2.5 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'studio'
                ? 'border-[#2f6f4f] text-[#2f6f4f] dark:text-[#52b788] dark:border-[#52b788]'
                : 'border-transparent text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Studio Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2.5 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-[#2f6f4f] text-[#2f6f4f] dark:text-[#52b788] dark:border-[#52b788]'
                : 'border-transparent text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`py-2.5 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'storage'
                ? 'border-[#2f6f4f] text-[#2f6f4f] dark:text-[#52b788] dark:border-[#52b788]'
                : 'border-transparent text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data &amp; Reset</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: APPEARANCE & THEME */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6b6f76] dark:text-[#9aa1b0] mb-3">
                  Theme Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Light Mode */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                      currentTheme === 'light' && settings.theme !== 'system'
                        ? 'border-[#2f6f4f] bg-[#2f6f4f]/5 dark:bg-[#52b788]/10 ring-2 ring-[#2f6f4f]/20'
                        : 'border-[#e4e1da] dark:border-[#2b3342] hover:bg-[#f7f6f3] dark:hover:bg-[#1c222d]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Sun className="w-4 h-4" />
                      </div>
                      {currentTheme === 'light' && settings.theme !== 'system' && (
                        <Check className="w-4 h-4 text-[#2f6f4f]" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">Light Mode</div>
                      <div className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">Warm studio white style</div>
                    </div>
                  </button>

                  {/* Dark Mode */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                      currentTheme === 'dark' && settings.theme !== 'system'
                        ? 'border-[#2f6f4f] dark:border-[#52b788] bg-[#2f6f4f]/5 dark:bg-[#52b788]/10 ring-2 ring-[#2f6f4f]/20'
                        : 'border-[#e4e1da] dark:border-[#2b3342] hover:bg-[#f7f6f3] dark:hover:bg-[#1c222d]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-indigo-900/40 text-indigo-400 flex items-center justify-center">
                        <Moon className="w-4 h-4" />
                      </div>
                      {currentTheme === 'dark' && settings.theme !== 'system' && (
                        <Check className="w-4 h-4 text-[#2f6f4f] dark:text-[#52b788]" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">Dark Mode</div>
                      <div className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">OLED contrast &amp; low glare</div>
                    </div>
                  </button>

                  {/* System Default */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('system')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                      settings.theme === 'system'
                        ? 'border-[#2f6f4f] dark:border-[#52b788] bg-[#2f6f4f]/5 dark:bg-[#52b788]/10 ring-2 ring-[#2f6f4f]/20'
                        : 'border-[#e4e1da] dark:border-[#2b3342] hover:bg-[#f7f6f3] dark:hover:bg-[#1c222d]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center">
                        <Monitor className="w-4 h-4" />
                      </div>
                      {settings.theme === 'system' && (
                        <Check className="w-4 h-4 text-[#2f6f4f] dark:text-[#52b788]" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">Sync System</div>
                      <div className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">Follow OS day / night</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Interface Language */}
              <div className="pt-4 border-t border-[#f0ede6] dark:border-[#222834]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7] flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#2f6f4f] dark:text-[#52b788]" />
                      <span>Interface Language</span>
                    </h3>
                    <p className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                      Select your preferred studio display language
                    </p>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value as any);
                      onUpdateSettings({ language: e.target.value });
                      triggerSaveNotification();
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#e4e1da] dark:border-[#2b3342] bg-white dark:bg-[#1c222d] text-xs font-medium text-[#14181f] dark:text-[#f1f3f7] focus:outline-hidden"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español (Spanish)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="pt">Português (Portuguese)</option>
                    <option value="fr">Français (French)</option>
                    <option value="de">Deutsch (German)</option>
                    <option value="ja">日本語 (Japanese)</option>
                    <option value="ko">한국어 (Korean)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDIO PREFERENCES */}
          {activeTab === 'studio' && (
            <div className="space-y-4">
              {/* Auto Save Drafts */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#e4e1da] dark:border-[#262c38] bg-[#fbfbfa] dark:bg-[#121620]">
                <div>
                  <div className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">Auto-Save Drafts</div>
                  <div className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                    Automatically restore video trim settings, captions &amp; title if browser reloads
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSaveDrafts}
                  onChange={(e) => {
                    onUpdateSettings({ autoSaveDrafts: e.target.checked });
                    triggerSaveNotification();
                  }}
                  className="w-4 h-4 text-[#2f6f4f] rounded focus:ring-[#2f6f4f]"
                />
              </div>

              {/* High Quality Phone Preview */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#e4e1da] dark:border-[#262c38] bg-[#fbfbfa] dark:bg-[#121620]">
                <div>
                  <div className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">Retina Phone Simulation</div>
                  <div className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                    Render phone frame preview with crisp anti-aliasing and native aspect ratio
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.highQualityPreview}
                  onChange={(e) => {
                    onUpdateSettings({ highQualityPreview: e.target.checked });
                    triggerSaveNotification();
                  }}
                  className="w-4 h-4 text-[#2f6f4f] rounded focus:ring-[#2f6f4f]"
                />
              </div>

              {/* Default Publish Mode */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#e4e1da] dark:border-[#262c38] bg-[#fbfbfa] dark:bg-[#121620]">
                <div>
                  <div className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">Default Publishing Action</div>
                  <div className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                    Initial mode selected when preparing new content
                  </div>
                </div>
                <select
                  value={settings.defaultPublishMode}
                  onChange={(e) => {
                    onUpdateSettings({ defaultPublishMode: e.target.value as 'now' | 'schedule' });
                    triggerSaveNotification();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#e4e1da] dark:border-[#2b3342] bg-white dark:bg-[#1c222d] text-xs font-medium text-[#14181f] dark:text-[#f1f3f7]"
                >
                  <option value="now">Publish Now (Immediate)</option>
                  <option value="schedule">Schedule for Later</option>
                </select>
              </div>

              {/* Automatic hashtag recommendations */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#e4e1da] dark:border-[#262c38] bg-[#fbfbfa] dark:bg-[#121620]">
                <div>
                  <div className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">Smart Hashtag Presets</div>
                  <div className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                    Include platform-optimized hashtags (#Shorts, #Reels, #viral) automatically
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoAddHashtags}
                  onChange={(e) => {
                    onUpdateSettings({ autoAddHashtags: e.target.checked });
                    triggerSaveNotification();
                  }}
                  className="w-4 h-4 text-[#2f6f4f] rounded focus:ring-[#2f6f4f]"
                />
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#e4e1da] dark:border-[#262c38] bg-[#fbfbfa] dark:bg-[#121620]">
                <div>
                  <div className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">In-App Publishing Alerts</div>
                  <div className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                    Show toast banners and bell alerts when reels finish posting
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.desktopNotifications}
                  onChange={(e) => {
                    onUpdateSettings({ desktopNotifications: e.target.checked });
                    triggerSaveNotification();
                  }}
                  className="w-4 h-4 text-[#2f6f4f] rounded focus:ring-[#2f6f4f]"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#e4e1da] dark:border-[#262c38] bg-[#fbfbfa] dark:bg-[#121620]">
                <div>
                  <div className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">Sound Feedback</div>
                  <div className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                    Play gentle chime when scheduled posts succeed
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEffects}
                  onChange={(e) => {
                    onUpdateSettings({ soundEffects: e.target.checked });
                    triggerSaveNotification();
                  }}
                  className="w-4 h-4 text-[#2f6f4f] rounded focus:ring-[#2f6f4f]"
                />
              </div>
            </div>
          )}

          {/* TAB 4: DATA & RESET */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#e4e1da] dark:border-[#262c38] bg-[#fbfbfa] dark:bg-[#121620] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Local Cache &amp; Storage</span>
                </div>
                <p className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                  Reelcast Studio keeps drafts and preferences safely encrypted inside your browser's private local storage. No videos are ever uploaded to unapproved servers.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 space-y-3">
                <div>
                  <div className="text-xs font-bold text-red-700 dark:text-red-400">Clear Studio Draft Cache</div>
                  <div className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                    Reset all cached caption drafts, trimmed timestamps, and local studio form state.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear cached studio form drafts?')) {
                      localStorage.removeItem('reelcast_draft_caption');
                      localStorage.removeItem('reelcast_draft_title');
                      localStorage.removeItem('reelcast_draft_video_meta');
                      triggerSaveNotification();
                      alert('Draft cache cleared.');
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-[#151a24] border border-red-200 dark:border-red-800 hover:bg-red-100/50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Draft Cache</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e4e1da] dark:border-[#222834] bg-[#fbfaf8] dark:bg-[#121620] flex items-center justify-between">
          <span className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
            Version: Reelcast Social Studio 3.0 • Production Ready
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2f6f4f] hover:bg-[#25593f] dark:bg-[#52b788] dark:text-[#0b0e14] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

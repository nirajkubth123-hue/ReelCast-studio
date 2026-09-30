import React from 'react';
import { Share2, UserCheck, Clock, Settings, Settings2, Sun, Moon, Rocket, Menu } from 'lucide-react';
import { SocialAccount, AppNotification } from '../types';
import { NotificationBell } from './NotificationBell';
import { LanguageSelector } from './LanguageSelector';
import { useI18n } from '../i18n/I18nContext';

interface HeaderProps {
  accounts: SocialAccount[];
  onOpenAccounts: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenPublishApp: () => void;
  onOpenShareApp?: () => void;
  historyCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismissNotification: (id: string) => void;
  onClearAllNotifications: () => void;
  onSimulateSuccess?: () => void;
  onSimulateError?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  accounts,
  onOpenAccounts,
  onOpenSettings,
  onOpenHistory,
  onOpenPublishApp,
  onOpenShareApp,
  historyCount,
  theme,
  onToggleTheme,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismissNotification,
  onClearAllNotifications,
  onSimulateSuccess,
  onSimulateError
}) => {
  const { t } = useI18n();
  const connectedCount = accounts.filter(a => a.isConnected).length;

  return (
    <header className="border-b border-[#e4e1da] dark:border-[#222834] bg-white dark:bg-[#161b24] sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo, Tagline & 3-Slash Bar for Account Section */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* 3 Slash Bar (Menu) Button for Account Section */}
          <button
            id="btn-top-left-accounts-menu"
            type="button"
            onClick={onOpenAccounts}
            className="group relative p-2.5 rounded-xl text-[#14181f] dark:text-[#f1f3f7] bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#262c38] transition-all hover:scale-105 active:scale-95 shadow-2xs flex items-center justify-center cursor-pointer"
            title="Open Accounts Section (3 Slash Bar)"
            aria-label="Open Accounts Menu (3 Slash Bar)"
          >
            {/* 3 Slash / Bar Icon */}
            <div className="w-5 h-5 flex flex-col justify-center items-center gap-1">
              <span className="w-4 h-0.5 bg-[#2f6f4f] dark:bg-[#52b788] rounded-full transition-transform group-hover:-rotate-6" />
              <span className="w-4 h-0.5 bg-[#2f6f4f] dark:bg-[#52b788] rounded-full transition-transform" />
              <span className="w-4 h-0.5 bg-[#2f6f4f] dark:bg-[#52b788] rounded-full transition-transform group-hover:rotate-6" />
            </div>
            
            {/* Connected Accounts indicator dot */}
            {connectedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center shadow-xs border-2 border-white dark:border-[#161b24]">
                {connectedCount}
              </span>
            )}
          </button>

          <div className="relative group flex items-center justify-center">
            <img 
              src="/reelcast-logo.svg" 
              alt="Reelcast Social Studio" 
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-[#14181f] via-[#2f6f4f] to-[#d946ef] dark:from-[#f1f3f7] dark:via-[#e2e8f0] dark:to-[#f97316] bg-clip-text text-transparent">
                Reelcast
              </h1>
              <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/10 to-orange-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                Social Studio
              </span>
            </div>
            <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0] hidden sm:block">
              One upload. Every feed.
            </p>
          </div>
        </div>

        {/* Right Nav & Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connected Accounts Pills */}
          <button
            type="button"
            onClick={onOpenAccounts}
            className="hidden lg:flex items-center gap-1.5 bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#262c38] rounded-full px-3 py-1 text-xs transition-colors cursor-pointer"
            title="Manage Connected Channels"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#2f6f4f] dark:text-[#52b788]" />
            <span className="font-medium text-[#14181f] dark:text-[#f1f3f7]">
              {accounts.length === 0
                ? '+ Connect Social Accounts'
                : t('header.connectedPill', { count: connectedCount, total: accounts.length })}
            </span>
            {accounts.length > 0 && (
              <div className="flex items-center gap-1 ml-1 pl-2 border-l border-[#e4e1da] dark:border-[#262c38]">
                {accounts.map(acc => (
                  <span
                    key={acc.id}
                    title={`${acc.accountName} (${acc.isConnected ? 'Connected' : 'Disconnected'})`}
                    className={`w-2 h-2 rounded-full ${
                      acc.isConnected ? 'bg-[#2f6f4f] dark:bg-[#52b788]' : 'bg-[#e4e1da] dark:bg-[#343d4d]'
                    }`}
                  />
                ))}
              </div>
            )}
          </button>

          {/* Language Selector Dropdown */}
          <LanguageSelector />

          {/* Dark / Light Mode Toggle */}
          <button
            id="btn-toggle-theme"
            type="button"
            onClick={onToggleTheme}
            aria-label={t(theme === 'dark' ? 'header.themeLight' : 'header.themeDark')}
            title={t(theme === 'dark' ? 'header.themeLight' : 'header.themeDark')}
            className="flex items-center justify-center w-9 h-9 text-[#14181f] dark:text-[#f1f3f7] bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#262c38] rounded-md transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#eab308] transition-transform rotate-0 scale-100" />
            ) : (
              <Moon className="w-4 h-4 text-[#4b5563] transition-transform rotate-0 scale-100" />
            )}
          </button>

          {/* Real-time Notification Bell */}
          <NotificationBell
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onDismissNotification={onDismissNotification}
            onClearAll={onClearAllNotifications}
            onOpenHistory={onOpenHistory}
            onOpenAccounts={onOpenAccounts}
            onSimulateSuccess={onSimulateSuccess}
            onSimulateError={onSimulateError}
          />

          {/* Settings Button */}
          <button
            id="btn-open-settings"
            type="button"
            onClick={onOpenSettings}
            title="Settings (Appearance, Dark/Light Mode, Studio Preferences)"
            aria-label="Open Settings"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#14181f] dark:text-[#f1f3f7] bg-white dark:bg-[#1c222d] hover:bg-[#f7f6f3] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#262c38] rounded-md transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-[#6b6f76] dark:text-[#9aa1b0]" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* History Button */}
          <button
            id="btn-open-history"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#14181f] dark:text-[#f1f3f7] bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#262c38] rounded-md transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-[#6b6f76] dark:text-[#9aa1b0]" />
            <span>{t('header.history')}</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#2f6f4f] text-white text-[10px] flex items-center justify-center font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Manage Accounts Button */}
          <button
            id="btn-manage-accounts"
            onClick={onOpenAccounts}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#14181f] dark:text-[#f1f3f7] bg-white dark:bg-[#1c222d] hover:bg-[#f7f6f3] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#262c38] rounded-md transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5 text-[#6b6f76] dark:text-[#9aa1b0]" />
            <span className="hidden sm:inline">{t('header.accounts')}</span>
          </button>

          {/* Share App to People Button */}
          {onOpenShareApp && (
            <button
              id="btn-share-app"
              onClick={onOpenShareApp}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/40 rounded-md transition-all shadow-xs"
              title="Share Reelcast Studio with other people"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share App</span>
            </button>
          )}

          {/* Publish & Share App Button */}
          <button
            id="btn-publish-app"
            onClick={onOpenPublishApp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#2f6f4f] to-[#3a8560] hover:from-[#25593f] hover:to-[#2f6f4f] rounded-md transition-all shadow-xs hover:shadow-sm"
            title="Publish app website & Meta Go-Live Checklist"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Publish App</span>
          </button>
        </div>
      </div>
    </header>
  );
};

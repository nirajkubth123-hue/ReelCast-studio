import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCheck,
  Trash2,
  X,
  ExternalLink,
  Instagram,
  Facebook,
  Youtube,
  Sparkles,
  Zap
} from 'lucide-react';
import { AppNotification, NotificationType, PlatformId } from '../types';

interface NotificationBellProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismissNotification: (id: string) => void;
  onClearAll: () => void;
  onOpenHistory: () => void;
  onOpenAccounts: () => void;
  onSimulateSuccess?: () => void;
  onSimulateError?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismissNotification,
  onClearAll,
  onOpenHistory,
  onOpenAccounts,
  onSimulateSuccess,
  onSimulateError
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'alerts'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const errorCount = notifications.filter((n) => n.type === 'error' || n.type === 'warning').length;
  const unreadErrorCount = notifications.filter((n) => !n.read && (n.type === 'error' || n.type === 'warning')).length;

  // Close on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'alerts') return n.type === 'error' || n.type === 'warning';
    return true;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#2f6f4f] dark:text-[#52b788]" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-[#e11d48] dark:text-[#fb7185]" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-[#c4622d] dark:text-[#f97316]" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-[#1877F2] dark:text-[#60a5fa]" />;
    }
  };

  const getNotificationBg = (type: NotificationType, read: boolean) => {
    if (read) {
      return 'bg-white dark:bg-[#161b24] opacity-85 hover:opacity-100';
    }
    switch (type) {
      case 'success':
        return 'bg-[#2f6f4f]/5 dark:bg-[#52b788]/10 border-l-3 border-[#2f6f4f] dark:border-[#52b788]';
      case 'error':
        return 'bg-[#e11d48]/5 dark:bg-[#fb7185]/10 border-l-3 border-[#e11d48] dark:border-[#fb7185]';
      case 'warning':
        return 'bg-[#c4622d]/5 dark:bg-[#f97316]/10 border-l-3 border-[#c4622d] dark:border-[#f97316]';
      case 'info':
      default:
        return 'bg-[#1877F2]/5 dark:bg-[#60a5fa]/10 border-l-3 border-[#1877F2] dark:border-[#60a5fa]';
    }
  };

  const renderPlatformBadge = (platform: PlatformId) => {
    switch (platform) {
      case 'instagram':
        return (
          <span
            key={platform}
            className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-[#E1306C]/10 text-[#E1306C]"
          >
            <Instagram className="w-2.5 h-2.5" /> IG
          </span>
        );
      case 'facebook':
        return (
          <span
            key={platform}
            className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-[#1877F2]/10 text-[#1877F2]"
          >
            <Facebook className="w-2.5 h-2.5" /> FB
          </span>
        );
      case 'youtube':
        return (
          <span
            key={platform}
            className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-[#FF0000]/10 text-[#FF0000]"
          >
            <Youtube className="w-2.5 h-2.5" /> YT
          </span>
        );
      default:
        return null;
    }
  };

  const handleActionClick = (notif: AppNotification) => {
    onMarkAsRead(notif.id);
    setIsOpen(false);
    if (notif.actionType === 'open_accounts') {
      onOpenAccounts();
    } else if (notif.actionType === 'open_history' || notif.postId) {
      onOpenHistory();
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        id="btn-notification-bell"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications and alerts: ${unreadCount} unread`}
        title={`Notifications and real-time alerts (${unreadCount} unread)`}
        className={`relative flex items-center justify-center w-9 h-9 rounded-md border transition-all ${
          isOpen
            ? 'bg-[#ece8df] dark:bg-[#252c3a] border-[#2f6f4f] dark:border-[#52b788] text-[#14181f] dark:text-[#f1f3f7]'
            : 'bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] border-[#e4e1da] dark:border-[#262c38] text-[#14181f] dark:text-[#f1f3f7]'
        }`}
      >
        <Bell className="w-4 h-4" />

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-xs ${
              unreadErrorCount > 0
                ? 'bg-[#e11d48] animate-pulse'
                : 'bg-[#2f6f4f] dark:bg-[#52b788] dark:text-[#0b0e14]'
            }`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Error Ping Dot if no badge number */}
        {unreadCount === 0 && errorCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e11d48]" />
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#161b24] border border-[#e4e1da] dark:border-[#262c38] rounded-xl shadow-xl z-50 overflow-hidden flex flex-col transition-all duration-150 animate-in fade-in slide-in-from-top-2"
          style={{ maxHeight: '82vh' }}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-[#e4e1da] dark:border-[#262c38] bg-[#fbfbfa] dark:bg-[#11141c] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#2f6f4f]/10 text-[#2f6f4f] dark:text-[#52b788] flex items-center justify-center">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">
                    Notifications & Alerts
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-[#2f6f4f] dark:bg-[#52b788] text-white dark:text-[#0b0e14]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#6b6f76] dark:text-[#9aa1b0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2f6f4f] dark:bg-[#52b788] animate-pulse" />
                  <span>Real-time feedback</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  id="btn-notif-mark-all-read"
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="p-1.5 text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#2f6f4f] dark:hover:text-[#52b788] rounded-md hover:bg-[#e4e1da]/40 dark:hover:bg-[#262c38] transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  id="btn-notif-clear-all"
                  type="button"
                  onClick={onClearAll}
                  className="p-1.5 text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#e11d48] rounded-md hover:bg-[#e4e1da]/40 dark:hover:bg-[#262c38] transition-colors"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] rounded-md hover:bg-[#e4e1da]/40 dark:hover:bg-[#262c38] transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-2 bg-[#f7f6f3] dark:bg-[#141820] border-b border-[#e4e1da] dark:border-[#262c38] text-[11px]">
            <button
              id="filter-notif-all"
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-2 py-0.8 rounded-md font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-[#1e2430] text-[#14181f] dark:text-[#f1f3f7] shadow-2xs'
                  : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              id="filter-notif-unread"
              type="button"
              onClick={() => setActiveFilter('unread')}
              className={`px-2 py-0.8 rounded-md font-medium transition-colors ${
                activeFilter === 'unread'
                  ? 'bg-white dark:bg-[#1e2430] text-[#14181f] dark:text-[#f1f3f7] shadow-2xs'
                  : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f]'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              id="filter-notif-alerts"
              type="button"
              onClick={() => setActiveFilter('alerts')}
              className={`px-2 py-0.8 rounded-md font-medium transition-colors ${
                activeFilter === 'alerts'
                  ? 'bg-white dark:bg-[#1e2430] text-[#e11d48] dark:text-[#fb7185] shadow-2xs'
                  : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f]'
              }`}
            >
              Errors & Alerts ({errorCount})
            </button>
          </div>

          {/* Notification Items List */}
          <div className="overflow-y-auto max-h-[380px] divide-y divide-[#e4e1da]/60 dark:divide-[#262c38]/60">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#f0ede6] dark:bg-[#1e2430] flex items-center justify-center mx-auto text-[#6b6f76] dark:text-[#9aa1b0]">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-[#14181f] dark:text-[#f1f3f7]">
                  No notifications in this view
                </p>
                <p className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                  Publish a clip or schedule a post to see real-time status alerts.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 transition-colors relative group ${getNotificationBg(
                    notif.type,
                    notif.read
                  )}`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Icon based on alert type */}
                    <div className="shrink-0 mt-0.5">{getNotificationIcon(notif.type)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4
                          className={`text-xs font-semibold truncate ${
                            notif.type === 'error'
                              ? 'text-[#e11d48] dark:text-[#fb7185]'
                              : notif.type === 'warning'
                              ? 'text-[#c4622d] dark:text-[#f97316]'
                              : 'text-[#14181f] dark:text-[#f1f3f7]'
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-[#6b6f76] dark:text-[#9aa1b0] shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#4b5563] dark:text-[#cbd5e1] leading-relaxed break-words">
                        {notif.message}
                      </p>

                      {/* Platform Badges */}
                      {notif.platforms && notif.platforms.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          {notif.platforms.map((p) => renderPlatformBadge(p))}
                        </div>
                      )}

                      {/* Action Button & Mark Read */}
                      <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-[#e4e1da]/40 dark:border-[#262c38]/40">
                        {notif.actionLabel ? (
                          <button
                            type="button"
                            onClick={() => handleActionClick(notif)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2f6f4f] dark:text-[#52b788] hover:underline"
                          >
                            <span>{notif.actionLabel}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        ) : (
                          <div />
                        )}

                        <div className="flex items-center gap-2">
                          {!notif.read && (
                            <button
                              type="button"
                              onClick={() => onMarkAsRead(notif.id)}
                              className="text-[10px] font-medium text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDismissNotification(notif.id)}
                            className="text-[#9aa1b0] hover:text-[#e11d48] p-0.5 rounded transition-colors"
                            title="Dismiss notification"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Simulation Bar for real-time testing feedback */}
          {(onSimulateSuccess || onSimulateError) && (
            <div className="p-2.5 bg-[#fbfbfa] dark:bg-[#11141c] border-t border-[#e4e1da] dark:border-[#262c38] flex items-center justify-between gap-2 text-[10px]">
              <span className="text-[#6b6f76] dark:text-[#9aa1b0] font-medium flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#c4622d]" />
                <span>Simulate:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {onSimulateSuccess && (
                  <button
                    id="btn-test-notif-publish"
                    type="button"
                    onClick={onSimulateSuccess}
                    className="px-2 py-0.8 rounded bg-[#2f6f4f]/10 dark:bg-[#52b788]/20 text-[#2f6f4f] dark:text-[#52b788] font-semibold hover:bg-[#2f6f4f]/20 transition-colors"
                  >
                    + Publish Success
                  </button>
                )}
                {onSimulateError && (
                  <button
                    id="btn-test-notif-error"
                    type="button"
                    onClick={onSimulateError}
                    className="px-2 py-0.8 rounded bg-[#e11d48]/10 dark:bg-[#fb7185]/20 text-[#e11d48] dark:text-[#fb7185] font-semibold hover:bg-[#e11d48]/20 transition-colors"
                  >
                    + Task Error
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

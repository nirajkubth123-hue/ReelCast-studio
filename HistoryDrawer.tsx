import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Instagram,
  Facebook,
  Youtube,
  Calendar,
  Search,
  TrendingUp,
  ListFilter,
  CheckSquare,
  Square,
  Trash2,
  CalendarClock,
  AlertTriangle,
  Check,
  Download,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { ScheduledPost, PlatformId } from '../types';
import { PerformanceAnalytics } from './PerformanceAnalytics';
import { exportAnalyticsToCsv, exportAnalyticsToPdf } from '../utils/exportAnalytics';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  posts: ScheduledPost[];
  onRetryPost?: (postId: string) => void;
  onBulkUpdateScheduledTime?: (postIds: string[], newScheduledTime: string) => void;
  onBulkCancelScheduledPosts?: (postIds: string[]) => void;
  onRefreshAnalytics?: () => Promise<void> | void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  posts,
  onRetryPost,
  onBulkUpdateScheduledTime,
  onBulkCancelScheduledPosts,
  onRefreshAnalytics
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'analytics'>('queue');
  const [filter, setFilter] = useState<'all' | 'published' | 'scheduled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk Selection States
  const [selectedScheduledIds, setSelectedScheduledIds] = useState<string[]>([]);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Reschedule Form States
  const [rescheduleDate, setRescheduleDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [rescheduleTime, setRescheduleTime] = useState('18:00');

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Clean up selected IDs if posts change/are removed
  useEffect(() => {
    setSelectedScheduledIds((prev) =>
      prev.filter((id) => posts.some((p) => p.id === id && p.status === 'scheduled'))
    );
  }, [posts]);

  if (!isOpen) return null;

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const totalScheduledCount = posts.filter((p) => p.status === 'scheduled').length;

  const filteredPosts = posts.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchTitle = (p.title || '').toLowerCase().includes(q);
    const matchVideo = (p.videoName || '').toLowerCase().includes(q);
    return matchTitle || matchVideo;
  });

  const filteredScheduledPosts = filteredPosts.filter((p) => p.status === 'scheduled');
  const isAllFilteredScheduledSelected =
    filteredScheduledPosts.length > 0 &&
    filteredScheduledPosts.every((p) => selectedScheduledIds.includes(p.id));

  const handleToggleSelectPost = (postId: string) => {
    setSelectedScheduledIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const handleToggleSelectAllScheduled = () => {
    if (isAllFilteredScheduledSelected) {
      const toRemove = new Set(filteredScheduledPosts.map((p) => p.id));
      setSelectedScheduledIds((prev) => prev.filter((id) => !toRemove.has(id)));
    } else {
      const newIds = new Set([
        ...selectedScheduledIds,
        ...filteredScheduledPosts.map((p) => p.id)
      ]);
      setSelectedScheduledIds(Array.from(newIds));
    }
  };

  const formatScheduleDisplay = (dateStr: string, timeStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const [hours, minutes] = timeStr.split(':');
      const h = Number(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 || 12;
      return `${formattedDate} at ${displayHour}:${minutes} ${ampm}`;
    } catch {
      return `${dateStr} at ${timeStr}`;
    }
  };

  const handleConfirmReschedule = () => {
    if (selectedScheduledIds.length === 0) return;
    const formatted = formatScheduleDisplay(rescheduleDate, rescheduleTime);

    if (onBulkUpdateScheduledTime) {
      onBulkUpdateScheduledTime(selectedScheduledIds, formatted);
    }

    const count = selectedScheduledIds.length;
    setSelectedScheduledIds([]);
    setShowRescheduleModal(false);
    setToastMessage(`Rescheduled ${count} post${count > 1 ? 's' : ''} to ${formatted}`);
  };

  const handleConfirmCancel = () => {
    if (selectedScheduledIds.length === 0) return;
    const count = selectedScheduledIds.length;

    if (onBulkCancelScheduledPosts) {
      onBulkCancelScheduledPosts(selectedScheduledIds);
    }

    setSelectedScheduledIds([]);
    setShowCancelModal(false);
    setToastMessage(`Canceled ${count} scheduled post${count > 1 ? 's' : ''} from queue`);
  };

  const setSuggestedTiming = (daysOffset: number, timeStr: string) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    setRescheduleDate(d.toISOString().split('T')[0]);
    setRescheduleTime(timeStr);
  };

  const getPlatformIcon = (platform: PlatformId) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />;
      case 'facebook':
        return <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />;
      case 'youtube':
        return <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />;
    }
  };

  const selectedPostsDetails = posts.filter((p) => selectedScheduledIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`bg-white dark:bg-[#161b24] w-full ${
          activeTab === 'analytics' ? 'max-w-xl md:max-w-2xl' : 'max-w-md md:max-w-lg'
        } h-full shadow-2xl flex flex-col border-l border-[#e4e1da] dark:border-[#222834] transition-all duration-200 relative`}
      >
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-[#14181f] dark:bg-[#f1f3f7] text-white dark:text-[#14181f] px-3.5 py-2.5 rounded-xl shadow-lg flex items-center justify-between text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#52b788]" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 hover:opacity-75"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="p-5 pb-3 border-b border-[#e4e1da] dark:border-[#222834]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2f6f4f] dark:text-[#52b788]" />
              <h2 className="text-base font-semibold text-[#14181f] dark:text-[#f1f3f7]">
                Publishing History & Analytics
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Export Dropdown / Actions */}
              <div className="flex items-center gap-1 bg-[#f7f6f3] dark:bg-[#11141c] p-0.5 rounded-lg border border-[#e4e1da] dark:border-[#262c38]">
                <button
                  id="btn-export-csv"
                  type="button"
                  onClick={() => {
                    exportAnalyticsToCsv(posts);
                    setToastMessage('Exported performance metrics to CSV successfully!');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md text-[#2f6f4f] dark:text-[#52b788] hover:bg-white dark:hover:bg-[#1c222d] transition-all cursor-pointer shadow-2xs"
                  title="Export all post metrics as CSV spreadsheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  id="btn-export-pdf"
                  type="button"
                  onClick={() => {
                    exportAnalyticsToPdf(posts);
                    setToastMessage('Generated PDF performance report ready to save or print!');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md text-[#b3432b] dark:text-[#e06c53] hover:bg-white dark:hover:bg-[#1c222d] transition-all cursor-pointer shadow-2xs"
                  title="Generate printable PDF analytics report"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF Report</span>
                </button>
              </div>

              <button
                id="btn-close-history-drawer"
                onClick={onClose}
                className="p-1 rounded-md text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] hover:bg-[#f7f6f3] dark:hover:bg-[#1c222d]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* View Mode Switcher: Posts Queue vs Performance Analytics */}
          <div className="flex items-center p-1 bg-[#f7f6f3] dark:bg-[#11141c] border border-[#e4e1da] dark:border-[#262c38] rounded-lg">
            <button
              id="btn-tab-queue"
              type="button"
              onClick={() => setActiveTab('queue')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'queue'
                  ? 'bg-white dark:bg-[#1c222d] text-[#14181f] dark:text-[#f1f3f7] shadow-xs'
                  : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Posts & Queue ({posts.length})</span>
            </button>
            <button
              id="btn-tab-analytics"
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'analytics'
                  ? 'bg-[#2f6f4f] dark:bg-[#52b788] text-white dark:text-[#0b0e14] shadow-xs'
                  : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Performance Analytics</span>
              {publishedCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    activeTab === 'analytics'
                      ? 'bg-white/20 text-white dark:text-[#0b0e14]'
                      : 'bg-[#2f6f4f]/10 dark:bg-[#52b788]/20 text-[#2f6f4f] dark:text-[#52b788]'
                  }`}
                >
                  {publishedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Posts Queue */}
        {activeTab === 'queue' && (
          <>
            {/* Search Bar at Top */}
            <div className="px-5 pt-3 pb-2.5 border-b border-[#f0ede6] dark:border-[#222834] bg-white dark:bg-[#161b24]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6f76] dark:text-[#9aa1b0] pointer-events-none" />
                <input
                  id="input-search-history"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search past posts by title or video name..."
                  className="w-full pl-8 pr-8 py-2 text-xs rounded-lg border border-[#e4e1da] dark:border-[#262c38] bg-[#fbfbfa] dark:bg-[#11141c] text-[#14181f] dark:text-[#f1f3f7] placeholder-[#6b6f76] dark:placeholder-[#9aa1b0] focus:outline-hidden focus:border-[#2f6f4f] dark:focus:border-[#52b788] focus:ring-1 focus:ring-[#2f6f4f] dark:focus:ring-[#52b788] transition-colors"
                />
                {searchQuery && (
                  <button
                    id="btn-clear-history-search"
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] p-0.5 rounded-full hover:bg-[#e4e1da]/50 dark:hover:bg-[#262c38]"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {searchQuery.trim() && (
                <div className="flex items-center justify-between text-[11px] text-[#6b6f76] dark:text-[#9aa1b0] mt-1.5 px-0.5">
                  <span>
                    Found {filteredPosts.length} post{filteredPosts.length === 1 ? '' : 's'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-[#2f6f4f] dark:text-[#52b788] hover:underline"
                  >
                    Reset search
                  </button>
                </div>
              )}
            </div>

            {/* Filter Pills */}
            <div className="px-5 py-2.5 border-b border-[#f0ede6] dark:border-[#222834] bg-[#fbfbfa] dark:bg-[#11141c] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  id="btn-filter-all"
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-[#14181f] dark:bg-[#f1f3f7] text-white dark:text-[#14181f]'
                      : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] bg-white dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#2b3342]'
                  }`}
                >
                  All ({posts.length})
                </button>
                <button
                  id="btn-filter-published"
                  onClick={() => setFilter('published')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filter === 'published'
                      ? 'bg-[#2f6f4f] dark:bg-[#52b788] text-white dark:text-[#0b0e14]'
                      : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] bg-white dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#2b3342]'
                  }`}
                >
                  Published ({publishedCount})
                </button>
                <button
                  id="btn-filter-scheduled"
                  onClick={() => setFilter('scheduled')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filter === 'scheduled'
                      ? 'bg-[#c4622d] text-white'
                      : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] bg-white dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#2b3342]'
                  }`}
                >
                  Scheduled ({totalScheduledCount})
                </button>
              </div>

              {/* Quick Select All Scheduled toggle if scheduled posts exist in this view */}
              {filteredScheduledPosts.length > 0 && (
                <button
                  id="btn-select-all-scheduled"
                  type="button"
                  onClick={handleToggleSelectAllScheduled}
                  className="text-[11px] font-medium text-[#2f6f4f] dark:text-[#52b788] hover:underline flex items-center gap-1 shrink-0"
                >
                  {isAllFilteredScheduledSelected ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Deselect ({filteredScheduledPosts.length})</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Select Scheduled ({filteredScheduledPosts.length})</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Posts List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5 pb-24">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12 px-4 text-[#6b6f76] dark:text-[#9aa1b0] text-xs space-y-2">
                  {searchQuery.trim() ? (
                    <>
                      <div className="w-9 h-9 rounded-full bg-[#f0ede6] dark:bg-[#1e2430] flex items-center justify-center mx-auto text-[#6b6f76] dark:text-[#9aa1b0]">
                        <Search className="w-4 h-4" />
                      </div>
                      <p className="font-semibold text-[#14181f] dark:text-[#f1f3f7]">
                        No matching posts found
                      </p>
                      <p className="text-[11px] max-w-xs mx-auto">
                        No posts matched &ldquo;{searchQuery}&rdquo;. Check your spelling or try searching a different title or video file name.
                      </p>
                      <button
                        id="btn-clear-search-empty-state"
                        onClick={() => setSearchQuery('')}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-[#2f6f4f] dark:text-[#52b788] hover:underline font-semibold"
                      >
                        Clear Search Filter
                      </button>
                    </>
                  ) : (
                    <p>No posts found under this filter.</p>
                  )}
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const isScheduled = post.status === 'scheduled';
                  const isSelected = selectedScheduledIds.includes(post.id);

                  return (
                    <div
                      key={post.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-[#2f6f4f] dark:border-[#52b788] ring-1 ring-[#2f6f4f] dark:ring-[#52b788] bg-[#2f6f4f]/5 dark:bg-[#52b788]/10'
                          : 'border-[#e4e1da] dark:border-[#262c38] bg-[#fbfbfa] dark:bg-[#11141c] hover:border-[#c8c4b9] dark:hover:border-[#3d475a]'
                      } space-y-3 shadow-2xs`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          {/* Selection Checkbox for Scheduled Posts */}
                          {isScheduled && (
                            <button
                              type="button"
                              id={`checkbox-post-${post.id}`}
                              onClick={() => handleToggleSelectPost(post.id)}
                              className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-colors shrink-0 ${
                                isSelected
                                  ? 'bg-[#2f6f4f] dark:bg-[#52b788] text-white dark:text-[#0b0e14]'
                                  : 'border border-[#c8c4b9] dark:border-[#424d63] hover:border-[#2f6f4f] dark:hover:border-[#52b788] bg-white dark:bg-[#1c222d]'
                              }`}
                              title={isSelected ? 'Deselect this post' : 'Select this scheduled post'}
                              aria-label={`Select ${post.title || post.videoName}`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                          )}

                          <div className="min-w-0 flex-1">
                            <h3 className="text-xs font-semibold text-[#14181f] dark:text-[#f1f3f7] line-clamp-1">
                              {post.title || post.caption.slice(0, 40) || 'Untitled Post'}
                            </h3>
                            <p className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0] mt-0.5">
                              {post.videoName} • {post.videoDuration}s
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                            post.status === 'published'
                              ? 'bg-[#2f6f4f]/10 dark:bg-[#2f6f4f]/20 text-[#2f6f4f] dark:text-[#52b788]'
                              : post.status === 'scheduled'
                              ? 'bg-[#c4622d]/10 dark:bg-[#c4622d]/20 text-[#c4622d]'
                              : 'bg-[#b3432b]/10 dark:bg-[#b3432b]/20 text-[#b3432b]'
                          }`}
                        >
                          {post.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-[#14181f]/80 dark:text-[#f1f3f7]/80 line-clamp-2 leading-relaxed bg-white dark:bg-[#161b24] p-2 rounded-md border border-[#e4e1da] dark:border-[#262c38]">
                        {post.caption}
                      </p>

                      {/* Quick Performance snippet if available */}
                      {post.performance && (
                        <div className="flex items-center justify-between text-[11px] bg-white dark:bg-[#161b24] p-2 rounded-lg border border-[#e4e1da] dark:border-[#222834]">
                          <span className="text-[#6b6f76] dark:text-[#9aa1b0]">
                            Reach:{' '}
                            <strong className="text-[#14181f] dark:text-[#f1f3f7]">
                              {(post.performance.totalReach / 1000).toFixed(1)}k
                            </strong>
                          </span>
                          <span className="text-[#6b6f76] dark:text-[#9aa1b0]">
                            Eng. Rate:{' '}
                            <strong className="text-[#2f6f4f] dark:text-[#52b788]">
                              {post.performance.engagementRate}%
                            </strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveTab('analytics')}
                            className="text-[#2f6f4f] dark:text-[#52b788] hover:underline font-semibold flex items-center gap-0.5"
                          >
                            <TrendingUp className="w-3 h-3" />
                            View Charts
                          </button>
                        </div>
                      )}

                      {/* Per-Platform Target Status Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {post.platforms.map((platform) => {
                          const targetStatus = post.targetStatuses[platform] || 'published';
                          const isSuccess = targetStatus === 'published' || targetStatus === 'scheduled';

                          return (
                            <span
                              key={platform}
                              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                                isSuccess
                                  ? 'bg-white dark:bg-[#1c222d] border-[#e4e1da] dark:border-[#2b3342] text-[#14181f] dark:text-[#f1f3f7]'
                                  : 'bg-[#b3432b]/5 dark:bg-[#b3432b]/20 border-[#b3432b]/20 text-[#b3432b]'
                              }`}
                            >
                              {getPlatformIcon(platform)}
                              <span className="capitalize">{platform}</span>
                              <span>{isSuccess ? '✓' : '✗'}</span>
                            </span>
                          );
                        })}
                      </div>

                      {/* Footer Time & Actions */}
                      <div className="flex items-center justify-between text-[11px] text-[#6b6f76] dark:text-[#9aa1b0] pt-1 border-t border-[#f0ede6] dark:border-[#222834]">
                        <span className="flex items-center gap-1">
                          {post.mode === 'schedule' ? (
                            <Calendar className="w-3 h-3 text-[#c4622d]" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {post.scheduledTime ? (
                            <span className="font-medium text-[#14181f] dark:text-[#f1f3f7]">
                              Releasing: {post.scheduledTime}
                            </span>
                          ) : (
                            post.createdAt
                          )}
                        </span>

                        <div className="flex items-center gap-2">
                          {isScheduled && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedScheduledIds([post.id]);
                                setShowRescheduleModal(true);
                              }}
                              className="text-[#2f6f4f] dark:text-[#52b788] hover:underline font-semibold"
                            >
                              Edit Timing
                            </button>
                          )}

                          {Object.values(post.targetStatuses).includes('failed') && (
                            <button
                              onClick={() => onRetryPost && onRetryPost(post.id)}
                              className="text-[#b3432b] hover:underline font-semibold flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Retry Failed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Docked Bulk Action Toolbar (appears whenever 1 or more scheduled posts are selected) */}
            {selectedScheduledIds.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-3.5 bg-white dark:bg-[#161b24] border-t border-[#e4e1da] dark:border-[#222834] shadow-xl z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 animate-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#2f6f4f]/10 dark:bg-[#52b788]/20 text-[#2f6f4f] dark:text-[#52b788] inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedScheduledIds.length} post{selectedScheduledIds.length > 1 ? 's' : ''} selected
                  </span>

                  <button
                    id="btn-bulk-deselect"
                    type="button"
                    onClick={() => setSelectedScheduledIds([])}
                    className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] underline"
                  >
                    Deselect all
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-bulk-reschedule-open"
                    type="button"
                    onClick={() => setShowRescheduleModal(true)}
                    className="flex-1 sm:flex-initial px-3 py-2 text-xs font-semibold rounded-lg bg-[#2f6f4f] dark:bg-[#52b788] text-white dark:text-[#0b0e14] hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CalendarClock className="w-3.5 h-3.5" />
                    <span>Reschedule ({selectedScheduledIds.length})</span>
                  </button>

                  <button
                    id="btn-bulk-cancel-open"
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 sm:flex-initial px-3 py-2 text-xs font-semibold rounded-lg bg-[#b3432b]/10 dark:bg-[#b3432b]/20 text-[#b3432b] hover:bg-[#b3432b]/20 dark:hover:bg-[#b3432b]/30 transition-colors flex items-center justify-center gap-1.5 border border-[#b3432b]/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel Posts</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Tab 2: Performance Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <div className="flex-1 overflow-y-auto p-5">
            <PerformanceAnalytics posts={posts} onRefreshData={onRefreshAnalytics} />
          </div>
        )}

        {/* Modal 1: Bulk Reschedule Modal */}
        {showRescheduleModal && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#161b24] w-full max-w-sm rounded-2xl border border-[#e4e1da] dark:border-[#222834] shadow-2xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2f6f4f]/10 dark:bg-[#2f6f4f]/20 text-[#2f6f4f] dark:text-[#52b788] flex items-center justify-center">
                    <CalendarClock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#14181f] dark:text-[#f1f3f7]">
                      Bulk Reschedule Posts
                    </h3>
                    <p className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                      Updating {selectedScheduledIds.length} scheduled item{selectedScheduledIds.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Selected Posts Summary */}
              <div className="max-h-24 overflow-y-auto bg-[#fbfbfa] dark:bg-[#11141c] p-2.5 rounded-lg border border-[#e4e1da] dark:border-[#262c38] space-y-1">
                <span className="text-[10px] font-semibold text-[#6b6f76] dark:text-[#9aa1b0] uppercase tracking-wider block">
                  Target Posts:
                </span>
                {selectedPostsDetails.map((p) => (
                  <div
                    key={p.id}
                    className="text-xs text-[#14181f] dark:text-[#f1f3f7] truncate flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c4622d]" />
                    <span className="truncate">{p.title || p.videoName}</span>
                  </div>
                ))}
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#6b6f76] dark:text-[#9aa1b0]">
                  Quick Presets:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSuggestedTiming(1, '18:00')}
                    className="px-2.5 py-1.5 text-xs rounded-md bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#e4e1da] dark:hover:bg-[#262c38] text-[#14181f] dark:text-[#f1f3f7] border border-[#e4e1da] dark:border-[#262c38] transition-colors text-left"
                  >
                    Tomorrow at 6:00 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuggestedTiming(2, '12:00')}
                    className="px-2.5 py-1.5 text-xs rounded-md bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#e4e1da] dark:hover:bg-[#262c38] text-[#14181f] dark:text-[#f1f3f7] border border-[#e4e1da] dark:border-[#262c38] transition-colors text-left"
                  >
                    +2 Days at 12:00 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuggestedTiming(3, '19:30')}
                    className="px-2.5 py-1.5 text-xs rounded-md bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#e4e1da] dark:hover:bg-[#262c38] text-[#14181f] dark:text-[#f1f3f7] border border-[#e4e1da] dark:border-[#262c38] transition-colors text-left"
                  >
                    +3 Days at 7:30 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuggestedTiming(7, '15:00')}
                    className="px-2.5 py-1.5 text-xs rounded-md bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#e4e1da] dark:hover:bg-[#262c38] text-[#14181f] dark:text-[#f1f3f7] border border-[#e4e1da] dark:border-[#262c38] transition-colors text-left"
                  >
                    +1 Week (Peak Time)
                  </button>
                </div>
              </div>

              {/* Custom Date & Time Fields */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[11px] font-medium text-[#6b6f76] dark:text-[#9aa1b0] block mb-1">
                    Release Date
                  </label>
                  <input
                    id="input-bulk-reschedule-date"
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#e4e1da] dark:border-[#262c38] bg-white dark:bg-[#1c222d] text-[#14181f] dark:text-[#f1f3f7] focus:outline-hidden focus:border-[#2f6f4f] dark:focus:border-[#52b788]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#6b6f76] dark:text-[#9aa1b0] block mb-1">
                    Release Time
                  </label>
                  <input
                    id="input-bulk-reschedule-time"
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#e4e1da] dark:border-[#262c38] bg-white dark:bg-[#1c222d] text-[#14181f] dark:text-[#f1f3f7] focus:outline-hidden focus:border-[#2f6f4f] dark:focus:border-[#52b788]"
                  />
                </div>
              </div>

              {/* Preview Formatted Time */}
              <div className="p-2.5 bg-[#2f6f4f]/5 dark:bg-[#52b788]/10 rounded-lg border border-[#2f6f4f]/20 dark:border-[#52b788]/20 text-[11px] text-[#2f6f4f] dark:text-[#52b788] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  New time: <strong>{formatScheduleDisplay(rescheduleDate, rescheduleTime)}</strong>
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e4e1da] dark:border-[#222834]">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-3 py-2 text-xs font-medium rounded-lg text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-bulk-reschedule"
                  type="button"
                  onClick={handleConfirmReschedule}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#2f6f4f] dark:bg-[#52b788] text-white dark:text-[#0b0e14] hover:opacity-90 transition-opacity shadow-xs"
                >
                  Apply to {selectedScheduledIds.length} Posts
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Bulk Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#161b24] w-full max-w-sm rounded-2xl border border-[#e4e1da] dark:border-[#222834] shadow-2xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#b3432b]/10 dark:bg-[#b3432b]/20 text-[#b3432b] flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#14181f] dark:text-[#f1f3f7]">
                      Cancel Scheduled Posts?
                    </h3>
                    <p className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                      {selectedScheduledIds.length} post{selectedScheduledIds.length > 1 ? 's' : ''} will be removed from your queue
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0] leading-relaxed">
                Canceling will stop these video releases across Instagram Reels, Facebook Reels, and YouTube Shorts. They will be removed from the publishing schedule.
              </p>

              {/* List of Affected Posts */}
              <div className="max-h-28 overflow-y-auto bg-[#fbfbfa] dark:bg-[#11141c] p-2.5 rounded-lg border border-[#e4e1da] dark:border-[#262c38] space-y-1">
                {selectedPostsDetails.map((p) => (
                  <div
                    key={p.id}
                    className="text-xs text-[#14181f] dark:text-[#f1f3f7] truncate flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3 h-3 text-[#b3432b] shrink-0" />
                    <span className="truncate">{p.title || p.videoName}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e4e1da] dark:border-[#222834]">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-3 py-2 text-xs font-medium rounded-lg text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]"
                >
                  Keep in Queue
                </button>
                <button
                  id="btn-confirm-bulk-cancel"
                  type="button"
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#b3432b] text-white hover:bg-[#9a3823] transition-colors shadow-xs"
                >
                  Yes, Cancel {selectedScheduledIds.length} Posts
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


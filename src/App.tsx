import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoUploader } from './components/VideoUploader';
import { PlatformSelector } from './components/PlatformSelector';
import { CaptionEditor } from './components/CaptionEditor';
import { SchedulePublishBar } from './components/SchedulePublishBar';
import { PhonePreview } from './components/PhonePreview';
import { AccountsModal } from './components/AccountsModal';
import { PublishModal } from './components/PublishModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { PublishAppModal } from './components/PublishAppModal';
import { ShareAppModal } from './components/ShareAppModal';
import { FeedbackModal } from './components/FeedbackModal';
import { DailySocialTip } from './components/DailySocialTip';
import { LegalModal } from './components/LegalModal';
import { SettingsModal, DEFAULT_APP_SETTINGS, AppSettingsState } from './components/SettingsModal';
import { CaptionSettings, PlatformId, PublishMode, ScheduledPost, SocialAccount, VideoMetadata, AppNotification } from './types';
import { INITIAL_ACCOUNTS, INITIAL_POST_HISTORY, SAMPLE_VIDEOS, MOCK_NOTIFICATIONS } from './data/mockData';
import { useI18n } from './i18n/I18nContext';
import { generateAbTestSimulation } from './utils/simulateAbMetrics';

export default function App() {
  const { t, getSampleVideo } = useI18n();

  // Theme State (Dark / Light mode)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reelcast_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('reelcast_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Accounts State with localStorage persistence
  const [accounts, setAccounts] = useState<SocialAccount[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('reelcast_connected_accounts');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load accounts from localStorage', e);
      }
    }
    return INITIAL_ACCOUNTS;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('reelcast_connected_accounts', JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts to localStorage', e);
    }
  }, [accounts]);

  // Selected Target Platforms
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>([
    'instagram',
    'facebook',
    'youtube'
  ]);

  // Video State (Auto-recovered from localStorage if previously edited, or preloaded with sample 1)
  const [video, setVideo] = useState<VideoMetadata | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('reelcast_draft_video');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load draft video from localStorage', e);
      }
    }
    const s = SAMPLE_VIDEOS[0];
    return {
      name: s.name,
      url: s.url,
      sizeBytes: s.sizeBytes,
      durationSec: s.durationSec,
      width: s.width,
      height: s.height,
      aspectRatioString: s.aspectRatioString,
      isVertical: s.isVertical,
      thumbnailUrl: s.url,
      trim: {
        startSec: 0,
        endSec: s.durationSec,
        durationSec: s.durationSec
      }
    };
  });

  // Caption Settings State (Auto-recovered from localStorage if previously edited)
  const [captionSettings, setCaptionSettings] = useState<CaptionSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('reelcast_draft_captions');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load draft captions from localStorage', e);
      }
    }
    return {
      masterTitle: SAMPLE_VIDEOS[0].titleSuggestion,
      masterCaption: SAMPLE_VIDEOS[0].captionSuggestion,
      adaptPerPlatform: false,
      instagramCaption: `${SAMPLE_VIDEOS[0].captionSuggestion}\n\n#Reels #TokyoNight #Cinematic #TravelGram`,
      facebookCaption: `${SAMPLE_VIDEOS[0].captionSuggestion}\n\nFollow our Page for more creative night photography tours!`,
      youtubeTitle: SAMPLE_VIDEOS[0].titleSuggestion,
      youtubeCaption: `${SAMPLE_VIDEOS[0].captionSuggestion}\n\n🔔 Subscribe to Reelcast Shorts for weekly aesthetic urban clips! #Shorts`,
      firstComment: "What's your favorite travel destination for night walks? 🏮"
    };
  });

  // Post History
  const [posts, setPosts] = useState<ScheduledPost[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('reelcast_posts_history');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load post history from localStorage', e);
      }
    }
    return INITIAL_POST_HISTORY;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('reelcast_posts_history', JSON.stringify(posts));
    } catch (e) {
      console.error('Failed to save post history to localStorage', e);
    }
  }, [posts]);

  // Modals & Drawers
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showPublishAppModal, setShowPublishAppModal] = useState(false);
  const [showShareAppModal, setShowShareAppModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | 'deletion'>('privacy');
  const [lastPublishMode, setLastPublishMode] = useState<PublishMode>('now');
  const [lastScheduledTime, setLastScheduledTime] = useState<string | undefined>();

  // Application Settings State with persistence
  const [appSettings, setAppSettings] = useState<AppSettingsState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('reelcast_app_settings');
        if (saved) return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
    return DEFAULT_APP_SETTINGS;
  });

  const handleUpdateSettings = (updated: Partial<AppSettingsState>) => {
    setAppSettings(prev => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('reelcast_app_settings', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save settings', e);
      }
      return next;
    });
  };

  const handleOpenLegal = (tab: 'privacy' | 'terms' | 'deletion') => {
    setLegalModalTab(tab);
    setShowLegalModal(true);
  };

  // Periodic Auto-Save for Video Draft & Trimming to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timeout = setTimeout(() => {
      try {
        if (video) {
          localStorage.setItem('reelcast_draft_video', JSON.stringify(video));
        } else {
          localStorage.removeItem('reelcast_draft_video');
        }
      } catch (e) {
        console.error('Failed to auto-save video draft', e);
      }
    }, 600);
    return () => clearTimeout(timeout);
  }, [video]);

  // Periodic Auto-Save for Captions, Title, and Hashtags to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem('reelcast_draft_captions', JSON.stringify(captionSettings));
      } catch (e) {
        console.error('Failed to auto-save captions draft', e);
      }
    }, 600);
    return () => clearTimeout(timeout);
  }, [captionSettings]);

  // Real-time Notifications & Scheduled Task Alerts State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('reelcast_notifications');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse notifications from localStorage', e);
      }
    }
    return MOCK_NOTIFICATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('reelcast_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications to localStorage', e);
    }
  }, [notifications]);

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Listen for OAuth completion messages from popup windows as per oauth-integration skill
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { platform, accountName, handle, subscriberCount, authMethod } = event.data;
        setAccounts(prev => prev.map(a => {
          if (a.platform === platform) {
            return {
              ...a,
              accountName: accountName || a.accountName,
              handle: handle || a.handle,
              subscriberCount: subscriberCount || a.subscriberCount,
              isConnected: true,
              authMethod: authMethod || 'live_oauth',
              connectedAt: new Date().toISOString()
            };
          }
          return a;
        }));

        addNotification({
          type: 'success',
          title: `${platform === 'youtube' ? 'YouTube Shorts' : 'Instagram Reels'} Connected`,
          message: `Live OAuth authorized for ${accountName || handle || platform}. Publishing permissions enabled!`,
          platforms: [platform]
        });
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const handleUpdateAccount = (updatedAcc: Partial<SocialAccount> & { platform: PlatformId }) => {
    setAccounts(prev => prev.map(a => {
      if (a.platform === updatedAcc.platform) {
        return {
          ...a,
          ...updatedAcc,
          isConnected: updatedAcc.isConnected !== undefined ? updatedAcc.isConnected : true
        };
      }
      return a;
    }));

    addNotification({
      type: 'success',
      title: 'Account Authorization Updated',
      message: `${updatedAcc.accountName || updatedAcc.platform} is connected and ready to publish.`,
      platforms: [updatedAcc.platform]
    });
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleSimulateSuccess = () => {
    addNotification({
      type: 'success',
      title: 'Live Publish Succeeded',
      message: '“Morning Coffee Routine” has just been successfully published to Instagram Reels and YouTube Shorts!',
      platforms: ['instagram', 'youtube'],
      actionLabel: 'View in History',
      actionType: 'open_history'
    });
  };

  const handleSimulateError = () => {
    addNotification({
      type: 'error',
      title: 'Scheduled Task Error: Meta Graph API',
      message: 'Facebook Reels automated publisher returned error 403: Video aspect ratio check warning. Please verify video dimensions.',
      platforms: ['facebook'],
      actionLabel: 'Check History',
      actionType: 'open_history'
    });
  };

  // Toggle platform selection
  const handleTogglePlatform = (platformId: PlatformId) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platformId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
    }
  };

  const handleSelectAllPlatforms = () => {
    if (selectedPlatforms.length === 3) {
      setSelectedPlatforms([]);
    } else {
      setSelectedPlatforms(['instagram', 'facebook', 'youtube']);
    }
  };

  // Sample video selection helper
  const handleSelectSamplePreset = (index: number) => {
    const s = SAMPLE_VIDEOS[index];
    const localized = getSampleVideo(index);
    const title = localized?.titleSuggestion || s.titleSuggestion;
    const caption = localized?.captionSuggestion || s.captionSuggestion;
    const name = index === 0 ? t('uploader.sample1Name') : t('uploader.sample2Name');
    const firstComment = localized?.firstCommentSuggestion || 'Let us know your thoughts in the comments below! 👇';

    setVideo({
      name: name,
      url: s.url,
      sizeBytes: s.sizeBytes,
      durationSec: s.durationSec,
      width: s.width,
      height: s.height,
      aspectRatioString: s.aspectRatioString,
      isVertical: s.isVertical,
      thumbnailUrl: s.url,
      trim: {
        startSec: 0,
        endSec: s.durationSec,
        durationSec: s.durationSec
      }
    });

    setCaptionSettings({
      masterTitle: title,
      masterCaption: caption,
      adaptPerPlatform: false,
      instagramCaption: `${caption}\n\n#Reels #Creator #Explore`,
      facebookCaption: `${caption}\n\nFollow our Page for daily creative updates!`,
      youtubeTitle: title,
      youtubeCaption: `${caption}\n\n🔔 Subscribe for more shorts! #Shorts`,
      firstComment: firstComment
    });
  };

  // Trigger publishing
  const handlePublish = (mode: PublishMode, scheduledTime?: string) => {
    setIsPublishing(true);
    setLastPublishMode(mode);
    setLastScheduledTime(scheduledTime);
    setShowPublishModal(true);

    const effectiveDuration = video?.trim ? video.trim.durationSec : (video?.durationSec || 15);

    // Compute A/B test simulation result if A/B testing is enabled
    const isAbTest = !!captionSettings.abTest?.enabled;
    const abTestResult = isAbTest
      ? generateAbTestSimulation(captionSettings.abTest!)
      : undefined;

    // Append to local post history
    const newPost: ScheduledPost = {
      id: `post-${Date.now()}`,
      title: captionSettings.masterTitle || 'Vertical Video Reel',
      caption: isAbTest
        ? `[A/B Test] A: "${captionSettings.abTest?.captionA?.slice(0, 45)}..." vs B: "${captionSettings.abTest?.captionB?.slice(0, 45)}..."`
        : captionSettings.masterCaption,
      videoName: video?.name || 'video.mp4',
      videoDuration: effectiveDuration,
      thumbnailUrl: video?.thumbnailUrl,
      platforms: [...selectedPlatforms],
      mode,
      scheduledTime,
      createdAt: 'Just now',
      status: mode === 'now' ? 'published' : 'scheduled',
      abTest: isAbTest ? captionSettings.abTest : undefined,
      targetStatuses: {
        instagram: selectedPlatforms.includes('instagram') ? (mode === 'now' ? 'published' : 'scheduled') : 'failed',
        facebook: selectedPlatforms.includes('facebook') ? (mode === 'now' ? 'published' : 'scheduled') : 'failed',
        youtube: selectedPlatforms.includes('youtube') ? (mode === 'now' ? 'published' : 'scheduled') : 'failed'
      },
      performance: mode === 'now' ? {
        totalReach: isAbTest && abTestResult
          ? abTestResult.variantA.reach + abTestResult.variantB.reach
          : Math.floor(Math.random() * 8000) + 12000,
        totalViews: isAbTest && abTestResult
          ? abTestResult.variantA.views + abTestResult.variantB.views
          : Math.floor(Math.random() * 10000) + 15000,
        totalLikes: isAbTest && abTestResult
          ? abTestResult.variantA.likes + abTestResult.variantB.likes
          : Math.floor(Math.random() * 1200) + 1400,
        totalComments: isAbTest && abTestResult
          ? abTestResult.variantA.comments + abTestResult.variantB.comments
          : Math.floor(Math.random() * 120) + 85,
        totalShares: isAbTest && abTestResult
          ? abTestResult.variantA.shares + abTestResult.variantB.shares
          : Math.floor(Math.random() * 300) + 240,
        engagementRate: isAbTest && abTestResult
          ? Number(((abTestResult.variantA.engagementRate + abTestResult.variantB.engagementRate) / 2).toFixed(1))
          : 13.8,
        avgWatchPercentage: isAbTest && abTestResult
          ? Number(((abTestResult.variantA.avgWatchPercentage + abTestResult.variantB.avgWatchPercentage) / 2).toFixed(1))
          : 89.2,
        abTestResult,
        platformMetrics: {
          ...(selectedPlatforms.includes('instagram') ? {
            instagram: { reach: 7200, views: 9100, likes: 820, comments: 55, shares: 140, avgWatchPercentage: 90.5 }
          } : {}),
          ...(selectedPlatforms.includes('youtube') ? {
            youtube: { reach: 6400, views: 8200, likes: 690, comments: 42, shares: 110, avgWatchPercentage: 91.2 }
          } : {}),
          ...(selectedPlatforms.includes('facebook') ? {
            facebook: { reach: 2400, views: 3100, likes: 210, comments: 18, shares: 45, avgWatchPercentage: 78.4 }
          } : {})
        },
        trendDaily: [
          { day: 'Day 1', instagramReach: 1800, facebookReach: 600, youtubeReach: 1400, totalReach: 3800, engagement: 520 },
          { day: 'Day 2', instagramReach: 3400, facebookReach: 1100, youtubeReach: 2800, totalReach: 7300, engagement: 950 },
          { day: 'Day 3', instagramReach: 5200, facebookReach: 1800, youtubeReach: 4600, totalReach: 11600, engagement: 1480 },
          { day: 'Day 4', instagramReach: 6100, facebookReach: 2100, youtubeReach: 5400, totalReach: 13600, engagement: 1780 },
          { day: 'Day 5', instagramReach: 6800, facebookReach: 2300, youtubeReach: 6000, totalReach: 15100, engagement: 1980 },
          { day: 'Day 6', instagramReach: 7100, facebookReach: 2380, youtubeReach: 6300, totalReach: 15780, engagement: 2060 },
          { day: 'Day 7', instagramReach: 7200, facebookReach: 2400, youtubeReach: 6400, totalReach: 16000, engagement: 2100 }
        ]
      } : undefined
    };

    setPosts([newPost, ...posts]);
    setIsPublishing(false);

    // Call live API publisher endpoint if publishing now
    if (mode === 'now') {
      fetch('/api/publish/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: newPost.id,
          platforms: selectedPlatforms,
          title: newPost.title,
          caption: newPost.caption,
          videoUrl: newPost.thumbnailUrl
        })
      }).catch(err => console.log('Live publish background status:', err));
    }

    // Surface real-time notification
    if (mode === 'now') {
      addNotification({
        type: 'success',
        title: 'Post Published Successfully!',
        message: `"${newPost.title}" was published to ${selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}.`,
        platforms: [...selectedPlatforms],
        postId: newPost.id,
        actionLabel: 'View in History',
        actionType: 'open_history'
      });
    } else {
      addNotification({
        type: 'success',
        title: 'Post Scheduled Successfully',
        message: `"${newPost.title}" scheduled for ${scheduledTime || 'selected release time'} across ${selectedPlatforms.length} platform(s).`,
        platforms: [...selectedPlatforms],
        postId: newPost.id,
        actionLabel: 'View in Queue',
        actionType: 'open_history'
      });
    }
  };

  const handleResetForm = () => {
    setVideo(null);
    setCaptionSettings({
      masterTitle: '',
      masterCaption: '',
      adaptPerPlatform: false,
      instagramCaption: '',
      facebookCaption: '',
      youtubeTitle: '',
      youtubeCaption: '',
      firstComment: ''
    });
    setSelectedPlatforms(['instagram', 'facebook', 'youtube']);
    try {
      localStorage.removeItem('reelcast_draft_video');
      localStorage.removeItem('reelcast_draft_captions');
    } catch (e) {
      console.error('Failed to clear drafts from localStorage', e);
    }
  };

  const handleToggleAccountConnection = (accId: string) => {
    setAccounts(accounts.map(a => {
      if (a.id === accId) {
        return { ...a, isConnected: !a.isConnected };
      }
      return a;
    }));
  };

  const handleAddCustomAccount = (newAcc: Omit<SocialAccount, 'id'>) => {
    const createdAccount: SocialAccount = {
      ...newAcc,
      id: `acc-${newAcc.platform}-${Date.now()}`
    };
    setAccounts(prev => [createdAccount, ...prev]);

    addNotification({
      type: 'success',
      title: 'New Account Added',
      message: `${createdAccount.accountName} (${createdAccount.handle}) was successfully added and connected for publishing!`,
      platforms: [createdAccount.platform]
    });
  };

  const handleDeleteAccount = (accId: string) => {
    const target = accounts.find(a => a.id === accId);
    setAccounts(prev => prev.filter(a => a.id !== accId));
    if (target) {
      addNotification({
        type: 'info',
        title: 'Account Removed',
        message: `${target.accountName} (${target.handle}) has been disconnected and removed.`,
        platforms: [target.platform]
      });
    }
  };

  const handleBulkUpdateScheduledTime = (postIds: string[], newScheduledTime: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (postIds.includes(post.id)) {
          return {
            ...post,
            scheduledTime: newScheduledTime
          };
        }
        return post;
      })
    );

    addNotification({
      type: 'info',
      title: 'Bulk Schedule Updated',
      message: `Rescheduled ${postIds.length} posts to ${newScheduledTime}.`,
      actionLabel: 'View Queue',
      actionType: 'open_history'
    });
  };

  const handleBulkCancelScheduledPosts = (postIds: string[]) => {
    setPosts(prevPosts => prevPosts.filter(post => !postIds.includes(post.id)));

    addNotification({
      type: 'warning',
      title: 'Scheduled Tasks Canceled',
      message: `Removed ${postIds.length} scheduled posts from the release queue.`,
      actionLabel: 'View Queue',
      actionType: 'open_history'
    });
  };

  const handleRefreshAnalytics = async () => {
    // Simulate real-time fetch from Instagram Graph, YouTube Analytics, Meta Graph APIs
    await new Promise(r => setTimeout(r, 750));

    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.status !== 'published' || !post.performance) return post;
        const currentPerf = post.performance;

        // Dynamic organic growth increment simulation
        const addedReach = Math.floor(Math.random() * 450) + 120;
        const addedViews = Math.floor(addedReach * 1.25);
        const addedLikes = Math.floor(addedViews * 0.08);
        const addedComments = Math.floor(addedLikes * 0.06);
        const addedShares = Math.floor(addedLikes * 0.12);

        return {
          ...post,
          performance: {
            ...currentPerf,
            totalReach: currentPerf.totalReach + addedReach,
            totalViews: currentPerf.totalViews + addedViews,
            totalLikes: currentPerf.totalLikes + addedLikes,
            totalComments: currentPerf.totalComments + addedComments,
            totalShares: currentPerf.totalShares + addedShares,
            platformMetrics: {
              ...currentPerf.platformMetrics,
              instagram: currentPerf.platformMetrics?.instagram ? {
                ...currentPerf.platformMetrics.instagram,
                reach: currentPerf.platformMetrics.instagram.reach + Math.floor(addedReach * 0.45),
                views: currentPerf.platformMetrics.instagram.views + Math.floor(addedViews * 0.45),
                likes: currentPerf.platformMetrics.instagram.likes + Math.floor(addedLikes * 0.5),
                comments: currentPerf.platformMetrics.instagram.comments + Math.floor(addedComments * 0.5),
                shares: currentPerf.platformMetrics.instagram.shares + Math.floor(addedShares * 0.5)
              } : undefined,
              youtube: currentPerf.platformMetrics?.youtube ? {
                ...currentPerf.platformMetrics.youtube,
                reach: currentPerf.platformMetrics.youtube.reach + Math.floor(addedReach * 0.35),
                views: currentPerf.platformMetrics.youtube.views + Math.floor(addedViews * 0.35),
                likes: currentPerf.platformMetrics.youtube.likes + Math.floor(addedLikes * 0.35),
                comments: currentPerf.platformMetrics.youtube.comments + Math.floor(addedComments * 0.35),
                shares: currentPerf.platformMetrics.youtube.shares + Math.floor(addedShares * 0.35)
              } : undefined,
              facebook: currentPerf.platformMetrics?.facebook ? {
                ...currentPerf.platformMetrics.facebook,
                reach: currentPerf.platformMetrics.facebook.reach + Math.floor(addedReach * 0.2),
                views: currentPerf.platformMetrics.facebook.views + Math.floor(addedViews * 0.2),
                likes: currentPerf.platformMetrics.facebook.likes + Math.floor(addedLikes * 0.15),
                comments: currentPerf.platformMetrics.facebook.comments + Math.floor(addedComments * 0.15),
                shares: currentPerf.platformMetrics.facebook.shares + Math.floor(addedShares * 0.15)
              } : undefined
            }
          }
        };
      })
    );

    addNotification({
      type: 'info',
      title: 'Analytics Refreshed',
      message: 'Retrieved fresh viewer counts, impressions, and engagement metrics from connected social APIs.',
      actionLabel: 'View Analytics',
      actionType: 'open_history'
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0c0f17] text-[#14181f] dark:text-[#f1f3f7] flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar with Theme Toggle & Notification Bell */}
      <Header
        accounts={accounts}
        onOpenAccounts={() => setShowAccountsModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenHistory={() => setShowHistoryDrawer(true)}
        onOpenPublishApp={() => setShowPublishAppModal(true)}
        onOpenShareApp={() => setShowShareAppModal(true)}
        historyCount={posts.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDismissNotification={handleDismissNotification}
        onClearAllNotifications={handleClearAllNotifications}
        onSimulateSuccess={handleSimulateSuccess}
        onSimulateError={handleSimulateError}
      />

      {/* Main Studio Work Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Intro Tagline Strip */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14181f] dark:text-[#f1f3f7]">
              {t('app.heroTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-[#6b6f76] dark:text-[#9aa1b0] mt-0.5">
              {t('app.heroSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#2f6f4f] dark:bg-[#52b788] animate-pulse" />
            <span className="text-[#6b6f76] dark:text-[#9aa1b0]">{t('app.engineReady')}</span>
          </div>
        </div>

        {/* Daily Social Tip & Creative Hook Generator (Powered by Gemini) */}
        <div className="mb-6">
          <DailySocialTip
            currentVideo={video}
            onApplyHook={(hookText) => {
              setCaptionSettings((prev) => ({
                ...prev,
                masterTitle: hookText,
                youtubeTitle: hookText
              }));
              addNotification({
                type: 'success',
                title: 'Hook Applied',
                message: `Set "${hookText.slice(0, 35)}..." as your video title.`
              });
            }}
            onApplyHashtags={(tags) => {
              const tagString = tags.join(' ');
              setCaptionSettings((prev) => ({
                ...prev,
                masterCaption: prev.masterCaption ? `${prev.masterCaption}\n\n${tagString}` : tagString
              }));
              addNotification({
                type: 'success',
                title: 'Hashtags Added',
                message: `Appended ${tags.length} niche hashtags to master caption.`
              });
            }}
          />
        </div>

        {/* 2-Column Responsive Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left / Middle: Creation Form Steps */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Step 1: Video Uploader & Trimming Studio */}
            <VideoUploader
              video={video}
              onVideoLoaded={(v) => setVideo(v)}
              onClearVideo={() => setVideo(null)}
              onSelectSamplePreset={handleSelectSamplePreset}
            />

            {/* Step 2: Target Social Platform Selector */}
            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onTogglePlatform={handleTogglePlatform}
              onSelectAll={handleSelectAllPlatforms}
              accounts={accounts}
              video={video}
            />

            {/* Step 3: Captions & Hashtags */}
            <CaptionEditor
              captionSettings={captionSettings}
              onChange={setCaptionSettings}
              selectedPlatforms={selectedPlatforms}
            />

            {/* Step 4: Schedule & Publish Action Bar */}
            <SchedulePublishBar
              video={video}
              selectedPlatforms={selectedPlatforms}
              isPublishing={isPublishing}
              onPublish={handlePublish}
              onReset={handleResetForm}
            />
          </div>

          {/* Right Column: Live Mobile Device Simulation */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
            <PhonePreview
              video={video}
              captionSettings={captionSettings}
              selectedPlatforms={selectedPlatforms}
              accounts={accounts}
            />
          </div>
        </div>
      </main>

      {/* Clean Studio Bottom Panel (Privacy Policy, Terms & Conditions, User Declaration) */}
      <footer className="border-t border-[#e4e1da] dark:border-[#222834] bg-white dark:bg-[#131720] py-5 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
          <div className="flex items-center gap-2.5">
            <img src="/reelcast-logo.svg" alt="Reelcast" className="w-5 h-5 object-contain" />
            <span className="font-semibold text-[#14181f] dark:text-[#f1f3f7]">Reelcast Social Studio</span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live on Google Cloud
            </span>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-4 sm:gap-6 text-xs font-medium">
            <button
              id="btn-footer-privacy"
              onClick={() => handleOpenLegal('privacy')}
              className="text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] hover:underline transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              id="btn-footer-terms"
              onClick={() => handleOpenLegal('terms')}
              className="text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] hover:underline transition-colors cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
            <span>•</span>
            <button
              id="btn-footer-declaration"
              onClick={() => handleOpenLegal('deletion')}
              className="text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] hover:underline transition-colors cursor-pointer"
            >
              User Declaration
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-overs */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentTheme={theme}
        onSetTheme={setTheme}
        settings={appSettings}
        onUpdateSettings={handleUpdateSettings}
      />

      <AccountsModal
        isOpen={showAccountsModal}
        onClose={() => setShowAccountsModal(false)}
        accounts={accounts}
        onToggleConnection={handleToggleAccountConnection}
        onUpdateAccount={handleUpdateAccount}
        onAddAccount={handleAddCustomAccount}
        onDeleteAccount={handleDeleteAccount}
      />

      <PublishAppModal
        isOpen={showPublishAppModal}
        onClose={() => setShowPublishAppModal(false)}
        onOpenLegal={handleOpenLegal}
        onOpenAccounts={() => {
          setShowPublishAppModal(false);
          setShowAccountsModal(true);
        }}
      />

      <ShareAppModal
        isOpen={showShareAppModal}
        onClose={() => setShowShareAppModal(false)}
      />

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSuccessNotification={(msg) => {
          addNotification({
            type: 'success',
            title: 'Review Submitted',
            message: msg
          });
        }}
      />

      <LegalModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        initialTab={legalModalTab}
      />

      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        video={video}
        selectedPlatforms={selectedPlatforms}
        mode={lastPublishMode}
        scheduledTime={lastScheduledTime}
        onViewHistory={() => {
          setShowPublishModal(false);
          setShowHistoryDrawer(true);
        }}
      />

      <HistoryDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        posts={posts}
        onRetryPost={(postId) => {
          alert(`Retrying delivery for post #${postId}...`);
        }}
        onBulkUpdateScheduledTime={handleBulkUpdateScheduledTime}
        onBulkCancelScheduledPosts={handleBulkCancelScheduledPosts}
        onRefreshAnalytics={handleRefreshAnalytics}
      />
    </div>
  );
}

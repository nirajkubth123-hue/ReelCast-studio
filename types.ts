export type PlatformId = 'instagram' | 'facebook' | 'youtube';

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  shortName: string;
  badge: string;
  iconColor: string;
  maxDurationSec: number;
  maxCaptionLength: number;
  titleRequired: boolean;
  aspectRatioHint: string;
  description: string;
}

export interface SocialAccount {
  id: string;
  platform: PlatformId;
  accountName: string;
  handle: string;
  avatarUrl?: string;
  isConnected: boolean;
  pageName?: string;
  subscriberCount?: string;
  accessToken?: string;
  authMethod?: 'live_oauth' | 'sandbox_simulated';
  connectedAt?: string;
}

export interface VideoTrimSettings {
  startSec: number;
  endSec: number;
  durationSec: number;
}

export interface VideoMetadata {
  file?: File;
  name: string;
  url: string;
  sizeBytes: number;
  durationSec: number;
  width: number;
  height: number;
  aspectRatioString: string;
  isVertical: boolean;
  thumbnailUrl?: string;
  trim?: VideoTrimSettings;
}

export interface AbTestConfig {
  enabled: boolean;
  captionA: string;
  captionB: string;
  titleA?: string;
  titleB?: string;
  hypothesis?: string;
  splitPercentage?: number; // e.g. 50 for 50/50 split
}

export interface AbTestResultMetrics {
  variantA: {
    label: string;
    caption: string;
    reach: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    avgWatchPercentage: number;
  };
  variantB: {
    label: string;
    caption: string;
    reach: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    avgWatchPercentage: number;
  };
  winningVariant: 'A' | 'B' | 'tie';
  confidenceScore: number; // e.g. 94%
  winningDifferencePercent: number; // e.g. +28%
  keyDifferentiator: string;
}

export interface CaptionSettings {
  masterTitle: string;
  masterCaption: string;
  adaptPerPlatform: boolean;
  instagramCaption: string;
  facebookCaption: string;
  youtubeTitle: string;
  youtubeCaption: string;
  firstComment: string;
  abTest?: AbTestConfig;
}

export type PublishMode = 'now' | 'schedule';

export interface PublishTargetStatus {
  platform: PlatformId;
  status: 'idle' | 'preparing' | 'uploading' | 'processing' | 'published' | 'failed';
  progress: number;
  postUrl?: string;
  errorMessage?: string;
  externalId?: string;
}

export interface PlatformMetric {
  reach: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  avgWatchPercentage: number;
}

export interface DailyTrendPoint {
  day: string;
  instagramReach: number;
  facebookReach: number;
  youtubeReach: number;
  totalReach: number;
  engagement: number;
}

export interface PostPerformance {
  totalReach: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  engagementRate: number;
  avgWatchPercentage: number;
  platformMetrics: Partial<Record<PlatformId, PlatformMetric>>;
  trendDaily: DailyTrendPoint[];
  abTestResult?: AbTestResultMetrics;
}

export interface ScheduledPost {
  id: string;
  title: string;
  caption: string;
  videoName: string;
  videoDuration: number;
  thumbnailUrl?: string;
  platforms: PlatformId[];
  mode: PublishMode;
  scheduledTime?: string;
  createdAt: string;
  status: 'draft' | 'scheduled' | 'published' | 'partial_failed';
  targetStatuses: Record<PlatformId, 'published' | 'scheduled' | 'failed'>;
  performance?: PostPerformance;
  abTest?: AbTestConfig;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  platforms?: PlatformId[];
  postId?: string;
  actionLabel?: string;
  actionType?: 'open_history' | 'open_accounts';
}


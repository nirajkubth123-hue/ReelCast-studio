import { PlatformConfig, SocialAccount, ScheduledPost, AppNotification } from '../types';

export const PLATFORMS: Record<string, PlatformConfig> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram Reels',
    shortName: 'IG Reels',
    badge: '9:16 Vertical',
    iconColor: '#E1306C',
    maxDurationSec: 90,
    maxCaptionLength: 2200,
    titleRequired: false,
    aspectRatioHint: '9:16 (1080x1920 recommended)',
    description: 'Auto-publishes via Meta Graph API to linked Professional Instagram account.'
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook Reels',
    shortName: 'FB Reels',
    badge: 'Page Reels',
    iconColor: '#1877F2',
    maxDurationSec: 90,
    maxCaptionLength: 5000,
    titleRequired: false,
    aspectRatioHint: '9:16 vertical full screen',
    description: 'Published directly to your managed Facebook Business Page feed and Reels reel.'
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube Shorts',
    shortName: 'YT Shorts',
    badge: 'Vertical < 3m',
    iconColor: '#FF0000',
    maxDurationSec: 180,
    maxCaptionLength: 5000,
    titleRequired: true,
    aspectRatioHint: 'Vertical/Square under 3 min with #Shorts',
    description: 'Uploaded via YouTube Data API v3 and automatically categorized as a Short.'
  }
};

export const INITIAL_ACCOUNTS: SocialAccount[] = [];

export const HASHTAG_PRESETS = [
  {
    category: 'Trending & Viral',
    tags: ['#viral', '#trending', '#fyp', '#explore', '#contentcreator', '#reelsvideo', '#creator']
  },
  {
    category: 'YouTube Shorts',
    tags: ['#shorts', '#youtubeshorts', '#shortsvideo', '#subscribe', '#viralshorts', '#trendingnow']
  },
  {
    category: 'Tech & AI',
    tags: ['#tech', '#aitools', '#innovation', '#developer', '#coding', '#software', '#futuretech']
  },
  {
    category: 'Lifestyle & Vlogs',
    tags: ['#lifestyle', '#dailyvlog', '#aesthetic', '#behindthescenes', '#dayinmylife', '#inspiration']
  },
  {
    category: 'Business & Growth',
    tags: ['#entrepreneur', '#smallbusiness', '#socialmediamarketing', '#contentcreation', '#growthhacking']
  }
];

export const SAMPLE_VIDEOS = [
  {
    id: 'sample-1',
    name: 'neon_tokyo_night_walk_9x16.mp4',
    url: '/sample-reel-1.mp4',
    durationSec: 15,
    sizeBytes: 8400000,
    width: 1080,
    height: 1920,
    aspectRatioString: '9:16',
    isVertical: true,
    titleSuggestion: 'Late night wander through glowing Tokyo streets #Shorts',
    captionSuggestion: 'Nothing beats the ambient neon rain reflection in Shinjuku after midnight. Which city has your favorite night aesthetic? Drop your thoughts below! 🌃✨'
  },
  {
    id: 'sample-2',
    name: 'coffee_pour_macro_cinematic.mp4',
    url: '/sample-reel-2.mp4',
    durationSec: 12,
    sizeBytes: 6200000,
    width: 1080,
    height: 1920,
    aspectRatioString: '9:16',
    isVertical: true,
    titleSuggestion: 'The satisfying morning latte art pour ☕️ #Shorts',
    captionSuggestion: 'Morning rituals keep the creative energy flowing. Pure satisfaction in every slow pour. Are you team Espresso or team Cold Brew? 👇'
  }
];

export const INITIAL_POST_HISTORY: ScheduledPost[] = [
  {
    id: 'post-101',
    title: '5 AI Tools that will 10x your productivity in 2026',
    caption: 'Save this for later! These 5 underrated tools completely revamped our creative workflow this week. #AI #Productivity #Shorts #TechReels',
    videoName: 'ai_tools_rundown_v2.mp4',
    videoDuration: 34,
    thumbnailUrl: '/sample-reel-1.mp4',
    platforms: ['instagram', 'facebook', 'youtube'],
    mode: 'now',
    createdAt: 'Yesterday at 4:30 PM',
    status: 'published',
    abTest: {
      enabled: true,
      captionA: 'Save this for later! These 5 underrated AI tools completely revamped our creative workflow this week. #AI #Productivity',
      captionB: 'Which of these 5 AI tools are you actually using? Let us know your top pick in the comments below! 👇 #AI #Productivity',
      splitPercentage: 50,
      hypothesis: 'Interactive question prompt (Variant B) vs Save-for-later CTA (Variant A)'
    },
    targetStatuses: {
      instagram: 'published',
      facebook: 'published',
      youtube: 'published'
    },
    performance: {
      totalReach: 78400,
      totalViews: 94200,
      totalLikes: 8920,
      totalComments: 642,
      totalShares: 1840,
      engagementRate: 14.5,
      avgWatchPercentage: 86.4,
      abTestResult: {
        variantA: {
          label: 'Variant A (Save CTA)',
          caption: 'Save this for later! These 5 underrated AI tools completely revamped our creative workflow this week. #AI #Productivity',
          reach: 36800,
          views: 44200,
          likes: 3840,
          comments: 182,
          shares: 1120,
          engagementRate: 11.6,
          avgWatchPercentage: 84.2
        },
        variantB: {
          label: 'Variant B (Question Hook)',
          caption: 'Which of these 5 AI tools are you actually using? Let us know your top pick in the comments below! 👇 #AI #Productivity',
          reach: 41600,
          views: 50000,
          likes: 5080,
          comments: 460,
          shares: 720,
          engagementRate: 17.1,
          avgWatchPercentage: 88.6
        },
        winningVariant: 'B',
        confidenceScore: 96,
        winningDifferencePercent: 47,
        keyDifferentiator: 'Direct question hook drove 2.5x higher comment conversations and triggered algorithmic explore reach'
      },
      platformMetrics: {
        instagram: {
          reach: 34200,
          views: 41000,
          likes: 4120,
          comments: 310,
          shares: 980,
          avgWatchPercentage: 88.2
        },
        youtube: {
          reach: 32800,
          views: 39500,
          likes: 3840,
          comments: 260,
          shares: 640,
          avgWatchPercentage: 89.1
        },
        facebook: {
          reach: 11400,
          views: 13700,
          likes: 960,
          comments: 72,
          shares: 220,
          avgWatchPercentage: 74.5
        }
      },
      trendDaily: [
        { day: 'Day 1', instagramReach: 8200, facebookReach: 2100, youtubeReach: 6400, totalReach: 16700, engagement: 2100 },
        { day: 'Day 2', instagramReach: 14500, facebookReach: 4300, youtubeReach: 12900, totalReach: 31700, engagement: 4400 },
        { day: 'Day 3', instagramReach: 23100, facebookReach: 7600, youtubeReach: 21400, totalReach: 52100, engagement: 7200 },
        { day: 'Day 4', instagramReach: 29800, facebookReach: 9800, youtubeReach: 27900, totalReach: 67500, engagement: 9500 },
        { day: 'Day 5', instagramReach: 34200, facebookReach: 11400, youtubeReach: 32800, totalReach: 78400, engagement: 11402 },
        { day: 'Day 6', instagramReach: 37100, facebookReach: 12300, youtubeReach: 35600, totalReach: 85000, engagement: 12380 },
        { day: 'Day 7', instagramReach: 39400, facebookReach: 12900, youtubeReach: 37900, totalReach: 90200, engagement: 13150 }
      ]
    }
  },
  {
    id: 'post-100',
    title: 'Neon Tokyo Rain Cinematic 60fps',
    caption: 'Nothing beats the ambient neon rain reflection in Shinjuku after midnight. Which city has your favorite aesthetic? 🌃 #Tokyo #Shorts #Reels',
    videoName: 'tokyo_neon_streets.mp4',
    videoDuration: 15,
    thumbnailUrl: '/sample-reel-1.mp4',
    platforms: ['instagram', 'youtube'],
    mode: 'now',
    createdAt: '3 days ago',
    status: 'published',
    targetStatuses: {
      instagram: 'published',
      facebook: 'failed',
      youtube: 'published'
    },
    performance: {
      totalReach: 48900,
      totalViews: 61200,
      totalLikes: 6140,
      totalComments: 388,
      totalShares: 920,
      engagementRate: 15.2,
      avgWatchPercentage: 92.1,
      platformMetrics: {
        instagram: {
          reach: 28400,
          views: 35200,
          likes: 3820,
          comments: 240,
          shares: 590,
          avgWatchPercentage: 93.4
        },
        youtube: {
          reach: 20500,
          views: 26000,
          likes: 2320,
          comments: 148,
          shares: 330,
          avgWatchPercentage: 90.5
        }
      },
      trendDaily: [
        { day: 'Day 1', instagramReach: 6400, facebookReach: 0, youtubeReach: 4900, totalReach: 11300, engagement: 1650 },
        { day: 'Day 2', instagramReach: 13900, facebookReach: 0, youtubeReach: 10400, totalReach: 24300, engagement: 3480 },
        { day: 'Day 3', instagramReach: 21500, facebookReach: 0, youtubeReach: 15800, totalReach: 37300, engagement: 5310 },
        { day: 'Day 4', instagramReach: 26200, facebookReach: 0, youtubeReach: 18900, totalReach: 45100, engagement: 6620 },
        { day: 'Day 5', instagramReach: 28400, facebookReach: 0, youtubeReach: 20500, totalReach: 48900, engagement: 7448 },
        { day: 'Day 6', instagramReach: 30800, facebookReach: 0, youtubeReach: 22100, totalReach: 52900, engagement: 8090 },
        { day: 'Day 7', instagramReach: 32600, facebookReach: 0, youtubeReach: 23600, totalReach: 56200, engagement: 8580 }
      ]
    }
  },
  {
    id: 'post-99',
    title: 'Minimalist Espresso Extraction Routine',
    caption: 'Dialing in a washed Ethiopian single origin with the flat burr grinder. That bottomless portafilter flow is pure ASMR. ☕ #CoffeeTok #Espresso #Reels',
    videoName: 'espresso_flow_macro.mp4',
    videoDuration: 22,
    thumbnailUrl: '/sample-reel-2.mp4',
    platforms: ['instagram', 'facebook', 'youtube'],
    mode: 'now',
    createdAt: '5 days ago',
    status: 'published',
    targetStatuses: {
      instagram: 'published',
      facebook: 'published',
      youtube: 'published'
    },
    performance: {
      totalReach: 62100,
      totalViews: 74800,
      totalLikes: 7420,
      totalComments: 512,
      totalShares: 1390,
      engagementRate: 14.9,
      avgWatchPercentage: 94.2,
      platformMetrics: {
        instagram: {
          reach: 29500,
          views: 36200,
          likes: 3890,
          comments: 290,
          shares: 780,
          avgWatchPercentage: 96.1
        },
        youtube: {
          reach: 21800,
          views: 25900,
          likes: 2490,
          comments: 162,
          shares: 460,
          avgWatchPercentage: 93.8
        },
        facebook: {
          reach: 10800,
          views: 12700,
          likes: 1040,
          comments: 60,
          shares: 150,
          avgWatchPercentage: 90.2
        }
      },
      trendDaily: [
        { day: 'Day 1', instagramReach: 7100, facebookReach: 1800, youtubeReach: 5200, totalReach: 14100, engagement: 1840 },
        { day: 'Day 2', instagramReach: 13200, facebookReach: 3900, youtubeReach: 10100, totalReach: 27200, engagement: 3720 },
        { day: 'Day 3', instagramReach: 19800, facebookReach: 6700, youtubeReach: 15200, totalReach: 41700, engagement: 5930 },
        { day: 'Day 4', instagramReach: 25400, facebookReach: 8900, youtubeReach: 18900, totalReach: 53200, engagement: 7650 },
        { day: 'Day 5', instagramReach: 29500, facebookReach: 10800, youtubeReach: 21800, totalReach: 62100, engagement: 9322 },
        { day: 'Day 6', instagramReach: 33100, facebookReach: 11900, youtubeReach: 24200, totalReach: 69200, engagement: 10390 },
        { day: 'Day 7', instagramReach: 35800, facebookReach: 12700, youtubeReach: 26100, totalReach: 74600, engagement: 11180 }
      ]
    }
  },
  {
    id: 'post-102',
    title: 'Behind the Scenes: Editing a 60fps Vertical Reel',
    caption: 'Full color grading breakdown coming tomorrow on our channel! Stay tuned. #BTS #ColorGrading #Shorts',
    videoName: 'studio_color_grading.mp4',
    videoDuration: 42,
    platforms: ['instagram', 'youtube'],
    mode: 'schedule',
    scheduledTime: 'Tomorrow at 6:00 PM',
    createdAt: 'Today at 10:15 AM',
    status: 'scheduled',
    targetStatuses: {
      instagram: 'scheduled',
      facebook: 'failed',
      youtube: 'scheduled'
    }
  },
  {
    id: 'post-103',
    title: 'Top 3 Color Grading Secrets for Vertical Video',
    caption: 'Quick tips on boosting skin tones and highlight rolloff in Lumetri. Save this before your next shoot! 🎬 #Videography #Reels #Shorts',
    videoName: 'color_grading_secrets.mp4',
    videoDuration: 28,
    platforms: ['instagram', 'facebook', 'youtube'],
    mode: 'schedule',
    scheduledTime: 'Sep 19, 2026 at 2:30 PM',
    createdAt: 'Today at 11:00 AM',
    status: 'scheduled',
    targetStatuses: {
      instagram: 'scheduled',
      facebook: 'scheduled',
      youtube: 'scheduled'
    }
  },
  {
    id: 'post-104',
    title: 'Microphone Shootout: Wireless Lavalier vs Shotgun',
    caption: 'Can you hear the difference in windy environments? Drop your guess in the comments below! 🎙️ #AudioGear #CreatorLife',
    videoName: 'mic_shootout_comparison.mp4',
    videoDuration: 35,
    platforms: ['youtube', 'facebook'],
    mode: 'schedule',
    scheduledTime: 'Sep 21, 2026 at 11:00 AM',
    createdAt: 'Yesterday at 3:45 PM',
    status: 'scheduled',
    targetStatuses: {
      instagram: 'failed',
      facebook: 'scheduled',
      youtube: 'scheduled'
    }
  }
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'error',
    title: 'Scheduled Task Error: Facebook Reels',
    message: 'Scheduled release for "Minimalist Espresso Extraction Routine" failed on Facebook: OAuth access token expired. Re-authenticate to resume queue.',
    timestamp: '12m ago',
    read: false,
    platforms: ['facebook'],
    actionLabel: 'Reconnect Facebook',
    actionType: 'open_accounts'
  },
  {
    id: 'notif-2',
    type: 'success',
    title: 'Post Published Successfully!',
    message: '“Behind the Scenes: Editing a 60fps Vertical Reel” was delivered to Instagram Reels, YouTube Shorts, and Facebook Reels.',
    timestamp: '45m ago',
    read: false,
    platforms: ['instagram', 'youtube', 'facebook'],
    actionLabel: 'View in History',
    actionType: 'open_history'
  },
  {
    id: 'notif-3',
    type: 'warning',
    title: 'Scheduled Task Quota Alert',
    message: 'YouTube Shorts daily API upload quota is at 80%. Remaining scheduled tasks may experience slight queue delay.',
    timestamp: '2h ago',
    read: true,
    platforms: ['youtube'],
    actionLabel: 'Check History',
    actionType: 'open_history'
  },
  {
    id: 'notif-4',
    type: 'success',
    title: '3 Posts Scheduled Successfully',
    message: 'Multi-post release schedule synchronized with cloud publishing engine.',
    timestamp: '4h ago',
    read: true,
    platforms: ['instagram', 'youtube', 'facebook']
  }
];

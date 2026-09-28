import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Repeat,
  Music,
  Disc,
  Smartphone,
  Instagram,
  Facebook,
  Youtube
} from 'lucide-react';
import { CaptionSettings, PlatformId, SocialAccount, VideoMetadata } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface PhonePreviewProps {
  video: VideoMetadata | null;
  captionSettings: CaptionSettings;
  selectedPlatforms: PlatformId[];
  accounts: SocialAccount[];
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({
  video,
  captionSettings,
  selectedPlatforms,
  accounts
}) => {
  const { t } = useI18n();
  const [activePreviewPlatform, setActivePreviewPlatform] = useState<PlatformId>(() => {
    return selectedPlatforms[0] || 'instagram';
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [videoHasError, setVideoHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    setVideoHasError(false);
  }, [video?.url]);

  const trimStart = video?.trim?.startSec ?? 0;
  const trimEnd = video?.trim?.endSec ?? (video?.durationSec || 15);
  const isTrimmed = video?.trim ? (video.trim.startSec > 0 || video.trim.endSec < video.durationSec) : false;

  // Sync default active platform if selected platforms change
  React.useEffect(() => {
    if (!selectedPlatforms.includes(activePreviewPlatform) && selectedPlatforms.length > 0) {
      setActivePreviewPlatform(selectedPlatforms[0]);
    }
  }, [selectedPlatforms, activePreviewPlatform]);

  // If trim bounds change while playing, keep within boundaries
  React.useEffect(() => {
    if (videoRef.current && video?.trim) {
      if (videoRef.current.currentTime < video.trim.startSec || videoRef.current.currentTime > video.trim.endSec) {
        videoRef.current.currentTime = video.trim.startSec;
      }
    }
  }, [video?.trim?.startSec, video?.trim?.endSec]);

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime < trimStart || videoRef.current.currentTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    if (curr >= trimEnd || curr < trimStart) {
      videoRef.current.currentTime = trimStart;
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const getAccount = (platform: PlatformId) => {
    return accounts.find(a => a.platform === platform);
  };

  const account = getAccount(activePreviewPlatform);

  // Get displayed caption based on active tab
  const getDisplayCaption = () => {
    if (activePreviewPlatform === 'instagram') {
      return captionSettings.adaptPerPlatform && captionSettings.instagramCaption
        ? captionSettings.instagramCaption
        : captionSettings.masterCaption || 'Your Instagram caption and hashtags will appear here...';
    }
    if (activePreviewPlatform === 'facebook') {
      return captionSettings.adaptPerPlatform && captionSettings.facebookCaption
        ? captionSettings.facebookCaption
        : captionSettings.masterCaption || 'Your Facebook Reels caption will appear here...';
    }
    if (activePreviewPlatform === 'youtube') {
      return captionSettings.adaptPerPlatform && captionSettings.youtubeCaption
        ? captionSettings.youtubeCaption
        : captionSettings.masterCaption || 'Your YouTube Shorts description...';
    }
    return captionSettings.masterCaption;
  };

  const getDisplayTitle = () => {
    return captionSettings.adaptPerPlatform && captionSettings.youtubeTitle
      ? captionSettings.youtubeTitle
      : captionSettings.masterTitle || 'Catchy Video Title #Shorts';
  };

  return (
    <div className="bg-white dark:bg-[#161b24] rounded-xl border border-[#e4e1da] dark:border-[#222834] p-5 shadow-xs flex flex-col items-center transition-colors duration-200">
      {/* Phone Header Control */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-[#e4e1da] dark:border-[#222834]">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#2f6f4f] dark:text-[#52b788]" />
          <h2 className="text-sm font-semibold text-[#14181f] dark:text-[#f1f3f7]">
            {t('preview.deviceSimulation')}
          </h2>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex items-center p-0.5 bg-[#f7f6f3] dark:bg-[#11141c] border border-[#e4e1da] dark:border-[#262c38] rounded-lg">
          <button
            id="tab-preview-ig"
            type="button"
            onClick={() => setActivePreviewPlatform('instagram')}
            className={`p-1.5 rounded-md transition-colors ${
              activePreviewPlatform === 'instagram'
                ? 'bg-white dark:bg-[#1e2430] shadow-xs text-[#E1306C]'
                : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
            title="Preview on Instagram Reels"
          >
            <Instagram className="w-4 h-4" />
          </button>
          <button
            id="tab-preview-fb"
            type="button"
            onClick={() => setActivePreviewPlatform('facebook')}
            className={`p-1.5 rounded-md transition-colors ${
              activePreviewPlatform === 'facebook'
                ? 'bg-white dark:bg-[#1e2430] shadow-xs text-[#1877F2]'
                : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
            title="Preview on Facebook Reels"
          >
            <Facebook className="w-4 h-4" />
          </button>
          <button
            id="tab-preview-yt"
            type="button"
            onClick={() => setActivePreviewPlatform('youtube')}
            className={`p-1.5 rounded-md transition-colors ${
              activePreviewPlatform === 'youtube'
                ? 'bg-white dark:bg-[#1e2430] shadow-xs text-[#FF0000]'
                : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
            }`}
            title="Preview on YouTube Shorts"
          >
            <Youtube className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Realistic Mobile Device Frame */}
      <div className="relative w-[280px] sm:w-[300px] aspect-[9/18.5] bg-black rounded-[36px] p-2.5 shadow-2xl border-4 border-[#1f242d] ring-1 ring-black/10 select-none overflow-hidden">
        {/* Notch / Speaker Hole */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1c1f26] mr-2" />
          <div className="w-8 h-1 rounded-full bg-[#1c1f26]" />
        </div>

        {/* Inner Phone Screen Area */}
        <div
          onClick={togglePlayback}
          className="relative w-full h-full rounded-[28px] overflow-hidden bg-[#111317] flex items-center justify-center cursor-pointer group"
        >
          {/* Video or Placeholder */}
          {video ? (
            <>
              <video
                ref={videoRef}
                src={video.url}
                className={`w-full h-full object-cover ${videoHasError ? 'hidden' : 'block'}`}
                loop={!isTrimmed}
                playsInline
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onError={() => {
                  setVideoHasError(true);
                }}
              />
              {videoHasError && (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#18202c] via-[#0f131a] to-[#080a0f] text-white">
                  <div className="w-14 h-14 rounded-full bg-[#2f6f4f]/20 border border-[#2f6f4f]/40 flex items-center justify-center mb-3 animate-pulse">
                    <Play className="w-6 h-6 text-[#52b788] fill-current ml-1" />
                  </div>
                  <span className="text-xs font-semibold text-white/90 truncate max-w-[200px]">
                    {video.name}
                  </span>
                  <span className="text-[10px] text-white/50 mt-1 px-2 py-0.5 rounded-full bg-white/10">
                    Preview Stream Active · 9:16
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 text-white/50">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                <Play className="w-5 h-5 ml-0.5 text-white/70" />
              </div>
              <p className="text-xs font-medium text-white/80">Upload a video</p>
              <p className="text-[10px] text-white/50 mt-0.5">to preview authentic 9:16 reels playback</p>
            </div>
          )}

          {/* Central Play/Pause Flash Overlay */}
          {video && !isPlaying && (
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-black/50 text-white backdrop-blur-xs flex items-center justify-center">
                <Play className="w-6 h-6 fill-current ml-1" />
              </div>
            </div>
          )}

          {/* Mute Button (Top Right) */}
          {video && (
            <button
              onClick={toggleMute}
              className="absolute top-7 right-3 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center z-20 hover:bg-black/80 transition-colors"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* -------------------- INSTAGRAM REELS OVERLAY -------------------- */}
          {activePreviewPlatform === 'instagram' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 z-10 text-white">
              {/* Top Bar */}
              <div className="flex items-center justify-between pt-5 px-1">
                <span className="font-semibold text-xs drop-shadow-md">Reels</span>
                <span className="text-[11px] text-white/80 drop-shadow-md">Camera</span>
              </div>

              {/* Bottom & Right Layout */}
              <div className="flex items-end justify-between gap-2 pb-2">
                {/* Bottom Left: Creator & Caption */}
                <div className="space-y-1.5 max-w-[75%] drop-shadow-md">
                  <div className="flex items-center gap-2">
                    <img
                      src={account?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt="avatar"
                      className="w-7 h-7 rounded-full border border-white/40 object-cover"
                    />
                    <span className="text-xs font-semibold text-white tracking-tight">
                      {account?.handle || '@reelcast.creator'}
                    </span>
                    <button className="text-[10px] font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/30 text-white">
                      Follow
                    </button>
                  </div>

                  {/* Caption with more toggle */}
                  <div
                    onClick={(e) => { e.stopPropagation(); setShowFullCaption(!showFullCaption); }}
                    className="text-[11px] text-white/95 leading-snug cursor-pointer pointer-events-auto"
                  >
                    <p className={showFullCaption ? 'line-clamp-none' : 'line-clamp-2'}>
                      {getDisplayCaption()}
                    </p>
                    {!showFullCaption && getDisplayCaption().length > 70 && (
                      <span className="text-white/60 text-[10px] font-medium ml-1">...more</span>
                    )}
                  </div>

                  {/* Audio track ticker */}
                  <div className="flex items-center gap-1 text-[10px] text-white/80">
                    <Music className="w-2.5 h-2.5 animate-pulse" />
                    <span className="truncate">Original audio • Reelcast Studio</span>
                  </div>
                </div>

                {/* Right Action Rail */}
                <div className="flex flex-col items-center gap-3.5 text-center drop-shadow-md">
                  <div className="flex flex-col items-center">
                    <Heart className="w-6 h-6 text-white" />
                    <span className="text-[10px] font-semibold mt-0.5">24.5K</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                    <span className="text-[10px] font-semibold mt-0.5">312</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Share2 className="w-5 h-5 text-white" />
                    <span className="text-[10px] font-semibold mt-0.5">Share</span>
                  </div>
                  {/* Spinning Disc */}
                  <div className="w-7 h-7 rounded-full bg-black/50 border border-white/50 flex items-center justify-center mt-1">
                    <Disc className="w-4 h-4 text-white animate-spin" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------- YOUTUBE SHORTS OVERLAY -------------------- */}
          {activePreviewPlatform === 'youtube' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 z-10 text-white">
              {/* Top Bar */}
              <div className="flex items-center justify-between pt-5 px-1">
                <span className="font-bold text-xs tracking-wider uppercase text-white drop-shadow-md">Shorts</span>
                <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
                  <span className="text-[10px] font-bold">⋮</span>
                </div>
              </div>

              {/* Bottom & Right Layout */}
              <div className="flex items-end justify-between gap-2 pb-2">
                {/* Bottom Left: Title & Channel */}
                <div className="space-y-1.5 max-w-[75%] drop-shadow-md">
                  {/* Channel Row */}
                  <div className="flex items-center gap-2">
                    <img
                      src={account?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt="avatar"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-white truncate max-w-[100px]">
                      {account?.handle || '@ReelcastShorts'}
                    </span>
                    <button className="text-[10px] font-bold bg-[#FF0000] px-2 py-0.5 rounded-full text-white">
                      Subscribe
                    </button>
                  </div>

                  {/* Title with #Shorts */}
                  <div className="text-xs font-medium text-white/95 leading-snug line-clamp-2">
                    {getDisplayTitle()}
                  </div>

                  {/* Audio */}
                  <div className="flex items-center gap-1 text-[10px] text-white/70">
                    <Music className="w-2.5 h-2.5" />
                    <span className="truncate">Original Sound</span>
                  </div>
                </div>

                {/* Right Action Rail */}
                <div className="flex flex-col items-center gap-3 text-center drop-shadow-md">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center">
                      <ThumbsUp className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold mt-0.5">38K</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center">
                      <ThumbsDown className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold mt-0.5">Dislike</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold mt-0.5">842</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center">
                      <Share2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold mt-0.5">Share</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center">
                      <Repeat className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold mt-0.5">Remix</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------- FACEBOOK REELS OVERLAY -------------------- */}
          {activePreviewPlatform === 'facebook' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 z-10 text-white">
              {/* Top Bar */}
              <div className="flex items-center justify-between pt-5 px-1">
                <span className="font-semibold text-xs text-white drop-shadow-md">Facebook Reels</span>
                <span className="text-[11px] text-white/80">Page Reel</span>
              </div>

              {/* Bottom & Right Layout */}
              <div className="flex items-end justify-between gap-2 pb-2">
                {/* Bottom Left */}
                <div className="space-y-1.5 max-w-[75%] drop-shadow-md">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={account?.avatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'}
                      alt="page avatar"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="truncate">
                      <span className="text-xs font-semibold text-white block truncate">
                        {account?.accountName || 'Reelcast Creator Page'}
                      </span>
                    </div>
                    <button className="text-[10px] font-semibold text-[#1877F2] bg-white px-2 py-0.5 rounded-md">
                      Follow
                    </button>
                  </div>

                  <p className="text-[11px] text-white/95 leading-snug line-clamp-2">
                    {getDisplayCaption()}
                  </p>
                </div>

                {/* Right Action Rail */}
                <div className="flex flex-col items-center gap-3.5 text-center drop-shadow-md">
                  <div className="flex flex-col items-center">
                    <ThumbsUp className="w-6 h-6 text-white" />
                    <span className="text-[10px] font-semibold mt-0.5">12K</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                    <span className="text-[10px] font-semibold mt-0.5">189</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Share2 className="w-5 h-5 text-white" />
                    <span className="text-[10px] font-semibold mt-0.5">Share</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom info helper */}
      <div className="mt-3 text-center text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
        <p className="font-medium text-[#14181f] dark:text-[#f1f3f7]">
          Showing {activePreviewPlatform === 'instagram' ? 'Instagram Reel' : activePreviewPlatform === 'youtube' ? 'YouTube Short' : 'Facebook Reel'}
          {isTrimmed && (
            <span className="ml-1 text-[11px] text-[#2f6f4f] dark:text-[#52b788]">
              • Trimmed ({video?.trim?.durationSec}s)
            </span>
          )}
        </p>
        <p className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
          Click phone screen to play / pause loop
        </p>
      </div>
    </div>
  );
};

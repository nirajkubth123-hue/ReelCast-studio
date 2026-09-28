import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Upload,
  Film,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Scissors,
  RotateCcw,
  Check,
  Clock,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { VideoMetadata, VideoTrimSettings } from '../types';
import { SAMPLE_VIDEOS } from '../data/mockData';
import { useI18n } from '../i18n/I18nContext';

interface VideoUploaderProps {
  video: VideoMetadata | null;
  onVideoLoaded: (video: VideoMetadata) => void;
  onClearVideo: () => void;
  onSelectSamplePreset?: (sampleIndex: number) => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  video,
  onVideoLoaded,
  onClearVideo,
  onSelectSamplePreset
}) => {
  const { t, getSampleVideo } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [videoHasError, setVideoHasError] = useState(false);

  // Trimming State
  const [startSec, setStartSec] = useState<number>(0);
  const [endSec, setEndSec] = useState<number>(15);
  const [isTrimLooping, setIsTrimLooping] = useState(false);

  // Sync trim bounds whenever video changes or initializes
  useEffect(() => {
    setVideoHasError(false);
    if (video) {
      if (video.trim) {
        setStartSec(video.trim.startSec);
        setEndSec(video.trim.endSec);
      } else {
        setStartSec(0);
        setEndSec(video.durationSec);
      }
    } else {
      setStartSec(0);
      setEndSec(15);
      setIsTrimLooping(false);
      setIsPlaying(false);
    }
  }, [video?.url, video?.durationSec]);

  // Compute effective trimmed duration
  const rawDuration = video?.durationSec || 15;
  const trimmedDuration = Math.max(0.5, Math.round((endSec - startSec) * 10) / 10);
  const isTrimmed = video ? (startSec > 0 || endSec < rawDuration) : false;

  const updateTrimBounds = useCallback((newStart: number, newEnd: number) => {
    if (!video) return;
    const clampedStart = Math.max(0, Math.min(newStart, rawDuration - 0.5));
    const clampedEnd = Math.min(rawDuration, Math.max(newEnd, clampedStart + 0.5));
    const cleanStart = Math.round(clampedStart * 10) / 10;
    const cleanEnd = Math.round(clampedEnd * 10) / 10;
    const cleanDur = Math.round((cleanEnd - cleanStart) * 10) / 10;

    setStartSec(cleanStart);
    setEndSec(cleanEnd);

    const trimSettings: VideoTrimSettings = {
      startSec: cleanStart,
      endSec: cleanEnd,
      durationSec: cleanDur
    };

    onVideoLoaded({
      ...video,
      trim: trimSettings
    });
  }, [video, rawDuration, onVideoLoaded]);

  const handleStartSlider = (val: number) => {
    const safeStart = Math.min(val, endSec - 0.5);
    updateTrimBounds(safeStart, endSec);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = safeStart;
      setCurrentTime(safeStart);
    }
  };

  const handleEndSlider = (val: number) => {
    const safeEnd = Math.max(val, startSec + 0.5);
    updateTrimBounds(startSec, safeEnd);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = safeEnd;
      setCurrentTime(safeEnd);
    }
  };

  const handleSetStartToCurrent = () => {
    if (!videoPlayerRef.current) return;
    const current = Math.floor(videoPlayerRef.current.currentTime * 10) / 10;
    if (current < endSec - 0.5) {
      handleStartSlider(current);
    }
  };

  const handleSetEndToCurrent = () => {
    if (!videoPlayerRef.current) return;
    const current = Math.ceil(videoPlayerRef.current.currentTime * 10) / 10;
    if (current > startSec + 0.5) {
      handleEndSlider(current);
    }
  };

  const handleResetTrim = () => {
    if (!video) return;
    updateTrimBounds(0, rawDuration);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const handleApplyPreset = (seconds: number) => {
    if (!video) return;
    const targetEnd = Math.min(rawDuration, seconds);
    updateTrimBounds(0, targetEnd);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const toggleTrimmedPlayback = () => {
    if (!videoPlayerRef.current) return;
    if (isPlaying && isTrimLooping) {
      videoPlayerRef.current.pause();
      setIsPlaying(false);
      setIsTrimLooping(false);
    } else {
      videoPlayerRef.current.currentTime = startSec;
      videoPlayerRef.current.play();
      setIsPlaying(true);
      setIsTrimLooping(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoPlayerRef.current) return;
    const curr = videoPlayerRef.current.currentTime;
    setCurrentTime(curr);

    // If in trimmed loop mode or playing normally past endSec
    if (isTrimLooping) {
      if (curr >= endSec || curr < startSec) {
        videoPlayerRef.current.currentTime = startSec;
      }
    }
  };

  const processVideoFile = (file: File) => {
    setIsExtracting(true);
    const videoUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.src = videoUrl;
    tempVideo.preload = 'metadata';
    tempVideo.muted = true;
    tempVideo.playsInline = true;

    tempVideo.onloadedmetadata = () => {
      const durationSec = Math.round(tempVideo.duration) || 15;
      const width = tempVideo.videoWidth || 1080;
      const height = tempVideo.videoHeight || 1920;
      const isVertical = height >= width;

      // Extract frame for thumbnail at 1s or 25% duration
      tempVideo.currentTime = Math.min(1.0, durationSec * 0.25);
    };

    tempVideo.onseeked = () => {
      let thumbUrl: string | undefined;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 360;
        canvas.height = 640;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          thumbUrl = canvas.toDataURL('image/jpeg', 0.85);
        }
      } catch (err) {
        console.warn('Could not generate canvas thumbnail:', err);
      }

      const durationSec = Math.round(tempVideo.duration) || 15;
      const width = tempVideo.videoWidth || 1080;
      const height = tempVideo.videoHeight || 1920;
      const isVertical = height >= width;

      onVideoLoaded({
        file,
        name: file.name,
        url: videoUrl,
        sizeBytes: file.size,
        durationSec,
        width,
        height,
        aspectRatioString: isVertical ? '9:16 Vertical' : `${width}x${height} Landscape`,
        isVertical,
        thumbnailUrl: thumbUrl,
        trim: {
          startSec: 0,
          endSec: durationSec,
          durationSec
        }
      });
      setIsExtracting(false);
    };

    tempVideo.onerror = () => {
      setIsExtracting(false);
      alert('Could not read video file. Please try an MP4, MOV, or WebM file.');
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processVideoFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      processVideoFile(file);
    }
  };

  const loadSample = (index: number) => {
    const s = SAMPLE_VIDEOS[index];
    const localized = getSampleVideo(index);
    onVideoLoaded({
      name: index === 0 ? t('uploader.sample1Name') : t('uploader.sample2Name'),
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
    if (onSelectSamplePreset) {
      onSelectSamplePreset(index);
    }
  };

  const togglePlay = () => {
    if (!videoPlayerRef.current) return;
    if (isPlaying) {
      videoPlayerRef.current.pause();
      setIsPlaying(false);
      setIsTrimLooping(false);
    } else {
      videoPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoPlayerRef.current) return;
    videoPlayerRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = (sec % 60).toFixed(1);
    const paddedSecs = parseFloat(secs) < 10 ? `0${secs}` : secs;
    return `${mins}:${paddedSecs}`;
  };

  // Helper percentages for the trimming track
  const startPercent = Math.min(100, Math.max(0, (startSec / rawDuration) * 100));
  const endPercent = Math.min(100, Math.max(0, (endSec / rawDuration) * 100));
  const playheadPercent = Math.min(100, Math.max(0, (currentTime / rawDuration) * 100));

  return (
    <div className="bg-white dark:bg-[#161b24] rounded-xl border border-[#e4e1da] dark:border-[#222834] p-5 shadow-xs transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#2f6f4f]/10 dark:bg-[#2f6f4f]/20 text-[#2f6f4f] dark:text-[#52b788] flex items-center justify-center">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#14181f] dark:text-[#f1f3f7]">
              {t('uploader.stepTitle')}
            </h2>
            <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
              {t('uploader.stepSubtitle')}
            </p>
          </div>
        </div>

        {video && (
          <button
            id="btn-replace-video"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-medium text-[#2f6f4f] dark:text-[#52b788] hover:text-[#265b41] dark:hover:text-[#6ee7b7] flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('uploader.replaceVideo')}</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={handleFileChange}
      />

      {!video ? (
        <div>
          {/* Dropzone */}
          <div
            id="dropzone-video"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#2f6f4f] bg-[#2f6f4f]/5 dark:bg-[#2f6f4f]/10'
                : 'border-[#e4e1da] dark:border-[#2b3342] hover:border-[#c4c0b6] dark:hover:border-[#3d475a] bg-[#fbfbfa] dark:bg-[#11141c]'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#f4f1ea] dark:bg-[#1e2430] text-[#2f6f4f] dark:text-[#52b788] flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-[#14181f] dark:text-[#f1f3f7] mb-1">
              {t('uploader.dragTitle')}
            </p>
            <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0] max-w-sm mx-auto mb-3">
              {t('uploader.dragSubtitle')}
            </p>
            <div className="inline-flex items-center gap-3 text-[11px] text-[#6b6f76] dark:text-[#9aa1b0] bg-white dark:bg-[#181d26] px-3 py-1 rounded-full border border-[#e4e1da] dark:border-[#262c38]">
              <span>MP4, MOV, WebM</span>
              <span>•</span>
              <span>Aspect 9:16</span>
              <span>•</span>
              <span>Max 500MB</span>
            </div>
          </div>

          {/* Quick sample loader pills */}
          <div className="mt-3.5 pt-3 border-t border-[#f0ede6] dark:border-[#222834] flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#6b6f76] dark:text-[#9aa1b0] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#c4622d]" />
              {t('uploader.samplePresetsTitle')}:
            </span>
            <button
              id="btn-sample-tokyo"
              type="button"
              onClick={() => loadSample(0)}
              className="text-xs font-medium text-[#14181f] dark:text-[#f1f3f7] bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#2b3342] px-2.5 py-1 rounded-md transition-colors"
            >
              {t('uploader.sample1Name')} (15s)
            </button>
            <button
              id="btn-sample-coffee"
              type="button"
              onClick={() => loadSample(1)}
              className="text-xs font-medium text-[#14181f] dark:text-[#f1f3f7] bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#2b3342] px-2.5 py-1 rounded-md transition-colors"
            >
              {t('uploader.sample2Name')} (12s)
            </button>
          </div>
        </div>
      ) : (
        /* Video Loaded Card with Player & Trimmer */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#fbfbfa] dark:bg-[#11141c] p-3.5 rounded-lg border border-[#e4e1da] dark:border-[#222834]">
            {/* Small player preview */}
            <div className="sm:col-span-4 relative rounded-lg overflow-hidden bg-black aspect-[9/14] max-h-52 mx-auto sm:mx-0 w-full max-w-[140px] flex items-center justify-center group shadow-xs">
              <video
                ref={videoPlayerRef}
                src={video.url}
                className={`w-full h-full object-cover ${videoHasError ? 'hidden' : 'block'}`}
                loop={!isTrimLooping}
                playsInline
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onError={() => {
                  setVideoHasError(true);
                }}
              />
              {videoHasError && (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-b from-[#18202c] via-[#0f131a] to-[#080a0f] text-white">
                  <Play className="w-6 h-6 text-[#52b788] mb-1 opacity-80" />
                  <span className="text-[10px] text-white/70 line-clamp-2">{video.name}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  id="btn-play-pause-small"
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-white/90 text-[#14181f] flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
              </div>

              {/* Sound toggle overlay */}
              <button
                id="btn-mute-toggle"
                onClick={toggleMute}
                className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-mono">
                {formatSeconds(currentTime)} / {formatSeconds(rawDuration)}
              </div>

              {isTrimLooping && (
                <div className="absolute top-2 left-2 bg-[#2f6f4f] text-white text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-sm">
                  Looping Trim
                </div>
              )}
            </div>

            {/* Video stats & verification */}
            <div className="sm:col-span-8 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#14181f] dark:text-[#f1f3f7] truncate max-w-[260px]">
                    {video.name}
                  </h3>
                  <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
                    {formatFileSize(video.sizeBytes)} • {video.width} x {video.height}px
                  </p>
                </div>
                <button
                  id="btn-remove-video"
                  onClick={onClearVideo}
                  className="text-xs text-[#b3432b] hover:underline font-medium"
                >
                  Remove
                </button>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {video.isVertical ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2f6f4f] dark:text-[#52b788] bg-[#2f6f4f]/10 dark:bg-[#2f6f4f]/20 border border-[#2f6f4f]/20 dark:border-[#2f6f4f]/40 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    9:16 Vertical Video (Optimal)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#b98221] bg-[#b98221]/10 border border-[#b98221]/20 px-2.5 py-0.5 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Landscape aspect: will letterbox
                  </span>
                )}

                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#14181f] dark:text-[#f1f3f7] bg-white dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#262c38] px-2 py-0.5 rounded-md">
                  <Clock className="w-3 h-3 text-[#2f6f4f] dark:text-[#52b788]" />
                  <span>
                    Clip: <strong>{trimmedDuration}s</strong>
                  </span>
                  {isTrimmed && (
                    <span className="text-[10px] text-[#6b6f76] dark:text-[#9aa1b0]">
                      (cut from {rawDuration}s)
                    </span>
                  )}
                </span>
              </div>

              {/* Platform Fit Checklist evaluated with trimmedDuration */}
              <div className="bg-white dark:bg-[#161b24] rounded-md p-2.5 border border-[#e4e1da] dark:border-[#262c38] text-xs space-y-1">
                <div className="flex items-center justify-between text-[#6b6f76] dark:text-[#9aa1b0]">
                  <span>Instagram Reels (max 90s):</span>
                  <span className={trimmedDuration <= 90 ? 'text-[#2f6f4f] dark:text-[#52b788] font-medium' : 'text-[#b3432b] font-medium'}>
                    {trimmedDuration <= 90 ? '✓ Ready (Within limit)' : '⚠ Exceeds 90s'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#6b6f76] dark:text-[#9aa1b0]">
                  <span>Facebook Reels (max 90s):</span>
                  <span className={trimmedDuration <= 90 ? 'text-[#2f6f4f] dark:text-[#52b788] font-medium' : 'text-[#b3432b] font-medium'}>
                    {trimmedDuration <= 90 ? '✓ Ready' : '⚠ Exceeds 90s'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#6b6f76] dark:text-[#9aa1b0]">
                  <span>YouTube Shorts (max 3 min):</span>
                  <span className={trimmedDuration <= 180 ? 'text-[#2f6f4f] dark:text-[#52b788] font-medium' : 'text-[#b3432b] font-medium'}>
                    {trimmedDuration <= 180 ? '✓ Shorts Eligible' : '⚠ Exceeds 3 min'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* -------------------- VIDEO TRIMMING STUDIO -------------------- */}
          <div className="bg-[#f7f6f3] dark:bg-[#12161f] rounded-xl border border-[#e4e1da] dark:border-[#222834] p-4 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#2f6f4f] text-white flex items-center justify-center">
                  <Scissors className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#14181f] dark:text-[#f1f3f7] flex items-center gap-1.5">
                    <span>Clip Trimmer & Timing</span>
                    {isTrimmed && (
                      <span className="text-[10px] font-medium bg-[#2f6f4f]/10 dark:bg-[#2f6f4f]/20 text-[#2f6f4f] dark:text-[#52b788] px-1.5 py-0.2 rounded-full border border-[#2f6f4f]/20">
                        Active Trim
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                    Select start and end times to trim your video for high-retention feeds
                  </p>
                </div>
              </div>

              {/* Actions & Reset */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-play-trimmed"
                  type="button"
                  onClick={toggleTrimmedPlayback}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    isTrimLooping
                      ? 'bg-[#2f6f4f] text-white shadow-xs'
                      : 'bg-white dark:bg-[#1c222d] text-[#14181f] dark:text-[#f1f3f7] border border-[#e4e1da] dark:border-[#262c38] hover:bg-[#f0ede6] dark:hover:bg-[#252c3a]'
                  }`}
                  title="Loop playback strictly between Start and End points"
                >
                  {isTrimLooping ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isTrimLooping ? 'Stop Loop' : 'Play Trimmed'}</span>
                </button>

                {isTrimmed && (
                  <button
                    id="btn-reset-trim"
                    type="button"
                    onClick={handleResetTrim}
                    className="flex items-center gap-1 text-[11px] font-medium text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#b3432b] px-2 py-1 rounded transition-colors"
                    title="Reset to full clip length"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Timeline Track Visualizer */}
            <div className="space-y-1.5 pt-1">
              <div className="relative h-10 w-full rounded-lg bg-[#e8e5de] dark:bg-[#1e2430] border border-[#d8d3c7] dark:border-[#2b3342] overflow-hidden select-none">
                {/* Filmstrip hash pattern */}
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, #000, #000 2px, transparent 2px, transparent 16px)'
                  }}
                />

                {/* Highlighted active trimmed region */}
                <div
                  className="absolute top-0 bottom-0 bg-[#2f6f4f]/30 dark:bg-[#52b788]/25 border-x-2 border-[#2f6f4f] dark:border-[#52b788] transition-all"
                  style={{
                    left: `${startPercent}%`,
                    width: `${Math.max(1, endPercent - startPercent)}%`
                  }}
                />

                {/* Live Playhead Needle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#c4622d] shadow-sm z-10 transition-all pointer-events-none"
                  style={{ left: `${playheadPercent}%` }}
                >
                  <div className="w-2.5 h-2.5 -ml-1 -top-1 absolute bg-[#c4622d] rounded-full" />
                </div>

                {/* Dual range sliders layered over the track */}
                <input
                  id="range-trim-start"
                  type="range"
                  min={0}
                  max={Math.max(0, rawDuration - 0.5)}
                  step={0.1}
                  value={startSec}
                  onChange={(e) => handleStartSlider(parseFloat(e.target.value))}
                  className="trimmer-slider absolute inset-0 w-full h-full opacity-0 z-20 cursor-ew-resize"
                  title={`Start: ${startSec}s`}
                />
                <input
                  id="range-trim-end"
                  type="range"
                  min={Math.min(rawDuration, startSec + 0.5)}
                  max={rawDuration}
                  step={0.1}
                  value={endSec}
                  onChange={(e) => handleEndSlider(parseFloat(e.target.value))}
                  className="trimmer-slider absolute inset-0 w-full h-full opacity-0 z-20 cursor-ew-resize"
                  title={`End: ${endSec}s`}
                />

                {/* Start & End Visual Tab Badges */}
                <div
                  className="absolute top-0 bottom-0 w-3 -ml-1.5 flex items-center justify-center pointer-events-none z-15"
                  style={{ left: `${startPercent}%` }}
                >
                  <div className="w-2.5 h-6 bg-[#2f6f4f] text-white rounded-xs shadow-xs flex items-center justify-center">
                    <span className="text-[7px] font-bold">|</span>
                  </div>
                </div>

                <div
                  className="absolute top-0 bottom-0 w-3 -ml-1.5 flex items-center justify-center pointer-events-none z-15"
                  style={{ left: `${endPercent}%` }}
                >
                  <div className="w-2.5 h-6 bg-[#2f6f4f] text-white rounded-xs shadow-xs flex items-center justify-center">
                    <span className="text-[7px] font-bold">|</span>
                  </div>
                </div>
              </div>

              {/* Time axis labels */}
              <div className="flex items-center justify-between text-[10px] text-[#6b6f76] dark:text-[#9aa1b0] px-1 font-mono">
                <span>0:00.0</span>
                <span className="text-[#2f6f4f] dark:text-[#52b788] font-bold">
                  Start: {formatSeconds(startSec)}
                </span>
                <span className="text-[#c4622d] font-bold">
                  Playhead: {formatSeconds(currentTime)}
                </span>
                <span className="text-[#2f6f4f] dark:text-[#52b788] font-bold">
                  End: {formatSeconds(endSec)}
                </span>
                <span>{formatSeconds(rawDuration)}</span>
              </div>
            </div>

            {/* Precision Controls & Steppers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Start Time Control Box */}
              <div className="bg-white dark:bg-[#161b24] p-2.5 rounded-lg border border-[#e4e1da] dark:border-[#222834] space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-trim-start" className="text-xs font-semibold text-[#14181f] dark:text-[#f1f3f7]">
                    Start Time
                  </label>
                  <button
                    type="button"
                    onClick={handleSetStartToCurrent}
                    className="text-[10px] font-medium text-[#2f6f4f] dark:text-[#52b788] hover:underline"
                  >
                    Set to Current ({formatSeconds(currentTime)})
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStartSlider(startSec - 0.5)}
                    className="px-2 py-1 text-xs font-semibold rounded bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#262c38] text-[#14181f] dark:text-[#f1f3f7]"
                  >
                    -0.5s
                  </button>
                  <input
                    id="input-trim-start"
                    type="number"
                    step="0.1"
                    min="0"
                    max={endSec - 0.5}
                    value={startSec}
                    onChange={(e) => handleStartSlider(parseFloat(e.target.value) || 0)}
                    className="flex-1 text-center font-mono text-xs py-1 px-2 rounded border border-[#e4e1da] dark:border-[#262c38] bg-[#fbfbfa] dark:bg-[#0e1117] text-[#14181f] dark:text-[#f1f3f7] focus:outline-hidden focus:border-[#2f6f4f]"
                  />
                  <button
                    type="button"
                    onClick={() => handleStartSlider(startSec + 0.5)}
                    className="px-2 py-1 text-xs font-semibold rounded bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#262c38] text-[#14181f] dark:text-[#f1f3f7]"
                  >
                    +0.5s
                  </button>
                </div>
              </div>

              {/* End Time Control Box */}
              <div className="bg-white dark:bg-[#161b24] p-2.5 rounded-lg border border-[#e4e1da] dark:border-[#222834] space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-trim-end" className="text-xs font-semibold text-[#14181f] dark:text-[#f1f3f7]">
                    End Time
                  </label>
                  <button
                    type="button"
                    onClick={handleSetEndToCurrent}
                    className="text-[10px] font-medium text-[#2f6f4f] dark:text-[#52b788] hover:underline"
                  >
                    Set to Current ({formatSeconds(currentTime)})
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleEndSlider(endSec - 0.5)}
                    className="px-2 py-1 text-xs font-semibold rounded bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#262c38] text-[#14181f] dark:text-[#f1f3f7]"
                  >
                    -0.5s
                  </button>
                  <input
                    id="input-trim-end"
                    type="number"
                    step="0.1"
                    min={startSec + 0.5}
                    max={rawDuration}
                    value={endSec}
                    onChange={(e) => handleEndSlider(parseFloat(e.target.value) || rawDuration)}
                    className="flex-1 text-center font-mono text-xs py-1 px-2 rounded border border-[#e4e1da] dark:border-[#262c38] bg-[#fbfbfa] dark:bg-[#0e1117] text-[#14181f] dark:text-[#f1f3f7] focus:outline-hidden focus:border-[#2f6f4f]"
                  />
                  <button
                    type="button"
                    onClick={() => handleEndSlider(endSec + 0.5)}
                    className="px-2 py-1 text-xs font-semibold rounded bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#262c38] text-[#14181f] dark:text-[#f1f3f7]"
                  >
                    +0.5s
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Trim Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#e4e1da] dark:border-[#222834]">
              <span className="text-[11px] font-medium text-[#6b6f76] dark:text-[#9aa1b0] flex items-center gap-1">
                <Sliders className="w-3 h-3 text-[#2f6f4f] dark:text-[#52b788]" />
                Presets:
              </span>
              <button
                type="button"
                onClick={handleResetTrim}
                className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#262c38] text-[#14181f] dark:text-[#f1f3f7] hover:bg-[#f0ede6] dark:hover:bg-[#252c3a] transition-colors"
              >
                Full Video ({rawDuration}s)
              </button>
              {rawDuration >= 15 && (
                <button
                  type="button"
                  onClick={() => handleApplyPreset(15)}
                  className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#262c38] text-[#14181f] dark:text-[#f1f3f7] hover:bg-[#f0ede6] dark:hover:bg-[#252c3a] transition-colors"
                >
                  First 15s Hook
                </button>
              )}
              {rawDuration >= 30 && (
                <button
                  type="button"
                  onClick={() => handleApplyPreset(30)}
                  className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#262c38] text-[#14181f] dark:text-[#f1f3f7] hover:bg-[#f0ede6] dark:hover:bg-[#252c3a] transition-colors"
                >
                  First 30s
                </button>
              )}
              {rawDuration >= 60 && (
                <button
                  type="button"
                  onClick={() => handleApplyPreset(60)}
                  className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#262c38] text-[#14181f] dark:text-[#f1f3f7] hover:bg-[#f0ede6] dark:hover:bg-[#252c3a] transition-colors"
                >
                  First 60s
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

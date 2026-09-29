import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Lightbulb,
  Compass,
  Copy,
  Check,
  RotateCw,
  Clock,
  Hash,
  Flame,
  Zap,
  Target,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { VideoMetadata } from '../types';

export interface DailySocialTipData {
  tip: string;
  hookIdea: string;
  actionableCallToAction: string;
  recommendedHashtags: string[];
  bestTimeToPost: string;
  algorithmInsight: string;
}

interface DailySocialTipProps {
  currentVideo: VideoMetadata | null;
  onApplyHook?: (hook: string) => void;
  onApplyHashtags?: (tags: string[]) => void;
}

const NICHES = [
  { id: 'travel', label: '✈️ Travel & Urban', defaultTone: 'cinematic' },
  { id: 'food', label: '☕ Food & Coffee', defaultTone: 'satisfying' },
  { id: 'lifestyle', label: '🌿 Lifestyle & Routine', defaultTone: 'relatable' },
  { id: 'tech', label: '📱 Tech & Gadgets', defaultTone: 'informative' },
  { id: 'fitness', label: '💪 Fitness & Health', defaultTone: 'motivational' },
  { id: 'business', label: '🚀 Business & Creator', defaultTone: 'authoritative' }
];

export const DailySocialTip: React.FC<DailySocialTipProps> = ({
  currentVideo,
  onApplyHook,
  onApplyHashtags
}) => {
  // Infer initial niche from video name or default to travel
  const [selectedNiche, setSelectedNiche] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reelcast_user_niche');
      if (saved) return saved;
    }
    const name = (currentVideo?.name || '').toLowerCase();
    if (name.includes('latte') || name.includes('coffee') || name.includes('food')) return 'food';
    if (name.includes('tokyo') || name.includes('travel') || name.includes('night')) return 'travel';
    return 'travel';
  });

  const [tipData, setTipData] = useState<DailySocialTipData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [provider, setProvider] = useState<string>('gemini-3.8-flash');

  const fetchDailyTip = async (nicheToFetch: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/daily-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: nicheToFetch,
          tone: 'viral',
          videoTitle: currentVideo?.name || 'Reels / Shorts Creative',
          videoDuration: currentVideo?.durationSec || 15
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setTipData(json.data);
          if (json.provider) setProvider(json.provider);
        }
      }
    } catch (e) {
      console.error('Error fetching daily social tip', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('reelcast_user_niche', selectedNiche);
    fetchDailyTip(selectedNiche);
  }, [selectedNiche]);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/5 via-amber-500/5 to-emerald-500/5 dark:from-[#1b1e2a] dark:to-[#151922] border border-purple-200/60 dark:border-purple-900/30 rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ece8df] dark:border-[#222836]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#14181f] dark:text-[#f1f3f7] flex items-center gap-1.5">
                Daily Social Tip & Creative Hook
              </h2>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                provider.includes('gemini') || provider.includes('cached-ai')
                  ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40'
                  : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
              }`}>
                <Zap className="w-2.5 h-2.5" />
                {provider.includes('gemini') || provider.includes('cached-ai') ? 'Gemini 3.8 Flash' : 'Pro Strategy'}
              </span>
            </div>
            <p className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
              AI-generated content angle, viral hook, and algorithm timing based on your creator niche
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Niche Selector */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-medium text-[#6b6f76] dark:text-[#9aa1b0] hidden sm:inline">
              Niche:
            </label>
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              disabled={loading}
              className="text-xs font-semibold bg-white dark:bg-[#151922] border border-[#e4e1da] dark:border-[#262c38] rounded-lg px-2.5 py-1.5 text-[#14181f] dark:text-[#f1f3f7] focus:outline-hidden focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs"
            >
              {NICHES.map(n => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          </div>

          {/* Regenerate Button */}
          <button
            onClick={() => fetchDailyTip(selectedNiche)}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white dark:bg-[#1a202c] border border-[#e4e1da] dark:border-[#262c38] text-[#6b6f76] dark:text-[#9aa1b0] hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Generate new idea with Gemini"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          </button>

          {/* Toggle Expand */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-[#6b6f76] dark:text-[#9aa1b0] hover:bg-[#ece8df] dark:hover:bg-[#202735] transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isExpanded && (
        <div className="mt-3.5 space-y-3">
          {loading ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-2 text-center animate-in fade-in">
              <Sparkles className="w-6 h-6 text-purple-500 animate-spin" />
              <span className="text-xs font-medium text-[#6b6f76] dark:text-[#9aa1b0]">
                Generating high-retention video tip for {NICHES.find(n => n.id === selectedNiche)?.label || selectedNiche}...
              </span>
            </div>
          ) : tipData ? (
            <div className="space-y-3">
              {/* Highlighted Strategy Tip Card */}
              <div className="p-3.5 bg-white/80 dark:bg-[#161b26]/90 border border-purple-100 dark:border-purple-900/40 rounded-xl shadow-2xs flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-0.5">
                    Tactical Production Tip
                  </span>
                  <p className="text-xs font-medium text-[#14181f] dark:text-[#f1f3f7] leading-relaxed">
                    {tipData.tip}
                  </p>
                </div>
              </div>

              {/* 2-Column Hook Idea & Call To Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 2-Second Opening Hook */}
                <div className="p-3 bg-white/70 dark:bg-[#151922] border border-[#e4e1da] dark:border-[#262c3a] rounded-xl flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500" />
                        High-Retention Opening Hook (0-2s)
                      </span>
                      <button
                        onClick={() => handleCopy(tipData.hookIdea, 'hook')}
                        className="text-[10px] text-[#6b6f76] hover:text-amber-600 flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
                        title="Copy hook to clipboard"
                      >
                        {copiedField === 'hook' ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedField === 'hook' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-[#2b303c] dark:text-[#d3d8e2] font-semibold italic">
                      "{tipData.hookIdea}"
                    </p>
                  </div>

                  {onApplyHook && (
                    <button
                      onClick={() => onApplyHook(tipData.hookIdea)}
                      className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      <span>Apply as Master Title</span>
                      <Zap className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>

                {/* Call to Action */}
                <div className="p-3 bg-white/70 dark:bg-[#151922] border border-[#e4e1da] dark:border-[#262c3a] rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Target className="w-3 h-3 text-emerald-500" />
                        Engagement CTA
                      </span>
                      <button
                        onClick={() => handleCopy(tipData.actionableCallToAction, 'cta')}
                        className="text-[10px] text-[#6b6f76] hover:text-emerald-600 flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
                        title="Copy call to action"
                      >
                        {copiedField === 'cta' ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedField === 'cta' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-[#2b303c] dark:text-[#d3d8e2]">
                      {tipData.actionableCallToAction}
                    </p>
                  </div>

                  <span className="mt-2 text-[10px] text-[#6b6f76] dark:text-[#9aa1b0] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-500" />
                    <strong className="text-[#14181f] dark:text-[#f1f3f7]">Best Time to Post:</strong> {tipData.bestTimeToPost}
                  </span>
                </div>
              </div>

              {/* Hashtag Strip & Algorithm Insight */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-[#6b6f76] dark:text-[#9aa1b0] flex items-center gap-1">
                    <Hash className="w-3 h-3 text-purple-500" />
                    Niche Tags:
                  </span>
                  {tipData.recommendedHashtags?.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCopy(tag, `tag-${idx}`)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-[#1a202c] border border-[#e4e1da] dark:border-[#262c3a] text-purple-600 dark:text-purple-300 hover:border-purple-400 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                  {onApplyHashtags && (
                    <button
                      onClick={() => onApplyHashtags(tipData.recommendedHashtags)}
                      className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline ml-1"
                    >
                      + Add all tags
                    </button>
                  )}
                </div>

                {tipData.algorithmInsight && (
                  <span className="text-[10px] text-[#6b6f76] dark:text-[#9aa1b0] italic">
                    💡 {tipData.algorithmInsight}
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

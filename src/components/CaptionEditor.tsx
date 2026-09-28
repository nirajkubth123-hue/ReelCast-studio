import React, { useState } from 'react';
import {
  Type,
  Hash,
  Sparkles,
  SlidersHorizontal,
  Instagram,
  Facebook,
  Youtube,
  Plus,
  Languages,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  GitCompare,
  Split,
  Flame,
  ArrowRight
} from 'lucide-react';
import { CaptionSettings, PlatformId } from '../types';
import { useI18n } from '../i18n/I18nContext';
import { SupportedLanguage } from '../i18n/types';

interface CaptionEditorProps {
  captionSettings: CaptionSettings;
  onChange: (settings: CaptionSettings) => void;
  selectedPlatforms: PlatformId[];
}

export const CaptionEditor: React.FC<CaptionEditorProps> = ({
  captionSettings,
  onChange,
  selectedPlatforms
}) => {
  const { t, language, availableLanguages, translateText, getHashtagPresets, getViralHooks } = useI18n();

  const [activeTab, setActiveTab] = useState<'master' | 'instagram' | 'facebook' | 'youtube'>('master');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  // i18n Translation state
  const [targetTranslationLang, setTargetTranslationLang] = useState<SupportedLanguage>(
    language === 'en' ? 'es' : 'en'
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [originalSnapshot, setOriginalSnapshot] = useState<{
    title: string;
    caption: string;
    firstComment?: string;
  } | null>(null);
  const [translationSuccessNotice, setTranslationSuccessNotice] = useState<string | null>(null);

  // Viral hooks in active or translation language
  const viralHooks = getViralHooks(targetTranslationLang);
  const localizedHashtags = getHashtagPresets(targetTranslationLang);

  const handleMasterTitleChange = (val: string) => {
    onChange({
      ...captionSettings,
      masterTitle: val,
      youtubeTitle: captionSettings.adaptPerPlatform ? captionSettings.youtubeTitle : val
    });
  };

  const handleMasterCaptionChange = (val: string) => {
    onChange({
      ...captionSettings,
      masterCaption: val,
      instagramCaption: captionSettings.adaptPerPlatform ? captionSettings.instagramCaption : val,
      facebookCaption: captionSettings.adaptPerPlatform ? captionSettings.facebookCaption : val,
      youtubeCaption: captionSettings.adaptPerPlatform ? captionSettings.youtubeCaption : val
    });
  };

  const toggleAdapt = () => {
    const nextState = !captionSettings.adaptPerPlatform;
    onChange({
      ...captionSettings,
      adaptPerPlatform: nextState,
      instagramCaption: captionSettings.instagramCaption || captionSettings.masterCaption,
      facebookCaption: captionSettings.facebookCaption || captionSettings.masterCaption,
      youtubeTitle: captionSettings.youtubeTitle || captionSettings.masterTitle,
      youtubeCaption: captionSettings.youtubeCaption || captionSettings.masterCaption
    });
    if (!nextState) {
      setActiveTab('master');
    }
  };

  const toggleAbTest = () => {
    const isCurrentlyEnabled = !!captionSettings.abTest?.enabled;
    const nextEnabled = !isCurrentlyEnabled;

    onChange({
      ...captionSettings,
      abTest: {
        enabled: nextEnabled,
        captionA: captionSettings.abTest?.captionA || captionSettings.masterCaption || 'Check out this secret spot that nobody told you about... Drop a comment if you would go! 📍',
        captionB: captionSettings.abTest?.captionB || 'Would you visit this hidden gem? ✈️ Tag your favorite travel partner below! ⬇️',
        splitPercentage: captionSettings.abTest?.splitPercentage || 50,
        hypothesis: captionSettings.abTest?.hypothesis || 'Testing question hook (Variant B) vs curiosity statement (Variant A)'
      }
    });
  };

  const handleAbCaptionChange = (variant: 'A' | 'B', text: string) => {
    const abConfig = captionSettings.abTest || {
      enabled: true,
      captionA: captionSettings.masterCaption,
      captionB: '',
      splitPercentage: 50
    };

    const updatedAb = {
      ...abConfig,
      [variant === 'A' ? 'captionA' : 'captionB']: text
    };

    // If updating A, keep master caption in sync as the primary control
    onChange({
      ...captionSettings,
      masterCaption: variant === 'A' ? text : captionSettings.masterCaption,
      abTest: updatedAb
    });
  };

  const insertHashtag = (tag: string) => {
    if (activeTab === 'master') {
      const current = captionSettings.masterCaption;
      const updated = current ? `${current} ${tag}` : tag;
      handleMasterCaptionChange(updated);
    } else if (activeTab === 'instagram') {
      const current = captionSettings.instagramCaption;
      onChange({ ...captionSettings, instagramCaption: current ? `${current} ${tag}` : tag });
    } else if (activeTab === 'facebook') {
      const current = captionSettings.facebookCaption;
      onChange({ ...captionSettings, facebookCaption: current ? `${current} ${tag}` : tag });
    } else if (activeTab === 'youtube') {
      const current = captionSettings.youtubeCaption;
      onChange({ ...captionSettings, youtubeCaption: current ? `${current} ${tag}` : tag });
    }
  };

  const insertHook = (hook: string) => {
    const current = captionSettings.masterCaption;
    const updated = current ? `${hook}\n\n${current}` : `${hook}\n\n`;
    handleMasterCaptionChange(updated);
  };

  const addShortsTag = () => {
    insertHashtag('#Shorts');
  };

  // Determine current active caption length
  const getCurrentCaptionText = () => {
    if (activeTab === 'master') return captionSettings.masterCaption;
    if (activeTab === 'instagram') return captionSettings.instagramCaption;
    if (activeTab === 'facebook') return captionSettings.facebookCaption;
    if (activeTab === 'youtube') return captionSettings.youtubeCaption;
    return '';
  };

  const currentCaption = getCurrentCaptionText();

  // Perform translation across title & captions
  const handleTranslateCaptions = async () => {
    if (isTranslating) return;
    setIsTranslating(true);
    setTranslationSuccessNotice(null);

    // Save snapshot of current text before first translation
    if (!originalSnapshot) {
      setOriginalSnapshot({
        title: captionSettings.masterTitle,
        caption: captionSettings.masterCaption,
        firstComment: captionSettings.firstComment
      });
    }

    try {
      const [translatedTitle, translatedCaption, translatedComment] = await Promise.all([
        translateText(captionSettings.masterTitle, targetTranslationLang),
        translateText(captionSettings.masterCaption, targetTranslationLang),
        captionSettings.firstComment ? translateText(captionSettings.firstComment, targetTranslationLang) : Promise.resolve('')
      ]);

      const targetLangObj = availableLanguages.find(l => l.code === targetTranslationLang);
      const targetName = targetLangObj ? targetLangObj.nativeName : targetTranslationLang;

      onChange({
        ...captionSettings,
        masterTitle: translatedTitle || captionSettings.masterTitle,
        masterCaption: translatedCaption || captionSettings.masterCaption,
        youtubeTitle: captionSettings.adaptPerPlatform ? captionSettings.youtubeTitle : (translatedTitle || captionSettings.masterTitle),
        instagramCaption: captionSettings.adaptPerPlatform ? captionSettings.instagramCaption : (translatedCaption || captionSettings.masterCaption),
        facebookCaption: captionSettings.adaptPerPlatform ? captionSettings.facebookCaption : (translatedCaption || captionSettings.masterCaption),
        youtubeCaption: captionSettings.adaptPerPlatform ? captionSettings.youtubeCaption : (translatedCaption || captionSettings.masterCaption),
        firstComment: translatedComment || captionSettings.firstComment
      });

      setTranslationSuccessNotice(t('captions.translateSuccess', { language: targetName }));
      setTimeout(() => setTranslationSuccessNotice(null), 6000);
    } catch (err) {
      console.error('Failed to translate caption:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRevertOriginal = () => {
    if (!originalSnapshot) return;
    onChange({
      ...captionSettings,
      masterTitle: originalSnapshot.title,
      masterCaption: originalSnapshot.caption,
      youtubeTitle: captionSettings.adaptPerPlatform ? captionSettings.youtubeTitle : originalSnapshot.title,
      instagramCaption: captionSettings.adaptPerPlatform ? captionSettings.instagramCaption : originalSnapshot.caption,
      facebookCaption: captionSettings.adaptPerPlatform ? captionSettings.facebookCaption : originalSnapshot.caption,
      youtubeCaption: captionSettings.adaptPerPlatform ? captionSettings.youtubeCaption : originalSnapshot.caption,
      firstComment: originalSnapshot.firstComment || ''
    });
    setOriginalSnapshot(null);
    setTranslationSuccessNotice(null);
  };

  return (
    <div className="bg-white dark:bg-[#161b24] rounded-xl border border-[#e4e1da] dark:border-[#222834] p-5 shadow-xs transition-colors duration-200">
      {/* Header & Adapt Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#2f6f4f]/10 dark:bg-[#2f6f4f]/20 text-[#2f6f4f] dark:text-[#52b788] flex items-center justify-center">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#14181f] dark:text-[#f1f3f7]">
              {t('captions.stepTitle')}
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
                {t('captions.stepSubtitle')}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/30" title="Your edits are saved automatically in browser localStorage">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Auto-saved
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* A/B Test Split Mode Toggle */}
          <button
            id="btn-toggle-ab-test"
            type="button"
            onClick={toggleAbTest}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              captionSettings.abTest?.enabled
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-600 shadow-purple-500/20'
                : 'bg-[#f7f6f3] dark:bg-[#1c222d] text-[#14181f] dark:text-[#f1f3f7] border-[#e4e1da] dark:border-[#2b3342] hover:border-purple-400'
            }`}
            title="Split traffic 50/50 between two caption variants to compare engagement in analytics"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{captionSettings.abTest?.enabled ? 'A/B Test ON' : 'A/B Test Mode'}</span>
          </button>

          {/* Adapt for each platform toggle */}
          <button
            id="btn-toggle-adapt-platforms"
            type="button"
            onClick={toggleAdapt}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              captionSettings.adaptPerPlatform
                ? 'bg-[#2f6f4f] dark:bg-[#52b788] text-white dark:text-[#0b0e14] border-[#2f6f4f] dark:border-[#52b788]'
                : 'bg-[#f7f6f3] dark:bg-[#1c222d] text-[#14181f] dark:text-[#f1f3f7] border-[#e4e1da] dark:border-[#2b3342] hover:bg-[#ece8df] dark:hover:bg-[#252c3a]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{captionSettings.adaptPerPlatform ? t('captions.adaptButtonOn') : t('captions.adaptButton')}</span>
          </button>
        </div>
      </div>

      {/* Tabs if Adapt Mode is Active */}
      {captionSettings.adaptPerPlatform && (
        <div className="flex items-center gap-2 border-b border-[#e4e1da] dark:border-[#222834] pb-2 mb-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('master')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'master'
                ? 'bg-[#14181f] dark:bg-[#f1f3f7] text-white dark:text-[#14181f]'
                : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] hover:bg-[#f7f6f3] dark:hover:bg-[#1c222d]'
            }`}
          >
            {t('captions.masterTab')}
          </button>
          {selectedPlatforms.includes('instagram') && (
            <button
              type="button"
              onClick={() => setActiveTab('instagram')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'instagram'
                  ? 'bg-[#E1306C] text-white'
                  : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] hover:bg-[#f7f6f3] dark:hover:bg-[#1c222d]'
              }`}
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram Reels</span>
            </button>
          )}
          {selectedPlatforms.includes('facebook') && (
            <button
              type="button"
              onClick={() => setActiveTab('facebook')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'facebook'
                  ? 'bg-[#1877F2] text-white'
                  : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] hover:bg-[#f7f6f3] dark:hover:bg-[#1c222d]'
              }`}
            >
              <Facebook className="w-3.5 h-3.5" />
              <span>Facebook Reels</span>
            </button>
          )}
          {selectedPlatforms.includes('youtube') && (
            <button
              type="button"
              onClick={() => setActiveTab('youtube')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'youtube'
                  ? 'bg-[#FF0000] text-white'
                : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] hover:bg-[#f7f6f3] dark:hover:bg-[#1c222d]'
              }`}
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>YouTube Shorts</span>
            </button>
          )}
        </div>
      )}

      {/* i18n Translation & Localization Section */}
      <div className="bg-[#f4f7f5] dark:bg-[#131b17] border border-[#d6e5dd] dark:border-[#1e3427] rounded-lg p-3.5 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#2f6f4f] text-white flex items-center justify-center text-xs shadow-2xs">
              <Languages className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#14181f] dark:text-[#f1f3f7] flex items-center gap-1.5">
                {t('captions.translateHeader')}
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#2f6f4f]/10 dark:bg-[#52b788]/20 text-[#2f6f4f] dark:text-[#52b788]">
                  i18n
                </span>
              </span>
              <p className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                {t('captions.translateSub')}
              </p>
            </div>
          </div>

          {/* Quick Target Language Pills & Translate Button */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0] mr-1 hidden sm:inline">
              {t('captions.targetLangLabel')}
            </span>
            <div className="flex items-center gap-1 bg-white dark:bg-[#1c222d] p-0.5 rounded-md border border-[#e4e1da] dark:border-[#262c38]">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setTargetTranslationLang(lang.code)}
                  title={`${lang.name} (${lang.nativeName})`}
                  className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                    targetTranslationLang === lang.code
                      ? 'bg-[#2f6f4f] text-white font-semibold shadow-2xs'
                      : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7]'
                  }`}
                >
                  <span className="mr-0.5">{lang.flag}</span>
                  <span className="uppercase text-[10px]">{lang.code}</span>
                </button>
              ))}
            </div>

            <button
              id="btn-translate-caption"
              type="button"
              disabled={isTranslating}
              onClick={handleTranslateCaptions}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2f6f4f] hover:bg-[#275a40] disabled:opacity-50 rounded-md transition-colors shadow-2xs cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
              <span>{isTranslating ? t('captions.translating') : t('captions.translateNowBtn')}</span>
            </button>

            {originalSnapshot && (
              <button
                type="button"
                onClick={handleRevertOriginal}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] bg-white dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#262c38] rounded-md transition-colors"
                title={t('captions.revertOriginal')}
              >
                <RotateCcw className="w-3 h-3" />
                <span className="text-[11px]">{t('captions.revertOriginal')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Translation Success Banner */}
        {translationSuccessNotice && (
          <div className="mt-2 flex items-center gap-2 p-2 text-xs text-[#2f6f4f] dark:text-[#52b788] bg-white dark:bg-[#16221c] border border-[#2f6f4f]/30 rounded-md animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{translationSuccessNotice}</span>
          </div>
        )}

        {/* Localized Viral Hooks Suggestion Chips */}
        <div className="mt-2.5 pt-2 border-t border-[#d6e5dd] dark:border-[#1e3427]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-[#2f6f4f] dark:text-[#52b788] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{t('captions.quickPhrasesTitle')}</span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {viralHooks.slice(0, 4).map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => insertHook(h.hook)}
                className="text-left text-[11px] p-1.5 bg-white dark:bg-[#1a2420] hover:bg-[#eaf3ee] dark:hover:bg-[#203129] text-[#14181f] dark:text-[#f1f3f7] border border-[#d6e5dd] dark:border-[#274232] rounded flex items-start justify-between gap-1 transition-colors"
                title={`${h.description}: Click to insert`}
              >
                <span className="line-clamp-1 italic text-[#2f6f4f] dark:text-[#52b788]">"{h.hook}"</span>
                <span className="text-[9px] uppercase font-semibold text-[#6b6f76] dark:text-[#9aa1b0] shrink-0 bg-[#f7f6f3] dark:bg-[#11141c] px-1 rounded">
                  + {t('captions.insertHook')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Title Field (Always needed for YouTube, useful as Reel headline) */}
      <div className="mb-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="input-video-title" className="text-xs font-semibold text-[#14181f] dark:text-[#f1f3f7] flex items-center gap-1.5">
            <span>{t('captions.videoTitle')}</span>
            {selectedPlatforms.includes('youtube') && (
              <span className="text-[10px] text-[#b3432b] dark:text-[#f87171] font-medium bg-[#b3432b]/10 dark:bg-[#b3432b]/20 px-1.5 py-0.2 rounded">
                {t('captions.ytTitleRequired')}
              </span>
            )}
          </label>
          <span className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
            {(activeTab === 'youtube' ? captionSettings.youtubeTitle : captionSettings.masterTitle).length}/100
          </span>
        </div>
        <input
          id="input-video-title"
          type="text"
          maxLength={100}
          placeholder={t('captions.titlePlaceholder')}
          value={activeTab === 'youtube' ? captionSettings.youtubeTitle : captionSettings.masterTitle}
          onChange={(e) => {
            if (activeTab === 'youtube') {
              onChange({ ...captionSettings, youtubeTitle: e.target.value });
            } else {
              handleMasterTitleChange(e.target.value);
            }
          }}
          className="w-full text-sm px-3 py-2 rounded-lg border border-[#e4e1da] dark:border-[#262c38] focus:outline-hidden focus:border-[#2f6f4f] dark:focus:border-[#52b788] focus:ring-1 focus:ring-[#2f6f4f] bg-[#fbfbfa] dark:bg-[#0e1117] text-[#14181f] dark:text-[#f1f3f7]"
        />
      </div>

      {/* Main Caption: Single Mode vs A/B Split Test Dual Cards */}
      {captionSettings.abTest?.enabled ? (
        <div className="mb-3.5 space-y-3 p-3.5 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-white dark:from-[#1b1c2b]/60 dark:via-[#161a24]/60 dark:to-[#11141c] border border-purple-200/80 dark:border-purple-900/40 rounded-xl shadow-2xs">
          {/* A/B Test Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-purple-200/50 dark:border-purple-900/30">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <Split className="w-3.5 h-3.5 text-purple-600" />
                Active A/B Caption Test (50/50 Traffic Split)
              </span>
            </div>
            <span className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
              Metrics will track variant retention & engagement side-by-side
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Variant A (Control) */}
            <div className="p-3 bg-white dark:bg-[#161b24] border-2 border-purple-300 dark:border-purple-800/60 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-black bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                    VARIANT A (Control)
                  </span>
                  <span className="text-[10px] text-[#6b6f76] dark:text-[#9aa1b0]">50% Audience</span>
                </div>
                <span className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                  {(captionSettings.abTest.captionA || '').length} chars
                </span>
              </div>
              <textarea
                id="textarea-ab-caption-a"
                rows={4}
                placeholder="Write Variant A caption (e.g. direct statement or storytelling angle)..."
                value={captionSettings.abTest.captionA || ''}
                onChange={(e) => handleAbCaptionChange('A', e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#e4e1da] dark:border-[#262c38] focus:outline-hidden focus:border-purple-500 bg-[#fbfbfa] dark:bg-[#0e1117] text-[#14181f] dark:text-[#f1f3f7] resize-y"
              />
              <p className="mt-1 text-[10px] text-[#6b6f76] dark:text-[#9aa1b0] italic">
                Tip: Use curiosity statements or clear step-by-step value.
              </p>
            </div>

            {/* Variant B (Challenger) */}
            <div className="p-3 bg-white dark:bg-[#161b24] border-2 border-indigo-300 dark:border-indigo-800/60 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-black bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                    VARIANT B (Challenger)
                  </span>
                  <span className="text-[10px] text-[#6b6f76] dark:text-[#9aa1b0]">50% Audience</span>
                </div>
                <span className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                  {(captionSettings.abTest.captionB || '').length} chars
                </span>
              </div>
              <textarea
                id="textarea-ab-caption-b"
                rows={4}
                placeholder="Write Variant B caption (e.g. question prompt or provocative counter-intuitive hook)..."
                value={captionSettings.abTest.captionB || ''}
                onChange={(e) => handleAbCaptionChange('B', e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#e4e1da] dark:border-[#262c38] focus:outline-hidden focus:border-indigo-500 bg-[#fbfbfa] dark:bg-[#0e1117] text-[#14181f] dark:text-[#f1f3f7] resize-y"
              />
              <p className="mt-1 text-[10px] text-[#6b6f76] dark:text-[#9aa1b0] italic">
                Tip: Ask an intriguing question to trigger 2x comments.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Single Caption Textarea */
        <div className="mb-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="textarea-video-caption" className="text-xs font-semibold text-[#14181f] dark:text-[#f1f3f7] flex items-center gap-2">
              <span>
                {activeTab === 'master'
                  ? t('captions.captionLabelMaster')
                  : t('captions.captionLabelPlatform', { platform: activeTab.toUpperCase() })}
              </span>
            </label>

            {/* Character counters breakdown */}
            <div className="flex items-center gap-2 text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
              <span>{t('captions.charsCount', { count: currentCaption.length })}</span>
              {selectedPlatforms.includes('instagram') && (
                <span className={currentCaption.length > 2200 ? 'text-[#b3432b] font-bold' : ''}>
                  {t('captions.igMaxChars')}
                </span>
              )}
            </div>
          </div>

          <textarea
            id="textarea-video-caption"
            rows={4}
            placeholder={t('captions.captionPlaceholder')}
            value={
              activeTab === 'instagram'
                ? captionSettings.instagramCaption
                : activeTab === 'facebook'
                ? captionSettings.facebookCaption
                : activeTab === 'youtube'
                ? captionSettings.youtubeCaption
                : captionSettings.masterCaption
            }
            onChange={(e) => {
              const val = e.target.value;
              if (activeTab === 'instagram') {
                onChange({ ...captionSettings, instagramCaption: val });
              } else if (activeTab === 'facebook') {
                onChange({ ...captionSettings, facebookCaption: val });
              } else if (activeTab === 'youtube') {
                onChange({ ...captionSettings, youtubeCaption: val });
              } else {
                handleMasterCaptionChange(val);
              }
            }}
            className="w-full text-sm p-3 rounded-lg border border-[#e4e1da] dark:border-[#262c38] focus:outline-hidden focus:border-[#2f6f4f] dark:focus:border-[#52b788] focus:ring-1 focus:ring-[#2f6f4f] bg-[#fbfbfa] dark:bg-[#0e1117] text-[#14181f] dark:text-[#f1f3f7] leading-relaxed resize-y"
          />
        </div>
      )}

      {/* Smart Localized Hashtag Inserter */}
      <div className="bg-[#f7f6f3] dark:bg-[#11141c] rounded-lg p-3 border border-[#e4e1da] dark:border-[#222834] mb-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#14181f] dark:text-[#f1f3f7]">
            <Hash className="w-3.5 h-3.5 text-[#2f6f4f] dark:text-[#52b788]" />
            <span>{t('captions.smartHashtagTitle')}</span>
          </div>
          {selectedPlatforms.includes('youtube') && (
            <button
              id="btn-add-shorts-tag"
              type="button"
              onClick={addShortsTag}
              className="text-[11px] font-semibold text-[#FF0000] bg-[#FF0000]/10 hover:bg-[#FF0000]/20 px-2 py-0.5 rounded transition-colors"
            >
              {t('captions.addShortsTag')}
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-2">
          {localizedHashtags.map((cat, idx) => (
            <button
              key={cat.category}
              type="button"
              onClick={() => setSelectedCategoryIndex(idx)}
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-colors shrink-0 ${
                selectedCategoryIndex === idx
                  ? 'bg-[#2f6f4f] dark:bg-[#52b788] text-white dark:text-[#0b0e14]'
                  : 'bg-white dark:bg-[#1c222d] text-[#6b6f76] dark:text-[#9aa1b0] hover:text-[#14181f] dark:hover:text-[#f1f3f7] border border-[#e4e1da] dark:border-[#2b3342]'
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* Localized Hashtags list */}
        <div className="flex flex-wrap gap-1.5">
          {(localizedHashtags[selectedCategoryIndex] || localizedHashtags[0])?.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => insertHashtag(tag)}
              className="inline-flex items-center gap-1 text-xs bg-white dark:bg-[#1c222d] hover:bg-[#2f6f4f]/10 dark:hover:bg-[#2f6f4f]/30 text-[#14181f] dark:text-[#f1f3f7] hover:text-[#2f6f4f] dark:hover:text-[#52b788] border border-[#e4e1da] dark:border-[#2b3342] px-2 py-1 rounded-md transition-colors"
            >
              <span>{tag}</span>
              <Plus className="w-3 h-3 text-[#6b6f76] dark:text-[#9aa1b0]" />
            </button>
          ))}
        </div>
      </div>

      {/* Optional: First Comment (Instagram only) */}
      {selectedPlatforms.includes('instagram') && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="input-first-comment" className="text-xs font-medium text-[#6b6f76] dark:text-[#9aa1b0] flex items-center gap-1">
              <span>{t('captions.firstCommentLabel')}</span>
            </label>
            <span className="text-[10px] text-[#6b6f76] dark:text-[#9aa1b0]">
              {t('captions.firstCommentHint')}
            </span>
          </div>
          <input
            id="input-first-comment"
            type="text"
            placeholder={t('captions.firstCommentPlaceholder')}
            value={captionSettings.firstComment}
            onChange={(e) => onChange({ ...captionSettings, firstComment: e.target.value })}
            className="w-full text-xs px-3 py-1.5 rounded-md border border-[#e4e1da] dark:border-[#262c38] focus:outline-hidden focus:border-[#2f6f4f] dark:focus:border-[#52b788] bg-[#fbfbfa] dark:bg-[#0e1117] text-[#14181f] dark:text-[#f1f3f7]"
          />
        </div>
      )}
    </div>
  );
};

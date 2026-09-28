import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SupportedLanguage,
  LanguageInfo,
  SUPPORTED_LANGUAGES,
  LocalizedHashtagPreset,
  LocalizedSampleVideo
} from './types';
import { TRANSLATIONS } from './translations';
import {
  LOCALIZED_SAMPLE_VIDEOS,
  LOCALIZED_HASHTAG_PRESETS,
  LOCALIZED_VIRAL_HOOKS
} from './captionSuggestions';

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  availableLanguages: LanguageInfo[];
  currentLanguageInfo: LanguageInfo;
  translateText: (text: string, targetLang: SupportedLanguage) => Promise<string>;
  getSampleVideo: (index: number, langOverride?: SupportedLanguage) => LocalizedSampleVideo;
  getHashtagPresets: (langOverride?: SupportedLanguage) => LocalizedHashtagPreset[];
  getViralHooks: (langOverride?: SupportedLanguage) => Array<{ hook: string; description: string }>;
}

const STORAGE_KEY = 'reelcast_studio_lang_v1';

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
        return saved;
      }
    } catch {
      // Ignore storage errors
    }
    return 'en';
  });

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const currentLanguageInfo = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    let text = langDict[key] || TRANSLATIONS.en[key] || key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return text;
  }, [language]);

  // Translate custom text using the backend translation API (with smart fallback)
  const translateText = useCallback(async (text: string, targetLang: SupportedLanguage): Promise<string> => {
    if (!text || text.trim() === '') return '';

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLang,
          sourceLang: language
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.translatedText) {
          return data.translatedText;
        }
      }
    } catch (e) {
      console.warn('API translation failed, using dictionary fallback', e);
    }

    // Check if the text matches any of our sample captions or hooks in any language
    for (const [langKey, samples] of Object.entries(LOCALIZED_SAMPLE_VIDEOS)) {
      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        if (s.captionSuggestion.trim() === text.trim() || text.includes(s.titleSuggestion)) {
          const targetSample = LOCALIZED_SAMPLE_VIDEOS[targetLang]?.[i];
          if (targetSample) {
            return targetSample.captionSuggestion;
          }
        }
        if (s.titleSuggestion.trim() === text.trim()) {
          const targetSample = LOCALIZED_SAMPLE_VIDEOS[targetLang]?.[i];
          if (targetSample) {
            return targetSample.titleSuggestion;
          }
        }
      }
    }

    // Fallback: append target language indicator or leave clean
    return text;
  }, [language]);

  const getSampleVideo = useCallback((index: number, langOverride?: SupportedLanguage): LocalizedSampleVideo => {
    const lang = langOverride || language;
    const list = LOCALIZED_SAMPLE_VIDEOS[lang] || LOCALIZED_SAMPLE_VIDEOS.en;
    return list[index] || list[0];
  }, [language]);

  const getHashtagPresets = useCallback((langOverride?: SupportedLanguage): LocalizedHashtagPreset[] => {
    const lang = langOverride || language;
    return LOCALIZED_HASHTAG_PRESETS[lang] || LOCALIZED_HASHTAG_PRESETS.en;
  }, [language]);

  const getViralHooks = useCallback((langOverride?: SupportedLanguage): Array<{ hook: string; description: string }> => {
    const lang = langOverride || language;
    return LOCALIZED_VIRAL_HOOKS[lang] || LOCALIZED_VIRAL_HOOKS.en;
  }, [language]);

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        availableLanguages: SUPPORTED_LANGUAGES,
        currentLanguageInfo,
        translateText,
        getSampleVideo,
        getHashtagPresets,
        getViralHooks
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
};

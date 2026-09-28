export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'hi';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  locale: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', locale: 'en-US' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', locale: 'es-ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', locale: 'de-DE' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', locale: 'pt-BR' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', locale: 'ja-JP' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', locale: 'hi-IN' }
];

export interface LocalizedHashtagPreset {
  category: string;
  tags: string[];
}

export interface LocalizedSampleVideo {
  id: string;
  titleSuggestion: string;
  captionSuggestion: string;
  firstCommentSuggestion: string;
}

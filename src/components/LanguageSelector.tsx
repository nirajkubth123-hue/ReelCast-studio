import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { SupportedLanguage } from '../i18n/types';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, availableLanguages, currentLanguageInfo } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        id="btn-language-selector"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#14181f] dark:text-[#f1f3f7] bg-[#f7f6f3] dark:bg-[#1c222d] hover:bg-[#ece8df] dark:hover:bg-[#252c3a] border border-[#e4e1da] dark:border-[#262c38] rounded-md transition-colors shadow-2xs"
        title="Change language / Cambiar idioma / 言語切替"
      >
        <Globe className="w-3.5 h-3.5 text-[#2f6f4f] dark:text-[#52b788]" />
        <span className="text-sm leading-none">{currentLanguageInfo.flag}</span>
        <span className="hidden md:inline font-medium">{currentLanguageInfo.nativeName}</span>
        <span className="inline md:hidden uppercase font-semibold">{currentLanguageInfo.code}</span>
        <ChevronDown className={`w-3 h-3 text-[#6b6f76] dark:text-[#9aa1b0] transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-48 rounded-lg bg-white dark:bg-[#1c222d] border border-[#e4e1da] dark:border-[#262c38] shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 text-[11px] font-semibold text-[#6b6f76] dark:text-[#9aa1b0] uppercase tracking-wider border-b border-[#e4e1da] dark:border-[#262c38]">
            Select Studio Language
          </div>
          {availableLanguages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                id={`lang-option-${lang.code}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                  isSelected
                    ? 'bg-[#2f6f4f]/10 dark:bg-[#2f6f4f]/20 text-[#2f6f4f] dark:text-[#52b788] font-semibold'
                    : 'text-[#14181f] dark:text-[#f1f3f7] hover:bg-[#f7f6f3] dark:hover:bg-[#252c3a]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <div>
                    <div className="leading-tight">{lang.nativeName}</div>
                    <div className="text-[10px] text-[#6b6f76] dark:text-[#9aa1b0] font-normal">{lang.name}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#2f6f4f] dark:text-[#52b788]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

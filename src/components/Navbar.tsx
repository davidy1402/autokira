import React from 'react';
import { RotateCcw, Share2, SlidersHorizontal, Sun, Moon, Languages } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface NavbarProps {
  onReset: () => void;
  onOpenSettings: () => void;
  onOpenShare: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const iconBtn =
  'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-line bg-surface/60 text-muted ' +
  'btn-spring hover:border-line-strong hover:text-ink hover:bg-surface active:scale-95';

export const Navbar: React.FC<NavbarProps> = ({
  onReset,
  onOpenSettings,
  onOpenShare,
  theme,
  onToggleTheme
}) => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 rounded-2xl glass-island px-3.5 py-2.5 sm:px-5 sm:py-3 shadow-lg">
        {/* Brand Crest */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand text-onbrand shadow-sm">
            <img src="./brand/autokira-refined/mark.svg" alt="" aria-hidden="true" className="h-7 w-7 rounded-md bg-[#faf8f5] p-0.5" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold tracking-tight text-ink block leading-none">
              {t.navbar.title}
            </span>
            <span className="text-[10px] text-muted font-medium hidden sm:inline-block mt-0.5">
              TNB 2025/2026 Restructured Domestic Tariff Model
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Language Switcher Pill */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex h-8 sm:h-9 items-center gap-1.5 px-3 rounded-xl border border-line bg-surface/80 text-ink text-xs font-semibold btn-spring hover:border-brand/40 shadow-sm"
            title="Switch Language / 切换语言"
            aria-label="Switch Language"
          >
            <Languages size={14} strokeWidth={2} className="text-brand" />
            <span className="font-mono tracking-wider text-[11px]">{language === 'zh' ? 'EN' : '中文'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={iconBtn}
            title={theme === 'dark' ? t.navbar.themeLight : t.navbar.themeDark}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={15} strokeWidth={2} />
            ) : (
              <Moon size={15} strokeWidth={2} />
            )}
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className={iconBtn}
            title={t.navbar.settings}
            aria-label="Settings"
          >
            <SlidersHorizontal size={15} strokeWidth={2} />
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={onReset}
            className={iconBtn}
            title={t.navbar.reset}
            aria-label="Reset"
          >
            <RotateCcw size={15} strokeWidth={2} />
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={onOpenShare}
            className={iconBtn}
            title={t.navbar.share}
            aria-label="Share"
          >
            <Share2 size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
};

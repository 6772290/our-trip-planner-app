import React from 'react';
import { Compass, Plus, Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: 'welcome' | 'home' | 'create_trip') => void;
  onOpenHowItWorks?: () => void;
  onOpenFaq?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenHowItWorks,
  onOpenFaq,
}) => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('welcome')}
          className="flex items-center gap-2.5 text-stone-900 hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 group focus:outline-none cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-800 text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">{t('brandName')}</span>
        </button>

        {/* Zone 2: Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => onNavigate('welcome')}
            className={`whitespace-nowrap transition-colors hover:text-stone-900 cursor-pointer ${
              currentView === 'welcome' ? 'text-amber-800 font-semibold' : ''
            }`}
          >
            {t('nav.welcome')}
          </button>

          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap transition-colors hover:text-stone-900 cursor-pointer ${
              currentView === 'home' ? 'text-amber-800 font-semibold' : ''
            }`}
          >
            {t('nav.trips')}
          </button>

          <button
            onClick={onOpenHowItWorks}
            className="whitespace-nowrap transition-colors hover:text-stone-900 cursor-pointer"
          >
            {t('nav.howItWorks')}
          </button>

          <button
            onClick={onOpenFaq}
            className="whitespace-nowrap transition-colors hover:text-stone-900 cursor-pointer"
          >
            {t('nav.faq')}
          </button>
        </nav>

        {/* Zone 3: Language Switcher & Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Working Language Switcher (Hebrew / English) */}
          <button
            type="button"
            onClick={toggleLanguage}
            title={language === 'he' ? 'Switch to English (LTR)' : 'מעבר לעברית (RTL)'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50 text-xs font-bold text-stone-700 hover:text-stone-900 transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-amber-800" />
            <span>{language === 'he' ? 'English (EN)' : 'עברית (HE)'}</span>
          </button>

          <button
            onClick={() => onNavigate('create_trip')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-800 rounded-lg hover:bg-amber-900 transition-all shadow-sm active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('nav.newTrip')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

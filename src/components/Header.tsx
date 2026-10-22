import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Plus,
  Globe,
  Sparkles,
  User,
  ChevronDown,
  Heart,
  Users,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { UserProfile } from '../types/experience';

export type NavViewType = 'welcome' | 'experiences' | 'home' | 'create_trip';
export type AccountSectionTab = 'profile' | 'preferences' | 'contacts' | 'privacy' | 'settings';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: NavViewType) => void;
  userProfile?: UserProfile;
  onOpenAccountSection?: (tab: AccountSectionTab) => void;
  onOpenHowItWorks?: () => void;
  onOpenFaq?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  userProfile,
  onOpenAccountSection,
  onOpenHowItWorks,
  onOpenFaq,
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const displayName =
    userProfile?.fullName && !userProfile.isDemo
      ? userProfile.fullName.trim()
      : '';

  const handleSelectTab = (tab: AccountSectionTab) => {
    setIsUserMenuOpen(false);
    if (onOpenAccountSection) {
      onOpenAccountSection(tab);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('experiences')}
          className="flex items-center gap-2.5 text-stone-900 hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 group focus:outline-hidden cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-800 text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">{t('brandName')}</span>
        </button>

        {/* Zone 2: Nav links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-stone-600">
          <button
            onClick={() => onNavigate('experiences')}
            className={`whitespace-nowrap transition-colors hover:text-stone-900 cursor-pointer flex items-center gap-1.5 ${
              currentView === 'experiences' ? 'text-amber-800 font-bold' : ''
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'he' ? 'חוויות ופנאי' : 'Experiences'}</span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap transition-colors hover:text-stone-900 cursor-pointer ${
              currentView === 'home' ? 'text-amber-800 font-bold' : ''
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

        {/* Zone 3: User Account Menu, Language Switcher & Primary CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* User Account Dropdown Menu */}
          {onOpenAccountSection && (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-amber-800/40 bg-stone-50 hover:bg-stone-100 text-xs font-bold text-stone-800 transition-all cursor-pointer shadow-2xs"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
                title={language === 'he' ? 'תפריט החשבון שלי' : 'My Account Menu'}
              >
                <div className="w-6 h-6 rounded-full bg-amber-800 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <span className="max-w-[100px] sm:max-w-[150px] truncate text-stone-800">
                  {displayName || (language === 'he' ? 'החשבון שלי' : 'My Account')}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu Modal Card */}
              {isUserMenuOpen && (
                <div className="absolute left-0 rtl:left-0 rtl:right-auto ltr:right-0 ltr:left-auto mt-2 w-56 rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
                  <div className="px-3.5 py-2 border-b border-stone-100 text-stone-500 mb-1">
                    <div className="font-bold text-stone-900 truncate">
                      {displayName || (language === 'he' ? 'החשבון שלי' : 'My Account')}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {language === 'he' ? 'נשמר מקומית בדפדפן זה' : 'Saved locally in this browser'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectTab('profile')}
                    className="w-full px-3.5 py-2 text-right rtl:text-right ltr:text-left hover:bg-amber-50 hover:text-amber-950 flex items-center gap-2.5 cursor-pointer transition-colors text-stone-700"
                  >
                    <User className="w-4 h-4 text-stone-500" />
                    <span>{language === 'he' ? 'הפרופיל שלי' : 'My Profile'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTab('preferences')}
                    className="w-full px-3.5 py-2 text-right rtl:text-right ltr:text-left hover:bg-amber-50 hover:text-amber-950 flex items-center gap-2.5 cursor-pointer transition-colors text-stone-700"
                  >
                    <Heart className="w-4 h-4 text-stone-500" />
                    <span>{language === 'he' ? 'ההעדפות שלי' : 'My Preferences'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTab('contacts')}
                    className="w-full px-3.5 py-2 text-right rtl:text-right ltr:text-left hover:bg-amber-50 hover:text-amber-950 flex items-center gap-2.5 cursor-pointer transition-colors text-stone-700"
                  >
                    <Users className="w-4 h-4 text-stone-500" />
                    <span>{language === 'he' ? 'האנשים והקבוצות שלי' : 'My People & Groups'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTab('privacy')}
                    className="w-full px-3.5 py-2 text-right rtl:text-right ltr:text-left hover:bg-amber-50 hover:text-amber-950 flex items-center gap-2.5 cursor-pointer transition-colors text-stone-700"
                  >
                    <ShieldCheck className="w-4 h-4 text-stone-500" />
                    <span>{language === 'he' ? 'פרטיות ושיתוף' : 'Privacy & Sharing'}</span>
                  </button>

                  <div className="border-t border-stone-100 my-1" />

                  <button
                    type="button"
                    onClick={() => handleSelectTab('settings')}
                    className="w-full px-3.5 py-2 text-right rtl:text-right ltr:text-left hover:bg-amber-50 hover:text-amber-950 flex items-center gap-2.5 cursor-pointer transition-colors text-stone-700 font-semibold"
                  >
                    <Settings className="w-4 h-4 text-stone-500" />
                    <span>{language === 'he' ? 'הגדרות' : 'Settings'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Working Language Switcher (Hebrew / English) */}
          <button
            type="button"
            onClick={toggleLanguage}
            title={language === 'he' ? 'Switch to English (LTR)' : 'מעבר לעברית (RTL)'}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50 text-xs font-bold text-stone-700 hover:text-stone-900 transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-amber-800" />
            <span>{language === 'he' ? 'English (EN)' : 'עברית (HE)'}</span>
          </button>

          <button
            onClick={() => onNavigate('create_trip')}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-amber-800 rounded-lg hover:bg-amber-900 transition-all shadow-xs active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('nav.newTrip')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

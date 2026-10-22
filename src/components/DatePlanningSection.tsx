import React, { useState } from 'react';
import {
  CalendarSystem,
  DateAlternative,
  FlexibleDateWindow,
} from '../types/trip';
import { UnifiedDatePicker } from './UnifiedDatePicker';
import { useLanguage } from '../i18n/LanguageContext';
import {
  gregorianToHebrewDetailed,
} from '../utils/hebrewCalendarResolver';
import {
  parseNaturalDateText,
  NaturalTextParseResult,
} from '../utils/naturalLanguageDateParser';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sliders,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';

interface DatePlanningSectionProps {
  calendarSystem: CalendarSystem;
  onCalendarSystemChange: (system: CalendarSystem) => void;
  showSecondaryCalendar: boolean;
  onToggleSecondaryCalendar: (show: boolean) => void;
  secondaryCalendarSystem: CalendarSystem;
  onSecondaryCalendarChange: (system: CalendarSystem) => void;

  alternatives: DateAlternative[];
  onAlternativesChange: (alts: DateAlternative[]) => void;

  naturalText: string;
  onNaturalTextChange: (text: string) => void;
  onNaturalParsedResult: (result: NaturalTextParseResult) => void;

  flexibleWindow: FlexibleDateWindow;
  onFlexibleWindowChange: (window: FlexibleDateWindow) => void;
}

export const DatePlanningSection: React.FC<DatePlanningSectionProps> = ({
  calendarSystem,
  onCalendarSystemChange,
  showSecondaryCalendar,
  onToggleSecondaryCalendar,
  secondaryCalendarSystem,
  onSecondaryCalendarChange,
  alternatives,
  onAlternativesChange,
  naturalText,
  onNaturalTextChange,
  onNaturalParsedResult,
  flexibleWindow,
  onFlexibleWindowChange,
}) => {
  const { language, t } = useLanguage();

  // Calendar mode for input: Gregorian or Hebrew
  const [inputCalendarType, setInputCalendarType] = useState<'gregorian' | 'hebrew'>(
    calendarSystem === 'hebrew' ? 'hebrew' : 'gregorian'
  );

  // Expandable sections toggles (Progressive disclosure)
  const [isNaturalTextExpanded, setIsNaturalTextExpanded] = useState(false);
  const [isFlexibilityExpanded, setIsFlexibilityExpanded] = useState(false);

  // Natural language parsing state
  const [parseResult, setParseResult] = useState<NaturalTextParseResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [postShabbatBufferHours, setPostShabbatBufferHours] = useState(3);
  const [userLocation, setUserLocation] = useState('Jerusalem');
  const [appliedNotice, setAppliedNotice] = useState(false);

  // Sample phrases for quick testing
  const samplePhrases = [
    'אני רוצה לצאת אחרי שבת פרשת חיי שרה תשפ״ז ולחזור לפני חנוכה',
    'אני רוצה ארבעה עד שישה לילות במהלך נובמבר 2026',
    'אפשר לצאת ביום ראשון או שני, אבל חייבים לחזור עד יום חמישי בבוקר',
    'אני רוצה לצאת מיום ראשון עד יום חמישי, בשבוע של 1 בנובמבר או בשבוע של 8 בנובמבר 2026',
  ];

  // Helper to ensure at least one alternative exists (ONE by default)
  const activeAlternatives =
    alternatives && alternatives.length > 0
      ? alternatives
      : [
          {
            id: 'alt_1',
            title: language === 'he' ? 'חלופה 1: 1–5 בנובמבר 2026' : 'Alternative 1: Nov 1–5, 2026',
            startDate: '2026-11-01',
            endDate: '2026-11-05',
            notes: '',
          },
        ];

  const handleUpdateAlternative = (id: string, updates: Partial<DateAlternative>) => {
    onAlternativesChange(
      activeAlternatives.map((alt) => (alt.id === id ? { ...alt, ...updates } : alt))
    );
  };

  const handleAddAlternative = () => {
    const nextIdx = activeAlternatives.length + 1;
    const baseYear = 2026;
    const baseMonth = '11';
    const day = ((nextIdx - 1) * 7 + 1) % 25 || 1;
    const startStr = `${baseYear}-${baseMonth}-${String(day).padStart(2, '0')}`;
    const endStr = `${baseYear}-${baseMonth}-${String(day + 4).padStart(2, '0')}`;

    const titleStr =
      language === 'he'
        ? `חלופה ${nextIdx}: ${day}–${day + 4} בנובמבר ${baseYear}`
        : `Alternative ${nextIdx}: Nov ${day}–${day + 4}, ${baseYear}`;

    const newAlt: DateAlternative = {
      id: `alt_${Date.now()}`,
      title: titleStr,
      startDate: startStr,
      endDate: endStr,
      notes: language === 'he' ? 'חלופה נוספת להשוואה' : 'Additional alternative for comparison',
    };
    onAlternativesChange([...activeAlternatives, newAlt]);
  };

  const handleRemoveAlternative = (id: string) => {
    if (activeAlternatives.length <= 1) return;
    onAlternativesChange(activeAlternatives.filter((alt) => alt.id !== id));
  };

  const handleParseNaturalText = () => {
    if (!naturalText.trim()) return;
    setIsParsing(true);
    setTimeout(() => {
      const res = parseNaturalDateText(
        naturalText,
        2026,
        postShabbatBufferHours,
        userLocation
      );
      setParseResult(res);
      onNaturalParsedResult(res);
      setIsParsing(false);
    }, 200);
  };

  const handleApplyParsedToTrip = () => {
    if (!parseResult) return;
    if (parseResult.identifiedAlternatives.length > 0) {
      onAlternativesChange(parseResult.identifiedAlternatives);
      setAppliedNotice(true);
      setTimeout(() => setAppliedNotice(false), 4000);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Box: Calendar Selection & Settings */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-800 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                {t('dates.calendarSettings')}
              </h3>
              <span className="text-xs text-stone-500">
                {t('dates.calendarSettingsDesc')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-stone-600 font-medium">
              {t('dates.inputWith')}
            </span>
            <div className="flex items-center p-0.5 bg-stone-100 rounded-lg border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => {
                  setInputCalendarType('gregorian');
                  onCalendarSystemChange('gregorian');
                }}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  inputCalendarType === 'gregorian'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('dates.gregorianCivil')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputCalendarType('hebrew');
                  onCalendarSystemChange('hebrew');
                }}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  inputCalendarType === 'hebrew'
                    ? 'bg-amber-800 text-white shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('dates.hebrewCalendar')}
              </button>
            </div>
          </div>
        </div>

        {/* Display Settings & Civil Midnight Rule */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showSecondaryCalendar}
                onChange={(e) => onToggleSecondaryCalendar(e.target.checked)}
                className="rounded text-amber-800"
              />
              <span className="font-semibold text-stone-800">
                {t('dates.showDual')}
              </span>
            </label>
          </div>

          <div className="text-[11px] text-stone-500 bg-stone-50 px-3 py-1 rounded-lg border border-stone-200">
            {t('dates.midnightRule')}
          </div>
        </div>
      </div>

      {/* 2. Coherent Main Interface: Travel Date Options (One by default, + add alternative) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              {t('dates.travelDatesTitle')}
            </h3>
            <p className="text-xs text-stone-500">
              {t('dates.travelDatesDesc')}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddAlternative}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('dates.addAlternative')}</span>
          </button>
        </div>

        {/* Alternatives List */}
        <div className="space-y-4">
          {activeAlternatives.map((alt, idx) => {
            return (
              <div
                key={alt.id}
                className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4 transition-all"
              >
                {/* Alternative Top Row: Fix clipped title by giving full width and no overflow */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      dir="auto"
                      value={alt.title}
                      onChange={(e) =>
                        handleUpdateAlternative(alt.id, { title: e.target.value })
                      }
                      placeholder={`${t('dates.alternative')} ${idx + 1}`}
                      className="font-bold text-sm sm:text-base text-stone-900 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-amber-800 focus:outline-none w-full max-w-lg px-1 py-0.5"
                    />
                  </div>

                  {activeAlternatives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAlternative(alt.id)}
                      className="flex items-center gap-1 text-xs text-stone-400 hover:text-rose-600 transition-colors p-1.5 cursor-pointer shrink-0"
                      title={t('common.remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('common.remove')}</span>
                    </button>
                  )}
                </div>

                {/* Date Selection: Consistent collapsed date picker for both Gregorian & Hebrew */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <UnifiedDatePicker
                    label={t('dates.departureDate')}
                    valueIsoDate={alt.startDate}
                    calendarType={inputCalendarType}
                    showSecondaryCalendar={showSecondaryCalendar}
                    onChange={(newIso) =>
                      handleUpdateAlternative(alt.id, { startDate: newIso })
                    }
                  />

                  <UnifiedDatePicker
                    label={t('dates.returnDate')}
                    valueIsoDate={alt.endDate}
                    calendarType={inputCalendarType}
                    showSecondaryCalendar={showSecondaryCalendar}
                    onChange={(newIso) =>
                      handleUpdateAlternative(alt.id, { endDate: newIso })
                    }
                  />
                </div>

                {/* Optional Note on this alternative */}
                <div>
                  <input
                    type="text"
                    dir="auto"
                    value={alt.notes || ''}
                    placeholder={t('dates.notePlaceholder')}
                    onChange={(e) =>
                      handleUpdateAlternative(alt.id, { notes: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 text-stone-700 bg-stone-50/50 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Expandable Section A: Natural Language Understanding */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsNaturalTextExpanded(!isNaturalTextExpanded)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-start hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">
                {t('dates.nlpTitle')}
              </h4>
              <p className="text-xs text-stone-500">
                {t('dates.nlpDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isNaturalTextExpanded ? (
              <ChevronUp className="w-4 h-4 text-stone-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-500" />
            )}
          </div>
        </button>

        {isNaturalTextExpanded && (
          <div className="p-5 border-t border-stone-100 bg-stone-50/40 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 block">
                {language === 'he' ? 'הקלידו את רצונכם בשפה חופשית:' : 'Type your intention in natural words:'}
              </label>
              <textarea
                rows={3}
                dir="auto"
                value={naturalText}
                onChange={(e) => onNaturalTextChange(e.target.value)}
                placeholder={t('dates.nlpPlaceholder')}
                className="w-full p-3.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-1 focus:ring-amber-800"
              />

              {/* Sample phrases chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-stone-500 font-medium">
                  {language === 'he' ? 'דוגמאות לבדיקה מהירה:' : 'Quick test examples:'}
                </span>
                {samplePhrases.map((phrase, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onNaturalTextChange(phrase)}
                    className="text-[11px] bg-white border border-stone-200 hover:border-amber-700 text-stone-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {phrase.slice(0, 36)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Configurable Location & Post-Shabbat Buffer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white border border-stone-200 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  {language === 'he' ? 'מיקום גיאוגרפי לחישוב זמנים:' : 'Geographic location for solar/zmanim calculations:'}
                </label>
                <select
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
                >
                  <option value="Jerusalem">ירושלים (Jerusalem, Israel)</option>
                  <option value="Tel Aviv">תל אביב (Tel Aviv, Israel)</option>
                  <option value="London">לונדון (London, UK)</option>
                  <option value="Rome">רומא (Rome, Italy)</option>
                  <option value="New York">ניו יורק (New York, USA)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  {language === 'he' ? 'מרווח זמן ממוצאי שבת / הבדלה ליציאה:' : 'Buffer time after Shabbat/Havdalah:'}
                </label>
                <select
                  value={postShabbatBufferHours}
                  onChange={(e) => setPostShabbatBufferHours(parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
                >
                  <option value={2}>2 hours buffer</option>
                  <option value={3}>3 hours buffer (recommended)</option>
                  <option value={4}>4 hours buffer</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleParseNaturalText}
              disabled={!naturalText.trim() || isParsing}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isParsing ? t('dates.nlpProcessing') : t('dates.nlpButton')}</span>
            </button>

            {/* Confirmation Card: "כך הבנתי את הבקשה שלך" */}
            {parseResult && (
              <div className="mt-4 p-5 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h5 className="text-sm font-bold text-stone-900">
                      {t('dates.nlpUnderstood')}
                    </h5>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    {t('dates.nlpAstronomical')}
                  </span>
                </div>

                <p className="text-xs text-stone-800 leading-relaxed font-medium">
                  {parseResult.intentSummary}
                </p>

                {/* Departure Interpretation */}
                {parseResult.departureInterpretation && (
                  <div className="p-3.5 rounded-xl bg-white border border-amber-200 text-xs space-y-1">
                    <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-800" />
                      <span>{language === 'he' ? 'יציאה מחושבת:' : 'Calculated Departure:'}</span>
                    </span>
                    <p className="text-stone-700">
                      {language === 'he' ? 'ניסוח מקורי:' : 'Original phrase:'} <em>"{parseResult.departureInterpretation.originalPhrase}"</em>
                    </p>
                    <p className="text-stone-900 font-semibold">
                      {language === 'he' ? 'תאריך גרגוריאני:' : 'Gregorian:'} {parseResult.departureInterpretation.resolvedGregorianDate} · {language === 'he' ? 'תאריך עברי:' : 'Hebrew:'} {parseResult.departureInterpretation.resolvedHebrewDate}
                    </p>
                    {parseResult.departureInterpretation.timeExplanation && (
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        {parseResult.departureInterpretation.timeExplanation}
                      </p>
                    )}
                  </div>
                )}

                {/* Return Interpretation */}
                {parseResult.returnInterpretation && (
                  <div className="p-3.5 rounded-xl bg-white border border-amber-200 text-xs space-y-1">
                    <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-800" />
                      <span>{language === 'he' ? 'חזרה מחושבת:' : 'Calculated Return:'}</span>
                    </span>
                    <p className="text-stone-700">
                      {language === 'he' ? 'ניסוח מקורי:' : 'Original phrase:'} <em>"{parseResult.returnInterpretation.originalPhrase}"</em>
                    </p>
                    <p className="text-stone-900 font-semibold">
                      {language === 'he' ? 'תאריך גרגוריאני:' : 'Gregorian:'} {parseResult.returnInterpretation.resolvedGregorianDate} · {language === 'he' ? 'תאריך עברי:' : 'Hebrew:'} {parseResult.returnInterpretation.resolvedHebrewDate}
                    </p>
                    {parseResult.returnInterpretation.timeExplanation && (
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        {parseResult.returnInterpretation.timeExplanation}
                      </p>
                    )}
                  </div>
                )}

                {/* Clarification Questions if needed */}
                {parseResult.clarificationsNeeded.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-100/70 border border-amber-300 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <AlertTriangle className="w-4 h-4 text-amber-800" />
                      <span>{language === 'he' ? 'שאלות להבהרה וחידוד:' : 'Clarifications needed:'}</span>
                    </div>
                    {parseResult.clarificationsNeeded.map((q) => (
                      <div key={q.id} className="space-y-1">
                        <span className="text-[11px] font-semibold text-stone-900 block">{q.question}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {q.options.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                q.selectedOptionValue = opt.value;
                              }}
                              className="text-[11px] bg-white hover:bg-amber-50 px-2.5 py-1 rounded border border-amber-200 text-stone-800 cursor-pointer"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Apply Parsed Dates Button */}
                <div className="pt-2 flex items-center justify-between border-t border-amber-200">
                  <span className="text-xs text-stone-600">
                    {language === 'he' ? 'מוכנים להשתמש בתאריכים אלה?' : 'Ready to use these dates?'}
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyParsedToTrip}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t('dates.applyDates')}</span>
                  </button>
                </div>

                {appliedNotice && (
                  <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>{t('dates.appliedSuccess')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Expandable Section B: Advanced Date Flexibility */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsFlexibilityExpanded(!isFlexibilityExpanded)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-start hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-800 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">
                {t('dates.flexibilityTitle')}
              </h4>
              <p className="text-xs text-stone-500">
                {t('dates.flexibilityDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isFlexibilityExpanded ? (
              <ChevronUp className="w-4 h-4 text-stone-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-500" />
            )}
          </div>
        </button>

        {isFlexibilityExpanded && (
          <div className="p-5 border-t border-stone-100 bg-stone-50/40 space-y-5 text-xs">
            {/* Lower and Upper Departure Bounds */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-3">
              <h5 className="font-bold text-stone-900">
                {language === 'he' ? 'גבולות מועד היציאה:' : 'Departure Boundaries:'}
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {t('dates.earliestDeparture')}
                  </label>
                  <input
                    type="date"
                    value={flexibleWindow.earliestDeparture || '2026-11-01'}
                    onChange={(e) =>
                      onFlexibleWindowChange({
                        ...flexibleWindow,
                        earliestDeparture: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {t('dates.latestDeparture')}
                  </label>
                  <input
                    type="date"
                    value={flexibleWindow.latestDeparture || '2026-11-10'}
                    onChange={(e) =>
                      onFlexibleWindowChange({
                        ...flexibleWindow,
                        latestDeparture: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300"
                  />
                </div>
              </div>
            </div>

            {/* Lower and Upper Return Bounds */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-3">
              <h5 className="font-bold text-stone-900">
                {language === 'he' ? 'גבולות מועד החזרה:' : 'Return Boundaries:'}
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {t('dates.earliestReturn')}
                  </label>
                  <input
                    type="date"
                    value={flexibleWindow.earliestReturn || '2026-11-06'}
                    onChange={(e) =>
                      onFlexibleWindowChange({
                        ...flexibleWindow,
                        earliestReturn: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {t('dates.latestReturn')}
                  </label>
                  <input
                    type="date"
                    value={flexibleWindow.latestReturn || '2026-11-20'}
                    onChange={(e) =>
                      onFlexibleWindowChange({
                        ...flexibleWindow,
                        latestReturn: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300"
                  />
                </div>
              </div>
            </div>

            {/* Min & Max Nights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white border border-stone-200">
              <div>
                <label className="font-semibold text-stone-800 block mb-1">
                  {t('dates.minNights')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={flexibleWindow.durationNightsMin}
                  onChange={(e) =>
                    onFlexibleWindowChange({
                      ...flexibleWindow,
                      durationNightsMin: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-800 block mb-1">
                  {t('dates.maxNights')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={flexibleWindow.durationNightsMax}
                  onChange={(e) =>
                    onFlexibleWindowChange({
                      ...flexibleWindow,
                      durationNightsMax: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300"
                />
              </div>
            </div>

            {/* Allowed Weekdays */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2">
              <span className="font-bold text-stone-900 block">
                {t('dates.allowedDays')}
              </span>
              <div className="flex flex-wrap gap-3 pt-1">
                {(language === 'he'
                  ? ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
                  : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                ).map((dayName, dIdx) => {
                  const allowedList = flexibleWindow.allowedDaysOfWeek || [0, 1, 2, 3, 4];
                  const isChecked = allowedList.includes(dIdx);

                  return (
                    <label key={dIdx} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...allowedList, dIdx]
                            : allowedList.filter((d) => d !== dIdx);
                          onFlexibleWindowChange({
                            ...flexibleWindow,
                            allowedDaysOfWeek: updated,
                          });
                        }}
                        className="rounded text-amber-800"
                      />
                      <span>{dayName}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

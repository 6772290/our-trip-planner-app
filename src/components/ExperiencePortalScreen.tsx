import React, { useState, useEffect } from 'react';
import {
  ActivityCategory,
  ActivityAudience,
  TransportMode,
  LocationBreakdown,
  UserProfile,
  ContactPerson,
  SavedGroup,
  ProvenanceType,
  PROVENANCE_DETAILS,
  ParsedRequestResult,
  ClarificationQuestion,
  RequestStatus,
  CertaintyLevel,
} from '../types/experience';
import { parseExperienceRequest } from '../engine/requestParser';
import { ExperiencePlan, ExperiencePlanType } from '../types/experiencePlan';
import { createPlanFromParsedResult } from '../utils/planSynchronizer';
import { useLanguage } from '../i18n/LanguageContext';
import { AirportSearchInput } from './AirportSearchInput';
import {
  Sparkles,
  Compass,
  UtensilsCrossed,
  Music,
  MapPin,
  Calendar,
  Users,
  User,
  Heart,
  Car,
  Plane,
  Footprints,
  Train,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Info,
  X,
  Send,
} from 'lucide-react';

interface ExperiencePortalScreenProps {
  userProfile: UserProfile;
  contacts: ContactPerson[];
  savedGroups: SavedGroup[];
  onOpenPrivacyCenter: () => void;
  onLoadDemoData: () => void;
  onResetToEmpty: () => void;
  onNavigateToTripWizard: (initialData?: {
    title?: string;
    destination?: string;
    tripType?: 'solo' | 'couple' | 'friends' | 'family';
  }) => void;
  onExploreExistingTrips: () => void;
  onOpenPlanWorkspace?: (plan: ExperiencePlan) => void;
}

export const ExperiencePortalScreen: React.FC<ExperiencePortalScreenProps> = ({
  userProfile,
  contacts,
  savedGroups,
  onOpenPrivacyCenter,
  onLoadDemoData,
  onResetToEmpty,
  onNavigateToTripWizard,
  onExploreExistingTrips,
  onOpenPlanWorkspace,
}) => {
  const { language } = useLanguage();

  // Core natural text prompt
  const [inputText, setInputText] = useState('');
  const [clarifiedOverrides, setClarifiedOverrides] = useState<Record<string, any>>({});
  const [freeTextClarification, setFreeTextClarification] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedRequestResult | null>(null);

  // Parse whenever input or overrides change
  const handleAnalyze = (textToAnalyze: string = inputText, overrides = clarifiedOverrides) => {
    const text = textToAnalyze.trim();
    if (!text) {
      setParsedResult(null);
      return;
    }

    const result = parseExperienceRequest(text, {
      userProfile,
      contacts,
      savedGroups,
      clarifiedOverrides: overrides,
    });
    setParsedResult(result);
  };

  const handleApplyPreset = (presetText: string) => {
    setInputText(presetText);
    setClarifiedOverrides({});
    setFreeTextClarification('');
    handleAnalyze(presetText, {});
  };

  const handleClarificationAnswer = (field: string, value: any) => {
    const newOverrides = { ...clarifiedOverrides, [field]: value };
    setClarifiedOverrides(newOverrides);
    setFreeTextClarification('');
    handleAnalyze(inputText, newOverrides);
  };

  const handleRemoveClarificationAnswer = (field: string) => {
    const newOverrides = { ...clarifiedOverrides };
    delete newOverrides[field];
    setClarifiedOverrides(newOverrides);
    handleAnalyze(inputText, newOverrides);
  };

  const handleFreeTextSubmit = (field: string) => {
    if (!freeTextClarification.trim()) return;
    handleClarificationAnswer(field, freeTextClarification.trim());
  };

  const handleResetClarifications = () => {
    setClarifiedOverrides({});
    setFreeTextClarification('');
    handleAnalyze(inputText, {});
  };

  // Re-run analysis immediately when userProfile, contacts, or savedGroups changes
  useEffect(() => {
    if (inputText.trim()) {
      handleAnalyze(inputText, clarifiedOverrides);
    } else {
      setParsedResult(null);
    }
  }, [userProfile, contacts, savedGroups]);

  const handleResetProfile = () => {
    setClarifiedOverrides({});
    setFreeTextClarification('');
    onResetToEmpty();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Clean Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-stone-900 via-stone-850 to-amber-950 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {language === 'he'
              ? 'מה מתחשק לך לעשות?'
              : 'What are you in the mood for?'}
          </h1>

          <p className="text-stone-300 text-xs sm:text-base leading-relaxed">
            {language === 'he'
              ? 'ספר לנו מה מעניין אותך, ונעזור לך למצוא את החוויה המתאימה — לבד, בזוג או עם חברים.'
              : "Tell us what interests you, and we'll help find the right experience — solo, as a couple, or with friends."}
          </p>
        </div>
      </div>

      {/* Main Request Input Panel */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-stone-900">
              {language === 'he'
                ? 'ספר לנו על החוויה שמתחשק לך לחוות:'
                : 'Tell us about the experience you would like to have:'}
            </label>
            {Object.keys(clarifiedOverrides).length > 0 && (
              <button
                type="button"
                onClick={handleResetClarifications}
                className="text-xs text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'he' ? 'איפוס תשובות' : 'Reset answers'}</span>
              </button>
            )}
          </div>

          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              language === 'he'
                ? 'לדוגמה: "ארוחת ערב טובה הערב", "הופעה של אנדרה ריו", "סוף שבוע רגוע בצפון", או "יש לנו ארבעה ימים פנויים באחד משני שבועות"...'
                : 'e.g. "A nice dinner tonight", "André Rieu concert", "Relaxing weekend up north", or "We have 4 free days in one of two weeks"...'
            }
            className="w-full p-4 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-800 focus:border-amber-800 transition-all text-stone-900 placeholder:text-stone-400"
          />

          {/* Natural Examples */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-stone-500 block">
              {language === 'he' ? 'דוגמאות לבקשות:' : 'Examples:'}
            </span>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => handleApplyPreset('ארוחת ערב טובה הערב')}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-800 border border-stone-200 transition-colors cursor-pointer"
              >
                🍽️ {language === 'he' ? 'ארוחת ערב טובה הערב' : 'A nice dinner tonight'}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('הופעה בסוף השבוע')}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-800 border border-stone-200 transition-colors cursor-pointer"
              >
                🎶 {language === 'he' ? 'הופעה בסוף השבוע' : 'Concert this weekend'}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('סוף שבוע רגוע בצפון')}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-800 border border-stone-200 transition-colors cursor-pointer"
              >
                🌲 {language === 'he' ? 'סוף שבוע רגוע בצפון' : 'Relaxing weekend up north'}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('הופעה של אנדרה ריו')}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-800 border border-stone-200 transition-colors cursor-pointer"
              >
                🎻 {language === 'he' ? 'הופעה של אנדרה ריו' : 'André Rieu concert'}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    'יש לי ארבעה ימים פנויים באחד משני שבועות, חייב לחזור לפני שבת ומחפש מסעדה כשרה'
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-800 border border-stone-200 transition-colors cursor-pointer"
              >
                🗓️ {language === 'he' ? '4 ימים באחד משני שבועות' : '4 days in 1 of 2 weeks'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Button: Clear 'חיפוש חוויות' */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-100">
          <div className="text-xs text-stone-500">
            {language === 'he'
              ? 'חיפוש מותאם אישית לפי הזמנים וההעדפות שלך'
              : 'Personalized search based on your dates and preferences'}
          </div>

          <button
            type="button"
            onClick={() => handleAnalyze()}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'he' ? 'חיפוש חוויות' : 'Find Experiences'}</span>
          </button>
        </div>
      </div>

      {/* Engine Understanding & Progressive Clarification Output */}
      {parsedResult && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div className="flex items-center gap-3">
              {parsedResult.status === 'missing_details' ? (
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
              ) : parsedResult.status === 'no_source_connected' ? (
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-stone-900">
                    {language === 'he' ? 'מצב הבקשה:' : 'Status:'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      parsedResult.status === 'missing_details'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : parsedResult.status === 'no_source_connected'
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {language === 'he' ? parsedResult.statusMessageHe : parsedResult.statusMessageEn}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  {parsedResult.status === 'no_source_connected'
                    ? (language === 'he'
                        ? 'חיבור לשירותי הזמנת מקומות וכרטיסים אינו מופעל כרגע — מוצגות הצעות ללא התחייבות על זמינות'
                        : 'External booking/ticketing not connected — Suggestions shown without live availability guarantee')
                    : (language === 'he'
                        ? 'זיהינו את הפרטים המרכזיים מתוך הבקשה שלך'
                        : 'We identified the core details from your request')}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              {onOpenPlanWorkspace && (
                <button
                  type="button"
                  onClick={() => {
                    const plan = createPlanFromParsedResult(parsedResult, userProfile, contacts);
                    onOpenPlanWorkspace(plan);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>{language === 'he' ? 'פתח מסך תכנון חכם (רובריקות)' : 'Open Planning Rubrics'}</span>
                </button>
              )}

              {/* Bridge to 5-Step Trip Planner button if relevant */}
              {(parsedResult.isFlightImplied || parsedResult.timeWindows.length > 0 || parsedResult.planType?.startsWith('vacation')) ? (
                <button
                  type="button"
                  onClick={() =>
                    onNavigateToTripWizard({
                      title: parsedResult.rawText.slice(0, 40),
                      destination: parsedResult.locations.destinationLocation || '',
                      tripType: parsedResult.audienceType === 'couple' ? 'couple' : 'friends',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <span>{language === 'he' ? 'אשף טיול ב-5 שלבים' : '5-Step Trip Wizard'}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              ) : null}
            </div>
          </div>

          {/* ACTIVE ANSWERED CLARIFICATIONS PILLS */}
          {Object.keys(clarifiedOverrides).length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-amber-900">
                {language === 'he' ? 'דגשים שהוספת:' : 'Details provided:'}
              </span>
              {Object.entries(clarifiedOverrides).map(([field, val]) => (
                <span
                  key={field}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-amber-300 text-stone-800 text-xs shadow-2xs"
                >
                  <span className="font-semibold text-amber-950">
                    {field === 'experienceType'
                      ? (language === 'he' ? 'סגנון' : 'Style')
                      : field === 'departureLocation'
                      ? (language === 'he' ? 'מוצא' : 'Departure')
                      : field === 'culinaryVibe'
                      ? (language === 'he' ? 'קולינריה' : 'Culinary')
                      : field === 'tripScope'
                      ? (language === 'he' ? 'היקף' : 'Scope')
                      : field}:
                  </span>
                  <span>{String(val)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveClarificationAnswer(field)}
                    title={language === 'he' ? 'הסר תשובה זו בלבד' : 'Remove this answer only'}
                    className="w-3.5 h-3.5 rounded-full hover:bg-stone-200 inline-flex items-center justify-center text-stone-500 hover:text-stone-800 cursor-pointer transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleResetClarifications}
                className="text-[11px] text-amber-800 hover:text-amber-950 underline cursor-pointer mr-auto rtl:mr-0 rtl:ml-auto"
              >
                {language === 'he' ? 'איפוס כל הדגשים' : 'Reset all'}
              </button>
            </div>
          )}

          {/* FOCUSED CLARIFICATION QUESTION */}
          {parsedResult.clarificationQuestions.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-800 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-amber-950">
                    {language === 'he' ? 'כדי שנוכל להתאים עבורך את החוויה:' : 'To help tailor your experience:'}
                  </h3>
                  <p className="text-xs text-amber-900">
                    {language === 'he'
                      ? 'נשמח לדעת עוד פרט קטן שיעזור לנו לדייק את ההמלצה.'
                      : 'A quick question to help us fine-tune the recommendation.'}
                  </p>
                </div>
              </div>

              {parsedResult.clarificationQuestions.map((q) => (
                <div key={q.id} className="space-y-3 pt-1">
                  <div className="font-bold text-sm text-stone-900">
                    {language === 'he' ? q.questionHe : q.questionEn}
                  </div>

                  {q.contextNoteHe && (
                    <div className="text-xs text-stone-600">
                      {language === 'he' ? q.contextNoteHe : q.contextNoteEn}
                    </div>
                  )}

                  {/* Clarification Options */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleClarificationAnswer(q.targetField, opt.payloadValue)}
                        className="p-3 rounded-xl border border-amber-300 bg-white hover:bg-amber-100 hover:border-amber-400 text-xs font-bold text-stone-800 text-center transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        {language === 'he' ? opt.labelHe : opt.labelEn}
                      </button>
                    ))}
                  </div>

                  {/* Free-text response input */}
                  {q.allowFreeText !== false && (
                    <div className="pt-2 border-t border-amber-200/60 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={
                          language === 'he'
                            ? 'או הקלידו תשובה משלכם (לדוגמה: רמת גן / מסעדה אסיאתית / יומיים)...'
                            : 'Or type your own free-text answer...'
                        }
                        value={freeTextClarification}
                        onChange={(e) => setFreeTextClarification(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleFreeTextSubmit(q.targetField);
                          }
                        }}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-stone-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleFreeTextSubmit(q.targetField)}
                        className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs active:scale-95"
                      >
                        <Send className="w-3 h-3 rtl:rotate-180" />
                        <span>{language === 'he' ? 'שליחה' : 'Send'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* EXTRACTED FACTS */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>
                {language === 'he'
                  ? 'פרטים מתוך הבקשה:'
                  : 'Details from your request:'}
              </span>
            </h3>

            {parsedResult.extractedFacts.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-stone-200 text-xs text-stone-500">
                {language === 'he'
                  ? 'לא צוינו פרטים ספציפיים. תוכל להוסיף עוד מידע בתיבת החיפוש.'
                  : 'No specific details provided yet. You can add more in the search box.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {parsedResult.extractedFacts.map((fact) => (
                  <div
                    key={fact.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-stone-500 block">
                        {language === 'he' ? fact.labelHe : fact.labelEn}:
                      </span>
                      <span className="font-bold text-sm text-stone-900">{fact.value}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] border-t border-stone-200/60 pt-1.5">
                      <span className="text-stone-500">
                        {language === 'he' ? fact.sourceNoteHe : fact.sourceNoteEn}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          fact.certainty === 'explicit'
                            ? 'bg-emerald-100 text-emerald-800'
                            : fact.certainty === 'profile_confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {fact.certainty === 'explicit'
                          ? (language === 'he' ? 'מתוך הבקשה' : 'From Request')
                          : fact.certainty === 'profile_confirmed'
                          ? (language === 'he' ? 'מהפרופיל שלך' : 'From Profile')
                          : (language === 'he' ? 'הערכה' : 'Estimated')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DATES & PREFERENCES */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-amber-800" />
              <span>
                {language === 'he'
                  ? 'דגשים, מועדים וזמנים לפעילות:'
                  : 'Dates, times & key preferences:'}
              </span>
            </h3>

            {/* Time Windows */}
            {parsedResult.timeWindows.length > 0 && (
              <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-2">
                <span className="text-xs font-bold text-stone-700 block">
                  {language === 'he' ? 'מועדים וזמנים שנבחרו:' : 'Dates & time windows:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {parsedResult.timeWindows.map((win) => (
                    <div
                      key={win.id}
                      className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs space-y-1"
                    >
                      <div className="font-bold text-stone-900">{win.label}</div>
                      <div className="text-[11px] text-stone-500">
                        {language === 'he'
                          ? `משך: ${win.durationDaysMin} ימים | גמישות: ${win.isFlexible ? 'כן' : 'קבוע'}`
                          : `Duration: ${win.durationDaysMin} days | Flexible: ${win.isFlexible ? 'Yes' : 'Fixed'}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints List */}
            {parsedResult.constraints.length > 0 ? (
              <div className="space-y-2">
                {parsedResult.constraints.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-stone-200 bg-white flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-semibold text-stone-900">
                        {language === 'he' ? c.descriptionHe : c.descriptionEn}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                        c.isHardConstraint
                          ? 'bg-rose-50 text-rose-800 border border-rose-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {c.isHardConstraint
                        ? (language === 'he' ? 'דגש מחייב' : 'Required')
                        : (language === 'he' ? 'העדפה גמישה' : 'Flexible Preference')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-stone-500 italic">
                {language === 'he'
                  ? 'לא צוינו דגשים מחייבים מיוחדים בבקשה.'
                  : 'No specific mandatory requirements in this request.'}
              </div>
            )}
          </div>

          {/* LOCATION & TRANSPORT CONTEXT */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-800" />
              <span>
                {language === 'he'
                  ? 'מיקום ואמצעי הגעה:'
                  : 'Location & travel:'}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 block">
                  {language === 'he' ? 'מגורים קבועים:' : 'Permanent Home:'}
                </span>
                <span className="font-semibold text-stone-900">
                  {parsedResult.locations.permanentHome || (language === 'he' ? 'לא הוגדר בפרופיל' : 'Not set')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 block">
                  {language === 'he' ? 'נקודת יציאה לפעילות זו:' : 'Departure for this activity:'}
                </span>
                <span className="font-semibold text-stone-900">
                  {parsedResult.locations.activityDepartureLocation || (language === 'he' ? 'טרם צוין' : 'Unspecified')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 block">
                  {language === 'he' ? 'יעד / מקום הפעילות:' : 'Destination:'}
                </span>
                <span className="font-semibold text-stone-900">
                  {parsedResult.locations.destinationLocation || (language === 'he' ? 'בכפוף לפעילות הנבחרת' : 'Depends on activity')}
                </span>
              </div>
            </div>

            {/* Transport Mode Note */}
            <div className="text-xs text-stone-600 bg-stone-100 p-2.5 rounded-xl border border-stone-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-stone-600 shrink-0" />
              <span>
                {parsedResult.isFlightImplied
                  ? (language === 'he'
                      ? 'היעד מחוץ לישראל / כולל טיסה בינלאומית'
                      : 'International flight implied')
                  : (language === 'he'
                      ? 'פעילות מקומית — הגעה ברכב, הליכה או תחבורה יבשתית (ללא צורך בטיסות)'
                      : 'Local activity — private car, walking, or transit (no flight needed)')}
              </span>
            </div>
          </div>

          {/* CONCEPTUAL IDEAS & SUGGESTIONS */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-800" />
                <span>
                  {language === 'he'
                    ? 'רעיונות והצעות לפעילות:'
                    : 'Ideas & Suggestions:'}
                </span>
              </h3>
              <span className="text-[11px] text-stone-500">
                {language === 'he' ? 'הצעות ראשוניות להשראה' : 'Initial ideas for inspiration'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {parsedResult.conceptualIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-white space-y-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-stone-900 block">{idea.titleHe}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200 shrink-0">
                      {idea.category}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">{idea.descriptionHe}</p>

                  <div className="text-[11px] font-medium text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    {idea.disclaimerHe}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Proceed to Workspace Banner */}
            {onOpenPlanWorkspace && (
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-start">
                  <span className="font-bold text-sm text-stone-900 block">
                    {language === 'he' ? 'מוכן להמשיך לתכנון המדויק?' : 'Ready to refine your plan?'}
                  </span>
                  <span className="text-xs text-stone-600 block">
                    {language === 'he'
                      ? 'כל הפרטים שנאספו (משתתפים, זמנים, כשרות, מיקומים ותקציב) סונכרנו ומחכים לך במסך הרובריקות האינטראקטיבי.'
                      : 'All captured details (participants, dates, dietary, locations, budget) are synced in the interactive workspace.'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const plan = createPlanFromParsedResult(parsedResult, userProfile, contacts);
                    onOpenPlanWorkspace(plan);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>{language === 'he' ? 'פתח מסך תכנון חכם' : 'Open Planning Workspace'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import {
  Trip,
  SystemUnderstandingSummary,
  DateAlternative,
  TripEvent,
  Participant,
} from '../types/trip';
import { formatWithCalendarDual } from '../utils/calendarUtils';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Calendar,
  Clock,
  Target,
  ShieldAlert,
  Sliders,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Users,
  Globe,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface SystemUnderstandingReviewProps {
  tripTitle: string;
  destination?: string;
  summary: SystemUnderstandingSummary;
  alternatives: DateAlternative[];
  events: TripEvent[];
  participants?: Participant[];
  sharedMeetingPoint?: { location: string; airportCode?: string; timezone: string };
  onConfirm: () => void;
  onBackToEdit: () => void;
}

export const SystemUnderstandingReview: React.FC<SystemUnderstandingReviewProps> = ({
  tripTitle,
  destination,
  summary,
  alternatives,
  events,
  participants = [],
  sharedMeetingPoint,
  onConfirm,
  onBackToEdit,
}) => {
  const { language, t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <button
          onClick={onBackToEdit}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
        >
          {language === 'he' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{language === 'he' ? 'חזרה לעריכת פרמטרים' : 'Back to Edit Parameters'}</span>
        </button>

        <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
          {t('wizard.step5Title')}
        </span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {t('review.title')}
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          {t('review.desc')}
        </p>
      </div>

      {/* Main Review Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Intent Summary Box */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-800" />
            <h3 className="text-sm font-bold text-stone-900">
              {language === 'he' ? 'תמצית הכוונה' : 'Intent Synthesis'}
            </h3>
          </div>
          <p className="text-xs text-stone-800 leading-relaxed font-medium">
            {summary.parsedIntentSummary ||
              (language === 'he'
                ? `נסיעה עבור "${tripTitle}"${destination ? ` ליעד ${destination}` : ''}, תוך מיקוד במציאת החלופה האופטימלית העומדת בכל גבולות הזמן וההתחייבויות.`
                : `Travel plan for "${tripTitle}"${destination ? ` to ${destination}` : ''}, focusing on the optimal date alternative satisfying all time boundaries and constraints.`)}
          </p>
        </div>

        {/* Multi-Traveler Architecture & Timezones Card */}
        {participants.length > 0 && (
          <div className="space-y-3 border-t border-stone-100 pt-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-800" />
                <span>{t('review.travelersTitle')}</span>
              </h4>
              <span className="text-[11px] text-stone-500">
                {participants.length} {language === 'he' ? 'משתתפים בעולם' : 'Travelers'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl border border-stone-200 bg-stone-50 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{p.name}</span>
                    <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-medium">
                      {p.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600 flex flex-wrap items-center gap-2">
                    <span>
                      {language === 'he' ? 'מוצא:' : 'Origin:'} {p.departureCity || 'ישראל'} ({p.originAirport || 'TLV'})
                    </span>
                    <span>·</span>
                    <span className="font-mono text-stone-500">{p.timezone || 'Asia/Jerusalem'}</span>
                  </div>
                  <div className="text-[10px] text-amber-900">
                    {language === 'he' ? 'שפת ממשק:' : 'Language:'} {p.preferredLanguage === 'en' ? 'English' : 'עברית'} · {p.preferredCalendar === 'hebrew' ? 'לוח עברי' : 'Civil'}
                  </div>
                </div>
              ))}
            </div>

            {sharedMeetingPoint?.location && (
              <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-950 text-xs flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-700 shrink-0" />
                <span>
                  <strong>{language === 'he' ? 'נקודת מפגש משותפת:' : 'Meeting Point:'}</strong> {sharedMeetingPoint.location} ({sharedMeetingPoint.airportCode || ''}) - {t('review.multiOriginNote')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 1. Calendars & Selected Alternatives */}
        <div className="space-y-3 border-t border-stone-100 pt-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-800" />
              <span>{t('dates.travelDatesTitle')}</span>
            </h4>
            <span className="text-[11px] text-stone-500">
              {summary.activeCalendar === 'hebrew' ? t('dates.hebrewCalendar') : t('dates.gregorianCivil')}
            </span>
          </div>

          <div className="space-y-2">
            {alternatives.map((alt) => (
              <div
                key={alt.id}
                className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-stone-900 block">{alt.title}</span>
                  <span className="text-[11px] text-stone-600 block mt-0.5">
                    {formatWithCalendarDual(alt.startDate, summary.activeCalendar, true)} {language === 'he' ? 'עד' : 'to'}{' '}
                    {formatWithCalendarDual(alt.endDate, summary.activeCalendar, true)}
                  </span>
                </div>
                {alt.notes && (
                  <span className="text-[11px] text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200 self-start sm:self-auto">
                    {alt.notes}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2. Top Ranked Goals */}
        <div className="space-y-3 border-t border-stone-100 pt-5">
          <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-800" />
            <span>{t('goals.title')}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {summary.topGoals.map((goal, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-amber-800 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="font-medium text-stone-800">{goal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Mandatory vs Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-100 pt-5 text-xs">
          {/* Mandatory */}
          <div className="space-y-2">
            <h5 className="font-bold text-rose-950 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>{t('common.mandatory')}</span>
            </h5>
            <div className="space-y-1.5">
              {summary.mandatoryConstraints.length === 0 ? (
                <p className="text-stone-400 text-[11px]">
                  {language === 'he' ? 'לא הוגדרו אילוצים קשיחים מיוחדים' : 'No strict mandatory constraints defined'}
                </p>
              ) : (
                summary.mandatoryConstraints.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-950 font-medium text-[11px]"
                  >
                    • {c.title}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Preferences & Optimization */}
          <div className="space-y-2">
            <h5 className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('common.preference')}</span>
            </h5>
            <div className="space-y-1.5">
              {[...summary.preferences, ...summary.optimizationTargets].map((c) => (
                <div
                  key={c.id}
                  className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-950 text-[11px]"
                >
                  • {c.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToEdit}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{language === 'he' ? 'עריכת פרמטרים או חלופות' : 'Edit Parameters or Dates'}</span>
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <span>{t('review.confirmButton')}</span>
          {language === 'he' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

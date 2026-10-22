import React, { useState, useEffect, useRef } from 'react';
import {
  Trip,
  TripType,
  PlanningMethod,
  Participant,
  CalendarSystem,
  DateSelectionMode,
  DateAlternative,
  FlexibleDateWindow,
  TravelBoundaries,
  TripEvent,
  ShabbatHolidayConstraints,
  RankedGoal,
  ClassifiedConstraint,
  SystemUnderstandingSummary,
  UniversalConstraint,
} from '../types/trip';
import { DatePlanningSection } from './DatePlanningSection';
import { TravelBoundariesAndEventsSection } from './TravelBoundariesAndEventsSection';
import { TripGoalsAndPrioritiesSection } from './TripGoalsAndPrioritiesSection';
import { SystemUnderstandingReview } from './SystemUnderstandingReview';
import { NaturalTextParseResult } from '../utils/naturalLanguageDateParser';
import { useLanguage } from '../i18n/LanguageContext';
import { COMMON_TIMEZONES } from '../utils/timezoneUtils';
import {
  Heart,
  Users,
  User,
  Compass,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Plus,
  Trash2,
  Globe,
  MapPin,
} from 'lucide-react';

interface CreateTripScreenProps {
  onTripCreated: (newTrip: Trip) => void;
  onCancel: () => void;
  initialData?: {
    title?: string;
    destination?: string;
    tripType?: TripType;
  };
}

type WizardStep =
  | 'basics'
  | 'dates_calendar'
  | 'boundaries_events'
  | 'goals_priorities'
  | 'system_review';

interface TravelerFormData {
  id: string;
  name: string;
  role: string;
  departureCity: string;
  originAirport: string;
  timezone: string;
  preferredLanguage: 'he' | 'en';
  preferredCalendar: CalendarSystem;
}

export const CreateTripScreen: React.FC<CreateTripScreenProps> = ({
  onTripCreated,
  onCancel,
  initialData,
}) => {
  const { language, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<WizardStep>('basics');
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Basic info
  const [title, setTitle] = useState(initialData?.title || '');
  const [tripType, setTripType] = useState<TripType>(initialData?.tripType || 'couple');
  const [planningMethod, setPlanningMethod] = useState<PlanningMethod>('discover_idea');
  const [destination, setDestination] = useState(initialData?.destination || '');
  const [sharedMeetingLocation, setSharedMeetingLocation] = useState('');
  const [formError, setFormError] = useState('');

  // Multi-traveler architecture (Part B & C)
  const [travelers, setTravelers] = useState<TravelerFormData[]>([
    {
      id: 'traveler_1',
      name: language === 'he' ? 'אני (מארגן)' : 'Me (Organizer)',
      role: 'מארגן ראשון',
      departureCity: 'תל אביב',
      originAirport: 'TLV',
      timezone: 'Asia/Jerusalem',
      preferredLanguage: 'he',
      preferredCalendar: 'gregorian',
    },
    {
      id: 'traveler_2',
      name: language === 'he' ? 'שותף/ת לנסיעה' : 'Travel Partner',
      role: 'משתתף נוסף',
      departureCity: 'לונדון',
      originAirport: 'LHR',
      timezone: 'Europe/London',
      preferredLanguage: 'en',
      preferredCalendar: 'gregorian',
    },
  ]);

  // 2. Dates & Calendars - EXACTLY ONE alternative by default (Part A, Requirement 3)
  const [calendarSystem, setCalendarSystem] = useState<CalendarSystem>('gregorian');
  const [showSecondaryCalendar, setShowSecondaryCalendar] = useState(true);
  const [secondaryCalendarSystem, setSecondaryCalendarSystem] =
    useState<CalendarSystem>('hebrew');
  const [selectionMode, setSelectionMode] = useState<DateSelectionMode>('alternatives');
  const [naturalText, setNaturalText] = useState(
    'אני רוצה לצאת מיום ראשון עד יום חמישי, בשבוע של 1 בנובמבר או בשבוע של 8 בנובמבר 2026'
  );
  const [alternatives, setAlternatives] = useState<DateAlternative[]>([
    {
      id: 'alt_1',
      title: 'חלופה 1: 1–5 בנובמבר 2026',
      startDate: '2026-11-01',
      endDate: '2026-11-05',
      notes: '',
      pros: ['מתאים לשבוע עבודה רגיל', 'ללא שהות שבת בחו״ל'],
    },
  ]);
  const [flexibleWindow, setFlexibleWindow] = useState<FlexibleDateWindow>({
    earliestDeparture: '2026-11-01',
    latestDeparture: '2026-11-10',
    earliestReturn: '2026-11-06',
    latestReturn: '2026-11-20',
    durationNightsMin: 4,
    durationNightsMax: 6,
    allowedDaysOfWeek: [0, 1, 2, 3, 4],
  });

  // 3. Boundaries & Universal Constraints (Part D)
  const [boundaries, setBoundaries] = useState<TravelBoundaries>({
    earliestHomeDeparture: { time: '16:00', isMandatory: true, note: 'סיום יום עבודה' },
    airportArrivalBufferHours: 3,
    latestHomeReturn: { time: '22:00', isMandatory: false },
    returnToWorkDeadline: { time: '09:00', isMandatory: true, note: 'הגעה לעבודה בזמן' },
    destinationArrivalDeadline: { time: '13:00', isMandatory: false },
  });

  const [events, setEvents] = useState<TripEvent[]>([]);
  const [universalConstraints, setUniversalConstraints] = useState<UniversalConstraint[]>([]);

  const [shabbatConstraints, setShabbatConstraints] = useState<ShabbatHolidayConstraints>({
    enabled: false,
    mustBeHomeForShabbat: true,
    minHoursAfterShabbatTakeoff: 3,
    minHoursBeforeShabbatLanding: 4,
  });

  // 4. Goals & Priorities
  const [goals, setGoals] = useState<RankedGoal[]>([
    {
      id: 'maximize_vacation',
      label: 'למקסם את משך החופשה',
      description: 'לנצל כל שעה אפשרית לחופשה ורוגע ביעד במסגרת האילוצים',
      priority: 1,
      selected: true,
    },
    {
      id: 'minimize_work_absence',
      label: 'למזער את זמן ההיעדרות מהעבודה',
      description: 'לתזמן טיסות בערב או סופ״ש כדי להפסיד מינימום ימי עבודה בישראל',
      priority: 2,
      selected: true,
    },
    {
      id: 'minimize_cost',
      label: 'למזער את העלות הכוללת',
      description: 'לתעדף חלופות טיסה ולינה חסכוניות',
      priority: 3,
      selected: false,
    },
    {
      id: 'attend_event_on_time',
      label: 'להגיע לאירוע בזמן ולחזור בהקדם האפשרי',
      description: 'מיקוד בעמידה בלו״ז הפגישה או האירוע ללא בזבוז זמן',
      priority: 4,
      selected: false,
    },
    {
      id: 'maximize_destination_time',
      label: 'למקסם את הזמן הפנוי ביעד',
      description: 'הגעה מוקדמת וחזרה מאוחרת כדי לשהות מקסימום שעות נטו ביעד',
      priority: 5,
      selected: false,
    },
    {
      id: 'avoid_night_flights',
      label: 'להימנע מטיסות לילה או מהמתנות ארוכות',
      description: 'העדפת שעות יום נוחות, שינה טובה וטיסות ישירות',
      priority: 6,
      selected: false,
    },
    {
      id: 'prioritize_comfort',
      label: 'להעדיף טיסות נוחות, גם אם הן יקרות יותר',
      description: 'נוחות מרבית, שעות הגיוניות ושירות איכותי',
      priority: 7,
      selected: false,
    },
    {
      id: 'balanced_compromise',
      label: 'לאזן בין מחיר, נוחות, זמן חופשה וסיכון לאיחור',
      description: 'פשרה חכמה ושקולה בין כל הגורמים',
      priority: 8,
      selected: false,
    },
  ]);

  // Scroll to top on step changes without disrupting typing
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
  }, [currentStep]);

  // Convert travelers to Participant[]
  const participantsList: Participant[] = travelers.map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    isAnswered: false,
    preferredLanguage: t.preferredLanguage,
    preferredCalendar: t.preferredCalendar,
    departureCity: t.departureCity,
    originAirport: t.originAirport,
    timezone: t.timezone,
  }));

  const handleAddTraveler = () => {
    const idx = travelers.length + 1;
    const newT: TravelerFormData = {
      id: `traveler_${Date.now()}`,
      name: language === 'he' ? `משתתף/ת ${idx}` : `Traveler ${idx}`,
      role: 'משתתף נוסף',
      departureCity: idx % 2 === 0 ? 'ניו יורק' : 'פריז',
      originAirport: idx % 2 === 0 ? 'JFK' : 'CDG',
      timezone: idx % 2 === 0 ? 'America/New_York' : 'Europe/Paris',
      preferredLanguage: 'en',
      preferredCalendar: 'gregorian',
    };
    setTravelers([...travelers, newT]);
  };

  const handleUpdateTraveler = (id: string, updates: Partial<TravelerFormData>) => {
    setTravelers(travelers.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const handleRemoveTraveler = (id: string) => {
    if (travelers.length <= 1) return;
    setTravelers(travelers.filter((t) => t.id !== id));
  };

  // Helper to build classified constraints
  const getClassifiedConstraints = (): ClassifiedConstraint[] => {
    const list: ClassifiedConstraint[] = [];

    // Boundaries
    if (boundaries.earliestHomeDeparture?.isMandatory) {
      list.push({
        id: 'c_dep',
        title: `לא להמריא לפני ${boundaries.earliestHomeDeparture.time}`,
        level: 'mandatory',
        category: 'גבולות זמן',
        explanation: 'אילוץ קשיח: לא ניתן לצאת לפני שעה זו.',
      });
    }

    if (boundaries.returnToWorkDeadline?.isMandatory) {
      list.push({
        id: 'c_work',
        title: `חזרה לעבודה עד ${boundaries.returnToWorkDeadline.time}`,
        level: 'mandatory',
        category: 'גבולות זמן',
        explanation: 'חובה לנחות ולהגיע בזמן להתחייבויות העבודה.',
      });
    }

    // Universal constraints
    universalConstraints.forEach((c) => {
      list.push({
        id: c.id,
        title: `${c.title} (${c.ownerName || 'כל הקבוצה'})`,
        level: c.isMandatory ? 'mandatory' : 'preference',
        category: c.type,
        explanation: `${c.earliestDate || ''} ${c.latestDate || ''} - ${c.location || ''}`,
      });
    });

    return list;
  };

  const buildSystemUnderstanding = (): SystemUnderstandingSummary => {
    const topGoalsList = goals
      .filter((g) => g.selected)
      .sort((a, b) => a.priority - b.priority)
      .map((g) => g.label);

    const mandatoryList = getClassifiedConstraints().filter((c) => c.level === 'mandatory');
    const prefList = getClassifiedConstraints().filter((c) => c.level === 'preference');

    const originsSummary = travelers
      .map((t) => `${t.name} (${t.departureCity}, ${t.timezone})`)
      .join('; ');

    const intentSummary =
      language === 'he'
        ? `נסיעה עבור "${title}"${destination ? ` ליעד ${destination}` : ''}. מוצא משתתפים: ${originsSummary}. הוגדרו ${alternatives.length} חלופות תאריכים.`
        : `Travel plan for "${title}"${destination ? ` to ${destination}` : ''}. Traveler origins: ${originsSummary}. ${alternatives.length} date alternatives defined.`;

    return {
      parsedIntentSummary: intentSummary,
      topGoals: topGoalsList.length > 0 ? topGoalsList : ['איזון חכם בין יעדים, עלויות ולו״ז'],
      mandatoryConstraints: mandatoryList,
      preferences: prefList,
      optimizationTargets: [],
      activeCalendar: calendarSystem,
      secondaryCalendar: secondaryCalendarSystem,
      alternativesSummary: `${alternatives.length} חלופות תאריכים מוגדרות לבדיקה והשוואה`,
      isConfirmedByUser: false,
    };
  };

  const handleNextFromBasics = () => {
    if (!title.trim()) {
      setFormError(language === 'he' ? 'נא להזין שם או כינוי לטיול' : 'Please enter a trip name');
      return;
    }
    setFormError('');
    setCurrentStep('dates_calendar');
  };

  const handleFinalSubmit = () => {
    const understanding = buildSystemUnderstanding();
    understanding.isConfirmedByUser = true;

    const newTrip: Trip = {
      id: `trip_${Date.now()}`,
      title: title.trim(),
      tripType,
      planningMethod,
      destination: destination.trim() || undefined,
      dateNotes:
        alternatives.length > 1
          ? `${alternatives.length} חלופות מוגדרות`
          : alternatives[0]?.title || 'מועד נסיעה מוגדר',
      status: 'in_progress',
      isDemo: false,
      participants: participantsList,
      currentParticipantId: participantsList[0].id,
      createdAt: new Date().toISOString().split('T')[0],

      calendarSystem,
      secondaryCalendarSystem,
      dateSelectionMode: selectionMode,
      dateAlternatives: alternatives,
      flexibleWindow,
      travelBoundaries: boundaries,
      events,
      shabbatHolidayConstraints: shabbatConstraints,
      universalConstraints,
      sharedMeetingPoint: sharedMeetingLocation
        ? { location: sharedMeetingLocation, timezone: 'Europe/Rome' }
        : undefined,
      rankedGoals: goals,
      classifiedConstraints: getClassifiedConstraints(),
      systemUnderstanding: understanding,
      rawNaturalText: naturalText,
    };

    onTripCreated(newTrip);
  };

  const tripTypeOptions: { type: TripType; label: string; desc: string; icon: any }[] = [
    { type: 'couple', label: t('step1.tripTypeCouple'), desc: 'חופשה רומנטית או זמן איכות', icon: Heart },
    { type: 'family', label: t('step1.tripTypeFamily'), desc: 'הורים, ילדים וחוויות לכל הגילאים', icon: Users },
    { type: 'friends', label: t('step1.tripTypeFriends'), desc: 'טיול חבר׳ה, מסיבות או טרקים', icon: Compass },
    { type: 'solo', label: t('step1.tripTypeSolo'), desc: 'חופש אישי, עצמאות וגילוי עצמי', icon: User },
    { type: 'group', label: t('step1.tripTypeGroup'), desc: 'משפחה מורחבת או קבוצה', icon: Users },
    { type: 'work', label: t('step1.tripTypeWork'), desc: 'ריטריט צוותי או שילוב עבודה ופנאי', icon: Briefcase },
  ];

  const stepsList: { key: WizardStep; label: string; number: number }[] = [
    { key: 'basics', label: `1. ${t('wizard.step1Title')}`, number: 1 },
    { key: 'dates_calendar', label: `2. ${t('wizard.step2Title')}`, number: 2 },
    { key: 'boundaries_events', label: `3. ${t('wizard.step3Title')}`, number: 3 },
    { key: 'goals_priorities', label: `4. ${t('wizard.step4Title')}`, number: 4 },
    { key: 'system_review', label: `5. ${t('wizard.step5Title')}`, number: 5 },
  ];

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Step Navigation Pill Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        >
          {language === 'he' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{language === 'he' ? 'ביטול וחזרה' : 'Cancel & Back'}</span>
        </button>

        {/* Step Indicator Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {stepsList.map((st) => {
            const isActive = currentStep === st.key;
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => {
                  if (title.trim() || st.key === 'basics') {
                    setCurrentStep(st.key);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer font-medium ${
                  isActive
                    ? 'bg-amber-800 text-white font-bold shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {formError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {formError}
        </div>
      )}

      {/* STEP 1: BASICS & INTERNATIONAL TRAVELERS */}
      {currentStep === 'basics' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {t('wizard.step1Title')}
            </h2>
            <p className="text-xs text-stone-500">
              {t('wizard.step1Desc')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-6">
            {/* Trip Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900 block">
                {t('step1.tripTitle')}
              </label>
              <input
                type="text"
                dir="auto"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('step1.tripTitlePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-1 focus:ring-amber-800"
              />
            </div>

            {/* Trip Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-900 block">
                {t('step1.tripType')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tripTypeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = tripType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => setTripType(opt.type)}
                      className={`p-3.5 rounded-xl border text-start transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-800 bg-amber-50/50 ring-1 ring-amber-800 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-amber-800' : 'text-stone-400'}`} />
                      <span className="font-bold text-xs text-stone-900 block">{opt.label}</span>
                      <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Destination & Shared Meeting Point */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-900 block">
                  {t('step1.destination')}
                </label>
                <input
                  type="text"
                  dir="auto"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={t('step1.destinationPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-1 focus:ring-amber-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-900 block">
                  {t('step1.sharedMeetingPoint')}
                </label>
                <input
                  type="text"
                  dir="auto"
                  value={sharedMeetingLocation}
                  onChange={(e) => setSharedMeetingLocation(e.target.value)}
                  placeholder={t('step1.sharedMeetingPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-1 focus:ring-amber-800"
                />
              </div>
            </div>

            {/* Multi-Traveler International Architecture Card (Part B & C) */}
            <div className="border-t border-stone-100 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-amber-800" />
                    <span>{t('travelers.sectionTitle')}</span>
                  </h4>
                  <p className="text-xs text-stone-500">
                    {t('travelers.sectionDesc')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddTraveler}
                  className="flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('travelers.addTraveler')}</span>
                </button>
              </div>

              {/* Travelers List */}
              <div className="space-y-3">
                {travelers.map((trv, idx) => (
                  <div
                    key={trv.id}
                    className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-800 text-white text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          dir="auto"
                          value={trv.name}
                          onChange={(e) => handleUpdateTraveler(trv.id, { name: e.target.value })}
                          className="font-bold text-stone-900 bg-transparent border-b border-stone-300 focus:border-amber-800 focus:outline-none px-1"
                        />
                        <span className="text-[10px] text-stone-500">
                          ({idx === 0 ? t('travelers.organizer') : t('travelers.participant')})
                        </span>
                      </div>

                      {travelers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTraveler(trv.id)}
                          className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                          {t('travelers.originLocation')}
                        </label>
                        <input
                          type="text"
                          dir="auto"
                          value={trv.departureCity}
                          onChange={(e) => handleUpdateTraveler(trv.id, { departureCity: e.target.value })}
                          placeholder="Tel Aviv / London"
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-stone-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                          {t('travelers.originAirport')}
                        </label>
                        <input
                          type="text"
                          value={trv.originAirport}
                          onChange={(e) => handleUpdateTraveler(trv.id, { originAirport: e.target.value.toUpperCase() })}
                          placeholder="TLV / LHR"
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                          {t('travelers.timezone')}
                        </label>
                        <select
                          value={trv.timezone}
                          onChange={(e) => handleUpdateTraveler(trv.id, { timezone: e.target.value })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-stone-300 text-xs"
                        >
                          {COMMON_TIMEZONES.map((tz) => (
                            <option key={tz.iana} value={tz.iana}>
                              {tz.iana} ({language === 'he' ? tz.cityHebrew : tz.cityEnglish})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                          {t('travelers.language')}
                        </label>
                        <select
                          value={trv.preferredLanguage}
                          onChange={(e) => handleUpdateTraveler(trv.id, { preferredLanguage: e.target.value as 'he' | 'en' })}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-stone-300 text-xs"
                        >
                          <option value="he">עברית (Hebrew - RTL)</option>
                          <option value="en">English (LTR)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleNextFromBasics}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>{t('common.next')}</span>
              {language === 'he' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DATES & CALENDARS */}
      {currentStep === 'dates_calendar' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {t('wizard.step2Title')}
            </h2>
            <p className="text-xs text-stone-500">
              {t('wizard.step2Desc')}
            </p>
          </div>

          <DatePlanningSection
            calendarSystem={calendarSystem}
            onCalendarSystemChange={setCalendarSystem}
            showSecondaryCalendar={showSecondaryCalendar}
            onToggleSecondaryCalendar={setShowSecondaryCalendar}
            secondaryCalendarSystem={secondaryCalendarSystem}
            onSecondaryCalendarChange={setSecondaryCalendarSystem}
            alternatives={alternatives}
            onAlternativesChange={setAlternatives}
            naturalText={naturalText}
            onNaturalTextChange={setNaturalText}
            onNaturalParsedResult={() => {}}
            flexibleWindow={flexibleWindow}
            onFlexibleWindowChange={setFlexibleWindow}
          />

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep('basics')}
              className="px-5 py-2.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 cursor-pointer"
            >
              {t('common.back')}
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep('boundaries_events')}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>{t('common.next')}</span>
              {language === 'he' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: BOUNDARIES & UNIVERSAL CONSTRAINTS */}
      {currentStep === 'boundaries_events' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {t('wizard.step3Title')}
            </h2>
            <p className="text-xs text-stone-500">
              {t('wizard.step3Desc')}
            </p>
          </div>

          <TravelBoundariesAndEventsSection
            boundaries={boundaries}
            onBoundariesChange={setBoundaries}
            events={events}
            onEventsChange={setEvents}
            shabbatConstraints={shabbatConstraints}
            onShabbatConstraintsChange={setShabbatConstraints}
            participants={participantsList}
            universalConstraints={universalConstraints}
            onUniversalConstraintsChange={setUniversalConstraints}
          />

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep('dates_calendar')}
              className="px-5 py-2.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 cursor-pointer"
            >
              {t('common.back')}
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep('goals_priorities')}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>{t('common.next')}</span>
              {language === 'he' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: GOALS & PRIORITIES */}
      {currentStep === 'goals_priorities' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {t('wizard.step4Title')}
            </h2>
            <p className="text-xs text-stone-500">
              {t('wizard.step4Desc')}
            </p>
          </div>

          <TripGoalsAndPrioritiesSection
            goals={goals}
            onGoalsChange={setGoals}
            classifiedConstraints={getClassifiedConstraints()}
          />

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep('boundaries_events')}
              className="px-5 py-2.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 cursor-pointer"
            >
              {t('common.back')}
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep('system_review')}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>{t('common.next')}</span>
              {language === 'he' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SYSTEM UNDERSTANDING REVIEW */}
      {currentStep === 'system_review' && (
        <SystemUnderstandingReview
          tripTitle={title}
          destination={destination}
          summary={buildSystemUnderstanding()}
          alternatives={alternatives}
          events={events}
          participants={participantsList}
          sharedMeetingPoint={
            sharedMeetingLocation
              ? { location: sharedMeetingLocation, timezone: 'Europe/Rome' }
              : undefined
          }
          onBackToEdit={() => setCurrentStep('basics')}
          onConfirm={handleFinalSubmit}
        />
      )}
    </div>
  );
};

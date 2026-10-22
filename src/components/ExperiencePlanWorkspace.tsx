import React, { useState } from 'react';
import {
  ExperiencePlan,
  ExperiencePlanType,
  DietaryRestrictionType,
  PlanParticipant,
} from '../types/experiencePlan';
import { UserProfile, ContactPerson } from '../types/experience';
import { useLanguage } from '../i18n/LanguageContext';
import {
  updateDatesFromNaturalText,
  updateParticipantsFromNaturalText,
  updateLocationsFromNaturalText,
  updateBudgetFromNaturalText,
  updatePreferencesFromNaturalText,
} from '../utils/planSynchronizer';
import {
  Sparkles,
  Users,
  MapPin,
  Calendar,
  UtensilsCrossed,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  Send,
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  Car,
  Plane,
  Heart,
  SlidersHorizontal,
  Compass,
  Edit2,
  Plus,
  Trash2,
  Info,
} from 'lucide-react';

interface ExperiencePlanWorkspaceProps {
  plan: ExperiencePlan;
  userProfile?: UserProfile;
  contacts?: ContactPerson[];
  onUpdatePlan: (updatedPlan: ExperiencePlan) => void;
  onBackToPortal: () => void;
  onProceedToTripWizard?: (initialData: {
    title: string;
    destination: string;
    tripType: 'solo' | 'couple' | 'friends' | 'family';
  }) => void;
}

export const ExperiencePlanWorkspace: React.FC<ExperiencePlanWorkspaceProps> = ({
  plan,
  userProfile,
  contacts = [],
  onUpdatePlan,
  onBackToPortal,
  onProceedToTripWizard,
}) => {
  const { language } = useLanguage();

  // Natural language inputs per rubric
  const [datesNaturalText, setDatesNaturalText] = useState('');
  const [participantsNaturalText, setParticipantsNaturalText] = useState('');
  const [locationsNaturalText, setLocationsNaturalText] = useState('');
  const [budgetNaturalText, setBudgetNaturalText] = useState('');
  const [preferencesNaturalText, setPreferencesNaturalText] = useState('');

  // Rubric action feedback messages
  const [feedbackMessage, setFeedbackMessage] = useState<{
    rubric: string;
    text: string;
    type: 'success' | 'info';
  } | null>(null);

  const showFeedback = (rubric: string, text: string) => {
    setFeedbackMessage({ rubric, text, type: 'success' });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // --- Handlers for Natural Language inputs in Rubrics ---

  const handleApplyNaturalDates = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!datesNaturalText.trim()) return;
    const res = updateDatesFromNaturalText(plan, datesNaturalText);
    if (res.success) {
      onUpdatePlan(res.updatedPlan);
      showFeedback('dates', res.explanation);
      setDatesNaturalText('');
    }
  };

  const handleApplyNaturalParticipants = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!participantsNaturalText.trim()) return;
    const res = updateParticipantsFromNaturalText(plan, participantsNaturalText);
    if (res.success) {
      onUpdatePlan(res.updatedPlan);
      showFeedback('participants', res.explanation);
      setParticipantsNaturalText('');
    }
  };

  const handleApplyNaturalLocations = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!locationsNaturalText.trim()) return;
    const res = updateLocationsFromNaturalText(plan, locationsNaturalText);
    if (res.success) {
      onUpdatePlan(res.updatedPlan);
      showFeedback('locations', res.explanation);
      setLocationsNaturalText('');
    }
  };

  const handleApplyNaturalBudget = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!budgetNaturalText.trim()) return;
    const res = updateBudgetFromNaturalText(plan, budgetNaturalText);
    if (res.success) {
      onUpdatePlan(res.updatedPlan);
      showFeedback('budget', res.explanation);
      setBudgetNaturalText('');
    }
  };

  const handleApplyNaturalPreferences = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!preferencesNaturalText.trim()) return;
    const res = updatePreferencesFromNaturalText(plan, preferencesNaturalText);
    if (res.success) {
      onUpdatePlan(res.updatedPlan);
      showFeedback('preferences', res.explanation);
      setPreferencesNaturalText('');
    }
  };

  // --- Handlers for Structured Clicks ---

  const toggleDietaryRestriction = (restriction: DietaryRestrictionType) => {
    let current: DietaryRestrictionType[] = [...plan.dietary.restrictions.filter((r) => r !== 'none')];
    if (restriction === 'none') {
      current = ['none'];
    } else {
      if (current.includes(restriction)) {
        current = current.filter((r) => r !== restriction);
      } else {
        current.push(restriction);
      }
    }
    if (current.length === 0) current = ['none'];

    onUpdatePlan({
      ...plan,
      dietary: {
        ...plan.dietary,
        restrictions: current,
        isConfirmed: true,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const toggleCuisine = (cuisine: string) => {
    let current = [...plan.culinary.cuisines];
    if (current.includes(cuisine)) {
      current = current.filter((c) => c !== cuisine);
    } else {
      current.push(cuisine);
    }

    onUpdatePlan({
      ...plan,
      culinary: {
        ...plan.culinary,
        cuisines: current,
        isConfirmed: current.length > 0,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSelectAudienceMode = (mode: 'solo' | 'couple' | 'custom' | 'saved_group') => {
    let newParticipants: PlanParticipant[] = [
      plan.participants.find((p) => p.role === 'self') || {
        id: 'self',
        name: userProfile?.fullName || 'אני',
        role: 'self',
        isConfirmed: true,
      },
    ];

    if (mode === 'couple') {
      newParticipants.push({
        id: 'p_partner',
        name: 'בן/בת זוג',
        role: 'partner',
        isConfirmed: true,
      });
    } else if (mode === 'custom' || mode === 'saved_group') {
      newParticipants.push({
        id: 'p_group_member',
        name: 'משתתף נוסף',
        role: 'friend',
        isConfirmed: true,
      });
    }

    onUpdatePlan({
      ...plan,
      audienceType: mode,
      participants: newParticipants,
      updatedAt: new Date().toISOString(),
    });
  };

  const planTypeLabels: Record<ExperiencePlanType, { he: string; en: string }> = {
    local_outing: { he: 'בילוי מקומי', en: 'Local Outing' },
    culinary: { he: 'מסעדה וקולינריה', en: 'Culinary & Dining' },
    event: { he: 'הופעה ואירוע', en: 'Live Event / Show' },
    day_trip: { he: 'טיול יום', en: 'Day Trip' },
    vacation_domestic: { he: 'חופשה בארץ', en: 'Domestic Vacation' },
    vacation_abroad: { he: 'חופשה בחו״ל', en: 'Vacation Abroad' },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToPortal}
            className="p-2.5 rounded-2xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
            title={language === 'he' ? 'חזרה לחיפוש' : 'Back to search'}
          >
            {language === 'he' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {language === 'he' ? planTypeLabels[plan.type].he : planTypeLabels[plan.type].en}
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-500 font-medium">
                {language === 'he' ? 'תכנון מבוסס רובריקות מסונכרנות' : 'Unified Rubric Planning'}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-stone-900 mt-1">{plan.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {plan.type.startsWith('vacation') && onProceedToTripWizard && (
            <button
              type="button"
              onClick={() =>
                onProceedToTripWizard({
                  title: plan.title,
                  destination: plan.locations.destinationLocation?.value || '',
                  tripType: plan.audienceType === 'couple' ? 'couple' : 'friends',
                })
              }
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>{language === 'he' ? 'אשף טיול מפורט (5 שלבים)' : 'Detailed 5-Step Trip Wizard'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBackToPortal}
            className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-all cursor-pointer"
          >
            {language === 'he' ? 'חיפוש נוסף' : 'New Search'}
          </button>
        </div>
      </div>

      {/* Main Rubrics Container */}
      <div className="space-y-6">
        {/* ========================================================= */}
        {/* RUBRIC 1: PARTICIPANTS                                    */}
        {/* ========================================================= */}
        <section className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900">
                  {language === 'he' ? 'משתתפים בפעילות' : 'Participants'}
                </h2>
                <p className="text-xs text-stone-500">
                  {language === 'he' ? 'מי לוקח חלק בחוויה הזו' : 'Who is joining this experience'}
                </p>
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectAudienceMode('solo')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  plan.audienceType === 'solo'
                    ? 'bg-amber-800 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {language === 'he' ? 'עבורי לבד' : 'Solo'}
              </button>
              <button
                type="button"
                onClick={() => handleSelectAudienceMode('couple')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  plan.audienceType === 'couple'
                    ? 'bg-amber-800 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {language === 'he' ? 'בזוג' : 'Couple'}
              </button>
              <button
                type="button"
                onClick={() => handleSelectAudienceMode('custom')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  plan.audienceType === 'custom' || plan.audienceType === 'saved_group'
                    ? 'bg-amber-800 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {language === 'he' ? 'משפחה / קבוצה' : 'Group / Family'}
              </button>
            </div>
          </div>

          {/* Current Participants Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {plan.participants.map((p) => (
              <div
                key={p.id}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 font-semibold"
              >
                <span>{p.name}</span>
                {p.notes && <span className="text-[10px] text-stone-400">({p.notes})</span>}
              </div>
            ))}
          </div>

          {/* Mini Natural Language Input */}
          <form onSubmit={handleApplyNaturalParticipants} className="pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={participantsNaturalText}
                onChange={(e) => setParticipantsNaturalText(e.target.value)}
                placeholder={
                  language === 'he'
                    ? 'או כתבו בלשון חופשית: "אני ואשתי, ואולי גם זוג חברים"...'
                    : 'Or type freely: "My partner and I, plus another couple"...'
                }
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-800 text-stone-900"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Send className="w-3 h-3 rtl:rotate-180" />
                <span>{language === 'he' ? 'עדכן' : 'Update'}</span>
              </button>
            </div>
          </form>

          {feedbackMessage?.rubric === 'participants' && (
            <p className="text-[11px] text-emerald-800 font-medium">{feedbackMessage.text}</p>
          )}
        </section>

        {/* ========================================================= */}
        {/* RUBRIC 2: LOCATIONS & TRANSPORT                           */}
        {/* ========================================================= */}
        <section className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900">
                  {language === 'he' ? 'מיקום ואמצעי הגעה' : 'Location & Travel'}
                </h2>
                <p className="text-xs text-stone-500">
                  {language === 'he'
                    ? 'הפרדה מדויקת בין מוצא, יעד, מיקום משתתף ונקודת מפגש'
                    : 'Clear separation of departure, destination, participant location, and meeting point'}
                </p>
              </div>
            </div>
          </div>

          {/* Location Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Departure */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-[11px] font-bold text-stone-500 block">
                {language === 'he' ? 'נקודת יציאה:' : 'Departure point:'}
              </span>
              <input
                type="text"
                value={plan.locations.departureLocation?.value || ''}
                onChange={(e) =>
                  onUpdatePlan({
                    ...plan,
                    locations: {
                      ...plan.locations,
                      departureLocation: {
                        value: e.target.value,
                        source: 'rubric_input',
                        certainty: 'explicit',
                        isConfirmed: true,
                      },
                    },
                    updatedAt: new Date().toISOString(),
                  })
                }
                placeholder={language === 'he' ? 'טרם הוגדר (למשל: תל אביב)' : 'e.g. Tel Aviv'}
                className="w-full text-xs font-bold text-stone-900 bg-white border border-stone-300 rounded-lg px-2.5 py-1.5"
              />
            </div>

            {/* Destination */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-[11px] font-bold text-stone-500 block">
                {language === 'he' ? 'יעד / אזור הפעילות:' : 'Destination / Area:'}
              </span>
              <input
                type="text"
                value={plan.locations.destinationLocation?.value || ''}
                onChange={(e) =>
                  onUpdatePlan({
                    ...plan,
                    locations: {
                      ...plan.locations,
                      destinationLocation: {
                        value: e.target.value,
                        source: 'rubric_input',
                        certainty: 'explicit',
                        isConfirmed: true,
                      },
                    },
                    updatedAt: new Date().toISOString(),
                  })
                }
                placeholder={language === 'he' ? 'לדוגמה: ראשון לציון / צפון' : 'e.g. Rishon LeZion'}
                className="w-full text-xs font-bold text-stone-900 bg-white border border-stone-300 rounded-lg px-2.5 py-1.5"
              />
            </div>

            {/* Transport mode */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-[11px] font-bold text-stone-500 block">
                {language === 'he' ? 'אמצעי הגעה מועדף:' : 'Transport Mode:'}
              </span>
              <select
                value={plan.locations.transportMode.value}
                onChange={(e) =>
                  onUpdatePlan({
                    ...plan,
                    locations: {
                      ...plan.locations,
                      transportMode: {
                        value: e.target.value as any,
                        source: 'rubric_input',
                        certainty: 'explicit',
                        isConfirmed: true,
                      },
                    },
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="w-full text-xs font-bold text-stone-900 bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 cursor-pointer"
              >
                <option value="car">{language === 'he' ? 'רכב פרטי' : 'Private Car'}</option>
                <option value="transit_train">{language === 'he' ? 'רכבת / תחבורה ציבורית' : 'Transit / Train'}</option>
                <option value="walk">{language === 'he' ? 'הליכה ברגל (סמוך)' : 'Walking'}</option>
                <option value="flight">{language === 'he' ? 'טיסה (בחו״ל בלבד)' : 'Flight (Abroad)'}</option>
                <option value="undecided">{language === 'he' ? 'פתוח להחלטה' : 'Undecided'}</option>
              </select>
            </div>
          </div>

          {/* Other participant location notification if present */}
          {plan.locations.otherParticipantsLocations.length > 0 && (
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  {plan.locations.otherParticipantsLocations
                    .map((o) => `${o.participantNameOrRole} נמצא/לומד ב${o.location}`)
                    .join(', ')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const first = plan.locations.otherParticipantsLocations[0];
                  if (first) {
                    onUpdatePlan({
                      ...plan,
                      locations: {
                        ...plan.locations,
                        destinationLocation: {
                          value: first.location,
                          source: 'rubric_input',
                          certainty: 'explicit',
                          isConfirmed: true,
                        },
                      },
                      updatedAt: new Date().toISOString(),
                    });
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                {language === 'he' ? 'קבע כיעד הפעילות' : 'Set as Destination'}
              </button>
            </div>
          )}

          {/* Mini Natural Language Input */}
          <form onSubmit={handleApplyNaturalLocations} className="pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={locationsNaturalText}
                onChange={(e) => setLocationsNaturalText(e.target.value)}
                placeholder={
                  language === 'he'
                    ? 'או כתבו בלשון חופשית: "הבן שלי לומד בראשון לציון ואני רוצה לאסוף אותו משם"...'
                    : 'Or type freely: "My son studies in Rishon LeZion and I want to pick him up"...'
                }
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-800 text-stone-900"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Send className="w-3 h-3 rtl:rotate-180" />
                <span>{language === 'he' ? 'עדכן' : 'Update'}</span>
              </button>
            </div>
          </form>

          {feedbackMessage?.rubric === 'locations' && (
            <p className="text-[11px] text-emerald-800 font-medium">{feedbackMessage.text}</p>
          )}
        </section>

        {/* ========================================================= */}
        {/* RUBRIC 3: DATES & TIME WINDOWS                            */}
        {/* ========================================================= */}
        <section className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900">
                  {language === 'he' ? 'מועדים, זמנים וחלונות תאריכים' : 'Dates & Time Windows'}
                </h2>
                <p className="text-xs text-stone-500">
                  {language === 'he'
                    ? 'ללא המצאת משך חופשה — תמיכה בימים בודדים או חלונות חלופיים'
                    : 'Zero fabricated durations — supports specific dates or alternative windows'}
                </p>
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onUpdatePlan({
                    ...plan,
                    dates: { ...plan.dates, mode: 'single_date' },
                    updatedAt: new Date().toISOString(),
                  })
                }
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  plan.dates.mode === 'single_date'
                    ? 'bg-amber-800 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {language === 'he' ? 'תאריך מדויק' : 'Specific Date'}
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdatePlan({
                    ...plan,
                    dates: { ...plan.dates, mode: 'alternative_windows' },
                    updatedAt: new Date().toISOString(),
                  })
                }
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  plan.dates.mode === 'alternative_windows'
                    ? 'bg-amber-800 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {language === 'he' ? 'חלונות חלופיים' : 'Alternative Windows'}
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdatePlan({
                    ...plan,
                    dates: { ...plan.dates, mode: 'open_flexible' },
                    updatedAt: new Date().toISOString(),
                  })
                }
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  plan.dates.mode === 'open_flexible'
                    ? 'bg-amber-800 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {language === 'he' ? 'גמיש לחלוטין' : 'Open'}
              </button>
            </div>
          </div>

          {/* Specific date / time of day controls */}
          {plan.dates.mode === 'single_date' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  {language === 'he' ? 'בחר תאריך:' : 'Select Date:'}
                </label>
                <input
                  type="date"
                  value={plan.dates.specificDate?.value || ''}
                  onChange={(e) =>
                    onUpdatePlan({
                      ...plan,
                      dates: {
                        ...plan.dates,
                        specificDate: {
                          value: e.target.value,
                          source: 'rubric_input',
                          certainty: 'explicit',
                          isConfirmed: true,
                        },
                      },
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="w-full text-xs font-bold text-stone-900 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  {language === 'he' ? 'שעה ביום:' : 'Time of day:'}
                </label>
                <select
                  value={plan.dates.timeOfDay?.value || 'evening'}
                  onChange={(e) =>
                    onUpdatePlan({
                      ...plan,
                      dates: {
                        ...plan.dates,
                        timeOfDay: {
                          value: e.target.value as any,
                          source: 'rubric_input',
                          certainty: 'explicit',
                          isConfirmed: true,
                        },
                      },
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="w-full text-xs font-bold text-stone-900 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 cursor-pointer"
                >
                  <option value="morning">{language === 'he' ? 'בוקר' : 'Morning'}</option>
                  <option value="noon">{language === 'he' ? 'צהריים' : 'Noon'}</option>
                  <option value="afternoon">{language === 'he' ? 'אחר הצהריים' : 'Afternoon'}</option>
                  <option value="evening">{language === 'he' ? 'ערב' : 'Evening'}</option>
                  <option value="night">{language === 'he' ? 'לילה' : 'Night'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  {language === 'he' ? 'שעה מדויקת (אופציונלי):' : 'Exact Time:'}
                </label>
                <input
                  type="time"
                  value={plan.dates.exactTime?.value || ''}
                  onChange={(e) =>
                    onUpdatePlan({
                      ...plan,
                      dates: {
                        ...plan.dates,
                        exactTime: {
                          value: e.target.value,
                          source: 'rubric_input',
                          certainty: 'explicit',
                          isConfirmed: true,
                        },
                      },
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="w-full text-xs font-bold text-stone-900 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                />
              </div>
            </div>
          )}

          {/* Alternative Windows Display */}
          {plan.dates.mode === 'alternative_windows' && plan.dates.timeWindows.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.dates.timeWindows.map((win) => (
                <div key={win.id} className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                  <div className="font-bold text-stone-900">{win.label}</div>
                  <div className="text-stone-500 text-[11px] mt-0.5">
                    {win.durationDaysMin ? `${win.durationDaysMin} ימים` : 'משך טרם נקבע (גמיש)'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mini Natural Language Input */}
          <form onSubmit={handleApplyNaturalDates} className="pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={datesNaturalText}
                onChange={(e) => setDatesNaturalText(e.target.value)}
                placeholder={
                  language === 'he'
                    ? 'או כתבו בלשון חופשית: "אני פנוי בשבוע הראשון או השני של נובמבר, אבל חייב לחזור לפני שבת"...'
                    : 'Or type freely: "Free in the 1st or 2nd week of November, must be home before Shabbat"...'
                }
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-800 text-stone-900"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Send className="w-3 h-3 rtl:rotate-180" />
                <span>{language === 'he' ? 'עדכן' : 'Update'}</span>
              </button>
            </div>
          </form>

          {feedbackMessage?.rubric === 'dates' && (
            <p className="text-[11px] text-emerald-800 font-medium">{feedbackMessage.text}</p>
          )}
        </section>

        {/* ========================================================= */}
        {/* RUBRIC 4: DIETARY REQUIREMENTS (Strictly Separated!)       */}
        {/* ========================================================= */}
        <section className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900">
                {language === 'he' ? 'דרישות תזונה והגבלות' : 'Dietary Requirements & Constraints'}
              </h2>
              <p className="text-xs text-stone-500">
                {language === 'he'
                  ? 'מסננים מחייבים: כשרות, כשר למהדרין, צמחונות ואלרגיות — בנפרד מסוג המטבח'
                  : 'Mandatory filters: Kosher, Mehadrin, Vegan, Allergies — decoupled from cuisines'}
              </p>
            </div>
          </div>

          {/* Dietary Chips */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'kosher', labelHe: 'כשר', labelEn: 'Kosher' },
              { id: 'kosher_mehadrin', labelHe: 'כשר למהדרין', labelEn: 'Kosher Mehadrin' },
              { id: 'vegetarian', labelHe: 'צמחוני', labelEn: 'Vegetarian' },
              { id: 'vegan', labelHe: 'טבעוני', labelEn: 'Vegan' },
              { id: 'gluten_free', labelHe: 'ללא גלוטן / צליאק', labelEn: 'Gluten-Free' },
              { id: 'allergies', labelHe: 'אלרגיה / רגישות', labelEn: 'Allergies' },
              { id: 'none', labelHe: 'ללא הגבלה', labelEn: 'No Restrictions' },
            ].map((d) => {
              const isSelected = plan.dietary.restrictions.includes(d.id as any);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDietaryRestriction(d.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-800 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {language === 'he' ? d.labelHe : d.labelEn}
                </button>
              );
            })}
          </div>

          {/* Allergy Details Warning if Allergy selected */}
          {plan.dietary.restrictions.includes('allergies') && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>
                  {language === 'he'
                    ? 'אילוץ בטיחות תזונתי: אנא ציינו את האלרגנים המדויקים'
                    : 'Safety Constraint: Please specify exact allergens'}
                </span>
              </div>
              <input
                type="text"
                value={plan.dietary.allergyDetails || ''}
                onChange={(e) =>
                  onUpdatePlan({
                    ...plan,
                    dietary: { ...plan.dietary, allergyDetails: e.target.value },
                    updatedAt: new Date().toISOString(),
                  })
                }
                placeholder={language === 'he' ? 'לדוגמה: בוטנים, אגוזים, שומשום...' : 'e.g. Peanuts, tree nuts...'}
                className="w-full text-xs font-bold text-stone-900 bg-white border border-rose-300 rounded-xl px-3 py-2"
              />
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* RUBRIC 5: CULINARY CUISINES & STYLES (Separated!)          */}
        {/* ========================================================= */}
        {(plan.type === 'culinary' || plan.type === 'local_outing' || plan.type.startsWith('vacation')) && (
          <section className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900">
                  {language === 'he' ? 'העדפות קולינריות וסוגי אוכל' : 'Culinary Styles & Cuisines'}
                </h2>
                <p className="text-xs text-stone-500">
                  {language === 'he'
                    ? 'העדפות טעם: סושי, איטלקי, בשרים וכו׳ — בחירה בסושי אינה מבטלת כשרות'
                    : 'Cuisine preferences: Sushi, Italian, Meat, etc. — Selecting sushi never erases Kosher'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                'איטלקי / פיצה',
                'סושי / אסייתי',
                'בשרים',
                'דגים',
                'חלבי',
                'שף ים-תיכוני',
                'בר יין ונשנושים',
                'אוכל רחוב איכותי',
              ].map((c) => {
                const isSelected = plan.culinary.cuisines.some((item) => item.includes(c.split('/')[0].trim()));
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCuisine(c)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-800 text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            {/* Mini Natural Language Input */}
            <form onSubmit={handleApplyNaturalPreferences} className="pt-2 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={preferencesNaturalText}
                  onChange={(e) => setPreferencesNaturalText(e.target.value)}
                  placeholder={
                    language === 'he'
                      ? 'או כתבו בלשון חופשית: "רוצים סושי כשר למהדרין באווירה רגועה בלי הליכה"...'
                      : 'Or type freely: "We want kosher mehadrin sushi in a quiet spot"...'
                  }
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-800 text-stone-900"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3 h-3 rtl:rotate-180" />
                  <span>{language === 'he' ? 'עדכן' : 'Update'}</span>
                </button>
              </div>
            </form>

            {feedbackMessage?.rubric === 'preferences' && (
              <p className="text-[11px] text-emerald-800 font-medium">{feedbackMessage.text}</p>
            )}
          </section>
        )}

        {/* ========================================================= */}
        {/* RUBRIC 6: BUDGET                                          */}
        {/* ========================================================= */}
        <section className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900">
                  {language === 'he' ? 'תקציב וגמישות מחיר' : 'Budget & Price Flexibility'}
                </h2>
                <p className="text-xs text-stone-500">
                  {language === 'he'
                    ? 'הגדרת רף תקציב עם אפשרות לגמישות בשביל חוויה מיוחדת'
                    : 'Budget benchmark with flexibility toggle for special experiences'}
                </p>
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onUpdatePlan({
                    ...plan,
                    budget: { ...plan.budget, flexibility: 'strict' },
                    updatedAt: new Date().toISOString(),
                  })
                }
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  plan.budget.flexibility === 'strict'
                    ? 'bg-amber-800 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {language === 'he' ? 'מדויק' : 'Strict'}
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdatePlan({
                    ...plan,
                    budget: { ...plan.budget, flexibility: 'flexible_for_special' },
                    updatedAt: new Date().toISOString(),
                  })
                }
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  plan.budget.flexibility === 'flexible_for_special'
                    ? 'bg-amber-800 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {language === 'he' ? 'גמיש לחריגה' : 'Flexible'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">
                {language === 'he' ? 'סכום יעד (₪):' : 'Target Amount (₪):'}
              </label>
              <input
                type="number"
                value={plan.budget.amount || ''}
                onChange={(e) =>
                  onUpdatePlan({
                    ...plan,
                    budget: {
                      ...plan.budget,
                      amount: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      isConfirmed: true,
                    },
                    updatedAt: new Date().toISOString(),
                  })
                }
                placeholder={language === 'he' ? 'לדוגמה: 500' : 'e.g. 500'}
                className="w-full text-xs font-bold text-stone-900 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">
                {language === 'he' ? 'מטבע / תחולה:' : 'Scope:'}
              </label>
              <select
                value={plan.budget.scope}
                onChange={(e) =>
                  onUpdatePlan({
                    ...plan,
                    budget: { ...plan.budget, scope: e.target.value as any },
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="w-full text-xs font-bold text-stone-900 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 cursor-pointer"
              >
                <option value="total">{language === 'he' ? 'סך הכל לכל המשתתפים' : 'Total for all'}</option>
                <option value="per_person">{language === 'he' ? 'לנפש / לאדם' : 'Per Person'}</option>
              </select>
            </div>
          </div>

          {/* Mini Natural Language Input */}
          <form onSubmit={handleApplyNaturalBudget} className="pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={budgetNaturalText}
                onChange={(e) => setBudgetNaturalText(e.target.value)}
                placeholder={
                  language === 'he'
                    ? 'או כתבו בלשון חופשית: "עדיף עד 500 שקל, אבל אפשר לחרוג בשביל משהו מיוחד"...'
                    : 'Or type freely: "Prefer up to 500 NIS, but flexible for something special"...'
                }
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-800 text-stone-900"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Send className="w-3 h-3 rtl:rotate-180" />
                <span>{language === 'he' ? 'עדכן' : 'Update'}</span>
              </button>
            </div>
          </form>

          {feedbackMessage?.rubric === 'budget' && (
            <p className="text-[11px] text-emerald-800 font-medium">{feedbackMessage.text}</p>
          )}
        </section>

        {/* ========================================================= */}
        {/* RUBRIC 7: SHABBAT & LOGISTICAL CONSTRAINTS (Co-existing)  */}
        {/* ========================================================= */}
        {plan.constraints.length > 0 && (
          <section className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-7 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900">
                  {language === 'he' ? 'דגשים ואילוצים פעילים' : 'Active Constraints & Highlights'}
                </h2>
                <p className="text-xs text-stone-500">
                  {language === 'he'
                    ? 'שמירה מקבילה על אילוצי יציאה וחזרה של שבת ללא דריסת תנאים'
                    : 'Parallel retention of multiple Shabbat/timeline conditions'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {plan.constraints.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-stone-900">
                    {language === 'he' ? c.descriptionHe : c.descriptionEn}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      c.isHardConstraint
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {c.isHardConstraint ? (language === 'he' ? 'מחייב' : 'Required') : (language === 'he' ? 'גמיש' : 'Flexible')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <button
          type="button"
          onClick={onBackToPortal}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
        >
          {language === 'he' ? 'חזרה למסך הבית' : 'Back to Home'}
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              showFeedback('global', language === 'he' ? 'תוכנית החוויה נשמרה בהצלחה בדפדפן' : 'Plan saved locally');
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs active:scale-95"
          >
            {language === 'he' ? 'שמור תוכנית חוויה' : 'Save Experience Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

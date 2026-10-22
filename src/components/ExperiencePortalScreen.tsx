import React, { useState } from 'react';
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
} from '../types/experience';
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
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  SlidersHorizontal,
} from 'lucide-react';

interface ExperiencePortalScreenProps {
  userProfile: UserProfile;
  contacts: ContactPerson[];
  savedGroups: SavedGroup[];
  onOpenPrivacyCenter: () => void;
  onNavigateToTripWizard: (initialData?: {
    title?: string;
    destination?: string;
    tripType?: 'solo' | 'couple' | 'friends' | 'family';
  }) => void;
  onExploreExistingTrips: () => void;
}

export const ExperiencePortalScreen: React.FC<ExperiencePortalScreenProps> = ({
  userProfile,
  contacts,
  savedGroups,
  onOpenPrivacyCenter,
  onNavigateToTripWizard,
  onExploreExistingTrips,
}) => {
  const { language, t } = useLanguage();

  // Core Request State
  const [freeText, setFreeText] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('culture_events');
  const [audience, setAudience] = useState<ActivityAudience>('couple');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(savedGroups[0]?.id || '');

  // Locations separation state
  const [locations, setLocations] = useState<LocationBreakdown>({
    permanentHome: userProfile.permanentHomeLocation || '',
    activityDepartureLocation: userProfile.defaultActivityDepartureLocation || '',
    destinationLocation: '',
    transportMode: 'car',
    isFlightRequired: false,
    departureAirport: '',
    destinationAirport: '',
  });

  // Timeframe
  const [timeframeText, setTimeframeText] = useState('');

  // Clarifications and understanding state
  const [analyzedSummary, setAnalyzedSummary] = useState<{
    detectedExperience: string;
    intendedAudience: string;
    departurePoint: string;
    destination: string;
    provenanceTags: { item: string; type: ProvenanceType; sourceNote: string }[];
    missingQuestions: string[];
    suggestedOptions: Array<{
      id: string;
      title: string;
      subtitle: string;
      venueOrCity: string;
      timing: string;
      transportNotes: string;
      category: string;
    }>;
  } | null>(null);

  // Quick preset queries for user testing and effortless exploration
  const handleApplyPreset = (presetText: string, cat: ActivityCategory, aud: ActivityAudience) => {
    setFreeText(presetText);
    setCategory(cat);
    setAudience(aud);
    handleAnalyzeRequest(presetText, cat, aud);
  };

  const handleAnalyzeRequest = (
    textToAnalyze: string = freeText,
    cat: ActivityCategory = category,
    aud: ActivityAudience = audience
  ) => {
    const text = textToAnalyze.trim();
    if (!text && cat !== 'surprise') {
      return;
    }

    // Determine if flights or international travel are implied
    const isFlightImplied =
      text.includes('אנדרה ריו') ||
      text.includes('אירופה') ||
      text.includes('חו"ל') ||
      text.includes('חו״ל') ||
      text.includes('טיסה') ||
      text.includes('וינה') ||
      cat === 'trips_vacations';

    const defaultTransport: TransportMode = isFlightImplied ? 'flight' : 'car';

    const newLocations: LocationBreakdown = {
      ...locations,
      isFlightRequired: isFlightImplied,
      transportMode: defaultTransport,
      destinationLocation: text.includes('אנדרה ריו')
        ? 'וינה / מאסטריכט, אירופה'
        : text.includes('מסעדה')
        ? 'תל אביב - מרכז'
        : locations.destinationLocation,
    };
    setLocations(newLocations);

    // Build intelligent parsing breakdown with explicit provenance tags
    let detectedExp = text || 'חוויה מותאמת לפי בחירה חופשית';
    let dest = newLocations.destinationLocation || (language === 'he' ? 'ייקבע לפי החוויה' : 'To be determined');
    let questions: string[] = [];
    let provenanceTags: { item: string; type: ProvenanceType; sourceNote: string }[] = [];

    if (text.includes('אנדרה ריו')) {
      detectedExp = 'קונצרט של אנדרה ריו ותזמורת יוהאן שטראוס (André Rieu World Tour)';
      dest = 'מאסטריכט (הולנד) או היכל וינר שטאדטהאלה (וינה, אוסטריה)';
      provenanceTags = [
        {
          item: 'מוזיקה קלאסית קלה / ואלסים',
          type: 'confirmed',
          sourceNote: 'צוין במפורש בבקשה החופשית שלך',
        },
        {
          item: 'יציאה זוגית רומנטית',
          type: 'confirmed',
          sourceNote: 'נבחרה הגדרת קהל: אני ובן/בת הזוג',
        },
        {
          item: 'העדפת טיסות סדירות או הגעה ברכבת',
          type: 'inferred',
          sourceNote: 'הסקה עקב מיקום האירוע באירופה — טעון אישור',
        },
        {
          item: 'עניין של בת הזוג בערב אלגנטי',
          type: 'estimate',
          sourceNote: 'מבוסס על הערכתך לגבי שותפתך לטיול',
        },
      ];
      questions = [
        language === 'he'
          ? 'האם תרצו לשלב קונצרט בעיר הולדתו מאסטריכט (פתוח תחת כיפת השמיים) או באולם קונצרטים בווינה?'
          : 'Do you prefer the open-air summer concert in Maastricht or an indoor concert hall in Vienna?',
        language === 'he'
          ? 'מה רמת הגמישות שלכם בתאריכי סוף השבוע?'
          : 'What is your flexibility for weekend dates?',
      ];
    } else if (text.includes('הערב') || text.includes('פנויים הערב')) {
      detectedExp = 'בילוי קולינרי/אינטימי זוגי להערב';
      dest = 'אזור המרכז / קרבת נקודת היציאה מהעבודה';
      provenanceTags = [
        {
          item: 'חלון זמן: הערב בלבד',
          type: 'confirmed',
          sourceNote: 'נמסר במפורש בטקסט',
        },
        {
          item: 'יציאה מיידית מנקודת העבודה/משרד',
          type: 'inferred',
          sourceNote: 'הסקה על בסיס נקודת יציאה שגרתית (רמת החייל)',
        },
        {
          item: 'העדפת אווירה שקטה לשיחה',
          type: 'estimate',
          sourceNote: 'הערכת העדפה לערב רגוע באמצע השבוע',
        },
      ];
      questions = [
        language === 'he'
          ? 'מהו סגנון הארוחה המועדף הערב? (שף ים-תיכוני, איטלקי או יין ונשנושים)'
          : 'What culinary style do you prefer tonight? (Mediterranean chef, Italian, or wine bar)',
      ];
    } else {
      provenanceTags = [
        {
          item: text || 'הצעה לפי טעם אישי',
          type: 'confirmed',
          sourceNote: 'הוזן על ידך במערכת',
        },
        {
          item: 'שמירה על שעות חזרה נוחות ללינה בבית',
          type: 'inferred',
          sourceNote: 'הסקה המבוססת על מגורים קבועים (תל אביב)',
        },
      ];
    }

    // Set curated relevant options
    const suggested = [
      {
        id: 'opt_1',
        title:
          cat === 'culture_events' || text.includes('אנדרה ריו')
            ? 'André Rieu & The Johann Strauss Orchestra'
            : cat === 'food_entertainment'
            ? 'שולחן אינטימי בבר יין וקולינריה עונתית'
            : 'סיור בוטיק וטעימות שקיעה',
        subtitle:
          text.includes('אנדרה ריו')
            ? 'חוויה מוזיקלית קסומה בווינה או מאסטריכט עם שילוב סיורי עיר'
            : 'אווירה שקטה, חומרי גלם מקומיים וחניה נוחה סמוך לנקודת המוצא',
        venueOrCity: dest,
        timing: text.includes('הערב') ? 'היום בשעה 20:30' : 'סוף שבוע קרוב או תאריכים לבחירה',
        transportNotes: isFlightImplied
          ? 'דורש טיסה ישירה (TLV -> VIE / AMS)'
          : 'נסיעה קצרה של 15-20 דקות מנקודת המוצא',
        category: cat,
      },
      {
        id: 'opt_2',
        title:
          cat === 'culture_events' || text.includes('אנדרה ריו')
            ? 'סופשבוע מוזיקה ואמנות במרכז התרבות הבינלאומי'
            : 'ארוחת טעימות שף סודית בהזמנה מראש',
        subtitle: 'התאמה מלאה להעדפות הקבוצה ללא התנגשויות אילוצים',
        venueOrCity: dest,
        timing: 'גמיש — בהתאם ללוח המועדים שלך',
        transportNotes: isFlightImplied ? 'טיסה קצרה או שילוב רכבת מהירה' : 'הגעה ברכב פרטי',
        category: cat,
      },
    ];

    setAnalyzedSummary({
      detectedExperience: detectedExp,
      intendedAudience:
        aud === 'couple'
          ? 'אני ובן/בת הזוג'
          : aud === 'solo'
          ? 'עבורי בלבד'
          : aud === 'saved_group'
          ? 'קבוצה קבועה'
          : 'התאמה אישית',
      departurePoint: locations.activityDepartureLocation || 'משרד / נקודת מוצא שגרתית',
      destination: dest,
      provenanceTags,
      missingQuestions: questions,
      suggestedOptions: suggested,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Top Welcome & Philosophy Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-stone-900 via-stone-850 to-amber-950 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'he' ? 'חוויה לפני לוגיסטיקה' : 'Experience Before Logistics'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {language === 'he'
              ? 'מה תרצו לחוות ולעשות ביחד?'
              : 'What experience would you love to create?'}
          </h1>

          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            {language === 'he'
              ? 'אינכם צריכים להתחיל בחיפוש טיסות או שדות תעופה. ספרו במילים שלכם מה מתחשק לכם — הופעה מיוחדת, מסעדה שקטה להערב, סופשבוע תרבות או חופשה מלאה.'
              : 'No need to begin with flight searches or dates. Describe what you feel like in plain words — a concert, a quiet dinner tonight, or a full weekend getaway.'}
          </p>

          {/* Quick links to Privacy Center and Existing Trips */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenPrivacyCenter}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-100 text-xs font-bold transition-all border border-white/15 cursor-pointer backdrop-blur-xs"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{language === 'he' ? 'מרכז פרטיות ואימות נתונים' : 'Privacy & Data Center'}</span>
            </button>

            <button
              type="button"
              onClick={onExploreExistingTrips}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-700/80 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>{language === 'he' ? 'רשימת תוכניות הטיול השמורות' : 'Saved Trips & Plans'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Experience Request Builder */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-8 shadow-sm space-y-6">
        {/* Step 1: Natural Language Free Expression */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-stone-900">
            {language === 'he'
              ? 'ספרו למערכת בשפה חופשית מה תרצו לעשות:'
              : 'Describe what you want in plain words:'}
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder={
                language === 'he'
                  ? 'לדוגמה: "אשתי ואני פנויים הערב למשהו אינטימי ורגוע", "אני רוצה לראות הופעה של אנדרה ריו באירופה", או "יש לנו 4 ימים לחופשת סתיו רגועה"...'
                  : 'e.g. "My partner and I are free tonight for a quiet dinner", "I want to see André Rieu in Europe", or "We have 4 days for a relaxed trip"...'
              }
              className="w-full p-4 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-800 focus:border-amber-800 transition-all text-stone-900 placeholder:text-stone-400"
            />
          </div>

          {/* Quick preset suggestions */}
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs text-stone-600">
            <span className="font-semibold text-stone-500">
              {language === 'he' ? 'דוגמאות לבדיקה מהירה:' : 'Quick Examples:'}
            </span>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset(
                  'אני רוצה לראות הופעה של אנדרה ריו ותזמורת יוהאן שטראוס באירופה בסתיו הקרוב',
                  'culture_events',
                  'couple'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
            >
              🎻 {language === 'he' ? 'הופעה של אנדרה ריו באירופה' : 'André Rieu in Europe'}
            </button>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset(
                  'אשתי ואני פנויים הערב, מחפשים מסעדה שקטה עם אוכל טוב ושיחה נעימה',
                  'food_entertainment',
                  'couple'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
            >
              🍷 {language === 'he' ? 'אשתי ואני פנויים הערב' : 'Free tonight with partner'}
            </button>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset(
                  'יש לנו ארבעה ימים פנויים ואנחנו רוצים חופשה נעימה בטבע עם הילדים',
                  'trips_vacations',
                  'saved_group'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
            >
              🏕️ {language === 'he' ? 'חופשה של ארבעה ימים' : '4-day family getaway'}
            </button>
          </div>
        </div>

        {/* 4 Core Category Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-stone-900">
            {language === 'he' ? 'סוג החוויה המבוקשת:' : 'Type of Experience:'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Surprise me */}
            <button
              type="button"
              onClick={() => setCategory('surprise')}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                category === 'surprise'
                  ? 'border-amber-800 bg-amber-50/70 text-amber-900 font-bold shadow-xs'
                  : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold">
                {language === 'he' ? 'תפתיע אותי' : 'Surprise Me'}
              </span>
            </button>

            {/* Culture & Events */}
            <button
              type="button"
              onClick={() => setCategory('culture_events')}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                category === 'culture_events'
                  ? 'border-amber-800 bg-amber-50/70 text-amber-900 font-bold shadow-xs'
                  : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold">
                {language === 'he' ? 'תרבות ואירועים' : 'Culture & Events'}
              </span>
            </button>

            {/* Food & Entertainment */}
            <button
              type="button"
              onClick={() => setCategory('food_entertainment')}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                category === 'food_entertainment'
                  ? 'border-amber-800 bg-amber-50/70 text-amber-900 font-bold shadow-xs'
                  : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold">
                {language === 'he' ? 'אוכל ובילויים' : 'Food & Nightlife'}
              </span>
            </button>

            {/* Trips & Vacations */}
            <button
              type="button"
              onClick={() => setCategory('trips_vacations')}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                category === 'trips_vacations'
                  ? 'border-amber-800 bg-amber-50/70 text-amber-900 font-bold shadow-xs'
                  : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                <Plane className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold">
                {language === 'he' ? 'טיולים וחופשות' : 'Trips & Vacations'}
              </span>
            </button>
          </div>
        </div>

        {/* Audience Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-stone-900">
            {language === 'he' ? 'עבור מי הפעילות?' : 'Who is this experience for?'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => setAudience('solo')}
              className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                audience === 'solo'
                  ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{language === 'he' ? 'עבורי (יחיד)' : 'For Me (Solo)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAudience('couple')}
              className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                audience === 'couple'
                  ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>{language === 'he' ? 'אני ובן/בת הזוג' : 'Partner & Me'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAudience('saved_group')}
              className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                audience === 'saved_group'
                  ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{language === 'he' ? 'קבוצה קבועה' : 'Saved Group'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAudience('custom')}
              className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                audience === 'custom'
                  ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{language === 'he' ? 'בחירת משתתפים' : 'Custom People'}</span>
            </button>
          </div>
        </div>

        {/* Explicit Location Separation Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-800" />
              <span>
                {language === 'he'
                  ? 'הקשר גיאוגרפי (הפרדה בין מגורים, נקודת יציאה ויעד)'
                  : 'Geographic Context (Home vs. Departure vs. Destination)'}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            {/* Permanent Home */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700">
                {language === 'he' ? 'מגורים קבועים:' : 'Permanent Home:'}
              </label>
              <input
                type="text"
                value={locations.permanentHome}
                onChange={(e) => setLocations({ ...locations, permanentHome: e.target.value })}
                placeholder={language === 'he' ? 'תל אביב, ישראל' : 'Tel Aviv, Israel'}
                className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 text-xs"
              />
            </div>

            {/* Departure point for this activity */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700">
                {language === 'he' ? 'נקודת יציאה לפעילות זו:' : 'Departure point for this event:'}
              </label>
              <input
                type="text"
                value={locations.activityDepartureLocation}
                onChange={(e) =>
                  setLocations({ ...locations, activityDepartureLocation: e.target.value })
                }
                placeholder={
                  language === 'he'
                    ? 'לדוגמה: משרד (רמת החייל) / בית'
                    : 'e.g. Office / Work / Home'
                }
                className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 text-xs"
              />
            </div>

            {/* Target Venue / City */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700">
                {language === 'he' ? 'יעד מבוקש (אם קיים):' : 'Destination (if known):'}
              </label>
              <input
                type="text"
                value={locations.destinationLocation}
                onChange={(e) =>
                  setLocations({ ...locations, destinationLocation: e.target.value })
                }
                placeholder={language === 'he' ? 'עיר / אולם / ארץ' : 'City / Venue / Country'}
                className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 text-xs"
              />
            </div>
          </div>

          {/* Transportation Mode */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-stone-700">
              {language === 'he' ? 'אמצעי תחבורה צפוי:' : 'Expected Mode of Transportation:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setLocations({ ...locations, transportMode: 'car', isFlightRequired: false })}
                className={`p-2 rounded-xl border text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                  locations.transportMode === 'car'
                    ? 'bg-amber-800 text-white border-amber-800 font-bold'
                    : 'bg-white text-stone-700 border-stone-200'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>{language === 'he' ? 'רכב פרטי' : 'Private Car'}</span>
              </button>

              <button
                type="button"
                onClick={() => setLocations({ ...locations, transportMode: 'walk', isFlightRequired: false })}
                className={`p-2 rounded-xl border text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                  locations.transportMode === 'walk'
                    ? 'bg-amber-800 text-white border-amber-800 font-bold'
                    : 'bg-white text-stone-700 border-stone-200'
                }`}
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>{language === 'he' ? 'הליכה ברגל' : 'Walking'}</span>
              </button>

              <button
                type="button"
                onClick={() => setLocations({ ...locations, transportMode: 'transit_train', isFlightRequired: false })}
                className={`p-2 rounded-xl border text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                  locations.transportMode === 'transit_train'
                    ? 'bg-amber-800 text-white border-amber-800 font-bold'
                    : 'bg-white text-stone-700 border-stone-200'
                }`}
              >
                <Train className="w-3.5 h-3.5" />
                <span>{language === 'he' ? 'תחבורה / רכבת' : 'Transit / Train'}</span>
              </button>

              <button
                type="button"
                onClick={() => setLocations({ ...locations, transportMode: 'flight', isFlightRequired: true })}
                className={`p-2 rounded-xl border text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                  locations.transportMode === 'flight'
                    ? 'bg-amber-800 text-white border-amber-800 font-bold'
                    : 'bg-white text-stone-700 border-stone-200'
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>{language === 'he' ? 'טיסה בינלאומית' : 'Flight'}</span>
              </button>
            </div>
          </div>

          {/* Airport search ONLY when flight is required */}
          {locations.isFlightRequired && (
            <div className="pt-3 border-t border-stone-200 space-y-3">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Plane className="w-4 h-4 text-amber-800" />
                <span>
                  {language === 'he'
                    ? 'בחירת שדות תעופה (מופעל רק עבור נסיעות הכוללות טיסות)'
                    : 'Airport Selection (Activated only when flights are involved)'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AirportSearchInput
                  label={language === 'he' ? 'שדה תעופה יציאה:' : 'Departure Airport:'}
                  value={locations.departureAirport || ''}
                  onChange={(val) => setLocations({ ...locations, departureAirport: val })}
                  placeholder={
                    language === 'he'
                      ? 'לדוגמה: נתב"ג (TLV)...'
                      : 'e.g. Tel Aviv Ben Gurion (TLV)...'
                  }
                />
                <AirportSearchInput
                  label={language === 'he' ? 'שדה תעופה יעד:' : 'Destination Airport:'}
                  value={locations.destinationAirport || ''}
                  onChange={(val) => setLocations({ ...locations, destinationAirport: val })}
                  placeholder={
                    language === 'he'
                      ? 'לדוגמה: מילאנו מלפנזה (MXP), וינה (VIE)...'
                      : 'e.g. Milan Malpensa (MXP), Vienna (VIE)...'
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button: Analyze Request */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-stone-500">
            {language === 'he'
              ? 'המערכת תציג את הבנתה ותבדוק אם חסרים פרטים חיוניים'
              : 'The system will show its interpretation and verify missing essentials'}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {category === 'trips_vacations' && (
              <button
                type="button"
                onClick={() =>
                  onNavigateToTripWizard({
                    title: freeText || (language === 'he' ? 'טיול חופשה מתוכנן' : 'Planned Vacation'),
                    destination: locations.destinationLocation || '',
                    tripType: audience === 'couple' ? 'couple' : audience === 'solo' ? 'solo' : 'friends',
                  })
                }
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{language === 'he' ? 'מעבר לתכנון מסע רב-שלבי' : 'Open Multi-Step Planner'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleAnalyzeRequest()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{language === 'he' ? 'פיענוח הבקשה והתאמת חוויות' : 'Analyze Request & Match'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Intelligent Request Understanding & Provenance Breakdown */}
      {analyzedSummary && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  {language === 'he' ? 'הבנת המערכת ואימות נתונים' : 'System Understanding & Data Provenance'}
                </h2>
                <p className="text-xs text-stone-500">
                  {language === 'he'
                    ? 'בדיקת ההסקה, ההערכות והמידע המאושר טרם בחירת הפעילות'
                    : 'Verify inferred, estimated, and confirmed data before finalizing'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenPrivacyCenter}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'he' ? 'ניהול הרשאות מלא' : 'Full Permissions'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>

          {/* Key Facts Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 block">
                {language === 'he' ? 'החוויה שזוהתה:' : 'Detected Experience:'}
              </span>
              <span className="font-bold text-sm text-stone-900">
                {analyzedSummary.detectedExperience}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 block">
                {language === 'he' ? 'קהל היעד:' : 'Intended Audience:'}
              </span>
              <span className="font-bold text-sm text-stone-900">
                {analyzedSummary.intendedAudience}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 block">
                {language === 'he' ? 'יעד / מיקום מתוכנן:' : 'Planned Destination:'}
              </span>
              <span className="font-bold text-sm text-stone-900">
                {analyzedSummary.destination}
              </span>
            </div>
          </div>

          {/* Provenance Tags breakdown */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-900 block">
              {language === 'he'
                ? 'סיווג מקורות המידע והאמינות (שקיפות מלאה):'
                : 'Data Provenance & Reliability Classification (Full Transparency):'}
            </span>
            <div className="space-y-2">
              {analyzedSummary.provenanceTags.map((tag, idx) => {
                const badge = PROVENANCE_DETAILS[tag.type];
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-stone-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-stone-900 text-xs sm:text-sm">{tag.item}</span>
                      <p className="text-[11px] text-stone-500">{tag.sourceNote}</p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border self-start sm:self-center shrink-0 ${badge.colorClass}`}
                    >
                      {language === 'he' ? badge.labelHe : badge.labelEn}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Missing Questions (Only genuinely missing info per requirements) */}
          {analyzedSummary.missingQuestions.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <HelpCircle className="w-4 h-4 text-amber-800" />
                <span>
                  {language === 'he'
                    ? 'שאלות הבהרה חיוניות (המערכת שואלת רק מה שבאמת נחוץ):'
                    : 'Essential Clarification Questions (Asked only when strictly missing):'}
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-amber-950 font-medium">
                {analyzedSummary.missingQuestions.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Matching Experiences */}
          <div className="space-y-3 pt-2">
            <span className="text-sm font-bold text-stone-900 block">
              {language === 'he' ? 'הצעות פעילות רלוונטיות לבחירתכם:' : 'Relevant Experience Matches:'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analyzedSummary.suggestedOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-amber-700 transition-all shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="font-bold text-sm text-stone-900 block">{opt.title}</span>
                    <p className="text-xs text-stone-600 leading-relaxed">{opt.subtitle}</p>

                    <div className="pt-1 flex flex-col gap-1 text-[11px] text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-800" />
                        <span>{opt.venueOrCity}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-800" />
                        <span>{opt.timing}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-500 font-medium">{opt.transportNotes}</span>
                    <button
                      type="button"
                      onClick={() =>
                        onNavigateToTripWizard({
                          title: opt.title,
                          destination: opt.venueOrCity,
                          tripType: audience === 'couple' ? 'couple' : 'friends',
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-amber-800 text-white font-bold text-xs hover:bg-amber-900 cursor-pointer transition-colors"
                    >
                      {language === 'he' ? 'בחר פעילות זו' : 'Select Experience'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

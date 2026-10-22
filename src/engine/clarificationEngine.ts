import {
  UserProfile,
  ContactPerson,
  ClarificationQuestion,
  LocationBreakdown,
  ActivityAudience,
} from '../types/experience';

interface KnownContext {
  experienceType?: string;
  audienceType?: ActivityAudience;
  departureLocation?: string;
  destinationLocation?: string;
  timeframeText?: string;
  isFood?: boolean;
  isMusic?: boolean;
  isTrip?: boolean;
  isFlightConfirmed?: boolean;
  userProfile?: UserProfile;
  contacts?: ContactPerson[];
}

/**
 * Clarification Engine:
 * Identifies what essential information is missing and formulates the single next
 * most important question, avoiding questions about details already known with certainty.
 */
export function identifyNextClarificationQuestion(context: KnownContext): ClarificationQuestion | null {
  const {
    experienceType,
    audienceType,
    departureLocation,
    destinationLocation,
    timeframeText,
    isFood,
    isMusic,
    isTrip,
    userProfile,
  } = context;

  // 1. If the core experience type / intention is completely unknown:
  // e.g. "אשתי ואני לבד הערב, מה אתה מציע?" or "אנחנו פנויים הערב"
  if (!experienceType && !isFood && !isMusic && !isTrip) {
    return {
      id: 'q_experience_nature',
      questionHe: 'מתחשק לכם אוכל טוב, הופעה מוזיקלית, טיול קצר או משהו אחר?',
      questionEn: 'Do you feel like good food, a live concert, a scenic stroll, or something else?',
      contextNoteHe: 'הבהרת אופי הפעילות תאפשר לנו למקד את ההצעות המדויקות ביותר עבורכם.',
      contextNoteEn: 'Clarifying the nature of the evening allows us to target exact matches.',
      targetField: 'experienceType',
      options: [
        { id: 'opt_food', labelHe: 'אוכל ומסעדה טובה 🍷', labelEn: 'Dinner & Food', payloadValue: 'food' },
        { id: 'opt_music', labelHe: 'מוזיקה / הופעה חיה 🎵', labelEn: 'Live Music / Show', payloadValue: 'music' },
        { id: 'opt_walk', labelHe: 'טיול קצר ואווירה נעימה 🌿', labelEn: 'Scenic Stroll / Chill', payloadValue: 'stroll' },
        { id: 'opt_surprise', labelHe: 'רעיון מפתיע אחר ✨', labelEn: 'Something else surprising', payloadValue: 'surprise' },
      ],
      allowFreeText: true,
    };
  }

  // 2. If it's food/dinner, but we don't know the departure location or preferred area:
  const profileDeparture = userProfile?.defaultActivityDepartureLocation?.trim();
  const activeDeparture = departureLocation?.trim();
  const hasKnownDeparture = !!activeDeparture || !!profileDeparture;

  if (isFood && !hasKnownDeparture) {
    return {
      id: 'q_departure_area',
      questionHe: 'מאיזה אזור או עיר אתם יוצאים הערב?',
      questionEn: 'Which area or city are you departing from tonight?',
      contextNoteHe: 'חשוב לנו לדעת מהיכן אתם מתחילים (עבודה, בית או אזור אחר) כדי למנוע נסיעות מיותרות.',
      contextNoteEn: 'Helps us ensure we recommend places near your starting point without excessive travel.',
      targetField: 'departureLocation',
      options: [
        { id: 'opt_telaviv', labelHe: 'תל אביב והסביבה', labelEn: 'Tel Aviv area', payloadValue: 'תל אביב' },
        { id: 'opt_center', labelHe: 'אזור המרכז / גוש דן', labelEn: 'Central District', payloadValue: 'מרכז' },
        { id: 'opt_jerusalem', labelHe: 'ירושלים', labelEn: 'Jerusalem', payloadValue: 'ירושלים' },
        { id: 'opt_north', labelHe: 'חיפה והצפון', labelEn: 'Haifa & North', payloadValue: 'חיפה והצפון' },
        { id: 'opt_south', labelHe: 'השפלה והדרום', labelEn: 'South & Lowlands', payloadValue: 'דרום' },
      ],
      allowFreeText: true,
    };
  }

  // 3. If it's food and departure is known, but culinary style / dietary is unknown:
  const hasDietaryKnown =
    userProfile?.preferences.some((p) => p.category === 'dietary' && p.provenance === 'confirmed') || false;

  if (isFood && !hasDietaryKnown) {
    return {
      id: 'q_culinary_vibe',
      questionHe: 'איזה סגנון קולינרי או אווירה מדברים אליכם?',
      questionEn: 'What culinary style or vibe appeals to you?',
      targetField: 'culinaryVibe',
      options: [
        { id: 'opt_italian', labelHe: 'איטלקי / פסטה ויין', labelEn: 'Italian / Pasta & Wine', payloadValue: 'italian' },
        { id: 'opt_chef', labelHe: 'שף ים-תיכוני עדכני', labelEn: 'Mediterranean Chef', payloadValue: 'mediterranean' },
        { id: 'opt_kosher', labelHe: 'כשר (חלבי / דגים)', labelEn: 'Kosher (Dairy/Fish)', payloadValue: 'kosher' },
        { id: 'opt_casual', labelHe: 'בר יין ונשנושים שקטים', labelEn: 'Quiet Wine Bar', payloadValue: 'wine_bar' },
      ],
      allowFreeText: true,
    };
  }

  // 4. If it's a vacation/trip, but destination type / style is unknown:
  if (isTrip && !destinationLocation) {
    return {
      id: 'q_trip_direction',
      questionHe: 'האם אתם מכוונים לחופשה בארץ או לנסיעה לחו״ל?',
      questionEn: 'Are you aiming for a domestic getaway or an international trip?',
      contextNoteHe: 'לא נניח אוטומטית שדרושה טיסה, אלא אם תחליטו על כך במפורש.',
      contextNoteEn: 'We will never automatically assume a flight is needed unless you choose so.',
      targetField: 'tripScope',
      options: [
        { id: 'opt_domestic', labelHe: 'חופשה בארץ (ברכב / תחבורה מקומית)', labelEn: 'Domestic (Car/Transit)', payloadValue: 'domestic' },
        { id: 'opt_abroad', labelHe: 'נסיעה לחו״ל (כולל טיסה)', labelEn: 'International (Flight)', payloadValue: 'abroad' },
        { id: 'opt_open', labelHe: 'פתוחים לשתי האפשרויות לפי האטרקטיביות', labelEn: 'Open to both', payloadValue: 'open' },
      ],
      allowFreeText: false,
    };
  }

  // No blocking clarification needed for now
  return null;
}

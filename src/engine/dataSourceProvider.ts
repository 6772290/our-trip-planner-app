import { ConceptualIdea, RequestStatus } from '../types/experience';

export interface DataSourceStatus {
  isExternalEventsApiConnected: boolean;
  isTableBookingApiConnected: boolean;
  isFlightSearchApiConnected: boolean;
  providerMode: 'local_zero_cost' | 'external_api_optional';
}

export const CURRENT_DATA_SOURCE_STATUS: DataSourceStatus = {
  isExternalEventsApiConnected: false,
  isTableBookingApiConnected: false,
  isFlightSearchApiConnected: false,
  providerMode: 'local_zero_cost',
};

/**
 * Generates purely conceptual ideas with mandatory explicit disclaimers.
 * Never presents any idea as verified real-time availability.
 */
export function generateConceptualInspirations(
  category: string,
  artistMentioned?: string,
  locationHint?: string
): ConceptualIdea[] {
  const ideas: ConceptualIdea[] = [];

  if (artistMentioned) {
    ideas.push({
      id: 'concept_artist',
      titleHe: `הופעה של ${artistMentioned} (רעיון להגדרה וחיפוש)`,
      titleEn: `Concert by ${artistMentioned} (Search concept)`,
      category: 'מוזיקה ותרבות',
      descriptionHe: `המערכת זיהתה רצון לצפות ב-${artistMentioned}. מאחר שאין כרגע חיבור חי ללוח סיבובי ההופעות הרשמי של האמן, לא נציג תאריכים או אולמות מומצאים. יש לבדוק במועדים רשמיים כאשר יחובר שירות כרטיסים.`,
      descriptionEn: `System identified intention to see ${artistMentioned}. Since live ticketing is not currently connected, no fabricated tour dates or venues are displayed.`,
      locationHe: locationHint || 'בכפוף ללוח ההופעות הרשמי',
      locationEn: locationHint || 'Subject to official tour dates',
      disclaimerHe: '⚠️ רעיון קונספטואלי בלבד: אין כרגע מקור מידע מחובר לזמני מופעים וכרטיסים. תאריכים לא נבדקו.',
      disclaimerEn: '⚠️ Conceptual idea only: No live ticketing data connected. Tour dates are not verified.',
      isVerified: false,
    });
  } else if (category === 'food' || category === 'food_entertainment') {
    ideas.push({
      id: 'concept_culinary',
      titleHe: 'ארוחת ערב בבר יין אינטימי או מסעדת שף',
      titleEn: 'Dinner at an intimate wine bar or chef restaurant',
      category: 'קולינריה ובילוי',
      descriptionHe: 'כיוון כללי של ערב שקט לשיחה עם מנות עונתיות ותאורה נעימה בקרבת נקודת היציאה.',
      descriptionEn: 'General concept of a quiet conversation dinner with seasonal dishes near departure point.',
      locationHe: locationHint || 'ייקבע לפי נקודת היציאה',
      locationEn: locationHint || 'Based on departure point',
      disclaimerHe: '⚠️ רעיון השראה בלבד: אין כרגע חיבור למערכת הזמנת שולחנות. זמינות מקומות טרם אומתה.',
      disclaimerEn: '⚠️ Concept only: Table booking API is not connected. Availability has not been verified.',
      isVerified: false,
    });
  } else if (category === 'stroll' || category === 'walk') {
    ideas.push({
      id: 'concept_stroll',
      titleHe: 'סיור ערב רגוע ואווירה נעימה',
      titleEn: 'Relaxed evening walk with pleasant ambiance',
      category: 'פנאי ואווירה',
      descriptionHe: 'יציאה רגלית לאזור מואר, טיילת או סמטאות ציוריות ללא צורך בהזמנה מראש.',
      descriptionEn: 'Walk through a scenic promenade or quiet alleys requiring no advance reservations.',
      locationHe: locationHint || 'סביבת נקודת המוצא',
      locationEn: locationHint || 'Near starting point',
      disclaimerHe: 'רעיון פתוח — אינו מצריך שירותים חיצוניים.',
      disclaimerEn: 'Open concept — does not require external booking services.',
      isVerified: false,
    });
  } else {
    ideas.push({
      id: 'concept_general',
      titleHe: 'כיוון ראשוני לחופשה מותאמת אישית',
      titleEn: 'Initial custom getaway direction',
      category: 'טיולים ופנאי',
      descriptionHe: 'גיבוש חלונות זמן נוחים ובדיקת אילוצי הקבוצה באשף הטיולים.',
      descriptionEn: 'Formulating time windows and reviewing constraints in the trip wizard.',
      locationHe: locationHint || 'בבחירה חופשית',
      locationEn: locationHint || 'Open choice',
      disclaimerHe: 'רעיון קונספטואלי בלבד — כרטיסי טיסה ומלונות יבדקו בעתיד.',
      disclaimerEn: 'Conceptual idea only — flight tickets and hotels to be checked in future phases.',
      isVerified: false,
    });
  }

  return ideas;
}

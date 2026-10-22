import { ConstraintItem, TimeWindow, CertaintyLevel } from '../types/experience';

/**
 * Constraint Engine:
 * Analyzes natural text and explicit inputs to detect hard constraints vs soft preferences,
 * alternative time windows, and religious/boundary conditions.
 */
export function extractConstraintsAndWindows(
  text: string,
  existingConstraints: ConstraintItem[] = []
): {
  constraints: ConstraintItem[];
  timeWindows: TimeWindow[];
  isHardDeadlinePresent: boolean;
} {
  const clean = text.trim();
  const lower = clean.toLowerCase();
  const constraints: ConstraintItem[] = [...existingConstraints];
  const timeWindows: TimeWindow[] = [];

  let isHardDeadlinePresent = false;

  // 1. Timeframe & Multiple Windows Analysis
  if (
    clean.includes('אחד משני שבועות') ||
    clean.includes('שני שבועות') ||
    clean.includes('או בשבוע שאחריו') ||
    clean.includes('שתי אפשרויות')
  ) {
    timeWindows.push({
      id: 'win_1',
      label: 'חלון א׳: שבוע ראשון (גמיש)',
      durationDaysMin: 4,
      durationDaysMax: 4,
      isFlexible: true,
    });
    timeWindows.push({
      id: 'win_2',
      label: 'חלון ב׳: שבוע עוקב (חלופי)',
      durationDaysMin: 4,
      durationDaysMax: 4,
      isFlexible: true,
    });
    constraints.push({
      id: 'c_multi_window',
      type: 'timeframe',
      descriptionHe: 'חלון גמיש של 4 ימים באחד מתוך שני שבועות חלופיים',
      descriptionEn: 'Flexible 4-day window across two alternative weeks',
      isHardConstraint: true, // Choosing one of the two windows is a hard requirement
      certainty: 'explicit',
      sourceText: text,
    });
  } else if (clean.includes('ארבעה ימים') || clean.includes('4 ימים')) {
    timeWindows.push({
      id: 'win_single',
      label: 'חופשה של 4 ימים',
      durationDaysMin: 4,
      durationDaysMax: 4,
      isFlexible: true,
    });
  } else if (clean.includes('הערב') || clean.includes('הלילה')) {
    timeWindows.push({
      id: 'win_tonight',
      label: 'הערב בלבד',
      durationDaysMin: 0,
      durationDaysMax: 1,
      isFlexible: false,
    });
    constraints.push({
      id: 'c_tonight',
      type: 'timeframe',
      descriptionHe: 'יציאה להערב בלבד (חלון זמן מיידי)',
      descriptionEn: 'Tonight only (Immediate timeframe)',
      isHardConstraint: true,
      certainty: 'explicit',
      sourceText: text,
    });
  }

  // 2. Shabbat / Religious Constraints
  if (
    clean.includes('לפני שבת') ||
    clean.includes('חייב לחזור לפני שבת') ||
    clean.includes('שומר שבת') ||
    clean.includes('שבת')
  ) {
    constraints.push({
      id: 'c_shabbat_return',
      type: 'shabbat_holiday',
      descriptionHe: 'חובה לחזור הביתה לפני כניסת שבת (אילוץ הלכתי מחייב)',
      descriptionEn: 'Mandatory return home prior to Shabbat candle-lighting',
      isHardConstraint: true,
      certainty: 'explicit',
      sourceText: text,
    });
    isHardDeadlinePresent = true;
  }

  // 3. Dietary & Kosher constraints
  if (clean.includes('כשר') || clean.includes('חלבי או דגים') || clean.includes('כשרה')) {
    const isDairyOrFish = clean.includes('חלבי') || clean.includes('דגים');
    constraints.push({
      id: 'c_kosher',
      type: 'dietary_kosher',
      descriptionHe: isDairyOrFish
        ? 'מסעדה כשרה, בדגש על חלבי או דגים (אילוץ מחייב)'
        : 'הקפדה על כשרות (אילוץ מחייב)',
      descriptionEn: isDairyOrFish
        ? 'Kosher restaurant, dairy or fish focus (Mandatory)'
        : 'Kosher supervision required (Mandatory)',
      isHardConstraint: true,
      certainty: 'explicit',
      sourceText: text,
    });
  }

  // 4. Strict arrival / Presence deadline (e.g. "חייב להיות בפירנצה ביום מסוים בשעה מסוימת")
  if (
    clean.includes('חייב להיות') ||
    clean.includes('חייבת להגיע') ||
    clean.includes('פירנצה') ||
    clean.includes('בשעה')
  ) {
    if (clean.includes('פירנצה')) {
      constraints.push({
        id: 'c_florence_presence',
        type: 'location_destination',
        descriptionHe: 'נוכחות מחייבת בפירנצה במועד המבוקש (אילוץ קשיח בלתי מתפשר)',
        descriptionEn: 'Mandatory presence in Florence at designated time (Hard constraint)',
        isHardConstraint: true,
        certainty: 'explicit',
        sourceText: text,
      });
      isHardDeadlinePresent = true;
    }
  }

  // 5. Optimization goal: Longest possible vacation
  if (clean.includes('הארוכה ביותר') || clean.includes('מקסימום ימים') || clean.includes('כמה שיותר ארוך')) {
    constraints.push({
      id: 'c_max_duration',
      type: 'timeframe',
      descriptionHe: 'העדפת מיצוי מקסימלי של אורך החופשה (העדפת אופטימיזציה גמישה)',
      descriptionEn: 'Preference for longest possible duration (Soft optimization preference)',
      isHardConstraint: false, // Soft preference!
      certainty: 'explicit',
      sourceText: text,
    });
  }

  // 6. Specific artist regardless of country
  if (
    clean.includes('אנדרה ריו') ||
    clean.includes('andre rieu') ||
    clean.includes('לא משנה באיזו מדינה') ||
    clean.includes('הופעה של אמן')
  ) {
    const artistName = clean.includes('אנדרה ריו') || clean.includes('andre rieu') ? 'אנדרה ריו (André Rieu)' : 'אמן מבוקש';
    constraints.push({
      id: 'c_artist_agnostic_country',
      type: 'artist_event',
      descriptionHe: `צפייה בהופעה של ${artistName} — פתוח לכל מדינה שבה מתקיים מופע רשמי`,
      descriptionEn: `See performance by ${artistName} — country-agnostic`,
      isHardConstraint: true,
      certainty: 'explicit',
      sourceText: text,
    });
  }

  return {
    constraints,
    timeWindows,
    isHardDeadlinePresent,
  };
}

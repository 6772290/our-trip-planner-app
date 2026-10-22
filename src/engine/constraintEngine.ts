import { ConstraintItem, TimeWindow } from '../types/experience';

function extractExplicitDuration(text: string): { min?: number; max?: number; isFlexible: boolean } | null {
  const clean = text.trim();
  if (clean.includes('יומיים') || clean.includes('2 ימים')) {
    return { min: 2, max: 2, isFlexible: false };
  }
  if (clean.includes('שלושה ימים') || clean.includes('3 ימים')) {
    return { min: 3, max: 3, isFlexible: false };
  }
  if (clean.includes('ארבעה ימים') || clean.includes('4 ימים')) {
    return { min: 4, max: 4, isFlexible: false };
  }
  if (clean.includes('חמישה ימים') || clean.includes('5 ימים')) {
    return { min: 5, max: 5, isFlexible: false };
  }
  if (clean.includes('שבוע פנוי') && clean.includes('לא חייבים לנצל את כולו')) {
    return { min: undefined, max: 7, isFlexible: true };
  }
  if (clean.includes('סופשבוע') || clean.includes('סופ״ש')) {
    return { min: 2, max: 3, isFlexible: true };
  }
  // Check standalone "שבוע" or "שבעה ימים" ONLY if not talking about multiple alternative weeks
  if (
    !clean.includes('שבועות') &&
    !clean.includes('שני שבועות') &&
    (clean.includes('שבוע אחד') || clean.includes('שבעה ימים') || clean.includes('7 ימים'))
  ) {
    return { min: 7, max: 7, isFlexible: false };
  }
  const match = clean.match(/(\d+)\s*(?:ימים|יום)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (!isNaN(num) && num > 0) {
      return { min: num, max: num, isFlexible: false };
    }
  }
  return null;
}

function extractPresenceConstraint(clean: string): {
  isMandatory: boolean;
  destination: string;
  targetDate?: string;
  targetTime?: string;
} | null {
  let destination = '';
  if (clean.includes('פירנצה')) destination = 'פירנצה';
  else if (clean.includes('רומא')) destination = 'רומא';
  else if (clean.includes('מילאנו')) destination = 'מילאנו';
  else if (clean.includes('לונדון')) destination = 'לונדון';
  else if (clean.includes('פריז')) destination = 'פריז';

  if (!destination) return null;

  // Strict requirement language check
  const isMandatory =
    clean.includes('חייב להיות') ||
    clean.includes('חייבת להיות') ||
    clean.includes('חייב להגיע') ||
    clean.includes('חייבת להגיע') ||
    clean.includes('נוכחות חובה') ||
    clean.includes('מחויב להגיע');

  let targetDate: string | undefined = undefined;
  if (clean.includes('יום שלישי')) targetDate = 'יום שלישי';
  else if (clean.includes('יום שני')) targetDate = 'יום שני';
  else if (clean.includes('יום רביעי')) targetDate = 'יום רביעי';
  else if (clean.includes('יום חמישי')) targetDate = 'יום חמישי';
  else if (clean.includes('יום שישי')) targetDate = 'יום שישי';
  else if (clean.includes('יום ראשון')) targetDate = 'יום ראשון';

  let targetTime: string | undefined = undefined;
  const timeMatch = clean.match(/(?:בשעה\s*)?(\d{1,2}:\d{2})/);
  if (timeMatch) {
    targetTime = timeMatch[1];
  }

  return {
    isMandatory,
    destination,
    targetDate,
    targetTime,
  };
}

/**
 * Constraint Engine:
 * Analyzes natural text and explicit inputs to detect hard constraints vs soft preferences,
 * alternative time windows without fabricating durations, and religious/boundary conditions.
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
  const constraints: ConstraintItem[] = [...existingConstraints];
  const timeWindows: TimeWindow[] = [];
  let isHardDeadlinePresent = false;

  const explicitDuration = extractExplicitDuration(clean);

  // 1. Timeframe & Multiple Windows Analysis
  if (
    clean.includes('אחד משני שבועות') ||
    clean.includes('שני שבועות') ||
    clean.includes('או בשבוע שאחריו') ||
    clean.includes('שתי אפשרויות')
  ) {
    const hasExplicitDays = !!explicitDuration && explicitDuration.min !== undefined;
    const days = hasExplicitDays ? explicitDuration.min : undefined;

    timeWindows.push({
      id: 'win_1',
      label: hasExplicitDays
        ? `חלון א׳: שבוע ראשון (${days} ימים, גמיש)`
        : 'חלון א׳: שבוע ראשון (גמיש, משך טרם נקבע)',
      durationDaysMin: days,
      durationDaysMax: days,
      isFlexible: true,
      notes: hasExplicitDays ? undefined : 'משך החופשה לא צוין ויש לבררו',
    });
    timeWindows.push({
      id: 'win_2',
      label: hasExplicitDays
        ? `חלון ב׳: שבוע עוקב (${days} ימים, חלופי)`
        : 'חלון ב׳: שבוע עוקב (חלופי, משך טרם נקבע)',
      durationDaysMin: days,
      durationDaysMax: days,
      isFlexible: true,
      notes: hasExplicitDays ? undefined : 'משך החופשה לא צוין ויש לבררו',
    });
    constraints.push({
      id: 'c_multi_window',
      type: 'timeframe',
      descriptionHe: hasExplicitDays
        ? `חלון גמיש של ${days} ימים באחד מתוך שני שבועות חלופיים`
        : 'בחירה באחד משני שבועות חלופיים (משך החופשה טרם נקבע)',
      descriptionEn: hasExplicitDays
        ? `Flexible ${days}-day window across two alternative weeks`
        : 'Choice between two alternative weeks (duration not yet specified)',
      isHardConstraint: true,
      certainty: 'explicit',
      sourceText: text,
    });
  } else if (clean.includes('שבוע פנוי') && clean.includes('לא חייבים לנצל את כולו')) {
    timeWindows.push({
      id: 'win_flexible_week',
      label: 'שבוע פנוי — מיצוי גמיש ללא חובה לנצל את כולו',
      durationDaysMin: undefined,
      durationDaysMax: 7,
      isFlexible: true,
      notes: 'שבוע פנוי אך אין חובה לנצל את מלוא השבוע',
    });
    constraints.push({
      id: 'c_flexible_week',
      type: 'timeframe',
      descriptionHe: 'שבוע פנוי עם העדפה למיצוי גמיש (אין חובה לנצל את כל השבוע)',
      descriptionEn: 'Available week with flexible usage (no requirement to use the full week)',
      isHardConstraint: false,
      certainty: 'explicit',
      sourceText: text,
    });
  } else if (explicitDuration) {
    timeWindows.push({
      id: 'win_single',
      label: `חופשה של ${explicitDuration.min} ימים`,
      durationDaysMin: explicitDuration.min,
      durationDaysMax: explicitDuration.max,
      isFlexible: explicitDuration.isFlexible,
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

  // 2. Shabbat & Religious Constraints (Strictly separated into distinct logical categories)
  if (clean.includes('שישי') && (clean.includes('10:00') || clean.includes('10 בבוקר'))) {
    constraints.push({
      id: 'c_shabbat_friday_morning',
      type: 'shabbat_holiday',
      subtype: 'return_friday_morning',
      descriptionHe: 'דרישה לחזור עד יום שישי בשעה 10:00 (שעת גג מוחלטת שנמסרה במפורש)',
      descriptionEn: 'Mandatory return by Friday 10:00 AM (Explicit deadline)',
      isHardConstraint: true,
      certainty: 'explicit',
      sourceText: text,
      targetDate: 'יום שישי',
      targetTime: '10:00',
    });
    isHardDeadlinePresent = true;
  } else if (clean.includes('שלוש שעות אחרי צאת שבת') || clean.includes('3 שעות אחרי צאת שבת')) {
    constraints.push({
      id: 'c_shabbat_three_hours_after',
      type: 'shabbat_holiday',
      subtype: 'depart_three_hours_after_shabbat',
      descriptionHe: 'דרישה לצאת לפחות שלוש שעות לאחר צאת שבת (מרווח זמן מחייב להתארגנות ונסיעה)',
      descriptionEn: 'Mandatory departure at least 3 hours after Shabbat ends',
      isHardConstraint: true,
      certainty: 'explicit',
      sourceText: text,
    });
  } else if (clean.includes('רק אחרי צאת שבת') || clean.includes('אחרי צאת שבת') || clean.includes('רק במוצאי שבת')) {
    constraints.push({
      id: 'c_shabbat_depart_after',
      type: 'shabbat_holiday',
      subtype: 'depart_only_after_shabbat',
      descriptionHe: 'אפשרות לצאת רק לאחר צאת שבת (אילוץ קשיח — שעת מוצ״ש תלויה במיקום ובתאריך)',
      descriptionEn: 'Departure permitted only after Shabbat concludes',
      isHardConstraint: true,
      certainty: 'explicit',
      sourceText: text,
    });
  } else if (
    clean.includes('העדפה להיות בבית בשבת') ||
    clean.includes('מעדיף להיות בבית בשבת') ||
    clean.includes('מעדיפים להיות בבית בשבת') ||
    clean.includes('מעדיף לחזור לשבת')
  ) {
    constraints.push({
      id: 'c_shabbat_prefer_home',
      type: 'shabbat_holiday',
      subtype: 'prefer_home_for_shabbat',
      descriptionHe: 'העדפה לחזור ולהיות בבית בשבת (העדפה רכה וגמישה, אינה אילוץ קשיח)',
      descriptionEn: 'Soft preference to be home for Shabbat',
      isHardConstraint: false, // Soft preference!
      certainty: 'explicit',
      sourceText: text,
    });
  } else if (
    clean.includes('חובה לחזור לפני שבת') ||
    clean.includes('חייב לחזור לפני שבת') ||
    clean.includes('חובה לחזור לפני כניסת שבת') ||
    clean.includes('לפני כניסת שבת') ||
    clean.includes('לפני שבת')
  ) {
    constraints.push({
      id: 'c_shabbat_return_before',
      type: 'shabbat_holiday',
      subtype: 'must_return_before_shabbat',
      descriptionHe: 'חובה לחזור לפני כניסת שבת (אילוץ קשיח — שעת כניסת שבת תלויה במועד ובמיקום מדויקים)',
      descriptionEn: 'Mandatory return before Shabbat candle-lighting (Depends on date and location)',
      isHardConstraint: true,
      certainty: 'explicit',
      sourceText: text,
    });
    isHardDeadlinePresent = true;
  } else if (clean.includes('שומר שבת') || clean.includes('שבת')) {
    constraints.push({
      id: 'c_shabbat_general',
      type: 'shabbat_holiday',
      subtype: 'general_shabbat_observance',
      descriptionHe: 'שמירת שבת (אילוץ הלכתי כללי שיש לקחת בחשבון בתכנון)',
      descriptionEn: 'General Shabbat observance',
      isHardConstraint: true,
      certainty: 'explicit',
      sourceText: text,
    });
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

  // 4. Destination & Presence Constraints (Florence / other places)
  // Strict requirement vs soft consideration
  const presence = extractPresenceConstraint(clean);
  if (presence) {
    if (presence.isMandatory) {
      const details = [
        presence.targetDate,
        presence.targetTime ? `בשעה ${presence.targetTime}` : '',
      ]
        .filter(Boolean)
        .join(' ');

      constraints.push({
        id: `c_${presence.destination}_presence`,
        type: 'location_destination',
        subtype: 'mandatory_presence',
        descriptionHe: `נוכחות מחייבת ב${presence.destination}${details ? ` (${details})` : ''} (אילוץ קשיח בלתי מתפשר)`,
        descriptionEn: `Mandatory presence in ${presence.destination}${details ? ` (${details})` : ''} (Hard constraint)`,
        isHardConstraint: true,
        certainty: 'explicit',
        sourceText: text,
        targetDate: presence.targetDate,
        targetTime: presence.targetTime,
      });
      isHardDeadlinePresent = true;
    } else {
      // Soft destination suggestion or preference
      constraints.push({
        id: `c_${presence.destination}_preference`,
        type: 'location_destination',
        subtype: 'soft_destination_preference',
        descriptionHe: `שוקל לטייל ב${presence.destination} (העדפת יעד גמישה, אינה אילוץ קשיח)`,
        descriptionEn: `Considering ${presence.destination} (Soft destination preference, not a hard constraint)`,
        isHardConstraint: false, // Soft preference!
        certainty: 'explicit',
        sourceText: text,
      });
    }
  }

  // 5. Optimization goal: Longest possible vacation
  if (clean.includes('הארוכה ביותר') || clean.includes('מקסימום ימים') || clean.includes('כמה שיותר ארוך')) {
    constraints.push({
      id: 'c_max_duration',
      type: 'timeframe',
      descriptionHe: 'העדפת מיצוי מקסימלי של אורך החופשה (העדפת אופטימיזציה גמישה)',
      descriptionEn: 'Preference for longest possible duration (Soft optimization preference)',
      isHardConstraint: false,
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

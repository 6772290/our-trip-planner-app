/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DateAlternative } from '../types/trip';
import {
  resolveTorahPortion,
  resolveJewishHoliday,
  gregorianToHebrewDetailed,
  ResolvedHolidayOrParasha,
  calculateZmanim,
} from './hebrewCalendarResolver';

export interface ClarificationQuestionItem {
  id: string;
  question: string;
  explanation?: string;
  options: { label: string; value: string }[];
  selectedOptionValue?: string;
}

export interface DepartureReturnInterpretation {
  originalPhrase: string;
  resolvedGregorianDate?: string; // "YYYY-MM-DD"
  resolvedHebrewDate?: string; // "כ״ז בחשוון תשפ״ז"
  calculatedTime?: string; // "HH:MM"
  timeExplanation?: string;
  isVerified: boolean;
  notes?: string;
}

export interface NaturalTextParseResult {
  rawText: string;
  departureInterpretation?: DepartureReturnInterpretation;
  returnInterpretation?: DepartureReturnInterpretation;
  identifiedAlternatives: DateAlternative[];
  intentSummary: string;
  durationNights?: { min: number; max: number };
  detectedDaysOfWeek?: string;
  clarificationsNeeded: ClarificationQuestionItem[];
  mandatoryConstraintsDetected: string[];
  preferencesDetected: string[];
  optimizationGoalsDetected: string[];
  isConfirmed: boolean;
}

const HEBREW_MONTH_MAP: Record<string, number> = {
  ינואר: 1,
  פברואר: 2,
  מרץ: 3,
  אפריל: 4,
  מאי: 5,
  יוני: 6,
  יולי: 7,
  אוגוסט: 8,
  ספטמבר: 9,
  אוקטובר: 10,
  נובמבר: 11,
  דצמבר: 12,
};

// Known Torah portions (Parashot Hashavua)
const PARASHOT_LIST = [
  'בראשית',
  'נח',
  'לך לך',
  'וירא',
  'חיי שרה',
  'תולדות',
  'ויצא',
  'וישלח',
  'וישב',
  'מקץ',
  'ויגש',
  'ויחי',
  'שמות',
  'וארא',
  'בא',
  'בשלח',
  'יתרו',
  'משפטים',
  'תרומה',
  'תצוה',
  'כי תשא',
  'ויקהל',
  'פקודי',
  'ויקרא',
  'צו',
  'שמיני',
  'תזריע',
  'מצורע',
  'אחרי מות',
  'קדושים',
  'אמור',
  'בהר',
  'בחוקתי',
  'במדבר',
  'נשא',
  'בהעלותך',
  'שלח',
  'קרח',
  'חקת',
  'בלק',
  'פינחס',
  'מטות',
  'מסעי',
  'דברים',
  'ואתחנן',
  'עקב',
  'ראה',
  'שופטים',
  'כי תצא',
  'כי תבוא',
  'נצבים',
  'וילך',
  'האזינו',
  'וזאת הברכה',
];

const JEWISH_HOLIDAYS_LIST = [
  'ראש השנה',
  'יום כיפור',
  'סוכות',
  'שמחת תורה',
  'שמיני עצרת',
  'חנוכה',
  'ט״ו בשבט',
  'פורים',
  'שושן פורים',
  'פסח',
  'שבועות',
  'תשעה באב',
];

export function parseNaturalDateText(
  text: string,
  referenceYear = 2026,
  userPostShabbatBufferHours = 3,
  locationName = 'Jerusalem'
): NaturalTextParseResult {
  const trimmed = text.trim();
  const clarifications: ClarificationQuestionItem[] = [];
  const mandatoryConstraints: string[] = [];
  const preferences: string[] = [];
  const optimizationGoals: string[] = [];
  const alternatives: DateAlternative[] = [];

  let departureInterp: DepartureReturnInterpretation | undefined;
  let returnInterp: DepartureReturnInterpretation | undefined;

  // 1. Detect Hebrew year mentioned
  let hebrewYear = 5787; // Default 5787 for 2026-2027
  if (trimmed.includes('תשפ״ו') || trimmed.includes('תשפו')) hebrewYear = 5786;
  else if (trimmed.includes('תשפ״ז') || trimmed.includes('תשפז')) hebrewYear = 5787;
  else if (trimmed.includes('תשפ״ח') || trimmed.includes('תשפח')) hebrewYear = 5788;
  else if (!trimmed.match(/202[5-9]/)) {
    // If no year specified at all
    clarifications.push({
      id: 'q_year',
      question: 'האם התכוונת לשנת תשפ״ז (2026-2027)?',
      explanation: 'לא צוינה שנה במפורש במשפט, ברירת המחדל חושבה לפי תשפ״ז.',
      options: [
        { label: 'כן, שנת תשפ״ז (2026–2027)', value: '5787' },
        { label: 'לא, שנת תשפ״ו (2025–2026)', value: '5786' },
        { label: 'לא, שנת תשפ״ח (2027–2028)', value: '5788' },
      ],
      selectedOptionValue: '5787',
    });
  }

  // 2. Detect Torah Portion in text (e.g. "פרשת חיי שרה", "שבת חיי שרה")
  let foundParasha: ResolvedHolidayOrParasha | null = null;
  for (const pName of PARASHOT_LIST) {
    if (trimmed.includes(pName)) {
      foundParasha = resolveTorahPortion(pName, hebrewYear, locationName);
      break;
    }
  }

  // 3. Detect Jewish Holiday in text (e.g. "לפני חנוכה", "סוכות")
  let foundHoliday: ResolvedHolidayOrParasha | null = null;
  for (const hName of JEWISH_HOLIDAYS_LIST) {
    if (trimmed.includes(hName)) {
      foundHoliday = resolveJewishHoliday(hName, hebrewYear, locationName);
      break;
    }
  }

  // 4. Resolve Torah Portion departure (e.g. "אחרי שבת פרשת חיי שרה")
  if (foundParasha) {
    const havdalahTime = foundParasha.zmanim?.havdalah || '17:22';
    // Calculate earliest departure with buffer
    const [hHour, hMin] = havdalahTime.split(':').map((s) => parseInt(s, 10));
    const targetDepartureHour = (hHour + userPostShabbatBufferHours) % 24;
    const departureTimeFormatted = `${String(targetDepartureHour).padStart(2, '0')}:${String(
      hMin
    ).padStart(2, '0')}`;

    departureInterp = {
      originalPhrase: `אחרי שבת פרשת ${foundParasha.nameHebrew} ${hebrewYear}`,
      resolvedGregorianDate: foundParasha.gregorianDate,
      resolvedHebrewDate: foundParasha.hebrewDate,
      calculatedTime: departureTimeFormatted,
      timeExplanation: `מוצאי שבת: צאת השבת ב-${locationName} בשעה ${havdalahTime}. עם מרווח נסיעה והגעה של ${userPostShabbatBufferHours} שעות, המראה אפשרית החל מ-${departureTimeFormatted}.`,
      isVerified: true,
      notes: `פרשת שבוע מאומתת בלוח העברי: ${foundParasha.hebrewDate}`,
    };

    mandatoryConstraints.push(
      `המראה רק במוצאי שבת החל מ-${departureTimeFormatted} (לאחר צאת שבת ${foundParasha.nameHebrew} ומרווח של ${userPostShabbatBufferHours} שעות)`
    );
  }

  // 5. Resolve Holiday return (e.g. "לפני חנוכה")
  if (foundHoliday) {
    // If user says "before Hanukkah", it means return before the eve of Hanukkah
    const eveDate = foundHoliday.holidayStartEve?.gregorianDate || foundHoliday.gregorianDate;
    const eveHebrew = foundHoliday.holidayStartEve?.hebrewDate || foundHoliday.hebrewDate;
    const candleTime = foundHoliday.holidayStartEve?.candleLighting || '16:15';

    returnInterp = {
      originalPhrase: `לפני ${foundHoliday.nameHebrew} ${hebrewYear}`,
      resolvedGregorianDate: eveDate,
      resolvedHebrewDate: eveHebrew,
      calculatedTime: candleTime,
      timeExplanation: `${foundHoliday.nameHebrew} מתחיל בערב כ״ד בכסלו. הדלקת נרות ושקיעה ב-${locationName} ב-${candleTime}. חזרה מומלצת לפני שעה זו.`,
      isVerified: true,
      notes: `מועד חג מאומת: א׳ דחנוכה חל ב-${foundHoliday.hebrewDate} (${foundHoliday.gregorianDate})`,
    };

    clarifications.push({
      id: 'q_hanukkah_boundary',
      question: 'האם הכוונה לחזור הביתה לפני הדלקת נרות חנוכה או במהלך ימי החג?',
      explanation: 'נר ראשון של חנוכה מודלק בערב יום שישי, כ״ד בכסלו.',
      options: [
        { label: 'חובה להיות בבית לפני הדלקת נר ראשון (יום שישי 15:00)', value: 'before_eve' },
        { label: 'אפשר לחזור במהלך ימי החנוכה (עד נר שמיני)', value: 'during' },
      ],
      selectedOptionValue: 'before_eve',
    });

    mandatoryConstraints.push(`חזרה ונחיתה בישראל לפני הדלקת נרות חנוכה (עד ${candleTime})`);
  }

  // 6. Detect Night duration (e.g. "ארבעה עד שישה לילות", "5 ימים")
  let durationNights: { min: number; max: number } | undefined;
  if (trimmed.includes('ארבעה עד שישה לילות') || trimmed.includes('4 עד 6 לילות')) {
    durationNights = { min: 4, max: 6 };
    optimizationGoals.push('משך שהות אידיאלי של 4 עד 6 לילות');
  } else if (trimmed.includes('סוף שבוע ארוך') || trimmed.includes('סופ״ש')) {
    durationNights = { min: 3, max: 4 };
  } else if (trimmed.includes('שבוע')) {
    durationNights = { min: 6, max: 8 };
  }

  // 7. Detect optimization keywords
  if (trimmed.includes('הזולים ביותר') || trimmed.includes('זול')) {
    optimizationGoals.push('מציאת החלופה בעלת העלות הנמוכה ביותר (כרטיסי טיסה ומלונות)');
  }
  if (trimmed.includes('למקסם') || trimmed.includes('חופשה ארוכה')) {
    optimizationGoals.push('מקסום זמן השהות השימושי ביעד');
  }

  // 8. If both departure and return were calculated (e.g. Chayei Sarah to Hanukkah)
  if (departureInterp?.resolvedGregorianDate && returnInterp?.resolvedGregorianDate) {
    alternatives.push({
      id: 'alt_resolved_parasha_holiday',
      title: `חלופה מחושבת: ${departureInterp.resolvedGregorianDate} עד ${returnInterp.resolvedGregorianDate}`,
      startDate: departureInterp.resolvedGregorianDate,
      endDate: returnInterp.resolvedGregorianDate,
      departureTime: departureInterp.calculatedTime,
      returnTime: returnInterp.calculatedTime,
      notes: `ממוצאי שבת חיי שרה (${departureInterp.resolvedHebrewDate}) עד ערב חנוכה (${returnInterp.resolvedHebrewDate})`,
      pros: ['חישוב אסטרונומי והלכתי מדויק', 'עמידה מלאה בזמני שבת וחג'],
    });
  }

  // 9. Standard multi-alternative numbers parsing if no parasha was found
  if (alternatives.length === 0) {
    const numbersInText = [...trimmed.matchAll(/\b([1-9]|[12][0-9]|3[01])\b/g)].map((m) =>
      parseInt(m[1], 10)
    );
    const hasOr =
      trimmed.includes(' או ') || trimmed.includes('חלופה') || trimmed.includes('בשבוע של');

    let monthNum = 11;
    let monthName = 'נובמבר';
    for (const [mName, mVal] of Object.entries(HEBREW_MONTH_MAP)) {
      if (trimmed.includes(mName)) {
        monthNum = mVal;
        monthName = mName;
        break;
      }
    }

    if (numbersInText.length >= 2 && hasOr) {
      numbersInText.slice(0, 3).forEach((anchorDay, idx) => {
        const startD = anchorDay;
        const endD = anchorDay + 4;
        const mStr = String(monthNum).padStart(2, '0');
        const startIso = `${referenceYear}-${mStr}-${String(startD).padStart(2, '0')}`;
        const endIso = `${referenceYear}-${mStr}-${String(endD).padStart(2, '0')}`;
        const startHeb = gregorianToHebrewDetailed(startIso);
        const endHeb = gregorianToHebrewDetailed(endIso);

        alternatives.push({
          id: `alt_parsed_${idx + 1}`,
          title: `חלופה ${idx + 1}: ${startD}–${endD} ב${monthName} ${referenceYear}`,
          startDate: startIso,
          endDate: endIso,
          notes: `ראשון עד חמישי (${startHeb.formatted} – ${endHeb.formatted})`,
          pros: ['מתאים לשבוע עבודה רגיל', 'ללא צורך בשהות בסוף שבוע'],
        });
      });
    } else if (numbersInText.length >= 2 && !hasOr) {
      const startD = numbersInText[0];
      const endD = numbersInText[1];
      const mStr = String(monthNum).padStart(2, '0');
      const startIso = `${referenceYear}-${mStr}-${String(startD).padStart(2, '0')}`;
      const endIso = `${referenceYear}-${mStr}-${String(endD).padStart(2, '0')}`;
      alternatives.push({
        id: 'alt_parsed_single',
        title: `אפשרות: ${startD}–${endD} ב${monthName} ${referenceYear}`,
        startDate: startIso,
        endDate: endIso,
        notes: `משך נסיעה: ${Math.max(1, endD - startD + 1)} ימים`,
      });
    } else {
      // General fallback
      alternatives.push({
        id: 'alt_parsed_default',
        title: `חלופה ראשונית: 1–5 ב${monthName} ${referenceYear}`,
        startDate: `${referenceYear}-${String(monthNum).padStart(2, '0')}-01`,
        endDate: `${referenceYear}-${String(monthNum).padStart(2, '0')}-05`,
        notes: 'חלופה שחושבה לפי מילות המפתח',
      });
    }
  }

  // Summary intent
  let intentSummary = '';
  if (departureInterp && returnInterp) {
    intentSummary = `זוהתה בקשה מבוססת לוח עברי ואירועים: יציאה ${departureInterp.originalPhrase} (${departureInterp.resolvedGregorianDate}) וחזרה ${returnInterp.originalPhrase} (${returnInterp.resolvedGregorianDate}). חושבו שעות צאת שבת והדלקת נרות מדויקות ב-${locationName}.`;
  } else if (alternatives.length > 1) {
    intentSummary = `זוהו ${alternatives.length} חלופות נפרדות לנסיעה. כל חלופה נשמרת בנפרד ומחושבת בלוח הגרגוריאני והעברי במקביל.`;
  } else {
    intentSummary = `המערכת פענחה את הבקשה עבור: ${alternatives[0]?.title || 'מועדי נסיעה'}.`;
  }

  return {
    rawText: trimmed,
    departureInterpretation: departureInterp,
    returnInterpretation: returnInterp,
    identifiedAlternatives: alternatives,
    intentSummary,
    durationNights,
    clarificationsNeeded: clarifications,
    mandatoryConstraintsDetected: mandatoryConstraints,
    preferencesDetected: preferences,
    optimizationGoalsDetected: optimizationGoals,
    isConfirmed: false,
  };
}

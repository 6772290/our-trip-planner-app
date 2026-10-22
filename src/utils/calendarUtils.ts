/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CalendarSystem = 'gregorian' | 'hebrew' | 'chinese';

export interface ConvertedDateInfo {
  gregorian: {
    year: number;
    month: number; // 1-12
    day: number;
    formatted: string;
    dayOfWeekName: string;
  };
  hebrew: {
    year: number;
    yearHebrew: string;
    monthName: string;
    day: number;
    dayHebrew: string;
    formatted: string;
  };
  chinese: {
    lunarYear: number;
    animal: string;
    monthName: string;
    day: number;
    formatted: string;
  };
}

const HEBREW_MONTHS_REGULAR = [
  'תשרי',
  'חשוון',
  'כסלו',
  'טבת',
  'שבט',
  'אדר',
  'ניסן',
  'אייר',
  'סיוון',
  'תמוז',
  'אב',
  'אלול',
];

const HEBREW_MONTHS_LEAP = [
  'תשרי',
  'חשוון',
  'כסלו',
  'טבת',
  'שבט',
  'אדר א׳',
  'אדר ב׳',
  'ניסן',
  'אייר',
  'סיוון',
  'תמוז',
  'אב',
  'אלול',
];

const DAYS_OF_WEEK_HEBREW = [
  'יום ראשון',
  'יום שני',
  'יום שלישי',
  'יום רביעי',
  'יום חמישי',
  'יום שישי',
  'שבת',
];

const CHINESE_ZODIAC = [
  'חולדה',
  'שור',
  'נמר',
  'ארנב',
  'דרקון',
  'נחש',
  'סוס',
  'כבש',
  'קוף',
  'תרנגול',
  'כלב',
  'חזיר',
];

// Convert integer to Hebrew letters (Gematria) up to 30
export function numberToHebrewNumeral(num: number): string {
  const units = ['', 'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳'];
  const tens = ['', 'י׳', 'כ׳', 'ל׳'];

  if (num === 15) return 'ט״ו';
  if (num === 16) return 'ט״ז';

  if (num < 10) return units[num];
  const t = Math.floor(num / 10);
  const u = num % 10;
  if (u === 0) return tens[t];
  return tens[t].replace('׳', '') + '״' + units[u].replace('׳', '');
}

// Convert Hebrew year to string e.g. 5787 -> תשפ״ז
export function hebrewYearToLetters(year: number): string {
  const offset = year % 1000; // e.g. 787
  let remaining = offset;
  let str = '';

  const hundreds: [number, string][] = [
    [400, 'ת'],
    [300, 'ש'],
    [200, 'ר'],
    [100, 'ק'],
  ];

  for (const [val, letter] of hundreds) {
    while (remaining >= val) {
      str += letter;
      remaining -= val;
    }
  }

  const tens: [number, string][] = [
    [90, 'צ'],
    [80, 'פ'],
    [70, 'ע'],
    [60, 'ס'],
    [50, 'נ'],
    [40, 'מ'],
    [30, 'ל'],
    [20, 'כ'],
    [10, 'י'],
  ];

  if (remaining === 15) {
    str += 'טו';
    remaining = 0;
  } else if (remaining === 16) {
    str += 'טז';
    remaining = 0;
  } else {
    for (const [val, letter] of tens) {
      if (remaining >= val) {
        str += letter;
        remaining -= val;
        break;
      }
    }
  }

  const units: [number, string][] = [
    [9, 'ט'],
    [8, 'ח'],
    [7, 'ז'],
    [6, 'ו'],
    [5, 'ה'],
    [4, 'ד'],
    [3, 'ג'],
    [2, 'ב'],
    [1, 'א'],
  ];

  for (const [val, letter] of units) {
    if (remaining >= val) {
      str += letter;
      remaining -= val;
      break;
    }
  }

  // Insert gershayim before last letter
  if (str.length > 1) {
    return str.slice(0, -1) + '״' + str.slice(-1);
  }
  return str + '׳';
}

// Check if Hebrew year is leap year (19-year Metonic cycle)
export function isHebrewLeapYear(hebrewYear: number): boolean {
  return ((7 * hebrewYear + 1) % 19) < 7;
}

// Julian Day Number from Gregorian Date (noon reference)
function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

// Convert JDN to Hebrew Date
// Uses the standard Gauss/Rabbi Hillel algorithm
function jdnToHebrew(jdn: number): { year: number; monthName: string; day: number } {
  // Approximate Hebrew year
  let hYear = Math.floor((jdn - 347997) / 365.2468) + 1;

  // Function to find Rosh Hashanah JDN of a Hebrew year
  function roshHashanaJDN(year: number): number {
    const months = Math.floor((235 * year - 234) / 19);
    const parts = 12084 + 13753 * months;
    const day = months * 29 + Math.floor(parts / 25920);
    const frac = parts % 25920;

    let rhJDN = 347997 + day;
    const dayOfWeek = (rhJDN + 1) % 7;

    // Dechiyot (postponements)
    if (
      dayOfWeek === 1 || // Sunday
      dayOfWeek === 4 || // Wednesday
      dayOfWeek === 6 // Friday
    ) {
      rhJDN += 1;
    } else if (
      dayOfWeek === 2 && // Monday molad after noon
      frac >= 15 * 1080 + 204 &&
      !isHebrewLeapYear(year)
    ) {
      rhJDN += 2;
    } else if (
      dayOfWeek === 3 && // Tuesday molad in leap year
      frac >= 21 * 1080 + 589 &&
      isHebrewLeapYear(year - 1)
    ) {
      rhJDN += 1;
    }

    return rhJDN;
  }

  let rhCurrent = roshHashanaJDN(hYear);
  while (rhCurrent > jdn) {
    hYear--;
    rhCurrent = roshHashanaJDN(hYear);
  }

  const rhNext = roshHashanaJDN(hYear + 1);
  const yearLength = rhNext - rhCurrent;
  const isLeap = isHebrewLeapYear(hYear);

  // Month lengths according to Hebrew year type (Deficient, Regular, Complete)
  // Cheshvan and Kislev vary:
  // 353 / 383: Cheshvan 29, Kislev 29 (Chasera)
  // 354 / 384: Cheshvan 29, Kislev 30 (Kesidrah)
  // 355 / 385: Cheshvan 30, Kislev 30 (Shelemah)
  let cheshvanLength = 29;
  let kislevLength = 30;
  if (yearLength === 353 || yearLength === 383) {
    kislevLength = 29;
  } else if (yearLength === 355 || yearLength === 385) {
    cheshvanLength = 30;
  }

  const monthLengths = isLeap
    ? [30, cheshvanLength, kislevLength, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29]
    : [30, cheshvanLength, kislevLength, 29, 30, 29, 30, 29, 30, 29, 30, 29];

  const monthNames = isLeap ? HEBREW_MONTHS_LEAP : HEBREW_MONTHS_REGULAR;

  let dayOfYear = jdn - rhCurrent + 1;
  let monthIdx = 0;

  while (monthIdx < monthLengths.length && dayOfYear > monthLengths[monthIdx]) {
    dayOfYear -= monthLengths[monthIdx];
    monthIdx++;
  }

  return {
    year: hYear,
    monthName: monthNames[Math.min(monthIdx, monthNames.length - 1)],
    day: Math.max(1, dayOfYear),
  };
}

/**
 * Approximate Chinese Lunar Date converter
 */
function gregorianToChinese(year: number, month: number, day: number) {
  // Approximate lunar offset (starts late Jan / Feb)
  const zodiacAnimal = CHINESE_ZODIAC[(year - 4) % 12];
  // Simple approximation for UI showcase
  const lunarMonth = month > 1 ? month - 1 : 12;
  const lunarDay = ((day + 7) % 29) + 1;
  return {
    lunarYear: year,
    animal: zodiacAnimal,
    monthName: `חודש ${lunarMonth}`,
    day: lunarDay,
    formatted: `שנת ה${zodiacAnimal}, יום ${lunarDay} ב${lunarMonth}`,
  };
}

/**
 * Unified conversion function:
 * Strictly follows the App specification:
 * "לצורך התצוגה באפליקציה, התאריך העברי המוצג למשתמש יתחלף בחצות הלילה המקומית בלבד, ולא בשקיעה."
 */
export function getConvertedDateInfo(isoDateStr: string): ConvertedDateInfo {
  // isoDateStr is "YYYY-MM-DD"
  const [yStr, mStr, dStr] = isoDateStr.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const d = parseInt(dStr, 10);

  const dateObj = new Date(y, m - 1, d);
  const dayOfWeek = dateObj.getDay();
  const dayOfWeekName = DAYS_OF_WEEK_HEBREW[dayOfWeek];

  const jdn = gregorianToJDN(y, m, d);
  const hebrew = jdnToHebrew(jdn);
  const hebrewDayFormatted = numberToHebrewNumeral(hebrew.day);
  const hebrewYearFormatted = hebrewYearToLetters(hebrew.year);
  const hebrewFullStr = `${hebrewDayFormatted} ב${hebrew.monthName} ${hebrewYearFormatted}`;

  const monthHebrewNames = [
    'בינואר',
    'בפברואר',
    'במרץ',
    'באפריל',
    'במאי',
    'ביוני',
    'ביולי',
    'באוגוסט',
    'בספטמבר',
    'באוקטובר',
    'בנובמבר',
    'בדצמבר',
  ];

  const gregorianFormatted = `${d} ${monthHebrewNames[m - 1]} ${y}`;
  const chinese = gregorianToChinese(y, m, d);

  return {
    gregorian: {
      year: y,
      month: m,
      day: d,
      formatted: gregorianFormatted,
      dayOfWeekName,
    },
    hebrew: {
      year: hebrew.year,
      yearHebrew: hebrewYearFormatted,
      monthName: hebrew.monthName,
      day: hebrew.day,
      dayHebrew: hebrewDayFormatted,
      formatted: hebrewFullStr,
    },
    chinese: {
      lunarYear: chinese.lunarYear,
      animal: chinese.animal,
      monthName: chinese.monthName,
      day: chinese.day,
      formatted: chinese.formatted,
    },
  };
}

/**
 * Formats a date string respecting active primary and secondary calendar settings
 */
export function formatWithCalendarDual(
  isoDateStr: string,
  primary: CalendarSystem = 'gregorian',
  showSecondary = true
): string {
  if (!isoDateStr) return '';
  const info = getConvertedDateInfo(isoDateStr);

  if (primary === 'hebrew') {
    return showSecondary
      ? `${info.hebrew.formatted} (${info.gregorian.formatted})`
      : info.hebrew.formatted;
  } else if (primary === 'chinese') {
    return showSecondary
      ? `${info.chinese.formatted} (${info.gregorian.formatted})`
      : info.chinese.formatted;
  } else {
    // Gregorian primary
    return showSecondary
      ? `${info.gregorian.formatted} (${info.hebrew.formatted})`
      : info.gregorian.formatted;
  }
}

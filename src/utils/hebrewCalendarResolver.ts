/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HDate, HebrewCalendar, Location, Zmanim, Event as HebcalEvent } from '@hebcal/core';

export interface ResolvedZmanim {
  sunset: string; // "HH:MM"
  havdalah: string; // "HH:MM" (Tzeit Hakochavim)
  candleLighting?: string; // "HH:MM"
  timeZone: string;
  locationName: string;
}

export interface ResolvedHolidayOrParasha {
  type: 'parasha' | 'holiday' | 'fast_day' | 'rosh_chodesh';
  nameHebrew: string;
  nameEnglish: string;
  gregorianDate: string; // "YYYY-MM-DD"
  hebrewDate: string; // e.g. "כ״ז בחשוון תשפ״ז"
  hebrewDayNumber: number;
  hebrewMonthName: string;
  hebrewYear: number;
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  dayOfWeekNameHebrew: string;
  zmanim?: ResolvedZmanim;
  description?: string;
  holidayStartEve?: {
    gregorianDate: string;
    hebrewDate: string;
    candleLighting?: string;
    sunset?: string;
  };
}

// Strip Hebrew Nikud (vowel marks)
export function stripNikud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '');
}

// Hebrew Gematria for numbers up to 30
export function numberToHebrewDay(num: number): string {
  const units = ['', 'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳'];
  const tens = ['', 'י׳', 'כ׳', 'ל׳'];

  if (num === 15) return 'ט״ו';
  if (num === 16) return 'ט״ז';

  if (num < 10) return units[num] || String(num);
  const t = Math.floor(num / 10);
  const u = num % 10;
  if (u === 0) return tens[t];
  return tens[t].replace('׳', '') + '״' + units[u].replace('׳', '');
}

export function hebrewYearToString(year: number): string {
  const offset = year % 1000;
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

  if (str.length > 1) {
    return str.slice(0, -1) + '״' + str.slice(-1);
  }
  return str + '׳';
}

const HEBREW_MONTH_NAMES_LIST = [
  'תשרי',
  'חשוון',
  'כסלו',
  'טבת',
  'שבט',
  'אדר',
  'אדר א׳',
  'אדר ב׳',
  'ניסן',
  'אייר',
  'סיוון',
  'תמוז',
  'אב',
  'אלול',
];

export function getHebrewMonthsForYear(hYear: number): { id: string; name: string }[] {
  const isLeap = HDate.isLeapYear(hYear);
  if (isLeap) {
    return [
      { id: 'Tishrei', name: 'תשרי' },
      { id: 'Cheshvan', name: 'חשוון' },
      { id: 'Kislev', name: 'כסלו' },
      { id: 'Tevet', name: 'טבת' },
      { id: 'Sh\'vat', name: 'שבט' },
      { id: 'Adar I', name: 'אדר א׳' },
      { id: 'Adar II', name: 'אדר ב׳' },
      { id: 'Nisan', name: 'ניסן' },
      { id: 'Iyyar', name: 'אייר' },
      { id: 'Sivan', name: 'סיוון' },
      { id: 'Tamuz', name: 'תמוז' },
      { id: 'Av', name: 'אב' },
      { id: 'Elul', name: 'אלול' },
    ];
  }

  return [
    { id: 'Tishrei', name: 'תשרי' },
    { id: 'Cheshvan', name: 'חשוון' },
    { id: 'Kislev', name: 'כסלו' },
    { id: 'Tevet', name: 'טבת' },
    { id: 'Sh\'vat', name: 'שבט' },
    { id: 'Adar', name: 'אדר' },
    { id: 'Nisan', name: 'ניסן' },
    { id: 'Iyyar', name: 'אייר' },
    { id: 'Sivan', name: 'סיוון' },
    { id: 'Tamuz', name: 'תמוז' },
    { id: 'Av', name: 'אב' },
    { id: 'Elul', name: 'אלול' },
  ];
}

const DAYS_OF_WEEK_HEB = [
  'יום ראשון',
  'יום שני',
  'יום שלישי',
  'יום רביעי',
  'יום חמישי',
  'יום שישי',
  'שבת',
];

/**
 * Convert Gregorian ISO date ("YYYY-MM-DD") to verified Hebrew date
 */
export function gregorianToHebrewDetailed(isoDate: string): {
  hebrewYear: number;
  hebrewYearString: string;
  hebrewMonthName: string;
  hebrewDayNumber: number;
  hebrewDayString: string;
  formatted: string;
  dayOfWeekName: string;
} {
  const [yStr, mStr, dStr] = isoDate.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const d = parseInt(dStr, 10);

  const dateObj = new Date(y, m - 1, d, 12, 0, 0); // Noon for civil day mapping
  const hDate = new HDate(dateObj);

  const hYear = hDate.getFullYear();
  const hMonth = hDate.getMonthName();
  const hDay = hDate.getDate();

  // Map month name to Hebrew
  const monthMap: Record<string, string> = {
    Tishrei: 'תשרי',
    Cheshvan: 'חשוון',
    Kislev: 'כסלו',
    Tevet: 'טבת',
    "Sh'vat": 'שבט',
    Adar: 'אדר',
    'Adar I': 'אדר א׳',
    'Adar II': 'אדר ב׳',
    Nisan: 'ניסן',
    Iyyar: 'אייר',
    Sivan: 'סיוון',
    Tamuz: 'תמוז',
    Av: 'אב',
    Elul: 'אלול',
  };

  const hebrewMonthName = monthMap[hMonth] || hMonth;
  const hebrewYearString = hebrewYearToString(hYear);
  const hebrewDayString = numberToHebrewDay(hDay);
  const dayOfWeekName = DAYS_OF_WEEK_HEB[dateObj.getDay()];

  return {
    hebrewYear: hYear,
    hebrewYearString,
    hebrewMonthName,
    hebrewDayNumber: hDay,
    hebrewDayString,
    formatted: `${hebrewDayString} ב${hebrewMonthName} ${hebrewYearString}`,
    dayOfWeekName,
  };
}

/**
 * Convert Hebrew Date (Year, Month name, Day number) to Gregorian ISO date
 */
export function hebrewToGregorian(
  hebrewYear: number,
  hebrewMonthNameOrId: string,
  hebrewDayNumber: number
): {
  isoDate: string; // "YYYY-MM-DD"
  formattedGregorian: string;
  dayOfWeekName: string;
} {
  // Map Hebrew name to Hebcal month identifier
  const reverseMonthMap: Record<string, string> = {
    תשרי: 'Tishrei',
    חשוון: 'Cheshvan',
    כסלו: 'Kislev',
    טבת: 'Tevet',
    שבט: "Sh'vat",
    אדר: 'Adar',
    'אדר א׳': 'Adar I',
    'אדר ב׳': 'Adar II',
    'אדר 1': 'Adar I',
    'אדר 2': 'Adar II',
    ניסן: 'Nisan',
    אייר: 'Iyyar',
    סיוון: 'Sivan',
    תמוז: 'Tamuz',
    אב: 'Av',
    אלול: 'Elul',
  };

  const monthId = reverseMonthMap[hebrewMonthNameOrId] || hebrewMonthNameOrId;
  const hDate = new HDate(hebrewDayNumber, monthId as any, hebrewYear);
  const gregDate = hDate.greg();

  const gy = gregDate.getFullYear();
  const gm = String(gregDate.getMonth() + 1).padStart(2, '0');
  const gd = String(gregDate.getDate()).padStart(2, '0');
  const isoDate = `${gy}-${gm}-${gd}`;

  const monthNamesHeb = [
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

  const formattedGregorian = `${gregDate.getDate()} ${monthNamesHeb[gregDate.getMonth()]} ${gy}`;
  const dayOfWeekName = DAYS_OF_WEEK_HEB[gregDate.getDay()];

  return {
    isoDate,
    formattedGregorian,
    dayOfWeekName,
  };
}

/**
 * Calculate Zmanim (Sunset, Havdalah, Candle Lighting) for a date and location
 */
export function calculateZmanim(
  gregDate: Date,
  locationName = 'Jerusalem'
): ResolvedZmanim {
  let loc: any;
  try {
    loc = Location.lookup(locationName) || Location.lookup('Jerusalem');
  } catch (e) {
    loc = Location.lookup('Jerusalem');
  }

  const zman = new Zmanim(loc, gregDate, false);
  const timeZone = typeof loc.getTzid === 'function' ? loc.getTzid() : 'Asia/Jerusalem';

  const formatTime = (d: Date | null | undefined): string => {
    if (!d || isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('he-IL', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const sunsetDate = zman.sunset();
  const sunsetTime = formatTime(sunsetDate);
  // Havdalah (standard 42 min / 8.5 degrees)
  const havdalahTime = formatTime(zman.tzeit());
  const candleLightingTime = sunsetDate
    ? formatTime(new Date(sunsetDate.getTime() - 20 * 60 * 1000))
    : '';

  return {
    sunset: sunsetTime,
    havdalah: havdalahTime,
    candleLighting: candleLightingTime || undefined,
    timeZone,
    locationName: loc.getName(),
  };
}

/**
 * Resolve Torah portion (Parashat Hashavua) to exact dates & Zmanim for a Hebrew Year
 * Example: "חיי שרה", 5787
 */
export function resolveTorahPortion(
  parashaSearchQuery: string,
  targetHebrewYear = 5787,
  locationName = 'Jerusalem'
): ResolvedHolidayOrParasha | null {
  const cleanQuery = stripNikud(parashaSearchQuery).trim();

  // Load calendar events for the year with Torah readings (sedrot)
  const events = HebrewCalendar.calendar({
    year: targetHebrewYear,
    isHebrewYear: true,
    il: true, // In Israel schedule
    sedrot: true,
  });

  const parashaEvent = events.find((ev: HebcalEvent) => {
    const desc = ev.getDesc().toLowerCase();
    const hebrew = stripNikud(ev.render('he'));
    return (
      (desc.startsWith('parashat ') || desc.includes('shabbat ')) &&
      (hebrew.includes(cleanQuery) || desc.includes(cleanQuery.toLowerCase()))
    );
  });

  if (!parashaEvent) return null;

  const hDate = parashaEvent.getDate();
  const gregDate = hDate.greg();
  const isoDate = `${gregDate.getFullYear()}-${String(gregDate.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(gregDate.getDate()).padStart(2, '0')}`;

  const zmanim = calculateZmanim(gregDate, locationName);
  const detailed = gregorianToHebrewDetailed(isoDate);

  return {
    type: 'parasha',
    nameHebrew: stripNikud(parashaEvent.render('he')),
    nameEnglish: parashaEvent.getDesc(),
    gregorianDate: isoDate,
    hebrewDate: detailed.formatted,
    hebrewDayNumber: detailed.hebrewDayNumber,
    hebrewMonthName: detailed.hebrewMonthName,
    hebrewYear: targetHebrewYear,
    dayOfWeek: gregDate.getDay(),
    dayOfWeekNameHebrew: 'שבת',
    zmanim,
    description: `שבת פרשת ${stripNikud(parashaEvent.render('he'))} בשנת ${hebrewYearToString(
      targetHebrewYear
    )} (${detailed.formatted})`,
  };
}

/**
 * Resolve Jewish Holiday to exact dates, candle lighting, and Zmanim for a Hebrew Year
 * Example: "חנוכה", 5787 -> 25 Kislev 5787 (starts eve of 24 Kislev)
 */
export function resolveJewishHoliday(
  holidayQuery: string,
  targetHebrewYear = 5787,
  locationName = 'Jerusalem'
): ResolvedHolidayOrParasha | null {
  const cleanQuery = stripNikud(holidayQuery).trim();

  // Load calendar events for the year
  const events = HebrewCalendar.calendar({
    year: targetHebrewYear,
    isHebrewYear: true,
    il: true,
  });

  // Find holiday event
  const holidayEvent = events.find((ev: HebcalEvent) => {
    const desc = ev.getDesc().toLowerCase();
    const hebrew = stripNikud(ev.render('he'));

    if (cleanQuery.includes('חנוכה') || cleanQuery.toLowerCase().includes('chanukah')) {
      return desc.includes('chanukah: 1 candle') || hebrew.includes('חנוכה: א׳ נר');
    }

    if (cleanQuery.includes('סוכות') || cleanQuery.toLowerCase().includes('sukkot')) {
      return desc === 'sukkot i' || hebrew.includes('סוכות א׳');
    }

    if (cleanQuery.includes('פסח') || cleanQuery.toLowerCase().includes('pesach')) {
      return desc === 'pesach i' || hebrew.includes('פסח א׳');
    }

    if (cleanQuery.includes('שבועות') || cleanQuery.toLowerCase().includes('shavuot')) {
      return desc === 'shavuot' || hebrew.includes('שבועות');
    }

    if (cleanQuery.includes('פורים') || cleanQuery.toLowerCase().includes('purim')) {
      return desc === 'purim' || hebrew.includes('פורים');
    }

    if (cleanQuery.includes('ראש השנה') || cleanQuery.toLowerCase().includes('rosh hashana')) {
      return desc === 'rosh hashana' || hebrew.includes('ראש השנה');
    }

    if (cleanQuery.includes('יום כיפור') || cleanQuery.toLowerCase().includes('yom kippur')) {
      return desc === 'yom kippur' || hebrew.includes('יום כיפור');
    }

    return hebrew.includes(cleanQuery) || desc.includes(cleanQuery.toLowerCase());
  });

  if (!holidayEvent) return null;

  const hDate = holidayEvent.getDate();
  const gregDate = hDate.greg();
  const isoDate = `${gregDate.getFullYear()}-${String(gregDate.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(gregDate.getDate()).padStart(2, '0')}`;

  const zmanim = calculateZmanim(gregDate, locationName);
  const detailed = gregorianToHebrewDetailed(isoDate);

  // Eve of holiday (starts the evening before, unless event is already an eve or candle lighting)
  const isAlreadyEve =
    holidayEvent.getDesc().toLowerCase().includes('candle') ||
    holidayEvent.getDesc().toLowerCase().startsWith('erev');

  const eveGregDate = isAlreadyEve ? gregDate : new Date(gregDate.getTime() - 24 * 60 * 60 * 1000);
  const eveIsoDate = isAlreadyEve
    ? isoDate
    : `${eveGregDate.getFullYear()}-${String(eveGregDate.getMonth() + 1).padStart(2, '0')}-${String(
        eveGregDate.getDate()
      ).padStart(2, '0')}`;
  const eveZmanim = isAlreadyEve ? zmanim : calculateZmanim(eveGregDate, locationName);
  const eveDetailed = isAlreadyEve ? detailed : gregorianToHebrewDetailed(eveIsoDate);

  return {
    type: 'holiday',
    nameHebrew: stripNikud(holidayEvent.render('he')),
    nameEnglish: holidayEvent.getDesc(),
    gregorianDate: isoDate,
    hebrewDate: detailed.formatted,
    hebrewDayNumber: detailed.hebrewDayNumber,
    hebrewMonthName: detailed.hebrewMonthName,
    hebrewYear: targetHebrewYear,
    dayOfWeek: gregDate.getDay(),
    dayOfWeekNameHebrew: DAYS_OF_WEEK_HEB[gregDate.getDay()],
    zmanim,
    description: `${stripNikud(holidayEvent.render('he'))} חל ביום ${
      DAYS_OF_WEEK_HEB[gregDate.getDay()]
    }, ${detailed.formatted}`,
    holidayStartEve: {
      gregorianDate: eveIsoDate,
      hebrewDate: eveDetailed.formatted,
      candleLighting: eveZmanim.candleLighting || eveZmanim.sunset,
      sunset: eveZmanim.sunset,
    },
  };
}

/**
 * Returns exact month length and the day-of-week (0=Sunday to 6=Saturday) of Day 1
 * for any Hebrew year and month, using @hebcal/core verified calculations.
 */
export function getHebrewMonthGridDetails(
  hebrewYear: number,
  hebrewMonthNameOrId: string
): {
  daysInMonth: number;
  firstDayWeekday: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  isLeapYear: boolean;
  monthId: string;
  hebrewMonthName: string;
} {
  const reverseMonthMap: Record<string, string> = {
    תשרי: 'Tishrei',
    חשוון: 'Cheshvan',
    כסלו: 'Kislev',
    טבת: 'Tevet',
    שבט: "Sh'vat",
    אדר: 'Adar',
    'אדר א׳': 'Adar I',
    'אדר ב׳': 'Adar II',
    'אדר 1': 'Adar I',
    'אדר 2': 'Adar II',
    ניסן: 'Nisan',
    אייר: 'Iyyar',
    סיוון: 'Sivan',
    תמוז: 'Tamuz',
    אב: 'Av',
    אלול: 'Elul',
  };

  const monthId = reverseMonthMap[hebrewMonthNameOrId] || hebrewMonthNameOrId;
  const isLeap = HDate.isLeapYear(hebrewYear);

  // If regular year and Adar I or Adar II passed, fallback to Adar
  let resolvedMonthId = monthId;
  if (!isLeap && (monthId === 'Adar I' || monthId === 'Adar II')) {
    resolvedMonthId = 'Adar';
  } else if (isLeap && monthId === 'Adar') {
    resolvedMonthId = 'Adar I';
  }

  const hDate = new HDate(1, resolvedMonthId as any, hebrewYear);
  const daysInMonth = hDate.daysInMonth();
  const firstDayWeekday = hDate.greg().getDay();

  const monthMapHeb: Record<string, string> = {
    Tishrei: 'תשרי',
    Cheshvan: 'חשוון',
    Kislev: 'כסלו',
    Tevet: 'טבת',
    "Sh'vat": 'שבט',
    Adar: 'אדר',
    'Adar I': 'אדר א׳',
    'Adar II': 'אדר ב׳',
    Nisan: 'ניסן',
    Iyyar: 'אייר',
    Sivan: 'סיוון',
    Tamuz: 'תמוז',
    Av: 'אב',
    Elul: 'אלול',
  };

  return {
    daysInMonth,
    firstDayWeekday,
    isLeapYear: isLeap,
    monthId: resolvedMonthId,
    hebrewMonthName: monthMapHeb[resolvedMonthId] || hebrewMonthNameOrId,
  };
}


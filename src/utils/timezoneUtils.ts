/**
 * Timezone and International Multi-Traveler Calculation Utilities
 * Uses standard IANA timezone identifiers and native Intl.DateTimeFormat for exact DST resolution.
 */

export interface CommonTimezoneOption {
  iana: string;
  cityHebrew: string;
  cityEnglish: string;
  countryHebrew: string;
  countryEnglish: string;
  defaultAirport: string;
}

export const COMMON_TIMEZONES: CommonTimezoneOption[] = [
  {
    iana: 'Asia/Jerusalem',
    cityHebrew: 'תל אביב / ירושלים',
    cityEnglish: 'Tel Aviv / Jerusalem',
    countryHebrew: 'ישראל',
    countryEnglish: 'Israel',
    defaultAirport: 'TLV',
  },
  {
    iana: 'Europe/London',
    cityHebrew: 'לונדון',
    cityEnglish: 'London',
    countryHebrew: 'הממלכה המאוחדת',
    countryEnglish: 'United Kingdom',
    defaultAirport: 'LHR',
  },
  {
    iana: 'Europe/Paris',
    cityHebrew: 'פריז',
    cityEnglish: 'Paris',
    countryHebrew: 'צרפת',
    countryEnglish: 'France',
    defaultAirport: 'CDG',
  },
  {
    iana: 'Europe/Rome',
    cityHebrew: 'רומא',
    cityEnglish: 'Rome',
    countryHebrew: 'איטליה',
    countryEnglish: 'Italy',
    defaultAirport: 'FCO',
  },
  {
    iana: 'America/New_York',
    cityHebrew: 'ניו יורק',
    cityEnglish: 'New York',
    countryHebrew: 'ארה״ב',
    countryEnglish: 'United States',
    defaultAirport: 'JFK',
  },
  {
    iana: 'America/Los_Angeles',
    cityHebrew: 'לוס אנג׳לס',
    cityEnglish: 'Los Angeles',
    countryHebrew: 'ארה״ב',
    countryEnglish: 'United States',
    defaultAirport: 'LAX',
  },
  {
    iana: 'Asia/Tokyo',
    cityHebrew: 'טוקיו',
    cityEnglish: 'Tokyo',
    countryHebrew: 'יפן',
    countryEnglish: 'Japan',
    defaultAirport: 'HND',
  },
  {
    iana: 'Asia/Dubai',
    cityHebrew: 'דובאי',
    cityEnglish: 'Dubai',
    countryHebrew: 'איחוד האמירויות',
    countryEnglish: 'UAE',
    defaultAirport: 'DXB',
  },
];

/**
 * Returns the exact UTC offset minutes for a given IANA timezone and instant,
 * taking Daylight Saving Time (DST) transitions into account.
 */
export function getTimezoneOffsetMinutes(timeZone: string, date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 0;

  try {
    // Intl.DateTimeFormat can format to parts with timeZoneName: 'shortOffset'
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(d);
    const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value || 'GMT+0';

    // Parse 'GMT+02:00', 'GMT+3', 'GMT-04:00', 'GMT', etc.
    const match = tzPart.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!match) return 0;

    const sign = match[1] === '-' ? -1 : 1;
    const hours = parseInt(match[2], 10);
    const minutes = match[3] ? parseInt(match[3], 10) : 0;

    return sign * (hours * 60 + minutes);
  } catch (e) {
    console.warn(`Could not calculate offset for timezone ${timeZone}`, e);
    return 0;
  }
}

/**
 * Formats an offset in minutes to human readable string like "UTC+03:00" or "GMT+1"
 */
export function formatOffsetMinutes(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Converts a local calendar date ("YYYY-MM-DD") and local time ("HH:MM") in a specific timezone
 * into an absolute UTC Date and ISO string.
 * Also checks whether this local time is ambiguous or nonexistent during DST transitions.
 */
export function localDateTimeToUtcInstant(
  localDate: string,
  localTime: string,
  timeZone: string
): {
  utcDate: Date;
  utcIso: string;
  offsetMinutes: number;
  offsetDisplay: string;
  isDstAmbiguous: boolean;
} {
  const [yearStr, monthStr, dayStr] = localDate.split('-');
  const [hourStr, minStr] = localTime.split(':');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);
  const d = parseInt(dayStr, 10);
  const hh = parseInt(hourStr, 10);
  const mm = parseInt(minStr, 10);

  // Approximate UTC timestamp using UTC constructor
  const approxUtc = new Date(Date.UTC(y, m - 1, d, hh, mm));

  // Determine actual local offset at that instant
  const offset1 = getTimezoneOffsetMinutes(timeZone, approxUtc);

  // Exact UTC instant = localTime - offset
  const exactInstant = new Date(approxUtc.getTime() - offset1 * 60 * 1000);

  // Verify whether the offset shifted (which happens during DST clock changes)
  const offset2 = getTimezoneOffsetMinutes(timeZone, exactInstant);
  const isDstAmbiguous = offset1 !== offset2;

  const finalInstant = isDstAmbiguous
    ? new Date(approxUtc.getTime() - offset2 * 60 * 1000)
    : exactInstant;

  return {
    utcDate: finalInstant,
    utcIso: finalInstant.toISOString(),
    offsetMinutes: offset2,
    offsetDisplay: formatOffsetMinutes(offset2),
    isDstAmbiguous,
  };
}

/**
 * Formats an instant in a specific target timezone (e.g. at meeting airport or traveler's home).
 */
export function formatInstantInTimezone(
  instant: Date | string,
  targetTimeZone: string,
  lang: 'he' | 'en' = 'he'
): {
  dateFormatted: string; // "YYYY-MM-DD"
  timeFormatted: string; // "HH:MM"
  fullDisplay: string;
} {
  const d = typeof instant === 'string' ? new Date(instant) : instant;
  if (isNaN(d.getTime())) {
    return { dateFormatted: '', timeFormatted: '', fullDisplay: '' };
  }

  try {
    const locale = lang === 'he' ? 'he-IL' : 'en-US';
    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone: targetTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(d);
    const year = parts.find((p) => p.type === 'year')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const day = parts.find((p) => p.type === 'day')?.value || '';
    const hour = parts.find((p) => p.type === 'hour')?.value || '';
    const minute = parts.find((p) => p.type === 'minute')?.value || '';

    const dateFormatted = `${year}-${month}-${day}`;
    const timeFormatted = `${hour}:${minute}`;
    const offset = formatOffsetMinutes(getTimezoneOffsetMinutes(targetTimeZone, d));

    return {
      dateFormatted,
      timeFormatted,
      fullDisplay: `${dateFormatted} ${timeFormatted} (${offset}, ${targetTimeZone})`,
    };
  } catch (e) {
    return {
      dateFormatted: '',
      timeFormatted: '',
      fullDisplay: d.toISOString(),
    };
  }
}

/**
 * Multi-Traveler Intermediate Meeting Point Feasibility Analysis
 * Checks whether travelers departing from different countries can meet at a hub airport,
 * considering independent departure windows, travel times, and connection safety buffers.
 */
export interface MultiOriginMeetingCheck {
  meetingLocation: string;
  meetingTimezone: string;
  travelerA: {
    name: string;
    origin: string;
    originTimezone: string;
    earliestDepartureLocal: string;
    flightDurationHours: number;
    arrivalAtHubUtc: string;
    arrivalAtHubLocal: string;
  };
  travelerB: {
    name: string;
    origin: string;
    originTimezone: string;
    earliestDepartureLocal: string;
    flightDurationHours: number;
    arrivalAtHubUtc: string;
    arrivalAtHubLocal: string;
  };
  sharedOnwardFlightDepartureLocal: string;
  sharedOnwardFlightDepartureUtc: string;
  travelerAConnectionBufferHours: number;
  travelerBConnectionBufferHours: number;
  isFeasible: boolean;
  minRecommendedBufferHours: number;
  explanation: {
    he: string;
    en: string;
  };
}

export function evaluateMultiOriginMeeting(params: {
  meetingLocation: string;
  meetingAirport: string;
  meetingTimezone: string;
  onwardFlightDepartureLocalDate: string;
  onwardFlightDepartureLocalTime: string;
  travelerA: {
    name: string;
    origin: string;
    originAirport: string;
    originTimezone: string;
    departureLocalDate: string;
    departureLocalTime: string;
    flightHoursToHub: number;
  };
  travelerB: {
    name: string;
    origin: string;
    originAirport: string;
    originTimezone: string;
    departureLocalDate: string;
    departureLocalTime: string;
    flightHoursToHub: number;
  };
  minBufferHours?: number;
}): MultiOriginMeetingCheck {
  const minBuffer = params.minBufferHours || 2.0;

  // 1. Calculate Traveler A's flight instant and arrival at hub
  const tA_departure = localDateTimeToUtcInstant(
    params.travelerA.departureLocalDate,
    params.travelerA.departureLocalTime,
    params.travelerA.originTimezone
  );
  const tA_arrivalUtc = new Date(
    tA_departure.utcDate.getTime() + params.travelerA.flightHoursToHub * 3600 * 1000
  );
  const tA_arrivalHub = formatInstantInTimezone(tA_arrivalUtc, params.meetingTimezone);

  // 2. Calculate Traveler B's flight instant and arrival at hub
  const tB_departure = localDateTimeToUtcInstant(
    params.travelerB.departureLocalDate,
    params.travelerB.departureLocalTime,
    params.travelerB.originTimezone
  );
  const tB_arrivalUtc = new Date(
    tB_departure.utcDate.getTime() + params.travelerB.flightHoursToHub * 3600 * 1000
  );
  const tB_arrivalHub = formatInstantInTimezone(tB_arrivalUtc, params.meetingTimezone);

  // 3. Shared onward flight departure in meeting airport
  const onwardDeparture = localDateTimeToUtcInstant(
    params.onwardFlightDepartureLocalDate,
    params.onwardFlightDepartureLocalTime,
    params.meetingTimezone
  );

  // 4. Calculate connection buffers in hours
  const bufferA_hours =
    (onwardDeparture.utcDate.getTime() - tA_arrivalUtc.getTime()) / (3600 * 1000);
  const bufferB_hours =
    (onwardDeparture.utcDate.getTime() - tB_arrivalUtc.getTime()) / (3600 * 1000);

  const isFeasible = bufferA_hours >= minBuffer && bufferB_hours >= minBuffer;

  const explHe = isFeasible
    ? `שני הנוסעים מגיעים ל-${params.meetingLocation} עם מרווח ביטחון מספק לפני טיסת ההמשך המשותפת (${bufferA_hours.toFixed(1)} שעות עבור ${params.travelerA.name}, ${bufferB_hours.toFixed(1)} שעות עבור ${params.travelerB.name}).`
    : `התנגשות זמנים: נדרש מרווח חיבור של לפחות ${minBuffer} שעות ב-${params.meetingLocation}. ` +
      (bufferA_hours < minBuffer
        ? `${params.travelerA.name} מגיע/ה מאוחר מדי (מרווח של ${bufferA_hours.toFixed(1)} שעות בלבד). `
        : '') +
      (bufferB_hours < minBuffer
        ? `${params.travelerB.name} מגיע/ה מאוחר מדי (מרווח של ${bufferB_hours.toFixed(1)} שעות בלבד).`
        : '');

  const explEn = isFeasible
    ? `Both travelers arrive at ${params.meetingLocation} with sufficient safety buffer before the shared onward flight (${bufferA_hours.toFixed(1)}h for ${params.travelerA.name}, ${bufferB_hours.toFixed(1)}h for ${params.travelerB.name}).`
    : `Schedule conflict: Minimum ${minBuffer}h buffer required at ${params.meetingLocation}. ` +
      (bufferA_hours < minBuffer
        ? `${params.travelerA.name} arrives too late (only ${bufferA_hours.toFixed(1)}h buffer). `
        : '') +
      (bufferB_hours < minBuffer
        ? `${params.travelerB.name} arrives too late (only ${bufferB_hours.toFixed(1)}h buffer).`
        : '');

  return {
    meetingLocation: params.meetingLocation,
    meetingTimezone: params.meetingTimezone,
    travelerA: {
      name: params.travelerA.name,
      origin: params.travelerA.origin,
      originTimezone: params.travelerA.originTimezone,
      earliestDepartureLocal: `${params.travelerA.departureLocalDate} ${params.travelerA.departureLocalTime}`,
      flightDurationHours: params.travelerA.flightHoursToHub,
      arrivalAtHubUtc: tA_arrivalUtc.toISOString(),
      arrivalAtHubLocal: tA_arrivalHub.fullDisplay,
    },
    travelerB: {
      name: params.travelerB.name,
      origin: params.travelerB.origin,
      originTimezone: params.travelerB.originTimezone,
      earliestDepartureLocal: `${params.travelerB.departureLocalDate} ${params.travelerB.departureLocalTime}`,
      flightDurationHours: params.travelerB.flightHoursToHub,
      arrivalAtHubUtc: tB_arrivalUtc.toISOString(),
      arrivalAtHubLocal: tB_arrivalHub.fullDisplay,
    },
    sharedOnwardFlightDepartureLocal: `${params.onwardFlightDepartureLocalDate} ${params.onwardFlightDepartureLocalTime}`,
    sharedOnwardFlightDepartureUtc: onwardDeparture.utcIso,
    travelerAConnectionBufferHours: Number(bufferA_hours.toFixed(2)),
    travelerBConnectionBufferHours: Number(bufferB_hours.toFixed(2)),
    isFeasible,
    minRecommendedBufferHours: minBuffer,
    explanation: {
      he: explHe,
      en: explEn,
    },
  };
}

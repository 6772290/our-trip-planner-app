export interface NormalizedCity {
  canonicalNameHe: string;
  canonicalNameEn: string;
  regionHe: string;
  isInternational: boolean;
  countryHe: string;
  aliases: string[];
}

export const KNOWN_CITIES: NormalizedCity[] = [
  {
    canonicalNameHe: 'ראשון לציון',
    canonicalNameEn: 'Rishon LeZion',
    regionHe: 'מרכז',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: [
      'ראשון לציון',
      'ראשל"צ',
      'ראשל״צ',
      'ראשלצ',
      'ראשון',
      'ראשון לציון מרכז',
      'rishon lezion',
      'rishon le zion',
      'rishonlezion',
      'rishon',
    ],
  },
  {
    canonicalNameHe: 'תל אביב',
    canonicalNameEn: 'Tel Aviv',
    regionHe: 'מרכז',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: [
      'תל אביב',
      'ת"א',
      'ת״א',
      'תלאביב',
      'תל אביב-יפו',
      'תל-אביב',
      'tel aviv',
      'tel-aviv',
      'tlv',
    ],
  },
  {
    canonicalNameHe: 'ירושלים',
    canonicalNameEn: 'Jerusalem',
    regionHe: 'ירושלים והסביבה',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: ['ירושלים', 'י-ם', 'ירושלים והסביבה', 'jerusalem'],
  },
  {
    canonicalNameHe: 'חיפה',
    canonicalNameEn: 'Haifa',
    regionHe: 'צפון',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: ['חיפה', 'haifa'],
  },
  {
    canonicalNameHe: 'באר שבע',
    canonicalNameEn: 'Beer Sheva',
    regionHe: 'דרום',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: ['באר שבע', 'ב"ש', 'ב״ש', 'בארשבע', 'beer sheva', 'beersheba'],
  },
  {
    canonicalNameHe: 'פתח תקווה',
    canonicalNameEn: 'Petah Tikva',
    regionHe: 'מרכז',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: ['פתח תקווה', 'פ"ת', 'פ״ת', 'פתח תקוה', 'פתח-תקווה', 'petah tikva', 'petach tikva'],
  },
  {
    canonicalNameHe: 'רמת גן',
    canonicalNameEn: 'Ramat Gan',
    regionHe: 'מרכז',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: ['רמת גן', 'ר"ג', 'ר״ג', 'רמת-גן', 'ramat gan'],
  },
  {
    canonicalNameHe: 'הרצליה',
    canonicalNameEn: 'Herzliya',
    regionHe: 'שרון',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: ['הרצליה', 'הרצליה פיתוח', 'herzliya'],
  },
  {
    canonicalNameHe: 'נתניה',
    canonicalNameEn: 'Netanya',
    regionHe: 'שרון',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: ['נתניה', 'netanya'],
  },
  {
    canonicalNameHe: 'אשדוד',
    canonicalNameEn: 'Ashdod',
    regionHe: 'דרום',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: ['אשדוד', 'ashdod'],
  },
  {
    canonicalNameHe: 'אשקלון',
    canonicalNameEn: 'Ashkelon',
    regionHe: 'דרום',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: ['אשקלון', 'ashkelon'],
  },
  {
    canonicalNameHe: 'חולון',
    canonicalNameEn: 'Holon',
    regionHe: 'מרכז',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: ['חולון', 'holon'],
  },
  {
    canonicalNameHe: 'בת ים',
    canonicalNameEn: 'Bat Yam',
    regionHe: 'מרכז',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: ['בת ים', 'בת-ים', 'bat yam'],
  },
  {
    canonicalNameHe: 'אילת',
    canonicalNameEn: 'Eilat',
    regionHe: 'דרום',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: ['אילת', 'eilat'],
  },
  {
    canonicalNameHe: 'טבריה',
    canonicalNameEn: 'Tiberias',
    regionHe: 'צפון',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: ['טבריה', 'כינרת', 'tiberias'],
  },
  {
    canonicalNameHe: 'רמת הגולן',
    canonicalNameEn: 'Golan Heights',
    regionHe: 'צפון',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: ['רמת הגולן', 'גולן', 'golan'],
  },
  {
    canonicalNameHe: 'גליל',
    canonicalNameEn: 'Galilee',
    regionHe: 'צפון',
    isInternational: false,
    countryHe: 'ישראל',
    aliases: ['גליל', 'גליל עליון', 'גליל מערבי', 'צפון', 'בצפון', 'galilee'],
  },
  // International cities
  {
    canonicalNameHe: 'פירנצה',
    canonicalNameEn: 'Florence',
    regionHe: 'טוסקנה',
    isInternational: true,
    countryHe: 'איטליה',
    aliases: ['פירנצה', 'florence', 'firenze'],
  },
  {
    canonicalNameHe: 'רומא',
    canonicalNameEn: 'Rome',
    regionHe: 'לאציו',
    isInternational: true,
    countryHe: 'איטליה',
    aliases: ['רומא', 'rome', 'roma'],
  },
  {
    canonicalNameHe: 'מילאנו',
    canonicalNameEn: 'Milan',
    regionHe: 'לומברדיה',
    isInternational: true,
    countryHe: 'איטליה',
    aliases: ['מילאנו', 'milan', 'milano'],
  },
  {
    canonicalNameHe: 'לונדון',
    canonicalNameEn: 'London',
    regionHe: 'בריטניה',
    isInternational: true,
    countryHe: 'בריטניה',
    aliases: ['לונדון', 'london'],
  },
  {
    canonicalNameHe: 'פריז',
    canonicalNameEn: 'Paris',
    regionHe: 'צרפת',
    isInternational: true,
    countryHe: 'צרפת',
    aliases: ['פריז', 'פאריס', 'paris'],
  },
];

/**
 * Normalizes any text to find known city names with support for abbreviations,
 * typos, missing quotes (e.g. ראשלצ instead of ראשל"צ) and English names.
 */
export function resolveNormalizedCity(text: string): NormalizedCity | null {
  if (!text) return null;
  const clean = text.trim().toLowerCase();

  // Strip common punctuation for matching
  const stripped = clean.replace(/["״׳'״]/g, '');

  for (const city of KNOWN_CITIES) {
    for (const alias of city.aliases) {
      const aliasClean = alias.toLowerCase();
      const aliasStripped = aliasClean.replace(/["״׳'״]/g, '');

      // Check exact match or token boundaries
      if (clean === aliasClean || stripped === aliasStripped) {
        return city;
      }

      // Check within text surrounded by word boundaries or Hebrew prefixes (ב, ל, מ)
      const regexStr = `(?:^|[\\s,.;!?]|\\b|[בלמ])(?:${escapeRegex(aliasClean)}|${escapeRegex(aliasStripped)})(?:$|[\\s,.;!?]|\\b)`;
      const regex = new RegExp(regexStr, 'i');
      if (regex.test(clean) || regex.test(stripped)) {
        return city;
      }
    }
  }

  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface ContextualLocationAnalysis {
  otherParticipantLocation?: {
    participantRole: string; // e.g. "הבן שלי"
    city: NormalizedCity;
    contextDescriptionHe: string;
    suggestedClarificationHe: string;
    suggestedClarificationEn: string;
  };
  explicitDepartureCity?: NormalizedCity;
  explicitDestinationCity?: NormalizedCity;
  meetingPointCity?: NormalizedCity;
  isFlightImplied: boolean;
}

/**
 * Parses syntactic role of locations in sentence:
 * "הבן שלי לומד בראשלצ ואני רוצה להוציא אותו היום לבילוי"
 * -> Participant: Son
 * -> Son's location: Rishon LeZion
 * -> NOT user's permanent home!
 * -> NOT auto-departure!
 * -> Asks focused clarification whether to spend time in Rishon LeZion or pick him up to elsewhere.
 */
export function analyzeContextualLocations(text: string): ContextualLocationAnalysis {
  const clean = text.trim();
  const result: ContextualLocationAnalysis = {
    isFlightImplied: false,
  };

  // 1. Check for participant-linked location (e.g. "הבן שלי לומד בראשלצ", "הבת שלי ב...", "חבר שגר ב...")
  const participantLocMatch = clean.match(
    /(הבן שלי|הבת שלי|הילד שלי|הילדה שלי|חבר שלי|חברה שלי|אבא שלי|אמא שלי|אשתי|בעלי|בן זוגי|בת זוגי)\s+(?:שלומד|שלומדת|לומד|לומדת|גר|גרה|נמצא|נמצאת|עובד|עובדת|בצבא)\s+(?:ב|ב-|בתוך\s+)?([^\s,.;!?]+(?:\s+[^\s,.;!?]+)?)/
  );

  if (participantLocMatch) {
    const role = participantLocMatch[1];
    const rawPlace = participantLocMatch[2];
    const resolvedCity = resolveNormalizedCity(rawPlace);

    if (resolvedCity) {
      result.otherParticipantLocation = {
        participantRole: role,
        city: resolvedCity,
        contextDescriptionHe: `${role} נמצא/לומד ב${resolvedCity.canonicalNameHe}`,
        suggestedClarificationHe: `${role} נמצא ב${resolvedCity.canonicalNameHe}. תרצו לבלות באזור, או לאסוף אותו ולנסוע למקום אחר?`,
        suggestedClarificationEn: `Your ${role} is in ${resolvedCity.canonicalNameEn}. Would you prefer to hang out nearby, or pick him up and head elsewhere?`,
      };
    }
  }

  // 2. Explicit departure phrases: "יוצאים מ...", "אני יוצא מ...", "נסיעה מ...", "נקודת יציאה..."
  const departureMatch = clean.match(
    /(?:יוצאים מ|אני יוצא מ|אנחנו יוצאים מ|יציאה מ|ניסע מ|לצאת מ|מתחילים מ)\s*([^\s,.;!?]+(?:\s+[^\s,.;!?]+)?)/
  );
  if (departureMatch) {
    const depCity = resolveNormalizedCity(departureMatch[1]);
    if (depCity) {
      result.explicitDepartureCity = depCity;
    }
  }

  // 3. Meeting point phrases: "לאסוף מ...", "איסוף מ...", "נפגשים ב...", "מפגש ב..."
  const meetingMatch = clean.match(
    /(?:לאסוף מ|איסוף מ|אאסוף אותו מ|לאסוף אותה מ|נפגשים ב|מפגש ב)\s*([^\s,.;!?]+(?:\s+[^\s,.;!?]+)?)/
  );
  if (meetingMatch) {
    const meetCity = resolveNormalizedCity(meetingMatch[1]);
    if (meetCity) {
      result.meetingPointCity = meetCity;
    }
  }

  // 4. Explicit destination phrases: "לנסוע ל...", "בילוי ב...", "מסעדה ב...", "לטייל ב...", "הופעה ב..."
  const destinationMatch = clean.match(
    /(?:לנסוע ל|בילוי ב|מסעדה ב|לטייל ב|הופעה ב|צימר ב|מלון ב|חופשה ב|לטוס ל)\s*([^\s,.;!?]+(?:\s+[^\s,.;!?]+)?)/
  );
  if (destinationMatch) {
    const destCity = resolveNormalizedCity(destinationMatch[1]);
    if (destCity) {
      result.explicitDestinationCity = destCity;
    }
  }

  // Fallback: If no other participant location was extracted, check if a city was mentioned generally
  if (!result.otherParticipantLocation && !result.explicitDestinationCity && !result.explicitDepartureCity) {
    const generalCity = resolveNormalizedCity(clean);
    if (generalCity) {
      // If it's an outing or food request, it is an intended destination/area, NEVER assumed user's permanent home
      result.explicitDestinationCity = generalCity;
    }
  }

  // Check if international flight is implied
  const isInternationalDest =
    (result.explicitDestinationCity && result.explicitDestinationCity.isInternational) ||
    clean.includes('איטליה') ||
    clean.includes('רומא') ||
    clean.includes('פריז') ||
    clean.includes('אירופה') ||
    clean.includes('חו״ל') ||
    clean.includes('חול') ||
    clean.includes('ארה״ב') ||
    clean.includes('ארצות הברית');

  if (
    clean.includes('טיסה') ||
    clean.includes('לטוס') ||
    clean.includes('טיסות') ||
    isInternationalDest
  ) {
    result.isFlightImplied = true;
  }

  return result;
}

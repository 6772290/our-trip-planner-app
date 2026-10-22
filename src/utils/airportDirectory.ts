export interface Airport {
  iata: string;
  icao?: string;
  nameHe: string;
  nameEn: string;
  cityHe: string;
  cityEn: string;
  countryHe: string;
  countryEn: string;
  altNames: string[];
}

export const AIRPORT_DIRECTORY_DISCLAIMER_HE =
  'חיפוש במאגר נמלי תעופה בינלאומיים נבחרים. בשלב הבא יחובר המאגר הגלובלי המלא של IATA ו-ICAO.';
export const AIRPORT_DIRECTORY_DISCLAIMER_EN =
  'Searching curated top international airports. Full global IATA & ICAO registry will connect in the next phase.';

export const MAJOR_AIRPORTS: Airport[] = [
  // Israel
  {
    iata: 'TLV',
    icao: 'LLBG',
    nameHe: 'נמל התעופה בן גוריון',
    nameEn: 'Ben Gurion Airport',
    cityHe: 'תל אביב',
    cityEn: 'Tel Aviv',
    countryHe: 'ישראל',
    countryEn: 'Israel',
    altNames: ['נתב"ג', 'נתבג', 'בן גוריון', 'Ben Gurion', 'Tel Aviv Airport', 'Lod'],
  },
  {
    iata: 'ETM',
    icao: 'LLER',
    nameHe: 'נמל התעופה רמון',
    nameEn: 'Ramon Airport',
    cityHe: 'אילת',
    cityEn: 'Eilat',
    countryHe: 'ישראל',
    countryEn: 'Israel',
    altNames: ['רמון', 'תמנע', 'אילת', 'Ramon', 'Timna'],
  },

  // Italy (including Milan airports per user example)
  {
    iata: 'MXP',
    icao: 'LIMC',
    nameHe: 'נמל התעופה מילאנו מלפנזה',
    nameEn: 'Milan Malpensa Airport',
    cityHe: 'מילאנו',
    cityEn: 'Milan',
    countryHe: 'איטליה',
    countryEn: 'Italy',
    altNames: ['מלפנסה', 'מלפנזה', 'מילאנו', 'Malpensa', 'Milano'],
  },
  {
    iata: 'LIN',
    icao: 'LIML',
    nameHe: 'נמל התעופה מילאנו לינאטה',
    nameEn: 'Milan Linate Airport',
    cityHe: 'מילאנו',
    cityEn: 'Milan',
    countryHe: 'איטליה',
    countryEn: 'Italy',
    altNames: ['לינאטה', 'לינטה', 'Linate'],
  },
  {
    iata: 'BGY',
    icao: 'LIME',
    nameHe: 'נמל התעופה מילאנו ברגמו (אוריו אל סריו)',
    nameEn: 'Milan Bergamo Airport (Orio al Serio)',
    cityHe: 'ברגמו / מילאנו',
    cityEn: 'Bergamo / Milan',
    countryHe: 'איטליה',
    countryEn: 'Italy',
    altNames: ['ברגמו', 'אוריו אל סריו', 'Bergamo', 'Orio al Serio'],
  },
  {
    iata: 'FCO',
    icao: 'LIRF',
    nameHe: 'נמל התעופה רומא פיומיצ׳ינו (לאונרדו דה וינצ׳י)',
    nameEn: 'Rome Fiumicino Leonardo da Vinci Airport',
    cityHe: 'רומא',
    cityEn: 'Rome',
    countryHe: 'איטליה',
    countryEn: 'Italy',
    altNames: ['פיומיצ׳ינו', 'רומא', 'Leonardo da Vinci', 'Fiumicino'],
  },
  {
    iata: 'CIA',
    icao: 'LIRA',
    nameHe: 'נמל התעופה רומא צ׳אמפינו',
    nameEn: 'Rome Ciampino Airport',
    cityHe: 'רומא',
    cityEn: 'Rome',
    countryHe: 'איטליה',
    countryEn: 'Italy',
    altNames: ['צ׳אמפינו', 'צמפינו', 'Ciampino'],
  },
  {
    iata: 'VCE',
    icao: 'LIPZ',
    nameHe: 'נמל התעופה ונציה מרקו פולו',
    nameEn: 'Venice Marco Polo Airport',
    cityHe: 'ונציה',
    cityEn: 'Venice',
    countryHe: 'איטליה',
    countryEn: 'Italy',
    altNames: ['מרקו פולו', 'ונציה', 'Venice', 'Marco Polo'],
  },

  // UK
  {
    iata: 'LHR',
    icao: 'EGLL',
    nameHe: 'נמל התעופה לונדון הית׳רו',
    nameEn: 'London Heathrow Airport',
    cityHe: 'לונדון',
    cityEn: 'London',
    countryHe: 'בריטניה',
    countryEn: 'United Kingdom',
    altNames: ['היתרו', 'הית׳רו', 'Heathrow', 'London'],
  },
  {
    iata: 'LGW',
    icao: 'EGKK',
    nameHe: 'נמל התעופה לונדון גטוויק',
    nameEn: 'London Gatwick Airport',
    cityHe: 'לונדון',
    cityEn: 'London',
    countryHe: 'בריטניה',
    countryEn: 'United Kingdom',
    altNames: ['גטוויק', 'גאטוויק', 'Gatwick'],
  },
  {
    iata: 'LTN',
    icao: 'EGGW',
    nameHe: 'נמל התעופה לונדון לוטון',
    nameEn: 'London Luton Airport',
    cityHe: 'לונדון',
    cityEn: 'London',
    countryHe: 'בריטניה',
    countryEn: 'United Kingdom',
    altNames: ['לוטון', 'Luton'],
  },

  // France
  {
    iata: 'CDG',
    icao: 'LFPG',
    nameHe: 'נמל התעופה פריז שארל דה גול',
    nameEn: 'Paris Charles de Gaulle Airport',
    cityHe: 'פריז',
    cityEn: 'Paris',
    countryHe: 'צרפת',
    countryEn: 'France',
    altNames: ['שארל דה גול', 'רואסי', 'Charles de Gaulle', 'Roissy'],
  },
  {
    iata: 'ORY',
    icao: 'LFPO',
    nameHe: 'נמל התעופה פריז אורלי',
    nameEn: 'Paris Orly Airport',
    cityHe: 'פריז',
    cityEn: 'Paris',
    countryHe: 'צרפת',
    countryEn: 'France',
    altNames: ['אורלי', 'Orly'],
  },
  {
    iata: 'NCE',
    icao: 'LFMN',
    nameHe: 'נמל התעופה ניס קוט ד׳אזור',
    nameEn: 'Nice Côte d’Azur Airport',
    cityHe: 'ניס',
    cityEn: 'Nice',
    countryHe: 'צרפת',
    countryEn: 'France',
    altNames: ['ניס', 'הריביירה הצרפתית', 'Nice', 'Cote d Azur'],
  },

  // Germany
  {
    iata: 'FRA',
    icao: 'EDDF',
    nameHe: 'נמל התעופה פרנקפורט',
    nameEn: 'Frankfurt Airport',
    cityHe: 'פרנקפורט',
    cityEn: 'Frankfurt',
    countryHe: 'גרמניה',
    countryEn: 'Germany',
    altNames: ['פרנקפורט מיין', 'Frankfurt am Main'],
  },
  {
    iata: 'MUC',
    icao: 'EDDM',
    nameHe: 'נמל התעופה מינכן (פרנץ יוזף שטראוס)',
    nameEn: 'Munich Airport',
    cityHe: 'מינכן',
    cityEn: 'Munich',
    countryHe: 'גרמניה',
    countryEn: 'Germany',
    altNames: ['מינכן', 'בואריה', 'Munich', 'Muenchen'],
  },
  {
    iata: 'BER',
    icao: 'EDDB',
    nameHe: 'נמל התעופה ברלין ברנדנבורג',
    nameEn: 'Berlin Brandenburg Airport',
    cityHe: 'ברלין',
    cityEn: 'Berlin',
    countryHe: 'גרמניה',
    countryEn: 'Germany',
    altNames: ['ברנדנבורג', 'ברלין', 'Brandenburg', 'Berlin'],
  },

  // Spain
  {
    iata: 'BCN',
    icao: 'LEBL',
    nameHe: 'נמל התעופה ברצלונה אל פראט',
    nameEn: 'Barcelona–El Prat Airport',
    cityHe: 'ברצלונה',
    cityEn: 'Barcelona',
    countryHe: 'ספרד',
    countryEn: 'Spain',
    altNames: ['אל פראט', 'ברצלונה', 'El Prat'],
  },
  {
    iata: 'MAD',
    icao: 'LEMD',
    nameHe: 'נמל התעופה מדריד בראחס (אדולפו סוארס)',
    nameEn: 'Adolfo Suárez Madrid–Barajas Airport',
    cityHe: 'מדריד',
    cityEn: 'Madrid',
    countryHe: 'ספרד',
    countryEn: 'Spain',
    altNames: ['בראחס', 'מדריד', 'Barajas'],
  },

  // Netherlands & Central Europe
  {
    iata: 'AMS',
    icao: 'EHAM',
    nameHe: 'נמל התעופה אמסטרדם סכיפהול',
    nameEn: 'Amsterdam Airport Schiphol',
    cityHe: 'אמסטרדם',
    cityEn: 'Amsterdam',
    countryHe: 'הולנד',
    countryEn: 'Netherlands',
    altNames: ['סכיפהול', 'סחיפהול', 'Schiphol'],
  },
  {
    iata: 'VIE',
    icao: 'LOWW',
    nameHe: 'נמל התעופה הבינלאומי וינה (שווכאט)',
    nameEn: 'Vienna International Airport',
    cityHe: 'וינה',
    cityEn: 'Vienna',
    countryHe: 'אוסטריה',
    countryEn: 'Austria',
    altNames: ['שווכאט', 'וינה', 'Schwechat', 'Vienna'],
  },
  {
    iata: 'PRG',
    icao: 'LKPR',
    nameHe: 'נמל התעופה פראג (ואצלב האבל)',
    nameEn: 'Václav Havel Airport Prague',
    cityHe: 'פראג',
    cityEn: 'Prague',
    countryHe: 'צ׳כיה',
    countryEn: 'Czech Republic',
    altNames: ['ואצלב האבל', 'רוזינה', 'Praha', 'Vaclav Havel'],
  },
  {
    iata: 'BUD',
    icao: 'LHBP',
    nameHe: 'נמל התעופה בודפשט (פרנץ ליסט)',
    nameEn: 'Budapest Ferenc Liszt International Airport',
    cityHe: 'בודפשט',
    cityEn: 'Budapest',
    countryHe: 'הונגריה',
    countryEn: 'Hungary',
    altNames: ['פריגיהג׳', 'פרנץ ליסט', 'Ferihegy', 'Ferenc Liszt'],
  },
  {
    iata: 'ATH',
    icao: 'LGAV',
    nameHe: 'נמל התעופה אתונה (אלפתריוס וניזלוס)',
    nameEn: 'Athens International Airport (Eleftherios Venizelos)',
    cityHe: 'אתונה',
    cityEn: 'Athens',
    countryHe: 'יוון',
    countryEn: 'Greece',
    altNames: ['וניזלוס', 'אתונה', 'Venizelos', 'Athens'],
  },
  {
    iata: 'LCA',
    icao: 'LCLK',
    nameHe: 'נמל התעופה הבינלאומי לרנקה',
    nameEn: 'Larnaca International Airport',
    cityHe: 'לרנקה',
    cityEn: 'Larnaca',
    countryHe: 'קפריסין',
    countryEn: 'Cyprus',
    altNames: ['לרנקה', 'קפריסין', 'Larnaca'],
  },

  // North America
  {
    iata: 'JFK',
    icao: 'KJFK',
    nameHe: 'נמל התעופה ניו יורק קנדי (JFK)',
    nameEn: 'John F. Kennedy International Airport',
    cityHe: 'ניו יורק',
    cityEn: 'New York',
    countryHe: 'ארה״ב',
    countryEn: 'United States',
    altNames: ['קנדי', 'ניו יורק', 'JFK', 'Kennedy', 'Queens'],
  },
  {
    iata: 'EWR',
    icao: 'KEWR',
    nameHe: 'נמל התעופה ניוארק ליברטי',
    nameEn: 'Newark Liberty International Airport',
    cityHe: 'ניוארק / ניו יורק',
    cityEn: 'Newark / New York',
    countryHe: 'ארה״ב',
    countryEn: 'United States',
    altNames: ['ניוארק', 'Newark', 'New Jersey'],
  },
  {
    iata: 'LAX',
    icao: 'KLAX',
    nameHe: 'נמל התעופה הבינלאומי לוס אנג׳לס',
    nameEn: 'Los Angeles International Airport',
    cityHe: 'לוס אנג׳לס',
    cityEn: 'Los Angeles',
    countryHe: 'ארה״ב',
    countryEn: 'United States',
    altNames: ['לוס אנגלס', 'קליפורניה', 'LAX', 'California'],
  },
  {
    iata: 'MIA',
    icao: 'KMIA',
    nameHe: 'נמל התעופה הבינלאומי מיאמי',
    nameEn: 'Miami International Airport',
    cityHe: 'מיאמי',
    cityEn: 'Miami',
    countryHe: 'ארה״ב',
    countryEn: 'United States',
    altNames: ['מיאמי', 'פלורידה', 'Miami', 'Florida'],
  },

  // UAE & Asia
  {
    iata: 'DXB',
    icao: 'OMDB',
    nameHe: 'נמל התעופה הבינלאומי דובאי',
    nameEn: 'Dubai International Airport',
    cityHe: 'דובאי',
    cityEn: 'Dubai',
    countryHe: 'איחוד האמירויות',
    countryEn: 'United Arab Emirates',
    altNames: ['דובאי', 'Dubai', 'UAE'],
  },
  {
    iata: 'HND',
    icao: 'RJTT',
    nameHe: 'נמל התעופה טוקיו האנדה',
    nameEn: 'Tokyo Haneda Airport',
    cityHe: 'טוקיו',
    cityEn: 'Tokyo',
    countryHe: 'יפן',
    countryEn: 'Japan',
    altNames: ['האנדה', 'טוקיו', 'Haneda', 'Tokyo'],
  },
  {
    iata: 'NRT',
    icao: 'RJAA',
    nameHe: 'נמל התעופה טוקיו נאריטה',
    nameEn: 'Narita International Airport',
    cityHe: 'טוקיו',
    cityEn: 'Tokyo',
    countryHe: 'יפן',
    countryEn: 'Japan',
    altNames: ['נאריטה', 'Narita'],
  },
  {
    iata: 'BKK',
    icao: 'VTBS',
    nameHe: 'נמל התעופה בנגקוק סוברנבהומי',
    nameEn: 'Suvarnabhumi Airport Bangkok',
    cityHe: 'בנגקוק',
    cityEn: 'Bangkok',
    countryHe: 'תאילנד',
    countryEn: 'Thailand',
    altNames: ['סוברנבומי', 'בנגקוק', 'Suvarnabhumi'],
  },
  {
    iata: 'SIN',
    icao: 'WSSS',
    nameHe: 'נמל התעופה סינגפור צ׳אנגי',
    nameEn: 'Singapore Changi Airport',
    cityHe: 'סינגפור',
    cityEn: 'Singapore',
    countryHe: 'סינגפור',
    countryEn: 'Singapore',
    altNames: ['צ׳אנגי', 'צנגי', 'Changi'],
  },
];

/**
 * Format standard airport display label:
 * Example Hebrew: "נמל התעופה מילאנו מלפנזה — מילאנו, איטליה (MXP)"
 * Example English: "Milan Malpensa Airport — Milan, Italy (MXP)"
 */
export function formatAirportOption(airport: Airport, lang: 'he' | 'en' = 'he'): string {
  if (lang === 'he') {
    return `${airport.nameHe} — ${airport.cityHe}, ${airport.countryHe} (${airport.iata})`;
  }
  return `${airport.nameEn} — ${airport.cityEn}, ${airport.countryEn} (${airport.iata})`;
}

/**
 * Search airports across name, city, country, alternative aliases, and 3-letter IATA code
 */
export function searchAirports(query: string, lang: 'he' | 'en' = 'he', limit: number = 8): Airport[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return MAJOR_AIRPORTS.slice(0, limit);
  }

  return MAJOR_AIRPORTS.filter((airport) => {
    if (airport.iata.toLowerCase().includes(q)) return true;
    if (airport.icao?.toLowerCase().includes(q)) return true;
    if (airport.nameHe.toLowerCase().includes(q)) return true;
    if (airport.nameEn.toLowerCase().includes(q)) return true;
    if (airport.cityHe.toLowerCase().includes(q)) return true;
    if (airport.cityEn.toLowerCase().includes(q)) return true;
    if (airport.countryHe.toLowerCase().includes(q)) return true;
    if (airport.countryEn.toLowerCase().includes(q)) return true;
    if (airport.altNames.some((alt) => alt.toLowerCase().includes(q))) return true;
    return false;
  }).slice(0, limit);
}

/**
 * Find airport by IATA code
 */
export function findAirportByIata(iata: string): Airport | undefined {
  const code = iata.trim().toUpperCase();
  return MAJOR_AIRPORTS.find((a) => a.iata === code);
}

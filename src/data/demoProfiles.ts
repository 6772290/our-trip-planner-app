import { UserProfile, ContactPerson, SavedGroup } from '../types/experience';

/**
 * Empty profile generator for brand new users.
 * Starts with zero invented details: no fake name, no location, no contacts, no preferences.
 */
export function createEmptyUserProfile(): UserProfile {
  return {
    id: `user_${Date.now()}`,
    fullName: '',
    permanentHomeLocation: '',
    defaultActivityDepartureLocation: '',
    preferences: [],
    quietDefaultEnabled: true,
    allowPartnerPreferencesSync: false,
    isDemo: false,
  };
}

/**
 * Isolated DEMO dataset.
 * Used exclusively when the user explicitly clicks "Load Demo Data"
 * to explore the application capabilities.
 */
export const DEMO_PROFILE: UserProfile = {
  id: 'demo_user_dan',
  fullName: 'דן כהן (פרופיל הדגמה)',
  permanentHomeLocation: 'תל אביב, ישראל',
  defaultActivityDepartureLocation: 'רמת החייל (משרד)',
  quietDefaultEnabled: true,
  allowPartnerPreferencesSync: true,
  isDemo: true,
  preferences: [
    {
      id: 'pref_1',
      category: 'dietary',
      label: 'קולינריה איטלקית ופסטה טרייה',
      provenance: 'confirmed',
      scope: 'partner_only',
      notes: 'אושר על ידך — עדיפות למסעדות שף אותנטיות',
    },
    {
      id: 'pref_2',
      category: 'culture',
      label: 'מוזיקה חיה וקונצרטים קלאסיים (ואלסים, אנדרה ריו, תזמורות)',
      provenance: 'confirmed',
      scope: 'group',
      notes: 'אושר על ידך בהעדפות הפנאי',
    },
    {
      id: 'pref_3',
      category: 'dietary',
      label: 'בת הזוג נמנעת מגלוטן (הערכה ראשונית)',
      provenance: 'estimate',
      scope: 'partner_only',
      notes: 'הערכה שסיפקת לגבי שותפתך — דורש אימות ישיר מולה',
    },
    {
      id: 'pref_4',
      category: 'atmosphere',
      label: 'שמירה על לילה שקט לפני יום עבודה (חזרה עד 23:30)',
      provenance: 'inferred',
      scope: 'private',
      notes: 'הסקה של המערכת בהתאם ללוח הזמנים השבועי',
    },
  ],
};

export const DEMO_CONTACTS: ContactPerson[] = [
  {
    id: 'demo_c_michal',
    name: 'מיכל כהן (בת זוג - הדגמה)',
    relationship: 'בת זוג',
    interestInActivitiesTogether: 'yes',
    privateNotes: 'שותפה מועדפת לכל הופעה, חופשה ואירוע קולינרי',
    permanentHome: 'תל אביב, ישראל',
    confirmedPreferences: ['מוזיקה קלאסית', 'סיורי אמנות'],
    estimatedPreferences: ['העדפת אוכל ללא גלוטן', 'מופעי חוצות תחת כיפת השמיים'],
    isDemo: true,
  },
  {
    id: 'demo_c_yoni',
    name: 'יוני לוי (חבר ילדות - הדגמה)',
    relationship: 'חבר קרוב',
    interestInActivitiesTogether: 'yes',
    privateNotes: 'מתאים לטיולי שטח, מסלולי טבע ואירועי ספורט',
    permanentHome: 'גבעתיים, ישראל',
    confirmedPreferences: ['טיולי שטח', 'כדורסל'],
    estimatedPreferences: ['בירות בוטיק', 'יציאות בסופי שבוע בלבד'],
    isDemo: true,
  },
  {
    id: 'demo_c_roei',
    name: 'רועי ברק (עמית לעבודה - הדגמה)',
    relationship: 'קולגה מהעבודה',
    interestInActivitiesTogether: 'maybe',
    privateNotes: 'מתאים למיטאפים מקצועיים ואירועי חברה בלבד',
    permanentHome: 'הרצליה, ישראל',
    confirmedPreferences: ['טכנולוגיה'],
    estimatedPreferences: ['פאבים שקטים'],
    isDemo: true,
  },
];

export const DEMO_SAVED_GROUPS: SavedGroup[] = [
  {
    id: 'demo_grp_couple',
    name: 'אנחנו (חופשה זוגית - הדגמה)',
    type: 'couple',
    memberContactIds: ['demo_c_michal'],
    sharedInterests: ['קונצרטים', 'מסעדות שף', 'סופי שבוע רומנטיים באירופה'],
    isDemo: true,
  },
  {
    id: 'demo_grp_friends',
    name: 'החבר׳ה מהאוניברסיטה (הדגמה)',
    type: 'friends',
    memberContactIds: ['demo_c_yoni', 'demo_c_roei'],
    sharedInterests: ['טיולי טבע', 'פאבים', 'הופעות חיות'],
    isDemo: true,
  },
];

export type ProvenanceType = 'confirmed' | 'estimate' | 'inferred';

export type PreferenceShareScope = 'private' | 'partner_only' | 'group' | 'public';

export type AffinityLevel = 'yes' | 'maybe' | 'prefer_not';

export interface ProvenanceBadgeInfo {
  labelHe: string;
  labelEn: string;
  descriptionHe: string;
  descriptionEn: string;
  colorClass: string;
}

export const PROVENANCE_DETAILS: Record<ProvenanceType, ProvenanceBadgeInfo> = {
  confirmed: {
    labelHe: 'מאושר על ידך',
    labelEn: 'User-Confirmed',
    descriptionHe: 'מידע ישיר ומדויק שנמסר ואושר במפורש על ידך',
    descriptionEn: 'Direct, accurate information explicitly stated and verified by you',
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  estimate: {
    labelHe: 'הערכה לגבי שותף',
    labelEn: 'Partner Estimate',
    descriptionHe: 'הערכה שסיפקת לגבי שותף/ת לנסיעה (טרם אושר ישירות על ידו)',
    descriptionEn: 'An estimate provided about another traveler (not yet verified directly by them)',
    colorClass: 'bg-blue-50 text-blue-800 border-blue-300',
  },
  inferred: {
    labelHe: 'הסקה ראשונית - טעון אישור',
    labelEn: 'System Inferred - Needs Confirmation',
    descriptionHe: 'מסקנה של המערכת מתוך הטקסט או ההקשר — לא נקבעה כעובדה ללא אישורך',
    descriptionEn: 'Inferred by the system from context — never treated as fact without your confirmation',
    colorClass: 'bg-amber-50 text-amber-800 border-amber-300',
  },
};

export interface PreferenceItem {
  id: string;
  category: 'dietary' | 'culture' | 'music' | 'mobility' | 'budget' | 'atmosphere' | 'other';
  label: string;
  provenance: ProvenanceType;
  scope: PreferenceShareScope;
  notes?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  permanentHomeLocation: string; // e.g. "תל אביב, ישראל" (Permanent Residence)
  defaultActivityDepartureLocation: string; // e.g. "משרד / רמת החייל" (Where they depart from for evening plans)
  preferences: PreferenceItem[];
  quietDefaultEnabled: boolean; // default: true - no spam notifications or proactive prompts without explicit request
  allowPartnerPreferencesSync: boolean;
}

export interface ContactPerson {
  id: string;
  name: string;
  relationship: string; // e.g. "בת זוג", "חבר מהלימודים", "עמית מהעבודה"
  interestInActivitiesTogether: AffinityLevel; // CRITICAL PRIVACY: Never exposed or leaked to contact!
  privateNotes: string; // CRITICAL PRIVACY: private to user
  permanentHome?: string;
  estimatedPreferences: string[];
  confirmedPreferences?: string[];
}

export interface SavedGroup {
  id: string;
  name: string;
  type: 'couple' | 'friends' | 'family' | 'culture_club';
  memberContactIds: string[];
  sharedInterests: string[];
  notes?: string;
}

export type ActivityAudience = 'solo' | 'couple' | 'saved_group' | 'custom';

export type ActivityCategory =
  | 'surprise'
  | 'culture_events'
  | 'food_entertainment'
  | 'trips_vacations';

export type TransportMode = 'walk' | 'car' | 'transit_train' | 'flight' | 'undecided';

export interface LocationBreakdown {
  permanentHome: string; // Home residence (never auto-assumed without user)
  activityDepartureLocation: string; // Distinct: Where the user actually departs from for the activity
  destinationLocation: string; // Activity destination (city, venue, country)
  transportMode: TransportMode;
  isFlightRequired: boolean;
  departureAirport?: string;
  destinationAirport?: string;
}

export interface ExperienceRequest {
  id: string;
  freeText: string;
  category: ActivityCategory;
  audience: ActivityAudience;
  selectedGroupId?: string;
  selectedContactIds: string[];
  locations: LocationBreakdown;
  timeframeText: string;
  parsedSummary?: string;
  missingClarifications: string[]; // Questions only for genuinely missing information
  status: 'draft' | 'analyzed' | 'ready';
  createdAt: string;
}

export interface PoliteDeclineOption {
  id: string;
  titleHe: string;
  titleEn: string;
  textHe: string;
  textEn: string;
  tone: 'warm' | 'brief' | 'respectful' | 'work_neutral';
}

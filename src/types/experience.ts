export type CertaintyLevel =
  | 'explicit'            // Stated directly by the user in the prompt
  | 'profile_confirmed'    // Verified in the user's saved profile
  | 'partner_estimate'     // Stated as an estimate about someone else
  | 'inferred_provisional'; // Provisional hypothesis by the system (must not be treated as fact)

export type ProvenanceType = 'confirmed' | 'estimate' | 'inferred';

export type PreferenceShareScope = 'private' | 'partner_only' | 'group' | 'public';

export type AffinityLevel = 'yes' | 'maybe' | 'prefer_not';

export type RequestStatus =
  | 'understood'           // Request parsed, core parameters clear
  | 'missing_details'      // Essential details are missing before a search can happen
  | 'ready_for_search'     // All necessary criteria in place for an external search
  | 'verified_results'     // Results from a real connected data source
  | 'no_source_connected'; // No live source connected; concepts/ideas only

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

export interface ExtractedFact {
  id: string;
  key: string;
  labelHe: string;
  labelEn: string;
  value: string;
  certainty: CertaintyLevel;
  sourceNoteHe: string;
  sourceNoteEn: string;
  isConfirmed: boolean;
}

export interface TimeWindow {
  id: string;
  label: string; // e.g. "חלון א׳: 4 ימים בשבוע ראשון"
  startDate?: string;
  endDate?: string;
  durationDaysMin?: number;
  durationDaysMax?: number;
  preferredDaysOfWeek?: number[]; // 0=Sunday
  isFlexible: boolean;
  notes?: string;
}

export interface ConstraintItem {
  id: string;
  type:
    | 'timeframe'
    | 'location_departure'
    | 'location_destination'
    | 'shabbat_holiday'
    | 'dietary_kosher'
    | 'budget'
    | 'artist_event'
    | 'transport'
    | 'mobility';
  subtype?: string; // Specific Shabbat or presence constraint classification
  descriptionHe: string;
  descriptionEn: string;
  isHardConstraint: boolean; // true = קשיח בלתי מתפשר; false = העדפה רכה וגמישה
  certainty: CertaintyLevel;
  sourceText?: string;
  targetDate?: string;
  targetTime?: string;
}

export interface ClarificationQuestion {
  id: string;
  questionHe: string;
  questionEn: string;
  contextNoteHe?: string;
  contextNoteEn?: string;
  targetField: string;
  options: Array<{
    id: string;
    labelHe: string;
    labelEn: string;
    payloadValue: any;
  }>;
  allowFreeText?: boolean;
}

export interface ConceptualIdea {
  id: string;
  titleHe: string;
  titleEn: string;
  category: string;
  descriptionHe: string;
  descriptionEn: string;
  locationHe: string;
  locationEn: string;
  disclaimerHe: string;
  disclaimerEn: string;
  isVerified: false; // ALWAYS false until a real external service is plugged in
}

export interface ParsedRequestResult {
  rawText: string;
  status: RequestStatus;
  statusMessageHe: string;
  statusMessageEn: string;
  experienceType?: string;
  audienceType?: ActivityAudience;
  participantsMentioned: string[];
  extractedFacts: ExtractedFact[];
  constraints: ConstraintItem[];
  timeWindows: TimeWindow[];
  locations: LocationBreakdown;
  missingDetails: string[];
  clarificationQuestions: ClarificationQuestion[];
  conceptualIdeas: ConceptualIdea[];
  isFlightImplied: boolean;
  unverifiedArtistSearchRequested?: string; // e.g. "אנדרה ריו"
}

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
  fullName: string; // empty string for new user
  permanentHomeLocation: string; // empty string for new user
  defaultActivityDepartureLocation: string; // empty string for new user
  preferences: PreferenceItem[];
  quietDefaultEnabled: boolean; // default: true
  allowPartnerPreferencesSync: boolean;
  isDemo?: boolean;
}

export interface ContactPerson {
  id: string;
  name: string;
  relationship: string;
  interestInActivitiesTogether: AffinityLevel; // strictly private!
  privateNotes: string; // strictly private!
  permanentHome?: string;
  estimatedPreferences: string[];
  confirmedPreferences?: string[];
  isDemo?: boolean;
}

export interface SavedGroup {
  id: string;
  name: string;
  type: 'couple' | 'friends' | 'family' | 'culture_club';
  memberContactIds: string[];
  sharedInterests: string[];
  notes?: string;
  isDemo?: boolean;
}

export type ActivityAudience = 'solo' | 'couple' | 'saved_group' | 'custom';

export type ActivityCategory =
  | 'surprise'
  | 'culture_events'
  | 'food_entertainment'
  | 'trips_vacations';

export type TransportMode = 'walk' | 'car' | 'transit_train' | 'flight' | 'undecided';

export interface LocationBreakdown {
  permanentHome: string;
  activityDepartureLocation: string;
  destinationLocation: string;
  transportMode: TransportMode;
  isFlightRequired: boolean;
  departureAirport?: string;
  destinationAirport?: string;
}

export interface PoliteDeclineOption {
  id: string;
  titleHe: string;
  titleEn: string;
  textHe: string;
  textEn: string;
  tone: 'warm' | 'brief' | 'respectful' | 'work_neutral';
}

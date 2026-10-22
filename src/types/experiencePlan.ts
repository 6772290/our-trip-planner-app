import {
  CertaintyLevel,
  ConstraintItem,
  TimeWindow,
  TransportMode,
  ActivityAudience,
} from './experience';

export type ExperiencePlanType =
  | 'local_outing'       // בילוי מקומי (סרט, טיול בעיר, באולינג, בילוי פתוח)
  | 'culinary'           // מסעדה / פעילות קולינרית
  | 'event'              // הופעה, הצגה, קונצרט או אירוע ספורט
  | 'day_trip'           // טיול יום בטבע / באתרים
  | 'vacation_domestic'  // חופשה בארץ (סופ״ש בצפון, צימר, מלון באילת)
  | 'vacation_abroad';   // חופשה בחו"ל (טיסות, מלונות, רכב שכור)

export interface PlanFieldValue<T> {
  value: T;
  source: 'prompt_explicit' | 'profile_confirmed' | 'rubric_input' | 'clarification' | 'inferred';
  certainty: CertaintyLevel;
  isConfirmed: boolean;
  notes?: string;
}

export interface PlanParticipant {
  id: string;
  name: string;
  role: 'self' | 'partner' | 'child' | 'friend' | 'family_member' | 'colleague';
  isConfirmed: boolean;
  notes?: string;
  specificLocation?: string; // e.g. "לומד בראשון לציון"
}

export interface OtherParticipantLocation {
  participantNameOrRole: string;
  location: string;
  contextNote?: string;
}

export interface PlanLocations {
  permanentHome?: PlanFieldValue<string>;
  departureLocation?: PlanFieldValue<string>;
  otherParticipantsLocations: OtherParticipantLocation[];
  meetingPoint?: PlanFieldValue<string>;
  destinationLocation?: PlanFieldValue<string>;
  transportMode: PlanFieldValue<TransportMode>;
  isFlightRequired: boolean;
}

export interface PlanDates {
  mode: 'single_date' | 'date_range' | 'alternative_windows' | 'open_flexible';
  specificDate?: PlanFieldValue<string>; // YYYY-MM-DD
  endDate?: PlanFieldValue<string>;      // YYYY-MM-DD
  timeOfDay?: PlanFieldValue<'morning' | 'noon' | 'afternoon' | 'evening' | 'night' | 'exact'>;
  exactTime?: PlanFieldValue<string>;    // HH:MM
  durationDaysMin?: PlanFieldValue<number>;
  durationDaysMax?: PlanFieldValue<number>;
  durationHours?: PlanFieldValue<number>;
  timeWindows: TimeWindow[];
  naturalDateText?: string;
}

export type DietaryRestrictionType =
  | 'kosher'
  | 'kosher_mehadrin'
  | 'halal'
  | 'vegan'
  | 'vegetarian'
  | 'gluten_free'
  | 'allergies'
  | 'none';

export interface PlanDietaryRequirements {
  restrictions: DietaryRestrictionType[];
  allergyDetails?: string; // Critical safety constraint
  isConfirmed: boolean;
  notes?: string;
}

export interface PlanCulinaryPreferences {
  cuisines: string[]; // 'איטלקי', 'סושי', 'פיצה', 'בשרים', 'דגים', 'חלבי', 'אסייתי', 'שף ים-תיכוני', 'בר יין'
  atmosphere?: 'romantic' | 'lively' | 'quiet' | 'family_friendly' | 'casual';
  isConfirmed: boolean;
  notes?: string;
}

export interface PlanBudget {
  amount?: number;
  currency: 'ILS' | 'USD' | 'EUR';
  scope: 'per_person' | 'total';
  flexibility: 'strict' | 'flexible_for_special' | 'open';
  isConfirmed: boolean;
  notes?: string;
}

export interface PlanEventDetails {
  artistOrShowName?: string;
  genre?: string;
  venue?: string;
  ticketStatus?: 'needed' | 'have_tickets' | 'flexible';
}

export interface PlanVacationDetails {
  lodgingType?: 'hotel' | 'resort' | 'zimmer_cabin' | 'apartment' | 'camping' | 'open';
  needsFlight: boolean;
  tripType?: 'solo' | 'couple' | 'friends' | 'family';
}

export interface ExperiencePlan {
  id: string;
  type: ExperiencePlanType;
  title: string;
  createdAt: string;
  updatedAt: string;
  audienceType: ActivityAudience;
  participants: PlanParticipant[];
  locations: PlanLocations;
  dates: PlanDates;
  dietary: PlanDietaryRequirements;
  culinary: PlanCulinaryPreferences;
  budget: PlanBudget;
  constraints: ConstraintItem[];
  vibeAndAtmosphere: string[];
  eventDetails?: PlanEventDetails;
  vacationDetails?: PlanVacationDetails;
  status: 'draft' | 'planning' | 'ready';
  rawPromptOrigin?: string;
}

export type TripType = 'solo' | 'couple' | 'family' | 'friends' | 'group' | 'work';

export type PlanningMethod =
  | 'has_destination'
  | 'has_dates'
  | 'flexible_dates'
  | 'discover_idea'
  | 'dream_future';

export type BudgetLevel = 'budget' | 'medium' | 'premium' | 'luxury';

export type TripPace = 'relaxed' | 'balanced' | 'intense';

export type AccommodationStyle = 'boutique' | 'resort' | 'apartment' | 'nature_cabin';

export type CalendarSystem = 'gregorian' | 'hebrew' | 'chinese';

export type DateSelectionMode = 'calendar' | 'alternatives' | 'natural_text' | 'flexible_window';

export interface DateAlternative {
  id: string;
  title: string;
  startDate: string; // ISO "YYYY-MM-DD"
  endDate: string; // ISO "YYYY-MM-DD"
  departureTime?: string;
  returnTime?: string;
  notes?: string;
  pros?: string[];
  cons?: string[];
}

export interface FlexibleDateWindow {
  earliestDeparture?: string; // ISO "YYYY-MM-DD"
  latestDeparture?: string; // ISO "YYYY-MM-DD"
  earliestReturn?: string; // ISO "YYYY-MM-DD"
  latestReturn?: string; // ISO "YYYY-MM-DD"
  durationNightsMin: number;
  durationNightsMax: number;
  allowedDaysOfWeek?: number[]; // 0=Sunday, 1=Monday...
  excludedDaysOfWeek?: number[];
  dateShiftingDays?: number; // +/- days shift
  description?: string;

  // Backwards compatibility
  earliestStart?: string;
  latestEnd?: string;
  durationDaysMin?: number;
  durationDaysMax?: number;
  preferredDaysOfWeek?: string[];
}

export interface TravelBoundaries {
  earliestHomeDeparture?: { time: string; date?: string; note?: string; isMandatory: boolean };
  airportArrivalBufferHours?: number; // e.g. 3 hours before flight
  latestHomeReturn?: { time: string; date?: string; note?: string; isMandatory: boolean };
  returnToWorkDeadline?: { time: string; date?: string; note?: string; isMandatory: boolean };
  destinationArrivalDeadline?: { time: string; date?: string; note?: string; isMandatory: boolean };
  customBufferNotes?: string;
}

export type EventCategory =
  | 'wedding'
  | 'exam'
  | 'business_meeting'
  | 'concert_sport'
  | 'work_commitment'
  | 'shabbat_holiday'
  | 'family'
  | 'other';

export interface TripEvent {
  id: string;
  title: string;
  category: EventCategory;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  location: string;
  isMandatory: boolean; // מחייב או רצוי
  bufferHoursBefore: number; // מרווח ביטחון
  bufferHoursAfter?: number;
  notes?: string;
}

export interface ShabbatHolidayConstraints {
  enabled: boolean;
  mustBeHomeForShabbat: boolean;
  minHoursAfterShabbatTakeoff: number; // e.g. 3 hours after Havdalah/Shabbat ends
  minHoursBeforeShabbatLanding: number; // e.g. at least 4 hours before Shabbat begins
  mustBeAtSpecificLocationForHoliday?: string;
  notes?: string;
}

// Universal Events & Constraints Architecture (PART D)
export type UniversalConstraintType =
  | 'work_meeting'
  | 'wedding'
  | 'school_exam'
  | 'religious_observance'
  | 'family_celebration'
  | 'public_holiday'
  | 'concert_sport'
  | 'medical_appointment'
  | 'rest_period'
  | 'flight_window'
  | 'custom';

export type ConstraintOwner = 'trip' | string; // 'trip' for shared, or participantId for traveler

export interface UniversalConstraint {
  id: string;
  owner: ConstraintOwner; // 'trip' or participant ID
  ownerName?: string;
  type: UniversalConstraintType;
  title: string;
  originalStatement?: string;
  isMandatory: boolean; // true = hard constraint, false = soft preference

  // Optional independent boundaries (never invent missing boundaries)
  earliestDate?: string; // "YYYY-MM-DD"
  earliestTime?: string; // "HH:MM"
  latestDate?: string; // "YYYY-MM-DD"
  latestTime?: string; // "HH:MM"

  // Optional location and timezone context
  location?: string;
  timezone?: string; // IANA timezone, e.g. "Asia/Jerusalem", "Europe/London"

  // Buffer
  bufferHoursBefore?: number;
  bufferHoursAfter?: number;

  status: 'pending' | 'resolved' | 'needs_clarification';
  isConfirmed: boolean;
  notes?: string;
}

export type TripGoalType =
  | 'maximize_vacation'
  | 'minimize_work_absence'
  | 'minimize_cost'
  | 'attend_event_on_time'
  | 'maximize_destination_time'
  | 'avoid_night_flights'
  | 'prioritize_comfort'
  | 'balanced_compromise';

export interface RankedGoal {
  id: TripGoalType;
  label: string;
  description: string;
  priority: number;
  selected: boolean;
}

export type ConstraintLevel = 'mandatory' | 'preference' | 'optimization_target';

export interface ClassifiedConstraint {
  id: string;
  title: string;
  level: ConstraintLevel;
  category: string;
  explanation: string;
}

export interface SystemUnderstandingSummary {
  parsedIntentSummary: string;
  topGoals: string[];
  mandatoryConstraints: ClassifiedConstraint[];
  preferences: ClassifiedConstraint[];
  optimizationTargets: ClassifiedConstraint[];
  activeCalendar: CalendarSystem;
  secondaryCalendar: CalendarSystem;
  alternativesSummary: string;
  isConfirmedByUser: boolean;
}

export interface ParticipantAnswers {
  interests: string[];
  budget: BudgetLevel;
  pace: TripPace;
  dealBreakers: string[];
  accommodationStyle: AccommodationStyle;
  specialNotes?: string;
  preferredSeason?: string;
  mustHaveActivity?: string;
}

export interface Participant {
  id: string;
  name: string;
  role: string;
  isAnswered: boolean;
  answers?: ParticipantAnswers;

  // Individual traveler international context (PART B & C)
  preferredLanguage?: 'he' | 'en';
  preferredCalendar?: CalendarSystem;
  homeLocation?: string;
  originAirport?: string;
  departureCity?: string;
  timezone?: string; // IANA identifier, e.g. 'Asia/Jerusalem', 'Europe/London'
  personalAvailability?: {
    earliestDepartureDate?: string;
    latestReturnDate?: string;
  };
  personalConstraints?: UniversalConstraint[];
}

export interface TripRecommendation {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  category: string;
  matchScore: number;
  whyItFits: string[];
  highlights: string[];
  bestFor: string;
  suggestedDuration: string;
  estimatedBudgetLabel: string;
  paceLabel: string;
  themeColor: string;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  explanation: string;
  options: {
    label: string;
    impactDescription: string;
  }[];
  selectedOptionIndex?: number;
}

export interface Trip {
  id: string;
  title: string;
  tripType: TripType;
  planningMethod: PlanningMethod;
  destination?: string;
  dateNotes?: string;
  status: 'draft' | 'in_progress' | 'ready';
  isDemo?: boolean;
  participants: Participant[];
  currentParticipantId?: string;
  activeFollowUps?: ClarifyingQuestion[];
  createdAt: string;

  // Travel planning specification models
  calendarSystem?: CalendarSystem;
  secondaryCalendarSystem?: CalendarSystem;
  dateSelectionMode?: DateSelectionMode;
  dateAlternatives?: DateAlternative[];
  flexibleWindow?: FlexibleDateWindow;
  travelBoundaries?: TravelBoundaries;
  events?: TripEvent[];
  shabbatHolidayConstraints?: ShabbatHolidayConstraints;
  universalConstraints?: UniversalConstraint[];
  sharedMeetingPoint?: {
    location: string;
    airportCode?: string;
    timezone: string;
  };
  rankedGoals?: RankedGoal[];
  classifiedConstraints?: ClassifiedConstraint[];
  systemUnderstanding?: SystemUnderstandingSummary;
  rawNaturalText?: string;
}

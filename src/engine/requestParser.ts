import {
  UserProfile,
  ContactPerson,
  SavedGroup,
  ParsedRequestResult,
  ExtractedFact,
  CertaintyLevel,
  ActivityAudience,
  TransportMode,
  LocationBreakdown,
  RequestStatus,
} from '../types/experience';
import { extractConstraintsAndWindows } from './constraintEngine';
import { identifyNextClarificationQuestion } from './clarificationEngine';
import { generateConceptualInspirations, CURRENT_DATA_SOURCE_STATUS } from './dataSourceProvider';

export interface ParseOptions {
  userProfile?: UserProfile;
  contacts?: ContactPerson[];
  savedGroups?: SavedGroup[];
  clarifiedOverrides?: Partial<{
    experienceType: string;
    departureLocation: string;
    destinationLocation: string;
    culinaryVibe: string;
    tripScope: string;
    audience: ActivityAudience;
  }>;
}

/**
 * Request Understanding Engine:
 * Analyzes natural language input, extracts facts with provenance and certainty,
 * evaluates constraints, identifies missing information, and asks smart clarification questions.
 */
export function parseExperienceRequest(
  inputText: string,
  options: ParseOptions = {}
): ParsedRequestResult {
  const text = (inputText || '').trim();
  const lower = text.toLowerCase();
  const profile = options.userProfile;
  const contacts = options.contacts || [];
  const overrides = options.clarifiedOverrides || {};

  const extractedFacts: ExtractedFact[] = [];
  const participantsMentioned: string[] = [];
  const missingDetails: string[] = [];

  // 1. Identify Participants & Audience
  let audienceType: ActivityAudience = overrides.audience || 'solo';
  if (
    text.includes('אשתי') ||
    text.includes('בעלי') ||
    text.includes('בן זוגי') ||
    text.includes('בת זוגי') ||
    text.includes('אני ובת זוגי') ||
    text.includes('אשתי ואני') ||
    text.includes('זוג') ||
    text.includes('שנינו')
  ) {
    audienceType = 'couple';
    participantsMentioned.push('בת/בן זוג');
    extractedFacts.push({
      id: 'f_audience',
      key: 'audience',
      labelHe: 'משתתפים בפעילות',
      labelEn: 'Participants',
      value: 'זוגי (אני ובן/בת הזוג)',
      certainty: 'explicit',
      sourceNoteHe: 'צוין במפורש בטקסט הבקשה',
      sourceNoteEn: 'Explicitly stated in request text',
      isConfirmed: true,
    });
  } else if (text.includes('החבר') || text.includes('חברים') || text.includes('קבוצה') || text.includes('כולנו')) {
    audienceType = 'saved_group';
    participantsMentioned.push('קבוצת חברים');
    extractedFacts.push({
      id: 'f_audience',
      key: 'audience',
      labelHe: 'משתתפים בפעילות',
      labelEn: 'Participants',
      value: 'קבוצה / חברים',
      certainty: 'explicit',
      sourceNoteHe: 'צוין במפורש בטקסט הבקשה',
      sourceNoteEn: 'Explicitly stated in request text',
      isConfirmed: true,
    });
  } else if (overrides.audience) {
    audienceType = overrides.audience;
  }

  // 2. Identify Experience Nature
  let experienceType = overrides.experienceType || '';
  let isFood = false;
  let isMusic = false;
  let isTrip = false;
  let artistMentioned: string | undefined = undefined;

  if (text.includes('אנדרה ריו') || text.includes('andre rieu')) {
    artistMentioned = 'אנדרה ריו (André Rieu)';
    experienceType = 'מוזיקה / קונצרט חוג אמן';
    isMusic = true;
    extractedFacts.push({
      id: 'f_artist',
      key: 'artist',
      labelHe: 'אמן מבוקש',
      labelEn: 'Requested Artist',
      value: 'אנדרה ריו (André Rieu)',
      certainty: 'explicit',
      sourceNoteHe: 'נמסר במפורש בטקסט',
      sourceNoteEn: 'Explicitly stated in prompt',
      isConfirmed: true,
    });
  } else if (text.includes('אוכל') || text.includes('מסעדה') || text.includes('ארוחה') || text.includes('יין')) {
    isFood = true;
    experienceType = 'קולינריה / מסעדה';
    extractedFacts.push({
      id: 'f_category',
      key: 'category',
      labelHe: 'סוג בילוי',
      labelEn: 'Category',
      value: 'קולינריה ומסעדות',
      certainty: 'explicit',
      sourceNoteHe: 'נמסר במפורש בטקסט',
      sourceNoteEn: 'Explicitly stated in prompt',
      isConfirmed: true,
    });
  } else if (text.includes('חופשה') || text.includes('טיול') || text.includes('ימים לחופשה') || text.includes('סופשבוע')) {
    isTrip = true;
    experienceType = 'חופשה / טיול';
    extractedFacts.push({
      id: 'f_category',
      key: 'category',
      labelHe: 'סוג בילוי',
      labelEn: 'Category',
      value: 'חופשה וטיולים',
      certainty: 'explicit',
      sourceNoteHe: 'נמסר במפורש בטקסט',
      sourceNoteEn: 'Explicitly stated in prompt',
      isConfirmed: true,
    });
  }

  // If user applied clarification override for experienceType
  if (overrides.experienceType === 'food') {
    isFood = true;
    experienceType = 'קולינריה ומסעדה';
  } else if (overrides.experienceType === 'music') {
    isMusic = true;
    experienceType = 'מוזיקה והופעה חיה';
  } else if (overrides.experienceType === 'stroll') {
    experienceType = 'טיול קצר ואווירה נעימה';
  }

  // 3. Extract Locations without Auto-inventing
  let permanentHome = profile?.permanentHomeLocation?.trim() || '';
  let departureLocation = overrides.departureLocation || profile?.defaultActivityDepartureLocation?.trim() || '';
  let destinationLocation = overrides.destinationLocation || '';
  let transportMode: TransportMode = 'undecided';
  let isFlightImplied = false;

  // Destination detection from text
  if (text.includes('איטליה') || text.includes('פירנצה') || text.includes('רומא') || text.includes('מילאנו')) {
    destinationLocation = text.includes('פירנצה') ? 'פירנצה, איטליה' : 'איטליה';
    isFlightImplied = true;
    transportMode = 'flight';
    extractedFacts.push({
      id: 'f_dest',
      key: 'destination',
      labelHe: 'יעד מבוקש',
      labelEn: 'Destination',
      value: destinationLocation,
      certainty: 'explicit',
      sourceNoteHe: 'נמסר במפורש בטקסט',
      sourceNoteEn: 'Explicitly mentioned in text',
      isConfirmed: true,
    });
  } else if (text.includes('אירופה')) {
    destinationLocation = 'אירופה';
    isFlightImplied = true;
    transportMode = 'flight';
  } else if (text.includes('תל אביב')) {
    destinationLocation = 'תל אביב';
    transportMode = 'car';
  }

  // If local evening plan (e.g. "הערב" or local dinner), NEVER assume flight
  if (text.includes('הערב') && !destinationLocation.includes('אירופה') && !destinationLocation.includes('איטליה')) {
    isFlightImplied = false;
    transportMode = 'car';
  }

  // Record verified profile locations if present (NEVER invented if absent!)
  if (permanentHome) {
    extractedFacts.push({
      id: 'f_home',
      key: 'home',
      labelHe: 'מגורים קבועים',
      labelEn: 'Permanent Home',
      value: permanentHome,
      certainty: 'profile_confirmed',
      sourceNoteHe: 'נלקח מהפרופיל המאושר שלך',
      sourceNoteEn: 'Taken from your verified profile',
      isConfirmed: true,
    });
  }

  if (departureLocation) {
    extractedFacts.push({
      id: 'f_dep',
      key: 'departure',
      labelHe: 'נקודת יציאה לפעילות',
      labelEn: 'Activity Departure',
      value: departureLocation,
      certainty: overrides.departureLocation ? 'explicit' : 'profile_confirmed',
      sourceNoteHe: overrides.departureLocation ? 'נמסר במענה להבהרה' : 'נלקח מנקודת המוצא השגרתית בפרופיל',
      sourceNoteEn: 'From clarification response or profile',
      isConfirmed: true,
    });
  }

  // 4. Extract Constraints & Windows via constraintEngine
  const { constraints, timeWindows } = extractConstraintsAndWindows(text);

  // 5. Detect Missing Details
  if (!experienceType && !isFood && !isMusic && !isTrip) {
    missingDetails.push('אופי הפעילות או סגנון החוויה המבוקש');
  }
  if (isFood && !departureLocation) {
    missingDetails.push('אזור המוצא או העיר שממנה אתם יוצאים');
  }
  if (isTrip && !destinationLocation && !overrides.tripScope) {
    missingDetails.push('היקף החופשה (בארץ או בחו״ל)');
  }

  // 6. Formulate Single Next Clarification Question
  const nextQuestion = identifyNextClarificationQuestion({
    experienceType,
    audienceType,
    departureLocation,
    destinationLocation,
    timeframeText: text.includes('הערב') ? 'הערב' : '',
    isFood,
    isMusic,
    isTrip,
    isFlightConfirmed: isFlightImplied,
    userProfile: profile,
    contacts,
  });

  const clarificationQuestions = nextQuestion ? [nextQuestion] : [];

  // 7. Determine Overall Status
  let status: RequestStatus = 'understood';
  let statusMessageHe = 'הבקשה הובנה בהצלחה';
  let statusMessageEn = 'Request understood successfully';

  if (clarificationQuestions.length > 0) {
    status = 'missing_details';
    statusMessageHe = 'נדרשת הבהרה קצרה להמשך התכנון';
    statusMessageEn = 'Brief clarification needed to proceed';
  } else if (!CURRENT_DATA_SOURCE_STATUS.isExternalEventsApiConnected) {
    status = 'no_source_connected';
    statusMessageHe = 'הבקשה הובנה — אין כרגע מקור מידע חיצוני מחובר (רעיונות להשראה בלבד)';
    statusMessageEn = 'Request understood — No external data source connected (Conceptual ideas only)';
  }

  // 8. Generate Conceptual Ideas (strictly labeled, never fake real availability)
  const conceptualIdeas = generateConceptualInspirations(
    isFood ? 'food' : isMusic ? 'music' : 'general',
    artistMentioned,
    destinationLocation || departureLocation
  );

  const locations: LocationBreakdown = {
    permanentHome,
    activityDepartureLocation: departureLocation,
    destinationLocation,
    transportMode,
    isFlightRequired: isFlightImplied,
  };

  return {
    rawText: text,
    status,
    statusMessageHe,
    statusMessageEn,
    experienceType: experienceType || 'פנאי וחוויות',
    audienceType,
    participantsMentioned,
    extractedFacts,
    constraints,
    timeWindows,
    locations,
    missingDetails,
    clarificationQuestions,
    conceptualIdeas,
    isFlightImplied,
    unverifiedArtistSearchRequested: artistMentioned,
  };
}

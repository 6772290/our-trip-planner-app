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
  clarifiedOverrides?: Record<string, any>;
}

/**
 * Request Understanding Engine:
 * Analyzes natural language input, extracts facts with provenance and certainty,
 * evaluates constraints without fabricating durations or hard presence requirements,
 * identifies missing information, and asks smart clarification questions across conversation turns.
 */
export function parseExperienceRequest(
  inputText: string,
  options: ParseOptions = {}
): ParsedRequestResult {
  const text = (inputText || '').trim();
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

  // 2. Identify Experience Nature (with support for varied natural phrasings)
  let experienceType = overrides.experienceType || '';
  let isFood = false;
  let isMusic = false;
  let isTrip = false;
  let artistMentioned: string | undefined = undefined;

  const isFoodPhrase =
    text.includes('אוכל') ||
    text.includes('מסעדה') ||
    text.includes('ארוחה') ||
    text.includes('יין') ||
    text.includes('בא לי לאכול') ||
    text.includes('רוצה לאכול') ||
    text.includes('משהו טוב לאכול') ||
    text.includes('קולינר');

  const isMusicPhrase =
    text.includes('אנדרה ריו') ||
    text.includes('andre rieu') ||
    text.includes('הופעה') ||
    text.includes('קונצרט') ||
    text.includes('מוזיקה');

  const isTripPhrase =
    text.includes('חופשה') ||
    text.includes('טיול') ||
    text.includes('ימים לחופשה') ||
    text.includes('סופשבוע') ||
    text.includes('סופ״ש') ||
    text.includes('בחו״ל') ||
    text.includes('לחו״ל') ||
    text.includes('שבוע פנוי');

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
  } else if (isFoodPhrase) {
    isFood = true;
    experienceType = 'קולינריה ומסעדות';
    extractedFacts.push({
      id: 'f_category',
      key: 'category',
      labelHe: 'סוג בילוי',
      labelEn: 'Category',
      value: 'קולינריה ומסעדות',
      certainty: 'explicit',
      sourceNoteHe: 'זוהה מתוך ביטוי קולינרי בטקסט (היוריסטיקה שקופה)',
      sourceNoteEn: 'Identified via culinary phrase (rule extraction)',
      isConfirmed: true,
    });
  } else if (isMusicPhrase) {
    isMusic = true;
    experienceType = 'מוזיקה והופעה חיה';
    extractedFacts.push({
      id: 'f_category',
      key: 'category',
      labelHe: 'סוג בילוי',
      labelEn: 'Category',
      value: 'מוזיקה והופעה חיה',
      certainty: 'explicit',
      sourceNoteHe: 'זוהה מתוך אזכור מוזיקלי בטקסט',
      sourceNoteEn: 'Identified from music mention in text',
      isConfirmed: true,
    });
  } else if (isTripPhrase) {
    isTrip = true;
    experienceType = 'חופשה וטיולים';
    extractedFacts.push({
      id: 'f_category',
      key: 'category',
      labelHe: 'סוג בילוי',
      labelEn: 'Category',
      value: 'חופשה וטיולים',
      certainty: 'explicit',
      sourceNoteHe: 'זוהה מתוך תיאור חופשה/טיול בטקסט',
      sourceNoteEn: 'Identified from vacation/trip keywords',
      isConfirmed: true,
    });
  }

  // Handle clarification override for experienceType
  if (overrides.experienceType) {
    if (overrides.experienceType === 'food' || overrides.experienceType === 'אוכל ומסעדה טובה') {
      isFood = true;
      experienceType = 'קולינריה ומסעדה';
    } else if (overrides.experienceType === 'music' || overrides.experienceType === 'מוזיקה') {
      isMusic = true;
      experienceType = 'מוזיקה והופעה חיה';
    } else if (overrides.experienceType === 'stroll') {
      experienceType = 'טיול קצר ואווירה נעימה';
    } else {
      experienceType = String(overrides.experienceType);
    }
    extractedFacts.push({
      id: 'f_exp_override',
      key: 'experienceType',
      labelHe: 'סוג בילוי מועדף',
      labelEn: 'Preferred Experience',
      value: experienceType,
      certainty: 'explicit',
      sourceNoteHe: 'הוגדר על ידך במענה לשאלת הבהרה',
      sourceNoteEn: 'Specified by you during clarification',
      isConfirmed: true,
    });
  }

  // 3. Extract Locations without Auto-inventing
  let permanentHome = profile?.permanentHomeLocation?.trim() || '';
  let departureLocation = overrides.departureLocation || profile?.defaultActivityDepartureLocation?.trim() || '';
  let destinationLocation = overrides.destinationLocation || '';
  let transportMode: TransportMode = 'undecided';
  let isFlightImplied = false;

  // Explicit flight intent check
  const isFlightExplicitlyMentioned =
    text.includes('טיסה') ||
    text.includes('לטוס') ||
    text.includes('טיסות') ||
    text.includes('flight');

  // Destination detection from text
  if (text.includes('איטליה') || text.includes('פירנצה') || text.includes('רומא') || text.includes('מילאנו')) {
    destinationLocation = text.includes('פירנצה')
      ? 'פירנצה, איטליה'
      : text.includes('רומא')
      ? 'רומא, איטליה'
      : 'איטליה';
    // Do NOT automatically force flight! Allow trains/car or undecided
    if (isFlightExplicitlyMentioned || overrides.transportMode === 'flight') {
      isFlightImplied = true;
      transportMode = 'flight';
    } else {
      transportMode = 'undecided';
    }
    extractedFacts.push({
      id: 'f_dest',
      key: 'destination',
      labelHe: 'יעד מבוקש',
      labelEn: 'Destination',
      value: destinationLocation,
      certainty: 'explicit',
      sourceNoteHe: 'נמסר במפורש בטקסט (אמצעי תחבורה נותר פתוח להחלטה)',
      sourceNoteEn: 'Explicitly mentioned in text (Transport mode left open)',
      isConfirmed: true,
    });
  } else if (text.includes('אירופה')) {
    destinationLocation = 'אירופה';
    if (isFlightExplicitlyMentioned || overrides.transportMode === 'flight') {
      isFlightImplied = true;
      transportMode = 'flight';
    } else {
      transportMode = 'undecided';
    }
  } else if (text.includes('חו״ל') || text.includes('חול')) {
    destinationLocation = 'חו״ל';
    if (isFlightExplicitlyMentioned) {
      isFlightImplied = true;
      transportMode = 'flight';
    }
  } else if (text.includes('תל אביב')) {
    destinationLocation = 'תל אביב';
    transportMode = 'car';
  }

  // If local evening plan (e.g. "הערב" or local dinner), NEVER assume flight
  if (text.includes('הערב') && !destinationLocation.includes('אירופה') && !destinationLocation.includes('איטליה')) {
    isFlightImplied = false;
    transportMode = 'car';
  }

  // Handle clarified overrides for departure & culinary vibe
  if (overrides.culinaryVibe) {
    const vibeLabel =
      overrides.culinaryVibe === 'italian'
        ? 'איטלקי / פסטה ויין'
        : overrides.culinaryVibe === 'mediterranean'
        ? 'שף ים-תיכוני עדכני'
        : overrides.culinaryVibe === 'kosher'
        ? 'כשר (חלבי / דגים)'
        : overrides.culinaryVibe === 'wine_bar'
        ? 'בר יין ונשנושים שקטים'
        : String(overrides.culinaryVibe);

    extractedFacts.push({
      id: 'f_culinary_vibe',
      key: 'culinaryVibe',
      labelHe: 'סגנון קולינרי מועדף',
      labelEn: 'Culinary Style',
      value: vibeLabel,
      certainty: 'explicit',
      sourceNoteHe: 'נבחר במענה לשאלת הבהרה',
      sourceNoteEn: 'Selected in clarification answer',
      isConfirmed: true,
    });
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

  // 4. Extract Constraints & Windows via updated constraintEngine
  const { constraints, timeWindows } = extractConstraintsAndWindows(text);

  // 5. Detect Missing Details
  if (!experienceType && !isFood && !isMusic && !isTrip && !overrides.experienceType) {
    missingDetails.push('אופי הפעילות או סגנון החוויה המבוקש');
  }
  if (isFood && !departureLocation && !overrides.departureLocation) {
    missingDetails.push('אזור המוצא או העיר שממנה אתם יוצאים');
  }
  if (isFood && !overrides.culinaryVibe && !profile?.preferences.some(p => p.category === 'dietary')) {
    missingDetails.push('סגנון קולינרי מועדף (איטלקי, שף, כשר וכו׳)');
  }
  if (isTrip && !destinationLocation && !overrides.tripScope) {
    missingDetails.push('היקף החופשה (בארץ או בחו״ל)');
  }

  // 6. Formulate Single Next Clarification Question (with memory of answered overrides)
  const nextQuestion = identifyNextClarificationQuestion({
    experienceType,
    audienceType,
    departureLocation,
    destinationLocation,
    timeframeText: text.includes('הערב') ? 'הערב' : '',
    isFood,
    isMusic,
    isTrip,
    culinaryVibe: overrides.culinaryVibe,
    tripScope: overrides.tripScope,
    isFlightConfirmed: isFlightImplied,
    userProfile: profile,
    contacts,
    answeredClarifications: overrides,
  });

  const clarificationQuestions = nextQuestion ? [nextQuestion] : [];

  // 7. Determine Overall Status
  let status: RequestStatus = 'understood';
  let statusMessageHe = 'הבקשה נותחה באמצעות כללים מובנים ושקופים';
  let statusMessageEn = 'Request analyzed using structured, transparent rules';

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

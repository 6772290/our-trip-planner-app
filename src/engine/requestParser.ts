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
  ClarificationQuestion,
} from '../types/experience';
import { ExperiencePlanType } from '../types/experiencePlan';
import { extractConstraintsAndWindows } from './constraintEngine';
import { identifyNextClarificationQuestion } from './clarificationEngine';
import { generateConceptualInspirations, CURRENT_DATA_SOURCE_STATUS } from './dataSourceProvider';
import { analyzeContextualLocations, resolveNormalizedCity } from '../utils/locationResolver';

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
  } else if (
    text.includes('הבן שלי') ||
    text.includes('הבת שלי') ||
    text.includes('הילד') ||
    text.includes('הילדה') ||
    text.includes('הילדים')
  ) {
    audienceType = 'custom';
    const role = text.includes('הבן שלי')
      ? 'הבן שלי'
      : text.includes('הבת שלי')
      ? 'הבת שלי'
      : 'הילדים שלי';
    participantsMentioned.push(role);
    extractedFacts.push({
      id: 'f_audience',
      key: 'audience',
      labelHe: 'משתתפים בפעילות',
      labelEn: 'Participants',
      value: `אני ו${role}`,
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

  // 2. Identify Experience Nature (with decoupled culinary & dietary categories)
  let experienceType = overrides.experienceType || '';
  let isFood = false;
  let isMusic = false;
  let isTrip = false;
  let isLocalOuting = false;
  let artistMentioned: string | undefined = undefined;

  // Culinary cuisine keywords
  const isSushi = text.includes('סושי') || text.includes('sushi') || text.includes('יפני');
  const isItalian = text.includes('איטלקי') || text.includes('פיצה') || text.includes('פסטה');
  const isMeat = text.includes('בשר') || text.includes('בשרים') || text.includes('סטייק');
  const isAsian = text.includes('אסייתי') || text.includes('תאילנדי') || text.includes('סיני');
  const isDairyCuisine = text.includes('חלבי');
  const isFishCuisine = text.includes('דגים');

  const isFoodPhrase =
    isSushi ||
    isItalian ||
    isMeat ||
    isAsian ||
    text.includes('אוכל') ||
    text.includes('מסעדה') ||
    text.includes('ארוחה') ||
    text.includes('ארוחת ערב') ||
    text.includes('ארוחת צהריים') ||
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

  const isOutingPhrase =
    text.includes('בילוי') ||
    text.includes('לבלות') ||
    text.includes('להוציא אותו') ||
    text.includes('להוציא אותה') ||
    text.includes('בא לי לצאת') ||
    text.includes('לצאת הערב');

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

    let specificCuisine = '';
    if (isSushi) specificCuisine = 'סושי / אסייתי';
    else if (isItalian) specificCuisine = 'איטלקי / פיצה';
    else if (isMeat) specificCuisine = 'בשרים';
    else if (isDairyCuisine && isFishCuisine) specificCuisine = 'חלבי ודגים';
    else if (isDairyCuisine) specificCuisine = 'חלבי';
    else if (isFishCuisine) specificCuisine = 'דגים';

    extractedFacts.push({
      id: 'f_category',
      key: 'category',
      labelHe: 'סוג בילוי',
      labelEn: 'Category',
      value: specificCuisine ? `קולינריה: ${specificCuisine}` : 'קולינריה ומסעדות',
      certainty: 'explicit',
      sourceNoteHe: 'זוהה מתוך ביטוי קולינרי בטקסט',
      sourceNoteEn: 'Identified via culinary phrase',
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
  } else if (isOutingPhrase) {
    isLocalOuting = true;
    experienceType = 'בילוי מקומי ופנאי';
    extractedFacts.push({
      id: 'f_category',
      key: 'category',
      labelHe: 'סוג בילוי',
      labelEn: 'Category',
      value: 'בילוי מקומי ופנאי',
      certainty: 'explicit',
      sourceNoteHe: 'זוהה מתוך ביטוי בילוי ופנאי',
      sourceNoteEn: 'Identified from leisure outing keywords',
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

  // 3. Extract Locations with syntactic contextual analysis (Mission 4)
  const locAnalysis = analyzeContextualLocations(text);
  let permanentHome = profile?.permanentHomeLocation?.trim() || '';
  let departureLocation = overrides.departureLocation || profile?.defaultActivityDepartureLocation?.trim() || '';
  let destinationLocation = overrides.destinationLocation || '';
  let meetingPointLocation = overrides.meetingPoint || '';
  let transportMode: TransportMode = 'undecided';
  let isFlightImplied = false;

  // Record other participant's location if detected (e.g. "הבן שלי לומד בראשלצ")
  let otherParticipantClarificationNeeded: ClarificationQuestion | null = null;
  if (locAnalysis.otherParticipantLocation) {
    const info = locAnalysis.otherParticipantLocation;
    extractedFacts.push({
      id: 'f_other_participant_loc',
      key: 'other_participant_location',
      labelHe: `מיקום של ${info.participantRole}`,
      labelEn: `${info.participantRole} Location`,
      value: info.city.canonicalNameHe,
      certainty: 'explicit',
      sourceNoteHe: `${info.participantRole} נמצא ב${info.city.canonicalNameHe} (אינו מקום מגוריך)`,
      sourceNoteEn: `${info.participantRole} is located in ${info.city.canonicalNameEn}`,
      isConfirmed: true,
    });

    // If destination not yet clarified, formulate the natural question from Mission 4:
    if (!overrides.destinationLocation && !overrides.destination_mode) {
      otherParticipantClarificationNeeded = {
        id: 'q_other_participant_location_action',
        questionHe: info.suggestedClarificationHe,
        questionEn: info.suggestedClarificationEn,
        contextNoteHe: 'המערכת מזהה שהמיקום שייך למשתתף ואינה מניחה שזה מקום מגוריך או היעד הסופי',
        contextNoteEn: 'System identifies the location belongs to participant, avoiding false home-base assumptions',
        targetField: 'destinationLocation',
        options: [
          {
            id: 'opt_hangout_there',
            labelHe: `לבלות ב${info.city.canonicalNameHe} והסביבה`,
            labelEn: `Hang out in ${info.city.canonicalNameEn}`,
            payloadValue: info.city.canonicalNameHe,
          },
          {
            id: 'opt_pickup_and_go',
            labelHe: `לאסוף אותו מ${info.city.canonicalNameHe} ולנסוע למקום אחר`,
            labelEn: `Pick up from ${info.city.canonicalNameEn} and go elsewhere`,
            payloadValue: 'pickup_other_city',
          },
        ],
        allowFreeText: true,
      };
    }
  }

  // Handle explicit destination from analysis
  if (locAnalysis.explicitDestinationCity) {
    destinationLocation = locAnalysis.explicitDestinationCity.canonicalNameHe;
    transportMode = locAnalysis.explicitDestinationCity.isInternational ? 'undecided' : 'car';
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
  } else if (text.includes('איטליה') || text.includes('פירנצה') || text.includes('רומא') || text.includes('מילאנו')) {
    destinationLocation = text.includes('פירנצה')
      ? 'פירנצה, איטליה'
      : text.includes('רומא')
      ? 'רומא, איטליה'
      : 'איטליה';
    transportMode = 'undecided';
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
    transportMode = 'undecided';
  } else if (text.includes('חו״ל') || text.includes('חול')) {
    destinationLocation = 'חו״ל';
    transportMode = 'undecided';
  }

  // Handle explicit departure from analysis
  if (locAnalysis.explicitDepartureCity) {
    departureLocation = locAnalysis.explicitDepartureCity.canonicalNameHe;
  }

  // Handle meeting point from analysis
  if (locAnalysis.meetingPointCity) {
    meetingPointLocation = locAnalysis.meetingPointCity.canonicalNameHe;
  }

  // Check if international flight is implied: ONLY if flight is mentioned or destination is abroad!
  const isFlightExplicitlyMentioned =
    text.includes('טיסה') ||
    text.includes('לטוס') ||
    text.includes('טיסות') ||
    text.includes('flight');

  if (isFlightExplicitlyMentioned || locAnalysis.isFlightImplied || overrides.transportMode === 'flight') {
    isFlightImplied = true;
    transportMode = 'flight';
  } else if (
    text.includes('הערב') ||
    text.includes('מסעדה') ||
    isFood ||
    isLocalOuting ||
    (destinationLocation && !locAnalysis.explicitDestinationCity?.isInternational && !destinationLocation.includes('אירופה') && !destinationLocation.includes('איטליה'))
  ) {
    // Local domestic outing / food / evening: NEVER assume flight!
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

  // Record profile locations if present (NEVER invented if absent!)
  // If profile is in Demo Mode, clearly mark as unverified demo illustration facts
  if (permanentHome) {
    const isDemo = !!profile?.isDemo;
    extractedFacts.push({
      id: 'f_home',
      key: 'home',
      labelHe: isDemo ? 'מגורים קבועים (נתוני הדגמה בלבד)' : 'מגורים קבועים',
      labelEn: isDemo ? 'Permanent Home (Demo Data Only)' : 'Permanent Home',
      value: permanentHome,
      certainty: isDemo ? 'inferred_provisional' : 'profile_confirmed',
      sourceNoteHe: isDemo
        ? 'נתוני הדגמה להמחשה בלבד — לא אושר על ידך'
        : 'נלקח מהפרופיל המאושר שלך',
      sourceNoteEn: isDemo
        ? 'Demo data for illustration only — not confirmed by user'
        : 'Taken from your verified profile',
      isConfirmed: !isDemo,
    });
  }

  if (departureLocation) {
    const isFromClarification = !!overrides.departureLocation;
    const isDemo = !isFromClarification && !!profile?.isDemo;
    extractedFacts.push({
      id: 'f_dep',
      key: 'departure',
      labelHe: isDemo ? 'נקודת יציאה לפעילות (נתוני הדגמה בלבד)' : 'נקודת יציאה לפעילות',
      labelEn: isDemo ? 'Activity Departure (Demo Data Only)' : 'Activity Departure',
      value: departureLocation,
      certainty: isFromClarification
        ? 'explicit'
        : isDemo
        ? 'inferred_provisional'
        : 'profile_confirmed',
      sourceNoteHe: isFromClarification
        ? 'נמסר במענה להבהרה'
        : isDemo
        ? 'נתוני הדגמה להמחשה בלבד — לא אושר על ידך'
        : 'נלקח מנקודת המוצא השגרתית בפרופיל',
      sourceNoteEn: isFromClarification
        ? 'From clarification response'
        : isDemo
        ? 'Demo data for illustration only — not confirmed by user'
        : 'From profile departure location',
      isConfirmed: isFromClarification || !isDemo,
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

  const clarificationQuestions: ClarificationQuestion[] = [];
  if (otherParticipantClarificationNeeded) {
    clarificationQuestions.push(otherParticipantClarificationNeeded);
  } else if (nextQuestion) {
    clarificationQuestions.push(nextQuestion);
  }

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

  // 9. Determine Experience Plan Type for seamless rubric workspace navigation (Mission 1 & 6)
  let planType: ExperiencePlanType = 'local_outing';
  if (isTrip) {
    planType = isFlightImplied ? 'vacation_abroad' : 'vacation_domestic';
  } else if (isFood) {
    planType = 'culinary';
  } else if (isMusic || artistMentioned) {
    planType = 'event';
  } else if (text.includes('טיול יום') || text.includes('טיול בטבע')) {
    planType = 'day_trip';
  } else {
    planType = 'local_outing';
  }

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
    planType,
  };
}

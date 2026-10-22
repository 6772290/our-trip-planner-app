import { createEmptyUserProfile, DEMO_PROFILE } from '../data/demoProfiles';
import { parseExperienceRequest } from '../engine/requestParser';
import { extractConstraintsAndWindows } from '../engine/constraintEngine';
import { identifyNextClarificationQuestion } from '../engine/clarificationEngine';
import { UserProfile, ContactPerson } from '../types/experience';
import { prepareSharedPreferences, sanitizeContactForSharing } from '../services/privacyService';
import { INITIAL_DEMO_TRIPS } from '../data/demoTrips';
import { UnifiedDatePicker } from '../components/UnifiedDatePicker';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('======================================================');
console.log('🧪 RUNNING MANDATORY STAGE 2.1 AUTOMATED TEST SUITE (10/10)');
console.log('======================================================\n');

const freshUser = createEmptyUserProfile();

// TEST 1: New user with no data gets NO invented identity, location, or preferences
console.log('Test 1: New user starts completely empty without invented facts...');
assert(freshUser.fullName === '', 'New user must have empty full name');
assert(freshUser.permanentHomeLocation === '', 'New user must have empty home location');
assert(freshUser.defaultActivityDepartureLocation === '', 'New user must have empty departure location');
assert(freshUser.preferences.length === 0, 'New user must have zero preferences');
assert(freshUser.isDemo === false, 'New user profile must not be marked as demo');
console.log('   ✅ Test 1 passed: Brand new user starts with 0 invented details.');

// TEST 2: Local evening request does NOT trigger flight selection or airport assignment
console.log('Test 2: Local evening plan request does not trigger flight selection...');
const localEveningResult = parseExperienceRequest('אשתי ואני לבד הערב, מחפשים מסעדה שקטה ויין טוב', {
  userProfile: freshUser,
});
assert(localEveningResult.isFlightImplied === false, 'Local evening plan must not imply flights');
assert(localEveningResult.locations.transportMode !== 'flight', 'Local evening must not set transport to flight');
assert(!localEveningResult.locations.departureAirport, 'No departure airport should be assigned for local dinner');
console.log('   ✅ Test 2 passed: Local plan does not trigger flights or airport selectors.');

// TEST 3: Request for André Rieu does NOT fabricate an unverified concert date, price, or venue
console.log('Test 3: Request for André Rieu does not fabricate unverified concert date/venue...');
const concertResult = parseExperienceRequest('אני רוצה לראות הופעה של אנדרה ריו, לא משנה באיזו מדינה', {
  userProfile: freshUser,
});
assert(concertResult.status === 'no_source_connected', 'Must report no connected external live ticketing API');
assert(concertResult.conceptualIdeas.length > 0, 'Must provide conceptual ideas');
concertResult.conceptualIdeas.forEach((idea) => {
  assert(idea.isVerified === false, 'Ideas must be marked as unverified (isVerified: false)');
  assert(idea.disclaimerHe.includes('לא נבדקו') || idea.disclaimerHe.includes('אין כרגע מקור מידע'), 'Must contain disclaimer');
});
const fabricatedDates = concertResult.extractedFacts.filter(f => f.key === 'concert_date');
assert(fabricatedDates.length === 0, 'Must not invent an unverified concert date');
console.log('   ✅ Test 3 passed: Artist request does not invent unverified tour dates or venues.');

// TEST 4: "אחד משני שבועות" without duration does NOT invent a 4-day duration
console.log('Test 4: "אחד משני שבועות" without explicit duration does NOT invent duration...');
const noDurationResult = extractConstraintsAndWindows('אני מעוניין לצאת לחופשה באחד משני שבועות');
assert(noDurationResult.timeWindows.length === 2, `Expected 2 alternative time windows, got ${noDurationResult.timeWindows.length}`);
assert(noDurationResult.timeWindows[0].durationDaysMin === undefined, 'Window 1 durationDaysMin must be undefined');
assert(noDurationResult.timeWindows[0].durationDaysMax === undefined, 'Window 1 durationDaysMax must be undefined');
assert(noDurationResult.timeWindows[1].durationDaysMin === undefined, 'Window 2 durationDaysMin must be undefined');
assert(noDurationResult.timeWindows[1].durationDaysMax === undefined, 'Window 2 durationDaysMax must be undefined');
assert(noDurationResult.timeWindows[0].isFlexible === true, 'Window 1 must be marked flexible');
console.log('   ✅ Test 4 passed: Two alternative weeks preserved with undefined duration (no 4-day invention).');

// TEST 5: Explicit 4 days in alternative weeks preserves duration
console.log('Test 5: Explicit "ארבעה ימים באחד משני שבועות" correctly preserves 4-day duration...');
const explicitDurationResult = extractConstraintsAndWindows('יש לי ארבעה ימים פנויים באחד משני שבועות');
assert(explicitDurationResult.timeWindows.length === 2, 'Expected 2 alternative time windows');
assert(explicitDurationResult.timeWindows[0].durationDaysMin === 4, 'Window 1 duration must be 4');
assert(explicitDurationResult.timeWindows[0].durationDaysMax === 4, 'Window 1 duration must be 4');
assert(explicitDurationResult.timeWindows[1].durationDaysMin === 4, 'Window 2 duration must be 4');
assert(explicitDurationResult.timeWindows[1].durationDaysMax === 4, 'Window 2 duration must be 4');
console.log('   ✅ Test 5 passed: Explicit 4-day duration preserved for both alternative windows.');

// TEST 6: "אני שוקל לטייל בפירנצה" is a soft destination preference, NOT a hard presence constraint
console.log('Test 6: Soft destination consideration ("שוקל לטייל בפירנצה") is NOT a hard constraint...');
const softFlorenceResult = extractConstraintsAndWindows('אני שוקל לטייל בפירנצה');
assert(softFlorenceResult.isHardDeadlinePresent === false, 'Soft destination consideration must not trigger hard deadline');
const florenceConstraint = softFlorenceResult.constraints.find(c => c.type === 'location_destination');
assert(!!florenceConstraint, 'Destination constraint should be recorded');
assert(florenceConstraint?.isHardConstraint === false, 'Considering Florence must be a soft preference (isHardConstraint: false)');
assert(florenceConstraint?.subtype === 'soft_destination_preference', 'Subtype must be soft_destination_preference');
console.log('   ✅ Test 6 passed: Soft destination consideration is not converted into a hard constraint.');

// TEST 7: Mandatory presence ("חייב להיות בפירנצה ביום שלישי בשעה 17:00") IS a hard presence constraint
console.log('Test 7: Mandatory presence with day & time IS a hard constraint...');
const hardFlorenceResult = extractConstraintsAndWindows('אני חייב להיות בפירנצה ביום שלישי בשעה 17:00');
assert(hardFlorenceResult.isHardDeadlinePresent === true, 'Mandatory presence must trigger hard deadline flag');
const hardFlorence = hardFlorenceResult.constraints.find(c => c.type === 'location_destination');
assert(!!hardFlorence, 'Hard presence constraint must exist');
assert(hardFlorence?.isHardConstraint === true, 'Mandatory presence must have isHardConstraint: true');
assert(hardFlorence?.subtype === 'mandatory_presence', 'Subtype must be mandatory_presence');
assert(hardFlorence?.targetDate === 'יום שלישי', 'Target date must be parsed as יום שלישי');
assert(hardFlorence?.targetTime === '17:00', 'Target time must be parsed as 17:00');
console.log('   ✅ Test 7 passed: Strict presence constraint accurately recognized with day and time.');

// TEST 8: Shabbat constraints are distinctly categorized and never conflated
console.log('Test 8: Shabbat constraints distinctly categorized into separate logical variants...');

// Variant 1: Must return before Shabbat
const shabbat1 = extractConstraintsAndWindows('חובה לחזור לפני כניסת שבת');
const c1 = shabbat1.constraints.find(c => c.type === 'shabbat_holiday');
assert(!!c1 && c1.subtype === 'must_return_before_shabbat', 'Variant 1 must be must_return_before_shabbat');
assert(c1?.isHardConstraint === true, 'Variant 1 must be a hard constraint');

// Variant 2: Preference to be home for Shabbat
const shabbat2 = extractConstraintsAndWindows('יש לי העדפה להיות בבית בשבת');
const c2 = shabbat2.constraints.find(c => c.type === 'shabbat_holiday');
assert(!!c2 && c2.subtype === 'prefer_home_for_shabbat', 'Variant 2 must be prefer_home_for_shabbat');
assert(c2?.isHardConstraint === false, 'Variant 2 must be a soft preference (isHardConstraint: false)');

// Variant 3: Depart only after Shabbat
const shabbat3 = extractConstraintsAndWindows('אפשרות לצאת רק אחרי צאת שבת');
const c3 = shabbat3.constraints.find(c => c.type === 'shabbat_holiday');
assert(!!c3 && c3.subtype === 'depart_only_after_shabbat', 'Variant 3 must be depart_only_after_shabbat');
assert(c3?.isHardConstraint === true, 'Variant 3 must be a hard constraint');

// Variant 4: Depart at least 3 hours after Shabbat
const shabbat4 = extractConstraintsAndWindows('דרישה לצאת לפחות שלוש שעות אחרי צאת שבת');
const c4 = shabbat4.constraints.find(c => c.type === 'shabbat_holiday');
assert(!!c4 && c4.subtype === 'depart_three_hours_after_shabbat', 'Variant 4 must be depart_three_hours_after_shabbat');
assert(c4?.isHardConstraint === true, 'Variant 4 must be a hard constraint');

// Variant 5: Return by Friday 10:00 AM
const shabbat5 = extractConstraintsAndWindows('דרישה לחזור עד יום שישי בשעה 10:00');
const c5 = shabbat5.constraints.find(c => c.type === 'shabbat_holiday');
assert(!!c5 && c5.subtype === 'return_friday_morning', 'Variant 5 must be return_friday_morning');
assert(c5?.isHardConstraint === true, 'Variant 5 must be a hard constraint');
assert(c5?.targetTime === '10:00', 'Target time must be 10:00');
assert(c5?.targetDate === 'יום שישי', 'Target date must be יום שישי');
console.log('   ✅ Test 8 passed: All 5 Shabbat variants are distinct, non-conflated, and properly weighted.');

// TEST 9: Clarifications remembered across turns, free-text supported, independent answers preserved
console.log('Test 9: Clarification memory, non-re-asking, and independent answer preservation...');

// Initial ambiguous evening prompt:
const turn1 = parseExperienceRequest('אשתי ואני לבד הערב, מה אתה מציע?', {
  userProfile: freshUser,
});
assert(turn1.status === 'missing_details', 'Turn 1 must identify missing details');
assert(turn1.clarificationQuestions.length === 1, 'Turn 1 must formulate single next clarification question');
assert(turn1.clarificationQuestions[0].id === 'q_experience_nature', 'Turn 1 asks about nature of evening');
assert(turn1.clarificationQuestions[0].allowFreeText === true, 'Question allows free-text input');

// Turn 2: User answers via free text that they want food / culinary:
const overridesTurn2 = { experienceType: 'אוכל ומסעדה טובה' };
const turn2 = parseExperienceRequest('אשתי ואני לבד הערב, מה אתה מציע?', {
  userProfile: freshUser,
  clarifiedOverrides: overridesTurn2,
});
// Since food is selected and departure is unknown, next question is departure area:
assert(turn2.clarificationQuestions.length === 1, 'Turn 2 asks next question');
assert(turn2.clarificationQuestions[0].id === 'q_departure_area', 'Turn 2 asks for departure area, NOT experience nature again');

// Turn 3: User answers departure area with free text "רמת גן":
const overridesTurn3 = { ...overridesTurn2, departureLocation: 'רמת גן' };
const turn3 = parseExperienceRequest('אשתי ואני לבד הערב, מה אתה מציע?', {
  userProfile: freshUser,
  clarifiedOverrides: overridesTurn3,
});
// Next question should be culinary vibe:
assert(turn3.clarificationQuestions.length === 1, 'Turn 3 asks next question');
assert(turn3.clarificationQuestions[0].id === 'q_culinary_vibe', 'Turn 3 asks culinary vibe');

// Turn 4: User answers culinary vibe "איטלקי":
const overridesTurn4 = { ...overridesTurn3, culinaryVibe: 'איטלקי' };
const turn4 = parseExperienceRequest('אשתי ואני לבד הערב, מה אתה מציע?', {
  userProfile: freshUser,
  clarifiedOverrides: overridesTurn4,
});
assert(turn4.clarificationQuestions.length === 0, 'No more blocking clarification questions');
assert(turn4.extractedFacts.some(f => f.key === 'culinaryVibe' && f.value.includes('איטלקי')), 'Culinary vibe is recorded as fact');

// Turn 5: User updates departure area to "תל אביב" — culinary vibe is preserved!
const overridesTurn5 = { ...overridesTurn4, departureLocation: 'תל אביב' };
const turn5 = parseExperienceRequest('אשתי ואני לבד הערב, מה אתה מציע?', {
  userProfile: freshUser,
  clarifiedOverrides: overridesTurn5,
});
assert(turn5.locations.activityDepartureLocation === 'תל אביב', 'Departure location updated');
assert(turn5.extractedFacts.some(f => f.key === 'culinaryVibe' && f.value.includes('איטלקי')), 'Independent culinary vibe answer preserved without wiping');
console.log('   ✅ Test 9 passed: Multi-turn clarification memory, free-text response, and non-destructive answer updates verified.');

// TEST 10: Centralized Privacy Service ensures strict audience isolation & contact sanitization
console.log('Test 10: Centralized Privacy Service prevents unauthorized data & contact leakage...');
const privacyTestUser: UserProfile = {
  ...freshUser,
  preferences: [
    {
      id: 'p_pub',
      category: 'culture',
      label: 'אוהב קונצרטים פתוחים',
      provenance: 'confirmed',
      scope: 'public',
    },
    {
      id: 'p_grp',
      category: 'music',
      label: 'אוהב ג׳אז ובלוז',
      provenance: 'confirmed',
      scope: 'group',
    },
    {
      id: 'p_partner',
      category: 'atmosphere',
      label: 'מעדיף שולחן מבודד ושקט',
      provenance: 'confirmed',
      scope: 'partner_only',
    },
    {
      id: 'p_priv',
      category: 'dietary',
      label: 'הגבלה רפואית אישית סודית',
      provenance: 'confirmed',
      scope: 'private',
    },
  ],
};

// 1. Sharing with partner: receives public, group, partner_only; NEVER private
const partnerView = prepareSharedPreferences(privacyTestUser, 'partner');
assert(partnerView.some(p => p.id === 'p_pub'), 'Partner view must include public preference');
assert(partnerView.some(p => p.id === 'p_grp'), 'Partner view must include group preference');
assert(partnerView.some(p => p.id === 'p_partner'), 'Partner view must include partner_only preference');
assert(!partnerView.some(p => p.id === 'p_priv'), 'Partner view must NEVER include private preference');

// 2. Sharing with group: receives public, group; NEVER partner_only or private
const groupView = prepareSharedPreferences(privacyTestUser, 'group');
assert(groupView.some(p => p.id === 'p_pub'), 'Group view must include public preference');
assert(groupView.some(p => p.id === 'p_grp'), 'Group view must include group preference');
assert(!groupView.some(p => p.id === 'p_partner'), 'Group view must NEVER include partner_only preference');
assert(!groupView.some(p => p.id === 'p_priv'), 'Group view must NEVER include private preference');

// 3. Sharing with public: receives ONLY public; NEVER group, partner_only, or private
const publicView = prepareSharedPreferences(privacyTestUser, 'public');
assert(publicView.some(p => p.id === 'p_pub'), 'Public view must include public preference');
assert(!publicView.some(p => p.id === 'p_grp'), 'Public view must NEVER include group preference');
assert(!publicView.some(p => p.id === 'p_partner'), 'Public view must NEVER include partner_only preference');
assert(!publicView.some(p => p.id === 'p_priv'), 'Public view must NEVER include private preference');

// 4. Contact sanitization: private affinity and private notes are completely stripped
const contactPerson: ContactPerson = {
  id: 'c_michal',
  name: 'מיכל כהן',
  relationship: 'בת זוג',
  interestInActivitiesTogether: 'prefer_not', // Confidential internal rating!
  privateNotes: 'הערה אישית סודית ביותר שאין לחשוף', // Confidential note!
  permanentHome: 'תל אביב',
  estimatedPreferences: ['מעדיפה צמחוני'],
  confirmedPreferences: ['חובבת אמנות'],
};

const sanitizedContact = sanitizeContactForSharing(contactPerson);
assert((sanitizedContact as any).interestInActivitiesTogether === undefined, 'Contact affinity rating must be stripped');
assert((sanitizedContact as any).privateNotes === undefined, 'Contact private notes must be stripped');
assert(sanitizedContact.name === 'מיכל כהן', 'Contact name retained');
assert(sanitizedContact.confirmedPreferences?.[0] === 'חובבת אמנות', 'Confirmed preferences retained');
console.log('   ✅ Test 10 passed: Centralized privacy service enforces complete isolation across all scopes.');

console.log('\n======================================================');
console.log('🎉 ALL 10 MANDATORY STAGE 2.1 AUTOMATED TESTS PASSED SUCCESSFULLY!');
console.log('======================================================\n');

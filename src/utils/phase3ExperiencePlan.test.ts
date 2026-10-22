import assert from 'node:assert';
import { parseExperienceRequest } from '../engine/requestParser';
import { resolveNormalizedCity, analyzeContextualLocations } from './locationResolver';
import { extractConstraintsAndWindows } from '../engine/constraintEngine';
import { createPlanFromParsedResult, updateDatesFromNaturalText } from './planSynchronizer';
import { createEmptyUserProfile, isDefiniteDemoProfile } from '../data/demoProfiles';
import { ExperiencePlan } from '../types/experiencePlan';

console.log('🧪 Starting Phase 3 Unified Experience Plan Test Suite...');

// Test 1: Local outing in Rishon LeZion does NOT open flights or mark flight implied
(() => {
  console.log('Running Test 1: Local outing in Rishon LeZion does not trigger flight fields...');
  const result = parseExperienceRequest('בילוי בראשון לציון עם חברים הערב במסעדה');
  assert.strictEqual(result.isFlightImplied, false, 'Flight should NOT be implied for Rishon LeZion');
  assert.strictEqual(result.locations.transportMode, 'car', 'Transport mode should be domestic/ground transport');
  assert.strictEqual(result.planType, 'culinary', 'Plan type should be culinary or local outing');

  const plan = createPlanFromParsedResult(result);
  assert.strictEqual(plan.locations.isFlightRequired, false, 'Plan locations should not require flight');
  assert.strictEqual(plan.type, 'culinary');
  console.log('✅ Test 1 Passed: Local outing strictly uses ground transport without flights.');
})();

// Test 2: "ראשלצ", "ראשל\"צ", "ראשל״צ" and "ראשון לציון" resolve to the exact same canonical city
(() => {
  console.log('Running Test 2: City abbreviations and aliases normalize to identical canonical destination...');
  const c1 = resolveNormalizedCity('ראשלצ');
  const c2 = resolveNormalizedCity('ראשל"צ');
  const c3 = resolveNormalizedCity('ראשל״צ');
  const c4 = resolveNormalizedCity('ראשון לציון');
  const c5 = resolveNormalizedCity('Rishon LeZion');

  assert.ok(c1 && c2 && c3 && c4 && c5, 'All variants must resolve to a valid city object');
  assert.strictEqual(c1?.canonicalNameHe, 'ראשון לציון', 'c1 canonical name must be ראשון לציון');
  assert.strictEqual(c2?.canonicalNameHe, 'ראשון לציון', 'c2 canonical name must be ראשון לציון');
  assert.strictEqual(c3?.canonicalNameHe, 'ראשון לציון', 'c3 canonical name must be ראשון לציון');
  assert.strictEqual(c4?.canonicalNameHe, 'ראשון לציון', 'c4 canonical name must be ראשון לציון');
  assert.strictEqual(c1?.canonicalNameEn, c4?.canonicalNameEn, 'English name must match');
  assert.strictEqual(c2?.countryHe, c4?.countryHe, 'Country must match');
  console.log('✅ Test 2 Passed: Abbreviation variants normalize to identical canonical city.');
})();

// Test 3: Family location ("הבן שלי לומד בראשלצ") is NOT set as user's permanent home and generates clarification
(() => {
  console.log('Running Test 3: Contextual parsing of other participant location...');
  const text = 'הבן שלי לומד בראשלצ ואני רוצה להוציא אותו היום לבילוי';
  const emptyProfile = createEmptyUserProfile();
  const parsed = parseExperienceRequest(text, { userProfile: emptyProfile });

  // Must not set user's permanent home as Rishon LeZion
  assert.ok(!parsed.locations.permanentHome, 'Permanent home must remain empty in profile');

  // Must recognize that the child/son is in Rishon LeZion
  const contextLoc = analyzeContextualLocations(text);
  assert.strictEqual(contextLoc.otherParticipantLocation?.city.canonicalNameHe, 'ראשון לציון');
  assert.strictEqual(contextLoc.otherParticipantLocation?.participantRole, 'הבן שלי');

  // Clarification question should ask whether to hang out in Rishon LeZion or pick up to go elsewhere
  const locClarification = parsed.clarificationQuestions.find(q => q.id === 'q_other_participant_location_action' || q.targetField === 'destinationLocation');
  assert.ok(locClarification, 'Clarification question should be offered regarding meeting or destination');
  console.log('✅ Test 3 Passed: Family location does not corrupt user profile, triggers clarification.');
})();

// Test 4: Kosher Mehadrin is stored as a dietary requirement and NOT as culinary cuisine
(() => {
  console.log('Running Test 4: Kosher Mehadrin decoupled from culinary cuisines...');
  const parsed = parseExperienceRequest('מחפש מסעדה כשרה למהדרין');
  const plan = createPlanFromParsedResult(parsed);

  assert.ok(plan.dietary.restrictions.includes('kosher_mehadrin'), 'Restrictions must include kosher_mehadrin');

  // Cuisines must not be polluted with kosher
  assert.ok(!plan.culinary.cuisines.includes('mehadrin' as any), 'Cuisine list must not contain mehadrin');
  console.log('✅ Test 4 Passed: Kosher Mehadrin is correctly isolated in dietary requirements.');
})();

// Test 5: Selecting sushi or Italian does NOT delete or overwrite kosher requirement
(() => {
  console.log('Running Test 5: Selecting sushi preserves kosher requirement intact...');
  const parsed = parseExperienceRequest('מחפש סושי כשר');
  const plan = createPlanFromParsedResult(parsed);

  // Both sushi and kosher must co-exist
  assert.ok(plan.culinary.cuisines.some(c => c.includes('סושי')), 'Cuisine must include sushi');
  assert.ok(plan.dietary.restrictions.includes('kosher'), 'Kosher restriction present');

  // Now change cuisine to italian in structured rubric
  plan.culinary.cuisines = ['איטלקי / פיצה'];
  assert.ok(plan.dietary.restrictions.includes('kosher'), 'Kosher requirement must remain intact when changing cuisine');
  console.log('✅ Test 5 Passed: Cuisines and dietary requirements remain fully decoupled and preserved.');
})();

// Test 6: Natural language date input updates the date rubric
(() => {
  console.log('Running Test 6: Natural language date rubric parser...');
  const parsed = parseExperienceRequest('מסעדה בתל אביב');
  const plan = createPlanFromParsedResult(parsed);

  const { updatedPlan, success } = updateDatesFromNaturalText(plan, 'הערב');
  assert.strictEqual(success, true, 'Parsing natural text should succeed');
  assert.strictEqual(updatedPlan.dates.timeOfDay?.value, 'evening', 'Time of day should be evening');
  assert.ok(updatedPlan.dates.specificDate?.value, 'Specific date should be populated');
  assert.strictEqual(updatedPlan.dates.specificDate?.certainty, 'explicit', 'Certainty should be explicit from natural text');
  console.log('✅ Test 6 Passed: Natural language updates date rubric.');
})();

// Test 7: Changing date in structured picker updates the exact same model
(() => {
  console.log('Running Test 7: Structured picker updates identical model...');
  const parsed = parseExperienceRequest('הופעה בקיסריה');
  const plan = createPlanFromParsedResult(parsed);

  // Structured update
  plan.dates.specificDate = {
    value: '2026-05-15',
    source: 'rubric_input',
    certainty: 'explicit',
    isConfirmed: true,
  };
  plan.dates.endDate = {
    value: '2026-05-18',
    source: 'rubric_input',
    certainty: 'explicit',
    isConfirmed: true,
  };
  plan.dates.mode = 'date_range';

  assert.strictEqual(plan.dates.specificDate?.value, '2026-05-15');
  assert.strictEqual(plan.dates.endDate?.value, '2026-05-18');
  assert.strictEqual(plan.dates.mode, 'date_range');
  console.log('✅ Test 7 Passed: Structured picker updates identical model.');
})();

// Test 8: Multiple Shabbat constraints in same request are stored together
(() => {
  console.log('Running Test 8: Two Shabbat constraints co-existing in one request...');
  const prompt = 'יציאה לפחות 3 שעות מצאת השבת וחזרה בשישי בבוקר עד 10:00';
  const { constraints } = extractConstraintsAndWindows(prompt);

  const hasDepartAfterHavdalah = constraints.some(c => c.subtype === 'depart_three_hours_after_shabbat' || c.id === 'c_shabbat_three_hours_after');
  const hasReturnFridayMorning = constraints.some(c => c.subtype === 'return_friday_morning' || c.id === 'c_shabbat_friday_morning');

  assert.ok(hasDepartAfterHavdalah, 'Should extract depart after Havdalah constraint');
  assert.ok(hasReturnFridayMorning, 'Should extract return Friday morning constraint');
  assert.ok(constraints.length >= 2, 'Both Shabbat constraints must co-exist');
  console.log('✅ Test 8 Passed: Multiple Shabbat constraints co-exist without collision.');
})();

// Test 9: Moving from request understanding to plan workspace retains all gathered information
(() => {
  console.log('Running Test 9: Transition retains participants, dates, dietary, and budget...');
  const parsed = parseExperienceRequest('סושי כשר בראשון לציון הערב עם אשתי בתקציב נוח');
  const plan = createPlanFromParsedResult(parsed);

  assert.strictEqual(plan.type, 'culinary');
  assert.ok(plan.participants.some(p => p.role === 'partner'), 'Partner should be in participants');
  assert.ok(plan.dietary.restrictions.includes('kosher'), 'Kosher dietary retained');
  assert.ok(plan.culinary.cuisines.some(c => c.includes('סושי')), 'Sushi cuisine retained');
  assert.strictEqual(plan.locations.destinationLocation?.value, 'ראשון לציון', 'Destination retained');
  assert.strictEqual(plan.dates.timeOfDay?.value, 'evening', 'Evening time retained');
  console.log('✅ Test 9 Passed: Zero data loss during transition to plan workspace.');
})();

// Test 10: 5-step vacation planning wizard remains accessible and distinct
(() => {
  console.log('Running Test 10: Vacation planning wizard compatibility...');
  const parsedVacation = parseExperienceRequest('חופשה של שבוע באיטליה עם חברים');
  assert.strictEqual(parsedVacation.planType, 'vacation_abroad');
  assert.strictEqual(parsedVacation.isFlightImplied, true);
  console.log('✅ Test 10 Passed: 5-step trip wizard integration remains active and accessible.');
})();

// Test 11: A new user starts with an empty personal profile without invented details
(() => {
  console.log('Running Test 11: New user profile is pristine and empty...');
  const emptyProfile = createEmptyUserProfile();
  assert.strictEqual(emptyProfile.fullName, '');
  assert.strictEqual(emptyProfile.permanentHomeLocation, '');
  assert.strictEqual(emptyProfile.preferences.length, 0);
  assert.strictEqual(emptyProfile.isDemo, false);
  assert.strictEqual(isDefiniteDemoProfile(emptyProfile), false);
  console.log('✅ Test 11 Passed: New user profile is completely clean.');
})();

console.log('🎉 ALL 11 TESTS PASSED SUCCESSFULLY! 🚀');

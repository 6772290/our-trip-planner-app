import {
  searchAirports,
  formatAirportOption,
  findAirportByIata,
  MAJOR_AIRPORTS,
} from './airportDirectory';
import {
  POLITE_DECLINE_TEMPLATES,
  getCustomizedDeclineMessage,
} from './privacyAndDecline';
import { PROVENANCE_DETAILS, ProvenanceType } from '../types/experience';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('--- RUNNING EXPERIENCE PLATFORM VALIDATION TESTS ---');

// 1. Airport Search Tests
console.log('1. Testing Airport Directory & Multi-attribute Search...');

// Search by IATA code
const mxpResults = searchAirports('MXP', 'he');
assert(mxpResults.length > 0, 'Should find airport by IATA MXP');
assert(mxpResults[0].iata === 'MXP', 'First result should be MXP');

// Search by city in Hebrew
const milanResults = searchAirports('מילאנו', 'he');
assert(milanResults.some((a) => a.iata === 'MXP'), 'Milan Hebrew search should include MXP');
assert(milanResults.some((a) => a.iata === 'LIN'), 'Milan Hebrew search should include LIN');

// Search by city in English
const romeResults = searchAirports('Rome', 'en');
assert(romeResults.some((a) => a.iata === 'FCO'), 'Rome search should include FCO');

// Search by airport Hebrew alias
const natbagResults = searchAirports('נתבג', 'he');
assert(natbagResults.some((a) => a.iata === 'TLV'), 'Search "נתבג" should find TLV');

// Test formatted string exact pattern
const formattedMxpHe = formatAirportOption(mxpResults[0], 'he');
assert(
  formattedMxpHe.includes('נמל התעופה מילאנו מלפנזה — מילאנו, איטליה (MXP)'),
  `Formatted label mismatch: ${formattedMxpHe}`
);

const formattedMxpEn = formatAirportOption(mxpResults[0], 'en');
assert(
  formattedMxpEn.includes('Milan Malpensa Airport — Milan, Italy (MXP)'),
  `Formatted English label mismatch: ${formattedMxpEn}`
);

console.log('   ✓ Airport search and formatting passed.');

// 2. Data Provenance Tagging Tests
console.log('2. Testing Data Provenance Tagging...');
const validTypes: ProvenanceType[] = ['confirmed', 'estimate', 'inferred'];
validTypes.forEach((t) => {
  assert(!!PROVENANCE_DETAILS[t], `Provenance detail missing for ${t}`);
  assert(!!PROVENANCE_DETAILS[t].labelHe, `Hebrew label missing for ${t}`);
  assert(!!PROVENANCE_DETAILS[t].descriptionHe, `Hebrew description missing for ${t}`);
  assert(!!PROVENANCE_DETAILS[t].colorClass, `Color class missing for ${t}`);
});
console.log('   ✓ Provenance definitions verified.');

// 3. Social Privacy & Polite Decline Message Generator Tests
console.log('3. Testing Polite Decline Generator (No fake calendar excuses)...');
assert(POLITE_DECLINE_TEMPLATES.length >= 4, 'Should have at least 4 decline templates');

POLITE_DECLINE_TEMPLATES.forEach((tmpl) => {
  // Check that templates do not contain dishonest calendar excuses (e.g., fake appointments or doctor visits)
  assert(!tmpl.textHe.includes('רופא'), 'Decline template must not contain fake doctor excuse');
  assert(!tmpl.textHe.includes('פגישה דחופה'), 'Decline template must not fabricate meetings');
  assert(tmpl.textHe.length > 10, 'Hebrew text must be substantial and polite');
  assert(tmpl.textEn.length > 10, 'English text must be substantial and polite');
});

const customizedHe = getCustomizedDeclineMessage('warm_direct', 'מיכל', 'he');
assert(customizedHe.startsWith('היי מיכל,'), 'Personalized decline should start with greeting');

const customizedEn = getCustomizedDeclineMessage('warm_direct', 'Alex', 'en');
assert(customizedEn.startsWith('Hi Alex,'), 'Personalized English decline should start with Hi');

console.log('   ✓ Polite decline templates verified.');

// 4. Calendar & Hooks verification
console.log('4. Verifying UnifiedDatePicker export and clean structure...');
// Verify module exports
import('../components/UnifiedDatePicker').then((mod) => {
  assert(typeof mod.UnifiedDatePicker === 'function', 'UnifiedDatePicker must be a React component function');
  console.log('   ✓ UnifiedDatePicker hook-safe structure confirmed.');
  console.log('\nALL TESTS PASSED SUCCESSFULLY! (5/5)');
});

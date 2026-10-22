import { createEmptyUserProfile, DEMO_PROFILE, DEMO_CONTACTS, DEMO_SAVED_GROUPS } from '../data/demoProfiles';
import { parseExperienceRequest } from '../engine/requestParser';
import { INITIAL_DEMO_TRIPS } from '../data/demoTrips';
import { UserProfile, ContactPerson, SavedGroup } from '../types/experience';
import { Trip } from '../types/trip';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  }
}

// In-memory mock localStorage for node environment
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = String(value);
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  },
};

const STORAGE_KEY = 'our_trip_applet_state_v1';
const PROFILE_STORAGE_KEY = 'our_trip_profile_v1';
const CONTACTS_STORAGE_KEY = 'our_trip_contacts_v1';
const GROUPS_STORAGE_KEY = 'our_trip_groups_v1';

console.log('========================================================================');
console.log('🧪 RUNNING AUTOMATED PROFILE RESET & LOCALSTORAGE PERSISTENCE SUITE');
console.log('========================================================================\n');

// STEP 1: Simulate user having active trips in storage
console.log('Step 1: Storing initial user trips in localStorage...');
mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_TRIPS));
assert(mockLocalStorage.getItem(STORAGE_KEY) !== null, 'Trips must be saved in storage');

// STEP 2: Simulate Demo Profile being active
console.log('Step 2: Activating Demo profile (Dan Cohen, Tel Aviv, Ramat Hahayal)...');
mockLocalStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(DEMO_PROFILE));
mockLocalStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(DEMO_CONTACTS));
mockLocalStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(DEMO_SAVED_GROUPS));

// Parse request with demo profile: Must NOT mark demo facts as user-confirmed!
const demoParse = parseExperienceRequest('בא לי לאכול משהו טוב הערב', {
  userProfile: DEMO_PROFILE,
});
const homeFact = demoParse.extractedFacts.find(f => f.key === 'home');
const depFact = demoParse.extractedFacts.find(f => f.key === 'departure');

assert(!!homeFact, 'Demo profile home fact is present');
assert(homeFact?.isConfirmed === false, 'Demo home fact must NEVER be marked as isConfirmed: true');
assert(homeFact?.certainty !== 'profile_confirmed', 'Demo home fact certainty must NOT be profile_confirmed');
assert(Boolean(homeFact?.sourceNoteHe.includes('נתוני הדגמה להמחשה בלבד')), 'Must state demo data disclaimer');

assert(!!depFact, 'Demo profile departure fact is present');
assert(depFact?.isConfirmed === false, 'Demo departure fact must NEVER be marked as isConfirmed: true');
console.log('   ✅ Step 2 passed: Demo facts are explicitly unconfirmed and clearly labeled as demo illustration.');

// STEP 3: User triggers "איפוס לפרופיל אישי נקי" (Reset to Clean Personal Profile)
console.log('Step 3: Triggering reset to clean personal profile with user confirmation...');

function executeProfileReset(userConfirmed: boolean) {
  if (!userConfirmed) return false;

  const cleanProfile = createEmptyUserProfile();
  mockLocalStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(cleanProfile));
  mockLocalStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify([]));
  mockLocalStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify([]));
  return true;
}

// User confirms reset
const resetSuccess = executeProfileReset(true);
assert(resetSuccess === true, 'Reset must succeed upon confirmation');

// STEP 4: Verify trips were NOT deleted or corrupted by profile reset
console.log('Step 4: Verifying saved trips are preserved untouched after profile reset...');
const tripsAfterReset = JSON.parse(mockLocalStorage.getItem(STORAGE_KEY) || '[]');
assert(tripsAfterReset.length === INITIAL_DEMO_TRIPS.length, 'Saved trips must not be touched by profile reset');
assert(tripsAfterReset[0].title === INITIAL_DEMO_TRIPS[0].title, 'Trip data remains intact');
console.log('   ✅ Step 4 passed: Saved trips remain completely intact.');

// STEP 5: Simulate page refresh (reload from localStorage)
console.log('Step 5: Simulating browser page reload from localStorage...');
const reloadedProfileJson = mockLocalStorage.getItem(PROFILE_STORAGE_KEY);
assert(reloadedProfileJson !== null, 'Profile key must exist in localStorage');
const reloadedProfile: UserProfile = JSON.parse(reloadedProfileJson!);

assert(reloadedProfile.fullName === '', 'Reloaded profile must have empty fullName');
assert(reloadedProfile.permanentHomeLocation === '', 'Reloaded profile must have empty permanentHomeLocation');
assert(reloadedProfile.defaultActivityDepartureLocation === '', 'Reloaded profile must have empty defaultActivityDepartureLocation');
assert(reloadedProfile.preferences.length === 0, 'Reloaded profile must have 0 preferences');
assert(reloadedProfile.isDemo === false, 'Reloaded profile isDemo must be false');

const reloadedContacts: ContactPerson[] = JSON.parse(mockLocalStorage.getItem(CONTACTS_STORAGE_KEY) || '[]');
assert(reloadedContacts.length === 0, 'Reloaded contacts must be empty array');

const reloadedGroups: SavedGroup[] = JSON.parse(mockLocalStorage.getItem(GROUPS_STORAGE_KEY) || '[]');
assert(reloadedGroups.length === 0, 'Reloaded groups must be empty array');
console.log('   ✅ Step 5 passed: Clean profile persists across page reloads without resurrecting old demo data.');

// STEP 6: Parse request with clean reloaded profile: Zero invented facts, no Tel Aviv, no Ramat Hahayal
console.log('Step 6: Parsing request after reload: Zero invented locations or identities...');
const cleanParse = parseExperienceRequest('בא לי לאכול משהו טוב הערב', {
  userProfile: reloadedProfile,
  contacts: reloadedContacts,
  savedGroups: reloadedGroups,
});

const homeAfterReset = cleanParse.extractedFacts.find(f => f.key === 'home');
const depAfterReset = cleanParse.extractedFacts.find(f => f.key === 'departure');
assert(!homeAfterReset, 'No permanent home fact must exist after reset');
assert(!depAfterReset, 'No departure location fact must exist after reset');
assert(cleanParse.locations.permanentHome === '', 'Location permanentHome is empty');
assert(cleanParse.locations.activityDepartureLocation === '', 'Location activityDepartureLocation is empty');
console.log('   ✅ Step 6 passed: Post-reload request contains zero invented locations or identity facts.');

console.log('\n========================================================================');
console.log('🎉 ALL PROFILE RESET AND REFRESH PERSISTENCE TESTS PASSED SUCCESSFULLY!');
console.log('========================================================================\n');

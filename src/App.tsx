import React, { useState, useEffect } from 'react';
import { Trip, ParticipantAnswers, TripType } from './types/trip';
import { UserProfile, ContactPerson, SavedGroup } from './types/experience';
import {
  createEmptyUserProfile,
  DEMO_PROFILE,
  DEMO_CONTACTS,
  DEMO_SAVED_GROUPS,
  isDefiniteDemoProfile,
} from './data/demoProfiles';
import { INITIAL_DEMO_TRIPS } from './data/demoTrips';
import { Header, NavViewType } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeScreen } from './components/HomeScreen';
import { CreateTripScreen } from './components/CreateTripScreen';
import { QuestionnaireScreen } from './components/QuestionnaireScreen';
import { SummaryRecommendationsScreen } from './components/SummaryRecommendationsScreen';
import { ExperiencePortalScreen } from './components/ExperiencePortalScreen';
import { ProfileAndPrivacyModal, AccountModalTab } from './components/ProfileAndPrivacyModal';
import { InfoModal } from './components/InfoModal';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

type AppView = 'experiences' | 'welcome' | 'home' | 'create_trip' | 'questionnaire' | 'summary';

const STORAGE_KEY = 'our_trip_applet_state_v1';
const PROFILE_STORAGE_KEY = 'our_trip_profile_v1';
const CONTACTS_STORAGE_KEY = 'our_trip_contacts_v1';
const GROUPS_STORAGE_KEY = 'our_trip_groups_v1';
const DEMO_EXPLICIT_KEY = 'our_trip_demo_explicit_active_v1';

function AppContent() {
  const { language, t } = useLanguage();

  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial demo trips', e);
    }
    return INITIAL_DEMO_TRIPS;
  });

  // A brand new user starts automatically with an EMPTY personal profile. Zero invented facts.
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const isExplicitDemo = localStorage.getItem(DEMO_EXPLICIT_KEY) === 'true';
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // If stored data is identified as old demo data and user hasn't explicitly activated demo mode:
          if (isDefiniteDemoProfile(parsed)) {
            if (isExplicitDemo) {
              parsed.isDemo = true;
              return parsed;
            }
            // Isolate and ignore old demo data lingering from previous builds - start clean
            return createEmptyUserProfile();
          }
          // Real user profile with authentic user preferences
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return createEmptyUserProfile();
  });

  // Contacts start empty for new user
  const [contacts, setContacts] = useState<ContactPerson[]>(() => {
    try {
      const saved = localStorage.getItem(CONTACTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Groups start empty for new user
  const [savedGroups, setSavedGroups] = useState<SavedGroup[]>(() => {
    try {
      const saved = localStorage.getItem(GROUPS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [currentView, setCurrentView] = useState<AppView>('experiences');
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'how_it_works' | 'faq' | null>(null);
  const [isPrivacyCenterOpen, setIsPrivacyCenterOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<AccountModalTab>('profile');

  // Pre-fill data for trip wizard when originating from experience portal
  const [tripWizardInitialData, setTripWizardInitialData] = useState<{
    title?: string;
    destination?: string;
    tripType?: TripType;
  } | undefined>(undefined);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [trips]);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
    } catch {
      // ignore
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
    } catch {
      // ignore
    }
  }, [contacts]);

  useEffect(() => {
    try {
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(savedGroups));
    } catch {
      // ignore
    }
  }, [savedGroups]);

  // Ensure scroll position resets to top on every screen transition
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentView, activeTripId]);

  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0];

  const handleStartPlanning = (initialData?: {
    title?: string;
    destination?: string;
    tripType?: TripType;
  }) => {
    setTripWizardInitialData(initialData);
    setCurrentView('create_trip');
  };

  const handleExploreDemoTrips = () => {
    setCurrentView('home');
  };

  const handleCreateNewTrip = (newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev]);
    setActiveTripId(newTrip.id);
    setActiveParticipantId(newTrip.participants[0]?.id || null);
    setCurrentView('questionnaire');
  };

  const handleSelectTrip = (trip: Trip) => {
    setActiveTripId(trip.id);
    setActiveParticipantId(trip.participants[0]?.id || null);

    const hasAnyAnswers = trip.participants.some((p) => p.isAnswered);
    if (hasAnyAnswers) {
      setCurrentView('summary');
    } else {
      setCurrentView('questionnaire');
    }
  };

  const handleDeleteTrip = (tripId: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    if (activeTripId === tripId) {
      setActiveTripId(null);
      setCurrentView('home');
    }
  };

  const handleResetDemoData = () => {
    const confirmMsg =
      language === 'he'
        ? 'האם לאפס את נתוני הטיולים לנתוני ההדגמה הראשוניים?'
        : 'Reset trips data to initial demo data?';

    if (window.confirm(confirmMsg)) {
      setTrips(INITIAL_DEMO_TRIPS);
      setActiveTripId(INITIAL_DEMO_TRIPS[0].id);
      setCurrentView('home');
    }
  };

  // Demo mode switchers with explicit user confirmation and instant localStorage sync
  const handleLoadDemoData = () => {
    setUserProfile(DEMO_PROFILE);
    setContacts(DEMO_CONTACTS);
    setSavedGroups(DEMO_SAVED_GROUPS);
    try {
      localStorage.setItem(DEMO_EXPLICIT_KEY, 'true');
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(DEMO_PROFILE));
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(DEMO_CONTACTS));
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(DEMO_SAVED_GROUPS));
    } catch (e) {
      console.warn('Could not save demo data to localStorage', e);
    }
  };

  const handleResetToEmptyProfile = () => {
    const cleanProfile = createEmptyUserProfile();
    setUserProfile(cleanProfile);
    setContacts([]);
    setSavedGroups([]);

    try {
      localStorage.removeItem(DEMO_EXPLICIT_KEY);
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(cleanProfile));
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.warn('Could not reset localStorage profile keys', e);
    }
  };

  const handleQuestionnaireComplete = (answers: ParticipantAnswers) => {
    if (!activeTripId) return;

    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== activeTripId) return trip;

        const updatedParticipants = trip.participants.map((p) => {
          if (p.id === (activeParticipantId || trip.participants[0].id)) {
            return {
              ...p,
              isAnswered: true,
              answers,
            };
          }
          return p;
        });

        return {
          ...trip,
          participants: updatedParticipants,
          status: 'ready',
        };
      })
    );

    setCurrentView('summary');
  };

  const handleAnswerForParticipant = (participantId: string) => {
    setActiveParticipantId(participantId);
    setCurrentView('questionnaire');
  };

  const handleAddNewParticipant = (name: string) => {
    if (!activeTripId) return;

    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== activeTripId) return trip;
        const newPart = {
          id: `p_${Date.now()}`,
          name,
          role: language === 'he' ? 'משתתף נוסף' : 'Participant',
          isAnswered: false,
          preferredLanguage: language,
          preferredCalendar: trip.calendarSystem || 'gregorian',
          timezone: 'Asia/Jerusalem',
        };
        return {
          ...trip,
          participants: [...trip.participants, newPart],
        };
      })
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      {/* Top Header with Language Switcher and Navigation */}
      <Header
        currentView={currentView}
        onNavigate={(view: NavViewType) => {
          if (view === 'create_trip') {
            handleStartPlanning();
          } else {
            setCurrentView(view);
          }
        }}
        userProfile={userProfile}
        onOpenAccountSection={(tab) => {
          setAccountModalTab(tab);
          setIsPrivacyCenterOpen(true);
        }}
        onOpenHowItWorks={() => setModalType('how_it_works')}
        onOpenFaq={() => setModalType('faq')}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'experiences' && (
          <ExperiencePortalScreen
            userProfile={userProfile}
            contacts={contacts}
            savedGroups={savedGroups}
            onOpenPrivacyCenter={() => setIsPrivacyCenterOpen(true)}
            onLoadDemoData={handleLoadDemoData}
            onResetToEmpty={handleResetToEmptyProfile}
            onNavigateToTripWizard={(initial) => handleStartPlanning(initial)}
            onExploreExistingTrips={() => setCurrentView('home')}
          />
        )}

        {currentView === 'welcome' && (
          <WelcomeScreen
            onStartPlanning={() => handleStartPlanning()}
            onExploreDemoTrips={handleExploreDemoTrips}
          />
        )}

        {currentView === 'home' && (
          <HomeScreen
            trips={trips}
            onCreateTrip={() => handleStartPlanning()}
            onSelectTrip={handleSelectTrip}
            onDeleteTrip={handleDeleteTrip}
            onResetDemoData={handleResetDemoData}
          />
        )}

        {currentView === 'create_trip' && (
          <CreateTripScreen
            onTripCreated={handleCreateNewTrip}
            onCancel={() => setCurrentView('home')}
            initialData={tripWizardInitialData}
          />
        )}

        {currentView === 'questionnaire' && activeTrip && (
          <QuestionnaireScreen
            trip={activeTrip}
            participantId={activeParticipantId || undefined}
            onComplete={handleQuestionnaireComplete}
            onExit={() => setCurrentView('home')}
          />
        )}

        {currentView === 'summary' && activeTrip && (
          <SummaryRecommendationsScreen
            trip={activeTrip}
            onBackToTrips={() => setCurrentView('home')}
            onAnswerForParticipant={handleAnswerForParticipant}
            onAddNewParticipant={handleAddNewParticipant}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 text-stone-500 text-xs text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium text-stone-700">
            <span>{t('brandName')}</span>
            <span aria-hidden="true">·</span>
            <span className="text-stone-500">
              {language === 'he'
                ? 'פלטפורמת חוויות אישית וקבוצתית מותאמת'
                : 'Personal & Group Leisure & Experiences Platform'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPrivacyCenterOpen(true)}
              className="hover:text-stone-900 transition-colors cursor-pointer text-emerald-800 font-semibold"
            >
              {language === 'he' ? 'מרכז פרטיות ואימות' : 'Privacy & Data'}
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setModalType('how_it_works')}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              {t('nav.howItWorks')}
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setModalType('faq')}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              {t('nav.faq')}
            </button>
            <span aria-hidden="true">·</span>
            <span>{language === 'he' ? 'עברית & English (RTL/LTR)' : 'Hebrew & English (RTL/LTR)'}</span>
          </div>
        </div>
      </footer>

      {/* Profile & Privacy Center Modal */}
      <ProfileAndPrivacyModal
        isOpen={isPrivacyCenterOpen}
        onClose={() => setIsPrivacyCenterOpen(false)}
        userProfile={userProfile}
        contacts={contacts}
        initialTab={accountModalTab}
        onUpdateProfile={setUserProfile}
        onUpdateContacts={setContacts}
        onLoadDemoData={handleLoadDemoData}
        onResetToEmpty={handleResetToEmptyProfile}
      />

      {/* Info Modals */}
      {modalType && (
        <InfoModal type={modalType} onClose={() => setModalType(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

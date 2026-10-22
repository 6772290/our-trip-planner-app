import React, { useState, useEffect } from 'react';
import { Trip, ParticipantAnswers, TripType } from './types/trip';
import { UserProfile, ContactPerson, SavedGroup } from './types/experience';
import { INITIAL_DEMO_TRIPS } from './data/demoTrips';
import { Header, NavViewType } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeScreen } from './components/HomeScreen';
import { CreateTripScreen } from './components/CreateTripScreen';
import { QuestionnaireScreen } from './components/QuestionnaireScreen';
import { SummaryRecommendationsScreen } from './components/SummaryRecommendationsScreen';
import { ExperiencePortalScreen } from './components/ExperiencePortalScreen';
import { ProfileAndPrivacyModal } from './components/ProfileAndPrivacyModal';
import { InfoModal } from './components/InfoModal';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

type AppView = 'experiences' | 'welcome' | 'home' | 'create_trip' | 'questionnaire' | 'summary';

const STORAGE_KEY = 'our_trip_applet_state_v1';
const PROFILE_STORAGE_KEY = 'our_trip_profile_v1';
const CONTACTS_STORAGE_KEY = 'our_trip_contacts_v1';

const INITIAL_PROFILE: UserProfile = {
  id: 'user_dan',
  fullName: 'דן כהן',
  permanentHomeLocation: 'תל אביב, ישראל',
  defaultActivityDepartureLocation: 'רמת החייל (משרד)',
  quietDefaultEnabled: true,
  allowPartnerPreferencesSync: true,
  preferences: [
    {
      id: 'pref_1',
      category: 'dietary',
      label: 'קולינריה איטלקית ופסטה טרייה',
      provenance: 'confirmed',
      scope: 'partner_only',
      notes: 'אושר על ידך — עדיפות למסעדות שף אותנטיות',
    },
    {
      id: 'pref_2',
      category: 'culture',
      label: 'מוזיקה חיה וקונצרטים קלאסיים (ואלסים, אנדרה ריו, תזמורות)',
      provenance: 'confirmed',
      scope: 'group',
      notes: 'אושר על ידך בהעדפות הפנאי',
    },
    {
      id: 'pref_3',
      category: 'dietary',
      label: 'בת הזוג נמנעת מגלוטן (הערכה ראשונית)',
      provenance: 'estimate',
      scope: 'partner_only',
      notes: 'הערכה שסיפקת לגבי שותפתך — דורש אימות ישיר מולה',
    },
    {
      id: 'pref_4',
      category: 'atmosphere',
      label: 'שמירה על לילה שקט לפני יום עבודה (חזרה עד 23:30)',
      provenance: 'inferred',
      scope: 'private',
      notes: 'הסקה של המערכת בהתאם ללוח הזמנים השבועי',
    },
  ],
};

const INITIAL_CONTACTS: ContactPerson[] = [
  {
    id: 'c_michal',
    name: 'מיכל כהן (בת זוג)',
    relationship: 'בת זוג',
    interestInActivitiesTogether: 'yes',
    privateNotes: 'שותפה מועדפת לכל הופעה, חופשה ואירוע קולינרי',
    permanentHome: 'תל אביב, ישראל',
    confirmedPreferences: ['מוזיקה קלאסית', 'סיורי אמנות'],
    estimatedPreferences: ['העדפת אוכל ללא גלוטן', 'מופעי חוצות תחת כיפת השמיים'],
  },
  {
    id: 'c_yoni',
    name: 'יוני לוי (חבר ילדות)',
    relationship: 'חבר קרוב',
    interestInActivitiesTogether: 'yes',
    privateNotes: 'מתאים לטיולי שטח, מסלולי טבע ואירועי ספורט',
    permanentHome: 'גבעתיים, ישראל',
    confirmedPreferences: ['טיולי שטח', 'כדורסל'],
    estimatedPreferences: ['בירות בוטיק', 'יציאות בסופי שבוע בלבד'],
  },
  {
    id: 'c_roei',
    name: 'רועי ברק (עמית לעבודה)',
    relationship: 'קולגה מהעבודה',
    interestInActivitiesTogether: 'maybe',
    privateNotes: 'מתאים למיטאפים מקצועיים ואירועי חברה בלבד',
    permanentHome: 'הרצליה, ישראל',
    confirmedPreferences: ['טכנולוגיה'],
    estimatedPreferences: ['פאבים שקטים'],
  },
];

const INITIAL_SAVED_GROUPS: SavedGroup[] = [
  {
    id: 'grp_couple',
    name: 'אנחנו (חופשה זוגית)',
    type: 'couple',
    memberContactIds: ['c_michal'],
    sharedInterests: ['קונצרטים', 'מסעדות שף', 'סופי שבוע רומנטיים באירופה'],
  },
  {
    id: 'grp_friends',
    name: 'החבר׳ה מהאוניברסיטה',
    type: 'friends',
    memberContactIds: ['c_yoni', 'c_roei'],
    sharedInterests: ['טיולי טבע', 'פאבים', 'הופעות חיות'],
  },
];

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

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_PROFILE;
  });

  const [contacts, setContacts] = useState<ContactPerson[]>(() => {
    try {
      const saved = localStorage.getItem(CONTACTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CONTACTS;
  });

  const [savedGroups, setSavedGroups] = useState<SavedGroup[]>(INITIAL_SAVED_GROUPS);

  const [currentView, setCurrentView] = useState<AppView>('experiences');
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'how_it_works' | 'faq' | null>(null);
  const [isPrivacyCenterOpen, setIsPrivacyCenterOpen] = useState(false);

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

    // If already has answers, show summary; else start questionnaire
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
        onOpenPrivacyCenter={() => setIsPrivacyCenterOpen(true)}
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
        onUpdateProfile={setUserProfile}
        onUpdateContacts={setContacts}
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

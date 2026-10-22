import React, { useState, useEffect } from 'react';
import { Trip, ParticipantAnswers } from './types/trip';
import { INITIAL_DEMO_TRIPS } from './data/demoTrips';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeScreen } from './components/HomeScreen';
import { CreateTripScreen } from './components/CreateTripScreen';
import { QuestionnaireScreen } from './components/QuestionnaireScreen';
import { SummaryRecommendationsScreen } from './components/SummaryRecommendationsScreen';
import { InfoModal } from './components/InfoModal';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

type AppView = 'welcome' | 'home' | 'create_trip' | 'questionnaire' | 'summary';

const STORAGE_KEY = 'our_trip_applet_state_v1';

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

  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'how_it_works' | 'faq' | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [trips]);

  // Ensure scroll position resets to top on every screen transition
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentView, activeTripId]);

  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0];

  const handleStartPlanning = () => {
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
      {/* Top Header with Language Switcher */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'create_trip') {
            handleStartPlanning();
          } else {
            setCurrentView(view);
          }
        }}
        onOpenHowItWorks={() => setModalType('how_it_works')}
        onOpenFaq={() => setModalType('faq')}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'welcome' && (
          <WelcomeScreen
            onStartPlanning={handleStartPlanning}
            onExploreDemoTrips={handleExploreDemoTrips}
          />
        )}

        {currentView === 'home' && (
          <HomeScreen
            trips={trips}
            onCreateTrip={handleStartPlanning}
            onSelectTrip={handleSelectTrip}
            onDeleteTrip={handleDeleteTrip}
            onResetDemoData={handleResetDemoData}
          />
        )}

        {currentView === 'create_trip' && (
          <CreateTripScreen
            onTripCreated={handleCreateNewTrip}
            onCancel={() => setCurrentView('home')}
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
              {language === 'he' ? 'פלטפורמה בינלאומית לתכנון טיולים' : 'Global Collaborative Trip Planning'}
            </span>
          </div>

          <div className="flex items-center gap-4">
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

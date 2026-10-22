import React, { useState, useEffect, useRef } from 'react';
import { Trip, ParticipantAnswers, BudgetLevel, TripPace, AccommodationStyle } from '../types/trip';
import { QUESTIONNAIRE_STEPS, QuestionDef, QuestionOption } from '../data/questionnaireData';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Mountain,
  Landmark,
  Utensils,
  Palmtree,
  Ticket,
  Music,
  Coffee,
  Compass,
  Zap,
  Wallet,
  Scale,
  Sparkles,
  Crown,
  Car,
  UsersRound,
  CloudRain,
  ShieldAlert,
  Plane,
  Heart,
  Building2,
  Home,
  Sun,
  Key,
  User,
} from 'lucide-react';

interface QuestionnaireScreenProps {
  trip: Trip;
  participantId?: string;
  onComplete: (answers: ParticipantAnswers) => void;
  onExit: () => void;
}

export const QuestionnaireScreen: React.FC<QuestionnaireScreenProps> = ({
  trip,
  participantId,
  onComplete,
  onExit,
}) => {
  const currentParticipant =
    trip.participants.find((p) => p.id === (participantId || trip.currentParticipantId)) ||
    trip.participants[0];

  const initialAnswers: ParticipantAnswers = currentParticipant?.answers || {
    interests: ['nature', 'food'],
    budget: 'medium',
    pace: 'balanced',
    dealBreakers: [],
    accommodationStyle: 'boutique',
    specialNotes: '',
  };

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<ParticipantAnswers>(initialAnswers);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);

  // Scroll to top of the step/screen when the question changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      return;
    }

    // When advancing or going back to another step, scroll smoothly to the top of the questionnaire
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [currentStepIndex]);

  const currentQuestion: QuestionDef = QUESTIONNAIRE_STEPS[currentStepIndex];
  const totalSteps = QUESTIONNAIRE_STEPS.length;
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  const getOptionIcon = (iconName?: string) => {
    switch (iconName) {
      case 'mountain':
        return Mountain;
      case 'landmark':
        return Landmark;
      case 'utensils':
        return Utensils;
      case 'palmtree':
        return Palmtree;
      case 'ticket':
        return Ticket;
      case 'music':
        return Music;
      case 'coffee':
        return Coffee;
      case 'compass':
        return Compass;
      case 'zap':
        return Zap;
      case 'wallet':
        return Wallet;
      case 'scale':
        return Scale;
      case 'sparkles':
        return Sparkles;
      case 'crown':
        return Crown;
      case 'car-off':
        return Car;
      case 'users-round':
        return UsersRound;
      case 'cloud-rain':
        return CloudRain;
      case 'shield-alert':
        return ShieldAlert;
      case 'plane':
        return Plane;
      case 'heart':
        return Heart;
      case 'building-2':
        return Building2;
      case 'home':
        return Home;
      case 'sun':
        return Sun;
      case 'key':
        return Key;
      default:
        return Compass;
    }
  };

  const handleToggleMulti = (field: 'interests' | 'dealBreakers', optionId: string) => {
    const list = answers[field];
    if (list.includes(optionId)) {
      setAnswers({ ...answers, [field]: list.filter((id) => id !== optionId) });
    } else {
      setAnswers({ ...answers, [field]: [...list, optionId] });
    }
  };

  const handleSelectSingle = (
    field: 'budget' | 'pace' | 'accommodationStyle',
    optionId: string
  ) => {
    setAnswers({ ...answers, [field]: optionId as any });
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      onExit();
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header with Participant Info & Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onExit}
            className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
          >
            חזרה לפרטי הטיול
          </button>

          <div className="flex items-center gap-2 text-xs font-medium text-stone-700 bg-stone-100 px-3 py-1.5 rounded-full">
            <User className="w-3.5 h-3.5 text-amber-800" />
            <span>מענה עבור: <strong className="text-stone-900">{currentParticipant?.name || 'משתתף'}</strong></span>
          </div>
        </div>

        {/* Progress Bar & Indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>שאלה {currentStepIndex + 1} מתוך {totalSteps}</span>
            <span>{progressPercent}% הושלמו</span>
          </div>
          <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-800 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Question Card - Displays Exactly One Question at a Time */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-amber-800">
            שלב {currentQuestion.stepNumber}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-snug">
            {currentQuestion.title}
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {currentQuestion.subtitle}
          </p>
        </div>

        {/* Question Content Area */}
        <div className="pt-2">
          {/* Multi-choice questions */}
          {currentQuestion.type === 'multi' && currentQuestion.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt) => {
                const isSelected =
                  currentQuestion.id === 'interests'
                    ? answers.interests.includes(opt.id)
                    : answers.dealBreakers.includes(opt.id);

                const IconComponent = getOptionIcon(opt.icon);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      handleToggleMulti(
                        currentQuestion.id as 'interests' | 'dealBreakers',
                        opt.id
                      )
                    }
                    className={`p-4 rounded-xl border text-right transition-all flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'border-amber-800 bg-amber-50/60 ring-1 ring-amber-800 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                        isSelected
                          ? 'bg-amber-800 border-amber-800 text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[2.5]" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <IconComponent
                          className={`w-4 h-4 ${
                            isSelected ? 'text-amber-800' : 'text-stone-400'
                          }`}
                        />
                        <span
                          className={`text-sm font-bold ${
                            isSelected ? 'text-amber-950' : 'text-stone-900'
                          }`}
                        >
                          {opt.label}
                        </span>
                      </div>
                      {opt.description && (
                        <p className="text-xs text-stone-500 leading-relaxed">
                          {opt.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Single-choice questions */}
          {currentQuestion.type === 'single' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => {
                let isSelected = false;
                if (currentQuestion.id === 'budget') isSelected = answers.budget === opt.id;
                if (currentQuestion.id === 'pace') isSelected = answers.pace === opt.id;
                if (currentQuestion.id === 'accommodationStyle')
                  isSelected = answers.accommodationStyle === opt.id;

                const IconComponent = getOptionIcon(opt.icon);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      handleSelectSingle(
                        currentQuestion.id as 'budget' | 'pace' | 'accommodationStyle',
                        opt.id
                      )
                    }
                    className={`w-full p-4 rounded-xl border text-right transition-all flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'border-amber-800 bg-amber-50/60 ring-1 ring-amber-800 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/50'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                        isSelected
                          ? 'border-amber-800 bg-amber-800'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <IconComponent
                          className={`w-4 h-4 ${
                            isSelected ? 'text-amber-800' : 'text-stone-400'
                          }`}
                        />
                        <span
                          className={`text-sm font-bold ${
                            isSelected ? 'text-amber-950' : 'text-stone-900'
                          }`}
                        >
                          {opt.label}
                        </span>
                      </div>
                      {opt.description && (
                        <p className="text-xs text-stone-500 leading-relaxed">
                          {opt.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Text input question (notes, free wishes) */}
          {currentQuestion.type === 'text' && (
            <div className="space-y-3">
              <textarea
                rows={5}
                value={answers.specialNotes || ''}
                onChange={(e) => setAnswers({ ...answers, specialNotes: e.target.value })}
                placeholder={currentQuestion.placeholder}
                className="w-full p-4 rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 text-sm leading-relaxed"
              />
              <p className="text-xs text-stone-500">
                טיפ: תוכלו לכתוב כל דבר שחשוב לכם, כגון עגלת תינוק, צורך בנגישות, או חלום לראות שקיעה מיוחדת.
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons: Back, Skip (if optional), Next / Finish */}
        <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>{currentStepIndex === 0 ? 'ביטול' : 'חזור לשאלה הקודמת'}</span>
          </button>

          <div className="flex items-center gap-3">
            {currentQuestion.isOptional && (
              <button
                type="button"
                onClick={handleSkip}
                className="px-4 py-2.5 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
              >
                דלג על שאלה זו
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span>{currentStepIndex === totalSteps - 1 ? 'סיום וחישוב המלצות' : 'השאלה הבאה'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Trip, ParticipantAnswers, TripRecommendation, ClarifyingQuestion } from '../types/trip';
import {
  analyzeGroupAnswers,
  generateRecommendations,
  generateClarifyingQuestions,
} from '../utils/matchingEngine';
import { formatWithCalendarDual } from '../utils/calendarUtils';
import { TravelVisualCard } from './TravelVisualCard';
import {
  Users,
  Compass,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  HelpCircle,
  Share2,
  RotateCcw,
  PlusCircle,
  AlertCircle,
  MapPin,
  Calendar,
  Layers,
  Heart,
  ChevronDown,
  ChevronUp,
  Target,
  ShieldAlert,
} from 'lucide-react';

interface SummaryRecommendationsScreenProps {
  trip: Trip;
  onBackToTrips: () => void;
  onAnswerForParticipant: (participantId: string) => void;
  onAddNewParticipant: (name: string) => void;
}

export const SummaryRecommendationsScreen: React.FC<SummaryRecommendationsScreenProps> = ({
  trip,
  onBackToTrips,
  onAnswerForParticipant,
  onAddNewParticipant,
}) => {
  const answeredParticipants = trip.participants.filter((p) => p.isAnswered && p.answers);
  const unansweredParticipants = trip.participants.filter((p) => !p.isAnswered);

  // If no answers yet, fallback to empty array
  const answersList: ParticipantAnswers[] = answeredParticipants.map((p) => p.answers!);

  // Matching engine data
  const groupInsights = analyzeGroupAnswers(answersList, trip.tripType);
  const initialRecommendations = generateRecommendations(
    answersList,
    trip.tripType,
    trip.planningMethod,
    trip.destination
  );
  const initialClarifyingQuestions = generateClarifyingQuestions(answersList, trip.tripType);

  const [recommendations, setRecommendations] = useState<TripRecommendation[]>(initialRecommendations);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<ClarifyingQuestion[]>(
    trip.activeFollowUps || initialClarifyingQuestions
  );
  const [selectedClarifications, setSelectedClarifications] = useState<Record<string, number>>({});
  const [shareCopied, setShareCopied] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [showAddParticipantInput, setShowAddParticipantInput] = useState(false);
  const [expandedRecId, setExpandedRecId] = useState<string | null>(recommendations[0]?.id || null);

  const handleSelectClarification = (qId: string, optionIndex: number) => {
    setSelectedClarifications((prev) => ({
      ...prev,
      [qId]: optionIndex,
    }));
  };

  const handleSimulateShare = () => {
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  };

  const handleAddParticipantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantName.trim()) return;
    onAddNewParticipant(newParticipantName.trim());
    setNewParticipantName('');
    setShowAddParticipantInput(false);
  };

  const getInterestBadge = (id: string) => {
    const map: Record<string, string> = {
      nature: 'טבע ונופים',
      culture: 'ערים ותרבות',
      food: 'קולינריה ושווקים',
      beach_relax: 'חופים ומנוחה',
      attractions: 'אטרקציות ופארקים',
      nightlife: 'חיי לילה ומוזיקה',
    };
    return map[id] || id;
  };

  const getDealBreakerBadge = (id: string) => {
    const map: Record<string, string> = {
      long_drives: 'נסיעות ארוכות',
      crowds: 'צפיפות ותורים',
      cold_weather: 'קור וגשם',
      heavy_effort: 'מאמץ פיזי כבד',
      layovers: 'טיסות קונקשן',
      kosher_diet: 'כשרות / תזונה מיוחדת',
    };
    return map[id] || id;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-right">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <button
          onClick={onBackToTrips}
          className="flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>חזרה לרשימת הטיולים</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateShare}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:border-stone-300 rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{shareCopied ? 'הקישור הועתק!' : 'שיתוף שאלון עם שותפים'}</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
          <span>{trip.title}</span>
          <span aria-hidden="true">·</span>
          <span>
            {trip.tripType === 'couple'
              ? 'טיול זוגי'
              : trip.tripType === 'family'
              ? 'טיול משפחתי'
              : trip.tripType === 'friends'
              ? 'טיול חברים'
              : 'טיול'}
          </span>
          {trip.destination && (
            <>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400" />
                {trip.destination}
              </span>
            </>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          סיכום העדפות והצעות לטיול
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-3xl leading-relaxed">
          ניתוח התשובות שנאספו עד כה, זיהוי נקודות ההסכמה והאיזון בין המשתתפים, ושלוש חלופות מסלול מותאמות אישית.
        </p>

        {/* Disclaimer about prototype rules */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <span>
            <strong>הערת אב־טיפוס:</strong> ההמלצות והתובנות להלן מחושבות באמצעות כללי התאמה לוגיים על בסיס התשובות שהזנתם. הן נועדו להמחיש את חוויית המשתמש לפני חיבור למנוע AI חיצוני.
          </span>
        </div>
      </div>

      {/* Section 1: Participants & Answer Status */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-800" />
            <h2 className="text-lg font-bold text-stone-900">משתתפי הטיול ומצב המענה</h2>
          </div>
          <span className="text-xs text-stone-500">
            {answeredParticipants.length} מתוך {trip.participants.length} השלימו את השאלון
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {trip.participants.map((p) => (
            <div
              key={p.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                p.isAnswered ? 'border-emerald-200 bg-emerald-50/30' : 'border-stone-200 bg-stone-50/50'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-900">{p.name}</span>
                  {p.isAnswered ? (
                    <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ענה/תה
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-amber-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      טרם ענה/תה
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs text-stone-500 block">{p.role}</span>
                  {(p.departureCity || p.originAirport) && (
                    <span className="text-[11px] text-stone-600 block">
                      📍 {p.departureCity || ''} {p.originAirport ? `(${p.originAirport})` : ''} · {p.timezone || 'Asia/Jerusalem'}
                    </span>
                  )}
                  {p.preferredLanguage && (
                    <span className="text-[10px] text-amber-800 block">
                      🌐 שפת ממשק: {p.preferredLanguage === 'he' ? 'עברית' : 'English'}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <button
                  onClick={() => onAnswerForParticipant(p.id)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    p.isAnswered
                      ? 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                      : 'bg-amber-800 text-white hover:bg-amber-900'
                  }`}
                >
                  {p.isAnswered ? 'עריכת תשובות' : 'מענה על השאלון עכשיו'}
                </button>
              </div>
            </div>
          ))}

          {/* Add participant card */}
          {showAddParticipantInput ? (
            <form
              onSubmit={handleAddParticipantSubmit}
              className="p-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-900 block">שם המשתתף החדש</label>
                <input
                  type="text"
                  autoFocus
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  placeholder="למשל: תמר, אבא, שיר..."
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-800"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-1 px-2 text-xs font-semibold bg-amber-800 text-white rounded hover:bg-amber-900 cursor-pointer"
                >
                  הוספה
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddParticipantInput(false)}
                  className="py-1 px-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  ביטול
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddParticipantInput(true)}
              className="p-4 rounded-xl border border-dashed border-stone-300 hover:border-amber-700 bg-white hover:bg-amber-50/30 text-stone-600 hover:text-amber-900 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[105px]"
            >
              <PlusCircle className="w-5 h-5 text-amber-800" />
              <span className="text-xs font-semibold">הוספת משתתף נוסף לטיול</span>
            </button>
          )}
        </div>
      </section>

      {/* Advanced Planning Specifications & Multi-Calendar Alternatives */}
      {(trip.dateAlternatives || trip.rankedGoals || trip.events) && (
        <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-800" />
              <h2 className="text-lg font-bold text-stone-900">
                מפרט תכנון חכם, חלופות מועדים וסדרי עדיפויות
              </h2>
            </div>
            <span className="text-xs text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-semibold">
              הבנת המערכת מאושרת
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Alternatives with Dual-Calendar */}
            {trip.dateAlternatives && trip.dateAlternatives.length > 0 && (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-800" />
                  <span>חלופות מועדים שנשמרו (גרגוריאני ועברי במקביל):</span>
                </span>
                <div className="space-y-1.5 pt-1">
                  {trip.dateAlternatives.map((alt) => (
                    <div
                      key={alt.id}
                      className="p-2.5 rounded bg-white border border-stone-200 space-y-0.5"
                    >
                      <strong className="block text-stone-900 font-bold">{alt.title}</strong>
                      <span className="text-[11px] text-stone-600 block">
                        {formatWithCalendarDual(alt.startDate, trip.calendarSystem || 'gregorian', true)} עד{' '}
                        {formatWithCalendarDual(alt.endDate, trip.calendarSystem || 'gregorian', true)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Goals & Priorities */}
            {trip.rankedGoals && trip.rankedGoals.some((g) => g.selected) && (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-800" />
                  <span>מטרות הנסיעה בסדר עדיפויות:</span>
                </span>
                <div className="space-y-1.5 pt-1">
                  {trip.rankedGoals
                    .filter((g) => g.selected)
                    .sort((a, b) => a.priority - b.priority)
                    .map((g, idx) => (
                      <div
                        key={g.id}
                        className="p-2 rounded bg-white border border-stone-200 flex items-center justify-between text-[11px]"
                      >
                        <span className="font-medium text-stone-800">{g.label}</span>
                        <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          עדיפות #{idx + 1}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Mandatory Constraints */}
            {trip.classifiedConstraints && trip.classifiedConstraints.length > 0 && (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 md:col-span-2">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>אילוצים והתחייבויות (מחייב מול העדפה):</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                  {trip.classifiedConstraints.map((c) => (
                    <div
                      key={c.id}
                      className="p-2 rounded bg-white border border-stone-200 text-[11px] flex items-center justify-between"
                    >
                      <span className="font-medium text-stone-800">{c.title}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          c.level === 'mandatory'
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {c.level === 'mandatory' ? 'מחייב' : 'העדפה'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Section 2: Group Harmony & Insights */}
      {groupInsights.length > 0 && (
        <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Compass className="w-5 h-5 text-amber-800" />
            <h2 className="text-lg font-bold text-stone-900">ניתוח התאמה והבנת הרצונות</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {groupInsights.map((insight, idx) => {
              const isHarmony = insight.type === 'harmony';
              const isBalance = insight.type === 'balance';
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col space-y-2 ${
                    isHarmony
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : isBalance
                      ? 'border-amber-200 bg-amber-50/40'
                      : 'border-sky-200 bg-sky-50/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isHarmony ? 'bg-emerald-600' : isBalance ? 'bg-amber-600' : 'bg-sky-600'
                      }`}
                    />
                    <h3 className="text-sm font-bold text-stone-900">{insight.title}</h3>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">{insight.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 3: The 3 Personalized Trip Recommendations */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-semibold text-amber-800">התוצאה שלכם</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            3 הצעות מותאמות לפרופיל שלכם
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            כל הצעה נבחרה בקפידה כדי לענות על תחומי העניין, התקציב, והקצב המועדף עליכם.
          </p>
        </div>

        <div className="space-y-5">
          {recommendations.map((rec, index) => {
            const isExpanded = expandedRecId === rec.id;
            const visualTheme =
              index === 0 ? 'nature' : index === 1 ? 'culinary' : 'coast';

            return (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden transition-all hover:border-stone-300"
              >
                {/* Visual Header */}
                <div className="h-32 relative">
                  <TravelVisualCard theme={visualTheme} title={rec.title} />
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-sm text-stone-100 text-xs px-2.5 py-1 rounded-md border border-white/10 font-semibold">
                    התאמה של {rec.matchScore}%
                  </div>
                </div>

                {/* Card Main Info */}
                <div className="p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                        <span>הצעה #{index + 1}</span>
                        <span aria-hidden="true">·</span>
                        <span>{rec.category}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
                        {rec.title}
                      </h3>
                      <p className="text-sm text-stone-600 font-medium">
                        {rec.subtitle}
                      </p>
                    </div>

                    <button
                      onClick={() => setExpandedRecId(isExpanded ? null : rec.id)}
                      className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? 'צמצום פרטים' : 'פירוט מלא של המסלול'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Unboxed Metadata row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1 border-t border-stone-100">
                    <span>
                      משך מומלץ: <strong className="text-stone-800">{rec.suggestedDuration}</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      קצב: <strong className="text-stone-800">{rec.paceLabel}</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      סגנון תקציב: <strong className="text-stone-800">{rec.estimatedBudgetLabel}</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      הכי מתאים ל: <strong className="text-stone-800">{rec.bestFor}</strong>
                    </span>
                  </div>

                  {/* Why it fits bullets */}
                  <div className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/70 space-y-2">
                    <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                      <span>מדוע הצעה זו מתאימה בדיוק לתשובות שלכם?</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-600 pr-1">
                      {rec.whyItFits.map((reason, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Expanded highlights details */}
                  {isExpanded && (
                    <div className="space-y-3 pt-3 border-t border-stone-100">
                      <h4 className="text-xs font-bold text-stone-900">
                        חוויות מפתח בולטות במסלול זה:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {rec.highlights.map((item, hIdx) => (
                          <div
                            key={hIdx}
                            className="p-3 rounded-lg bg-white border border-stone-200 text-xs text-stone-800 flex items-center gap-2.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-800 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: Interactive Clarifying Questions (שאלות המשך לחידוד) */}
      <section className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <HelpCircle className="w-4 h-4" />
            <span>שלב החידוד והדיוק</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            שאלות המשך לחידוד ההחלטה
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
            כשמתלבטים בין כיוונים שונים, מענה על שאלות הדיוק הללו עוזר להכריע ולבחור את המסלול המנצח. נסו לבחור תשובה וראו כיצד היא משפיעה על התכנון:
          </p>
        </div>

        <div className="space-y-5">
          {clarifyingQuestions.map((q) => {
            const selectedIdx = selectedClarifications[q.id];

            return (
              <div
                key={q.id}
                className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">{q.question}</h3>
                  <p className="text-xs text-stone-400">{q.explanation}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedIdx === optIdx;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectClarification(q.id, optIdx)}
                        className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400 text-white'
                            : 'bg-white/5 border-white/10 hover:border-white/20 text-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-amber-200' : 'text-stone-200'}`}>
                            {opt.label}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-amber-400 bg-amber-400' : 'border-stone-500'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-stone-900" />}
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-snug">
                          {opt.impactDescription}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {selectedIdx !== undefined && (
                  <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      בחירה נשמרה: {q.options[selectedIdx].label} — נלקח בחשבון בתכנון הימים!
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Actions */}
      <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onBackToTrips}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>חזרה לכל הטיולים</span>
        </button>

        <div className="w-full sm:w-auto flex items-center gap-3">
          <button
            onClick={() => {
              if (trip.participants[0]) {
                onAnswerForParticipant(trip.participants[0].id);
              }
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-amber-800 rounded-xl hover:bg-amber-900 transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>עדכון או מענה מחדש</span>
          </button>
        </div>
      </div>
    </div>
  );
};

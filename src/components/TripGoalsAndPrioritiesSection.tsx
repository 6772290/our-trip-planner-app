import React from 'react';
import {
  RankedGoal,
  TripGoalType,
  ClassifiedConstraint,
  ConstraintLevel,
} from '../types/trip';
import {
  Target,
  ShieldCheck,
  Heart,
  Sliders,
  ChevronUp,
  ChevronDown,
  Info,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';

interface TripGoalsAndPrioritiesSectionProps {
  goals: RankedGoal[];
  onGoalsChange: (goals: RankedGoal[]) => void;
  classifiedConstraints: ClassifiedConstraint[];
}

export const TripGoalsAndPrioritiesSection: React.FC<
  TripGoalsAndPrioritiesSectionProps
> = ({ goals, onGoalsChange, classifiedConstraints }) => {
  const toggleGoalSelected = (id: TripGoalType) => {
    onGoalsChange(
      goals.map((g) => (g.id === id ? { ...g, selected: !g.selected } : g))
    );
  };

  const movePriority = (id: TripGoalType, direction: 'up' | 'down') => {
    const selectedGoals = goals.filter((g) => g.selected).sort((a, b) => a.priority - b.priority);
    const idx = selectedGoals.findIndex((g) => g.id === id);
    if (idx === -1) return;

    if (direction === 'up' && idx > 0) {
      const prev = selectedGoals[idx - 1];
      const tempP = prev.priority;
      prev.priority = selectedGoals[idx].priority;
      selectedGoals[idx].priority = tempP;
    } else if (direction === 'down' && idx < selectedGoals.length - 1) {
      const next = selectedGoals[idx + 1];
      const tempP = next.priority;
      next.priority = selectedGoals[idx].priority;
      selectedGoals[idx].priority = tempP;
    }

    onGoalsChange([...goals]);
  };

  const mandatoryCount = classifiedConstraints.filter((c) => c.level === 'mandatory').length;
  const preferenceCount = classifiedConstraints.filter((c) => c.level === 'preference').length;
  const optimizationCount = classifiedConstraints.filter(
    (c) => c.level === 'optimization_target'
  ).length;

  return (
    <div className="space-y-8">
      {/* 1. Trip Goals Definition & Ranking */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-4">
        <div className="space-y-1 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-800" />
            <h3 className="text-sm font-bold text-stone-900">
              הבנת מטרת הנסיעה וסדר עדיפויות
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            מה אתם מנסים להשיג בנסיעה זו? סמנו את המטרות שלכם ודרגו מה הכי חשוב לכם.
          </p>
        </div>

        <div className="space-y-2.5">
          {goals.map((g) => {
            const isSelected = g.selected;

            return (
              <div
                key={g.id}
                className={`p-3.5 rounded-xl border text-right transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleGoalSelected(g.id)}
                    className="mt-1 rounded text-amber-800"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-stone-900 block">
                      {g.label}
                    </span>
                    <span className="text-[11px] text-stone-500 block leading-relaxed">
                      {g.description}
                    </span>
                  </div>
                </label>

                {isSelected && (
                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      עדיפות #{g.priority}
                    </span>
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => movePriority(g.id, 'up')}
                        className="text-stone-400 hover:text-stone-900 p-0.5"
                        title="העלאת עדיפות"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePriority(g.id, 'down')}
                        className="text-stone-400 hover:text-stone-900 p-0.5"
                        title="הורדת עדיפות"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Mandatory Constraints vs Preferences vs Optimization Targets */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-4">
        <div className="space-y-1 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-800" />
            <h3 className="text-sm font-bold text-stone-900">
              חלוקת המידע: מחייב, העדפה ומטרת אופטימיזציה
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            המערכת מבדילה באופן מוחלט בין מה שאסור להפר בשום מקרה, לבין מה שרצוי ואפשר להתפשר עליו.
          </p>
        </div>

        {/* 3 Summary Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-950 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                <span>1. אילוצים מחייבים</span>
              </span>
              <span className="font-extrabold text-rose-900 bg-rose-100 px-1.5 py-0.5 rounded text-[11px]">
                {mandatoryCount} מוגדרים
              </span>
            </div>
            <p className="text-[11px] text-rose-800">
              תנאי סף שאסור להפר (חלופה שמפרה אותם תיפסל ולא תוצג כמתאימה).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-amber-700" />
                <span>2. העדפות</span>
              </span>
              <span className="font-extrabold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded text-[11px]">
                {preferenceCount} מוגדרות
              </span>
            </div>
            <p className="text-[11px] text-amber-800">
              רצוי לקיים אך ניתן להתפשר עליהן במידת הצורך למען תועלת גדולה יותר.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                <span>3. מטרות אופטימיזציה</span>
              </span>
              <span className="font-extrabold text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded text-[11px]">
                {optimizationCount} מוגדרות
              </span>
            </div>
            <p className="text-[11px] text-emerald-800">
              מדדים שהמערכת תנסה למקסם (זמן שהות) או למזער (מחיר או היעדרות מעבודה).
            </p>
          </div>
        </div>

        {/* List of active constraints mapped */}
        <div className="space-y-2 pt-2">
          {classifiedConstraints.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-stone-900 block">{c.title}</span>
                <span className="text-[11px] text-stone-500 block">{c.explanation}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                  c.level === 'mandatory'
                    ? 'bg-rose-100 text-rose-900'
                    : c.level === 'preference'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-900'
                }`}
              >
                {c.level === 'mandatory'
                  ? 'מחייב'
                  : c.level === 'preference'
                  ? 'העדפה'
                  : 'אופטימיזציה'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

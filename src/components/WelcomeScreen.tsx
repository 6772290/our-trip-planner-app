import React from 'react';
import { ArrowLeft, Users, Sparkles, SlidersHorizontal, CheckCircle2, MapPin, Compass } from 'lucide-react';

interface WelcomeScreenProps {
  onStartPlanning: () => void;
  onExploreDemoTrips: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartPlanning,
  onExploreDemoTrips,
}) => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-900 text-stone-100 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle background SVG mountains */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg viewBox="0 0 1440 450" preserveAspectRatio="none" className="w-full h-full fill-amber-100">
            <path d="M0,450 L180,260 L360,340 L540,190 L720,290 L900,160 L1080,280 L1260,200 L1440,310 L1440,450 Z" opacity="0.4" />
            <path d="M0,450 L120,320 L280,360 L480,240 L640,320 L820,210 L1000,310 L1200,240 L1440,350 L1440,450 Z" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute top-10 left-10 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-amber-200 bg-white/10 rounded-full backdrop-blur-sm border border-white/10">
            <Compass className="w-3.5 h-3.5" />
            <span>הדרך החכמה להבין מה באמת מתאים לכם</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            הטיול שלנו
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-stone-300 font-normal leading-relaxed">
            במקום להתחיל מחיפוש יעד או מלון — מתחילים בכם.
            <br className="hidden sm:inline" />
            שאלון אישי קצר שלומד את סגנון הטיול, התקציב, הקצב והחלומות, ומייצר התאמה מושלמת ליחידים, זוגות, משפחות וחברים.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartPlanning}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 text-base font-semibold text-stone-900 bg-amber-400 rounded-xl hover:bg-amber-300 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>בואו נתכנן טיול</span>
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={onExploreDemoTrips}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium text-stone-200 bg-white/10 rounded-xl hover:bg-white/15 transition-all border border-white/10 active:scale-95 cursor-pointer"
            >
              <span>צפייה בטיולים לדוגמה</span>
            </button>
          </div>

          {/* Micro metadata line without pill borders */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-400">
            <span>תמיכה בטיולים זוגיים, משפחתיים וחברים</span>
            <span aria-hidden="true">·</span>
            <span>מתאים לבעלי יעד סגור או לחיפוש רעיונות</span>
            <span aria-hidden="true">·</span>
            <span>תאריכים גמישים או קבועים</span>
          </div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">איך זה עובד?</h2>
          <p className="mt-2 text-stone-600">שלושה שלבים פשוטים מהשאלון ועד להמלצה המדויקת</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">1. מענה על שאלון קצר</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              כל משתתף עונה על שאלות ממוקדות: תחומי עניין (טבע, קולינריה, תרבות), קצב מועדף, תקציב וקווים אדומים מהם חשוב להימנע.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">2. זיהוי התאמות ופערים</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              המערכת מנתחת היכן יש הסכמה מלאה (למשל על אהבה לאוכל מקומי) ואיפה נדרש איזון עדין (למשל בקצב ההשכמה בבוקר).
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">3. המלצות ושאלות חידוד</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              קבלת 3 הצעות מותאמות אישית עם נימוקים ברורים לכל יעד, ושאלות המשך שמחדדות את התמונה לקראת יציאה לדרך.
            </p>
          </div>
        </div>

        {/* Banner Action */}
        <div className="mt-14 p-8 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-right">
            <h4 className="text-lg font-bold text-amber-950">מוכנים לגלות את הטיול הבא שלכם?</h4>
            <p className="text-sm text-amber-800">השאלון לוקח פחות מ-2 דקות, ואינו דורש התחייבות או כרטיס אשראי.</p>
          </div>
          <button
            onClick={onStartPlanning}
            className="px-6 py-3 text-sm font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors shadow-sm active:scale-95 shrink-0 cursor-pointer"
          >
            התחילו עכשיו
          </button>
        </div>
      </section>
    </div>
  );
};

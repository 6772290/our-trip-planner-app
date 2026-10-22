import React from 'react';
import { Trip, TripType } from '../types/trip';
import { Plus, Users, Calendar, MapPin, ArrowLeft, CheckCircle2, Clock, Trash2, RotateCcw } from 'lucide-react';
import { TravelVisualCard } from './TravelVisualCard';

interface HomeScreenProps {
  trips: Trip[];
  onCreateTrip: () => void;
  onSelectTrip: (trip: Trip) => void;
  onDeleteTrip?: (tripId: string) => void;
  onResetDemoData?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  trips,
  onCreateTrip,
  onSelectTrip,
  onDeleteTrip,
  onResetDemoData,
}) => {
  const getTripTypeLabel = (type: TripType): string => {
    switch (type) {
      case 'couple':
        return 'חופשה זוגית';
      case 'family':
        return 'טיול משפחתי';
      case 'friends':
        return 'טיול עם חברים';
      case 'solo':
        return 'טיול יחיד';
      case 'group':
        return 'קבוצה';
      case 'work':
        return 'נסיעת עבודה ופנאי';
      default:
        return 'טיול';
    }
  };

  const getStatusBadge = (status: Trip['status']) => {
    switch (status) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            מוכן לצפייה בהמלצות
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            ממתין לתשובות משתתפים
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
            טיוטה ראשונית
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">הטיולים שלי</h1>
          <p className="mt-1 text-sm text-stone-600">
            צפייה בטיולים קיימים, מעקב אחר תשובות השאלון ויצירת תוכניות חדשות
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onResetDemoData && (
            <button
              onClick={onResetDemoData}
              title="איפוס והחזרת טיולי ההדגמה"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>איפוס נתוני הדגמה</span>
            </button>
          )}

          <button
            onClick={onCreateTrip}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-amber-800 rounded-xl hover:bg-amber-900 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>יצירת טיול חדש</span>
          </button>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => {
          const answeredCount = trip.participants.filter((p) => p.isAnswered).length;
          const totalCount = trip.participants.length;

          // determine card theme for visual top
          const visualTheme =
            trip.tripType === 'family' ? 'family' : trip.tripType === 'couple' ? 'culinary' : 'nature';

          return (
            <div
              key={trip.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden text-right group"
            >
              {/* Card visual banner */}
              <div className="relative h-28">
                <TravelVisualCard theme={visualTheme} />
                {trip.isDemo && (
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-sm text-stone-200 text-[11px] font-medium px-2 py-0.5 rounded border border-white/10">
                    נתוני הדגמה
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-amber-800">
                      {getTripTypeLabel(trip.tripType)}
                    </span>
                    {getStatusBadge(trip.status)}
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                    {trip.title}
                  </h3>

                  {/* Clean unboxed metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 pt-1">
                    {trip.destination ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        {trip.destination}
                      </span>
                    ) : (
                      <span>יעד פתוח לגילוי</span>
                    )}

                    <span aria-hidden="true">·</span>

                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      {answeredCount} מתוך {totalCount} ענו
                    </span>
                  </div>

                  {trip.dateNotes && (
                    <p className="text-xs text-stone-500 flex items-center gap-1 pt-0.5">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span className="truncate">{trip.dateNotes}</span>
                    </p>
                  )}
                </div>

                {/* Footer action button */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectTrip(trip)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-amber-800 hover:text-amber-900 group-hover:underline cursor-pointer"
                  >
                    <span>
                      {trip.status === 'ready'
                        ? 'צפייה בסיכום והמלצות'
                        : trip.status === 'in_progress'
                        ? 'המשך מענה על שאלון'
                        : 'פתיחת הטיול'}
                    </span>
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  </button>

                  {!trip.isDemo && onDeleteTrip && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTrip(trip.id);
                      }}
                      title="מחיקת טיול"
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Helper guide box for prototype */}
      <div className="p-5 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="font-bold text-stone-900">טיפ למפתחים ובודקים:</span>
          <p className="text-xs text-stone-600">
            ניתן ללחוץ על כל אחד מטיולי ההדגמה כדי לראות כיצד המערכת משקללת תשובות ומציגה המלצות, או ליצור טיול חדש לחלוטין ולענות על השאלון שלב אחר שלב.
          </p>
        </div>
      </div>
    </div>
  );
};

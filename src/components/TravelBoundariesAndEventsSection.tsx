import React, { useState } from 'react';
import {
  TravelBoundaries,
  TripEvent,
  EventCategory,
  ShabbatHolidayConstraints,
  UniversalConstraint,
  UniversalConstraintType,
  Participant,
} from '../types/trip';
import { COMMON_TIMEZONES } from '../utils/timezoneUtils';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Clock,
  MapPin,
  Calendar,
  Plus,
  Trash2,
  Plane,
  Home,
  Briefcase,
  Sparkles,
  ShieldAlert,
  Info,
  User,
  Users,
  Compass,
  Check,
} from 'lucide-react';

interface TravelBoundariesAndEventsSectionProps {
  boundaries: TravelBoundaries;
  onBoundariesChange: (boundaries: TravelBoundaries) => void;

  events: TripEvent[];
  onEventsChange: (events: TripEvent[]) => void;

  shabbatConstraints: ShabbatHolidayConstraints;
  onShabbatConstraintsChange: (constraints: ShabbatHolidayConstraints) => void;

  participants?: Participant[];
  universalConstraints?: UniversalConstraint[];
  onUniversalConstraintsChange?: (constraints: UniversalConstraint[]) => void;
}

export const TravelBoundariesAndEventsSection: React.FC<
  TravelBoundariesAndEventsSectionProps
> = ({
  boundaries,
  onBoundariesChange,
  events,
  onEventsChange,
  shabbatConstraints,
  onShabbatConstraintsChange,
  participants = [],
  universalConstraints = [],
  onUniversalConstraintsChange,
}) => {
  const { language, t } = useLanguage();

  const [showAddConstraintForm, setShowAddConstraintForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOwner, setNewOwner] = useState<string>('trip');
  const [newType, setNewType] = useState<UniversalConstraintType>('work_meeting');
  const [newIsMandatory, setNewIsMandatory] = useState(true);
  const [newEarliestDate, setNewEarliestDate] = useState('');
  const [newEarliestTime, setNewEarliestTime] = useState('');
  const [newLatestDate, setNewLatestDate] = useState('');
  const [newLatestTime, setNewLatestTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newTimezone, setNewTimezone] = useState('Asia/Jerusalem');
  const [newBufferBefore, setNewBufferBefore] = useState<number>(2);
  const [newBufferAfter, setNewBufferAfter] = useState<number>(0);
  const [newNotes, setNewNotes] = useState('');

  const constraintTypeLabels: Record<UniversalConstraintType, { he: string; en: string }> = {
    work_meeting: { he: 'פגישת עבודה / כנס', en: 'Business Meeting / Conference' },
    wedding: { he: 'חתונה', en: 'Wedding' },
    school_exam: { he: 'מבחן / לימודים', en: 'School Exam / Academic' },
    religious_observance: {
      he: 'מועד / שמירת יום מנוחה דתי (שבת / ראשון / חג)',
      en: 'Religious Observance / Rest Day',
    },
    family_celebration: { he: 'אירוע משפחתי', en: 'Family Celebration' },
    public_holiday: { he: 'חג רשמי / יום שבתון', en: 'Public Holiday' },
    concert_sport: { he: 'הופעה / משחק ספורט', en: 'Concert / Sporting Event' },
    medical_appointment: { he: 'תור / טיפול רפואי', en: 'Medical Appointment' },
    rest_period: { he: 'זמן מנוחה והתאוששות נדרש', en: 'Minimum Rest Period' },
    flight_window: { he: 'חלון שעות המראה / נחיתה', en: 'Flight Takeoff / Landing Window' },
    custom: { he: 'התחייבות אישית אחרת', en: 'Other Commitment' },
  };

  const handleCreateConstraint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const ownerName =
      newOwner === 'trip'
        ? t('common.sharedTrip')
        : participants.find((p) => p.id === newOwner)?.name || t('common.sharedTrip');

    const created: UniversalConstraint = {
      id: `c_${Date.now()}`,
      owner: newOwner,
      ownerName,
      title: newTitle.trim(),
      type: newType,
      isMandatory: newIsMandatory,
      earliestDate: newEarliestDate || undefined,
      earliestTime: newEarliestTime || undefined,
      latestDate: newLatestDate || undefined,
      latestTime: newLatestTime || undefined,
      location: newLocation.trim() || undefined,
      timezone: newTimezone,
      bufferHoursBefore: newBufferBefore || undefined,
      bufferHoursAfter: newBufferAfter || undefined,
      notes: newNotes.trim() || undefined,
      status: 'resolved',
      isConfirmed: true,
    };

    const updated = [...universalConstraints, created];
    if (onUniversalConstraintsChange) {
      onUniversalConstraintsChange(updated);
    }

    // Also sync to legacy events array if applicable
    const legacyEvent: TripEvent = {
      id: created.id,
      title: created.title,
      category: newType === 'wedding' ? 'wedding' : newType === 'school_exam' ? 'exam' : 'business_meeting',
      startDate: created.earliestDate || created.latestDate || '2026-11-01',
      startTime: created.earliestTime || '12:00',
      endTime: created.latestTime,
      location: created.location || 'יעד הנסיעה',
      isMandatory: created.isMandatory,
      bufferHoursBefore: created.bufferHoursBefore || 2,
    };
    onEventsChange([...events, legacyEvent]);

    // Reset form
    setNewTitle('');
    setNewEarliestDate('');
    setNewEarliestTime('');
    setNewLatestDate('');
    setNewLatestTime('');
    setNewLocation('');
    setNewNotes('');
    setShowAddConstraintForm(false);
  };

  const handleRemoveConstraint = (id: string) => {
    if (onUniversalConstraintsChange) {
      onUniversalConstraintsChange(universalConstraints.filter((c) => c.id !== id));
    }
    onEventsChange(events.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* 1. Universal Events & Constraints Section (PART D) */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-800" />
              <h3 className="text-base font-bold text-stone-900">
                {t('constraints.universalTitle')}
              </h3>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              {t('constraints.universalDesc')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddConstraintForm(true)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('constraints.addNewButton')}</span>
          </button>
        </div>

        {/* List of existing constraints */}
        {universalConstraints.length === 0 ? (
          <div className="p-6 rounded-xl bg-stone-50 text-center text-xs text-stone-500">
            {t('constraints.emptyList')}
          </div>
        ) : (
          <div className="space-y-3">
            {universalConstraints.map((c) => {
              const typeLabel =
                language === 'he'
                  ? constraintTypeLabels[c.type]?.he || c.type
                  : constraintTypeLabels[c.type]?.en || c.type;

              return (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">{c.title}</span>
                      <span className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium">
                        {typeLabel}
                      </span>
                      <span className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                        {c.owner === 'trip' ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        <span>{c.ownerName || (c.owner === 'trip' ? t('common.sharedTrip') : c.owner)}</span>
                      </span>
                      {c.isMandatory ? (
                        <span className="text-[11px] bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded font-semibold">
                          {t('common.mandatory')}
                        </span>
                      ) : (
                        <span className="text-[11px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                          {t('common.preference')}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-stone-500 text-[11px]">
                      {(c.earliestDate || c.earliestTime) && (
                        <span>
                          {language === 'he' ? 'מוקדם ביותר:' : 'Earliest:'} {c.earliestDate || ''} {c.earliestTime || ''}
                        </span>
                      )}
                      {(c.latestDate || c.latestTime) && (
                        <span>
                          {language === 'he' ? 'מאוחר ביותר:' : 'Latest:'} {c.latestDate || ''} {c.latestTime || ''}
                        </span>
                      )}
                      {c.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          {c.location}
                        </span>
                      )}
                      {c.timezone && (
                        <span className="text-stone-400">({c.timezone})</span>
                      )}
                      {c.bufferHoursBefore ? (
                        <span>
                          {language === 'he' ? `מרווח: ${c.bufferHoursBefore} שעות` : `Buffer: ${c.bufferHoursBefore}h`}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveConstraint(c.id)}
                    className="self-end sm:self-center p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title={t('common.remove')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Constraint Form */}
        {showAddConstraintForm && (
          <form
            onSubmit={handleCreateConstraint}
            className="p-5 rounded-2xl bg-amber-50/60 border border-amber-300 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h4 className="font-bold text-sm text-stone-900">{t('constraints.formTitle')}</h4>
              <button
                type="button"
                onClick={() => setShowAddConstraintForm(false)}
                className="text-stone-500 hover:text-stone-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="font-bold text-stone-800 block mb-1">
                  {t('constraints.titleLabel')}
                </label>
                <input
                  type="text"
                  required
                  dir="auto"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={t('constraints.titlePlaceholder')}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-800"
                />
              </div>

              {/* Owner */}
              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {t('constraints.ownerLabel')}
                </label>
                <select
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                >
                  <option value="trip">{t('common.sharedTrip')}</option>
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.departureCity || p.originAirport || p.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category */}
              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {t('constraints.categoryLabel')}
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as UniversalConstraintType)}
                  className="w-full px-2.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                >
                  {Object.entries(constraintTypeLabels).map(([catKey, labelObj]) => (
                    <option key={catKey} value={catKey}>
                      {language === 'he' ? labelObj.he : labelObj.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location & Timezone */}
              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {t('constraints.timezoneLabel')}
                </label>
                <select
                  value={newTimezone}
                  onChange={(e) => setNewTimezone(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz.iana} value={tz.iana}>
                      {tz.iana} ({language === 'he' ? tz.cityHebrew : tz.cityEnglish})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Boundaries: Earliest and Latest independently optional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white border border-stone-200">
              <div className="space-y-1">
                <label className="font-bold text-stone-800 block">
                  {t('constraints.earliestBoundary')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={newEarliestDate}
                    onChange={(e) => setNewEarliestDate(e.target.value)}
                    className="w-2/3 px-2 py-1.5 rounded-lg border border-stone-300 text-xs"
                  />
                  <input
                    type="time"
                    value={newEarliestTime}
                    onChange={(e) => setNewEarliestTime(e.target.value)}
                    className="w-1/3 px-2 py-1.5 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800 block">
                  {t('constraints.latestBoundary')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={newLatestDate}
                    onChange={(e) => setNewLatestDate(e.target.value)}
                    className="w-2/3 px-2 py-1.5 rounded-lg border border-stone-300 text-xs"
                  />
                  <input
                    type="time"
                    value={newLatestTime}
                    onChange={(e) => setNewLatestTime(e.target.value)}
                    className="w-1/3 px-2 py-1.5 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Buffer & Mandatory selection */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-amber-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newIsMandatory}
                  onChange={(e) => setNewIsMandatory(e.target.checked)}
                  className="rounded text-amber-800 w-4 h-4"
                />
                <span className="font-bold text-stone-900">
                  {newIsMandatory ? t('constraints.isMandatoryLabel') : t('constraints.isPreferenceLabel')}
                </span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddConstraintForm(false)}
                  className="px-3 py-1.5 rounded-xl text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-800 text-white rounded-xl font-bold hover:bg-amber-900 shadow-xs cursor-pointer"
                >
                  {t('constraints.saveButton')}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* 2. Travel Boundaries & 8-Point Time Checkpoints */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-4">
        <div className="space-y-1 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-800" />
            <h3 className="text-base font-bold text-stone-900">
              {t('constraints.checkpointsTitle')}
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            {t('constraints.checkpointsDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Checkpoint 1: Earliest Departure from Home */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-stone-600" />
                <span>1. {language === 'he' ? 'יציאה מוקדמת מהבית:' : 'Earliest home departure:'}</span>
              </span>
              <label className="text-[11px] text-stone-600 flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={boundaries.earliestHomeDeparture?.isMandatory ?? true}
                  onChange={(e) =>
                    onBoundariesChange({
                      ...boundaries,
                      earliestHomeDeparture: {
                        ...(boundaries.earliestHomeDeparture || { time: '16:00' }),
                        isMandatory: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-amber-800"
                />
                <span>{t('common.mandatory')}</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={boundaries.earliestHomeDeparture?.time || '16:00'}
                onChange={(e) =>
                  onBoundariesChange({
                    ...boundaries,
                    earliestHomeDeparture: {
                      isMandatory: boundaries.earliestHomeDeparture?.isMandatory ?? true,
                      time: e.target.value,
                    },
                  })
                }
                className="px-2 py-1.5 rounded bg-white border border-stone-300 text-stone-900"
              />
              <span className="text-[11px] text-stone-500">
                ({language === 'he' ? 'למשל: סיום יום עבודה' : 'e.g. work end'})
              </span>
            </div>
          </div>

          {/* Checkpoint 2: Airport Buffer */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <span className="font-bold text-stone-900 flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-stone-600" />
              <span>2. {language === 'he' ? 'הגעה לשדה ומרווח ביטחון:' : 'Airport buffer:'}</span>
            </span>
            <div className="flex items-center gap-2">
              <select
                value={boundaries.airportArrivalBufferHours || 3}
                onChange={(e) =>
                  onBoundariesChange({
                    ...boundaries,
                    airportArrivalBufferHours: parseInt(e.target.value, 10),
                  })
                }
                className="px-2 py-1.5 rounded bg-white border border-stone-300 text-stone-900"
              >
                <option value={2}>2 hours before takeoff</option>
                <option value={3}>3 hours before takeoff (standard)</option>
                <option value={4}>4 hours before takeoff (recommended)</option>
              </select>
            </div>
          </div>

          {/* Checkpoint 3: Latest Home Return */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-stone-600" />
                <span>3. {language === 'he' ? 'חזרה מאוחרת ביותר הביתה:' : 'Latest home return:'}</span>
              </span>
              <label className="text-[11px] text-stone-600 flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={boundaries.latestHomeReturn?.isMandatory ?? false}
                  onChange={(e) =>
                    onBoundariesChange({
                      ...boundaries,
                      latestHomeReturn: {
                        ...(boundaries.latestHomeReturn || { time: '22:00' }),
                        isMandatory: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-amber-800"
                />
                <span>{t('common.mandatory')}</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={boundaries.latestHomeReturn?.time || '22:00'}
                onChange={(e) =>
                  onBoundariesChange({
                    ...boundaries,
                    latestHomeReturn: {
                      isMandatory: boundaries.latestHomeReturn?.isMandatory ?? false,
                      time: e.target.value,
                    },
                  })
                }
                className="px-2 py-1.5 rounded bg-white border border-stone-300 text-stone-900"
              />
              <span className="text-[11px] text-stone-500">
                ({language === 'he' ? 'שעת שינה סבירה' : 'reasonable bedtime'})
              </span>
            </div>
          </div>

          {/* Checkpoint 4: Return to Work Deadline */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-stone-600" />
                <span>4. {language === 'he' ? 'דד-ליין חזרה לעבודה / לימודים:' : 'Return to work deadline:'}</span>
              </span>
              <label className="text-[11px] text-stone-600 flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={boundaries.returnToWorkDeadline?.isMandatory ?? true}
                  onChange={(e) =>
                    onBoundariesChange({
                      ...boundaries,
                      returnToWorkDeadline: {
                        ...(boundaries.returnToWorkDeadline || { time: '09:00' }),
                        isMandatory: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-amber-800"
                />
                <span>{t('common.mandatory')}</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={boundaries.returnToWorkDeadline?.time || '09:00'}
                onChange={(e) =>
                  onBoundariesChange({
                    ...boundaries,
                    returnToWorkDeadline: {
                      isMandatory: boundaries.returnToWorkDeadline?.isMandatory ?? true,
                      time: e.target.value,
                    },
                  })
                }
                className="px-2 py-1.5 rounded bg-white border border-stone-300 text-stone-900"
              />
              <span className="text-[11px] text-stone-500">
                ({language === 'he' ? 'הגעה לעבודה בזמן' : 'on-time arrival'})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

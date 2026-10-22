import React, { useState, useEffect, useRef } from 'react';
import {
  gregorianToHebrewDetailed,
  hebrewToGregorian,
  getHebrewMonthsForYear,
  getHebrewMonthGridDetails,
  numberToHebrewDay,
  hebrewYearToString,
} from '../utils/hebrewCalendarResolver';
import { useLanguage } from '../i18n/LanguageContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, ChevronDown, X } from 'lucide-react';

interface HebrewDatePickerProps {
  valueIsoDate: string; // "YYYY-MM-DD"
  onChange: (isoDate: string) => void;
  label?: string;
  minYear?: number;
  maxYear?: number;
  isInline?: boolean; // If true, renders expanded; if false (default), renders collapsed popover
}

export const HebrewDatePicker: React.FC<HebrewDatePickerProps> = ({
  valueIsoDate,
  onChange,
  label,
  minYear = 5786,
  maxYear = 5792,
  isInline = false,
}) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(isInline);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive initial Hebrew date from Gregorian
  const initialHebrew = gregorianToHebrewDetailed(valueIsoDate || '2026-11-01');

  const [selectedYear, setSelectedYear] = useState<number>(initialHebrew.hebrewYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(initialHebrew.hebrewMonthName);
  const [selectedDay, setSelectedDay] = useState<number>(initialHebrew.hebrewDayNumber);

  // Sync with external value changes
  useEffect(() => {
    if (valueIsoDate) {
      try {
        const h = gregorianToHebrewDetailed(valueIsoDate);
        setSelectedYear(h.hebrewYear);
        setSelectedMonth(h.hebrewMonthName);
        setSelectedDay(h.hebrewDayNumber);
      } catch (e) {
        // ignore
      }
    }
  }, [valueIsoDate]);

  // Handle clicking outside to close collapsed popover
  useEffect(() => {
    if (isInline || !isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isInline, isOpen]);

  const months = getHebrewMonthsForYear(selectedYear);
  const currentMonthIndex = months.findIndex((m) => m.name === selectedMonth);

  // Accurate month details: days in month and weekday of Day 1 (0=Sunday ... 6=Saturday)
  const monthGridDetails = getHebrewMonthGridDetails(selectedYear, selectedMonth);

  const handlePrevMonth = () => {
    if (currentMonthIndex > 0) {
      const prevM = months[currentMonthIndex - 1].name;
      setSelectedMonth(prevM);
      emitChange(selectedYear, prevM, Math.min(selectedDay, 29));
    } else {
      const prevY = selectedYear - 1;
      const prevMonths = getHebrewMonthsForYear(prevY);
      const prevM = prevMonths[prevMonths.length - 1].name;
      setSelectedYear(prevY);
      setSelectedMonth(prevM);
      emitChange(prevY, prevM, Math.min(selectedDay, 29));
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < months.length - 1) {
      const nextM = months[currentMonthIndex + 1].name;
      setSelectedMonth(nextM);
      emitChange(selectedYear, nextM, Math.min(selectedDay, 29));
    } else {
      const nextY = selectedYear + 1;
      const nextMonths = getHebrewMonthsForYear(nextY);
      const nextM = nextMonths[0].name;
      setSelectedYear(nextY);
      setSelectedMonth(nextM);
      emitChange(nextY, nextM, Math.min(selectedDay, 29));
    }
  };

  const emitChange = (y: number, m: string, d: number) => {
    try {
      const res = hebrewToGregorian(y, m, d);
      onChange(res.isoDate);
    } catch (e) {
      console.warn('Failed to convert hebrew date:', e);
    }
  };

  const handleSelectDay = (dayNum: number) => {
    setSelectedDay(dayNum);
    emitChange(selectedYear, selectedMonth, dayNum);
    if (!isInline) {
      setIsOpen(false);
    }
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    const newMonths = getHebrewMonthsForYear(newYear);
    const mName = newMonths.some((m) => m.name === selectedMonth)
      ? selectedMonth
      : newMonths[0].name;
    setSelectedMonth(mName);
    emitChange(newYear, mName, Math.min(selectedDay, 29));
  };

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    emitChange(selectedYear, newMonth, Math.min(selectedDay, 29));
  };

  // Convert current selection to Gregorian preview
  let gregPreview = '';
  try {
    const g = hebrewToGregorian(selectedYear, selectedMonth, selectedDay);
    gregPreview = `${g.dayOfWeekName}, ${g.formattedGregorian}`;
  } catch (e) {
    gregPreview = '';
  }

  const yearsRange: number[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    yearsRange.push(y);
  }

  const weekdayHeaders =
    language === 'he'
      ? ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
      : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Current formatted label for collapsed trigger button
  const currentFormatted = `${numberToHebrewDay(selectedDay)} ב${selectedMonth} ${hebrewYearToString(
    selectedYear
  )}`;

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5">
      {label && <label className="block text-xs font-bold text-stone-900">{label}</label>}

      {/* Collapsed Trigger Button */}
      {!isInline && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all text-right cursor-pointer bg-white ${
            isOpen
              ? 'border-amber-800 ring-1 ring-amber-800 shadow-sm'
              : 'border-stone-300 hover:border-stone-400'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <CalendarIcon className="w-4 h-4 text-amber-800 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-sm text-stone-900 block truncate">
                {currentFormatted}
              </span>
              <span className="text-[11px] text-stone-500 block truncate">
                {gregPreview || valueIsoDate}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-stone-500 transition-transform shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {/* Expanded Popover / Panel */}
      {(isInline || isOpen) && (
        <div
          className={`${
            isInline
              ? 'p-4 rounded-2xl bg-white border border-stone-200 shadow-xs'
              : 'absolute z-50 top-full mt-1.5 w-full sm:w-[340px] p-4 rounded-2xl bg-white border border-stone-200 shadow-xl right-0'
          } space-y-3`}
        >
          {/* Header row: month & year navigations */}
          <div className="flex items-center justify-between gap-1 border-b border-stone-100 pb-2.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              title={t('hebrewPicker.prevMonth')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 min-w-0">
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="px-2 py-1 rounded-lg bg-stone-50 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800 cursor-pointer"
              >
                {months.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                className="px-2 py-1 rounded-lg bg-stone-50 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800 cursor-pointer"
              >
                {yearsRange.map((y) => (
                  <option key={y} value={y}>
                    {hebrewYearToString(y)} ({y})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              title={t('hebrewPicker.nextMonth')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Column Headers (Sun to Sat) */}
          <div className="grid grid-cols-7 gap-1 text-center border-b border-stone-100 pb-1.5">
            {weekdayHeaders.map((hdr, idx) => (
              <span
                key={idx}
                className={`text-[11px] font-bold ${
                  idx === 6 ? 'text-amber-900' : 'text-stone-500'
                }`}
              >
                {hdr}
              </span>
            ))}
          </div>

          {/* Weekday-Aligned Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots for Day 1 weekday alignment */}
            {Array.from({ length: monthGridDetails.firstDayWeekday }, (_, i) => (
              <div key={`empty-${i}`} className="py-1 px-1 h-8" />
            ))}

            {/* Days in Month (accurate 29 or 30 days) */}
            {Array.from({ length: monthGridDetails.daysInMonth }, (_, i) => i + 1).map((dNum) => {
              const isSelected = dNum === selectedDay;
              const hebStr = numberToHebrewDay(dNum);

              return (
                <button
                  key={dNum}
                  type="button"
                  onClick={() => handleSelectDay(dNum)}
                  className={`h-8 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? 'bg-amber-800 text-white font-bold shadow-xs'
                      : 'text-stone-800 hover:bg-amber-50 hover:text-amber-900'
                  }`}
                >
                  {hebStr}
                </button>
              );
            })}
          </div>

          {/* Footer preview & Close button */}
          <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-stone-600 font-medium truncate max-w-[190px]">
              {gregPreview}
            </span>
            {!isInline && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs cursor-pointer transition-colors"
              >
                {t('hebrewPicker.close')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

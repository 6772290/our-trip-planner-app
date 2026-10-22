import React, { useState, useEffect, useRef } from 'react';
import { HebrewDatePicker } from './HebrewDatePicker';
import { gregorianToHebrewDetailed } from '../utils/hebrewCalendarResolver';
import { useLanguage } from '../i18n/LanguageContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';

interface UnifiedDatePickerProps {
  valueIsoDate: string; // "YYYY-MM-DD"
  onChange: (newIsoDate: string) => void;
  calendarType: 'gregorian' | 'hebrew';
  showSecondaryCalendar?: boolean;
  label?: string;
  minYear?: number;
  maxYear?: number;
}

export const UnifiedDatePicker: React.FC<UnifiedDatePickerProps> = ({
  valueIsoDate,
  onChange,
  calendarType,
  showSecondaryCalendar = true,
  label,
  minYear = 2026,
  maxYear = 2030,
}) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // If in Hebrew mode, delegate to the HebrewDatePicker with collapsed trigger
  if (calendarType === 'hebrew') {
    return (
      <HebrewDatePicker
        label={label}
        valueIsoDate={valueIsoDate}
        onChange={onChange}
        minYear={5786}
        maxYear={5792}
        isInline={false}
      />
    );
  }

  // Gregorian collapsed date-picker implementation
  const safeDate = valueIsoDate || '2026-11-01';
  const [yStr, mStr, dStr] = safeDate.split('-');
  const selectedYear = parseInt(yStr, 10) || 2026;
  const selectedMonth = parseInt(mStr, 10) || 11; // 1-indexed (1..12)
  const selectedDay = parseInt(dStr, 10) || 1;

  const [viewYear, setViewYear] = useState<number>(selectedYear);
  const [viewMonth, setViewMonth] = useState<number>(selectedMonth);

  useEffect(() => {
    if (valueIsoDate) {
      const [y, m] = valueIsoDate.split('-');
      if (y && m) {
        setViewYear(parseInt(y, 10));
        setViewMonth(parseInt(m, 10));
      }
    }
  }, [valueIsoDate]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Calculate days in Gregorian month
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  // First day of month weekday (0=Sunday ... 6=Saturday)
  const firstDayWeekday = new Date(viewYear, viewMonth - 1, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth > 1) {
      setViewMonth(viewMonth - 1);
    } else {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth < 12) {
      setViewMonth(viewMonth + 1);
    } else {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    }
  };

  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const newIso = `${viewYear}-${mm}-${dd}`;
    onChange(newIso);
    setIsOpen(false);
  };

  // Secondary Hebrew preview
  let secondaryPreview = '';
  let dayOfWeekName = '';
  try {
    const h = gregorianToHebrewDetailed(safeDate);
    secondaryPreview = h.formatted;
    dayOfWeekName = h.dayOfWeekName;
  } catch (e) {
    // ignore
  }

  const monthNamesHeb = [
    'ינואר',
    'פברואר',
    'מרץ',
    'אפריל',
    'מאי',
    'יוני',
    'יולי',
    'אוגוסט',
    'ספטמבר',
    'אוקטובר',
    'נובמבר',
    'דצמבר',
  ];

  const monthNamesEn = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const weekdayHeaders =
    language === 'he'
      ? ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
      : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const formattedDisplay = `${selectedDay} ${
    language === 'he' ? monthNamesHeb[selectedMonth - 1] : monthNamesEn[selectedMonth - 1]
  } ${selectedYear}`;

  const yearsRange: number[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    yearsRange.push(y);
  }

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5">
      {label && <label className="block text-xs font-bold text-stone-900">{label}</label>}

      {/* Collapsed Trigger Button */}
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
              {formattedDisplay}
            </span>
            {showSecondaryCalendar && secondaryPreview && (
              <span className="text-[11px] text-stone-500 block truncate">
                {secondaryPreview} ({dayOfWeekName})
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-stone-500 transition-transform shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expanded Popover Panel */}
      {isOpen && (
        <div className="absolute z-50 top-full mt-1.5 w-full sm:w-[340px] p-4 rounded-2xl bg-white border border-stone-200 shadow-xl right-0 space-y-3">
          {/* Header Month / Year Navigation */}
          <div className="flex items-center justify-between gap-1 border-b border-stone-100 pb-2.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="px-2 py-1 rounded-lg bg-stone-50 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800 cursor-pointer"
              >
                {(language === 'he' ? monthNamesHeb : monthNamesEn).map((mName, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {mName}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="px-2 py-1 rounded-lg bg-stone-50 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800 cursor-pointer"
              >
                {yearsRange.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Column Headers */}
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

          {/* Weekday-aligned Day Cells */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots for Day 1 */}
            {Array.from({ length: firstDayWeekday }, (_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dNum) => {
              const isSelected =
                viewYear === selectedYear && viewMonth === selectedMonth && dNum === selectedDay;

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
                  {dNum}
                </button>
              );
            })}
          </div>

          {/* Direct date picker option & close */}
          <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
            <input
              type="date"
              value={safeDate}
              onChange={(e) => {
                if (e.target.value) {
                  onChange(e.target.value);
                  setIsOpen(false);
                }
              }}
              className="text-[11px] px-2 py-0.5 rounded border border-stone-200 bg-stone-50 text-stone-600"
            />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs cursor-pointer transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

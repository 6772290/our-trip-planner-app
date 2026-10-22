import React, { useState, useRef, useEffect } from 'react';
import {
  Airport,
  searchAirports,
  formatAirportOption,
  AIRPORT_DIRECTORY_DISCLAIMER_HE,
  AIRPORT_DIRECTORY_DISCLAIMER_EN,
} from '../utils/airportDirectory';
import { Plane, Search, X, Check, Info } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface AirportSearchInputProps {
  label: string;
  value: string; // IATA code or full formatted string
  onChange: (value: string, airport?: Airport) => void;
  placeholder?: string;
  helperText?: string;
}

export const AirportSearchInput: React.FC<AirportSearchInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  helperText,
}) => {
  const { language } = useLanguage();
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const results = searchAirports(query, language === 'en' ? 'en' : 'he', 6);

  const handleSelect = (airport: Airport) => {
    const formatted = formatAirportOption(airport, language === 'en' ? 'en' : 'he');
    setQuery(formatted);
    onChange(formatted, airport);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-stone-900">{label}</label>
        {helperText && <span className="text-[11px] text-stone-500">{helperText}</span>}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-stone-400">
          <Plane className="w-4 h-4 text-amber-800" />
        </div>

        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={
            placeholder ||
            (language === 'he'
              ? 'חיפוש לפי עיר, שם נמל או קוד IATA (לדוגמה: מילאנו, מלפנזה, MXP, TLV...)'
              : 'Search by city, airport name or IATA code (e.g. Milan, MXP, TLV, JFK)...')
          }
          className="w-full ps-9 pe-8 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-800 focus:border-amber-800 transition-colors"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 end-0 pe-2.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Directory notice */}
      <div className="flex items-start gap-1.5 text-[11px] text-stone-500 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
        <Info className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
        <span>
          {language === 'he' ? AIRPORT_DIRECTORY_DISCLAIMER_HE : AIRPORT_DIRECTORY_DISCLAIMER_EN}
        </span>
      </div>

      {/* Auto-suggest dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1.5 w-full bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          <div className="p-1.5 space-y-1">
            {results.map((airport) => {
              const formatted = formatAirportOption(airport, language === 'en' ? 'en' : 'he');
              const isSelected = query.includes(airport.iata);

              return (
                <button
                  key={airport.iata}
                  type="button"
                  onClick={() => handleSelect(airport)}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center justify-between text-xs sm:text-sm cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-100 text-amber-900 font-bold'
                      : 'hover:bg-stone-50 text-stone-800'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">
                      {language === 'he' ? airport.nameHe : airport.nameEn}
                    </div>
                    <div className="text-[11px] text-stone-500 truncate">
                      {language === 'he' ? airport.cityHe : airport.cityEn},{' '}
                      {language === 'he' ? airport.countryHe : airport.countryEn}
                    </div>
                  </div>
                  <span className="ms-2 px-2 py-0.5 rounded bg-stone-200/80 text-stone-800 font-mono text-xs font-bold shrink-0">
                    {airport.iata}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
}

export const COUNTRIES: Country[] = [
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', placeholder: '1712-345678' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', placeholder: '(555) 019-2834' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', placeholder: '7911 123456' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', placeholder: '(416) 555-0199' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', placeholder: '50 123 4567' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', placeholder: '50 123 4567' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', placeholder: '98765 43210' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', placeholder: '300 1234567' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', placeholder: '8123 4567' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', placeholder: '12-345 6789' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', placeholder: '3312 3456' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', placeholder: '9123 4567' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', placeholder: '412 345 678' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', placeholder: '151 12345678' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', placeholder: '6 12345678' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', placeholder: '79 123 45 67' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', placeholder: '70 123 45 67' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', placeholder: '90 1234 5678' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', placeholder: '10 1234 5678' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', placeholder: '138 0013 8000' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', placeholder: '532 123 4567' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', placeholder: '11 91234-5678' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', placeholder: '82 123 4567' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', placeholder: '312 345 6789' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', placeholder: '612 34 56 78' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', placeholder: '83 123 4567' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', placeholder: '21 123 4567' },
];

interface PhoneInputProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  id?: string;
  defaultCountryCode?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label = 'Business Phone',
  value = '',
  onChange,
  error,
  id = 'phone-input',
  defaultCountryCode = 'BD',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Helper to detect country from dial code in phone string
  const detectCountry = (phoneStr: string): { country: Country; localNumber: string } => {
    const trimmed = phoneStr.trim();
    if (!trimmed) {
      const defaultC = COUNTRIES.find((c) => c.code === defaultCountryCode) || COUNTRIES[0];
      return { country: defaultC, localNumber: '' };
    }

    // Sort countries by dialCode length descending to match +880 before +88, etc.
    const sortedCountries = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    for (const c of sortedCountries) {
      if (trimmed.startsWith(c.dialCode)) {
        const local = trimmed.slice(c.dialCode.length).trim();
        return { country: c, localNumber: local };
      }
    }

    const defaultC = COUNTRIES.find((c) => c.code === defaultCountryCode) || COUNTRIES[0];
    return { country: defaultC, localNumber: trimmed };
  };

  const [selectedCountry, setSelectedCountry] = useState<Country>(() => detectCountry(value).country);
  const [localNumber, setLocalNumber] = useState<string>(() => detectCountry(value).localNumber);

  // Sync state if external value changes
  useEffect(() => {
    const { country, localNumber: parsedLocal } = detectCountry(value);
    setSelectedCountry(country);
    setLocalNumber(parsedLocal);
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleCountrySelect = (c: Country) => {
    setSelectedCountry(c);
    setIsOpen(false);
    const combined = localNumber ? `${c.dialCode} ${localNumber}` : c.dialCode;
    onChange(combined);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocal = e.target.value;
    setLocalNumber(newLocal);
    const combined = newLocal ? `${selectedCountry.dialCode} ${newLocal}` : '';
    onChange(combined);
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-1.5" ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <div className="relative flex rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        {/* Country Selector Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-r border-slate-300 dark:border-slate-700 rounded-l-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
        </button>

        {/* Local Number Input */}
        <input
          id={id}
          type="tel"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder={selectedCountry.placeholder}
          className="block w-full bg-transparent px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none rounded-r-xl"
        />

        {/* Dropdown Popover */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
            {/* Search Country */}
            <div className="relative mb-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or code..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Countries List */}
            <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1">
              {filteredCountries.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">No country found</div>
              ) : (
                filteredCountries.map((c) => {
                  const isSelected = selectedCountry.code === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleCountrySelect(c)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left',
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base leading-none">{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-slate-400 font-mono text-[11px]">{c.dialCode}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

export default PhoneInput;

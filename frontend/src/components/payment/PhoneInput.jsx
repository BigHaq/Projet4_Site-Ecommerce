import { useState } from 'react';
import { COUNTRIES } from '../../constants/index.js';

export function PhoneInput({ value, onChange, countryCode, onCountryChange, error }) {
  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
  const [showDropdown, setShowDropdown] = useState(false);

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    // Construire le numéro E.164
    const full = `${country.dialCode}${raw}`;
    onChange(full, raw);
  };

  const displayValue = value?.startsWith(country.dialCode)
    ? value.slice(country.dialCode.length)
    : value || '';

  return (
    <div>
      <label className="block text-sm font-semibold text-kora-text mb-2" htmlFor="phone-number">
        Numéro Mobile Money
      </label>
      <div className={`flex rounded-xl border-2 overflow-hidden transition-all duration-200 bg-white
        ${error ? 'border-red-400' : 'border-kora-border focus-within:border-primary'}`}>

        {/* Sélecteur pays */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 h-full border-r border-kora-border bg-kora-bg hover:bg-kora-border/50 transition-colors"
            aria-haspopup="listbox"
            aria-expanded={showDropdown}
            aria-label="Sélectionner le pays"
          >
            <span className="text-xl">{country.flag}</span>
            <span className="text-sm font-medium text-kora-muted">{country.dialCode}</span>
            <svg className={`w-3.5 h-3.5 text-kora-muted transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-kora-border rounded-xl shadow-kora-lg z-20 overflow-hidden">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onCountryChange(c.code); setShowDropdown(false); onChange('', ''); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-kora-bg transition-colors text-left
                    ${c.code === countryCode ? 'bg-primary/10 text-primary font-medium' : 'text-kora-text'}`}
                >
                  <span className="text-xl">{c.flag}</span>
                  <span>{c.name}</span>
                  <span className="ml-auto text-kora-muted text-xs">{c.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Champ numéro */}
        <input
          id="phone-number"
          type="tel"
          inputMode="numeric"
          value={displayValue}
          onChange={handlePhoneChange}
          placeholder="67 12 34 56"
          className="flex-1 px-4 py-3 text-sm text-kora-text bg-white focus:outline-none placeholder:text-kora-muted"
          autoComplete="tel-local"
          aria-describedby={error ? 'phone-error' : undefined}
          aria-invalid={!!error}
        />
      </div>

      {error && (
        <p id="phone-error" className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      <p className="text-xs text-kora-muted mt-1.5">
        Format : {country.dialCode} suivi de votre numéro local
      </p>
    </div>
  );
}

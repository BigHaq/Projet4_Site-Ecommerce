import { motion } from 'framer-motion';
import { OPERATORS } from '../../constants/index.js';

export function OperatorSelector({ selected, onSelect, countryCode }) {
  // Filtrer les opérateurs disponibles pour le pays sélectionné
  const available = countryCode
    ? OPERATORS.filter((op) => op.countries.includes(countryCode))
    : OPERATORS;

  return (
    <div>
      <p className="text-sm font-semibold text-kora-text mb-3">
        Choisissez votre opérateur Mobile Money
      </p>
      <div className="grid grid-cols-2 gap-3">
        {OPERATORS.map((op) => {
          const isAvailable = !countryCode || op.countries.includes(countryCode);
          const isSelected = selected === op.code;

          return (
            <motion.button
              key={op.code}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => isAvailable && onSelect(op.code)}
              disabled={!isAvailable}
              id={`operator-${op.code.toLowerCase()}`}
              aria-pressed={isSelected}
              aria-label={`Payer avec ${op.name}`}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200
                ${isSelected ? 'border-2 shadow-kora' : 'border-kora-border hover:border-gray-300'}
                ${!isAvailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              style={isSelected ? {
                borderColor: op.color,
                background: `${op.color}15`,
              } : {}}
            >
              {/* Logo simulé — couleur officielle */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center font-display font-bold text-lg shadow-sm"
                style={{ background: op.color, color: op.textColor }}
              >
                {op.code === 'MTN' ? 'MTN' : op.code === 'MOOV' ? 'M' : op.code === 'WAVE' ? 'W' : 'OM'}
              </div>
              <span className="text-sm font-semibold text-kora-text">{op.name}</span>
              <span className="text-xs text-kora-muted text-center leading-tight">{op.description}</span>

              {/* Check si sélectionné */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: op.color }}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke={op.textColor} strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}

              {!isAvailable && countryCode && (
                <span className="text-xs text-kora-muted">Non disponible</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

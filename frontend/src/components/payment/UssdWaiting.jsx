import { motion } from 'framer-motion';
import { OPERATORS } from '../../constants/index.js';
import { formatFCFA } from '../../constants/index.js';

export function UssdWaiting({ transaction, secondsLeft, operator }) {
  const op = OPERATORS.find((o) => o.code === operator) || OPERATORS[0];
  const progress = (secondsLeft / 120) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <div className="flex flex-col items-center text-center py-8 px-4">
      {/* Cercle animé USSD */}
      <div className="relative mb-8">
        <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
          {/* Track */}
          <circle cx="60" cy="60" r="45" fill="none" stroke="#E7E0D8" strokeWidth="8" />
          {/* Progress */}
          <motion.circle
            cx="60" cy="60" r="45"
            fill="none"
            stroke={op.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5 }}
          />
        </svg>

        {/* Icône pulsante au centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-14 h-14 rounded-full flex items-center justify-center ussd-pulse"
            style={{ background: op.color, color: op.textColor }}
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Compte à rebours */}
      <div className="mb-2">
        <span className="font-display text-4xl font-bold text-kora-text tabular-nums">{secondsLeft}</span>
        <span className="text-kora-muted ml-1">s</span>
      </div>

      <h2 className="font-display text-2xl font-bold text-kora-text mb-3">
        Validation en cours
      </h2>

      <div className="bg-kora-bg rounded-2xl p-5 mb-6 max-w-sm w-full">
        <p className="text-kora-text font-medium mb-1">
          📱 Vérifiez votre téléphone
        </p>
        <p className="text-kora-muted text-sm leading-relaxed">
          Un message <strong>{op.name}</strong> vous a été envoyé. Saisissez votre code PIN pour confirmer le paiement de{' '}
          <strong className="text-primary">{formatFCFA(transaction?.amount || 0)}</strong>.
        </p>
      </div>

      {/* Opérateur */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background: op.color, color: op.textColor }}>
          {op.code[0]}
        </div>
        <span className="text-sm text-kora-muted">Paiement via <strong>{op.name}</strong></span>
      </div>

      {/* Référence */}
      {transaction?.reference && (
        <div className="bg-white border border-kora-border rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-kora-muted mb-1">Référence de transaction</p>
          <p className="font-mono text-sm font-medium text-kora-text">{transaction.reference}</p>
        </div>
      )}

      <p className="text-xs text-kora-muted mt-4">
        Ne fermez pas cette page. Le statut se met à jour automatiquement.
      </p>
    </div>
  );
}

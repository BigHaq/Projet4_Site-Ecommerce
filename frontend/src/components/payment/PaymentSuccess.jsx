import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatFCFA } from '../../constants/index.js';

export function PaymentSuccess({ transaction, orderId }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center py-10 px-4">

      {/* Icône succès */}
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6"
      >
        <motion.svg
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </motion.svg>
      </motion.div>

      <h2 className="font-display text-3xl font-bold text-kora-text mb-2">Paiement réussi !</h2>
      <p className="text-kora-muted mb-8">Votre commande a été confirmée avec succès.</p>

      {/* Récapitulatif */}
      <div className="bg-kora-bg rounded-2xl p-6 w-full max-w-sm mb-8 text-left space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-kora-muted">Montant payé</span>
          <span className="font-bold text-green-700">{formatFCFA(transaction?.amount || 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-kora-muted">Référence</span>
          <span className="font-mono text-xs text-kora-text">{transaction?.reference}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-kora-muted">Statut</span>
          <span className="badge badge-success">Confirmé</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link to={`/order-confirmation/${orderId}`} className="btn-primary flex-1 justify-center">
          Suivre ma commande
        </Link>
        <Link to="/" className="btn-secondary flex-1 justify-center">
          Continuer les achats
        </Link>
      </div>
    </motion.div>
  );
}

export function PaymentFailure({ onRetry, onChangeOperator }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center py-10 px-4">

      <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      <h2 className="font-display text-3xl font-bold text-kora-text mb-2">Paiement échoué</h2>
      <p className="text-kora-muted mb-8">
        Le paiement n'a pas pu être confirmé. Vérifiez votre solde ou essayez un autre opérateur.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button onClick={onRetry} className="btn-primary flex-1 justify-center">
          Réessayer
        </button>
        <button onClick={onChangeOperator} className="btn-secondary flex-1 justify-center">
          Changer d'opérateur
        </button>
      </div>
    </motion.div>
  );
}

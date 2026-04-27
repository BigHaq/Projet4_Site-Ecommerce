import { CinetPayProvider } from './CinetPayProvider.js';
import { MtnMomoProvider } from './MtnMomoProvider.js';
import { MoovMoneyProvider } from './MoovMoneyProvider.js';
import { SimulationProvider } from './SimulationProvider.js';
import { PAYMENT_PROVIDERS } from '../../config/constants.js';

/**
 * Factory de providers de paiement — Pattern Strategy
 *
 * Sélectionne le bon provider selon PAYMENT_MODE ou le paramètre explicite.
 * Le code métier ne connaît jamais l'implémentation concrète.
 *
 * Ordre de priorité :
 *   1. provider explicite passé en paramètre
 *   2. PAYMENT_MODE dans .env
 *   3. SimulationProvider (fallback sécurisé)
 */

// Instances singleton des providers (évite de recréer à chaque appel)
let _cinetpay = null;
let _mtn = null;
let _moov = null;
let _simulation = null;

export function getProvider(providerName) {
  const mode = providerName || process.env.PAYMENT_MODE || PAYMENT_PROVIDERS.SIMULATION;

  switch (mode) {
    case PAYMENT_PROVIDERS.CINETPAY:
      if (!_cinetpay) _cinetpay = new CinetPayProvider();
      return _cinetpay;

    case PAYMENT_PROVIDERS.MTN_MOMO:
      if (!_mtn) _mtn = new MtnMomoProvider();
      return _mtn;

    case PAYMENT_PROVIDERS.MOOV_MONEY:
      if (!_moov) _moov = new MoovMoneyProvider();
      return _moov;

    case PAYMENT_PROVIDERS.SIMULATION:
    default:
      if (!_simulation) _simulation = new SimulationProvider();
      return _simulation;
  }
}

/**
 * Retourne le nom du mode de paiement actif
 */
export function getActiveMode() {
  return process.env.PAYMENT_MODE || PAYMENT_PROVIDERS.SIMULATION;
}

import { TRANSACTION_STATUS } from '../../config/constants.js';
import { maskPhone } from '../../utils/phoneValidator.js';

/**
 * SimulationProvider — Mode développement sans clés API réelles
 *
 * Reproduit fidèlement le vrai flux Mobile Money :
 * - Initiation instantanée avec statut PENDING
 * - Délai réaliste de 8-15 secondes (USSD confirmation)
 * - Webhook simulé après délai → SUCCESS ou FAILED
 * - Taux de succès configurable via SIMULATION_SUCCESS_RATE
 *
 * Usage : PAYMENT_MODE=simulation dans .env
 */
export class SimulationProvider {
  constructor() {
    this.delayMs = parseInt(process.env.SIMULATION_DELAY_MS || '10000');
    this.successRate = parseFloat(process.env.SIMULATION_SUCCESS_RATE || '0.85');
    // Map en mémoire : reference → {status, timeout}
    this._pending = new Map();
  }

  async initiate({ reference, amount, currency, phoneNumber, operator, description }) {
    // Validation minimale
    if (!reference || !amount || !phoneNumber) {
      return {
        success: false,
        message: 'Paramètres manquants pour la simulation.',
      };
    }

    const externalReference = `SIM-${reference}-${Date.now()}`;
    const willSucceed = Math.random() < this.successRate;

    // Stocker l'état pending avec le résultat programmé
    this._pending.set(reference, {
      status: TRANSACTION_STATUS.PENDING,
      externalReference,
      willSucceed,
      resolveAt: Date.now() + this.delayMs,
    });

    // Déclencher la résolution asynchrone (simule le callback USSD)
    setTimeout(() => this._resolve(reference), this.delayMs);

    const maskedPhone = maskPhone(phoneNumber);
    return {
      success: true,
      externalReference,
      message: `[SIMULATION] Paiement initié pour ${maskedPhone} via ${operator}. Confirmez sur votre téléphone dans ${this.delayMs / 1000}s.`,
      rawResponse: {
        mode: 'simulation',
        operator,
        currency,
        amount,
        delayMs: this.delayMs,
      },
    };
  }

  async verifyStatus(reference) {
    const pending = this._pending.get(reference);

    if (!pending) {
      // Référence inconnue — considérée comme échouée
      return { status: TRANSACTION_STATUS.FAILED, rawResponse: { mode: 'simulation', reason: 'unknown_reference' } };
    }

    const now = Date.now();
    if (now < pending.resolveAt) {
      // Pas encore résolu
      return {
        status: TRANSACTION_STATUS.PENDING,
        externalReference: pending.externalReference,
        rawResponse: { mode: 'simulation', remainingMs: pending.resolveAt - now },
      };
    }

    // Résolu
    const status = pending.willSucceed ? TRANSACTION_STATUS.SUCCESS : TRANSACTION_STATUS.FAILED;
    return {
      status,
      externalReference: pending.externalReference,
      rawResponse: { mode: 'simulation', resolvedAt: new Date(pending.resolveAt).toISOString() },
    };
  }

  async handleWebhook(payload) {
    // En simulation, le webhook est généré par _resolve()
    const { reference, status, externalReference } = payload;
    return {
      reference,
      status: status || TRANSACTION_STATUS.FAILED,
      externalReference,
      rawResponse: { mode: 'simulation', ...payload },
    };
  }

  /**
   * Résout une transaction après le délai simulé
   * Appelle le webhook interne via HTTP si WEBHOOK_BASE_URL est défini
   */
  _resolve(reference) {
    const pending = this._pending.get(reference);
    if (!pending) return;

    const status = pending.willSucceed ? TRANSACTION_STATUS.SUCCESS : TRANSACTION_STATUS.FAILED;
    pending.status = status;

    // Appeler le webhook interne si l'URL est configurée
    const webhookUrl = process.env.WEBHOOK_BASE_URL;
    if (webhookUrl) {
      const callbackUrl = `${webhookUrl}/api/payments/callback`;
      const payload = {
        reference,
        status,
        externalReference: pending.externalReference,
        provider: 'simulation',
        timestamp: new Date().toISOString(),
      };

      // Import dynamique pour éviter les dépendances circulaires
      import('axios').then(({ default: axios }) => {
        axios.post(callbackUrl, payload, { timeout: 5000 }).catch(() => {
          // Le webhook peut échouer silencieusement en dev
        });
      });
    }
  }
}

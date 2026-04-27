/**
 * Interface abstraite pour tous les providers de paiement
 * Chaque provider DOIT implémenter ces trois méthodes
 *
 * Pattern Strategy : le code métier appelle PaymentService sans connaître
 * l'implémentation sous-jacente (CinetPay, MTN, Moov, Simulation)
 */
export class BasePaymentProvider {
  /**
   * Initie un paiement Mobile Money
   * @param {Object} params
   * @param {string} params.reference       - Référence unique (idempotency key)
   * @param {number} params.amount          - Montant en XOF (entier)
   * @param {string} params.currency        - Devise (XOF)
   * @param {string} params.phoneNumber     - Numéro E.164
   * @param {string} params.operator        - MTN | MOOV | WAVE | ORANGE
   * @param {string} params.countryCode     - Code ISO pays (BJ, CI, SN...)
   * @param {string} params.description     - Description du paiement
   * @param {string} params.customerName    - Nom du client
   * @param {string} params.customerEmail   - Email du client
   * @param {string} params.callbackUrl     - URL de webhook
   * @param {string} params.returnUrl       - URL de retour après paiement web
   * @returns {Promise<{
   *   success: boolean,
   *   externalReference?: string,
   *   paymentUrl?: string,
   *   ussdCode?: string,
   *   message: string,
   *   rawResponse?: object,
   * }>}
   */
  async initiate(params) {
    throw new Error(`${this.constructor.name} doit implémenter initiate()`);
  }

  /**
   * Vérifie le statut d'une transaction auprès de l'opérateur
   * @param {string} reference - Référence interne de la transaction
   * @returns {Promise<{
   *   status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'TIMEOUT',
   *   externalReference?: string,
   *   rawResponse?: object,
   * }>}
   */
  async verifyStatus(reference) {
    throw new Error(`${this.constructor.name} doit implémenter verifyStatus()`);
  }

  /**
   * Traite un webhook de confirmation reçu de l'opérateur
   * @param {Object} payload - Corps du webhook
   * @returns {Promise<{
   *   reference: string,
   *   status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED',
   *   externalReference?: string,
   *   rawResponse?: object,
   * }>}
   */
  async handleWebhook(payload) {
    throw new Error(`${this.constructor.name} doit implémenter handleWebhook()`);
  }

  /** Nom lisible du provider (pour les logs) */
  get name() {
    return this.constructor.name;
  }
}

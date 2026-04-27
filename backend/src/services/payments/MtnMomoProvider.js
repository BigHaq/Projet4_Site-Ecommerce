import axios from 'axios';
import { BasePaymentProvider } from './PaymentService.js';
import { TRANSACTION_STATUS } from '../../config/constants.js';

/**
 * MtnMomoProvider — Intégration directe MTN Mobile Money (Collections API)
 *
 * API Doc : https://momodeveloper.mtn.com/
 * Sandbox  : https://sandbox.momodeveloper.mtn.com
 *
 * Variables d'env requises :
 *   MTN_MOMO_SUBSCRIPTION_KEY     — Clé Ocp-Apim-Subscription-Key
 *   MTN_MOMO_API_USER             — UUID de l'API user sandbox
 *   MTN_MOMO_API_KEY              — Clé API générée pour l'API user
 *   MTN_MOMO_TARGET_ENVIRONMENT   — "sandbox" ou "mtnbenin" | "mtncotedivoire"...
 *   MTN_MOMO_COLLECTION_URL       — URL de base Collections
 *
 * Flux :
 *   1. POST /collection/token/ → access token OAuth2
 *   2. POST /collection/v1_0/requesttopay → initier le paiement
 *   3. GET  /collection/v1_0/requesttopay/{referenceId} → vérifier le statut
 */
export class MtnMomoProvider extends BasePaymentProvider {
  constructor() {
    super();
    this.subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
    this.apiUser = process.env.MTN_MOMO_API_USER;
    this.apiKey = process.env.MTN_MOMO_API_KEY;
    this.targetEnvironment = process.env.MTN_MOMO_TARGET_ENVIRONMENT || 'sandbox';
    this.collectionUrl = process.env.MTN_MOMO_COLLECTION_URL || 'https://sandbox.momodeveloper.mtn.com/collection';
    this._accessToken = null;
    this._tokenExpiry = null;
  }

  /**
   * Obtient un access token OAuth2 (mis en cache jusqu'à expiration)
   */
  async _getAccessToken() {
    if (this._accessToken && this._tokenExpiry && Date.now() < this._tokenExpiry) {
      return this._accessToken;
    }

    const credentials = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64');
    const response = await axios.post(
      `${this.collectionUrl}/token/`,
      {},
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'application/json',
        },
        timeout: 15_000,
      }
    );

    this._accessToken = response.data.access_token;
    // MTN tokens durent 3600s, on le renouvelle 60s avant
    this._tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    return this._accessToken;
  }

  async initiate({ reference, amount, phoneNumber, currency, description, callbackUrl }) {
    try {
      const token = await this._getAccessToken();

      // Normaliser le numéro (supprimer le +)
      const msisdn = phoneNumber.replace('+', '');

      await axios.post(
        `${this.collectionUrl}/v1_0/requesttopay`,
        {
          amount: amount.toString(),
          currency: currency || 'XOF',
          externalId: reference,
          payer: { partyIdType: 'MSISDN', partyId: msisdn },
          payerMessage: description || 'Paiement Marché Kora',
          payeeNote: `Commande ${reference}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Reference-Id': reference,
            'X-Target-Environment': this.targetEnvironment,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            'X-Callback-Url': callbackUrl || '',
            'Content-Type': 'application/json',
          },
          timeout: 30_000,
        }
      );

      // 202 Accepted = paiement initié, en attente de confirmation USSD
      return {
        success: true,
        externalReference: reference,
        message: 'Demande de paiement MTN MoMo envoyée. Validez sur votre téléphone.',
        rawResponse: { provider: 'mtn_momo', externalId: reference, status: 'INITIATED' },
      };
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 409) {
        return {
          success: false,
          message: 'Une transaction avec cette référence existe déjà (idempotency).',
          rawResponse: { provider: 'mtn_momo', ...data },
        };
      }

      return {
        success: false,
        message: `Erreur MTN MoMo : ${data?.message || err.message}`,
        rawResponse: { provider: 'mtn_momo', ...data },
      };
    }
  }

  async verifyStatus(reference) {
    try {
      const token = await this._getAccessToken();

      const response = await axios.get(
        `${this.collectionUrl}/v1_0/requesttopay/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Target-Environment': this.targetEnvironment,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          },
          timeout: 15_000,
        }
      );

      const data = response.data;
      const statusMap = {
        SUCCESSFUL: TRANSACTION_STATUS.SUCCESS,
        FAILED: TRANSACTION_STATUS.FAILED,
        REJECTED: TRANSACTION_STATUS.FAILED,
        TIMEOUT: TRANSACTION_STATUS.TIMEOUT,
        PENDING: TRANSACTION_STATUS.PENDING,
      };

      return {
        status: statusMap[data.status] || TRANSACTION_STATUS.PENDING,
        externalReference: data.financialTransactionId,
        rawResponse: {
          provider: 'mtn_momo',
          status: data.status,
          currency: data.currency,
          // NE PAS inclure data.payer (contient le numéro de téléphone)
          reason: data.reason,
        },
      };
    } catch (err) {
      return {
        status: TRANSACTION_STATUS.PENDING,
        rawResponse: { provider: 'mtn_momo', error: err.response?.status },
      };
    }
  }

  async handleWebhook(payload) {
    const statusMap = {
      SUCCESSFUL: TRANSACTION_STATUS.SUCCESS,
      FAILED: TRANSACTION_STATUS.FAILED,
      REJECTED: TRANSACTION_STATUS.FAILED,
      TIMEOUT: TRANSACTION_STATUS.TIMEOUT,
    };

    return {
      reference: payload.externalId || payload['X-Reference-Id'],
      status: statusMap[payload.status] || TRANSACTION_STATUS.PENDING,
      externalReference: payload.financialTransactionId,
      rawResponse: {
        provider: 'mtn_momo',
        status: payload.status,
        currency: payload.currency,
        reason: payload.reason,
      },
    };
  }
}

import axios from 'axios';
import { BasePaymentProvider } from './PaymentService.js';
import { TRANSACTION_STATUS } from '../../config/constants.js';

/**
 * MoovMoneyProvider — Intégration directe Moov Money / Flooz
 * Présence : Bénin (+229), Togo (+228), Côte d'Ivoire (+225), Burkina Faso (+226)
 *
 * Variables d'env requises :
 *   MOOV_MONEY_BASE_URL, MOOV_MONEY_API_KEY, MOOV_MONEY_SECRET, MOOV_MONEY_PARTNER_CODE
 */
export class MoovMoneyProvider extends BasePaymentProvider {
  constructor() {
    super();
    this.baseUrl = process.env.MOOV_MONEY_BASE_URL || 'https://api.moov-africa.com';
    this.apiKey = process.env.MOOV_MONEY_API_KEY;
    this.partnerCode = process.env.MOOV_MONEY_PARTNER_CODE;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30_000,
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': this.apiKey },
    });
  }

  async initiate({ reference, amount, currency, phoneNumber, description, callbackUrl }) {
    try {
      const msisdn = phoneNumber.replace('+', '');
      const response = await this.client.post('/api/v1/paymentRequest', {
        partnerCode: this.partnerCode,
        partnerTransactionId: reference,
        amount: amount.toString(),
        currency: currency || 'XOF',
        subscriberMsisdn: msisdn,
        description: description || 'Paiement Marché Kora',
        callbackUrl: callbackUrl || '',
      });
      const data = response.data;

      if (data.responseCode !== '0000' && data.responseCode !== '200') {
        return { success: false, message: data.responseMessage || 'Erreur Moov Money.',
          rawResponse: { provider: 'moov_money', responseCode: data.responseCode } };
      }
      return {
        success: true,
        externalReference: data.transactionId || data.referenceId,
        message: 'Paiement Moov Money initié. Validez sur votre téléphone.',
        rawResponse: { provider: 'moov_money', transactionId: data.transactionId, responseCode: data.responseCode },
      };
    } catch (err) {
      return { success: false, message: `Erreur Moov Money : ${err.response?.data?.responseMessage || err.message}`,
        rawResponse: { provider: 'moov_money', status: err.response?.status } };
    }
  }

  async verifyStatus(reference) {
    try {
      const response = await this.client.post('/api/v1/paymentStatus', {
        partnerCode: this.partnerCode, partnerTransactionId: reference,
      });
      const data = response.data;
      const statusMap = {
        'SUCCESS': TRANSACTION_STATUS.SUCCESS, 'SUCCESSFUL': TRANSACTION_STATUS.SUCCESS,
        '0000': TRANSACTION_STATUS.SUCCESS, 'FAILED': TRANSACTION_STATUS.FAILED,
        'REJECTED': TRANSACTION_STATUS.FAILED, 'CANCELLED': TRANSACTION_STATUS.CANCELLED,
        'PENDING': TRANSACTION_STATUS.PENDING, 'INITIATED': TRANSACTION_STATUS.PENDING,
      };
      const rawStatus = data.status || data.responseCode;
      return { status: statusMap[rawStatus] || TRANSACTION_STATUS.PENDING,
        externalReference: data.transactionId,
        rawResponse: { provider: 'moov_money', status: rawStatus } };
    } catch (err) {
      return { status: TRANSACTION_STATUS.PENDING,
        rawResponse: { provider: 'moov_money', error: err.response?.status } };
    }
  }

  async handleWebhook(payload) {
    const statusMap = {
      'SUCCESS': TRANSACTION_STATUS.SUCCESS, 'SUCCESSFUL': TRANSACTION_STATUS.SUCCESS,
      '0000': TRANSACTION_STATUS.SUCCESS, 'FAILED': TRANSACTION_STATUS.FAILED,
      'CANCELLED': TRANSACTION_STATUS.CANCELLED,
    };
    const rawStatus = payload.status || payload.responseCode;
    return {
      reference: payload.partnerTransactionId,
      status: statusMap[rawStatus] || TRANSACTION_STATUS.FAILED,
      externalReference: payload.transactionId,
      rawResponse: { provider: 'moov_money', status: rawStatus },
    };
  }
}

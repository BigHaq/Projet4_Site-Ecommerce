import axios from 'axios';
import { BasePaymentProvider } from './PaymentService.js';
import { TRANSACTION_STATUS } from '../../config/constants.js';

/**
 * CinetPayProvider — Agrégateur multi-opérateurs Afrique de l'Ouest
 *
 * Couvre : MTN MoMo, Moov Money/Flooz, Wave, Orange Money
 * API Doc : https://apidoc.cinetpay.com/
 * Dashboard : https://cinetpay.com/dashboard/api
 *
 * Variables d'env requises :
 *   CINETPAY_API_KEY   — Clé API CinetPay
 *   CINETPAY_SITE_ID   — Identifiant du site marchand
 *   CINETPAY_BASE_URL  — https://api-checkout.cinetpay.com/v2
 */
export class CinetPayProvider extends BasePaymentProvider {
  constructor() {
    super();
    this.apiKey = process.env.CINETPAY_API_KEY;
    this.siteId = process.env.CINETPAY_SITE_ID;
    this.baseUrl = process.env.CINETPAY_BASE_URL || 'https://api-checkout.cinetpay.com/v2';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30_000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async initiate({ reference, amount, currency, phoneNumber, operator, countryCode,
    description, customerName, customerEmail, callbackUrl, returnUrl }) {
    try {
      const payload = {
        apikey: this.apiKey,
        site_id: this.siteId,
        transaction_id: reference,
        amount: amount.toString(),
        currency: currency || 'XOF',
        alternative_currency: '',
        description: description || 'Paiement Marché Kora',
        customer_name: customerName || 'Client',
        customer_surname: '',
        customer_email: customerEmail || '',
        customer_phone_number: phoneNumber,
        customer_address: '',
        customer_city: '',
        customer_country: countryCode || 'CI',
        customer_state: countryCode || 'CI',
        customer_zip_code: '',
        notify_url: callbackUrl,
        return_url: returnUrl || '',
        channels: this._mapOperatorToChannel(operator),
        metadata: reference,
        lang: 'fr',
      };

      const response = await this.client.post('/payment', payload);
      const data = response.data;

      if (data.code !== '201') {
        return {
          success: false,
          message: data.message || 'Erreur lors de l\'initiation du paiement CinetPay.',
          rawResponse: this._sanitizeResponse(data),
        };
      }

      return {
        success: true,
        externalReference: data.data?.payment_token,
        paymentUrl: data.data?.payment_url,
        message: 'Paiement initié. Redirigez le client ou attendez la confirmation USSD.',
        rawResponse: this._sanitizeResponse(data),
      };
    } catch (err) {
      const errorData = err.response?.data;
      return {
        success: false,
        message: `Erreur CinetPay : ${errorData?.message || err.message}`,
        rawResponse: this._sanitizeResponse(errorData),
      };
    }
  }

  async verifyStatus(reference) {
    try {
      const payload = {
        apikey: this.apiKey,
        site_id: this.siteId,
        transaction_id: reference,
      };

      const response = await this.client.post('/payment/check', payload);
      const data = response.data;

      const statusMap = {
        'ACCEPTED': TRANSACTION_STATUS.SUCCESS,
        'REFUSED': TRANSACTION_STATUS.FAILED,
        'CANCELLED': TRANSACTION_STATUS.CANCELLED,
        'PENDING': TRANSACTION_STATUS.PENDING,
        'WAITING': TRANSACTION_STATUS.PENDING,
      };

      const status = statusMap[data.data?.status] || TRANSACTION_STATUS.PENDING;

      return {
        status,
        externalReference: data.data?.payment_token,
        rawResponse: this._sanitizeResponse(data),
      };
    } catch (err) {
      return {
        status: TRANSACTION_STATUS.PENDING,
        rawResponse: this._sanitizeResponse(err.response?.data),
      };
    }
  }

  async handleWebhook(payload) {
    const { cpm_trans_id, cpm_result, cpm_payment_id } = payload;

    const statusMap = {
      '00': TRANSACTION_STATUS.SUCCESS,
      'ACCEPTED': TRANSACTION_STATUS.SUCCESS,
      'REFUSED': TRANSACTION_STATUS.FAILED,
      'CANCELLED': TRANSACTION_STATUS.CANCELLED,
    };

    const status = statusMap[cpm_result] || TRANSACTION_STATUS.FAILED;

    return {
      reference: cpm_trans_id,
      status,
      externalReference: cpm_payment_id,
      rawResponse: this._sanitizeResponse(payload),
    };
  }

  _mapOperatorToChannel(operator) {
    const channels = {
      MTN: 'MOBILE_MONEY',
      MOOV: 'MOBILE_MONEY',
      WAVE: 'WAVE',
      ORANGE: 'MOBILE_MONEY',
    };
    return channels[operator] || 'ALL';
  }

  /** Supprime les données sensibles avant de stocker la réponse brute */
  _sanitizeResponse(data) {
    if (!data) return null;
    const sanitized = { ...data };
    delete sanitized.apikey;
    delete sanitized.site_id;
    return sanitized;
  }
}

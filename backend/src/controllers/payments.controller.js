import * as paymentsService from '../services/payments.service.js';

export async function initiatePayment(req, res, next) {
  try {
    const { orderId, provider, phoneNumber, countryCode, operator } = req.body;
    const result = await paymentsService.initiatePayment({
      orderId, userId: req.user.id, provider, phoneNumber, countryCode, operator,
    });
    return res.status(200).json({ success: true, message: result.message, data: result });
  } catch (err) { next(err); }
}

export async function handleCallback(req, res, next) {
  try {
    // Merge query params + body (certains providers envoient en GET)
    const payload = { ...req.query, ...req.body };
    const result = await paymentsService.handleCallback(payload);
    // Toujours répondre 200 pour que l'opérateur ne réessaie pas
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    // Log l'erreur sans exposer les détails à l'opérateur
    console.error('[Webhook Error]', err.code || err.message);
    return res.status(200).json({ success: false, message: 'Webhook reçu avec erreur.' });
  }
}

export async function checkStatus(req, res, next) {
  try {
    const transaction = await paymentsService.checkPaymentStatus(req.params.ref, req.user.id);
    return res.status(200).json({ success: true, data: { transaction } });
  } catch (err) { next(err); }
}

export async function getHistory(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await paymentsService.getPaymentHistory(req.user.id, {
      page: parseInt(page), limit: parseInt(limit),
    });
    return res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
}

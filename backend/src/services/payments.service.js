import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { getProvider } from './payments/index.js';
import { generateTransactionReference } from '../utils/transactionRef.js';
import { validatePhone } from '../utils/phoneValidator.js';
import { TRANSACTION_STATUS, USSD_TIMEOUT_MS } from '../config/constants.js';

/**
 * Initie un paiement Mobile Money
 */
export async function initiatePayment({ orderId, userId, provider, phoneNumber, countryCode, operator }) {
  // Valider le numéro de téléphone
  const phoneValidation = validatePhone(phoneNumber, countryCode);
  if (!phoneValidation.valid) {
    throw new AppError(phoneValidation.error, 400, 'INVALID_PHONE');
  }

  // Vérifier la commande
  const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
  if (!order) throw new AppError('Commande introuvable.', 404, 'ORDER_NOT_FOUND');
  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    throw new AppError('Cette commande ne peut plus être payée.', 400, 'ORDER_NOT_PAYABLE');
  }

  // Vérifier qu'il n'y a pas déjà un paiement SUCCESS
  const existingSuccess = await prisma.transaction.findFirst({
    where: { orderId, status: TRANSACTION_STATUS.SUCCESS },
  });
  if (existingSuccess) {
    throw new AppError('Cette commande est déjà payée.', 409, 'ALREADY_PAID');
  }

  // Générer une référence unique (idempotency key)
  const reference = generateTransactionReference();
  const callbackUrl = `${process.env.WEBHOOK_BASE_URL || 'http://localhost:3001'}/api/payments/callback`;

  // Récupérer les infos utilisateur pour le provider
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true },
  });

  // Obtenir le bon provider (Strategy Pattern)
  const paymentProvider = getProvider(provider);

  const result = await paymentProvider.initiate({
    reference,
    amount: order.totalAmount,
    currency: 'XOF',
    phoneNumber,
    operator: operator || 'MTN',
    countryCode,
    description: `Commande Marché Kora #${orderId.slice(0, 8)}`,
    customerName: `${user.firstName} ${user.lastName}`,
    customerEmail: user.email,
    callbackUrl,
    returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-confirmation/${orderId}`,
  });

  // Créer la transaction en base (PENDING)
  const transaction = await prisma.transaction.create({
    data: {
      orderId,
      userId,
      provider,
      phoneNumber, // Stocké en E.164 — ne jamais logger
      amount: order.totalAmount,
      currency: 'XOF',
      reference,
      externalReference: result.externalReference || null,
      status: result.success ? TRANSACTION_STATUS.PENDING : TRANSACTION_STATUS.FAILED,
      rawResponse: result.rawResponse ? JSON.stringify(result.rawResponse) : null,
      metadata: JSON.stringify({ operator: operator || null, countryCode }),
    },
  });

  if (!result.success) {
    throw new AppError(result.message || 'Échec de l\'initiation du paiement.', 502, 'PAYMENT_INITIATION_FAILED');
  }

  return {
    transaction: {
      id: transaction.id,
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      provider: transaction.provider,
      initiatedAt: transaction.initiatedAt,
    },
    message: result.message,
    paymentUrl: result.paymentUrl || null,
    ussdTimeout: USSD_TIMEOUT_MS,
  };
}

/**
 * Traite un webhook de confirmation d'opérateur
 * Route publique (pas d'auth) — vérification de la signature si disponible
 */
export async function handleCallback(payload) {
  // Déterminer le provider depuis le payload ou l'en-tête
  const providerName = payload.provider || process.env.PAYMENT_MODE || 'simulation';
  const paymentProvider = getProvider(providerName);

  const webhookResult = await paymentProvider.handleWebhook(payload);
  const { reference, status, externalReference, rawResponse } = webhookResult;

  if (!reference) {
    throw new AppError('Référence de transaction manquante dans le webhook.', 400, 'MISSING_REFERENCE');
  }

  // Mettre à jour la transaction
  const transaction = await prisma.transaction.findUnique({ where: { reference } });
  if (!transaction) return { ignored: true, reason: 'unknown_reference' };

  // Idempotence : ne pas retraiter une transaction déjà terminée
  if (transaction.status === TRANSACTION_STATUS.SUCCESS || transaction.status === TRANSACTION_STATUS.FAILED) {
    return { ignored: true, reason: 'already_processed', status: transaction.status };
  }

  const updatedTransaction = await prisma.transaction.update({
    where: { reference },
    data: {
      status,
      externalReference: externalReference || transaction.externalReference,
      confirmedAt: [TRANSACTION_STATUS.SUCCESS, TRANSACTION_STATUS.FAILED].includes(status) ? new Date() : null,
      rawResponse: rawResponse ? JSON.stringify(rawResponse) : transaction.rawResponse,
    },
  });

  // Si succès : confirmer la commande
  if (status === TRANSACTION_STATUS.SUCCESS) {
    await prisma.order.update({
      where: { id: transaction.orderId },
      data: { status: 'CONFIRMED' },
    });
  }

  return { processed: true, reference, status };
}

/**
 * Vérifie le statut d'une transaction (polling côté client)
 */
export async function checkPaymentStatus(reference, userId) {
  const transaction = await prisma.transaction.findFirst({
    where: { reference, userId },
    select: {
      id: true, reference: true, status: true, amount: true,
      currency: true, provider: true, initiatedAt: true, confirmedAt: true,
      orderId: true,
    },
  });
  if (!transaction) throw new AppError('Transaction introuvable.', 404, 'TRANSACTION_NOT_FOUND');

  // Si toujours PENDING, interroger le provider pour avoir le statut réel
  if (transaction.status === TRANSACTION_STATUS.PENDING) {
    const paymentProvider = getProvider(transaction.provider);
    const fresh = await paymentProvider.verifyStatus(reference);

    if (fresh.status !== TRANSACTION_STATUS.PENDING) {
      // Mettre à jour en base
      await prisma.transaction.update({
        where: { reference },
        data: {
          status: fresh.status,
          externalReference: fresh.externalReference || undefined,
          confirmedAt: new Date(),
          rawResponse: fresh.rawResponse ? JSON.stringify(fresh.rawResponse) : undefined,
        },
      });
      if (fresh.status === TRANSACTION_STATUS.SUCCESS) {
        await prisma.order.update({ where: { id: transaction.orderId }, data: { status: 'CONFIRMED' } });
      }
      return { ...transaction, status: fresh.status };
    }
  }

  return transaction;
}

/**
 * Historique des transactions d'un utilisateur
 */
export async function getPaymentHistory(userId, { page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { initiatedAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true, reference: true, status: true, amount: true,
        currency: true, provider: true, initiatedAt: true, confirmedAt: true,
        orderId: true, metadata: true,
        // NE PAS inclure phoneNumber dans la liste
      },
    }),
    prisma.transaction.count({ where: { userId } }),
  ]);

  return { transactions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

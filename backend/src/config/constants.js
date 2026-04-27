/**
 * Constantes globales de l'application Marché Kora
 * Toutes les valeurs configurables passent par ce fichier
 */

// ── Statuts de commande ───────────────────────────────────────
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

// ── Statuts de transaction paiement ──────────────────────────
export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  TIMEOUT: 'TIMEOUT',
};

// ── Providers de paiement ────────────────────────────────────
export const PAYMENT_PROVIDERS = {
  CINETPAY: 'cinetpay',
  MTN_MOMO: 'mtn_momo',
  MOOV_MONEY: 'moov_money',
  SIMULATION: 'simulation',
};

// ── Opérateurs Mobile Money (pour l'UI) ──────────────────────
export const MOBILE_MONEY_OPERATORS = {
  MTN: {
    code: 'MTN',
    name: 'MTN MoMo',
    color: '#FFCC00',
    textColor: '#000000',
    countries: ['BJ', 'CI', 'GH', 'SN'],
  },
  MOOV: {
    code: 'MOOV',
    name: 'Moov Money',
    color: '#0066CC',
    textColor: '#FFFFFF',
    countries: ['BJ', 'CI', 'TG', 'BF'],
  },
  WAVE: {
    code: 'WAVE',
    name: 'Wave',
    color: '#1BA9FF',
    textColor: '#FFFFFF',
    countries: ['SN', 'CI', 'ML', 'BF'],
  },
  ORANGE: {
    code: 'ORANGE',
    name: 'Orange Money',
    color: '#FF6600',
    textColor: '#FFFFFF',
    countries: ['CI', 'SN', 'ML', 'BF'],
  },
};

// ── Pays supportés avec indicatifs téléphoniques ─────────────
export const SUPPORTED_COUNTRIES = {
  BJ: { name: 'Bénin', dialCode: '+229', flag: '🇧🇯', currency: 'XOF' },
  CI: { name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮', currency: 'XOF' },
  SN: { name: 'Sénégal', dialCode: '+221', flag: '🇸🇳', currency: 'XOF' },
  TG: { name: 'Togo', dialCode: '+228', flag: '🇹🇬', currency: 'XOF' },
  GH: { name: 'Ghana', dialCode: '+233', flag: '🇬🇭', currency: 'GHS' },
  BF: { name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫', currency: 'XOF' },
  ML: { name: 'Mali', dialCode: '+223', flag: '🇲🇱', currency: 'XOF' },
  NE: { name: 'Niger', dialCode: '+227', flag: '🇳🇪', currency: 'XOF' },
};

// ── Devise ────────────────────────────────────────────────────
export const CURRENCY = {
  code: 'XOF',
  label: 'FCFA',
  locale: 'fr-FR',
  minimumFractionDigits: 0,
};

// ── Rôles utilisateur ────────────────────────────────────────
export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
};

// ── Limites de rate limiting ──────────────────────────────────
export const RATE_LIMITS = {
  AUTH: { windowMs: 15 * 60 * 1000, max: 10 }, // 10 tentatives / 15min
  API: { windowMs: 15 * 60 * 1000, max: 300 },  // 300 req / 15min
  PAYMENT: { windowMs: 60 * 1000, max: 5 },      // 5 tentatives / min
};

// ── Timeout USSD (en ms) ──────────────────────────────────────
export const USSD_TIMEOUT_MS = 120_000; // 120 secondes

// ── Pagination par défaut ─────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
};

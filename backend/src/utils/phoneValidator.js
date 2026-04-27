import { SUPPORTED_COUNTRIES } from '../config/constants.js';

/**
 * Patterns de validation de numéros de téléphone par pays
 * Format E.164 : +[indicatif][numéro local]
 */
const PHONE_PATTERNS = {
  BJ: /^\+229[0-9]{8}$/,        // Bénin : +229 XX XX XX XX
  CI: /^\+225[0-9]{10}$/,       // Côte d'Ivoire : +225 XX XX XX XX XX
  SN: /^\+221[0-9]{9}$/,        // Sénégal : +221 XX XXX XX XX
  TG: /^\+228[0-9]{8}$/,        // Togo : +228 XX XX XX XX
  GH: /^\+233[0-9]{9}$/,        // Ghana : +233 XX XXX XXXX
  BF: /^\+226[0-9]{8}$/,        // Burkina Faso : +226 XX XX XX XX
  ML: /^\+223[0-9]{8}$/,        // Mali : +223 XX XX XX XX
  NE: /^\+227[0-9]{8}$/,        // Niger : +227 XX XX XX XX
};

/**
 * Valide un numéro de téléphone au format E.164 pour un pays donné
 * @param {string} phone - Numéro au format E.164 (ex: +22967123456)
 * @param {string} countryCode - Code ISO du pays (ex: BJ, CI, SN)
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePhone(phone, countryCode) {
  if (!phone) {
    return { valid: false, error: 'Numéro de téléphone requis.' };
  }

  const normalized = phone.trim().replace(/\s/g, '');

  if (!normalized.startsWith('+')) {
    return {
      valid: false,
      error: 'Le numéro doit être au format international (commencer par +).',
    };
  }

  const pattern = PHONE_PATTERNS[countryCode];
  if (!pattern) {
    return { valid: false, error: `Pays non supporté : ${countryCode}` };
  }

  if (!pattern.test(normalized)) {
    const country = SUPPORTED_COUNTRIES[countryCode];
    return {
      valid: false,
      error: `Format invalide pour ${country?.name || countryCode}. Exemple : ${country?.dialCode}XXXXXXXX`,
    };
  }

  return { valid: true };
}

/**
 * Normalise un numéro local en format E.164
 * Exemple : "67123456" + "BJ" → "+22967123456"
 */
export function normalizeToE164(localNumber, countryCode) {
  const country = SUPPORTED_COUNTRIES[countryCode];
  if (!country) throw new Error(`Pays non supporté : ${countryCode}`);

  const stripped = localNumber.replace(/[\s\-()]/g, '');

  // Déjà au format E.164
  if (stripped.startsWith('+')) return stripped;

  // Commence par 00 → remplacer par +
  if (stripped.startsWith('00')) {
    return `+${stripped.slice(2)}`;
  }

  // Numéro local → ajouter l'indicatif
  return `${country.dialCode}${stripped}`;
}

/**
 * Masque un numéro de téléphone pour les logs (jamais logguer en clair)
 * Exemple : +22967123456 → +229 67***456
 */
export function maskPhone(phone) {
  if (!phone || phone.length < 6) return '***';
  const visible = phone.slice(0, 6);
  const end = phone.slice(-3);
  return `${visible}***${end}`;
}

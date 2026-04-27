import { v4 as uuidv4 } from 'uuid';

/**
 * Génère une référence de transaction unique
 * Format : MK-YYYYMMDD-XXXXXXXXXXXX (uppercase hex)
 * Exemple : MK-20240427-A3F2B1C4D5E6
 *
 * Sert d'idempotency key — une seule transaction par référence
 */
export function generateTransactionReference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const unique = uuidv4().replace(/-/g, '').toUpperCase().slice(0, 12);
  return `MK-${date}-${unique}`;
}

/**
 * Génère un UUID standard v4
 */
export function generateUUID() {
  return uuidv4();
}

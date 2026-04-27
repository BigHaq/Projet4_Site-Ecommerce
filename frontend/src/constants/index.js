// Opérateurs Mobile Money avec identité visuelle officielle
export const OPERATORS = [
  {
    code: 'MTN',
    name: 'MTN MoMo',
    color: '#FFCC00',
    textColor: '#000000',
    bgClass: 'bg-yellow-400',
    description: 'Disponible au Bénin, Côte d\'Ivoire, Ghana',
    countries: ['BJ', 'CI', 'GH'],
  },
  {
    code: 'MOOV',
    name: 'Moov Money',
    color: '#0066CC',
    textColor: '#FFFFFF',
    bgClass: 'bg-blue-600',
    description: 'Disponible au Bénin, Togo, Côte d\'Ivoire',
    countries: ['BJ', 'TG', 'CI'],
  },
  {
    code: 'WAVE',
    name: 'Wave',
    color: '#1BA9FF',
    textColor: '#FFFFFF',
    bgClass: 'bg-sky-400',
    description: 'Disponible au Sénégal, Côte d\'Ivoire',
    countries: ['SN', 'CI'],
  },
  {
    code: 'ORANGE',
    name: 'Orange Money',
    color: '#FF6600',
    textColor: '#FFFFFF',
    bgClass: 'bg-orange-500',
    description: 'Disponible en Côte d\'Ivoire, Sénégal, Mali',
    countries: ['CI', 'SN', 'ML'],
  },
];

export const COUNTRIES = [
  { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯' },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮' },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫' },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱' },
];

export const ORDER_STATUS_LABELS = {
  PENDING: { label: 'En attente', color: 'text-yellow-600 bg-yellow-50' },
  CONFIRMED: { label: 'Confirmée', color: 'text-blue-600 bg-blue-50' },
  PROCESSING: { label: 'En traitement', color: 'text-purple-600 bg-purple-50' },
  SHIPPED: { label: 'Expédiée', color: 'text-indigo-600 bg-indigo-50' },
  DELIVERED: { label: 'Livrée', color: 'text-green-700 bg-green-50' },
  CANCELLED: { label: 'Annulée', color: 'text-red-600 bg-red-50' },
};

export const TRANSACTION_STATUS_LABELS = {
  PENDING: { label: 'En attente', color: 'text-yellow-600' },
  SUCCESS: { label: 'Réussie', color: 'text-green-700' },
  FAILED: { label: 'Échouée', color: 'text-red-600' },
  CANCELLED: { label: 'Annulée', color: 'text-gray-500' },
  TIMEOUT: { label: 'Expirée', color: 'text-orange-600' },
};

export const PROVIDER_LABELS = {
  cinetpay: 'CinetPay',
  mtn_momo: 'MTN MoMo',
  moov_money: 'Moov Money',
  simulation: 'Simulation Dev',
};

// Affichage des montants en FCFA (jamais de virgule float)
export function formatFCFA(amount) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'rating', label: 'Mieux notés' },
];

export const USSD_TIMEOUT_SECONDS = 120;
export const PAYMENT_POLLING_INTERVAL_MS = 3000;

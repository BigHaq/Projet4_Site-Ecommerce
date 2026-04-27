# 🪘 Marché Kora — E-Commerce Afrique de l'Ouest

> Plateforme e-commerce production-ready pour le marché ouest-africain avec paiement Mobile Money intégré (MTN MoMo, Moov Money, Wave, Orange Money).

---

## ✨ Features

- **Frontend** : React 18 + Vite + Tailwind CSS (palette Sahel Doré)
- **Backend** : Node.js + Express.js (ESM)
- **Base de données** : PostgreSQL via Prisma ORM
- **Paiement** : Pattern Strategy — CinetPay, MTN MoMo, Moov Money + Mode Simulation
- **Auth** : JWT avec refresh token rotation
- **UI** : Framer Motion, Zustand, React Hook Form, lazy-loading

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js ≥ 18
- Docker Desktop (pour PostgreSQL)
- Git

### 1. Cloner et configurer

```bash
git clone <repo>
cd Projet4_Site-Ecommerce

# Copier la configuration backend
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos valeurs (DB, JWT secrets, etc.)
```

### 2. Lancer la base de données

```bash
docker-compose up -d
# PostgreSQL : localhost:5432
# pgAdmin   : http://localhost:5050
```

### 3. Backend

```bash
cd backend
npm install

# Générer le client Prisma + migrer la BDD
npm run db:generate
npm run db:migrate

# Peupler avec les données de test (12 produits, 2 users)
npm run db:seed

# Démarrer en développement
npm run dev
# → http://localhost:3001
# → http://localhost:3001/health
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 🔑 Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@marchekora.com | Kora2024! |
| Client | client@marchekora.com | Kora2024! |

---

## 💳 Paiement en mode simulation

Par défaut, `PAYMENT_MODE=simulation` dans `.env`.

- Taux de succès : 85% (configurable via `SIMULATION_SUCCESS_RATE`)
- Délai de confirmation : 10s (configurable via `SIMULATION_DELAY_MS`)
- Aucune clé API requise pour tester le flux complet

### Flux de paiement simulé

```
1. Client choisit un opérateur + numéro de téléphone
2. POST /api/payments/initiate → Transaction créée (PENDING)
3. Page UssdWaiting s'affiche avec countdown 120s
4. Après ~10s, le SimulationProvider résout la transaction
5. Polling /api/payments/status/:ref détecte le changement
6. Redirect automatique vers /order-confirmation/:orderId
```

---

## 🗂️ Structure du projet

```
Projet4_Site-Ecommerce/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      ← Source de vérité BDD
│   │   └── seed.js            ← 12 produits + 2 users
│   └── src/
│       ├── config/            ← constants.js, database.js
│       ├── middleware/        ← auth, errorHandler, validate
│       ├── routes/            ← auth, products, cart, orders, payments, users
│       ├── controllers/       ← Couche HTTP fine
│       ├── services/
│       │   ├── payments/      ← Pattern Strategy
│       │   │   ├── PaymentService.js     ← Interface abstraite
│       │   │   ├── CinetPayProvider.js   ← Agrégateur multi-opérateurs
│       │   │   ├── MtnMomoProvider.js    ← Direct MTN API
│       │   │   ├── MoovMoneyProvider.js  ← Direct Moov API
│       │   │   ├── SimulationProvider.js ← Dev sans clés API
│       │   │   └── index.js              ← Factory singleton
│       │   ├── auth.service.js
│       │   ├── cart.service.js
│       │   ├── orders.service.js
│       │   ├── payments.service.js
│       │   ├── products.service.js
│       │   └── users.service.js
│       └── utils/             ← jwt, phoneValidator, transactionRef
├── frontend/
│   └── src/
│       ├── api/               ← auth, cart, orders, payments, products, users
│       ├── components/
│       │   ├── cart/          ← CartSidebar
│       │   ├── layout/        ← Navbar, Footer, Breadcrumb
│       │   ├── payment/       ← OperatorSelector, PhoneInput, UssdWaiting, PaymentSuccess
│       │   ├── product/       ← ProductCard, ProductGallery
│       │   ├── routing/       ← ProtectedRoute, GuestRoute
│       │   └── ui/            ← Toast, Spinner, Skeleton, StarRating, Modal
│       ├── hooks/             ← useAuth, useCart, usePayment, useProducts, useToast
│       ├── pages/             ← Home, Catalogue, ProductDetail, Checkout,
│       │                         PaymentWaiting, OrderConfirmation, Auth, Dashboard, NotFound
│       └── store/             ← authStore, cartStore, paymentStore
└── docker-compose.yml
```

---

## 🌍 Opérateurs Mobile Money supportés

| Opérateur | Pays | Provider |
|-----------|------|---------|
| MTN MoMo | BJ, CI, GH, SN | Direct API / CinetPay |
| Moov Money | BJ, TG, CI, BF | Direct API / CinetPay |
| Wave | SN, CI, ML, BF | CinetPay |
| Orange Money | CI, SN, ML, BF | CinetPay |

---

## 🔐 Variables d'environnement clés

```env
# Mode paiement (simulation | cinetpay | mtn_momo | moov_money)
PAYMENT_MODE=simulation

# Simulation
SIMULATION_DELAY_MS=10000
SIMULATION_SUCCESS_RATE=0.85

# Production CinetPay
CINETPAY_API_KEY=xxx
CINETPAY_SITE_ID=xxx

# MTN MoMo direct
MTN_MOMO_SUBSCRIPTION_KEY=xxx
MTN_MOMO_API_USER=xxx
MTN_MOMO_API_KEY=xxx
```

---

## 📡 API Endpoints principaux

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |
| GET | /api/products | Liste produits (filtres, pagination) |
| GET | /api/products/:id | Détail produit |
| POST | /api/cart/items | Ajouter au panier |
| POST | /api/orders | Créer commande depuis le panier |
| POST | /api/payments/initiate | Initier paiement Mobile Money |
| GET | /api/payments/status/:ref | Vérifier statut paiement (polling) |
| POST | /api/payments/callback | Webhook opérateur (public) |

---

## 🧪 Tests & Qualité

```bash
# Vérifier l'API
curl http://localhost:3001/health

# Explorer la BDD
npm run db:studio  # → http://localhost:5555

# Reset complet
npm run db:reset
```

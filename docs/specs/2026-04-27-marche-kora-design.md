# Spec Design — Marché Kora E-Commerce

**Date** : 2026-04-27  
**Statut** : Validé — Phase Brainstorming

## Identité

- **Nom** : Marché Kora
- **Tagline** : "Le meilleur de l'Afrique de l'Ouest, livré chez vous"
- **Niche** : Mode & Lifestyle Afrique de l'Ouest
- **Marché cible** : Bénin, Côte d'Ivoire, Sénégal, Togo
- **Devise** : XOF (Franc CFA) — toujours en entiers

## Stack Technique

- **Frontend** : React 18 + Vite + TailwindCSS + Zustand + Framer Motion
- **Backend** : Node.js 20 + Express 5 + Prisma ORM
- **Base de données** : PostgreSQL 15
- **Auth** : JWT (access 15min + refresh 7j, httpOnly cookies)
- **Paiements** : CinetPay (primaire) + MTN MoMo Direct + Moov Money + SimulationProvider

## Palette "Sahel Doré"

| Token | Hex | Usage |
|---|---|---|
| --color-primary | #C97B2A | CTA, liens actifs, accents |
| --color-primary-dark | #8B4E0E | Hover états |
| --color-accent | #1A6B4A | Tags succès, badges |
| --color-bg | #FAF7F2 | Background global |
| --color-surface | #FFFFFF | Cards, modals |
| --color-text | #1C1917 | Corps de texte |
| --color-muted | #78716C | Textes secondaires |
| --color-error | #DC2626 | Erreurs |
| --color-success | #16A34A | Confirmations |

## Typographie

- **Display** : Playfair Display (700, 800)
- **Body** : DM Sans (400, 500, 600)
- **Mono** : JetBrains Mono (400)

## Architecture Paiements

Pattern Strategy avec interface commune :
- `CinetPayProvider` — Multi-opérateurs (MTN + Moov + Wave + Orange)
- `MtnMomoProvider` — Direct MTN sandbox
- `MoovMoneyProvider` — Direct Moov
- `SimulationProvider` — Mode dev, délais réalistes 8-15s

## Pages Frontend

1. Home (Hero + Featured + Promo + Newsletter)
2. Catalogue (Filtres + Tri + Pagination)
3. Produit Détail (Galerie + Variantes + Reviews + CTA)
4. Panier (Sidebar + Quantités)
5. Checkout (Livraison + Sélection MoMo)
6. Attente USSD (Countdown 120s + Animation pulse)
7. Confirmation commande
8. Auth (Login / Register)
9. Dashboard utilisateur
10. 404 personnalisée

# 🏪 Alami Gestion - Application de Gestion Commerciale

[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](https://github.com/youssef10278/alami_gestion)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.3-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Application web moderne et complète de gestion commerciale pour petites et moyennes entreprises, développée avec Next.js 15, TypeScript, Prisma et PostgreSQL. **Design premium avec 9 pages transformées** et **fonctionnalité client de passage**.

## ✨ Fonctionnalités Principales

### 📦 **Gestion des Produits**
- ✅ CRUD complet avec images optimisées
- ✅ Catégorisation et SKU
- ✅ Gestion du stock en temps réel
- ✅ Prix d'achat et de vente
- ✅ **Calcul automatique des marges** avec code couleur
- ✅ Alertes de stock faible
- ✅ **Vue grille et tableau** avec toggle
- ✅ **Tri avancé** (6 options) et filtrage
- ✅ **Pagination** configurable
- ✅ **Actions rapides** (vendre, ajouter stock, copier SKU)

### 👥 **Gestion des Clients**
- ✅ Profils clients détaillés
- ✅ Gestion du crédit avec limites
- ✅ Historique des achats
- ✅ **Clients de passage** (NOUVEAU !)
- ✅ Blocage/déblocage
- ✅ Statistiques par client

### 🛒 **Gestion des Ventes**
- ✅ Interface de vente rapide
- ✅ **Scanner de codes-barres** avec détection automatique
- ✅ **Ventes au comptant et à crédit**
- ✅ **Support client de passage** (sans enregistrement)
- ✅ Multiples modes de paiement (Espèces, Carte, Virement, Crédit)
- ✅ Génération automatique de documents
- ✅ Historique complet avec filtres

### 💳 **Gestion du Crédit**
- ✅ Suivi des crédits clients
- ✅ Paiements partiels
- ✅ Historique des paiements
- ✅ Alertes de dépassement
- ✅ Rapports de crédit détaillés

### 📊 **Tableau de Bord**
- ✅ Statistiques en temps réel
- ✅ Graphiques interactifs (Recharts)
- ✅ Indicateurs de performance
- ✅ Ventes récentes
- ✅ Alertes de stock
- ✅ **Suivi des bénéfices** avec prix d'achat

### 📄 **Documents Commerciaux**
- ✅ Factures professionnelles
- ✅ Devis
- ✅ Bons de livraison
- ✅ Génération PDF (jsPDF)
- ✅ Téléchargement et aperçu

### 📈 **Rapports et Statistiques**
- ✅ Rapports de ventes par période
- ✅ Analyse des produits top
- ✅ Performance des clients
- ✅ Évolution du stock
- ✅ Graphiques personnalisables

### 🎨 **Design Premium**
- ✅ **9 pages avec design unique** (dégradés personnalisés)
- ✅ Glassmorphism et animations fluides
- ✅ Cartes de stats animées
- ✅ Emojis contextuels
- ✅ Code couleur intelligent
- ✅ **Score Design : 10/10** 🌟

### 📱 **PWA et Mobile**
- ✅ Installation sur écran d'accueil
- ✅ Mode standalone
- ✅ Mobile-first optimisé
- ✅ Raccourcis rapides

### ⚡ **Performance**
- ✅ Compression d'images automatique
- ✅ Cache API intelligent
- ✅ Debouncing sur recherches
- ✅ Lazy loading
- ✅ Optimisations Tailwind CSS v4

## 🚀 Installation

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Étapes d'installation

1. **Cloner le projet** (déjà fait)

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer la base de données**

Créez une base de données PostgreSQL :
```sql
CREATE DATABASE alami_db;
```

Mettez à jour le fichier `.env` avec vos informations de connexion :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/alami_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Initialiser la base de données**
```bash
npm run db:push
npm run db:seed
```

5. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📱 Scanner de Code-Barres Intelligent

L'application intègre un **système de détection automatique** qui supporte **3 méthodes** de scan :

### 1. 🔌 Scanner Physique (USB/Bluetooth) - **DÉTECTION AUTOMATIQUE** ✨
- ✅ Branchez et scannez - aucune configuration
- ✅ Détection automatique ultra-rapide (< 0.5s)
- ✅ Idéal pour caisse fixe et volume élevé
- ✅ Compatible avec tous les scanners USB/Bluetooth

### 2. 📱 Caméra du Téléphone
- ✅ Cliquez sur "Scanner" pour utiliser la caméra
- ✅ Pas besoin d'équipement supplémentaire
- ✅ Parfait pour vente mobile
- ✅ Supporte QR codes aussi

### 3. ⌨️ Saisie Manuelle
- ✅ Tapez directement le code-barres
- ✅ Toujours disponible en backup

### Formats supportés
- **1D** : EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, ITF, Codabar
- **2D** : QR Code, Data Matrix

### Avantages
- 🎯 **Flexibilité totale** - Utilisez n'importe quelle méthode
- ⚡ **Ultra-rapide** - Détection automatique instantanée
- 💰 **Économique** - Commencez avec un téléphone, ajoutez un scanner plus tard
- 🎨 **Intelligent** - Détecte automatiquement le type de scan

📖 **[Documentation complète](docs/AUTO_BARCODE_DETECTION.md)**

## 🔑 Identifiants de Test

Après le seed, vous pouvez vous connecter avec :

**Compte Propriétaire :**
- Email : `admin@alami.com`
- Mot de passe : `admin123`
- Accès : Toutes les fonctionnalités

**Compte Vendeur :**
- Email : `vendeur@alami.com`
- Mot de passe : `vendeur123`
- Accès : Ventes, Produits, Clients (lecture seule)

## 📁 Structure du projet

```
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # Routes API
│   ├── dashboard/         # Pages du dashboard
│   └── login/             # Page de connexion
├── components/            # Composants React
│   ├── ui/               # Composants UI (shadcn)
│   └── dashboard/        # Composants du dashboard
├── lib/                   # Utilitaires
│   ├── auth.ts           # Fonctions d'authentification
│   ├── prisma.ts         # Client Prisma
│   └── utils.ts          # Utilitaires généraux
├── prisma/               # Configuration Prisma
│   └── schema.prisma     # Schéma de base de données
└── scripts/              # Scripts utilitaires
    └── seed.ts           # Script de seed

```

## 🛠️ Scripts disponibles

- `npm run dev` - Lancer le serveur de développement
- `npm run build` - Build de production
- `npm run start` - Lancer le serveur de production
- `npm run db:push` - Synchroniser le schéma Prisma avec la DB
- `npm run db:seed` - Remplir la DB avec des données de test
- `npm run db:studio` - Ouvrir Prisma Studio

## 🎨 Technologies utilisées

- **Frontend:** Next.js 15.5.4, React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL, Prisma ORM
- **Auth:** JWT avec jose, bcryptjs
- **Charts:** Recharts
- **PDF:** jsPDF, jspdf-autotable
- **Scanner:** html5-qrcode
- **Notifications:** Sonner
- **Icons:** Lucide React

## 📊 Modèle de données

- **User** - Utilisateurs (Propriétaire/Vendeur)
- **Product** - Produits avec stock
- **Category** - Catégories de produits
- **Customer** - Clients avec crédit
- **Sale** - Ventes avec items
- **SaleItem** - Lignes de vente
- **StockMovement** - Mouvements de stock
- **CreditPayment** - Paiements de crédit
- **Document** - Documents commerciaux

## 🔒 Sécurité

- Authentification JWT avec cookies httpOnly
- Mots de passe hashés avec bcryptjs
- Protection CSRF
- Validation des données avec Zod
- Middleware de protection des routes
- Gestion des rôles (RBAC)

## 📱 PWA (Progressive Web App)

L'application est optimisée en PWA pour permettre aux vendeurs de :
- ✅ Installer l'app sur leur téléphone
- ✅ Accès rapide depuis l'écran d'accueil
- ✅ Mode standalone (sans barre d'adresse)
- ✅ Raccourcis rapides vers Ventes et Produits
- 🔄 Mode hors-ligne (en développement)

## 🤝 Contribution

Ce projet est en développement actif. Les contributions sont les bienvenues !

## 📄 Licence

Propriétaire - Tous droits réservés

# 🏢 Alami Gestion - Application de Gestion d'Entreprise

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

Application complète de gestion d'entreprise avec Next.js 15, Prisma, PostgreSQL et design premium bleu clair. Optimisée pour mobile avec support PWA et **scanner de code-barres intégré**.

## ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** avec JWT et cookies httpOnly
- 👥 **Gestion des utilisateurs** (Propriétaire & Vendeur)
- 📦 **Gestion des produits** avec catégories, stock et **photos** 📸
- 📱 **Scanner de code-barres** avec détection automatique (NOUVEAU !)
- 🛒 **Gestion des ventes** rapide et intuitive
- 💳 **Système de crédit** avec plafonds et suivi
- 👤 **Gestion des clients** complète
- 📊 **Gestion du stock** avec alertes et statistiques
- 📄 **Documents commerciaux** (Factures, Devis, Bons de livraison)
- 📈 **Tableau de bord** avec KPI et graphiques interactifs
- 🎨 **Design premium** avec glassmorphism et animations
- 📱 **PWA** - Installation sur écran d'accueil
- 🌐 **Mobile-first** optimisé pour les vendeurs
- ⚡ **Performance optimisée** - Compression d'images, cache, debouncing

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

## 🔑 Identifiants de test

Après le seed, vous pouvez vous connecter avec :

**Propriétaire :**
- Email: `owner@alami.com`
- Mot de passe: `admin123`

**Vendeur :**
- Email: `seller@alami.com`
- Mot de passe: `seller123`

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

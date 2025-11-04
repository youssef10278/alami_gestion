# 💸 Gestion des Dépenses

## Vue d'ensemble

Le module de gestion des dépenses permet de suivre et d'analyser toutes les dépenses de l'entreprise. Il offre une vue complète des coûts opérationnels avec des statistiques détaillées et des rapports par catégorie.

## Fonctionnalités

### 📊 Tableau de Bord des Dépenses

- **Statistiques en temps réel**
  - Total des dépenses (période configurable)
  - Nombre de dépenses enregistrées
  - Comparaison avec le mois précédent
  - Nombre de catégories actives

- **Visualisations**
  - Répartition par catégorie avec graphiques
  - Pourcentages et montants détaillés
  - Barres de progression colorées

### 📝 Gestion des Dépenses

#### Création d'une dépense
- Montant (DH)
- Description détaillée
- Date de la dépense
- Catégorie (obligatoire)
- Mode de paiement (Espèces, Carte, Virement, Chèque)
- Référence (numéro de facture, reçu, etc.)
- Upload de reçu/facture (image via Cloudinary)
- Notes additionnelles

#### Modification et suppression
- Modification complète des informations
- Soft delete (conservation de l'historique)
- Permissions : Propriétaire ou créateur uniquement

### 🏷️ Catégories de Dépenses

#### Catégories prédéfinies (15)
1. 🏢 **Loyer** - Loyer des locaux commerciaux
2. 💰 **Salaires** - Salaires et charges sociales
3. ⚡ **Électricité** - Factures d'électricité
4. 💧 **Eau** - Factures d'eau
5. 🌐 **Internet** - Abonnement internet et téléphonie
6. 📱 **Téléphone** - Factures téléphoniques
7. 📦 **Fournitures** - Fournitures de bureau et consommables
8. 📢 **Marketing** - Publicité et marketing
9. 🚗 **Transport** - Frais de transport et carburant
10. 🔧 **Entretien** - Entretien et réparations
11. 🛡️ **Assurance** - Assurances diverses
12. 📊 **Taxes** - Taxes et impôts
13. 📚 **Formation** - Formation du personnel
14. 🍽️ **Repas** - Frais de repas et restauration
15. 📝 **Autre** - Autres dépenses

#### Personnalisation
- Création de catégories personnalisées
- Choix de l'icône (emoji)
- Sélection de la couleur
- Description optionnelle
- Activation/désactivation

### 🔍 Filtres et Recherche

- **Recherche textuelle** : Description, référence, notes
- **Filtre par catégorie** : Toutes ou catégorie spécifique
- **Filtre par période** : Date de début et date de fin
- **Filtre par mode de paiement** : Espèces, Carte, Virement, Chèque

### 📈 Statistiques et Rapports

#### Statistiques disponibles
- Total des dépenses (période sélectionnée)
- Nombre de dépenses
- Répartition par catégorie (montant et pourcentage)
- Répartition par mode de paiement
- Évolution mensuelle (6 derniers mois)
- Top 5 des dépenses les plus importantes
- Comparaison avec le mois précédent

#### Indicateurs visuels
- 📈 **Tendance à la hausse** (rouge) : Dépenses en augmentation
- 📉 **Tendance à la baisse** (vert) : Dépenses en diminution
- Pourcentage de variation affiché

## Installation et Configuration

### 1. Migration de la base de données

```bash
# Appliquer la migration
npx prisma migrate deploy

# Ou en développement
npx prisma migrate dev
```

### 2. Seed des catégories par défaut

```bash
# Exécuter le script de seed
npx ts-node prisma/seed-expenses.ts
```

### 3. Génération du client Prisma

```bash
npx prisma generate
```

## Structure de la Base de Données

### Table `ExpenseCategory`

| Champ | Type | Description |
|-------|------|-------------|
| id | String | Identifiant unique (CUID) |
| name | String | Nom de la catégorie (unique) |
| description | String? | Description optionnelle |
| color | String | Couleur hexadécimale (#3b82f6) |
| icon | String | Emoji ou icône (💰) |
| isActive | Boolean | Statut actif/inactif |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de modification |

**Indexes:**
- `name` (unique)
- `isActive`

### Table `Expense`

| Champ | Type | Description |
|-------|------|-------------|
| id | String | Identifiant unique (CUID) |
| amount | Decimal(10,2) | Montant de la dépense |
| description | String | Description de la dépense |
| date | DateTime | Date de la dépense |
| categoryId | String | Référence à ExpenseCategory |
| paymentMethod | PaymentMethod | Mode de paiement |
| reference | String? | Numéro de référence |
| receipt | String? | URL du reçu (Cloudinary) |
| notes | String? | Notes additionnelles |
| userId | String | Référence à User (créateur) |
| isActive | Boolean | Statut actif/inactif |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de modification |

**Indexes:**
- `categoryId`
- `userId`
- `date`
- `isActive`

**Relations:**
- `category` → ExpenseCategory
- `user` → User

## API Routes

### Catégories de Dépenses

#### `GET /api/expenses/categories`
Récupère toutes les catégories de dépenses.

**Query Parameters:**
- `includeInactive` (boolean) : Inclure les catégories inactives

**Response:**
```json
[
  {
    "id": "clx...",
    "name": "Loyer",
    "description": "Loyer des locaux commerciaux",
    "color": "#3b82f6",
    "icon": "🏢",
    "isActive": true,
    "_count": {
      "expenses": 5
    }
  }
]
```

#### `POST /api/expenses/categories`
Crée une nouvelle catégorie (OWNER uniquement).

**Body:**
```json
{
  "name": "Nouvelle Catégorie",
  "description": "Description",
  "color": "#3b82f6",
  "icon": "💰"
}
```

#### `PUT /api/expenses/categories`
Modifie une catégorie existante (OWNER uniquement).

#### `DELETE /api/expenses/categories?id={id}`
Supprime ou désactive une catégorie (OWNER uniquement).
- Soft delete si la catégorie contient des dépenses
- Hard delete sinon

### Dépenses

#### `GET /api/expenses`
Récupère les dépenses avec pagination et filtres.

**Query Parameters:**
- `page` (number) : Numéro de page (défaut: 1)
- `limit` (number) : Nombre par page (défaut: 20)
- `search` (string) : Recherche textuelle
- `categoryId` (string) : Filtre par catégorie
- `startDate` (string) : Date de début (ISO)
- `endDate` (string) : Date de fin (ISO)
- `paymentMethod` (string) : Mode de paiement

**Response:**
```json
{
  "expenses": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

#### `POST /api/expenses`
Crée une nouvelle dépense.

**Body:**
```json
{
  "amount": 1500.00,
  "description": "Loyer janvier 2025",
  "date": "2025-01-01",
  "categoryId": "clx...",
  "paymentMethod": "TRANSFER",
  "reference": "FAC-2025-001",
  "receipt": "https://cloudinary.com/...",
  "notes": "Notes additionnelles"
}
```

#### `PUT /api/expenses`
Modifie une dépense (OWNER ou créateur uniquement).

#### `DELETE /api/expenses?id={id}`
Supprime une dépense (OWNER ou créateur uniquement).
- Soft delete uniquement

### Statistiques

#### `GET /api/expenses/stats`
Récupère les statistiques des dépenses.

**Query Parameters:**
- `startDate` (string) : Date de début (défaut: début du mois)
- `endDate` (string) : Date de fin (défaut: aujourd'hui)

**Response:**
```json
{
  "total": 15000.00,
  "count": 25,
  "byCategory": [
    {
      "category": {...},
      "total": 5000.00,
      "count": 5
    }
  ],
  "byPaymentMethod": [...],
  "monthlyTrend": [...],
  "recentExpenses": [...],
  "comparison": {
    "currentMonth": 15000.00,
    "previousMonth": 12000.00,
    "percentageChange": 25.00
  }
}
```

## Permissions

### Rôle OWNER (Propriétaire)
- ✅ Créer, modifier, supprimer toutes les dépenses
- ✅ Créer, modifier, supprimer les catégories
- ✅ Voir toutes les statistiques

### Rôle SELLER (Vendeur)
- ❌ Pas d'accès au module dépenses

## Design et UX

### Palette de Couleurs
- **Primaire** : Purple (#a855f7) - Gradient purple-pink
- **Secondaire** : Pink (#ec4899)
- **Accent** : Blue (#3b82f6)

### Composants
- **Cards glassmorphism** : Effet de verre avec backdrop-blur
- **Gradients** : Dégradés modernes purple-pink
- **Animations** : Transitions fluides
- **Icons** : Emojis + Lucide React

### Responsive
- Mobile-first design
- Grilles adaptatives (1 col mobile, 3 cols desktop)
- Filtres empilés sur mobile

## Intégration avec les Autres Modules

### Lien avec le Tableau de Bord
- Les dépenses peuvent être affichées dans le dashboard principal
- Calcul du bénéfice net : Revenus - Dépenses
- Indicateurs de rentabilité

### Lien avec les Rapports
- Export des dépenses par période
- Rapports de rentabilité
- Analyse des coûts par catégorie

## Améliorations Futures

### Court Terme
- [ ] Export Excel/CSV des dépenses
- [ ] Graphiques d'évolution mensuelle
- [ ] Notifications pour dépenses importantes
- [ ] Budget par catégorie avec alertes

### Moyen Terme
- [ ] Dépenses récurrentes automatiques
- [ ] Prévisions de dépenses (ML)
- [ ] Comparaison avec les objectifs
- [ ] Rapports PDF personnalisables

### Long Terme
- [ ] OCR pour extraction automatique des reçus
- [ ] Intégration bancaire (synchronisation)
- [ ] Analyse prédictive des coûts
- [ ] Recommandations d'optimisation

## Support et Documentation

Pour toute question ou problème :
1. Consultez cette documentation
2. Vérifiez les logs de l'application
3. Contactez le support technique

---

**Version** : 1.0.0  
**Date** : Janvier 2025  
**Auteur** : Alami Gestion Team


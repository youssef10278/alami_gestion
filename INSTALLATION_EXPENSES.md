# 🚀 Installation du Module Gestion des Dépenses

## ✅ Fichiers Créés

Le module de gestion des dépenses a été ajouté avec succès ! Voici les fichiers créés :

### 📁 Base de Données
- `prisma/schema.prisma` - Modèles Expense et ExpenseCategory ajoutés
- `prisma/migrations/20250104_add_expenses/migration.sql` - Migration SQL
- `prisma/seed-expenses.ts` - Script de seed pour les catégories par défaut

### 🔌 API Routes
- `app/api/expenses/route.ts` - CRUD des dépenses
- `app/api/expenses/categories/route.ts` - CRUD des catégories
- `app/api/expenses/stats/route.ts` - Statistiques des dépenses

### 🎨 Interface Utilisateur
- `app/dashboard/expenses/page.tsx` - Page principale de gestion
- `components/expenses/ExpenseDialog.tsx` - Dialog d'ajout/modification de dépense
- `components/expenses/CategoryDialog.tsx` - Dialog de gestion des catégories

### 🧭 Navigation
- `components/dashboard/Sidebar.tsx` - Lien "Dépenses" ajouté au menu

### 📚 Documentation
- `docs/EXPENSE_MANAGEMENT.md` - Documentation complète du module

---

## 📋 Étapes d'Installation

### 1️⃣ Appliquer la Migration de Base de Données

**Option A : En production (Railway, Vercel, etc.)**
```bash
npx prisma migrate deploy
```

**Option B : En développement local**
```bash
npx prisma migrate dev
```

### 2️⃣ Générer le Client Prisma

```bash
npx prisma generate
```

### 3️⃣ Seed des Catégories par Défaut (Optionnel mais Recommandé)

```bash
npx ts-node prisma/seed-expenses.ts
```

Cela créera 15 catégories de dépenses prédéfinies :
- 🏢 Loyer
- 💰 Salaires
- ⚡ Électricité
- 💧 Eau
- 🌐 Internet
- 📱 Téléphone
- 📦 Fournitures
- 📢 Marketing
- 🚗 Transport
- 🔧 Entretien
- 🛡️ Assurance
- 📊 Taxes
- 📚 Formation
- 🍽️ Repas
- 📝 Autre

### 4️⃣ Redémarrer l'Application

**En développement :**
```bash
npm run dev
```

**En production :**
```bash
npm run build
npm start
```

---

## 🎯 Accès au Module

1. Connectez-vous avec un compte **OWNER** (Propriétaire)
2. Dans le menu latéral, cliquez sur **💸 Dépenses**
3. Vous verrez le tableau de bord des dépenses

> ⚠️ **Note** : Seuls les utilisateurs avec le rôle **OWNER** ont accès au module dépenses.

---

## 🧪 Test du Module

### Test 1 : Créer une Catégorie

1. Cliquez sur le bouton **"+ Catégorie"**
2. Sélectionnez une catégorie prédéfinie ou créez-en une personnalisée
3. Personnalisez l'icône et la couleur
4. Cliquez sur **"Créer"**

### Test 2 : Créer une Dépense

1. Cliquez sur le bouton **"+ Nouvelle Dépense"**
2. Remplissez les informations :
   - Montant : 1500.00
   - Description : "Loyer janvier 2025"
   - Date : Aujourd'hui
   - Catégorie : Loyer
   - Mode de paiement : Virement
   - Référence : FAC-2025-001
3. Cliquez sur **"Créer"**

### Test 3 : Filtrer les Dépenses

1. Utilisez la barre de recherche pour chercher "loyer"
2. Filtrez par catégorie "Loyer"
3. Sélectionnez une période avec les dates de début et fin

### Test 4 : Voir les Statistiques

1. Observez les cartes de statistiques en haut :
   - Total des dépenses
   - Nombre de dépenses
   - Catégories actives
2. Consultez la répartition par catégorie en bas de page

---

## 🔧 Dépannage

### Erreur : "Can't reach database server"

**Solution :** Assurez-vous que votre base de données PostgreSQL est en cours d'exécution.

```bash
# Vérifier le statut de PostgreSQL
# Windows (si installé localement)
pg_ctl status

# Ou vérifier la connexion Railway/Supabase
```

### Erreur : "Table 'ExpenseCategory' does not exist"

**Solution :** La migration n'a pas été appliquée. Exécutez :

```bash
npx prisma migrate deploy
npx prisma generate
```

### Erreur : "Module not found: Can't resolve '@/components/expenses/ExpenseDialog'"

**Solution :** Redémarrez le serveur de développement :

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

### Les catégories par défaut n'apparaissent pas

**Solution :** Exécutez le script de seed :

```bash
npx ts-node prisma/seed-expenses.ts
```

---

## 📊 Fonctionnalités Disponibles

### ✅ Gestion des Dépenses
- [x] Créer une dépense
- [x] Modifier une dépense
- [x] Supprimer une dépense (soft delete)
- [x] Rechercher des dépenses
- [x] Filtrer par catégorie
- [x] Filtrer par période
- [x] Upload de reçus/factures

### ✅ Gestion des Catégories
- [x] 15 catégories prédéfinies
- [x] Créer des catégories personnalisées
- [x] Modifier les catégories
- [x] Désactiver les catégories
- [x] Personnaliser icône et couleur

### ✅ Statistiques et Rapports
- [x] Total des dépenses
- [x] Nombre de dépenses
- [x] Répartition par catégorie
- [x] Répartition par mode de paiement
- [x] Comparaison avec le mois précédent
- [x] Top 5 des dépenses
- [x] Évolution mensuelle (6 mois)

### ✅ Permissions
- [x] Accès réservé aux OWNER
- [x] Modification par le créateur ou OWNER
- [x] Suppression par le créateur ou OWNER

---

## 🎨 Personnalisation

### Modifier les Couleurs

Éditez `app/dashboard/expenses/page.tsx` :

```tsx
// Ligne 200 - Couleur du gradient principal
className="bg-gradient-to-r from-purple-600 to-pink-600"

// Ligne 220 - Couleur des cartes de stats
className="border-purple-200"
```

### Ajouter des Catégories par Défaut

Éditez `prisma/seed-expenses.ts` et ajoutez vos catégories :

```typescript
const defaultCategories = [
  // ... catégories existantes
  { name: 'Nouvelle Catégorie', icon: '🎯', color: '#ff6b6b', description: 'Description' }
]
```

Puis exécutez :
```bash
npx ts-node prisma/seed-expenses.ts
```

---

## 📈 Prochaines Étapes

### Recommandations

1. **Créer des catégories** adaptées à votre entreprise
2. **Enregistrer vos dépenses** régulièrement
3. **Analyser les statistiques** mensuellement
4. **Comparer** avec vos objectifs budgétaires

### Intégrations Futures

- [ ] Export Excel/CSV
- [ ] Graphiques avancés
- [ ] Budgets par catégorie
- [ ] Alertes de dépassement
- [ ] Dépenses récurrentes
- [ ] OCR pour les reçus

---

## 📞 Support

Pour toute question ou problème :

1. Consultez la documentation : `docs/EXPENSE_MANAGEMENT.md`
2. Vérifiez les logs de l'application
3. Ouvrez une issue sur GitHub

---

## ✨ Félicitations !

Votre module de gestion des dépenses est maintenant installé et prêt à l'emploi ! 🎉

Vous pouvez maintenant :
- ✅ Suivre toutes vos dépenses
- ✅ Analyser vos coûts par catégorie
- ✅ Comparer vos dépenses mensuelles
- ✅ Optimiser votre rentabilité

**Bon travail !** 💪


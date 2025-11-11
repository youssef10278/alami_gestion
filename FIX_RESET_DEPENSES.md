# 🔧 Correction - Réinitialisation Système Inclut Maintenant les Dépenses

## 📋 Problème Identifié

Lors de la réinitialisation système, les **dépenses (Expenses)** et les **catégories de dépenses (ExpenseCategories)** n'étaient **PAS supprimées**.

### Impact
- ❌ Les dépenses restaient dans la base de données après réinitialisation
- ❌ Les catégories de dépenses n'étaient pas effacées
- ❌ Incohérence des données après réinitialisation
- ❌ La page des dépenses affichait encore des données anciennes

## ✅ Solution Appliquée

### 1. Modification de l'API de Réinitialisation

**Fichier** : `app/api/system/reset/route.ts`

#### A. Ajout dans `deletionResults`

**Avant** :
```typescript
const deletionResults = {
  saleChecks: 0,
  documents: 0,
  // ... autres champs
  customers: 0,
  users: 0,
  companySettings: 0
}
```

**Après** :
```typescript
const deletionResults = {
  saleChecks: 0,
  documents: 0,
  // ... autres champs
  customers: 0,
  expenses: 0,              // ← AJOUTÉ
  expenseCategories: 0,     // ← AJOUTÉ
  users: 0,
  companySettings: 0
}
```

#### B. Ajout de la Suppression des Dépenses

**Nouveau code ajouté** (lignes 120-126) :
```typescript
// 17. Supprimer les dépenses
const deletedExpenses = await tx.expense.deleteMany({})
deletionResults.expenses = deletedExpenses.count

// 18. Supprimer les catégories de dépenses
const deletedExpenseCategories = await tx.expenseCategory.deleteMany({})
deletionResults.expenseCategories = deletedExpenseCategories.count
```

#### C. Mise à Jour des Statistiques Système (GET)

**Avant** :
```typescript
const [
  usersCount,
  categoriesCount,
  // ...
  documentsCount
] = await Promise.all([
  tx.user.count(),
  tx.category.count(),
  // ...
  tx.document.count()
])

return {
  users: usersCount,
  // ...
  documents: documentsCount
}
```

**Après** :
```typescript
const [
  usersCount,
  categoriesCount,
  // ...
  documentsCount,
  expensesCount,           // ← AJOUTÉ
  expenseCategoriesCount   // ← AJOUTÉ
] = await Promise.all([
  tx.user.count(),
  tx.category.count(),
  // ...
  tx.document.count(),
  tx.expense.count(),           // ← AJOUTÉ
  tx.expenseCategory.count()    // ← AJOUTÉ
])

return {
  users: usersCount,
  // ...
  documents: documentsCount,
  expenses: expensesCount,           // ← AJOUTÉ
  expenseCategories: expenseCategoriesCount  // ← AJOUTÉ
}
```

### 2. Modification du Composant UI

**Fichier** : `components/settings/SystemReset.tsx`

#### A. Mise à Jour de l'Interface TypeScript

**Avant** :
```typescript
interface SystemStats {
  users: number
  categories: number
  // ...
  documents: number
}
```

**Après** :
```typescript
interface SystemStats {
  users: number
  categories: number
  // ...
  documents: number
  expenses: number              // ← AJOUTÉ
  expenseCategories: number     // ← AJOUTÉ
}
```

#### B. Ajout des Icônes

**Import ajouté** :
```typescript
import { 
  // ... autres imports
  Receipt,    // ← AJOUTÉ pour les dépenses
  Tag         // ← AJOUTÉ pour les catégories de dépenses
} from 'lucide-react'
```

**Fonction `getStatIcon` mise à jour** :
```typescript
const getStatIcon = (key: string) => {
  const icons: Record<string, any> = {
    // ... autres icônes
    documents: FileText,
    expenses: Receipt,              // ← AJOUTÉ
    expenseCategories: Tag          // ← AJOUTÉ
  }
  return icons[key] || Database
}
```

#### C. Ajout des Labels

**Fonction `getStatLabel` mise à jour** :
```typescript
const getStatLabel = (key: string) => {
  const labels: Record<string, string> = {
    // ... autres labels
    documents: 'Documents',
    expenses: 'Dépenses',                      // ← AJOUTÉ
    expenseCategories: 'Catégories Dépenses'   // ← AJOUTÉ
  }
  return labels[key] || key
}
```

#### D. Mise à Jour des Avertissements

**Avant** :
```typescript
<ul className="text-sm text-red-700 mt-2 space-y-1">
  <li>• Toutes les ventes, factures et devis seront supprimés</li>
  <li>• Tous les produits, clients et fournisseurs seront effacés</li>
  <li>• L'historique des mouvements de stock sera perdu</li>
  <li>• Les documents générés seront supprimés</li>
  <li>• Cette action ne peut pas être annulée</li>
</ul>
```

**Après** :
```typescript
<ul className="text-sm text-red-700 mt-2 space-y-1">
  <li>• Toutes les ventes, factures et devis seront supprimés</li>
  <li>• Tous les produits, clients et fournisseurs seront effacés</li>
  <li>• Toutes les dépenses et leurs catégories seront supprimées</li>  {/* ← AJOUTÉ */}
  <li>• L'historique des mouvements de stock sera perdu</li>
  <li>• Les documents générés seront supprimés</li>
  <li>• Cette action ne peut pas être annulée</li>
</ul>
```

## 📊 Ordre de Suppression

La réinitialisation système supprime maintenant les données dans cet ordre :

1. ✅ Chèques de vente (SaleCheck)
2. ✅ Documents (Document)
3. ✅ Éléments de vente (SaleItem)
4. ✅ Ventes (Sale)
5. ✅ Mouvements de stock (StockMovement)
6. ✅ Paiements de crédit (CreditPayment)
7. ✅ Éléments de facture (InvoiceItem)
8. ✅ Factures (Invoice)
9. ✅ Éléments de devis (QuoteItem)
10. ✅ Devis (Quote)
11. ✅ Transactions fournisseurs (SupplierTransaction)
12. ✅ Chèques fournisseurs (Check)
13. ✅ Fournisseurs (Supplier)
14. ✅ Produits (Product)
15. ✅ Catégories de produits (Category)
16. ✅ Clients (Customer)
17. ✅ **Dépenses (Expense)** ← **NOUVEAU**
18. ✅ **Catégories de dépenses (ExpenseCategory)** ← **NOUVEAU**
19. ✅ Utilisateurs (User) - sauf l'utilisateur actuel si demandé
20. ✅ Paramètres de l'entreprise (CompanySettings)

## 🎯 Résultat

### Avant ❌
```json
{
  "deletedData": {
    "saleChecks": 5,
    "sales": 10,
    "invoices": 8,
    // ... autres données
    "customers": 15,
    // ❌ PAS de "expenses"
    // ❌ PAS de "expenseCategories"
    "users": 2
  }
}
```

### Après ✅
```json
{
  "deletedData": {
    "saleChecks": 5,
    "sales": 10,
    "invoices": 8,
    // ... autres données
    "customers": 15,
    "expenses": 12,              // ✅ AJOUTÉ
    "expenseCategories": 4,      // ✅ AJOUTÉ
    "users": 2
  }
}
```

## 📱 Interface Utilisateur

### Statistiques Affichées

L'interface affiche maintenant **12 types de données** au lieu de 10 :

1. 👥 Utilisateurs
2. 📦 Catégories (produits)
3. 📦 Produits
4. 👥 Clients
5. 👥 Fournisseurs
6. 🛒 Ventes
7. 📄 Factures
8. 📄 Devis
9. 📈 Mouvements Stock
10. 📄 Documents
11. 🧾 **Dépenses** ← **NOUVEAU**
12. 🏷️ **Catégories Dépenses** ← **NOUVEAU**

## 📝 Fichiers Modifiés

1. ✅ **`app/api/system/reset/route.ts`**
   - Ajout de la suppression des dépenses (ligne 120-122)
   - Ajout de la suppression des catégories de dépenses (ligne 124-126)
   - Mise à jour des statistiques GET (lignes 214-258)

2. ✅ **`components/settings/SystemReset.tsx`**
   - Mise à jour de l'interface `SystemStats` (lignes 27-40)
   - Import des icônes `Receipt` et `Tag` (lignes 10-26)
   - Ajout des icônes dans `getStatIcon` (lignes 128-145)
   - Ajout des labels dans `getStatLabel` (lignes 147-162)
   - Mise à jour des avertissements (ligne 231)

3. ✅ **`FIX_RESET_DEPENSES.md`** - Documentation de la correction

## ✅ Tests à Effectuer

1. ✅ Vérifier que le build compile sans erreurs
2. ⏳ Créer quelques dépenses de test
3. ⏳ Vérifier que les statistiques affichent le bon nombre de dépenses
4. ⏳ Effectuer une réinitialisation système
5. ⏳ Vérifier que les dépenses ont été supprimées
6. ⏳ Vérifier que la page des dépenses est vide après réinitialisation

## 🎉 Conclusion

La réinitialisation système inclut maintenant **TOUTES** les données de l'application, y compris :

- ✅ Les dépenses
- ✅ Les catégories de dépenses

**Le système de réinitialisation est maintenant complet et cohérent !** 🎊


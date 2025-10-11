# 🧪 Guide de Test de Performance - 5000 Produits

## 🎯 Objectif

Tester les performances de l'application Alami Gestion avec un volume important de données (5000 produits) pour identifier les goulots d'étranglement et optimiser l'expérience utilisateur.

## 📋 Plan de Test

### **Phase 1 : Génération des Données de Test**
### **Phase 2 : Tests de Performance**
### **Phase 3 : Analyse et Optimisation**

---

## 🚀 Phase 1 : Génération des Données de Test

### **Étape 1 : Génération de 5000 Produits**

```bash
# Dans le terminal, à la racine du projet
node scripts/generate-test-products.js generate 5000
```

**Ce que fait le script :**
- ✅ Génère 5000 produits avec des données réalistes
- ✅ Noms de produits variés (Samsung, Apple, Nike, etc.)
- ✅ SKU uniques (PRD-2025-000001, etc.)
- ✅ Catégories diversifiées (20 catégories)
- ✅ Prix aléatoires entre 10 et 2000 MAD
- ✅ Stock aléatoire entre 1 et 1000
- ✅ Descriptions automatiques

**Temps estimé :** 2-5 minutes

### **Étape 2 : Vérification des Données**

```bash
# Vérifier les statistiques
node scripts/generate-test-products.js stats
```

**Résultat attendu :**
```
📊 Statistiques actuelles:
  Total: 5000
  Actifs: 4500
  Inactifs: 500
  Catégories: 20
  Prix moyen: 1005.50 MAD
  Stock total: 2500000
```

### **Étape 3 : Génération de Données Complètes (Optionnel)**

```bash
# Générer produits + clients + quelques ventes
node scripts/generate-test-products.js complete
```

---

## ⚡ Phase 2 : Tests de Performance

### **Étape 1 : Préparation**

1. **Ouvrez l'application** dans le navigateur
2. **Allez sur** `/dashboard/products`
3. **Ouvrez la console** du navigateur (F12)
4. **Copiez le script** `scripts/performance-test.js`
5. **Collez et exécutez** dans la console

### **Étape 2 : Lancement des Tests**

```javascript
// Dans la console du navigateur
runPerformanceTests()
```

### **Tests Exécutés Automatiquement :**

#### **1. Chargement Initial** 📄
- Charge la première page (20 produits)
- Mesure le temps de réponse
- Vérifie la pagination

#### **2. Recherche par Nom** 🔍
- Teste 5 termes de recherche différents
- Mesure la vitesse de recherche
- Compte les résultats trouvés

#### **3. Filtrage par Catégorie** 📂
- Teste 3 catégories principales
- Mesure les performances de filtrage
- Vérifie la précision des résultats

#### **4. Filtrage par Prix** 💰
- Teste 3 gammes de prix différentes
- Mesure les requêtes de plage
- Vérifie la logique de filtrage

#### **5. Pagination** 📑
- Charge 10 pages successives
- Mesure la consistance des performances
- Teste la navigation entre pages

#### **6. Recherche Complexe** 🎯
- Combine plusieurs filtres
- Teste les requêtes complexes
- Mesure l'impact des filtres multiples

#### **7. Stress Test** 🔥
- 20 requêtes rapides simultanées
- Teste la résistance du serveur
- Mesure la dégradation des performances

### **Étape 3 : Analyse des Résultats**

Les résultats s'affichent automatiquement :

```
📊 === RÉSULTATS DES TESTS DE PERFORMANCE ===

📈 Statistiques générales:
  Tests exécutés: 45
  Succès: 43 (95.6%)
  Échecs: 2
  Durée totale: 12.34s

⏱️ Temps de réponse:
  Moyenne: 245.67ms
  Maximum: 1234.56ms
  Minimum: 89.12ms

🐌 Tests les plus lents:
  1. Recherche complexe: 1234.56ms
  2. Filtre catégorie "Électronique": 987.65ms
  3. Page 10: 876.54ms
```

---

## 📊 Phase 3 : Analyse et Optimisation

### **Métriques Clés à Surveiller**

#### **🟢 Performances Acceptables**
- ✅ Temps de réponse moyen < 500ms
- ✅ Temps maximum < 2000ms
- ✅ Taux de succès > 95%
- ✅ Pagination fluide < 300ms

#### **🟡 Performances Moyennes**
- ⚠️ Temps de réponse moyen 500-1000ms
- ⚠️ Temps maximum 2000-3000ms
- ⚠️ Taux de succès 90-95%

#### **🔴 Performances Problématiques**
- ❌ Temps de réponse moyen > 1000ms
- ❌ Temps maximum > 3000ms
- ❌ Taux de succès < 90%
- ❌ Erreurs fréquentes

### **Optimisations Recommandées**

#### **Base de Données**
```sql
-- Index pour améliorer les recherches
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_active ON products(isActive);

-- Index composé pour recherches complexes
CREATE INDEX idx_products_search ON products(name, category, price, isActive);
```

#### **API (Backend)**
```typescript
// Pagination optimisée
const products = await prisma.product.findMany({
  skip: (page - 1) * limit,
  take: limit,
  where: filters,
  orderBy: { createdAt: 'desc' },
  select: {
    id: true,
    name: true,
    sku: true,
    price: true,
    stock: true,
    category: true,
    isActive: true
  } // Sélectionner seulement les champs nécessaires
})
```

#### **Frontend (React)**
```typescript
// Debounce pour la recherche
const debouncedSearch = useMemo(
  () => debounce((term: string) => {
    setSearchTerm(term)
  }, 300),
  []
)

// Virtualisation pour grandes listes
import { FixedSizeList as List } from 'react-window'
```

#### **Cache Redis**
```typescript
// Cache des résultats fréquents
const cacheKey = `products:${page}:${category}:${search}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

// Mettre en cache pour 5 minutes
await redis.setex(cacheKey, 300, JSON.stringify(result))
```

---

## 🧹 Nettoyage des Données de Test

### **Supprimer les Produits de Test**
```bash
node scripts/generate-test-products.js clean
```

### **Vérification**
```bash
node scripts/generate-test-products.js stats
```

---

## 📈 Benchmarks de Référence

### **Objectifs de Performance**

| Métrique | Objectif | Acceptable | Critique |
|----------|----------|------------|----------|
| **Chargement initial** | < 200ms | < 500ms | > 1000ms |
| **Recherche simple** | < 300ms | < 600ms | > 1200ms |
| **Filtrage** | < 250ms | < 500ms | > 1000ms |
| **Pagination** | < 150ms | < 300ms | > 600ms |
| **Recherche complexe** | < 500ms | < 1000ms | > 2000ms |

### **Capacité Cible**

- ✅ **5000 produits** : Performance fluide
- ✅ **10000 produits** : Performance acceptable
- ⚠️ **20000+ produits** : Optimisations requises

---

## 🔧 Outils de Monitoring

### **Métriques à Surveiller en Production**

1. **Temps de réponse API** (New Relic, DataDog)
2. **Utilisation CPU/Mémoire** (htop, PM2)
3. **Requêtes base de données** (Prisma logs)
4. **Erreurs JavaScript** (Sentry)
5. **Core Web Vitals** (Google PageSpeed)

### **Alertes Recommandées**

- 🚨 Temps de réponse > 2 secondes
- 🚨 Taux d'erreur > 5%
- 🚨 Utilisation mémoire > 80%
- 🚨 Requêtes DB > 100ms

---

## ✅ Checklist de Test

### **Avant les Tests**
- [ ] Base de données sauvegardée
- [ ] 5000 produits générés
- [ ] Application démarrée
- [ ] Console navigateur ouverte

### **Pendant les Tests**
- [ ] Tous les tests exécutés
- [ ] Résultats enregistrés
- [ ] Erreurs documentées
- [ ] Métriques exportées

### **Après les Tests**
- [ ] Résultats analysés
- [ ] Optimisations identifiées
- [ ] Plan d'amélioration créé
- [ ] Données de test nettoyées

---

**Version** : 1.0.0  
**Date** : 2025-01-09  
**Auteur** : Équipe Alami Gestion  
**Status** : ✅ Prêt pour Exécution

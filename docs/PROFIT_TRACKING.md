# 💰 Suivi des Bénéfices

## Vue d'ensemble

L'application Alami Gestion intègre maintenant un système complet de suivi des bénéfices qui permet de :
- Enregistrer le prix d'achat de chaque produit
- Calculer automatiquement les marges bénéficiaires
- Analyser les bénéfices par période
- Identifier les produits les plus rentables

---

## 🎯 Fonctionnalités

### 1. Prix d'Achat des Produits

Chaque produit possède maintenant deux prix :
- **Prix d'achat** : Le prix auquel vous achetez le produit
- **Prix de vente** : Le prix auquel vous vendez le produit

#### Calculs Automatiques
```
Marge unitaire = Prix de vente - Prix d'achat
Marge en % = (Marge unitaire / Prix d'achat) × 100
```

---

### 2. Analyse des Bénéfices

#### Métriques Disponibles
1. **Chiffre d'affaires** - Total des ventes
2. **Coût total** - Total des coûts d'achat
3. **Bénéfice net** - Chiffre d'affaires - Coût total
4. **Marge bénéficiaire** - (Bénéfice / Chiffre d'affaires) × 100

---

## 📝 Utilisation

### Ajouter un Produit avec Prix d'Achat

```
1. Dashboard > Produits > Nouveau Produit
2. Remplir les informations :
   - SKU / Code-barres
   - Nom du produit
   - Photo (optionnel)
   - Description
   - Prix d'achat : 50.00 DH
   - Prix de vente : 75.00 DH
   
3. La marge s'affiche automatiquement :
   ✅ Marge: 25.00 DH (50.0%)
   
4. Cliquer sur "Créer"
```

---

### Consulter les Statistiques de Bénéfices

```
1. Dashboard > Tableau de bord
2. Descendre à la section "Analyse des Bénéfices"
3. Sélectionner la période :
   - 7 derniers jours
   - 30 derniers jours
   - 90 derniers jours
   - 1 an
   
4. Consulter les KPIs :
   - Chiffre d'affaires
   - Coût total
   - Bénéfice net
   - Marge bénéficiaire
   
5. Analyser les graphiques :
   - Évolution des bénéfices
   - Top 10 produits par bénéfice
```

---

## 📊 Exemples de Calculs

### Exemple 1 : Produit Simple

**Données :**
- Prix d'achat : 100 DH
- Prix de vente : 150 DH
- Quantité vendue : 10 unités

**Calculs :**
```
Coût total = 100 × 10 = 1,000 DH
Chiffre d'affaires = 150 × 10 = 1,500 DH
Bénéfice = 1,500 - 1,000 = 500 DH
Marge = (500 / 1,500) × 100 = 33.3%
```

---

### Exemple 2 : Plusieurs Produits

**Vente 1 :**
- Produit A : Achat 50 DH, Vente 75 DH, Qté 5
- Bénéfice = (75 - 50) × 5 = 125 DH

**Vente 2 :**
- Produit B : Achat 100 DH, Vente 140 DH, Qté 3
- Bénéfice = (140 - 100) × 3 = 120 DH

**Total :**
```
Bénéfice total = 125 + 120 = 245 DH
Chiffre d'affaires = (75×5) + (140×3) = 795 DH
Marge globale = (245 / 795) × 100 = 30.8%
```

---

## 📈 Graphiques et Visualisations

### 1. Évolution des Bénéfices

**Graphique en ligne** montrant :
- Chiffre d'affaires (bleu)
- Coût total (orange)
- Bénéfice net (vert)

**Utilité :**
- Identifier les tendances
- Repérer les périodes rentables
- Anticiper les variations

---

### 2. Top Produits par Bénéfice

**Graphique en barres** montrant :
- Les 10 produits les plus rentables
- Bénéfice total par produit

**Utilité :**
- Identifier les best-sellers rentables
- Optimiser le stock
- Ajuster les prix

---

## 💡 Cas d'Usage

### Cas 1 : Optimisation des Prix

**Situation :**
- Produit X : Achat 80 DH, Vente 100 DH
- Marge actuelle : 20 DH (25%)

**Analyse :**
- Concurrent vend à 120 DH
- Possibilité d'augmenter le prix

**Action :**
1. Modifier le produit
2. Nouveau prix de vente : 115 DH
3. Nouvelle marge : 35 DH (43.75%)
4. Augmentation du bénéfice : +75%

---

### Cas 2 : Identification des Produits Non Rentables

**Situation :**
- Produit Y : Achat 150 DH, Vente 160 DH
- Marge : 10 DH (6.7%)

**Analyse :**
- Marge trop faible
- Coûts de gestion élevés

**Actions possibles :**
1. Augmenter le prix de vente
2. Négocier le prix d'achat
3. Arrêter la vente du produit

---

### Cas 3 : Analyse de Rentabilité par Période

**Objectif :**
Comparer la rentabilité de deux mois

**Méthode :**
1. Sélectionner "30 derniers jours"
2. Noter les métriques
3. Attendre 30 jours
4. Comparer les résultats

**Exemple :**
```
Mois 1 :
- CA : 50,000 DH
- Coût : 35,000 DH
- Bénéfice : 15,000 DH
- Marge : 30%

Mois 2 :
- CA : 60,000 DH
- Coût : 38,000 DH
- Bénéfice : 22,000 DH
- Marge : 36.7%

Amélioration : +46.7% de bénéfice
```

---

## 🔧 Configuration

### Migration de la Base de Données

**Important :** Après avoir mis à jour le code, exécutez la migration :

```bash
npx prisma migrate dev --name add_purchase_price
```

Cette migration ajoute le champ `purchasePrice` à la table `Product`.

---

### Mise à Jour des Produits Existants

Si vous avez déjà des produits sans prix d'achat :

```
1. Dashboard > Produits
2. Pour chaque produit :
   - Cliquer sur "Modifier"
   - Ajouter le prix d'achat
   - Cliquer sur "Mettre à jour"
```

**Astuce :** Si vous ne connaissez pas le prix d'achat exact, estimez-le à partir de votre marge habituelle.

---

## 📊 Interprétation des Métriques

### Marge Bénéficiaire

| Marge | Interprétation |
|-------|----------------|
| < 10% | ⚠️ Très faible - Revoir les prix |
| 10-20% | ⚠️ Faible - Peut être amélioré |
| 20-30% | ✅ Correcte - Standard |
| 30-50% | ✅ Bonne - Rentable |
| > 50% | ✅ Excellente - Très rentable |

---

### Évolution du Bénéfice

**Tendance à la hausse** ✅
- Bonne gestion
- Croissance saine
- Continuer la stratégie

**Tendance à la baisse** ⚠️
- Analyser les causes
- Vérifier les coûts
- Ajuster les prix

**Stagnation** ⚠️
- Manque de croissance
- Opportunités manquées
- Besoin d'innovation

---

## 🎯 Bonnes Pratiques

### 1. Mise à Jour Régulière des Prix

- ✅ Vérifier les prix d'achat mensuellement
- ✅ Ajuster les prix de vente selon le marché
- ✅ Tenir compte de l'inflation

---

### 2. Analyse Périodique

- ✅ Consulter les stats hebdomadairement
- ✅ Comparer avec les périodes précédentes
- ✅ Identifier les tendances

---

### 3. Optimisation Continue

- ✅ Identifier les produits peu rentables
- ✅ Promouvoir les produits rentables
- ✅ Négocier avec les fournisseurs

---

### 4. Documentation

- ✅ Noter les changements de prix
- ✅ Justifier les décisions
- ✅ Suivre les résultats

---

## 🚀 Avantages du Système

### Pour le Propriétaire

1. **Visibilité Complète**
   - Vue d'ensemble de la rentabilité
   - Identification rapide des problèmes
   - Prise de décision éclairée

2. **Optimisation**
   - Ajustement des prix basé sur les données
   - Maximisation des bénéfices
   - Réduction des pertes

3. **Planification**
   - Prévisions financières
   - Objectifs de rentabilité
   - Stratégie de croissance

---

### Pour l'Entreprise

1. **Rentabilité**
   - Augmentation des marges
   - Réduction des coûts
   - Croissance durable

2. **Compétitivité**
   - Prix optimisés
   - Meilleure position sur le marché
   - Avantage concurrentiel

3. **Pérennité**
   - Santé financière
   - Résilience
   - Développement à long terme

---

## 📚 Ressources

### Formules Utiles

```
Marge unitaire = Prix de vente - Prix d'achat

Marge en % = (Marge unitaire / Prix d'achat) × 100

Bénéfice total = Σ (Prix de vente - Prix d'achat) × Quantité

Marge globale = (Bénéfice total / Chiffre d'affaires) × 100

ROI = (Bénéfice / Coût total) × 100
```

---

### Indicateurs Clés

- **CA** : Chiffre d'affaires
- **COGS** : Cost of Goods Sold (Coût des marchandises vendues)
- **Marge brute** : CA - COGS
- **Taux de marge** : (Marge brute / CA) × 100
- **ROI** : Return on Investment

---

## 🎊 Résumé

Le système de suivi des bénéfices vous permet de :

✅ **Enregistrer** les prix d'achat et de vente  
✅ **Calculer** automatiquement les marges  
✅ **Analyser** la rentabilité par période  
✅ **Identifier** les produits les plus rentables  
✅ **Optimiser** les prix et les marges  
✅ **Prendre** des décisions éclairées  

**Résultat :** Une entreprise plus rentable et mieux gérée ! 💰📈

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2025-01-03  
**Auteur** : Équipe Alami Gestion


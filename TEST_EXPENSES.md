# 🧪 Guide de Test - Module Gestion des Dépenses

## 📋 Prérequis

Avant de commencer les tests, assurez-vous que :

- ✅ La migration a été appliquée (`npx prisma migrate deploy`)
- ✅ Le client Prisma a été généré (`npx prisma generate`)
- ✅ L'application est en cours d'exécution (`npm run dev`)
- ✅ Vous êtes connecté avec un compte **OWNER**

---

## 🎯 Scénarios de Test

### Test 1 : Accès au Module

**Objectif** : Vérifier que le module est accessible

1. Connectez-vous avec un compte OWNER
2. Dans le menu latéral, cherchez l'icône 💸 **Dépenses**
3. Cliquez sur le lien

**Résultat attendu** :
- ✅ La page des dépenses s'affiche
- ✅ Vous voyez 3 cartes de statistiques (toutes à 0 si première utilisation)
- ✅ Les filtres sont visibles
- ✅ Message "Aucune dépense trouvée" si aucune dépense

**Résultat si SELLER** :
- ❌ Le lien "Dépenses" n'apparaît pas dans le menu

---

### Test 2 : Seed des Catégories par Défaut

**Objectif** : Créer les 15 catégories prédéfinies

1. Ouvrez un terminal dans le dossier du projet
2. Exécutez : `npx ts-node prisma/seed-expenses.ts`

**Résultat attendu** :
```
🌱 Seeding expense categories...
✅ Created category: 🏢 Loyer
✅ Created category: 💰 Salaires
✅ Created category: ⚡ Électricité
... (15 catégories au total)
✨ Seeding completed!
```

3. Rafraîchissez la page des dépenses
4. La carte "Catégories Actives" devrait afficher **15**

---

### Test 3 : Créer une Catégorie Personnalisée

**Objectif** : Tester la création manuelle de catégorie

1. Cliquez sur le bouton **"+ Catégorie"**
2. Le dialog s'ouvre avec les catégories prédéfinies
3. Cliquez sur une catégorie prédéfinie (ex: "🏢 Loyer")
4. Modifiez le nom : "Loyer Bureau Principal"
5. Changez la couleur en cliquant sur une couleur de la palette
6. Modifiez l'icône : "🏪"
7. Ajoutez une description : "Loyer mensuel du bureau principal"
8. Cliquez sur **"Créer"**

**Résultat attendu** :
- ✅ Toast de succès : "Catégorie créée"
- ✅ Le dialog se ferme
- ✅ La nouvelle catégorie apparaît dans les filtres

**Test d'erreur** :
1. Essayez de créer une catégorie avec un nom existant
2. **Résultat attendu** : Toast d'erreur "Une catégorie avec ce nom existe déjà"

---

### Test 4 : Créer une Dépense Simple

**Objectif** : Créer une dépense basique

1. Cliquez sur **"+ Nouvelle Dépense"**
2. Remplissez le formulaire :
   - **Montant** : 1500
   - **Date** : Aujourd'hui (par défaut)
   - **Description** : "Loyer janvier 2025"
   - **Catégorie** : Sélectionnez "🏢 Loyer"
   - **Mode de paiement** : Virement
   - **Référence** : FAC-2025-001
   - **Notes** : "Paiement effectué le 1er janvier"
3. Cliquez sur **"Créer"**

**Résultat attendu** :
- ✅ Toast de succès : "Dépense créée"
- ✅ Le dialog se ferme
- ✅ La dépense apparaît dans la liste
- ✅ Les statistiques se mettent à jour :
  - Total des dépenses : 1500.00 DH
  - Nombre de dépenses : 1
- ✅ La répartition par catégorie affiche "Loyer : 1500.00 DH (100%)"

---

### Test 5 : Créer une Dépense avec Reçu

**Objectif** : Tester l'upload d'image

1. Cliquez sur **"+ Nouvelle Dépense"**
2. Remplissez :
   - **Montant** : 250
   - **Description** : "Facture électricité décembre"
   - **Catégorie** : ⚡ Électricité
   - **Mode de paiement** : Carte
3. Cliquez sur **"Télécharger un reçu"**
4. Sélectionnez une image (facture, reçu, etc.)
5. Attendez l'upload (toast "Reçu téléchargé")
6. Vérifiez que l'image s'affiche en prévisualisation
7. Cliquez sur **"Créer"**

**Résultat attendu** :
- ✅ L'image est uploadée sur Cloudinary
- ✅ La dépense est créée avec l'URL du reçu
- ✅ Total des dépenses : 1750.00 DH
- ✅ Nombre de dépenses : 2

---

### Test 6 : Créer Plusieurs Dépenses

**Objectif** : Tester avec des données variées

Créez les dépenses suivantes :

| Montant | Description | Catégorie | Mode de paiement |
|---------|-------------|-----------|------------------|
| 3500 | Salaires janvier | 💰 Salaires | Virement |
| 180 | Facture internet | 🌐 Internet | Prélèvement |
| 450 | Fournitures bureau | 📦 Fournitures | Espèces |
| 800 | Assurance locale | 🛡️ Assurance | Virement |
| 120 | Repas équipe | 🍽️ Repas | Carte |

**Résultat attendu** :
- ✅ Total des dépenses : 6800.00 DH (1500 + 250 + 3500 + 180 + 450 + 800 + 120)
- ✅ Nombre de dépenses : 7
- ✅ Répartition par catégorie affichée avec barres de progression

---

### Test 7 : Filtrer les Dépenses

**Objectif** : Tester les filtres

#### Test 7.1 : Recherche textuelle
1. Dans la barre de recherche, tapez "loyer"
2. **Résultat attendu** : Seule la dépense "Loyer janvier 2025" s'affiche

#### Test 7.2 : Filtre par catégorie
1. Effacez la recherche
2. Dans le select "Catégorie", choisissez "💰 Salaires"
3. **Résultat attendu** : Seule la dépense "Salaires janvier" s'affiche

#### Test 7.3 : Filtre par période
1. Remettez "Toutes les catégories"
2. Sélectionnez une date de début : 1er janvier 2025
3. Sélectionnez une date de fin : 15 janvier 2025
4. **Résultat attendu** : Seules les dépenses de cette période s'affichent

#### Test 7.4 : Combinaison de filtres
1. Recherche : "facture"
2. Catégorie : ⚡ Électricité
3. **Résultat attendu** : Seule "Facture électricité décembre" s'affiche

---

### Test 8 : Modifier une Dépense

**Objectif** : Tester la modification

1. Trouvez la dépense "Loyer janvier 2025"
2. Cliquez sur l'icône **✏️ Modifier** (bleue)
3. Le dialog s'ouvre avec les données pré-remplies
4. Modifiez le montant : 1600
5. Modifiez la description : "Loyer janvier 2025 + charges"
6. Ajoutez une note : "Augmentation de 100 DH pour les charges"
7. Cliquez sur **"Modifier"**

**Résultat attendu** :
- ✅ Toast de succès : "Dépense modifiée"
- ✅ Les modifications sont visibles dans la liste
- ✅ Le total est recalculé : 6900.00 DH (au lieu de 6800)

---

### Test 9 : Supprimer une Dépense

**Objectif** : Tester la suppression

1. Trouvez la dépense "Repas équipe"
2. Cliquez sur l'icône **🗑️ Supprimer** (rouge)
3. Confirmez la suppression dans l'alerte

**Résultat attendu** :
- ✅ Toast de succès : "Dépense supprimée"
- ✅ La dépense disparaît de la liste
- ✅ Le total est recalculé : 6780.00 DH (6900 - 120)
- ✅ Nombre de dépenses : 6

**Note** : La suppression est un soft delete, la dépense existe toujours en base avec `isActive = false`

---

### Test 10 : Statistiques et Répartition

**Objectif** : Vérifier les statistiques

1. Scrollez jusqu'à la section "Dépenses par Catégorie"
2. Vérifiez que chaque catégorie affiche :
   - Icône et nom
   - Nombre de dépenses
   - Montant total
   - Pourcentage du total
   - Barre de progression colorée

**Calculs attendus** (avec les dépenses créées) :
- Loyer : 1600 DH (23.6%)
- Salaires : 3500 DH (51.6%)
- Électricité : 250 DH (3.7%)
- Internet : 180 DH (2.7%)
- Fournitures : 450 DH (6.6%)
- Assurance : 800 DH (11.8%)

**Résultat attendu** :
- ✅ Les pourcentages totalisent 100%
- ✅ Les barres de progression sont proportionnelles
- ✅ Les couleurs correspondent aux catégories

---

### Test 11 : Comparaison Mensuelle

**Objectif** : Tester la tendance

1. Observez la carte "Total des Dépenses"
2. Notez l'indicateur de tendance (📈 ou 📉)

**Si c'est le premier mois** :
- Tendance : 📈 (hausse)
- Pourcentage : 100% (car mois précédent = 0)

**Pour tester la comparaison** :
1. Créez des dépenses avec des dates du mois dernier
2. Rafraîchissez la page
3. La tendance devrait se mettre à jour

---

### Test 12 : Permissions (Test avec SELLER)

**Objectif** : Vérifier les restrictions d'accès

1. Déconnectez-vous
2. Connectez-vous avec un compte **SELLER**
3. Vérifiez le menu latéral

**Résultat attendu** :
- ❌ Le lien "Dépenses" n'apparaît PAS
- ❌ Accès direct à `/dashboard/expenses` devrait être bloqué (401 ou redirection)

---

### Test 13 : Responsive Design

**Objectif** : Tester sur différentes tailles d'écran

#### Mobile (< 768px)
1. Ouvrez les DevTools (F12)
2. Activez le mode responsive
3. Sélectionnez "iPhone 12 Pro" ou similaire

**Résultat attendu** :
- ✅ Les cartes de stats s'empilent en 1 colonne
- ✅ Les filtres s'empilent verticalement
- ✅ Les dépenses s'affichent en liste verticale
- ✅ Les boutons sont accessibles

#### Tablet (768px - 1024px)
1. Sélectionnez "iPad" ou similaire

**Résultat attendu** :
- ✅ Les cartes de stats en 2 colonnes
- ✅ Les filtres en 2 colonnes
- ✅ Interface optimisée

#### Desktop (> 1024px)
**Résultat attendu** :
- ✅ Les cartes de stats en 3 colonnes
- ✅ Les filtres en 4 colonnes
- ✅ Utilisation optimale de l'espace

---

### Test 14 : Performance

**Objectif** : Tester avec beaucoup de données

1. Créez 50+ dépenses (utilisez un script ou manuellement)
2. Testez la pagination
3. Testez les filtres

**Résultat attendu** :
- ✅ Chargement rapide (< 1s)
- ✅ Pagination fonctionnelle
- ✅ Filtres réactifs
- ✅ Pas de lag lors du scroll

---

### Test 15 : Validation des Erreurs

**Objectif** : Tester la gestion d'erreurs

#### Test 15.1 : Montant invalide
1. Créez une dépense avec montant = 0
2. **Résultat attendu** : Erreur "Le montant doit être supérieur à 0"

#### Test 15.2 : Description vide
1. Créez une dépense sans description
2. **Résultat attendu** : Erreur "La description est requise"

#### Test 15.3 : Catégorie non sélectionnée
1. Créez une dépense sans catégorie
2. **Résultat attendu** : Erreur "La catégorie est requise"

#### Test 15.4 : Catégorie avec nom existant
1. Créez une catégorie avec un nom déjà utilisé
2. **Résultat attendu** : Erreur "Une catégorie avec ce nom existe déjà"

---

## ✅ Checklist Complète

Cochez au fur et à mesure :

### Fonctionnalités de Base
- [ ] Accès au module (OWNER uniquement)
- [ ] Seed des catégories par défaut
- [ ] Création de catégorie personnalisée
- [ ] Création de dépense simple
- [ ] Création de dépense avec reçu
- [ ] Modification de dépense
- [ ] Suppression de dépense

### Filtres et Recherche
- [ ] Recherche textuelle
- [ ] Filtre par catégorie
- [ ] Filtre par période
- [ ] Combinaison de filtres

### Statistiques
- [ ] Total des dépenses
- [ ] Nombre de dépenses
- [ ] Répartition par catégorie
- [ ] Comparaison mensuelle
- [ ] Barres de progression

### Permissions
- [ ] Accès OWNER uniquement
- [ ] Modification par créateur ou OWNER
- [ ] Suppression par créateur ou OWNER
- [ ] Blocage pour SELLER

### Design et UX
- [ ] Responsive mobile
- [ ] Responsive tablet
- [ ] Responsive desktop
- [ ] Animations fluides
- [ ] Toasts de confirmation

### Validation
- [ ] Montant > 0
- [ ] Description obligatoire
- [ ] Catégorie obligatoire
- [ ] Nom de catégorie unique

---

## 🐛 Bugs Connus

Aucun bug connu pour le moment. Si vous en trouvez, veuillez les signaler !

---

## 📊 Résultats Attendus

Après avoir complété tous les tests :

- ✅ **7+ dépenses** créées
- ✅ **15+ catégories** disponibles
- ✅ **Total > 6000 DH** de dépenses
- ✅ **Statistiques** correctes
- ✅ **Filtres** fonctionnels
- ✅ **Permissions** respectées
- ✅ **Design** responsive

---

## 🎉 Félicitations !

Si tous les tests passent, votre module de gestion des dépenses est **100% fonctionnel** ! 🚀

Vous pouvez maintenant l'utiliser en production pour suivre toutes vos dépenses d'entreprise.

---

**Bon test !** 💪


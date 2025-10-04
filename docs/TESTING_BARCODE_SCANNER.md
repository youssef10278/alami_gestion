# 🧪 Guide de Test - Scanner de Code-Barres

## Préparation des Tests

### 1. Codes-barres de test

Vous pouvez utiliser :
- **Produits réels** : Scannez des produits de votre magasin
- **Codes-barres en ligne** : Générez des codes-barres de test sur [barcode.tec-it.com](https://barcode.tec-it.com/fr)
- **Codes-barres imprimés** : Imprimez des codes-barres de test

### 2. Environnement de test

#### Requis
- ✅ Connexion HTTPS (ou localhost)
- ✅ Caméra fonctionnelle
- ✅ Bon éclairage
- ✅ Navigateur moderne (Chrome, Firefox, Safari)

#### Recommandé
- 📱 Tester sur mobile ET desktop
- 🌐 Tester sur différents navigateurs
- 💡 Tester dans différentes conditions d'éclairage

## Scénarios de Test

### Test 1 : Ajout de Produit avec Scanner

#### Étapes
1. Connectez-vous avec `owner@alami.com` / `admin123`
2. Allez dans **Dashboard > Produits**
3. Cliquez sur **"Nouveau Produit"**
4. Cliquez sur le bouton **"Scanner"** à côté du champ SKU
5. Autorisez l'accès à la caméra si demandé
6. Positionnez un code-barres devant la caméra
7. Attendez la détection automatique

#### Résultat attendu
- ✅ Le modal de scan s'ouvre
- ✅ La caméra démarre
- ✅ Un cadre vert apparaît pour guider le scan
- ✅ Le code-barres est détecté automatiquement
- ✅ Le modal se ferme
- ✅ Le champ SKU est rempli avec le code scanné

#### Cas d'erreur à tester
- ❌ Refus de permission caméra → Message d'erreur clair
- ❌ Pas de caméra disponible → Message d'erreur approprié
- ❌ Code-barres illisible → Aucune détection (normal)

---

### Test 2 : Vente Rapide avec Scanner

#### Étapes
1. Connectez-vous avec `seller@alami.com` / `seller123`
2. Allez dans **Dashboard > Ventes**
3. Sélectionnez un client dans la liste
4. Cliquez sur le bouton **"Scanner"** dans la section Produits
5. Scannez le code-barres d'un produit existant

#### Résultat attendu
- ✅ Le modal de scan s'ouvre
- ✅ Le code-barres est détecté
- ✅ Le produit est ajouté au panier automatiquement
- ✅ Notification de succès : "Produit ajouté au panier"
- ✅ Le panier affiche le produit avec quantité 1

#### Cas d'erreur à tester
- ❌ Scanner un code-barres inexistant → Notification "Produit non trouvé"
- ❌ Scanner sans sélectionner de client → Devrait fonctionner quand même

---

### Test 3 : Scan Multiple (Vente)

#### Étapes
1. Dans la page de vente, sélectionnez un client
2. Scannez le produit A
3. Scannez le produit B
4. Scannez à nouveau le produit A

#### Résultat attendu
- ✅ Produit A ajouté (quantité: 1)
- ✅ Produit B ajouté (quantité: 1)
- ✅ Produit A quantité augmentée à 2
- ✅ Total calculé correctement

---

### Test 4 : Performance du Scanner

#### Conditions à tester

| Condition | Distance | Angle | Éclairage | Résultat attendu |
|-----------|----------|-------|-----------|------------------|
| Optimal | 10-15cm | 90° | Bon | ✅ Scan rapide (< 1s) |
| Trop proche | < 5cm | 90° | Bon | ⚠️ Scan lent ou échec |
| Trop loin | > 30cm | 90° | Bon | ⚠️ Scan lent ou échec |
| Angle oblique | 10-15cm | 45° | Bon | ⚠️ Scan possible mais lent |
| Faible lumière | 10-15cm | 90° | Faible | ⚠️ Scan difficile |
| Forte lumière | 10-15cm | 90° | Très fort | ⚠️ Reflets possibles |

---

### Test 5 : Compatibilité Navigateurs

#### Navigateurs à tester

| Navigateur | Desktop | Mobile | Résultat |
|------------|---------|--------|----------|
| Chrome | ✅ | ✅ | |
| Firefox | ✅ | ✅ | |
| Safari | ✅ | ✅ | |
| Edge | ✅ | ✅ | |
| Samsung Internet | - | ✅ | |

#### Procédure
1. Ouvrir l'application dans chaque navigateur
2. Tester le scan d'un code-barres
3. Noter les différences de performance

---

### Test 6 : Formats de Codes-Barres

#### Formats à tester

| Format | Exemple | Utilisation | Résultat |
|--------|---------|-------------|----------|
| EAN-13 | 5901234123457 | Produits Europe | |
| EAN-8 | 96385074 | Petits produits | |
| UPC-A | 042100005264 | Produits USA | |
| Code 128 | ABC123 | Logistique | |
| QR Code | https://... | Info étendue | |

#### Procédure
1. Générer ou trouver un code-barres de chaque format
2. Tester le scan de chaque format
3. Vérifier que le code est correctement détecté

---

### Test 7 : Gestion des Erreurs

#### Scénarios d'erreur

1. **Refus de permission caméra**
   - Refuser l'accès à la caméra
   - Vérifier le message d'erreur
   - Vérifier le bouton "Fermer"

2. **Navigateur non supporté**
   - Tester sur Internet Explorer (si disponible)
   - Vérifier le message d'erreur approprié

3. **Caméra occupée**
   - Ouvrir la caméra dans une autre application
   - Essayer de scanner
   - Vérifier la gestion de l'erreur

4. **Fermeture pendant le scan**
   - Ouvrir le scanner
   - Cliquer sur "Annuler" immédiatement
   - Vérifier que la caméra s'arrête

---

### Test 8 : Mobile Responsive

#### Tests sur mobile

1. **Orientation portrait**
   - Scanner fonctionne correctement
   - Interface adaptée

2. **Orientation paysage**
   - Scanner fonctionne correctement
   - Interface adaptée

3. **Caméra arrière**
   - Utilise automatiquement la caméra arrière
   - Meilleure qualité de scan

4. **Caméra avant**
   - Possibilité de basculer (si implémenté)
   - Scan possible mais moins pratique

---

## Checklist de Test Complète

### Fonctionnalités de Base
- [ ] Scanner s'ouvre correctement
- [ ] Demande de permission caméra
- [ ] Caméra démarre
- [ ] Cadre de scan visible
- [ ] Détection automatique du code
- [ ] Fermeture automatique après scan
- [ ] Bouton annuler fonctionne
- [ ] Caméra s'arrête à la fermeture

### Intégration Produits
- [ ] Bouton scanner visible dans ProductDialog
- [ ] Scan remplit le champ SKU
- [ ] Scan fonctionne uniquement pour nouveaux produits
- [ ] Bouton désactivé pour édition de produit

### Intégration Ventes
- [ ] Bouton scanner visible dans page ventes
- [ ] Scan ajoute produit au panier
- [ ] Notification de succès
- [ ] Notification d'erreur si produit inexistant
- [ ] Scan multiple fonctionne
- [ ] Quantités s'incrémentent correctement

### Performance
- [ ] Scan rapide (< 2 secondes)
- [ ] Pas de lag de l'interface
- [ ] Mémoire libérée après fermeture
- [ ] Pas de fuite mémoire après scans multiples

### Compatibilité
- [ ] Chrome Desktop
- [ ] Chrome Mobile
- [ ] Firefox Desktop
- [ ] Firefox Mobile
- [ ] Safari Desktop
- [ ] Safari iOS
- [ ] Edge Desktop
- [ ] Samsung Internet

### Gestion d'Erreurs
- [ ] Message clair si permission refusée
- [ ] Message clair si navigateur non supporté
- [ ] Message clair si caméra occupée
- [ ] Pas de crash en cas d'erreur

---

## Bugs Connus et Solutions

### Bug : Scanner ne démarre pas
**Solution** :
1. Vérifier que vous êtes sur HTTPS (ou localhost)
2. Vérifier les permissions de la caméra dans le navigateur
3. Recharger la page

### Bug : Scan très lent
**Solution** :
1. Améliorer l'éclairage
2. Nettoyer l'objectif de la caméra
3. Rapprocher le code-barres (10-15cm)
4. Tenir le téléphone stable

### Bug : Code-barres non détecté
**Solution** :
1. Vérifier que le code-barres n'est pas endommagé
2. Vérifier le format du code-barres (supporté ?)
3. Améliorer l'éclairage
4. Ajuster la distance et l'angle

---

## Rapport de Test

### Template de rapport

```markdown
## Test du Scanner de Code-Barres

**Date** : [Date]
**Testeur** : [Nom]
**Environnement** : [Navigateur + OS]

### Résultats

| Test | Statut | Notes |
|------|--------|-------|
| Ajout produit | ✅/❌ | |
| Vente rapide | ✅/❌ | |
| Scan multiple | ✅/❌ | |
| Performance | ✅/❌ | |
| Compatibilité | ✅/❌ | |
| Gestion erreurs | ✅/❌ | |

### Bugs trouvés
1. [Description du bug]
2. [Description du bug]

### Recommandations
1. [Recommandation]
2. [Recommandation]
```

---

## Prochaines Étapes

Après les tests, considérez :
1. Corriger les bugs identifiés
2. Optimiser les performances
3. Améliorer l'UX basé sur les retours
4. Ajouter des fonctionnalités supplémentaires

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2025-01-03


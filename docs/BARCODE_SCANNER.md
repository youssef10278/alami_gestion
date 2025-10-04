# 📱 Scanner de Code-Barres

## Vue d'ensemble

L'application Alami Gestion intègre un scanner de code-barres qui utilise la caméra du téléphone ou de l'ordinateur pour scanner les codes-barres des produits, éliminant ainsi le besoin d'un appareil de scan dédié.

## Fonctionnalités

### 1. **Scan lors de l'ajout de produit**
- Lors de la création d'un nouveau produit, vous pouvez scanner le code-barres au lieu de le saisir manuellement
- Le code scanné sera automatiquement rempli dans le champ SKU/Code-barres
- Bouton "Scanner" à côté du champ SKU

### 2. **Scan lors de la vente**
- Dans la page de vente, vous pouvez scanner directement le code-barres d'un produit
- Le produit sera automatiquement ajouté au panier
- Notification de succès ou d'erreur selon si le produit existe

## Utilisation

### Ajouter un produit avec scan
1. Allez dans **Dashboard > Produits**
2. Cliquez sur **"Nouveau Produit"**
3. Cliquez sur le bouton **"Scanner"** à côté du champ SKU
4. Autorisez l'accès à la caméra si demandé
5. Positionnez le code-barres dans le cadre
6. Le code sera automatiquement détecté et rempli

### Vendre un produit avec scan
1. Allez dans **Dashboard > Ventes**
2. Sélectionnez un client
3. Cliquez sur le bouton **"Scanner"** dans la section Produits
4. Scannez le code-barres du produit
5. Le produit sera ajouté au panier automatiquement

## Types de codes-barres supportés

Le scanner utilise la bibliothèque **html5-qrcode** et supporte les formats suivants :

### Codes-barres 1D
- **EAN-13** (le plus courant en Europe)
- **EAN-8**
- **UPC-A** (courant aux États-Unis)
- **UPC-E**
- **Code 128**
- **Code 39**
- **Code 93**
- **ITF** (Interleaved 2 of 5)
- **Codabar**

### Codes 2D
- **QR Code** (codes QR)
- **Data Matrix**

## Permissions requises

### Navigateur Web
- **Accès à la caméra** : L'application demandera l'autorisation d'accéder à la caméra
- **HTTPS** : Le scan de code-barres nécessite une connexion HTTPS (sauf sur localhost)

### Mobile (PWA)
- **Caméra** : Autorisation d'accès à la caméra
- L'application utilisera automatiquement la caméra arrière sur mobile

## Compatibilité

### Navigateurs supportés
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS 11+)
- ✅ Firefox (Desktop & Mobile)
- ✅ Samsung Internet
- ❌ Internet Explorer (non supporté)

### Systèmes d'exploitation
- ✅ Android 5.0+
- ✅ iOS 11+
- ✅ Windows 10+
- ✅ macOS 10.12+
- ✅ Linux (avec caméra)

## Résolution des problèmes

### "Accès à la caméra refusé"
**Solution** :
1. Vérifiez les paramètres de votre navigateur
2. Autorisez l'accès à la caméra pour ce site
3. Rechargez la page

### "Votre navigateur ne supporte pas l'accès à la caméra"
**Solution** :
1. Mettez à jour votre navigateur
2. Utilisez un navigateur moderne (Chrome, Firefox, Safari)
3. Vérifiez que vous êtes sur HTTPS

### Le scan ne détecte pas le code-barres
**Solutions** :
1. Assurez-vous que le code-barres est bien éclairé
2. Tenez le téléphone stable
3. Ajustez la distance entre la caméra et le code-barres
4. Nettoyez l'objectif de la caméra
5. Vérifiez que le code-barres n'est pas endommagé

### Le scan est lent
**Solutions** :
1. Améliorez l'éclairage
2. Utilisez un appareil plus récent
3. Fermez les autres applications
4. Vérifiez votre connexion internet

## Avantages

### 💰 **Économique**
- Pas besoin d'acheter un scanner de code-barres dédié
- Utilisez simplement votre smartphone

### ⚡ **Rapide**
- Scan instantané
- Ajout automatique au panier
- Gain de temps lors des ventes

### 📱 **Mobile-First**
- Optimisé pour les appareils mobiles
- Interface tactile intuitive
- Utilise la caméra arrière automatiquement

### 🎯 **Précis**
- Évite les erreurs de saisie manuelle
- Détection automatique
- Validation en temps réel

## Bonnes pratiques

1. **Éclairage** : Assurez-vous d'avoir un bon éclairage
2. **Stabilité** : Tenez le téléphone stable pendant le scan
3. **Distance** : Maintenez une distance de 10-20 cm du code-barres
4. **Angle** : Tenez le téléphone perpendiculaire au code-barres
5. **Propreté** : Gardez l'objectif de la caméra propre

## Sécurité et confidentialité

- ✅ Aucune image n'est enregistrée
- ✅ Le scan se fait localement sur votre appareil
- ✅ Aucune donnée n'est envoyée à des serveurs tiers
- ✅ L'accès à la caméra est temporaire (uniquement pendant le scan)

## Développement futur

### Fonctionnalités prévues
- [ ] Scan multiple (plusieurs produits d'affilée)
- [ ] Historique des scans
- [ ] Support des codes QR pour les informations produit
- [ ] Mode scan continu pour inventaire
- [ ] Génération de codes-barres pour les produits

## Support technique

Pour toute question ou problème :
1. Consultez cette documentation
2. Vérifiez les permissions de la caméra
3. Testez avec un autre navigateur
4. Contactez le support technique

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2025-01-03


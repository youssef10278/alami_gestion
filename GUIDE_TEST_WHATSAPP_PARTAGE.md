# 🧪 Guide de Test - Partage WhatsApp du Bon de Livraison

## 📋 Prérequis

Avant de tester, assurez-vous que :

1. ✅ **Cloudinary est configuré** dans votre fichier `.env` :
   ```env
   CLOUDINARY_CLOUD_NAME=votre_cloud_name
   CLOUDINARY_API_KEY=votre_api_key
   CLOUDINARY_API_SECRET=votre_api_secret
   ```

2. ✅ **L'application est lancée** :
   ```bash
   npm run dev
   ```

3. ✅ **Vous avez un client avec un numéro de téléphone** dans la base de données

---

## 🧪 Test 1 : Partage sur Mobile (Web Share API)

### **Étapes**

1. **Ouvrir l'application sur un téléphone mobile** (Android ou iOS)
   - Utilisez votre téléphone ou un émulateur
   - Accédez à `http://localhost:3000` (ou votre URL de développement)

2. **Se connecter** à l'application

3. **Aller dans "Historique des Ventes"**
   - Menu → Ventes → Historique

4. **Trouver une vente avec un client qui a un numéro de téléphone**

5. **Cliquer sur le bouton "WhatsApp"** (icône de partage verte)

6. **Vérifier que le menu de partage natif s'ouvre**
   - Sur Android : Menu de partage Android
   - Sur iOS : Menu de partage iOS

7. **Sélectionner WhatsApp** dans le menu

8. **Vérifier que** :
   - ✅ Le PDF est **déjà attaché** au message
   - ✅ Le message contient le texte pré-rempli
   - ✅ Vous pouvez choisir un contact

9. **Envoyer le message** (ou annuler pour tester)

### **Résultat Attendu**

✅ Le PDF du bon de livraison est directement attaché au message WhatsApp  
✅ Le message contient : "Bonjour [Nom], Voici votre bon de livraison N° [Numéro]..."  
✅ Aucun téléchargement manuel nécessaire

---

## 🧪 Test 2 : Partage sur Desktop (Cloudinary + Lien)

### **Étapes**

1. **Ouvrir l'application sur un ordinateur**
   - Navigateur Chrome, Firefox, Edge, etc.
   - Accédez à `http://localhost:3000`

2. **Se connecter** à l'application

3. **Aller dans "Historique des Ventes"**
   - Menu → Ventes → Historique

4. **Trouver une vente avec un client qui a un numéro de téléphone**

5. **Cliquer sur le bouton "WhatsApp"** (icône de partage verte)

6. **Vérifier que** :
   - ✅ Un nouvel onglet s'ouvre avec WhatsApp Web
   - ✅ Le message contient un lien vers le PDF
   - ✅ Le lien commence par `https://res.cloudinary.com/...`

7. **Cliquer sur le lien** dans le message pour vérifier qu'il fonctionne

8. **Vérifier que le PDF s'ouvre correctement**

### **Résultat Attendu**

✅ WhatsApp Web s'ouvre automatiquement  
✅ Le message contient un lien Cloudinary vers le PDF  
✅ Le lien fonctionne et ouvre le PDF  
✅ Le message contient : "Bonjour [Nom], Voici votre bon de livraison N° [Numéro] : [LIEN]..."

---

## 🧪 Test 3 : Vérification Cloudinary

### **Étapes**

1. **Se connecter à votre compte Cloudinary**
   - Aller sur [cloudinary.com](https://cloudinary.com)

2. **Aller dans "Media Library"**

3. **Naviguer vers le dossier** `alami-gestion/delivery-notes`

4. **Vérifier que** :
   - ✅ Les PDFs uploadés sont présents
   - ✅ Les noms de fichiers sont au format `bon-livraison-[NUMERO]-[TIMESTAMP].pdf`
   - ✅ Les fichiers sont de type `raw` (PDF)

5. **Cliquer sur un PDF** pour vérifier qu'il s'ouvre correctement

### **Résultat Attendu**

✅ Les PDFs sont stockés dans Cloudinary  
✅ Les PDFs sont accessibles via leur URL publique  
✅ Les PDFs contiennent les bonnes informations

---

## 🧪 Test 4 : Cas d'Erreur - Client sans Numéro

### **Étapes**

1. **Créer ou trouver un client sans numéro de téléphone**

2. **Créer une vente pour ce client**

3. **Aller dans "Historique des Ventes"**

4. **Vérifier que** :
   - ✅ Le bouton "WhatsApp" **n'apparaît PAS** pour cette vente
   - ✅ Seuls les boutons "Télécharger BL" et "Imprimer BL" sont visibles

### **Résultat Attendu**

✅ Le bouton WhatsApp est masqué si le client n'a pas de numéro de téléphone

---

## 🧪 Test 5 : Vérification du Nettoyage du Numéro

### **Étapes**

1. **Créer un client avec un numéro formaté** :
   - Exemple : `+212 6 12 34 56 78`
   - Ou : `(212) 612-345-678`

2. **Créer une vente pour ce client**

3. **Cliquer sur "WhatsApp"**

4. **Vérifier dans l'URL WhatsApp** que le numéro est nettoyé :
   - ✅ Pas d'espaces
   - ✅ Pas de tirets
   - ✅ Pas de parenthèses
   - ✅ Format : `https://wa.me/212612345678?text=...`

### **Résultat Attendu**

✅ Le numéro de téléphone est correctement nettoyé avant d'être utilisé dans l'URL WhatsApp

---

## 📊 Checklist Complète

- [ ] Test 1 : Partage sur mobile fonctionne (Web Share API)
- [ ] Test 2 : Partage sur desktop fonctionne (Cloudinary + lien)
- [ ] Test 3 : PDFs sont bien uploadés sur Cloudinary
- [ ] Test 4 : Bouton masqué si pas de numéro de téléphone
- [ ] Test 5 : Numéro de téléphone correctement nettoyé
- [ ] Le PDF contient les bonnes informations (nom client, produits, etc.)
- [ ] Le PDF affiche correctement les textes en arabe
- [ ] Le message WhatsApp est personnalisé avec le nom du client
- [ ] Aucune erreur dans la console du navigateur
- [ ] Aucune erreur dans les logs du serveur

---

## 🐛 Problèmes Courants

### **Problème 1 : "Cloudinary upload error"**

**Cause** : Variables d'environnement Cloudinary non configurées

**Solution** :
```bash
# Vérifier le fichier .env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### **Problème 2 : Web Share API ne fonctionne pas sur mobile**

**Cause** : Navigateur non compatible ou connexion non HTTPS

**Solution** :
- Utiliser Chrome ou Safari sur mobile
- Tester sur un appareil réel (pas émulateur)
- Utiliser HTTPS en production

### **Problème 3 : Le bouton WhatsApp n'apparaît pas**

**Cause** : Le client n'a pas de numéro de téléphone

**Solution** :
- Vérifier que le client a un numéro dans la base de données
- Modifier le client pour ajouter un numéro

---

**Bon test ! 🚀**


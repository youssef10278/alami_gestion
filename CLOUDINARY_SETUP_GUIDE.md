# 🖼️ GUIDE COMPLET - Configuration Cloudinary

## 🎯 Objectif

Fixer **définitivement** le problème d'upload d'images sur Railway en utilisant **Cloudinary**.

---

## ✅ Avantages de Cloudinary

1. ✅ **Gratuit** - 25GB de stockage + 25GB de bande passante/mois
2. ✅ **Persistant** - Images jamais perdues
3. ✅ **CDN intégré** - Chargement ultra-rapide partout dans le monde
4. ✅ **Optimisation automatique** - WebP, compression, redimensionnement
5. ✅ **Transformations** - Recadrage, filtres, watermarks
6. ✅ **Backup automatique** - Cloudinary gère tout
7. ✅ **Scalable** - Supporte des millions d'images

---

## 📋 Étape 1 : Créer un Compte Cloudinary

### **1.1 Inscription**

1. Aller sur https://cloudinary.com/users/register_free
2. Remplir le formulaire :
   - Email
   - Mot de passe
   - Nom de l'entreprise : "Alami Gestion"
3. Cliquer **"Sign Up"**
4. Vérifier votre email

### **1.2 Récupérer les Credentials**

1. Se connecter sur https://cloudinary.com/console
2. Aller dans **Dashboard**
3. Copier les 3 valeurs :
   - **Cloud Name** (ex: `dxyz123abc`)
   - **API Key** (ex: `123456789012345`)
   - **API Secret** (ex: `abcdefghijklmnopqrstuvwxyz123`)

**⚠️ IMPORTANT** : Ne partagez JAMAIS votre API Secret !

---

## 🔧 Étape 2 : Configuration Locale

### **2.1 Ajouter les Variables d'Environnement**

Ouvrir le fichier `.env.local` (ou créer s'il n'existe pas) :

```bash
# Cloudinary
CLOUDINARY_CLOUD_NAME="votre-cloud-name"
CLOUDINARY_API_KEY="votre-api-key"
CLOUDINARY_API_SECRET="votre-api-secret"
```

**Remplacer** les valeurs par celles copiées depuis Cloudinary.

### **2.2 Vérifier l'Installation**

```bash
npm list cloudinary
```

Devrait afficher :
```
alami-gestion@0.1.0
└── cloudinary@2.x.x
```

---

## 🚀 Étape 3 : Configuration Railway

### **3.1 Ajouter les Variables sur Railway**

1. Aller sur https://railway.app
2. Ouvrir votre projet
3. Cliquer sur le service **Web**
4. Aller dans l'onglet **"Variables"**
5. Cliquer **"New Variable"**
6. Ajouter les 3 variables :

```
CLOUDINARY_CLOUD_NAME = votre-cloud-name
CLOUDINARY_API_KEY = votre-api-key
CLOUDINARY_API_SECRET = votre-api-secret
```

7. Cliquer **"Deploy"** pour redémarrer avec les nouvelles variables

---

## 🧪 Étape 4 : Test en Local

### **4.1 Démarrer le Serveur**

```bash
npm run dev
```

### **4.2 Tester l'Upload**

1. Aller sur http://localhost:3000
2. Se connecter (OWNER)
3. **Paramètres** → **Informations de l'entreprise**
4. Cliquer **"Choisir un logo"**
5. Sélectionner une image
6. Cliquer **"Uploader"**

### **4.3 Vérifier sur Cloudinary**

1. Aller sur https://cloudinary.com/console/media_library
2. Ouvrir le dossier **"alami-gestion/logos"**
3. ✅ Votre logo doit apparaître

---

## 📊 Utilisation de l'API

### **Upload d'un Logo**

**Endpoint** : `POST /api/upload/cloudinary`

**FormData** :
```javascript
const formData = new FormData()
formData.append('logo', file)
formData.append('type', 'logo') // ou 'product', 'category', etc.

const response = await fetch('/api/upload/cloudinary', {
  method: 'POST',
  body: formData
})

const data = await response.json()
console.log(data.url) // URL Cloudinary
```

**Réponse** :
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/dxyz123abc/image/upload/v1234567890/alami-gestion/logos/abc123.jpg",
  "publicId": "alami-gestion/logos/abc123",
  "width": 800,
  "height": 800,
  "filename": "logo.png",
  "size": 45678,
  "type": "image/png",
  "message": "Image uploadée avec succès sur Cloudinary"
}
```

---

## 🎨 Optimisations Automatiques

Cloudinary applique automatiquement :

1. ✅ **Compression** - Réduit la taille sans perte de qualité
2. ✅ **Format optimal** - WebP pour les navigateurs modernes, JPG pour les anciens
3. ✅ **Redimensionnement** - Max 1000x1000px
4. ✅ **CDN** - Serveur le plus proche de l'utilisateur

**Exemple d'URL** :
```
https://res.cloudinary.com/dxyz123abc/image/upload/
  w_400,h_400,c_limit/     ← Redimensionnement
  q_auto/                   ← Qualité automatique
  f_auto/                   ← Format automatique
  alami-gestion/logos/abc123.jpg
```

---

## 🔄 Migration des Images Existantes

Si vous avez déjà des images en base64 dans la BDD :

### **Script de Migration** (à créer)

```typescript
// scripts/migrate-images-to-cloudinary.ts
import { prisma } from '@/lib/prisma'
import { uploadImage } from '@/lib/cloudinary'

async function migrateImages() {
  const settings = await prisma.companySettings.findMany()
  
  for (const setting of settings) {
    if (setting.companyLogo && setting.companyLogo.startsWith('data:')) {
      console.log('Migration du logo pour:', setting.companyName)
      
      // Convertir base64 en File
      const base64Data = setting.companyLogo.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')
      const file = new File([buffer], 'logo.png', { type: 'image/png' })
      
      // Upload vers Cloudinary
      const result = await uploadImage(file, 'alami-gestion/logos')
      
      // Mettre à jour la BDD
      await prisma.companySettings.update({
        where: { id: setting.id },
        data: { companyLogo: result.url }
      })
      
      console.log('✅ Logo migré:', result.url)
    }
  }
}

migrateImages()
```

---

## 📝 Modification du Composant d'Upload

### **Avant** (base64) :
```typescript
const response = await fetch('/api/upload/logo', {
  method: 'POST',
  body: formData
})
```

### **Après** (Cloudinary) :
```typescript
const response = await fetch('/api/upload/cloudinary', {
  method: 'POST',
  body: formData
})
```

**C'est tout !** Le reste du code reste identique.

---

## 🔍 Débogage

### **Erreur : "Missing required configuration parameter - cloud_name"**

**Cause** : Variables d'environnement non configurées

**Solution** :
1. Vérifier `.env.local` en local
2. Vérifier les variables sur Railway
3. Redémarrer le serveur

---

### **Erreur : "Invalid API Key"**

**Cause** : API Key incorrecte

**Solution** :
1. Vérifier sur https://cloudinary.com/console
2. Copier à nouveau les credentials
3. Mettre à jour les variables

---

### **Erreur : "Upload failed"**

**Cause** : Problème réseau ou fichier corrompu

**Solution** :
1. Vérifier la connexion internet
2. Essayer avec un autre fichier
3. Vérifier les logs Cloudinary

---

## 📊 Limites du Plan Gratuit

| Ressource | Limite Gratuite |
|-----------|-----------------|
| **Stockage** | 25 GB |
| **Bande passante** | 25 GB/mois |
| **Transformations** | 25 crédits/mois |
| **Images** | Illimité |
| **Vidéos** | 500 MB |

**Pour Alami Gestion** : Largement suffisant ! 🎉

---

## 🎯 Prochaines Étapes

### **Étape 1 : Configuration** ✅
- [x] Installer cloudinary
- [x] Créer lib/cloudinary.ts
- [x] Créer API /api/upload/cloudinary
- [x] Mettre à jour .env.example

### **Étape 2 : Cloudinary Account** ⏳
- [ ] Créer un compte Cloudinary
- [ ] Récupérer les credentials
- [ ] Ajouter les variables en local
- [ ] Ajouter les variables sur Railway

### **Étape 3 : Test** ⏳
- [ ] Tester en local
- [ ] Vérifier sur Cloudinary
- [ ] Déployer sur Railway
- [ ] Tester en production

### **Étape 4 : Migration** ⏳
- [ ] Modifier le composant d'upload
- [ ] Tester l'upload de logo
- [ ] Tester l'upload de produits
- [ ] Migrer les images existantes (optionnel)

---

## 🎉 Résultat Final

**Avant** :
- ❌ Images perdues à chaque redéploiement
- ❌ Limite de 2MB (base64)
- ❌ Pas d'optimisation
- ❌ Pas de CDN

**Après** :
- ✅ Images persistantes à vie
- ✅ Limite de 10MB
- ✅ Optimisation automatique
- ✅ CDN mondial
- ✅ Transformations illimitées
- ✅ Backup automatique

---

**Créé le** : 2025-10-08  
**Version** : 1.0 - Configuration Cloudinary  
**Auteur** : Augment Agent


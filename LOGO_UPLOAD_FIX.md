# 🖼️ CORRECTION - Upload du Logo

## ❌ Problème

**Erreur** : `POST /api/upload/logo 500 (Internal Server Error)`

**Cause** : Railway utilise un **système de fichiers éphémère**
- Les fichiers uploadés dans `/public/uploads/` sont **perdus à chaque redéploiement**
- L'écriture de fichiers sur le disque ne fonctionne pas en production

---

## ✅ Solution Implémentée

### **Stockage en Base64 dans la Base de Données**

Au lieu de sauvegarder le logo sur le disque, on le stocke **directement dans PostgreSQL** en format **base64**.

---

## 🔧 Modifications Techniques

### **Fichier** : `app/api/upload/logo/route.ts`

#### **Avant** (Système de fichiers) :
```typescript
// Créer le dossier uploads
const uploadsDir = join(process.cwd(), 'public', 'uploads', 'logos')
await mkdir(uploadsDir, { recursive: true })

// Écrire le fichier sur le disque
const filepath = join(uploadsDir, filename)
await writeFile(filepath, buffer)

// Retourner l'URL du fichier
const fileUrl = `/uploads/logos/${filename}`
```

**Problème** : ❌ Fichiers perdus à chaque redéploiement

---

#### **Après** (Base de données) :
```typescript
// Convertir en base64
const bytes = await file.arrayBuffer()
const buffer = Buffer.from(bytes)
const base64 = buffer.toString('base64')
const dataUrl = `data:${file.type};base64,${base64}`

// Sauvegarder dans la BDD
const settings = await prisma.companySettings.update({
  where: { id: existingSettings.id },
  data: { companyLogo: dataUrl }
})

// Retourner la data URL
return NextResponse.json({
  success: true,
  url: dataUrl  // data:image/png;base64,iVBORw0KG...
})
```

**Résultat** : ✅ Logo persistant, jamais perdu

---

## 📊 Avantages et Inconvénients

### **Avantages** ✅

1. **Persistance** : Le logo n'est jamais perdu
2. **Simplicité** : Pas besoin de service externe
3. **Gratuit** : Pas de coût supplémentaire
4. **Backup** : Inclus dans les backups de la BDD
5. **Portabilité** : Fonctionne partout (local, Railway, etc.)

### **Inconvénients** ⚠️

1. **Taille limitée** : Max 2MB (au lieu de 5MB)
2. **Performance** : Légèrement plus lent pour les gros logos
3. **Taille BDD** : Augmente la taille de la base de données

---

## 🎯 Limites et Recommandations

### **Limites Actuelles**

- **Taille maximale** : 2MB (réduit de 5MB)
- **Formats acceptés** : JPG, PNG, GIF, WebP
- **Stockage** : Base de données PostgreSQL

### **Recommandations**

#### **Pour les petits logos** (< 500KB) :
✅ **Solution actuelle parfaite** - Base64 en BDD

#### **Pour les gros logos** (> 2MB) :
⚠️ **Utiliser un service externe** :
- **Cloudinary** (gratuit jusqu'à 25GB)
- **AWS S3** (payant mais très fiable)
- **Uploadthing** (gratuit jusqu'à 2GB)
- **Vercel Blob** (payant)

---

## 🧪 Test de l'Upload

### **Étape 1 : Préparer un Logo**
- Format : PNG, JPG, ou WebP
- Taille : < 2MB
- Dimensions recommandées : 200x200px ou 400x400px

### **Étape 2 : Uploader**
1. Aller sur https://alamigestion-production.up.railway.app
2. Se connecter en tant que OWNER
3. **Paramètres** → **Informations de l'entreprise**
4. Cliquer sur **"Choisir un logo"**
5. Sélectionner le fichier
6. Cliquer **"Uploader"**

### **Étape 3 : Vérifier**
- ✅ Message : "Logo uploadé et sauvegardé avec succès"
- ✅ Logo affiché dans l'aperçu
- ✅ Logo sauvegardé dans la BDD

### **Étape 4 : Tester le PDF**
1. **Devis** → Ouvrir un devis
2. Cliquer **"Télécharger PDF"**
3. ✅ Le logo doit apparaître dans le PDF

---

## 📝 Logs Attendus

### **Logs Railway (Upload réussi)** :
```
📤 Upload logo - Début
✅ Session validée: cm...
📁 Fichier reçu: logo.png image/png 45678
🔄 Conversion en base64...
✅ Conversion réussie, taille base64: 61234
💾 Sauvegarde dans la BDD...
🔄 Mise à jour des paramètres existants
✅ Logo sauvegardé avec succès
```

### **Logs Railway (Erreur)** :
```
📤 Upload logo - Début
❌ Accès non autorisé
```
ou
```
📤 Upload logo - Début
✅ Session validée: cm...
❌ Fichier trop volumineux: 3145728
```

---

## 🔍 Débogage

### **Erreur : "Accès non autorisé"**
**Cause** : Vous n'êtes pas connecté en tant que OWNER

**Solution** :
1. Se déconnecter
2. Se reconnecter avec un compte OWNER
3. Réessayer

---

### **Erreur : "Fichier trop volumineux"**
**Cause** : Le fichier dépasse 2MB

**Solution** :
1. Compresser le logo avec https://tinypng.com
2. Ou réduire les dimensions (200x200px recommandé)
3. Réessayer

---

### **Erreur : "Type de fichier non autorisé"**
**Cause** : Format non supporté (ex: SVG, BMP)

**Solution** :
1. Convertir en PNG ou JPG
2. Utiliser https://cloudconvert.com
3. Réessayer

---

## 🚀 Migration Future (Optionnelle)

Si vous voulez migrer vers un service externe plus tard :

### **Option 1 : Cloudinary** (Recommandé)

**Avantages** :
- ✅ Gratuit jusqu'à 25GB
- ✅ Optimisation automatique
- ✅ CDN intégré
- ✅ Transformations d'images

**Installation** :
```bash
npm install cloudinary
```

**Configuration** :
```typescript
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Upload
const result = await cloudinary.uploader.upload(file, {
  folder: 'logos',
  transformation: [{ width: 400, height: 400, crop: 'limit' }]
})

// URL du logo
const logoUrl = result.secure_url
```

---

### **Option 2 : AWS S3**

**Avantages** :
- ✅ Très fiable
- ✅ Scalable
- ✅ Intégration facile

**Inconvénients** :
- ❌ Payant (mais très peu cher)
- ❌ Configuration plus complexe

---

### **Option 3 : Uploadthing**

**Avantages** :
- ✅ Gratuit jusqu'à 2GB
- ✅ Très simple à utiliser
- ✅ Fait pour Next.js

**Installation** :
```bash
npm install uploadthing @uploadthing/react
```

---

## 📊 Résumé

### **Problème** :
❌ Upload de logo échoue sur Railway (système de fichiers éphémère)

### **Solution** :
✅ Stockage en base64 dans PostgreSQL

### **Résultat** :
- ✅ Logo persistant
- ✅ Pas de service externe nécessaire
- ✅ Gratuit
- ✅ Simple
- ⚠️ Limite de 2MB

---

## 🎯 Prochaines Étapes

1. **Attendre 2-3 minutes** que Railway redéploie
2. **Tester l'upload** d'un logo
3. **Vérifier** que le logo apparaît dans les paramètres
4. **Générer un PDF** pour vérifier que le logo apparaît
5. **Célébrer** ! 🎉

---

**Créé le** : 2025-10-08  
**Version** : 1.0 - Stockage Base64  
**Auteur** : Augment Agent


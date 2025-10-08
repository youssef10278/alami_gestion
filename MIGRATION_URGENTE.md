# 🚨 MIGRATION URGENTE - Colonnes de Devis Manquantes

## ❌ **Erreur Actuelle**

```
The column `company_settings.quoteTheme` does not exist in the current database.
```

## 🎯 **Cause**

Le schéma Prisma a été modifié pour ajouter les colonnes de devis, mais **les migrations n'ont pas été appliquées** sur la base de données Railway.

### Colonnes Manquantes :
- ❌ `quoteTheme`
- ❌ `showValidityPeriod`
- ❌ `validityPeriodText`
- ❌ `showTermsAndConditions`
- ❌ `termsAndConditionsText`

---

## ⚡ **SOLUTION RAPIDE (5 minutes)**

### **Option 1 : Script Automatique** (Recommandé)

```bash
# 1. Committer et pusher le code
git add .
git commit -m "feat: Add quote columns migration script"
git push

# 2. Attendre que Railway redéploie (2-3 min)

# 3. Exécuter le script de migration
railway run npm run db:migrate:quote
```

**Résultat attendu** :
```
✅ quoteTheme ajoutée
✅ showValidityPeriod ajoutée
✅ validityPeriodText ajoutée
✅ showTermsAndConditions ajoutée
✅ termsAndConditionsText ajoutée
✅ MIGRATION RÉUSSIE
```

---

### **Option 2 : Prisma DB Push** (Plus Simple)

```bash
# Force la synchronisation du schéma avec la DB
railway run npx prisma db push
```

⚠️ **Attention** : Peut perdre des données si le schéma a des changements incompatibles.

---

### **Option 3 : SQL Manuel** (Si les autres échouent)

```bash
# 1. Se connecter à la DB
railway connect

# 2. Copier-coller ce SQL :
```

```sql
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS "quoteTheme" TEXT NOT NULL DEFAULT 'modern';

ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS "showValidityPeriod" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS "validityPeriodText" TEXT NOT NULL DEFAULT 'Ce devis est valable 30 jours à compter de la date d''émission.';

ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS "showTermsAndConditions" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS "termsAndConditionsText" TEXT NOT NULL DEFAULT 'Conditions générales de vente disponibles sur demande.';
```

```bash
# 3. Vérifier
\d company_settings
```

---

## 📋 **Étapes Détaillées**

### **Étape 1 : Déployer le Code**

```bash
git add .
git commit -m "feat: Add quote design columns migration"
git push
```

### **Étape 2 : Attendre le Redéploiement**

- Aller sur Railway Dashboard
- Vérifier que le déploiement est terminé (2-3 min)
- Vérifier les logs pour "Build successful"

### **Étape 3 : Exécuter la Migration**

#### Via Railway CLI :
```bash
railway run npm run db:migrate:quote
```

#### Via Railway Dashboard :
1. Ouvrir le **Shell** dans Railway
2. Exécuter :
   ```bash
   npm run db:migrate:quote
   ```

### **Étape 4 : Vérifier**

```bash
# Tester l'API
curl https://alamigestion-production.up.railway.app/api/settings/quote-design

# Devrait retourner 200 au lieu de 500
```

---

## 🧪 **Tests Post-Migration**

### Test 1 : Vérifier les Colonnes

```bash
railway connect

# Dans psql :
\d company_settings

# Chercher :
# - quoteTheme
# - showValidityPeriod
# - validityPeriodText
# - showTermsAndConditions
# - termsAndConditionsText
```

### Test 2 : Tester l'API

```bash
# GET - Récupérer les paramètres
curl https://alamigestion-production.up.railway.app/api/settings/quote-design

# Devrait retourner un JSON avec quoteTheme, etc.
```

### Test 3 : Tester l'Interface

1. Se connecter à l'application
2. Aller dans **Paramètres** → **Designer de Devis**
3. Modifier une couleur
4. Cliquer **Sauvegarder**
5. ✅ Devrait afficher "Paramètres sauvegardés"

---

## 🔍 **Diagnostic**

### Vérifier si les Colonnes Existent

```bash
railway run node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name = 'company_settings' 
    AND column_name LIKE '%quote%' OR column_name LIKE '%validity%' OR column_name LIKE '%terms%'
\`.then(console.log).finally(() => prisma.\$disconnect());
"
```

---

## 🚨 **Si Ça Ne Fonctionne Pas**

### Problème 1 : "Permission denied"

**Solution** :
```bash
# Vérifier les permissions de l'utilisateur DB
railway connect

# Dans psql :
\du

# L'utilisateur doit avoir CREATE privilege
```

### Problème 2 : "Migration already applied"

**Solution** :
```bash
# Vérifier l'état des migrations
railway run npx prisma migrate status

# Réinitialiser si nécessaire
railway run npx prisma migrate resolve --applied <migration_name>
```

### Problème 3 : "Database locked"

**Solution** :
```bash
# Redémarrer le service Railway
railway restart

# Puis réessayer
railway run npm run db:migrate:quote
```

---

## 📊 **Logs Attendus**

### Migration Réussie :
```
🔧 Migration des colonnes de devis
============================================================

1️⃣ Vérification des colonnes existantes...
   ❌ quoteTheme
   ❌ showValidityPeriod
   ❌ validityPeriodText
   ❌ showTermsAndConditions
   ❌ termsAndConditionsText

⚠️  5 colonne(s) manquante(s): quoteTheme, showValidityPeriod, ...

2️⃣ Ajout des colonnes manquantes...
   Ajout de quoteTheme...
   ✅ quoteTheme ajoutée
   Ajout de showValidityPeriod...
   ✅ showValidityPeriod ajoutée
   ...

3️⃣ Vérification finale...
   ✅ quoteTheme
   ✅ showValidityPeriod
   ✅ validityPeriodText
   ✅ showTermsAndConditions
   ✅ termsAndConditionsText

✅ Toutes les colonnes ont été ajoutées avec succès!

✅ MIGRATION RÉUSSIE
```

---

## 🎯 **Résultat Final**

Après migration :

1. ✅ Colonnes de devis ajoutées à la DB
2. ✅ API `/api/settings/quote-design` fonctionne
3. ✅ Designer de Devis sauvegarde correctement
4. ✅ Plus d'erreur 500

---

## 🔗 **Commandes Utiles**

```bash
# Vérifier l'état des migrations
railway run npx prisma migrate status

# Appliquer toutes les migrations
railway run npx prisma migrate deploy

# Synchroniser le schéma (force)
railway run npx prisma db push

# Migrer les colonnes de devis
railway run npm run db:migrate:quote

# Vérifier la DB
railway connect

# Voir les logs
railway logs
```

---

## ⏱️ **Timeline**

| Étape | Temps | Action |
|-------|-------|--------|
| 1 | 1 min | Commit + Push |
| 2 | 2-3 min | Attendre redéploiement |
| 3 | 1 min | Exécuter migration |
| 4 | 30 sec | Vérifier |
| 5 | 30 sec | Tester interface |

**Total : ~5-6 minutes**

---

## 💡 **Pourquoi Ce Problème ?**

1. Le schéma Prisma (`prisma/schema.prisma`) a été modifié
2. Les colonnes de devis ont été ajoutées au modèle `CompanySettings`
3. **MAIS** aucune migration n'a été créée/appliquée
4. La DB Railway a l'ancien schéma sans ces colonnes
5. L'API essaie d'accéder à des colonnes qui n'existent pas → 500

---

## 🔧 **Prévention Future**

### Toujours créer une migration après modification du schéma :

```bash
# 1. Modifier prisma/schema.prisma
# 2. Créer la migration
npx prisma migrate dev --name add_quote_fields

# 3. Committer la migration
git add prisma/migrations
git commit -m "feat: Add quote fields migration"

# 4. Pusher
git push

# Railway appliquera automatiquement les migrations au déploiement
```

---

**Date** : 2025-01-08  
**Priorité** : 🔴 CRITIQUE  
**Statut** : ⚡ ACTION IMMÉDIATE REQUISE  
**Temps estimé** : 5-6 minutes


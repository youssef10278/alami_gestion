# 🔧 Dépannage - Erreur 500 sur /api/expenses/categories

## 🐛 Erreur Rencontrée

```
/api/expenses/categories:1 Failed to load resource: the server responded with a status of 500 ()
```

Cette erreur se produit lors de la création d'une catégorie de dépense.

---

## 🔍 Causes Possibles

### Cause 1 : Les tables n'existent pas dans la base de données ⚠️ **PLUS PROBABLE**

**Symptôme** : Erreur 500 sur toutes les routes `/api/expenses/*`

**Solution** : Exécuter la migration SQL sur Railway

### Cause 2 : Le client Prisma n'a pas été régénéré

**Symptôme** : Erreur TypeScript ou erreur Prisma

**Solution** : Régénérer le client Prisma

### Cause 3 : L'application n'a pas été redéployée

**Symptôme** : Les changements ne sont pas pris en compte

**Solution** : Redéployer l'application sur Railway

---

## ✅ Solution Étape par Étape

### Étape 1 : Vérifier si les Tables Existent

1. Ouvrez **pgAdmin 4**
2. Connectez-vous à votre base Railway
3. Ouvrez **Query Tool**
4. Exécutez le script `CHECK_TABLES.sql` :

```sql
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('ExpenseCategory', 'Expense')
ORDER BY table_name;
```

**Résultat attendu** :
```
table_name       | table_type
-----------------|-----------
Expense          | BASE TABLE
ExpenseCategory  | BASE TABLE
```

**Si les tables n'existent PAS** :
- ❌ Les tables ne sont pas créées
- ✅ **Passez à l'Étape 2**

**Si les tables existent** :
- ✅ Les tables sont créées
- ✅ **Passez à l'Étape 3**

---

### Étape 2 : Exécuter la Migration SQL (SI LES TABLES N'EXISTENT PAS)

1. Dans pgAdmin 4, ouvrez **Query Tool**
2. Ouvrez le fichier **`MIGRATION_RAILWAY.sql`**
3. Copiez tout le contenu (Ctrl+A, Ctrl+C)
4. Collez dans pgAdmin 4 (Ctrl+V)
5. Cliquez sur **▶️ Execute** (F5)
6. Attendez la fin de l'exécution

**Vérification** :
```
✅ Migration terminée avec succès !
📊 Tables créées: ExpenseCategory, Expense
🏷️ Catégories créées: 15
```

7. Vérifiez que les tables existent maintenant :

```sql
SELECT COUNT(*) FROM "ExpenseCategory";
```

**Résultat attendu** : `15`

---

### Étape 3 : Régénérer le Client Prisma (OBLIGATOIRE)

1. Ouvrez un terminal dans votre projet local
2. Exécutez :

```bash
npx prisma generate
```

**Résultat attendu** :
```
✔ Generated Prisma Client (6.x.x) to ./node_modules/@prisma/client
```

---

### Étape 4 : Redéployer l'Application sur Railway

#### Option A : Via Git (Recommandé)

1. Commitez vos changements :

```bash
git add .
git commit -m "fix: Regenerate Prisma client for expenses module"
git push origin main
```

2. Railway détectera le push et redéploiera automatiquement
3. Attendez 2-5 minutes

#### Option B : Redéploiement Manuel

1. Allez sur [Railway.app](https://railway.app)
2. Ouvrez votre projet **Alami Gestion**
3. Cliquez sur votre service **Next.js**
4. Cliquez sur **Deployments**
5. Cliquez sur **Redeploy** (icône ⟳)
6. Attendez 2-5 minutes

---

### Étape 5 : Vérifier les Logs Railway

1. Sur Railway.app, ouvrez votre service Next.js
2. Cliquez sur **Deployments**
3. Cliquez sur le dernier déploiement
4. Consultez les **Logs**

**Recherchez** :
- ✅ `Prisma schema loaded from prisma/schema.prisma`
- ✅ `Prisma Client generated`
- ✅ `Server started on port 3000`

**Erreurs à surveiller** :
- ❌ `PrismaClientInitializationError`
- ❌ `Table 'ExpenseCategory' does not exist`
- ❌ `Invalid prisma.expenseCategory`

---

### Étape 6 : Tester l'Application

1. Ouvrez votre application déployée
2. Connectez-vous avec un compte **OWNER**
3. Cliquez sur **💸 Dépenses**
4. Cliquez sur **"+ Catégorie"**
5. Essayez de créer une catégorie

**Résultat attendu** :
- ✅ Toast de succès : "Catégorie créée"
- ✅ La catégorie apparaît dans la liste

---

## 🔍 Diagnostic Avancé

### Vérifier les Logs de l'API

Si l'erreur persiste, vérifiez les logs détaillés :

1. Sur Railway, ouvrez les **Logs** en temps réel
2. Dans votre application, essayez de créer une catégorie
3. Observez les logs

**Erreurs possibles** :

#### Erreur 1 : Table n'existe pas
```
PrismaClientKnownRequestError: 
Invalid `prisma.expenseCategory.findMany()` invocation:
Table 'public.ExpenseCategory' does not exist
```

**Solution** : Exécutez `MIGRATION_RAILWAY.sql` dans pgAdmin 4

#### Erreur 2 : Client Prisma non généré
```
PrismaClientInitializationError:
Prisma Client could not locate the binaries
```

**Solution** : Exécutez `npx prisma generate` et redéployez

#### Erreur 3 : Enum PaymentMethod n'existe pas
```
type "PaymentMethod" does not exist
```

**Solution** : Créez l'enum dans pgAdmin 4 :

```sql
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'CHECK');
```

#### Erreur 4 : Problème de connexion à la base
```
Can't reach database server at `xxx.railway.app:5432`
```

**Solution** : Vérifiez les variables d'environnement Railway (DATABASE_URL)

---

## 🧪 Tests de Vérification

### Test 1 : Vérifier que les tables existent

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('ExpenseCategory', 'Expense');
```

**Résultat attendu** : 2 lignes (ExpenseCategory, Expense)

### Test 2 : Vérifier les catégories

```sql
SELECT COUNT(*) FROM "ExpenseCategory" WHERE "isActive" = true;
```

**Résultat attendu** : 15

### Test 3 : Tester l'API directement

Ouvrez votre navigateur et allez sur :
```
https://votre-app.railway.app/api/expenses/categories
```

**Résultat attendu** : JSON avec 15 catégories

**Si erreur 401** : Normal, vous devez être connecté

**Si erreur 500** : Problème avec la base de données ou Prisma

---

## 📋 Checklist de Résolution

Cochez au fur et à mesure :

- [ ] Les tables ExpenseCategory et Expense existent dans la base
- [ ] Les 15 catégories par défaut sont créées
- [ ] Le client Prisma a été régénéré (`npx prisma generate`)
- [ ] L'application a été redéployée sur Railway
- [ ] Les logs Railway ne montrent pas d'erreur Prisma
- [ ] L'API `/api/expenses/categories` répond (même si 401)
- [ ] La page `/dashboard/expenses` se charge sans erreur
- [ ] La création de catégorie fonctionne

---

## 🆘 Si le Problème Persiste

### 1. Vérifier la Variable DATABASE_URL

Sur Railway :
1. Ouvrez votre service Next.js
2. Allez dans **Variables**
3. Vérifiez que `DATABASE_URL` pointe vers votre base PostgreSQL

Format attendu :
```
postgresql://postgres:password@host:port/database
```

### 2. Vérifier le fichier .env local

Si vous testez en local, vérifiez `.env` :

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/alami_gestion"
```

### 3. Réinitialiser Prisma

En dernier recours :

```bash
# Supprimer le client Prisma
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma

# Réinstaller
npm install

# Régénérer
npx prisma generate

# Redéployer
git add .
git commit -m "fix: Reinitialize Prisma client"
git push origin main
```

---

## 📞 Support

Si aucune solution ne fonctionne :

1. Copiez les logs d'erreur complets de Railway
2. Vérifiez que la migration SQL a bien été exécutée
3. Vérifiez que le client Prisma a été régénéré
4. Vérifiez que l'application a été redéployée

---

## ✅ Solution Rapide (TL;DR)

```bash
# 1. Exécuter MIGRATION_RAILWAY.sql dans pgAdmin 4

# 2. Régénérer Prisma
npx prisma generate

# 3. Redéployer
git add .
git commit -m "fix: Add expenses module"
git push origin main

# 4. Attendre 2-5 minutes

# 5. Tester l'application
```

---

**Bonne chance !** 🚀


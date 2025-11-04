# 🐘 Guide d'Exécution de la Migration avec pgAdmin 4

## 📋 Prérequis

- ✅ pgAdmin 4 installé sur votre ordinateur
- ✅ Accès à votre base de données Railway (URL de connexion)
- ✅ Le fichier `MIGRATION_RAILWAY.sql` prêt

---

## 🔗 Étape 1 : Connexion à Railway depuis pgAdmin 4

### 1.1 Récupérer les Informations de Connexion Railway

1. Allez sur [Railway.app](https://railway.app)
2. Ouvrez votre projet **Alami Gestion**
3. Cliquez sur votre service **PostgreSQL**
4. Dans l'onglet **Variables**, notez :
   - `PGHOST` (exemple: `monorail.proxy.rlwy.net`)
   - `PGPORT` (exemple: `12345`)
   - `PGDATABASE` (exemple: `railway`)
   - `PGUSER` (exemple: `postgres`)
   - `PGPASSWORD` (votre mot de passe)

### 1.2 Créer une Nouvelle Connexion dans pgAdmin 4

1. Ouvrez **pgAdmin 4**
2. Clic droit sur **Servers** → **Register** → **Server...**
3. Dans l'onglet **General** :
   - **Name** : `Railway - Alami Gestion`
4. Dans l'onglet **Connection** :
   - **Host name/address** : Collez `PGHOST` (ex: `monorail.proxy.rlwy.net`)
   - **Port** : Collez `PGPORT` (ex: `12345`)
   - **Maintenance database** : Collez `PGDATABASE` (ex: `railway`)
   - **Username** : Collez `PGUSER` (ex: `postgres`)
   - **Password** : Collez `PGPASSWORD`
   - ✅ Cochez **Save password**
5. Dans l'onglet **SSL** :
   - **SSL mode** : Sélectionnez **Require**
6. Cliquez sur **Save**

### 1.3 Vérifier la Connexion

1. Dans le panneau de gauche, développez **Servers**
2. Cliquez sur **Railway - Alami Gestion**
3. Si la connexion réussit, vous verrez :
   - ✅ **Databases** → **railway** (ou le nom de votre DB)
   - ✅ **Schemas** → **public**
   - ✅ **Tables** (vos tables existantes : User, Product, Sale, etc.)

---

## 📝 Étape 2 : Ouvrir l'Éditeur de Requêtes

1. Dans le panneau de gauche, développez :
   - **Servers** → **Railway - Alami Gestion** → **Databases** → **railway** (ou votre DB)
2. Clic droit sur **railway** → **Query Tool**
3. Une nouvelle fenêtre d'éditeur SQL s'ouvre

---

## 📄 Étape 3 : Charger le Script SQL

### Option A : Copier-Coller (Recommandé)

1. Ouvrez le fichier `MIGRATION_RAILWAY.sql` avec un éditeur de texte
2. Sélectionnez tout le contenu (Ctrl+A)
3. Copiez (Ctrl+C)
4. Retournez dans pgAdmin 4, dans l'éditeur de requêtes
5. Collez le script (Ctrl+V)

### Option B : Ouvrir le Fichier

1. Dans l'éditeur de requêtes, cliquez sur l'icône **📁 Open File**
2. Naviguez jusqu'au fichier `MIGRATION_RAILWAY.sql`
3. Sélectionnez-le et cliquez sur **Ouvrir**

---

## ▶️ Étape 4 : Exécuter le Script

1. Vérifiez que tout le script est bien chargé dans l'éditeur
2. Cliquez sur le bouton **▶️ Execute/Refresh** (ou appuyez sur **F5**)
3. Attendez l'exécution (quelques secondes)

---

## ✅ Étape 5 : Vérifier les Résultats

### 5.1 Vérifier les Messages

Dans le panneau **Messages** en bas, vous devriez voir :

```
Query returned successfully in XXX msec.

NOTICE:  ✅ Migration terminée avec succès !
NOTICE:  📊 Tables créées: ExpenseCategory, Expense
NOTICE:  🏷️ Catégories créées: 15
NOTICE:  🚀 Le module Gestion des Dépenses est maintenant actif !
```

### 5.2 Vérifier les Tables Créées

1. Dans le panneau de gauche, développez :
   - **Schemas** → **public** → **Tables**
2. Cliquez sur **🔄 Refresh** (clic droit sur Tables → Refresh)
3. Vous devriez voir 2 nouvelles tables :
   - ✅ **ExpenseCategory**
   - ✅ **Expense**

### 5.3 Vérifier les Catégories Créées

1. Dans l'éditeur de requêtes, exécutez cette requête :

```sql
SELECT 
    "name",
    "icon",
    "color",
    "description"
FROM "ExpenseCategory"
ORDER BY "name";
```

2. Vous devriez voir **15 catégories** :
   - 🏢 Loyer
   - 💰 Salaires
   - ⚡ Électricité
   - 💧 Eau
   - 🌐 Internet
   - 📱 Téléphone
   - 📦 Fournitures
   - 📢 Marketing
   - 🚗 Transport
   - 🔧 Entretien
   - 🛡️ Assurance
   - 📊 Taxes
   - 📚 Formation
   - 🍽️ Repas
   - 📝 Autre

### 5.4 Vérifier les Index

Exécutez cette requête pour voir tous les index créés :

```sql
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('ExpenseCategory', 'Expense')
ORDER BY tablename, indexname;
```

Vous devriez voir **7 index** :
- ExpenseCategory_name_key (UNIQUE)
- ExpenseCategory_name_idx
- ExpenseCategory_isActive_idx
- Expense_categoryId_idx
- Expense_userId_idx
- Expense_date_idx
- Expense_isActive_idx

### 5.5 Vérifier les Foreign Keys

Exécutez cette requête :

```sql
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'Expense';
```

Vous devriez voir **2 foreign keys** :
- Expense.categoryId → ExpenseCategory.id
- Expense.userId → User.id

---

## 🎯 Étape 6 : Tester la Migration

### Test 1 : Compter les Catégories

```sql
SELECT COUNT(*) as total_categories 
FROM "ExpenseCategory" 
WHERE "isActive" = true;
```

**Résultat attendu** : `15`

### Test 2 : Compter les Dépenses

```sql
SELECT COUNT(*) as total_expenses 
FROM "Expense" 
WHERE "isActive" = true;
```

**Résultat attendu** : `0` (aucune dépense pour le moment)

### Test 3 : Voir la Structure de la Table ExpenseCategory

```sql
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'ExpenseCategory'
ORDER BY ordinal_position;
```

### Test 4 : Voir la Structure de la Table Expense

```sql
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'Expense'
ORDER BY ordinal_position;
```

---

## 🚀 Étape 7 : Redéployer l'Application Railway

### 7.1 Générer le Client Prisma

Après avoir appliqué la migration, vous devez régénérer le client Prisma :

1. Ouvrez un terminal dans votre projet local
2. Exécutez :

```bash
npx prisma generate
```

### 7.2 Redéployer sur Railway

**Option A : Push automatique (si connecté à Git)**

1. Commitez vos changements :

```bash
git add .
git commit -m "feat: Add expense management module"
git push origin main
```

2. Railway détectera le push et redéploiera automatiquement

**Option B : Redéploiement manuel**

1. Allez sur [Railway.app](https://railway.app)
2. Ouvrez votre projet
3. Cliquez sur votre service **Next.js**
4. Cliquez sur **Deploy** → **Redeploy**

### 7.3 Vérifier le Déploiement

1. Attendez que le déploiement soit terminé (2-5 minutes)
2. Ouvrez votre application déployée
3. Connectez-vous avec un compte **OWNER**
4. Vérifiez que le lien **💸 Dépenses** apparaît dans le menu
5. Cliquez dessus et testez la création d'une dépense

---

## 🐛 Dépannage

### Erreur : "relation 'PaymentMethod' does not exist"

**Cause** : L'enum `PaymentMethod` n'existe pas dans votre base de données.

**Solution** : Vérifiez que l'enum existe avec cette requête :

```sql
SELECT enumlabel 
FROM pg_enum 
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
WHERE pg_type.typname = 'PaymentMethod';
```

Si l'enum n'existe pas, créez-le :

```sql
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'CHECK');
```

### Erreur : "permission denied for table User"

**Cause** : L'utilisateur PostgreSQL n'a pas les permissions nécessaires.

**Solution** : Connectez-vous avec l'utilisateur `postgres` (celui fourni par Railway).

### Erreur : "duplicate key value violates unique constraint"

**Cause** : Vous essayez de réexécuter le script alors que les catégories existent déjà.

**Solution** : C'est normal ! Le script utilise `WHERE NOT EXISTS` pour éviter les doublons. Ignorez cette erreur.

### Les Emojis ne s'affichent pas correctement

**Cause** : Problème d'encodage UTF-8.

**Solution** : Vérifiez l'encodage de votre base de données :

```sql
SHOW SERVER_ENCODING;
```

Devrait retourner `UTF8`. Si ce n'est pas le cas, contactez le support Railway.

---

## 📊 Requêtes Utiles

### Voir toutes les catégories avec le nombre de dépenses

```sql
SELECT 
    ec."name",
    ec."icon",
    ec."color",
    COUNT(e."id") as total_expenses,
    COALESCE(SUM(e."amount"), 0) as total_amount
FROM "ExpenseCategory" ec
LEFT JOIN "Expense" e ON e."categoryId" = ec."id" AND e."isActive" = true
WHERE ec."isActive" = true
GROUP BY ec."id", ec."name", ec."icon", ec."color"
ORDER BY total_amount DESC;
```

### Voir les dépenses du mois en cours

```sql
SELECT 
    e."description",
    e."amount",
    e."date",
    ec."name" as category,
    ec."icon",
    e."paymentMethod"
FROM "Expense" e
JOIN "ExpenseCategory" ec ON e."categoryId" = ec."id"
WHERE e."isActive" = true
    AND EXTRACT(MONTH FROM e."date") = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM e."date") = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY e."date" DESC;
```

### Total des dépenses par mois

```sql
SELECT 
    TO_CHAR(e."date", 'YYYY-MM') as month,
    COUNT(e."id") as total_expenses,
    SUM(e."amount") as total_amount
FROM "Expense" e
WHERE e."isActive" = true
GROUP BY TO_CHAR(e."date", 'YYYY-MM')
ORDER BY month DESC;
```

---

## ✅ Checklist Finale

Avant de fermer pgAdmin 4, vérifiez :

- [ ] Les 2 tables sont créées (ExpenseCategory, Expense)
- [ ] Les 15 catégories sont présentes
- [ ] Les 7 index sont créés
- [ ] Les 2 foreign keys sont actives
- [ ] Aucune erreur dans les messages
- [ ] Le client Prisma a été régénéré (`npx prisma generate`)
- [ ] L'application a été redéployée sur Railway
- [ ] Le module Dépenses est accessible dans l'application

---

## 🎉 Félicitations !

Votre base de données Railway est maintenant à jour avec le module de gestion des dépenses ! 🚀

Vous pouvez maintenant utiliser l'application pour :
- ✅ Créer des catégories de dépenses
- ✅ Enregistrer vos dépenses
- ✅ Analyser vos coûts
- ✅ Optimiser votre rentabilité

**Bon travail !** 💪


# 🔧 Configuration Manuelle - Alami Gestion

## Étape 1 : Créer la base de données PostgreSQL

### Option A : Via psql (ligne de commande)

Ouvrez un terminal et exécutez :

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Dans psql, créer la base de données
CREATE DATABASE alami_db;

# Quitter psql
\q
```

### Option B : Via pgAdmin

1. Ouvrir pgAdmin
2. Clic droit sur "Databases" > "Create" > "Database"
3. Nom : `alami_db`
4. Cliquer sur "Save"

## Étape 2 : Configurer le fichier .env

Ouvrez le fichier `.env` et modifiez la ligne `DATABASE_URL` :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/alami_db?schema=public"
```

Remplacez `VOTRE_MOT_DE_PASSE` par votre mot de passe PostgreSQL.

**Exemple :**
```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/alami_db?schema=public"
```

## Étape 3 : Initialiser la base de données

Dans le terminal du projet, exécutez :

```bash
# Synchroniser le schéma Prisma avec la base de données
npm run db:push
```

Vous devriez voir :
```
✔ Generated Prisma Client
Your database is now in sync with your Prisma schema.
```

## Étape 4 : Insérer les données de test

```bash
# Remplir la base de données avec des données de test
npm run db:seed
```

Vous devriez voir :
```
🌱 Seeding database...
✅ Owner created: owner@alami.com
✅ Seller created: seller@alami.com
✅ Categories created: 3
✅ Products created: 3
✅ Customers created: 2
🎉 Seeding completed!
```

## Étape 5 : Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur : **http://localhost:3000**

## 🔑 Identifiants de connexion

### Compte Propriétaire (Admin complet)
- **Email :** owner@alami.com
- **Mot de passe :** admin123

### Compte Vendeur (Accès limité)
- **Email :** seller@alami.com
- **Mot de passe :** seller123

## ❓ Problèmes courants

### Erreur : "password authentication failed"
- Vérifiez que le mot de passe dans `.env` est correct
- Vérifiez que l'utilisateur PostgreSQL existe

### Erreur : "database alami_db does not exist"
- Créez la base de données avec `CREATE DATABASE alami_db;`

### Erreur : "Port 3000 is already in use"
- Un autre processus utilise le port 3000
- Arrêtez l'autre processus ou changez le port :
  ```bash
  npm run dev -- -p 3001
  ```

### Erreur Prisma
- Régénérez le client Prisma :
  ```bash
  npx prisma generate
  ```

## 🎯 Vérification

Une fois l'application lancée :

1. Ouvrez http://localhost:3000
2. Vous serez redirigé vers la page de connexion
3. Connectez-vous avec `owner@alami.com` / `admin123`
4. Vous devriez voir le tableau de bord avec les statistiques

## 📊 Données de test créées

- **2 utilisateurs** (1 propriétaire, 1 vendeur)
- **3 catégories** (Électronique, Vêtements, Alimentation)
- **3 produits** (Smartphone, T-Shirt, Café)
- **2 clients** (Ahmed Benali, Fatima Zahra)

## 🛠️ Commandes utiles

```bash
# Voir la base de données avec une interface graphique
npm run db:studio

# Réinitialiser complètement la base de données
npm run db:push -- --force-reset
npm run db:seed

# Vérifier les logs de l'application
# Les logs s'affichent dans le terminal où vous avez lancé npm run dev
```

## ✅ Prochaines étapes

Une fois l'application lancée avec succès :

1. Explorer le tableau de bord
2. Tester la navigation entre les pages
3. Vérifier les différents rôles (Propriétaire vs Vendeur)
4. Commencer à développer les modules manquants

Bon développement ! 🚀


# 🚀 Guide de Démarrage Rapide - Alami Gestion

## ⚡ Démarrage en 5 minutes

### 1️⃣ Installer PostgreSQL (si pas déjà installé)

**Windows:**
- Télécharger depuis [postgresql.org](https://www.postgresql.org/download/windows/)
- Installer avec les paramètres par défaut
- Noter le mot de passe du superutilisateur

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2️⃣ Créer la base de données

Ouvrir le terminal PostgreSQL (psql) :

```sql
CREATE DATABASE alami_db;
CREATE USER alami_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE alami_db TO alami_user;
```

### 3️⃣ Configurer l'application

Modifier le fichier `.env` :

```env
DATABASE_URL="postgresql://alami_user:votre_mot_de_passe@localhost:5432/alami_db?schema=public"
JWT_SECRET="changez-ceci-par-une-chaine-aleatoire-securisee"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4️⃣ Initialiser le projet

```bash
# Installer les dépendances
npm install

# Créer les tables dans la base de données
npm run db:push

# Remplir avec des données de test
npm run db:seed
```

### 5️⃣ Lancer l'application

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🔐 Se connecter

### Compte Propriétaire (Admin)
- **Email:** owner@alami.com
- **Mot de passe:** admin123
- **Accès:** Toutes les fonctionnalités

### Compte Vendeur
- **Email:** seller@alami.com
- **Mot de passe:** seller123
- **Accès:** Ventes, Produits, Clients (lecture seule pour certaines sections)

## 📋 Prochaines étapes

1. **Explorer le tableau de bord** - Voir les statistiques en temps réel
2. **Ajouter des produits** - Aller dans Produits > Nouveau produit
3. **Créer des clients** - Aller dans Clients > Nouveau client
4. **Faire une vente** - Aller dans Ventes > Nouvelle vente
5. **Gérer le crédit** - Voir les crédits clients et paiements
6. **Générer des documents** - Factures, devis, bons de livraison

## 🛠️ Commandes utiles

```bash
# Voir la base de données avec une interface graphique
npm run db:studio

# Réinitialiser la base de données
npm run db:push -- --force-reset
npm run db:seed

# Build de production
npm run build
npm run start
```

## ❓ Problèmes courants

### Erreur de connexion à la base de données
- Vérifier que PostgreSQL est démarré
- Vérifier les identifiants dans `.env`
- Vérifier que la base de données existe

### Port 3000 déjà utilisé
```bash
# Changer le port dans package.json
"dev": "next dev -p 3001"
```

### Erreur Prisma
```bash
# Régénérer le client Prisma
npx prisma generate
```

## 📞 Support

Pour toute question ou problème, consultez la documentation complète dans `README.md`.

## 🎯 Fonctionnalités à tester

- ✅ Connexion/Déconnexion
- ✅ Tableau de bord avec KPI
- ✅ Gestion des produits (CRUD)
- ✅ Gestion des clients (CRUD)
- ✅ Création de ventes
- ✅ Système de crédit
- ✅ Génération de documents
- ✅ Responsive design (mobile/desktop)

Bon développement ! 🚀


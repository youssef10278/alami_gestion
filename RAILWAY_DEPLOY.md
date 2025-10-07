# 🚀 Déploiement Railway via GitHub

## ✅ Prérequis
- [x] Code poussé sur GitHub
- [x] Configuration Railway ajoutée
- [x] Compte GitHub actif

## 🎯 Déploiement en 8 étapes

### 1️⃣ Accéder à Railway
- 🌐 Allez sur [railway.app](https://railway.app)
- 🔑 Connectez-vous avec GitHub
- ➕ Cliquez sur "New Project"

### 2️⃣ Connecter le Repository
- 📂 Sélectionnez "Deploy from GitHub repo"
- 🔍 Cherchez `alami_gestion`
- ✅ Sélectionnez le repository

### 3️⃣ Ajouter PostgreSQL
- 🗄️ Cliquez sur "New" → "Database" → "PostgreSQL"
- ⚡ Railway configure automatiquement `DATABASE_URL`

### 4️⃣ Variables d'environnement
Dans l'onglet "Variables", ajoutez :

```env
JWT_SECRET=votre-super-secret-jwt-key-change-this-in-production-123456789
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://votre-app.railway.app
```

### 5️⃣ Déploiement automatique
- 🚀 Railway détecte `railway.toml`
- 📦 Build automatique (3-5 minutes)
- ✅ App disponible sur URL Railway

### 6️⃣ Migration base de données
Dans la console Railway :
```bash
npx prisma migrate deploy
```

### 7️⃣ Créer utilisateur admin
```bash
node scripts/create-owner.js
```

### 8️⃣ Vérification
- 🌐 Health check : `/api/health`
- 🏠 Application : `/dashboard`

## 🔄 Déploiement continu
Chaque push sur `main` déclenche un redéploiement automatique.

## 🛠️ Commandes utiles

### Console Railway
```bash
# Logs en temps réel
tail -f logs

# Prisma Studio
npx prisma studio --port 5555

# Vérifier dépendances
npm list

# Reset DB (ATTENTION!)
npx prisma migrate reset --force
```

## 🚨 Dépannage

### Erreur de build
- Vérifiez les logs dans "Deployments"
- Assurez-vous que `postinstall` exécute `prisma generate`

### Erreur 503
- Vérifiez les variables d'environnement
- Consultez les logs d'application

### Erreur DB
- Vérifiez que PostgreSQL est ajouté
- Exécutez `npx prisma migrate deploy`

## 💰 Coûts
- 🆓 **Gratuit** : $5 crédit/mois
- 💳 **Payant** : $5/mois par service

## 🔗 Liens utiles
- [Railway Dashboard](https://railway.app/dashboard)
- [Documentation](https://docs.railway.app)
- [Support](https://help.railway.app)

## ✨ Fonctionnalités déployées
- 🎨 Designer de Devis
- 💳 Gestion des Chèques
- 💰 Valeur du Stock
- 📊 Tableaux de bord
- 🔐 Authentification JWT
- 📱 Interface responsive

---

**🎉 Votre application Alami Gestion sera accessible depuis n'importe où !**

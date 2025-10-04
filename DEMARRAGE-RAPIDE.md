# ⚡ Démarrage Rapide - 3 Étapes Simples

## 📝 Étape 1 : Créer la base de données (2 minutes)

### Méthode 1 : Via pgAdmin (Interface graphique - RECOMMANDÉ)

1. **Ouvrir pgAdmin** (cherchez "pgAdmin" dans le menu Démarrer)
2. **Se connecter** à votre serveur PostgreSQL (entrez votre mot de passe)
3. **Clic droit** sur "Databases" dans le panneau de gauche
4. **Sélectionner** "Create" > "Database..."
5. **Nom de la base** : `alami_db`
6. **Cliquer** sur "Save"

✅ **C'est fait !** La base de données est créée.

### Méthode 2 : Via SQL Shell (psql)

1. **Ouvrir** "SQL Shell (psql)" depuis le menu Démarrer
2. **Appuyer** sur Entrée 4 fois (pour accepter les valeurs par défaut)
3. **Entrer** votre mot de passe PostgreSQL
4. **Taper** : `CREATE DATABASE alami_db;`
5. **Appuyer** sur Entrée
6. **Taper** : `\q` pour quitter

✅ **C'est fait !** La base de données est créée.

---

## 🔧 Étape 2 : Configurer la connexion (1 minute)

1. **Ouvrir** le fichier `.env` dans votre éditeur de code
2. **Trouver** la ligne qui commence par `DATABASE_URL=`
3. **Modifier** uniquement le mot de passe :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/alami_db?schema=public"
```

**Exemple :** Si votre mot de passe PostgreSQL est `admin123` :
```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/alami_db?schema=public"
```

4. **Sauvegarder** le fichier `.env`

✅ **C'est fait !** La connexion est configurée.

---

## 🚀 Étape 3 : Lancer l'application (2 minutes)

Ouvrez un terminal dans le dossier du projet et exécutez ces 3 commandes :

### 1. Créer les tables dans la base de données
```bash
npm run db:push
```

**Attendez** le message : `✔ Your database is now in sync with your Prisma schema.`

### 2. Insérer les données de test
```bash
npm run db:seed
```

**Attendez** les messages :
```
✅ Owner created: owner@alami.com
✅ Seller created: seller@alami.com
✅ Categories created: 3
✅ Products created: 3
✅ Customers created: 2
🎉 Seeding completed!
```

### 3. Lancer l'application
```bash
npm run dev
```

**Attendez** le message : `✓ Ready in X.Xs`

✅ **C'est fait !** L'application est lancée.

---

## 🌐 Accéder à l'application

1. **Ouvrir** votre navigateur
2. **Aller** sur : http://localhost:3000
3. **Se connecter** avec :

### 👨‍💼 Compte Propriétaire (Accès complet)
```
Email    : owner@alami.com
Password : admin123
```

### 👤 Compte Vendeur (Accès limité)
```
Email    : seller@alami.com
Password : seller123
```

---

## 🎉 Félicitations !

Vous devriez maintenant voir le **tableau de bord** avec :
- ✅ Nombre de produits : 3
- ✅ Nombre de clients : 2
- ✅ Statistiques en temps réel
- ✅ Navigation fonctionnelle

---

## ❓ Problèmes ?

### ❌ Erreur : "password authentication failed"
**Solution :** Vérifiez le mot de passe dans le fichier `.env`

### ❌ Erreur : "database alami_db does not exist"
**Solution :** Créez la base de données (voir Étape 1)

### ❌ Erreur : "Port 3000 is already in use"
**Solution :** Utilisez un autre port :
```bash
npm run dev -- -p 3001
```
Puis allez sur http://localhost:3001

### ❌ Autre erreur
**Solution :** Consultez le fichier `SETUP-MANUEL.md` pour plus de détails

---

## 📚 Prochaines étapes

Une fois connecté, vous pouvez :

1. ✅ **Explorer** le tableau de bord
2. ✅ **Voir** les produits de test (menu Produits)
3. ✅ **Voir** les clients de test (menu Clients)
4. ✅ **Tester** les différents rôles (déconnectez-vous et reconnectez-vous avec le compte vendeur)

---

## 🛠️ Commandes utiles

```bash
# Voir la base de données avec une interface graphique
npm run db:studio

# Arrêter l'application
Ctrl + C dans le terminal

# Relancer l'application
npm run dev
```

---

**Besoin d'aide ?** Consultez `SETUP-MANUEL.md` ou `README.md` pour plus d'informations.

**Bon développement ! 🚀**


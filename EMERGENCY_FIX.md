# 🚨 GUIDE D'URGENCE - Erreur 500 API Quote Design

## ⚡ Solution Rapide (5 minutes)

### Étape 1 : Déployer les Corrections

```bash
# Committer et pusher MAINTENANT
git add .
git commit -m "fix: Emergency fix for quote-design API"
git push
```

**⏱️ Attendre 2-3 minutes** que Railway redéploie.

---

### Étape 2 : Exécuter le Script d'Urgence sur Railway

#### Option A : Via Railway CLI (Recommandé)

```bash
# Installer Railway CLI si pas déjà fait
npm install -g @railway/cli

# Se connecter
railway login

# Lier au projet
railway link

# Exécuter le script d'urgence
railway run npm run db:fix
```

#### Option B : Via Railway Dashboard

1. Aller sur **Railway Dashboard**
2. Ouvrir votre projet **Alami Gestion**
3. Cliquer sur **Settings** → **Deploy**
4. Dans la section **Custom Start Command**, temporairement changer en :
   ```
   npm run db:fix && npm start
   ```
5. Redéployer
6. Vérifier les logs
7. Remettre la commande normale : `npm start`

#### Option C : Via Shell Railway

1. Railway Dashboard → Votre projet
2. Cliquer sur **Shell** (icône terminal)
3. Exécuter :
   ```bash
   npm run db:fix
   ```

---

### Étape 3 : Vérifier

```bash
# Tester l'API de santé
curl https://alamigestion-production.up.railway.app/api/health/detailed

# Devrait retourner tous les checks "ok"
```

---

## 🔍 Diagnostic Rapide

### Vérifier si les Changements sont Déployés

1. Ouvrir : `https://alamigestion-production.up.railway.app/api/health/detailed`
2. Chercher dans la réponse :
   ```json
   {
     "checks": {
       "companySettings": {
         "status": "ok" ou "missing"
       }
     }
   }
   ```

### Vérifier les Logs Railway

1. Railway Dashboard → Deployments → View Logs
2. Chercher :
   ```
   🎨 POST /api/settings/quote-design
   ```
3. Si vous voyez :
   - `✅` = Bon signe
   - `❌` = Erreur, lire le message

---

## 🛠️ Solutions par Scénario

### Scénario 1 : "Aucun paramètre trouvé"

**Symptôme** : Logs montrent "⚠️ Aucun paramètre existant"

**Solution** :
```bash
railway run npm run db:fix
```

---

### Scénario 2 : "Champs manquants"

**Symptôme** : Erreur Prisma sur un champ spécifique

**Solution** :
```bash
# Le script d'urgence va détecter et ajouter les champs manquants
railway run npm run db:fix
```

---

### Scénario 3 : "Les changements ne sont pas déployés"

**Symptôme** : Logs ne montrent pas les nouveaux messages (🎨, ✅, etc.)

**Solution** :
```bash
# Forcer un nouveau déploiement
git commit --allow-empty -m "Force redeploy"
git push
```

---

### Scénario 4 : "Erreur de connexion DB"

**Symptôme** : "Connection refused" ou "Database error"

**Solution** :
1. Vérifier `DATABASE_URL` dans Railway
2. Vérifier que la DB PostgreSQL est active
3. Redémarrer le service

---

## 📋 Checklist de Résolution

- [ ] Code committé et pushé
- [ ] Railway a redéployé (vérifier timestamp)
- [ ] Script d'urgence exécuté : `npm run db:fix`
- [ ] `/api/health/detailed` retourne "ok"
- [ ] Logs Railway ne montrent plus d'erreurs
- [ ] Designer de Devis fonctionne dans l'interface

---

## 🧪 Tests Manuels

### Test 1 : API Santé
```bash
curl https://alamigestion-production.up.railway.app/api/health/detailed
```

**Attendu** :
```json
{
  "status": "ok",
  "checks": {
    "database": { "status": "ok" },
    "companySettings": { "status": "ok" }
  }
}
```

### Test 2 : Designer de Devis

1. Se connecter à l'application
2. Aller dans **Paramètres** → **Designer de Devis**
3. Modifier une couleur (ex: Primary Color)
4. Cliquer **Sauvegarder**
5. ✅ Devrait afficher "Paramètres sauvegardés"

---

## 🔧 Commandes Utiles

```bash
# Vérifier l'état de la DB
railway run npm run deploy:check

# Initialiser les paramètres
railway run npm run db:init

# Réparer les paramètres (URGENCE)
railway run npm run db:fix

# Tester l'API Quote Design
railway run npm run test:quote-api

# Voir les logs en temps réel
railway logs

# Ouvrir Prisma Studio
railway run npx prisma studio
```

---

## 📞 Si Rien ne Fonctionne

### Solution Nucléaire : Recréer les Paramètres

```bash
# Se connecter à la DB PostgreSQL directement
railway connect

# Dans psql :
DELETE FROM company_settings;

# Puis exécuter :
railway run npm run db:fix
```

---

## 🎯 Résultat Attendu

Après avoir suivi ce guide :

1. ✅ `/api/settings/company` retourne 200
2. ✅ `/api/settings/quote-design` POST retourne 200
3. ✅ Designer de Devis sauvegarde sans erreur
4. ✅ Designer de Factures sauvegarde sans erreur
5. ✅ Logs Railway montrent `✅` au lieu de `❌`

---

## 📊 Logs Attendus (Succès)

```
🎨 POST /api/settings/quote-design - Début
👤 Session: User clxxx (OWNER)
✅ Authentification OK - Récupération des données...
📦 Données reçues: 20 champs
✅ Paramètres existants trouvés - Mise à jour...
✅ Paramètres mis à jour avec succès
```

---

## ⏱️ Timeline de Résolution

| Étape | Temps | Action |
|-------|-------|--------|
| 1 | 1 min | Commit + Push |
| 2 | 2-3 min | Attendre redéploiement Railway |
| 3 | 1 min | Exécuter `npm run db:fix` |
| 4 | 30 sec | Vérifier `/api/health/detailed` |
| 5 | 30 sec | Tester dans l'interface |

**Total : ~5-6 minutes**

---

## 🚀 Après la Résolution

1. Tester toutes les fonctionnalités de paramètres
2. Vérifier que les autres APIs fonctionnent
3. Surveiller les logs pendant 24h
4. Documenter tout problème récurrent

---

**Date** : 2025-01-08  
**Priorité** : 🔴 CRITIQUE  
**Statut** : ⚡ ACTION IMMÉDIATE REQUISE


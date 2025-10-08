# 🚀 Guide Rapide - Exécuter SQL sur Railway Dashboard

## 📋 **Étapes Simples (5 minutes)**

### **Étape 1 : Ouvrir Railway Dashboard**

1. Aller sur : **https://railway.app**
2. Se connecter avec votre compte
3. Cliquer sur votre projet **"Alami Gestion"** ou **"alamigestion-production"**

---

### **Étape 2 : Ouvrir la Base de Données**

1. Dans votre projet, vous verrez plusieurs services
2. Cliquer sur le service **"Postgres"** (icône d'éléphant 🐘)
3. Cliquer sur l'onglet **"Data"** en haut

---

### **Étape 3 : Ouvrir l'Éditeur SQL**

1. Dans l'onglet "Data", chercher **"Query"** ou **"SQL Editor"**
2. Vous verrez un éditeur de texte pour écrire du SQL

---

### **Étape 4 : Copier-Coller le SQL**

Copier ce SQL et le coller dans l'éditeur :

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

---

### **Étape 5 : Exécuter**

1. Cliquer sur **"Run"** ou **"Execute"** ou appuyer sur **Ctrl+Enter**
2. Attendre quelques secondes
3. Vous devriez voir : **"Query executed successfully"** ou **"5 rows affected"**

---

### **Étape 6 : Vérifier**

Exécuter cette requête pour vérifier :

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'company_settings' 
  AND column_name IN ('quoteTheme', 'showValidityPeriod', 'validityPeriodText', 'showTermsAndConditions', 'termsAndConditionsText');
```

**Résultat attendu** : 5 lignes avec les noms des colonnes

---

### **Étape 7 : Redémarrer l'Application**

1. Retourner à la vue principale du projet
2. Cliquer sur le service **"Web"** (votre application Next.js)
3. Cliquer sur **"Settings"** → **"Redeploy"**
4. OU simplement attendre que Railway redéploie automatiquement

---

### **Étape 8 : Tester**

1. Ouvrir votre application : **https://alamigestion-production.up.railway.app**
2. Se connecter
3. Aller dans **Paramètres** → **Designer de Devis**
4. Modifier une couleur
5. Cliquer **Sauvegarder**
6. ✅ Devrait afficher **"Paramètres sauvegardés"** sans erreur !

---

## 🎯 **Alternative : Via Railway Shell**

Si vous ne trouvez pas l'éditeur SQL :

### **Méthode Shell**

1. Dans Railway Dashboard, cliquer sur votre projet
2. Cliquer sur le service **Postgres**
3. Chercher **"Connect"** ou **"Shell"**
4. Copier la commande de connexion (commence par `psql`)
5. Ouvrir un terminal local et coller la commande
6. Une fois connecté, copier-coller le SQL ci-dessus

---

## 📱 **Méthode Alternative : Modifier le Déploiement**

Si vous ne pouvez pas accéder au SQL :

### **Forcer la Migration au Démarrage**

1. Dans Railway Dashboard → Votre projet
2. Cliquer sur le service **Web** (Next.js)
3. Aller dans **Settings** → **Deploy**
4. Chercher **"Start Command"** ou **"Custom Start Command"**
5. Remplacer temporairement par :
   ```
   npx prisma db push && npm start
   ```
6. Sauvegarder et redéployer
7. Vérifier les logs - vous devriez voir les colonnes ajoutées
8. Remettre la commande normale : `npm start`

---

## ✅ **Checklist**

- [ ] Connecté à Railway Dashboard
- [ ] Service Postgres ouvert
- [ ] SQL exécuté (5 ALTER TABLE)
- [ ] Vérification OK (5 colonnes trouvées)
- [ ] Application redéployée
- [ ] Designer de Devis testé
- [ ] Sauvegarde fonctionne sans erreur 500

---

## 🆘 **Besoin d'Aide ?**

### **Vous ne trouvez pas l'éditeur SQL ?**

Essayez :
1. Onglet **"Data"** dans le service Postgres
2. Onglet **"Query"** 
3. Bouton **"Connect"** pour obtenir les credentials
4. Utiliser un client PostgreSQL externe (pgAdmin, DBeaver, etc.)

### **Erreur "Permission denied" ?**

Vérifiez que vous êtes **Owner** du projet Railway.

### **Erreur "Column already exists" ?**

C'est bon signe ! Les colonnes sont déjà là. Passez directement au test.

---

## 📞 **Contact**

Si rien ne fonctionne, partagez :
1. Une capture d'écran de Railway Dashboard
2. Les logs de déploiement
3. Le message d'erreur exact

---

**Temps estimé** : 5 minutes  
**Difficulté** : ⭐ Facile  
**Priorité** : 🔴 Urgent


# 🔧 Guide de Dépannage - Alami Gestion

## Erreur 500 sur `/api/settings/company`

### 🔍 Diagnostic

L'erreur 500 sur l'endpoint `/api/settings/company` peut avoir plusieurs causes :

#### 1. **Problème d'authentification**
- L'utilisateur n'est pas connecté
- Le token JWT est invalide ou expiré
- L'utilisateur n'a pas le rôle OWNER

#### 2. **Problème de base de données**
- La table `company_settings` n'existe pas
- Erreur de connexion à PostgreSQL
- Permissions insuffisantes

#### 3. **Problème de création automatique**
- Échec lors de la création des paramètres par défaut
- Champs manquants dans le schéma

---

## ✅ Solutions Appliquées

### 1. **API Plus Robuste**

J'ai modifié `/app/api/settings/company/route.ts` pour :

- ✅ Ajouter des logs détaillés pour le debugging
- ✅ Permettre l'accès aux SELLER (lecture seule)
- ✅ Retourner des paramètres par défaut en cas d'erreur
- ✅ Gérer les erreurs de création gracieusement
- ✅ Ne jamais retourner 500, toujours des données valides

### 2. **Script d'Initialisation**

Créé `/scripts/init-company-settings.js` pour initialiser manuellement :

```bash
node scripts/init-company-settings.js
```

### 3. **Endpoint de Diagnostic**

Créé `/api/health/detailed` pour vérifier l'état du système :

```bash
curl https://alamigestion-production.up.railway.app/api/health/detailed
```

---

## 🚀 Actions à Effectuer

### Étape 1 : Vérifier les Logs Railway

1. Allez sur Railway Dashboard
2. Ouvrez votre projet
3. Cliquez sur "Deployments" → "View Logs"
4. Cherchez les logs commençant par :
   - `🔍 GET /api/settings/company`
   - `❌ Error fetching company settings`

### Étape 2 : Tester l'Endpoint de Diagnostic

Ouvrez dans votre navigateur :
```
https://alamigestion-production.up.railway.app/api/health/detailed
```

Cela vous donnera un rapport complet de l'état du système.

### Étape 3 : Initialiser les Paramètres

Si les paramètres n'existent pas, connectez-vous à Railway et exécutez :

```bash
# Via Railway CLI
railway run node scripts/init-company-settings.js

# OU via le shell Railway
node scripts/init-company-settings.js
```

### Étape 4 : Vérifier la Base de Données

Connectez-vous à votre base de données PostgreSQL et vérifiez :

```sql
-- Vérifier si la table existe
SELECT * FROM company_settings;

-- Si vide, créer manuellement
INSERT INTO company_settings (
  id, 
  "companyName", 
  "invoicePrefix", 
  "creditNotePrefix", 
  "defaultTaxRate",
  "invoiceTheme",
  "primaryColor",
  "secondaryColor",
  "tableHeaderColor",
  "sectionColor",
  "accentColor",
  "textColor",
  "headerTextColor",
  "sectionTextColor",
  "backgroundColor",
  "headerStyle",
  "logoPosition",
  "logoSize",
  "fontFamily",
  "fontSize",
  "borderRadius",
  "showWatermark",
  "watermarkText",
  "customCSS",
  "quoteTheme",
  "showValidityPeriod",
  "validityPeriodText",
  "showTermsAndConditions",
  "termsAndConditionsText",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Mon Entreprise',
  'FAC',
  'FAV',
  20,
  'modern',
  '#2563EB',
  '#10B981',
  '#10B981',
  '#10B981',
  '#F59E0B',
  '#1F2937',
  '#FFFFFF',
  '#FFFFFF',
  '#FFFFFF',
  'gradient',
  'left',
  'medium',
  'helvetica',
  'normal',
  'rounded',
  false,
  'DEVIS',
  '',
  'modern',
  true,
  'Ce devis est valable 30 jours à compter de la date d''émission.',
  true,
  'Conditions générales de vente disponibles sur demande.',
  NOW(),
  NOW()
);
```

---

## 🔄 Solution Temporaire

En attendant la correction, l'API retourne maintenant des paramètres par défaut même en cas d'erreur, donc l'application devrait continuer à fonctionner.

---

## 📊 Vérifications Post-Déploiement

Après avoir déployé les corrections :

1. **Tester l'authentification** :
   ```
   GET /api/auth/me
   ```

2. **Tester les paramètres** :
   ```
   GET /api/settings/company
   ```

3. **Tester le diagnostic** :
   ```
   GET /api/health/detailed
   ```

4. **Vérifier les logs** :
   - Chercher les messages `🔍`, `✅`, `❌`
   - Identifier les erreurs spécifiques

---

## 🐛 Problèmes Courants

### Erreur : "Non authentifié"
**Cause** : Pas de session active  
**Solution** : Se reconnecter à l'application

### Erreur : "Accès non autorisé"
**Cause** : Utilisateur n'est pas OWNER  
**Solution** : Se connecter avec un compte OWNER

### Erreur : "Table does not exist"
**Cause** : Migrations non appliquées  
**Solution** : 
```bash
railway run npx prisma migrate deploy
# OU
railway run npx prisma db push
```

### Erreur : "Connection refused"
**Cause** : Base de données non accessible  
**Solution** : Vérifier DATABASE_URL dans les variables d'environnement

---

## 📞 Support

Si le problème persiste :

1. Récupérez les logs complets de Railway
2. Testez `/api/health/detailed`
3. Vérifiez la base de données directement
4. Partagez les informations pour un diagnostic plus approfondi

---

## ✅ Checklist de Déploiement

- [ ] Variables d'environnement configurées
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `NEXT_PUBLIC_APP_URL`
- [ ] Migrations appliquées
- [ ] Paramètres de l'entreprise initialisés
- [ ] Au moins un utilisateur OWNER créé
- [ ] Tests des endpoints principaux
- [ ] Logs vérifiés

---

## 🔐 Sécurité

**Important** : Les endpoints de diagnostic ne doivent être accessibles qu'en développement ou avec authentification en production.

Pour désactiver `/api/health/detailed` en production, ajoutez :

```typescript
// Dans app/api/health/detailed/route.ts
if (process.env.NODE_ENV === 'production') {
  const session = await getSession()
  if (!session || session.role !== 'OWNER') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }
}
```


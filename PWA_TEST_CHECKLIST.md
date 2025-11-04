# ✅ PWA Test Checklist - Alami Gestion

## 📋 Liste de Vérification Complète

---

## 🖥️ Tests Desktop (Chrome/Edge)

### 1. Vérification du Manifest

- [ ] Ouvrir : https://otragestion.xyz
- [ ] Ouvrir DevTools (`F12`)
- [ ] Onglet **Application** → **Manifest**
- [ ] Vérifier :
  - [ ] Nom : "Alami Gestion - Gestion d'Entreprise"
  - [ ] Nom court : "Alami Gestion"
  - [ ] Start URL : "/dashboard"
  - [ ] Display : "standalone"
  - [ ] Theme color : "#4DA6FF"
  - [ ] Background color : "#F0F9FF"
  - [ ] 10 icônes visibles dans la liste
  - [ ] 4 shortcuts visibles

### 2. Vérification du Service Worker

- [ ] Onglet **Application** → **Service Workers**
- [ ] Vérifier :
  - [ ] Status : "activated and is running"
  - [ ] Source : "sw.js"
  - [ ] Scope : "/"
  - [ ] Update on reload : décoché

### 3. Vérification du Cache

- [ ] Onglet **Application** → **Cache Storage**
- [ ] Vérifier les caches créés :
  - [ ] `google-fonts-webfonts`
  - [ ] `google-fonts-stylesheets`
  - [ ] `static-image-assets`
  - [ ] `static-js-assets`
  - [ ] `static-style-assets`
  - [ ] `next-data`
  - [ ] `others`

### 4. Test d'Installation

- [ ] Chercher l'icône **"Installer"** dans la barre d'adresse (à droite)
- [ ] Cliquer sur l'icône
- [ ] Popup "Installer Alami Gestion ?" apparaît
- [ ] Cliquer sur **"Installer"**
- [ ] L'app s'ouvre dans une nouvelle fenêtre
- [ ] Vérifier :
  - [ ] Pas de barre d'adresse
  - [ ] Icône dans la barre de titre
  - [ ] Nom "Alami Gestion" dans la barre de titre

### 5. Test de l'Application Installée

- [ ] Fermer l'app
- [ ] Ouvrir le menu Démarrer (Windows) ou Applications (Mac)
- [ ] Chercher "Alami Gestion"
- [ ] Icône visible
- [ ] Cliquer pour ouvrir
- [ ] L'app s'ouvre directement sur `/dashboard`
- [ ] Vérifier :
  - [ ] Plein écran (pas de barre d'adresse)
  - [ ] Navigation fonctionne
  - [ ] Toutes les fonctionnalités OK

### 6. Test Mode Hors Ligne

- [ ] Ouvrir l'app installée
- [ ] Naviguer vers plusieurs pages :
  - [ ] Dashboard
  - [ ] Produits
  - [ ] Clients
  - [ ] Ventes
  - [ ] Dépenses
- [ ] Ouvrir DevTools → **Network**
- [ ] Cocher **"Offline"**
- [ ] Recharger la page (`Ctrl + R`)
- [ ] Vérifier :
  - [ ] Page se charge (depuis le cache)
  - [ ] Images visibles
  - [ ] CSS appliqué
  - [ ] Navigation fonctionne
- [ ] Décocher **"Offline"**

### 7. Test de Désinstallation

- [ ] Clic droit sur l'icône dans la barre de titre
- [ ] **"Désinstaller Alami Gestion"**
- [ ] Confirmer
- [ ] L'app est supprimée du menu Démarrer

---

## 📱 Tests Mobile (Android)

### 1. Vérification du Manifest

- [ ] Ouvrir Chrome
- [ ] Aller sur : https://otragestion.xyz
- [ ] Menu (⋮) → **"Paramètres du site"**
- [ ] Vérifier :
  - [ ] Nom : "Alami Gestion"
  - [ ] Icône visible

### 2. Test d'Installation

- [ ] Bannière "Installer l'application" apparaît en bas
  - Si non : Menu (⋮) → **"Installer l'application"**
- [ ] Cliquer sur **"Installer"**
- [ ] Popup de confirmation
- [ ] Cliquer sur **"Installer"**
- [ ] L'icône apparaît sur l'écran d'accueil
- [ ] Vérifier :
  - [ ] Icône visible
  - [ ] Nom "Alami Gestion" sous l'icône

### 3. Test de l'Application Installée

- [ ] Appuyer sur l'icône
- [ ] Splash screen apparaît :
  - [ ] Icône de l'app
  - [ ] Nom "Alami Gestion"
  - [ ] Fond bleu clair (#F0F9FF)
- [ ] L'app s'ouvre sur `/dashboard`
- [ ] Vérifier :
  - [ ] Plein écran (pas de barre d'adresse)
  - [ ] Barre de statut colorée (#4DA6FF)
  - [ ] Navigation fonctionne
  - [ ] Responsive design OK

### 4. Test des Shortcuts

- [ ] Appui long sur l'icône de l'app
- [ ] Menu contextuel apparaît
- [ ] Vérifier les 4 shortcuts :
  - [ ] 📊 Tableau de bord
  - [ ] 💰 Nouvelle Vente
  - [ ] 📄 Nouveau Devis
  - [ ] 💸 Dépenses
- [ ] Cliquer sur "Nouvelle Vente"
- [ ] L'app s'ouvre sur `/dashboard/sales/new`

### 5. Test Mode Hors Ligne

- [ ] Ouvrir l'app installée
- [ ] Naviguer vers plusieurs pages
- [ ] Activer le **Mode Avion**
- [ ] Fermer l'app
- [ ] Rouvrir l'app
- [ ] Vérifier :
  - [ ] L'app se charge
  - [ ] Pages visitées accessibles
  - [ ] Images visibles
  - [ ] Message "Hors ligne" si nouvelle page
- [ ] Désactiver le Mode Avion

### 6. Test de Désinstallation

- [ ] Appui long sur l'icône
- [ ] **"Désinstaller"** ou **"Supprimer"**
- [ ] Confirmer
- [ ] L'icône disparaît de l'écran d'accueil

---

## 🍎 Tests iPhone (iOS/Safari)

### 1. Test d'Installation

- [ ] Ouvrir Safari
- [ ] Aller sur : https://otragestion.xyz
- [ ] Bouton **Partager** (carré avec flèche vers le haut)
- [ ] Défiler vers le bas
- [ ] **"Sur l'écran d'accueil"**
- [ ] Vérifier :
  - [ ] Icône visible
  - [ ] Nom "Alami Gestion"
- [ ] Cliquer sur **"Ajouter"**
- [ ] L'icône apparaît sur l'écran d'accueil

### 2. Test de l'Application Installée

- [ ] Appuyer sur l'icône
- [ ] L'app s'ouvre sur `/dashboard`
- [ ] Vérifier :
  - [ ] Plein écran (pas de barre Safari)
  - [ ] Barre de statut visible
  - [ ] Navigation fonctionne
  - [ ] Responsive design OK

### 3. Test Mode Hors Ligne

- [ ] Ouvrir l'app installée
- [ ] Naviguer vers plusieurs pages
- [ ] Activer le **Mode Avion**
- [ ] Fermer l'app
- [ ] Rouvrir l'app
- [ ] Vérifier :
  - [ ] L'app se charge
  - [ ] Pages visitées accessibles
  - [ ] Images visibles
- [ ] Désactiver le Mode Avion

### 4. Test de Désinstallation

- [ ] Appui long sur l'icône
- [ ] **"Supprimer l'app"**
- [ ] **"Supprimer de l'écran d'accueil"**
- [ ] L'icône disparaît

---

## 🔍 Tests Lighthouse

### 1. Audit PWA

- [ ] Ouvrir : https://otragestion.xyz
- [ ] Ouvrir DevTools (`F12`)
- [ ] Onglet **Lighthouse**
- [ ] Sélectionner :
  - [ ] Mode : Mobile
  - [ ] Catégories : Progressive Web App
- [ ] Cliquer sur **"Analyze page load"**
- [ ] Vérifier les critères :
  - [ ] ✅ Installable
  - [ ] ✅ PWA optimized
  - [ ] ✅ Works offline
  - [ ] ✅ Configured for a custom splash screen
  - [ ] ✅ Sets a theme color
  - [ ] ✅ Content is sized correctly for the viewport
  - [ ] ✅ Has a `<meta name="viewport">` tag
  - [ ] ✅ Provides a valid `apple-touch-icon`

### 2. Audit Performance

- [ ] Même processus avec catégorie **Performance**
- [ ] Vérifier score :
  - [ ] Performance : > 90
  - [ ] First Contentful Paint : < 1.8s
  - [ ] Largest Contentful Paint : < 2.5s
  - [ ] Total Blocking Time : < 200ms
  - [ ] Cumulative Layout Shift : < 0.1

---

## 🌐 Tests Navigateurs

### Chrome Desktop

- [ ] Installation fonctionne
- [ ] Service Worker enregistré
- [ ] Cache fonctionne
- [ ] Mode hors ligne OK

### Edge Desktop

- [ ] Installation fonctionne
- [ ] Service Worker enregistré
- [ ] Cache fonctionne
- [ ] Mode hors ligne OK

### Chrome Mobile (Android)

- [ ] Installation fonctionne
- [ ] Shortcuts fonctionnent
- [ ] Splash screen OK
- [ ] Mode hors ligne OK

### Safari Mobile (iOS)

- [ ] Installation fonctionne
- [ ] Plein écran OK
- [ ] Mode hors ligne OK

### Firefox Desktop

- [ ] Service Worker enregistré
- [ ] Cache fonctionne
- [ ] Mode hors ligne OK
- [ ] Note : Installation limitée sur Firefox

---

## 📊 Métriques de Succès

### Installation

- [ ] Bannière d'installation apparaît (Android)
- [ ] Icône "Installer" visible (Desktop)
- [ ] Installation réussie en < 5 secondes
- [ ] Icône visible sur écran d'accueil

### Performance

- [ ] Lighthouse PWA : 100/100
- [ ] Lighthouse Performance : > 90
- [ ] Chargement initial : < 3s
- [ ] Chargement depuis cache : < 1s

### Fonctionnalités

- [ ] Mode hors ligne fonctionne
- [ ] Shortcuts accessibles (Android)
- [ ] Splash screen s'affiche
- [ ] Plein écran sans barre d'adresse

### UX

- [ ] Navigation fluide
- [ ] Pas de bugs visuels
- [ ] Responsive design OK
- [ ] Toutes les fonctionnalités accessibles

---

## 🐛 Problèmes Connus et Solutions

### Problème 1 : Bannière d'installation n'apparaît pas

**Causes possibles** :
- App déjà installée
- Critères PWA non remplis
- Cache navigateur

**Solution** :
```bash
# 1. Vider le cache
DevTools → Application → Clear storage → Clear site data

# 2. Vérifier les critères
DevTools → Application → Manifest
DevTools → Application → Service Workers

# 3. Recharger la page
Ctrl + Shift + R
```

### Problème 2 : Service Worker ne s'active pas

**Causes possibles** :
- Mode développement
- Erreur dans le SW
- HTTPS non activé

**Solution** :
```bash
# 1. Vérifier le mode
# SW désactivé en dev (normal)

# 2. Vérifier HTTPS
# Railway fournit automatiquement HTTPS

# 3. Vérifier les erreurs
DevTools → Console
```

### Problème 3 : Icônes ne s'affichent pas

**Causes possibles** :
- Fichiers manquants
- Chemins incorrects
- Format invalide

**Solution** :
```bash
# 1. Vérifier les fichiers
ls public/icons/

# 2. Vérifier les chemins
# Doivent commencer par /icons/

# 3. Vérifier le format
# PNG uniquement, pas de JPEG
```

---

## ✅ Checklist Finale

### Avant de Valider

- [ ] Tous les tests desktop passés
- [ ] Tous les tests mobile passés
- [ ] Lighthouse PWA : 100/100
- [ ] Lighthouse Performance : > 90
- [ ] Aucun bug critique
- [ ] Mode hors ligne fonctionne
- [ ] Installation fluide

### Documentation

- [ ] PWA_IMPLEMENTATION.md lu
- [ ] PWA_QUICK_START.md suivi
- [ ] Icônes générées et déployées
- [ ] Tests effectués et validés

---

## 🎉 Validation Finale

Si tous les tests sont ✅, votre PWA est **prête pour la production** !

**Félicitations !** 🚀📱💻

---

**Bon test !** ✅


# 🚀 Commandes PWA - Alami Gestion

## ⚡ Commandes Rapides

---

## 📦 Installation et Configuration

### 1. Vérifier que next-pwa est installé

```bash
# Vérifier package.json
npm list @ducanh2912/next-pwa

# Si non installé (normalement déjà installé)
npm install @ducanh2912/next-pwa
```

---

## 🎨 Générer les Icônes

### Windows (PowerShell)

```powershell
# Ouvrir le générateur d'icônes
start scripts\generate-pwa-icons.html

# Ou utiliser le script de configuration
.\scripts\setup-pwa-icons.ps1
```

### Mac/Linux

```bash
# Ouvrir le générateur d'icônes
open scripts/generate-pwa-icons.html  # Mac
xdg-open scripts/generate-pwa-icons.html  # Linux

# Ou utiliser le script de configuration
chmod +x scripts/setup-pwa-icons.sh
./scripts/setup-pwa-icons.sh
```

---

## 📁 Créer le Dossier Icons

### Windows

```powershell
# Créer le dossier
mkdir public\icons

# Vérifier qu'il existe
dir public\icons
```

### Mac/Linux

```bash
# Créer le dossier
mkdir -p public/icons

# Vérifier qu'il existe
ls -la public/icons
```

---

## 🔄 Déplacer les Icônes

### Windows (PowerShell)

```powershell
# Depuis le dossier Téléchargements
Move-Item "$env:USERPROFILE\Downloads\icon-*.png" "public\icons\"

# Vérifier
dir public\icons
```

### Mac/Linux

```bash
# Depuis le dossier Téléchargements
mv ~/Downloads/icon-*.png public/icons/

# Vérifier
ls -la public/icons
```

---

## 🏗️ Build et Test

### Build l'Application

```bash
# Build en mode production
npm run build

# Vérifier qu'il n'y a pas d'erreurs
# Le service worker sera généré automatiquement
```

### Démarrer en Mode Production

```bash
# Démarrer le serveur
npm start

# L'app sera accessible sur http://localhost:3000
```

### Démarrer en Mode Développement

```bash
# Mode dev (PWA désactivée)
npm run dev

# Note : Le service worker est désactivé en dev
```

---

## 🧪 Tester la PWA

### Vérifier le Manifest

```bash
# Ouvrir l'app
# http://localhost:3000

# DevTools (F12) → Application → Manifest
# Vérifier :
# - Nom, icônes, shortcuts
# - Theme color, background color
```

### Vérifier le Service Worker

```bash
# DevTools (F12) → Application → Service Workers
# Vérifier :
# - Status : "activated and is running"
# - Source : "sw.js"
```

### Vérifier le Cache

```bash
# DevTools (F12) → Application → Cache Storage
# Vérifier les caches :
# - google-fonts-webfonts
# - static-image-assets
# - static-js-assets
# - next-data
```

### Tester le Mode Hors Ligne

```bash
# 1. Naviguer vers plusieurs pages
# 2. DevTools → Network → Cocher "Offline"
# 3. Recharger la page (Ctrl + R)
# 4. Vérifier que la page se charge depuis le cache
```

---

## 🚀 Déploiement

### Commit et Push

```bash
# Ajouter tous les fichiers
git add .

# Commit avec message descriptif
git commit -m "feat: Add PWA support with icons and service worker

- Configure next-pwa with runtime caching
- Add complete manifest.json with icons and shortcuts
- Create icon generator tool
- Add comprehensive PWA documentation
- Enable offline mode and installation"

# Push vers Railway
git push origin main
```

### Vérifier le Déploiement

```bash
# Attendre 2-5 minutes que Railway redéploie

# Vérifier les logs sur Railway
# https://railway.app → Votre projet → Deployments → View Logs

# Vérifier que l'app est accessible
# https://otragestion.xyz
```

---

## 🔍 Vérification Post-Déploiement

### Vérifier le Manifest en Production

```bash
# Ouvrir : https://otragestion.xyz
# DevTools (F12) → Application → Manifest
# Vérifier que toutes les icônes sont visibles
```

### Vérifier le Service Worker en Production

```bash
# DevTools (F12) → Application → Service Workers
# Vérifier : Status "activated and is running"
```

### Tester l'Installation Desktop

```bash
# Chrome/Edge :
# 1. Chercher l'icône "Installer" dans la barre d'adresse
# 2. Cliquer → Installer
# 3. L'app s'ouvre en fenêtre dédiée
```

### Tester l'Installation Mobile

```bash
# Android (Chrome) :
# 1. Menu (⋮) → "Installer l'application"
# 2. Confirmer
# 3. Icône sur écran d'accueil

# iPhone (Safari) :
# 1. Bouton Partager → "Sur l'écran d'accueil"
# 2. Confirmer
# 3. Icône sur écran d'accueil
```

---

## 🐛 Dépannage

### Vider le Cache

```bash
# DevTools (F12) → Application
# → Clear storage
# → Clear site data
# → Recharger (Ctrl + Shift + R)
```

### Désinstaller le Service Worker

```bash
# DevTools (F12) → Application → Service Workers
# → Cliquer sur "Unregister"
# → Recharger la page
```

### Vérifier les Erreurs

```bash
# DevTools (F12) → Console
# Chercher les erreurs liées à :
# - Service Worker
# - Manifest
# - Cache
```

### Forcer la Mise à Jour du Service Worker

```bash
# DevTools (F12) → Application → Service Workers
# → Cocher "Update on reload"
# → Recharger la page (Ctrl + R)
```

---

## 📊 Audit Lighthouse

### Audit PWA

```bash
# DevTools (F12) → Lighthouse
# Sélectionner :
# - Mode : Mobile
# - Catégories : Progressive Web App
# Cliquer sur "Analyze page load"
```

### Audit Performance

```bash
# DevTools (F12) → Lighthouse
# Sélectionner :
# - Mode : Mobile
# - Catégories : Performance
# Cliquer sur "Analyze page load"
```

### Audit Complet

```bash
# DevTools (F12) → Lighthouse
# Sélectionner :
# - Mode : Mobile
# - Catégories : Toutes
# Cliquer sur "Analyze page load"
```

---

## 🔧 Maintenance

### Mettre à Jour les Icônes

```bash
# 1. Générer de nouvelles icônes
start scripts\generate-pwa-icons.html  # Windows
open scripts/generate-pwa-icons.html   # Mac

# 2. Remplacer les anciennes icônes
# Supprimer : public/icons/*
# Déplacer : nouvelles icônes dans public/icons/

# 3. Build et déployer
npm run build
git add public/icons/
git commit -m "chore: Update PWA icons"
git push origin main
```

### Mettre à Jour le Manifest

```bash
# Éditer : public/manifest.json
# Modifier : name, theme_color, shortcuts, etc.

# Build et déployer
npm run build
git add public/manifest.json
git commit -m "chore: Update PWA manifest"
git push origin main
```

### Mettre à Jour les Stratégies de Cache

```bash
# Éditer : next.config.ts
# Modifier : runtimeCaching

# Build et déployer
npm run build
git add next.config.ts
git commit -m "chore: Update PWA cache strategies"
git push origin main
```

---

## 📚 Documentation

### Lire la Documentation

```bash
# Vue d'ensemble
cat PWA_README.md

# Démarrage rapide
cat PWA_QUICK_START.md

# Guide complet
cat PWA_IMPLEMENTATION.md

# Tests
cat PWA_TEST_CHECKLIST.md

# Résumé
cat PWA_SUMMARY.md
```

### Ouvrir la Documentation

```bash
# Windows
start PWA_README.md

# Mac
open PWA_README.md

# Linux
xdg-open PWA_README.md
```

---

## 🎯 Workflow Complet

### Première Installation

```bash
# 1. Générer les icônes
start scripts\generate-pwa-icons.html

# 2. Créer le dossier
mkdir public\icons

# 3. Déplacer les icônes
# Depuis Téléchargements vers public\icons\

# 4. Vérifier
.\scripts\setup-pwa-icons.ps1

# 5. Build
npm run build

# 6. Test local
npm start

# 7. Vérifier dans DevTools
# F12 → Application → Manifest, Service Workers

# 8. Déployer
git add .
git commit -m "feat: Add PWA support"
git push origin main

# 9. Tester en production
# https://otragestion.xyz
```

### Mise à Jour

```bash
# 1. Modifier les fichiers PWA
# - public/manifest.json
# - next.config.ts
# - public/icons/*

# 2. Build
npm run build

# 3. Test local
npm start

# 4. Déployer
git add .
git commit -m "chore: Update PWA configuration"
git push origin main
```

---

## 🎉 Résultat Final

Après avoir suivi toutes les commandes, votre application sera :

- ✅ **Installable** sur tous les appareils
- ✅ **Rapide** grâce au cache intelligent
- ✅ **Hors ligne** pour les pages visitées
- ✅ **Native** avec icône et plein écran
- ✅ **Accessible** via shortcuts

---

**Bon déploiement !** 🚀📱💻


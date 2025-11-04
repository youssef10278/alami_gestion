#!/bin/bash

# Script Bash pour configurer les icônes PWA
# Usage: ./scripts/setup-pwa-icons.sh

echo "🎨 Configuration des Icônes PWA - Alami Gestion"
echo "================================================"
echo ""

# Créer le dossier icons s'il n'existe pas
ICONS_PATH="public/icons"
if [ ! -d "$ICONS_PATH" ]; then
    echo "📁 Création du dossier public/icons..."
    mkdir -p "$ICONS_PATH"
    echo "✅ Dossier créé avec succès !"
else
    echo "✅ Le dossier public/icons existe déjà"
fi

echo ""

# Vérifier les icônes requises
REQUIRED_ICONS=(
    "icon-72x72.png"
    "icon-96x96.png"
    "icon-128x128.png"
    "icon-144x144.png"
    "icon-152x152.png"
    "icon-192x192.png"
    "icon-384x384.png"
    "icon-512x512.png"
    "icon-192x192-maskable.png"
    "icon-512x512-maskable.png"
)

echo "🔍 Vérification des icônes requises..."
echo ""

MISSING_ICONS=()
for icon in "${REQUIRED_ICONS[@]}"; do
    ICON_PATH="$ICONS_PATH/$icon"
    if [ -f "$ICON_PATH" ]; then
        echo "  ✅ $icon"
    else
        echo "  ❌ $icon (manquant)"
        MISSING_ICONS+=("$icon")
    fi
done

echo ""

# Résumé
if [ ${#MISSING_ICONS[@]} -eq 0 ]; then
    echo "🎉 Toutes les icônes sont présentes !"
    echo ""
    echo "✅ Vous pouvez maintenant :"
    echo "   1. Build l'application : npm run build"
    echo "   2. Tester localement : npm start"
    echo "   3. Déployer : git add . && git commit -m 'feat: Add PWA icons' && git push"
else
    echo "⚠️  Il manque ${#MISSING_ICONS[@]} icône(s)"
    echo ""
    echo "📋 Icônes manquantes :"
    for icon in "${MISSING_ICONS[@]}"; do
        echo "   - $icon"
    done
    echo ""
    echo "🎨 Pour générer les icônes :"
    echo "   1. Ouvrir : scripts/generate-pwa-icons.html"
    echo "   2. Personnaliser l'icône (texte 'AG' ou emoji 💼)"
    echo "   3. Cliquer sur 'Télécharger Toutes les Icônes'"
    echo "   4. Déplacer les fichiers téléchargés dans public/icons/"
    echo ""
    
    # Proposer d'ouvrir le générateur
    read -p "Voulez-vous ouvrir le générateur d'icônes maintenant ? (O/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        echo ""
        echo "🚀 Ouverture du générateur..."
        
        # Détecter l'OS et ouvrir le fichier
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            open "scripts/generate-pwa-icons.html"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            xdg-open "scripts/generate-pwa-icons.html" 2>/dev/null || echo "⚠️  Impossible d'ouvrir automatiquement. Ouvrez manuellement : scripts/generate-pwa-icons.html"
        else
            echo "⚠️  OS non reconnu. Ouvrez manuellement : scripts/generate-pwa-icons.html"
        fi
        
        echo ""
        echo "✅ Générateur ouvert dans votre navigateur"
        echo ""
        echo "📝 Après avoir téléchargé les icônes :"
        echo "   1. Déplacez tous les fichiers PNG dans public/icons/"
        echo "   2. Relancez ce script pour vérifier : ./scripts/setup-pwa-icons.sh"
    fi
fi

echo ""
echo "================================================"
echo "📚 Documentation disponible :"
echo "   - PWA_README.md - Vue d'ensemble"
echo "   - PWA_QUICK_START.md - Démarrage rapide"
echo "   - PWA_IMPLEMENTATION.md - Guide complet"
echo "   - PWA_TEST_CHECKLIST.md - Tests"
echo "================================================"
echo ""


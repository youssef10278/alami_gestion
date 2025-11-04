# Script PowerShell pour configurer les icônes PWA
# Usage: .\scripts\setup-pwa-icons.ps1

Write-Host "🎨 Configuration des Icônes PWA - Alami Gestion" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Créer le dossier icons s'il n'existe pas
$iconsPath = "public\icons"
if (-Not (Test-Path $iconsPath)) {
    Write-Host "📁 Création du dossier public\icons..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $iconsPath -Force | Out-Null
    Write-Host "✅ Dossier créé avec succès !" -ForegroundColor Green
} else {
    Write-Host "✅ Le dossier public\icons existe déjà" -ForegroundColor Green
}

Write-Host ""

# Vérifier les icônes requises
$requiredIcons = @(
    "icon-72x72.png",
    "icon-96x96.png",
    "icon-128x128.png",
    "icon-144x144.png",
    "icon-152x152.png",
    "icon-192x192.png",
    "icon-384x384.png",
    "icon-512x512.png",
    "icon-192x192-maskable.png",
    "icon-512x512-maskable.png"
)

Write-Host "🔍 Vérification des icônes requises..." -ForegroundColor Yellow
Write-Host ""

$missingIcons = @()
foreach ($icon in $requiredIcons) {
    $iconPath = Join-Path $iconsPath $icon
    if (Test-Path $iconPath) {
        Write-Host "  ✅ $icon" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $icon (manquant)" -ForegroundColor Red
        $missingIcons += $icon
    }
}

Write-Host ""

# Résumé
if ($missingIcons.Count -eq 0) {
    Write-Host "🎉 Toutes les icônes sont présentes !" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Vous pouvez maintenant :" -ForegroundColor Cyan
    Write-Host "   1. Build l'application : npm run build" -ForegroundColor White
    Write-Host "   2. Tester localement : npm start" -ForegroundColor White
    Write-Host "   3. Déployer : git add . && git commit -m 'feat: Add PWA icons' && git push" -ForegroundColor White
} else {
    Write-Host "⚠️  Il manque $($missingIcons.Count) icône(s)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Icônes manquantes :" -ForegroundColor Yellow
    foreach ($icon in $missingIcons) {
        Write-Host "   - $icon" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "🎨 Pour générer les icônes :" -ForegroundColor Cyan
    Write-Host "   1. Ouvrir : scripts\generate-pwa-icons.html" -ForegroundColor White
    Write-Host "   2. Personnaliser l'icône (texte 'AG' ou emoji 💼)" -ForegroundColor White
    Write-Host "   3. Cliquer sur 'Télécharger Toutes les Icônes'" -ForegroundColor White
    Write-Host "   4. Déplacer les fichiers téléchargés dans public\icons\" -ForegroundColor White
    Write-Host ""
    
    # Proposer d'ouvrir le générateur
    $response = Read-Host "Voulez-vous ouvrir le générateur d'icônes maintenant ? (O/N)"
    if ($response -eq "O" -or $response -eq "o") {
        Write-Host ""
        Write-Host "🚀 Ouverture du générateur..." -ForegroundColor Cyan
        Start-Process "scripts\generate-pwa-icons.html"
        Write-Host ""
        Write-Host "✅ Générateur ouvert dans votre navigateur" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Après avoir téléchargé les icônes :" -ForegroundColor Yellow
        Write-Host "   1. Déplacez tous les fichiers PNG dans public\icons\" -ForegroundColor White
        Write-Host "   2. Relancez ce script pour vérifier : .\scripts\setup-pwa-icons.ps1" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📚 Documentation disponible :" -ForegroundColor Cyan
Write-Host "   - PWA_README.md - Vue d'ensemble" -ForegroundColor White
Write-Host "   - PWA_QUICK_START.md - Démarrage rapide" -ForegroundColor White
Write-Host "   - PWA_IMPLEMENTATION.md - Guide complet" -ForegroundColor White
Write-Host "   - PWA_TEST_CHECKLIST.md - Tests" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""


# Script de configuration automatique pour Alami Gestion
# Executer avec : .\setup.ps1

Write-Host "Configuration de Alami Gestion" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Verifier si PostgreSQL est installe
Write-Host "Verification de PostgreSQL..." -ForegroundColor Yellow
$pgVersion = psql --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "PostgreSQL est installe : $pgVersion" -ForegroundColor Green
} else {
    Write-Host "PostgreSQL n'est pas installe ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configuration de la base de donnees" -ForegroundColor Yellow
Write-Host "Veuillez entrer vos informations PostgreSQL :" -ForegroundColor White
Write-Host ""

# Demander les informations de connexion
$pgUser = Read-Host "Nom d'utilisateur PostgreSQL (par defaut: postgres)"
if ([string]::IsNullOrWhiteSpace($pgUser)) {
    $pgUser = "postgres"
}

$pgPassword = Read-Host "Mot de passe PostgreSQL" -AsSecureString
$pgPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword))

$pgHost = Read-Host "Hote PostgreSQL (par defaut: localhost)"
if ([string]::IsNullOrWhiteSpace($pgHost)) {
    $pgHost = "localhost"
}

$pgPort = Read-Host "Port PostgreSQL (par defaut: 5432)"
if ([string]::IsNullOrWhiteSpace($pgPort)) {
    $pgPort = "5432"
}

Write-Host ""
Write-Host "Creation de la base de donnees..." -ForegroundColor Yellow

# Creer la base de donnees
$env:PGPASSWORD = $pgPasswordPlain
$createDbResult = psql -U $pgUser -h $pgHost -p $pgPort -c "CREATE DATABASE alami_db;" 2>&1

if ($LASTEXITCODE -eq 0 -or ($createDbResult -match "already exists")) {
    Write-Host "Base de donnees 'alami_db' creee ou existe deja" -ForegroundColor Green
} else {
    Write-Host "Erreur lors de la creation de la base de donnees" -ForegroundColor Yellow
    Write-Host $createDbResult -ForegroundColor Gray
}

# Construire l'URL de connexion
$databaseUrl = "postgresql://${pgUser}:${pgPasswordPlain}@${pgHost}:${pgPort}/alami_db?schema=public"

Write-Host ""
Write-Host "Mise a jour du fichier .env..." -ForegroundColor Yellow

# Generer un JWT secret aleatoire
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Creer le fichier .env
$envContent = @"
# Database
DATABASE_URL="$databaseUrl"

# JWT Secret (genere automatiquement)
JWT_SECRET="$jwtSecret"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "Fichier .env cree" -ForegroundColor Green

Write-Host ""
Write-Host "Initialisation de Prisma..." -ForegroundColor Yellow
npm run db:push

if ($LASTEXITCODE -eq 0) {
    Write-Host "Schema Prisma synchronise" -ForegroundColor Green
} else {
    Write-Host "Erreur lors de la synchronisation Prisma" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Insertion des donnees de test..." -ForegroundColor Yellow
npm run db:seed

if ($LASTEXITCODE -eq 0) {
    Write-Host "Donnees de test inserees" -ForegroundColor Green
} else {
    Write-Host "Erreur lors de l'insertion des donnees" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configuration terminee avec succes !" -ForegroundColor Green
Write-Host ""
Write-Host "Identifiants de connexion :" -ForegroundColor Cyan
Write-Host "   Proprietaire : owner@alami.com / admin123" -ForegroundColor White
Write-Host "   Vendeur      : seller@alami.com / seller123" -ForegroundColor White
Write-Host ""
Write-Host "Pour lancer l'application :" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "L'application sera accessible sur :" -ForegroundColor Cyan
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""


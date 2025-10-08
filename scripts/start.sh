#!/bin/bash

echo "🚀 Démarrage de l'application Alami Gestion"
echo ""

# Vérifier si DATABASE_URL est définie
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERREUR: DATABASE_URL n'est pas définie"
    echo "Veuillez configurer PostgreSQL sur Railway"
    exit 1
fi

echo "✅ DATABASE_URL détectée"
echo ""

# Exécuter les migrations Prisma
echo "🗄️ Exécution des migrations Prisma..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Migrations exécutées avec succès"
else
    echo "❌ Erreur lors des migrations"
    echo "Tentative avec db push..."
    npx prisma db push
    if [ $? -eq 0 ]; then
        echo "✅ Schema synchronisé avec db push"
    else
        echo "❌ Impossible de synchroniser la base de données"
        exit 1
    fi
fi

echo ""

# Générer le client Prisma (au cas où)
echo "🔧 Génération du client Prisma..."
npx prisma generate
echo "✅ Client Prisma généré"
echo ""

# Démarrer l'application Next.js
echo "🌐 Démarrage du serveur Next.js..."
echo "📍 Port: $PORT"
echo "🌍 Environnement: $NODE_ENV"
echo ""

exec node server.js

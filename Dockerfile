# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copier les dépendances depuis l'étape précédente
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/prisma ./prisma/

# Générer le client Prisma
RUN npx prisma generate

# Copier le code source
COPY . .

# Construire l'application (ignorer les erreurs ESLint/TypeScript)
ENV SKIP_ENV_VALIDATION=true
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/

# Créer le script de démarrage directement dans le container
RUN mkdir -p ./scripts && \
    echo '#!/bin/bash' > ./scripts/start.sh && \
    echo '' >> ./scripts/start.sh && \
    echo 'echo "🚀 Démarrage de l'\''application Alami Gestion"' >> ./scripts/start.sh && \
    echo 'echo ""' >> ./scripts/start.sh && \
    echo '' >> ./scripts/start.sh && \
    echo '# Vérifier si DATABASE_URL est définie' >> ./scripts/start.sh && \
    echo 'if [ -z "$DATABASE_URL" ]; then' >> ./scripts/start.sh && \
    echo '    echo "❌ ERREUR: DATABASE_URL n'\''est pas définie"' >> ./scripts/start.sh && \
    echo '    echo "Veuillez configurer PostgreSQL sur Railway"' >> ./scripts/start.sh && \
    echo '    exit 1' >> ./scripts/start.sh && \
    echo 'fi' >> ./scripts/start.sh && \
    echo '' >> ./scripts/start.sh && \
    echo 'echo "✅ DATABASE_URL détectée"' >> ./scripts/start.sh && \
    echo 'echo ""' >> ./scripts/start.sh && \
    echo '' >> ./scripts/start.sh && \
    echo '# Exécuter les migrations Prisma' >> ./scripts/start.sh && \
    echo 'echo "🗄️ Exécution des migrations Prisma..."' >> ./scripts/start.sh && \
    echo 'npx prisma migrate deploy' >> ./scripts/start.sh && \
    echo '' >> ./scripts/start.sh && \
    echo 'if [ $? -eq 0 ]; then' >> ./scripts/start.sh && \
    echo '    echo "✅ Migrations exécutées avec succès"' >> ./scripts/start.sh && \
    echo 'else' >> ./scripts/start.sh && \
    echo '    echo "❌ Erreur lors des migrations"' >> ./scripts/start.sh && \
    echo '    echo "Tentative avec db push..."' >> ./scripts/start.sh && \
    echo '    npx prisma db push' >> ./scripts/start.sh && \
    echo '    if [ $? -eq 0 ]; then' >> ./scripts/start.sh && \
    echo '        echo "✅ Schema synchronisé avec db push"' >> ./scripts/start.sh && \
    echo '    else' >> ./scripts/start.sh && \
    echo '        echo "❌ Impossible de synchroniser la base de données"' >> ./scripts/start.sh && \
    echo '        exit 1' >> ./scripts/start.sh && \
    echo '    fi' >> ./scripts/start.sh && \
    echo 'fi' >> ./scripts/start.sh && \
    echo '' >> ./scripts/start.sh && \
    echo 'echo ""' >> ./scripts/start.sh && \
    echo '' >> ./scripts/start.sh && \
    echo '# Générer le client Prisma (au cas où)' >> ./scripts/start.sh && \
    echo 'echo "🔧 Génération du client Prisma..."' >> ./scripts/start.sh && \
    echo 'npx prisma generate' >> ./scripts/start.sh && \
    echo 'echo "✅ Client Prisma généré"' >> ./scripts/start.sh && \
    echo 'echo ""' >> ./scripts/start.sh && \
    echo '' >> ./scripts/start.sh && \
    echo '# Démarrer l'\''application Next.js' >> ./scripts/start.sh && \
    echo 'echo "🌐 Démarrage du serveur Next.js..."' >> ./scripts/start.sh && \
    echo 'echo "📍 Port: $PORT"' >> ./scripts/start.sh && \
    echo 'echo "🌍 Environnement: $NODE_ENV"' >> ./scripts/start.sh && \
    echo 'echo ""' >> ./scripts/start.sh && \
    echo '' >> ./scripts/start.sh && \
    echo 'exec node server.js' >> ./scripts/start.sh && \
    chmod +x ./scripts/start.sh && \
    chown -R nextjs:nodejs /app

# Utiliser l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Commande de démarrage avec migrations
CMD ["./scripts/start.sh"]

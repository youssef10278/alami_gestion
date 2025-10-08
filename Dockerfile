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

# Créer un script de démarrage simple
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'echo "🚀 Starting Alami Gestion Application"' >> /start.sh && \
    echo 'if [ -n "$DATABASE_URL" ]; then' >> /start.sh && \
    echo '  echo "✅ DATABASE_URL found"' >> /start.sh && \
    echo '  echo "🗄️ Running Prisma migrations..."' >> /start.sh && \
    echo '  npx prisma migrate deploy || npx prisma db push' >> /start.sh && \
    echo '  echo "✅ Database ready"' >> /start.sh && \
    echo 'else' >> /start.sh && \
    echo '  echo "⚠️ DATABASE_URL not found, starting without migrations"' >> /start.sh && \
    echo 'fi' >> /start.sh && \
    echo 'echo "🌐 Starting Next.js server..."' >> /start.sh && \
    echo 'exec node server.js' >> /start.sh && \
    chmod +x /start.sh && \
    chown nextjs:nodejs /start.sh

# Utiliser l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Commande de démarrage avec migrations
CMD ["/start.sh"]

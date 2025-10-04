# 🚀 Guide de Déploiement - Alami Gestion

## 📋 Prérequis

- Compte Vercel (recommandé) ou autre plateforme
- Base de données PostgreSQL en production
- Node.js 18+

## 🌐 Déploiement sur Vercel (Recommandé)

### 1. Préparer la base de données

**Option A : Vercel Postgres**
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Créer une base de données Postgres
vercel postgres create
```

**Option B : Supabase (Gratuit)**
1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Copier la connection string PostgreSQL

**Option C : Railway / Render / Neon**
- Suivre les instructions de la plateforme choisie

### 2. Configurer les variables d'environnement

Dans Vercel Dashboard :
1. Aller dans Settings > Environment Variables
2. Ajouter :

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=votre-secret-jwt-super-securise-minimum-32-caracteres
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
NODE_ENV=production
```

### 3. Déployer

**Via GitHub (Recommandé)**
1. Pusher le code sur GitHub
2. Importer le projet dans Vercel
3. Vercel détectera automatiquement Next.js
4. Cliquer sur "Deploy"

**Via CLI**
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Déployer en production
vercel --prod
```

### 4. Initialiser la base de données

Après le premier déploiement :

```bash
# Pousser le schéma Prisma
npx prisma db push

# Seed la base de données
npx prisma db seed
```

Ou via Vercel CLI :
```bash
vercel env pull .env.production
npx prisma db push
npm run db:seed
```

## 🐳 Déploiement avec Docker

### 1. Créer un Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. Créer docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: alami
      POSTGRES_PASSWORD: changeme
      POSTGRES_DB: alami_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://alami:changeme@postgres:5432/alami_db
      JWT_SECRET: your-super-secret-jwt-key
      NEXT_PUBLIC_APP_URL: http://localhost:3000
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### 3. Lancer avec Docker

```bash
# Build et lancer
docker-compose up -d

# Initialiser la base de données
docker-compose exec app npx prisma db push
docker-compose exec app npm run db:seed
```

## 🔧 Configuration Next.js pour production

Modifier `next.config.ts` :

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Pour Docker
  images: {
    domains: ['votre-cdn.com'], // Si vous utilisez un CDN
  },
  // Optimisations
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
```

## 🔒 Checklist de sécurité avant production

- [ ] Changer JWT_SECRET par une valeur aléatoire forte
- [ ] Utiliser HTTPS uniquement
- [ ] Configurer CORS si nécessaire
- [ ] Activer les cookies secure en production
- [ ] Vérifier que les mots de passe par défaut sont changés
- [ ] Configurer les backups de base de données
- [ ] Mettre en place le monitoring
- [ ] Configurer les logs
- [ ] Tester la récupération après sinistre
- [ ] Vérifier les limites de rate limiting

## 📊 Monitoring et Logs

### Vercel Analytics
```bash
npm install @vercel/analytics
```

Dans `app/layout.tsx` :
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Sentry (Erreurs)
```bash
npm install @sentry/nextjs
```

## 🔄 CI/CD avec GitHub Actions

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🌍 Domaine personnalisé

### Sur Vercel
1. Aller dans Settings > Domains
2. Ajouter votre domaine
3. Configurer les DNS selon les instructions

### Configuration DNS
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 📈 Optimisations de performance

### 1. Activer la compression
Déjà activé dans Next.js

### 2. CDN pour les images
Utiliser Vercel Image Optimization ou Cloudinary

### 3. Cache
```typescript
// Dans les API routes
export const revalidate = 60 // Revalider toutes les 60 secondes
```

### 4. Database Connection Pooling
Utiliser PgBouncer ou Prisma Accelerate

## 🔐 Backups

### Automatique avec Vercel Postgres
Les backups sont automatiques

### Manuel avec pg_dump
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restauration
```bash
psql $DATABASE_URL < backup.sql
```

## 📞 Support post-déploiement

- Vérifier les logs : `vercel logs`
- Monitoring : Vercel Dashboard
- Erreurs : Sentry ou Vercel Analytics
- Performance : Lighthouse CI

## ✅ Checklist finale

- [ ] Application déployée et accessible
- [ ] Base de données initialisée
- [ ] Variables d'environnement configurées
- [ ] HTTPS activé
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] Monitoring activé
- [ ] Backups configurés
- [ ] Tests de charge effectués
- [ ] Documentation mise à jour
- [ ] Équipe formée

Félicitations ! Votre application est en production ! 🎉


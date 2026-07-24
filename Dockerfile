# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
# Provide a dummy DATABASE_URL during build time to avoid validation errors
RUN DATABASE_URL="postgresql://postgres:Allium1380@localhost:5432/db" npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
# Provide a dummy DATABASE_URL during build time for Next.js build
RUN DATABASE_URL="postgresql://postgres:Allium1380@localhost:5432/db" npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Prisma 7 CLI datasource URL-i yalniz prisma.config.ts-den goturur (db push ucun mecburidir)
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/entrypoint.sh ./entrypoint.sh

# Install prisma globally to run db commands
RUN npm install -g prisma

# Fix potential line ending issues in entrypoint script
RUN apk add --no-cache dos2unix && dos2unix entrypoint.sh && apk del dos2unix
RUN chmod +x entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000

ENTRYPOINT ["./entrypoint.sh"]

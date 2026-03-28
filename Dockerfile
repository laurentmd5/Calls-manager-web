# ============================================
# STAGE 1: Builder - Build avec PNPM
# ============================================
FROM node:24-alpine AS builder

ENV NODE_ENV=production

# Installer pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances avec pnpm
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod=false

# Copier le code source
COPY . .

# Build l'application
RUN pnpm run build

# ============================================
# STAGE 2: Nginx - Image légère rootless
# ============================================
FROM nginx:alpine

RUN addgroup -g 10001 -S nginx && \
    adduser -S -u 10001 -G nginx nginx && \
    mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

USER nginx:nginx

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
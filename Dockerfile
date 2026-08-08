# Production image: Angular SPA served by Laravel (same-origin).
# Used by Render / docker run — not for local docker-compose (dev).

# ---- Stage 1: build Angular ----
FROM node:20-alpine AS client

WORKDIR /app

COPY client/package.json client/package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY client/ ./
RUN npm run build

# ---- Stage 2: Laravel + SPA assets ----
FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    default-mysql-client \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY server/composer.json server/composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader

COPY server/ ./
RUN composer dump-autoload --optimize \
    && php artisan package:discover --ansi || true

# Merge Angular browser build into public/; keep Laravel index.php
COPY --from=client /app/dist/client/browser /tmp/angular
RUN cp -a /tmp/angular/. public/ \
    && mv public/index.html public/spa.html \
    && rm -rf /tmp/angular \
    && mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache

COPY docker/production-entrypoint.sh /usr/local/bin/production-entrypoint.sh
RUN chmod +x /usr/local/bin/production-entrypoint.sh

ENV PORT=8000
EXPOSE 8000

ENTRYPOINT ["production-entrypoint.sh"]

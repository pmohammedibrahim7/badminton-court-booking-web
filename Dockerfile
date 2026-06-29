FROM php:8.2-fpm-alpine

# Install system dependencies required by Laravel and common extensions
RUN apk add --no-cache \
    git \
    curl \
    bash \
    icu-dev \
    zlib-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    libzip-dev \
    oniguruma-dev \
    autoconf \
    g++ \
    make \
    libxml2-dev && \
    docker-php-ext-configure zip && \
    docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        pdo_pgsql \
        intl \
        mbstring \
        zip \
        exif \
        pcntl \
        bcmath && \
    # Clean up build deps
    apk del g++ make autoconf && \
    rm -rf /var/cache/apk/*

# Install Composer (official installer)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy only composer files first for caching layers
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy the rest of the application code
COPY . .

# Ensure storage & bootstrap/cache are writable
RUN mkdir -p storage/framework/cache/data && \
    chmod -R 775 storage bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache

# Generate application key (will be overridden by .env on first start if present)
RUN php artisan key:generate --no-interaction

# Expose the port that Render will set via the $PORT env var
EXPOSE 8080

# Start the built‑in PHP server bound to the port Render provides
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT} -t public"]

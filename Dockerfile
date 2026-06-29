# Use the official PHP 8.3 FPM Alpine base image
FROM php:8.3-fpm-alpine

# Install system packages required for the PHP extensions we need.
# postgresql-dev is added so pdo_pgsql can be compiled.
RUN set -eux; \
    apk add --no-cache \
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
        postgresql-dev \
        autoconf \
        g++ \
        make \
        libxml2-dev; \
    # Configure and install the required PHP extensions
    docker-php-ext-configure zip; \
    docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        pdo_pgsql \
        intl \
        mbstring \
        zip \
        exif \
        pcntl \
        bcmath; \
    # Remove build‑time packages to keep the image small
    apk del --purge g++ make autoconf; \
    rm -rf /var/cache/apk/*

# Install Composer (using the official Composer image as a source)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory for the Laravel app
WORKDIR /app

# Copy only composer files first for better layer caching
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy the rest of the application source code
COPY . .

# Run Laravel Artisan commands now that the full source is present
RUN php artisan package:discover --ansi && \
    php artisan key:generate --no-interaction

# Ensure storage and cache directories are writable by the web server user
RUN mkdir -p storage/framework/cache/data && \
    chmod -R 775 storage bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache

# Generate an application key (will be overridden by .env if present)
RUN php artisan key:generate --no-interaction

# Expose the port Render will provide via the $PORT environment variable
EXPOSE 8080

# Start the built‑in PHP server bound to the dynamic $PORT value
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT} -t public"]

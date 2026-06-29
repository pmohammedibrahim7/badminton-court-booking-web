#!/bin/sh
set -e

# Run database migrations (if any)
php artisan migrate --force || true

# Cache configuration and routes for better performance
php artisan config:cache || true
php artisan route:cache || true

# Execute the container's CMD (starts the PHP built-in server)
exec "$@"

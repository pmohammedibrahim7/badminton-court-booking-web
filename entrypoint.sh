#!/bin/sh
# If APP_KEY is missing, generate one (this will write to .env)
if [ -z "$APP_KEY" ]; then
  php artisan key:generate --force
fi
set -e

# Run database migrations (if any)
php artisan migrate --force || true

# Cache configuration and routes for better performance
php artisan config:cache || true
php artisan route:cache || true

# Execute the container's CMD (starts the PHP built-in server)
exec "$@"

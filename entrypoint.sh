#!/bin/sh

# -------------------------------------------------------------------------
# Entrypoint for the Render container
# -------------------------------------------------------------------------

# 1️⃣ Generate APP_KEY if the environment variable is missing
if [ -z "$APP_KEY" ]; then
  php artisan key:generate --force
fi

set -e

# 2️⃣ Run migrations **and seed** the database.
#    Fresh migration guarantees the seed runs every time the container is created.
php artisan migrate:fresh --seed --force

# 3️⃣ Cache config & routes (optional but speeds up requests)
php artisan config:cache || true
php artisan route:cache  || true

# 4️⃣ Run the container’s CMD (starts the PHP built‑in server)
exec "$@"

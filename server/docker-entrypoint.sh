#!/bin/sh
set -e

echo "==> Waiting for MySQL..."
until php -r '
try {
  new PDO(
    "mysql:host=" . getenv("DB_HOST") . ";port=" . getenv("DB_PORT") . ";dbname=" . getenv("DB_DATABASE"),
    getenv("DB_USERNAME"),
    getenv("DB_PASSWORD"),
    [PDO::ATTR_TIMEOUT => 3]
  );
  exit(0);
} catch (Throwable $e) {
  exit(1);
}
'; do
  sleep 2
done
echo "==> MySQL is ready"

if [ ! -f vendor/autoload.php ]; then
  echo "==> Installing PHP dependencies..."
  composer install --no-interaction --prefer-dist --optimize-autoloader
else
  echo "==> PHP dependencies present"
fi

if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
  echo "==> Generating APP_KEY..."
  php artisan key:generate --force
fi

echo "==> Running migrations..."
php artisan migrate --force

echo "==> Seeding (safe to re-run)..."
php artisan db:seed --force

echo "==> Ensuring storage link..."
php artisan storage:link 2>/dev/null || true

echo "==> Clearing caches..."
php artisan config:clear >/dev/null
php artisan cache:clear >/dev/null

echo "==> Starting Laravel on :8000"
exec php artisan serve --host=0.0.0.0 --port=8000 --no-reload

#!/bin/sh
set -e

PORT="${PORT:-8000}"

if [ -z "${APP_KEY:-}" ]; then
  echo "ERROR: APP_KEY is not set. Generate one with: php artisan key:generate --show"
  exit 1
fi

wait_for_db() {
  php -r '
$host = getenv("DB_HOST");
$port = getenv("DB_PORT") ?: "3306";
$db = getenv("DB_DATABASE");
$user = getenv("DB_USERNAME");
$pass = getenv("DB_PASSWORD");
$opts = [PDO::ATTR_TIMEOUT => 5];
$ca = getenv("MYSQL_ATTR_SSL_CA");
foreach ([$ca, "/var/www/html/certs/isrgrootx1.pem", "certs/isrgrootx1.pem"] as $path) {
  if ($path && is_file($path)) { $opts[PDO::MYSQL_ATTR_SSL_CA] = $path; break; }
}
try {
  new PDO("mysql:host={$host};port={$port};dbname={$db}", $user, $pass, $opts);
  exit(0);
} catch (Throwable $e) {
  fwrite(STDERR, $e->getMessage() . PHP_EOL);
  exit(1);
}
'
}

if [ -n "${DB_HOST:-}" ]; then
  echo "==> Waiting for database at ${DB_HOST}:${DB_PORT:-3306}/${DB_DATABASE}..."
  until wait_for_db; do
    sleep 3
  done
  echo "==> Database is ready"

  echo "==> Running migrations..."
  php artisan migrate --force

  if [ "${RUN_SEEDERS:-false}" = "true" ]; then
    echo "==> Running seeders (RUN_SEEDERS=true)..."
    php artisan db:seed --force
  fi
else
  echo "==> DB_HOST not set — skipping migrate/seed (set DB_* when your database is ready)"
fi

echo "==> Ensuring storage link..."
php artisan storage:link 2>/dev/null || true

echo "==> Caching config / routes..."
php artisan config:cache
php artisan route:cache

echo "==> Starting Laravel on :${PORT}"
exec php artisan serve --host=0.0.0.0 --port="${PORT}"

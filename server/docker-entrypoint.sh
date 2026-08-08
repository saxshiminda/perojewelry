#!/bin/sh
set -e

echo "==> Waiting for database..."
until php -r '
$host = getenv("DB_HOST");
$port = getenv("DB_PORT") ?: "3306";
$db = getenv("DB_DATABASE");
$user = getenv("DB_USERNAME");
$pass = getenv("DB_PASSWORD");
$opts = [PDO::ATTR_TIMEOUT => 5];
$ca = getenv("MYSQL_ATTR_SSL_CA");
if ($ca && is_file($ca)) {
  $opts[PDO::MYSQL_ATTR_SSL_CA] = $ca;
} elseif (filter_var(getenv("DB_SSL") ?: "", FILTER_VALIDATE_BOOLEAN)) {
  $fallback = __DIR__ . "/certs/isrgrootx1.pem";
  // When run via artisan serve cwd is /var/www/html
  foreach ([$ca, "/var/www/html/certs/isrgrootx1.pem", "certs/isrgrootx1.pem"] as $path) {
    if ($path && is_file($path)) { $opts[PDO::MYSQL_ATTR_SSL_CA] = $path; break; }
  }
}
try {
  new PDO("mysql:host={$host};port={$port};dbname={$db}", $user, $pass, $opts);
  exit(0);
} catch (Throwable $e) {
  fwrite(STDERR, $e->getMessage() . PHP_EOL);
  exit(1);
}
'; do
  sleep 3
done
echo "==> Database is ready"

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
php artisan cache:clear >/dev/null || true

echo "==> Starting Laravel on :8000"
exec php artisan serve --host=0.0.0.0 --port=8000 --no-reload

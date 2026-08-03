# Pero Jewelry API (Laravel)

See the root [README](../README.md) for Docker setup.

```bash
# From repo root — one command for client + API + DB
docker compose up --build
```

Local API only (MySQL via Docker):

```bash
docker compose up db -d
composer install
php artisan migrate --seed
php artisan serve
```

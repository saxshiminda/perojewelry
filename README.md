# Pero Jewelry

Handmade jewelry e-shop — Angular 20 client + Laravel 13 API + MySQL.

## Stack

- **Client:** Angular (`client/`) on port 4200
- **API:** Laravel + Sanctum (`server/`) on port 8000
- **DB:** MySQL 8 (Docker, host port 3307)

## Quick start

```bash
docker compose up --build
```

Then in another terminal (first time):

```bash
docker compose exec server composer install
docker compose exec server php artisan migrate --seed
docker compose exec server php artisan storage:link
```

Or run locally without Docker for the app (MySQL via Docker only):

```bash
docker compose up db -d
cd server && composer install && php artisan migrate --seed && php artisan serve
cd client && npm install && npm start
```

Admin: `admin@perojewelry.com` / `password`

Theme defaults to dark; toggle in the header.

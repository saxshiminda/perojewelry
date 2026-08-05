# Pero Jewelry

Handmade jewelry e-shop — Angular 20 client + Laravel 13 API + MySQL.

## One command

```bash
docker compose up --build
```

That’s it. On start the stack will:

1. Start MySQL
2. Install PHP deps, migrate + seed, start the API
3. Install npm deps (if needed) and start Angular

| Service | URL |
|---------|-----|
| Shop | http://localhost:4200 |
| API | http://localhost:8000 |
| MySQL | `localhost:3307` |

**Admin:** `admin@perojewelry.com` / `password`

Stop with `Ctrl+C`, or run detached:

```bash
docker compose up --build -d
docker compose down
```

## Notes

- Theme defaults to dark (gothic).
- Guests can add to bag; checkout requires sign-in.
- Payments are simulated (demo).
- Contact is email / Instagram (no fake form).

## Local without Docker (optional)

```bash
docker compose up db -d
cd server && composer install && php artisan migrate --seed && php artisan serve
cd client && npm install && npm start
```

Local `.env` uses `DB_HOST=127.0.0.1` / `DB_PORT=3307`. Docker overrides these automatically inside containers.

# Pero Jewelry

Handmade jewelry e-shop — Angular 20 client + Laravel 13 API + TiDB Cloud / MySQL.

## One command (local)

Uses your TiDB credentials from `server/.env` (gitignored). Create the `pero` database in the TiDB console first.

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Shop | http://localhost:4200 |
| API | http://localhost:8001 |

Optional local MySQL instead of TiDB:

```bash
docker compose --profile local-db up --build
```

(then point `server/.env` back at `DB_HOST=db` / local credentials)

**Admin (after seeding):** `admin@perojewelry.com` / `password`

```bash
docker compose down
```

## Notes

- Theme defaults to dark (gothic).
- Guests can add to bag; checkout requires sign-in.
- Payments are simulated (demo).
- Contact is email / Instagram (no fake form).
- TiDB requires TLS — `DB_SSL=true` uses `server/certs/isrgrootx1.pem`.

## Local without Docker (optional)

```bash
cd server && composer install && php artisan migrate --seed && php artisan serve
cd client && npm install && npm start
```

## Production (Render — free)

Same-origin deploy: Angular is built into Laravel `public/` and served from one web service (`Dockerfile` + `render.yaml`).

### 1. Prepare

1. In TiDB Cloud, create database **`pero`**.
2. Push this repo to GitHub.
3. Generate an app key locally (once):

```bash
cd server && php artisan key:generate --show
```

4. Use [`server/.env.production.example`](server/.env.production.example) as a checklist for Render env vars.

### 2. Deploy on Render

1. Create a free [Render](https://render.com) account.
2. **New → Blueprint** (uses `render.yaml`) or **Web Service** with Docker / `./Dockerfile`.
3. Set environment variables:

| Variable | Notes |
|----------|---------|
| `APP_KEY` | from `php artisan key:generate --show` |
| `APP_URL` / `FRONTEND_URL` / `CORS_ALLOWED_ORIGINS` | `https://YOUR-SERVICE.onrender.com` |
| `SANCTUM_STATEFUL_DOMAINS` | `YOUR-SERVICE.onrender.com` (host only) |
| `DB_HOST` | TiDB gateway host |
| `DB_PORT` | `4000` |
| `DB_DATABASE` | `pero` |
| `DB_USERNAME` / `DB_PASSWORD` | from TiDB (set in Render UI — do not commit) |
| `DB_SSL` | `true` |
| `MYSQL_ATTR_SSL_CA` | `/var/www/html/certs/isrgrootx1.pem` |
| `RUN_SEEDERS` | `true` once, then `false` |

4. Deploy, open the URL, change the admin password after seeding.

### 3. Caveats (free tier)

- Cold starts after idle.
- Ephemeral disk — uploads in `storage/` are lost on redeploy; static `public/images` are fine for a demo.
- No custom domain until you buy one.

**Security:** never commit `server/.env` or paste DB passwords into the repo. If a password was shared in chat, rotate it in the TiDB console.

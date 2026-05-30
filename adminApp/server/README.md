```
npm install
cp .env.example .env
npm run dev
```

```
open http://localhost:3000
```

## Environment

`DATABASE_URL` is optional in development, but required when `NODE_ENV=production`.

## Database

This project is configured for PostgreSQL with Drizzle.

```
npm run db:generate
npm run db:migrate
```

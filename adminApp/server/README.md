```
npm install
cp .env.example .env
vc dev
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

## Deploying to Vercel Functions

The server exports the Hono app from `src/index.ts`, which is the serverless entrypoint Vercel expects for Hono. Use Vercel CLI locally:

```
vc dev
```

Deploy the `server` directory as the Vercel project root, then set these environment variables in Vercel:

```
NODE_ENV=production
DATABASE_URL=...
DB_POOL_MAX=1
RESEND_API_KEY=...
AUTH_SECRET=...
CORS_ORIGINS=https://your-client-domain.vercel.app
```

After deployment, the API routes stay the same, for example:

```
https://your-api-domain.vercel.app/api/health
```

For production traffic, use a serverless-friendly Postgres connection string or a managed pooler. The current in-memory rate limiter is fine for local development, but it is not shared across Vercel function instances.

# Repository Guidelines

## Project Structure & Module Organization

This is an Express API server using ESM modules. Application code lives in `src/`:

- `api/index.js` exports the Express app as the Vercel Function entrypoint.
- `src/app.js` registers middleware and top-level routes.
- `src/config/` contains environment validation.
- `src/controllers/`, `src/routes/`, and `src/middlewares/` hold request handlers, route maps, and Express middleware.
- `src/db/` contains Drizzle setup, schema definitions, and migrations.
- `src/utils/` contains shared helpers such as logging and operational errors.
- `.agents/skills/` stores local agent skill docs, not runtime code.

There is no `tests/` directory yet. Add tests under `tests/` or colocated `*.test.js` files when a test runner is introduced.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: run the server locally through the globally installed Vercel CLI.
- `npm run db:generate`: generate Drizzle migrations from schema changes.
- `npm run db:migrate`: apply pending Drizzle migrations.
- `npm run db:studio`: open Drizzle Studio for database inspection.

No `npm test` script is currently configured. Add one before relying on automated test checks.

## Coding Style & Naming Conventions

Use JavaScript ESM syntax (`import`/`export`). Keep files focused by layer: routes wire URLs, controllers handle request logic, and utilities stay framework-light where possible. Follow the existing two-space indentation in newer files and keep semicolon usage consistent within a file. Use camelCase for functions and variables, and lowercase dot-suffixed filenames such as `health.route.js`, `auth.controller.js`, and `rateLimiter.js`.

## Testing Guidelines

When adding tests, prefer integration tests for routes and unit tests for pure utilities. Name files `*.test.js` or place them in `tests/` with names that mirror the source module. Mock Neon, Google OAuth, and Better Auth network flows unless the test is explicitly end-to-end.

## Commit & Pull Request Guidelines

Recent history uses concise imperative commits and occasional Conventional Commit prefixes, for example `feat: initialize Express server...` and `feat(database): integrate Drizzle ORM...`. Prefer `type(scope): summary` when the scope is useful.

Pull requests should include a short description, linked issue when applicable, environment or migration notes, and verification steps such as `npm run db:generate`, `npm run db:migrate`, or manual endpoint checks.

## Security & Configuration Tips

Keep secrets in `.env`; commit only safe placeholders in `.env.example`. Required runtime values include `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`. Review CORS and cookie settings before production deployment.

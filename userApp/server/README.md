# DevBits Curation Server (userApp Backend)

An Express.js REST API backend supporting the DevBits AI-Enriched news curation client. It integrates PostgreSQL via Drizzle ORM, handles user authentication via Better Auth, manages read-only shared database tables, and exposes rate-limited, validated route handlers.

---

## Deploying to Vercel

The server exposes the Express app through `api/index.js` as a Vercel Function. Local development uses the globally installed Vercel CLI:

```bash
npm run dev    # vc dev
vercel dev     # equivalent global CLI command
```

1. Import the repository into Vercel and set the project **Root Directory** to `server`.
2. Keep the framework preset as **Other** and leave the build/output commands empty.
3. Add these environment variables for Production and Preview:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://your-api-project.vercel.app
CORS_ORIGIN=https://your-frontend-project.vercel.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

4. In Google OAuth, add this authorized redirect URI:

```text
https://your-api-project.vercel.app/api/auth/callback/google
```

5. Deploy and verify:

```text
https://your-api-project.vercel.app/api/health
```

The frontend deployment should use:

```env
NEXT_PUBLIC_API_URL=https://your-api-project.vercel.app/api
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-api-project.vercel.app
```

Do not run database migrations as a Vercel build command. Apply migrations separately before deploying schema-dependent changes.

---

## 1. System Architecture & Shared DB Strategy

The `userApp` backend shares a single cloud database instance (hosted on Neon PostgreSQL) with the `adminApp`. To prevent database lockups, data pollution, or migration collisions, we implement the following separation of concerns:

### Shared Schema Mapping
* **Admin Ownership**: The `adminApp` is the sole owner of the `dev_news` and `blogs` tables. It executes Drizzle migrations to alter these tables.
* **User Read-Only Access**: The `userApp` maps `devNews` and `blogs` in `src/db/schema.js` purely to query published items (`isPublished === true`).
* **Privacy Enforcement**: To maintain admin privacy, all news and blog controllers completely exclude author columns (`authorId`, `authorEmail`) from the payload returned to users.

### Preventing Migration Collisions
To prevent Drizzle Kit from generating conflicting migration tables or deleting tables owned by `adminApp` during `userApp` builds, we configured:
1. **Custom Migration Log Table**: We set `migrations: { table: 'user_drizzle_migrations' }` in `drizzle.config.js` to avoid sharing the same migration tracking logs.
2. **Tables Whitelist Filter**: We set `tablesFilter` in `drizzle.config.js` to only manage tables owned by `userApp`:
   ```javascript
   tablesFilter: ["user", "session", "account", "verification", "news_likes", "feedbacks"]
   ```

---

## 2. Core API Features

### A. Authentication (Better Auth)
* Google Social OAuth + Google One Tap integrations.
* Local router `auth.route.js` handles user profile checking, active device listing, and logging out specific or remote session tokens.

### B. News & Likes
* **News Fetching**: Fetches published news articles using cursor-based pagination.
* **Likes System (`news_likes`)**: Users can like news articles. The `news_likes` table uses a composite primary key `(user_id, news_id)` and is owned/migrated entirely by `userApp`.
* **Likes Endpoints**:
  * `POST /api/news/:id/like` – Add a like (upserts securely).
  * `DELETE /api/news/:id/like` – Remove a like.
  * `GET /api/news/liked` – Retrieve list of all news liked by the current user.

### C. Blogs
* Fetches published blog deep-dives by pagination or details by `:id`. Written in raw Markdown (parsed into rich HTML on the client).

### D. Feedbacks
* **Feedback Submission**: Authenticated users can submit feedback multiple times. The feedbacks table is owned/migrated entirely by `userApp`.
* **Feedbacks Endpoints**:
  * `POST /api/feedbacks` – Submits a feedback message (requires authentication, parses and validates message body using Zod).

---

## 3. Middleware Stack

### Global & Route-level Rate Limiting
* **Distributed API Limiter**: The global `rateLimiter` allows 100 requests per 15 minutes and stores counters in Neon so limits are shared across Vercel Function instances.
* **Complete API Coverage**: The limiter is mounted before custom auth routes, Better Auth, and all other `/api` routes. Better Auth's process-local limiter is disabled to avoid serverless instances maintaining separate counters.

### Zod Parameter Validation
The validation middleware in `src/middlewares/validate.js` was enhanced to support dynamic request segments:
```javascript
const validate = (schema, source = "body") => (req, res, next) => { ... }
```
We validate that the `:id` parameter matches a valid UUID schema (`idParamSchema`) on detail, like, and unlike requests before querying PostgreSQL:
```javascript
router.get("/:id", validate(idParamSchema, "params"), getPublishedNewsById);
```

---

## 4. Challenges & Hurdles Faced (Build Log)

During development and compilation builds, we ran into and resolved several technical challenges:

### 1. Drizzle Migration Conflict on Shared Schema
* **Challenge**: When generating migrations for the `news_likes` table, Drizzle Kit noticed references to `devNews` and `blogs` and attempted to append SQL commands creating the `dev_news` and `blogs` tables in `0003_black_paper_doll.sql`. Executing this migration failed because those tables already existed in the shared DB (managed by the `adminApp`).
* **Solution**: We edited the generated `.sql` file manually to delete the `CREATE TABLE "blogs"` and `CREATE TABLE "dev_news"` statements, leaving only the `CREATE TABLE "news_likes"` statement and its foreign key constraints. This allowed `npm run db:migrate` to succeed.

### 2. Express Body-Parsing Middleware Order
* **Challenge**: Standard Express JSON body-parsing middleware (`express.json()`) was declared after auth routes. Consequently, custom endpoints trying to access `req.body` (like revoking sessions via POST) received `undefined` or crashed.
* **Solution**: Reordered global body-parsing middlewares in `app.js` to execute before routing controllers.

### 3. Zod Error Parsing Mismatches
* **Challenge**: The validation helper threw runtime errors on validation failures due to utilizing `parsed.error.errors` which didn't match the current Zod package version interface.
* **Solution**: Standardized Zod error extraction to fall back on `parsed.error.issues || parsed.error.errors || []`.

### 4. Route Parameter Collision
* **Challenge**: In `news.route.js`, the parameterized `:id` route (`/:id`) would greedily capture `/liked` as an ID, throwing a Zod validation error ("Invalid UUID") when users fetched their liked news feeds.
* **Solution**: Ordered the `/liked` endpoint *above* the `/:id` route definition in `news.route.js` so it evaluates first.

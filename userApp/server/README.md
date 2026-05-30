# DevBits Curation Server

A production-ready, highly secure, and minimalistic Express.js backend server designed to power the DevBits AI Curation Platform. Built with modern ES Modules, structured database adapters, and seamless authentication layers.

---

## 🚀 Key Features

*   **Authentication (Better Auth):** Implements node-native middleware adapter linking Google Social OAuth credentials to session databases.
*   **Database (Drizzle ORM & Neon Serverless PG):** Schema-driven, typed SQL table mapping supporting migration setups and branch connections.
*   **Security (Helmet & CORS):** Enforces strict HTTP headers, parameterized CORS origins, and credentials handshakes.
*   **Structured Logging (Pino):** Optimized JSON logging formats for production monitoring alongside colorized development streams.
*   **Rate Limiting:** Protects endpoints from DDoS/brute-force abuse via dynamic window limiting.
*   **Production Error Boundaries:** Standardized operational exceptions mapping using custom `AppError` rules.

---

## 📂 Project Directory Structure

```text
.
├── src/
│   ├── app.js                  # Express application pipeline & middleware configuration
│   ├── index.js                # Core server entry point & process shutdown handlers
│   ├── config/
│   │   └── env.js              # Environment schemas parsing and validation (Zod)
│   ├── controllers/
│   │   └── auth.controller.js  # Controller endpoints for session profiles queries
│   ├── db/
│   │   ├── index.js            # Neon HTTP serverless client initialization
│   │   └── schema.js           # Drizzle schema definitions for Users, Sessions, and Accounts
│   ├── lib/
│   │   └── auth.js             # Better Auth server configurations (social providers)
│   ├── middlewares/
│   │   ├── errorHandler.js     # Global HTTP JSON exception interceptor
│   │   ├── rateLimiter.js      # Endpoint rate-limiting policies
│   │   └── requireAuth.js      # Session verification route guard
│   ├── routes/
│   │   ├── auth.route.js       # Authenticated profile routing mapping
│   │   ├── health.route.js     # Health check diagnostics route
│   │   └── index.js            # Main API routing index
│   └── utils/
│       ├── appError.js         # Custom AppError operational exception class
│       └── logger.js           # Pino logger wrapper configuration
├── drizzle.config.js           # Drizzle generating and schema targets
├── package.json                # Server script and library manifest
└── .env                        # Local secrets repository (ignored from git)
```

---

## 💻 Getting Started

### 1. Prerequisite Installations
Verify your Node.js runtime version, then install dependencies:
```bash
npm install
```

### 2. Configure Local Environment Variables
Create a local `.env` configuration mapping your Neon DB endpoints and Google credentials:
```bash
cp .env.example .env
```
Ensure you provide definitions for:
*   `PORT` (defaults to `5000`)
*   `DATABASE_URL` (Neon Postgres Connection String)
*   `BETTER_AUTH_SECRET` (cryptographic secret)
*   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

### 3. Database Schema Migrations
Generate SQL files and push schemas directly to the Neon database instance:
```bash
# Generate database schema models
npm run db:generate

# Execute migrations to Neon database
npm run db:migrate

# Open database studio GUI
npm run db:studio
```

### 4. Running the Server
```bash
# Run in development hot-reload mode
npm run dev

# Run in production optimized mode
npm run start
```

---

## 🔌 API Route Specifications

*   **GET `/api/health`** — Ingests a quick JSON health-check verification (Uptime, Environment state).
*   **GET `/api/auth/session`** — Inspects active cookie session credentials.
*   **GET `/api/auth/profile`** — *(Protected)* Queries verified database user profiles.
*   **POST `/api/auth/sign-in/social`** — Initiates Better Auth Google provider social redirect.
*   **POST `/api/auth/sign-out`** — Purges active session cookies.

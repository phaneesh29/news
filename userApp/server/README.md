# Minimalistic Production-Ready Express.js Server Setup

A structured, minimalistic, and production-ready Express.js server template configured with modern JavaScript (ES Modules).

## Features

- **ES Modules**: Modern import/export syntax for clean, modular JavaScript code.
- **Security (Helmet)**: Sets secure HTTP headers out of the box to prevent common security vulnerabilities.
- **CORS**: Enabled and configurable via `.env` configuration.
- **Compression**: Gzip compression enabled for optimized bandwidth usage.
- **Structured Logging (Winston & Morgan)**: 
  - Standard Morgan HTTP request logger streaming automatically to Winston.
  - Development logs are beautifully formatted and colorized.
  - Production logs are printed in JSON format for easy ingestion by log management systems (Datadog, CloudWatch, etc.).
- **Rate Limiting**: IP-based rate limiting configured to mitigate brute force / basic DDoS attacks.
- **Robust Error Handling**:
  - Global Express JSON error handling middleware separating production and development response formats.
  - Custom `AppError` operational error class for clean and standardized error responses.
  - Process event listeners tracking and logging `uncaughtException`, `unhandledRejection`, `SIGTERM`, and `SIGINT` for graceful server shutdown.

---

## Directory Structure

```
.
├── src/
│   ├── app.js                  # Express app middleware registration & routes
│   ├── index.js                # Server entrypoint and process lifecycles
│   ├── config/
│   │   └── env.js              # Reads and checks environment variables
│   ├── middlewares/
│   │   ├── errorHandler.js     # Global HTTP JSON error handler
│   │   └── rateLimiter.js      # rate-limiting middleware (express-rate-limit)
│   ├── routes/
│   │   └── index.js            # Router mapping for root and health checks
│   └── utils/
│       ├── appError.js         # Custom AppError operational exception class
│       └── logger.js           # Winston logger configuration
├── .env                        # Local secret configurations (gitignored)
├── .env.example                # Example template config
├── .gitignore                  # Git ignore definitions
└── package.json                # Project configurations & dependencies
```

---

## Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Environment Setup
Copy the environment variables template and configure the variables as needed:
```bash
cp .env.example .env
```

### 3. Run in Development
Start the application with hot-reloading (via `nodemon`):
```bash
npm run dev
```

### 4. Run in Production
Start the server in standard production mode:
```bash
npm start
```

---

## Default Endpoints
- **Health Check**: `GET /api/health`
- **Better Auth Health**: `GET /api/auth/ok`
- **Google Sign In / Sign Up**: `POST /api/auth/sign-in/social`
  ```json
  { "provider": "google", "callbackURL": "http://localhost:3000/profile" }
  ```
- **OAuth Callback**: `GET /api/auth/callback/google`
- **Current Session**: `GET /api/auth/session`
- **Profile**: `GET /api/auth/profile`
- **Logout**: `POST /api/auth/sign-out`

Google OAuth creates the user on first sign-in, so sign-in and sign-up use the same Better Auth social endpoint.

Configure this redirect URI in Google Cloud:
```text
http://localhost:5000/api/auth/callback/google
```

# DEV.NEWS — Public Grid Terminal

> [!NOTE]
> This is the public-facing application for the **DEV.NEWS** intelligence broadcast platform. It provides operatives and public users access to read secure news dispatches, browse long-form manifests (blogs), manage their operative profiles, and submit network feedback.

---

## 📌 Project Overview & Features

The `userApp` is a modern, modular application providing a seamless front-end experience backed by a high-performance Express server and a serverless PostgreSQL database.

### 🌟 Key Application Features

1. **Authentication & Identity Management (`better-auth`)**
   - Secure and robust authentication pipeline utilizing `better-auth`.
   - Comprehensive user session, account, and verification management.
   - Profile management and user settings panel.

2. **Metasphere Chronicles (News Feed)**
   - Real-time access to classified intel and news dispatches.
   - Interactive liking system: Users can curate a collection of **Liked News**.
   - Read-only queries directly to the broadcast database.

3. **Manifests Hub (Blogs)**
   - Access to published long-form blogs and platform manifestos.

4. **Operative Feedback Node**
   - Submit direct feedback, diagnostics, or inquiries back to the Nexus Core administration.

5. **Legal & Compliance Interfaces**
   - Built-in `privacy` and `terms` terminals ensuring operational compliance.

---

## 🏗️ System Architecture

### Technical Stack

#### Frontend Client (`/client/web`)
- **Framework:** Next.js (App Router)
- **Styling:** TailwindCSS with **shadcn/ui** for robust, accessible component primitives.
- **State & UI:** React 19, Lucide React icons, and `tw-animate-css` for micro-animations.

#### Backend Server (`/server`)
- **Framework:** Express.js (Node.js) with modular routing (`auth`, `blog`, `feedback`, `news`).
- **Authentication:** `better-auth` with Drizzle adapter.
- **Database Engine:** Neon Serverless Postgres (`@neondatabase/serverless`).
- **ORM:** Drizzle ORM.
- **Security & Logging:** Helmet for HTTP headers security, `express-rate-limit` to prevent abuse, and `pino` for high-performance telemetry logging.

---

## 📂 Project Repository Structure

- [client/web](file:///D:/news/userApp/client/web) — Next.js Public Interface
  - [src/app/news](file:///D:/news/userApp/client/web/src/app/news) — News broadcast reader.
  - [src/app/liked](file:///D:/news/userApp/client/web/src/app/liked) — Curated list of liked intel dispatches.
  - [src/app/blog](file:///D:/news/userApp/client/web/src/app/blog) — Long-form manifest browser.
  - [src/app/profile](file:///D:/news/userApp/client/web/src/app/profile) & [settings](file:///D:/news/userApp/client/web/src/app/settings) — Operative account management.
  - [src/app/privacy](file:///D:/news/userApp/client/web/src/app/privacy) & [terms](file:///D:/news/userApp/client/web/src/app/terms) — Compliance documentation.
- [server](file:///D:/news/userApp/server) — Express.js Backend & Database Interface
  - [src/routes](file:///D:/news/userApp/server/src/routes) — API route definitions for handling auth, news, blogs, and feedback.
  - [src/db/schema.js](file:///D:/news/userApp/server/src/db/schema.js) — Drizzle ORM schema defining User Auth, `dev_news`, `blogs`, `news_likes`, and `feedbacks` tables.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v20 or higher recommended)
- **Neon Postgres Database URL** (or any Postgres instance)

### 2. Setting up the Backend
1. Navigate to the [server](file:///D:/news/userApp/server) directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize environment parameters inside `.env` (using `.env.example` as a template). Ensure you provide a valid database connection string.
4. Run migrations to sync the Drizzle schema with your database:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Setting up the Frontend
1. Navigate to the [client/web](file:///D:/news/userApp/client/web) directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the `.env.local` file with appropriate API endpoints pointing to your backend server.
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
5. Open the terminal in your browser at: `http://localhost:3000`

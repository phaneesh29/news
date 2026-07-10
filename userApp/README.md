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

5. **DevBits IDE (Code Sandbox)**
   - Fully functional, browser-based Node.js micro-OS powered by WebContainers.
   - Integrated Monaco Editor and xterm.js terminal for in-browser script execution and prototyping.

6. **Premium Markdown Previewer**
   - Live Markdown document editor and previewer with dual split-pane drafting, synchronized scrolling, and custom zoom controls.
   - Rich support for Mermaid diagrams, Math expressions (KaTeX LaTeX rendering), and highlight.js code syntax highlighting.
   - Interactive document actions including file imports (.md, .txt), source copying, fullscreen API views, and HTML/MD local file downloads.

7. **Image Compressor**
   - High-speed client-side image optimizer allowing drag/drop and copy/paste compression configurations with no server uploads.

8. **Network Investigator (DNS Resolver)**
   - Secure DNS queries dashboard resolving A, AAAA, MX, TXT, and CNAME records with low latency.

9. **Interactive Playables & Quizzes**
   - Engage operatives with training scenarios, interactive incidents, and knowledge quizzes.

10. **Intelligence Digests & Documentation**
   - Subscription-based intelligence digests and a comprehensive documentation hub.

11. **Legal & Compliance Interfaces**
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

- [client/web](./client/web) — Next.js Public Interface
  - [src/app/news](./client/web/src/app/news) — News broadcast reader.
  - [src/app/liked](./client/web/src/app/liked) — Curated list of liked intel dispatches.
  - [src/app/blog](./client/web/src/app/blog) — Long-form manifest browser.
  - [src/app/profile](./client/web/src/app/profile) & [settings](./client/web/src/app/settings) — Operative account management.
  - [src/app/tools/code](./client/web/src/app/tools/code) — DevBits IDE WebContainer Sandbox.
  - [src/app/tools/markdown-previewer](./client/web/src/app/tools/markdown-previewer) — Split-pane live Markdown previewer with Mermaid & KaTeX.
  - [src/app/tools/image-compressor](./client/web/src/app/tools/image-compressor) — Client-side image compression tool.
  - [src/app/tools/dns-resolver](./client/web/src/app/tools/dns-resolver) — Multi-record DNS query investigator.
  - [src/app/playables](./client/web/src/app/playables) — Interactive incidents and quizzes.
  - [src/app/digest](./client/web/src/app/digest) & [docs](./client/web/src/app/docs) — Intelligence digests and platform documentation.
  - [src/app/privacy](./client/web/src/app/privacy) & [terms](./client/web/src/app/terms) — Compliance documentation.
- [server](./server) — Express.js Backend & Database Interface
  - [src/routes](./server/src/routes) — API route definitions for handling auth, news, blogs, feedback, digests, and docs.
  - [src/db/schema.js](./server/src/db/schema.js) — Drizzle ORM schema defining User Auth, `dev_news`, `blogs`, `news_likes`, and `feedbacks` tables.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v20 or higher recommended)
- **Neon Postgres Database URL** (or any Postgres instance)

### 2. Setting up the Backend
1. Navigate to the [server](./server) directory.
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
1. Navigate to the [client/web](./client/web) directory.
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

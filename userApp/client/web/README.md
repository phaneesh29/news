# DevBits Curation Client Portal

A high-performance, responsive Next.js application designed to serve AI-curated announcements, release updates, and acquisitions for developers. The user interface implements the warm-canvas Claude editorial design guidelines.

---

## 🎨 Claude Design System Specifications

DevBits is styled using custom theme definitions inside [globals.css](file:///home/phaneesh/development/news/userApp/client/web/src/app/globals.css):
*   **Background Canvas:** Warm, editorial cream (`#faf9f5` / `#efe9de`).
*   **Primary Voltage Accent:** Coral (`#cc785c`) used for links, badges, and primary buttons.
*   **Monospace Mockups:** High-contrast navy (`#181715`) for dark product containers.
*   **Typography Voicing:** Displays serif titles via *Cormorant Garamond* (Copernicus substitute), body text via *Inter*, and code text via *JetBrains Mono*.

---

## 🏗️ Technical Stack

*   **Framework:** Next.js 16 (App Router)
*   **Styling Engine:** Tailwind CSS v4
*   **Component Base:** Shadcn UI (compiled with Radix primitives)
*   **Authentication Integration:** Better Auth client-side SDK linked to database-backed Express endpoints.
*   **API Client:** Native fetch helpers integrating health monitoring and secure credentials syncing.

---

## 📂 Key Routing & Components

```text
.
├── src/
│   ├── app/
│   │   ├── layout.tsx     # Google Font declarations and page wrappers
│   │   ├── page.tsx       # Core news landing page and bookmarks index
│   │   ├── privacy/       # Static privacy policy compliance page
│   │   ├── terms/         # Static terms of service compliance page
│   │   ├── profile/       # Protected account and session security details page
│   │   ├── tools/         # Interactive tools and sandboxes
│   │   │   ├── page.tsx                # Tools hub selector page
│   │   │   ├── code/                   # DevBits IDE WebContainer sandbox
│   │   │   ├── markdown-previewer/     # Split-pane Markdown editor and previewer
│   │   │   ├── image-compressor/       # Client-side image compressor
│   │   │   └── dns-resolver/           # Low-latency multi-record DNS query investigator
│   │   └── globals.css    # Tailwind CSS v4 @theme configurations
│   ├── components/
│   │   └── ui/            # UI components (Button, Card, Badge, Avatar, Dialog, Tabs)
│   └── lib/
│       ├── api.ts         # Secure HTTP API client integrations
│       ├── auth-client.ts # Better Auth React initialization
│       └── utils.ts       # Utility helper functions
├── tailwind.config.ts     # Styling presets
├── tsconfig.json          # TypeScript configurations
└── .env.local             # App environment variables (gitignored)
```

---

## 💻 Operations & Setup

### 1. Prerequisites
Install all dependencies:
```bash
npm install
```

### 2. Local Configuration variables
Create an environment file:
```bash
cat <<EOF > .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:5000
EOF
```

### 3. Launch Development Server
```bash
# Starts NextJS compilation server on port 3000
npm run dev
```

### 4. Build Optimized Static Outputs
```bash
# Generates final static bundles, performing TypeScript lint audits
npm run build

# Runs production build locally
npm start
```

---

## 🛡️ Production Readiness Configurations

*   **OAuth Account Control:** Completely removes sandbox mocks. All sessions verify directly with database structures.
*   **Protected Profile Gate:** `/profile` intercepts unauthenticated sessions and redirects to the Google OAuth gate.
*   **Full Legal Compliance:** Provides static, indexable routes `/privacy` and `/terms` linked in the footer.
*   **Zero System Exposing:** Suppresses database connection pools, internal ports, and debug endpoints in production layouts.

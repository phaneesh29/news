# 🗞️ NewsFetch — AI-Powered Developer News Agent

An intelligent multi-stage news pipeline that fetches, deduplicates, ranks, verifies, and emails the latest developer-focused news using AI agents. Built with [Vercel AI SDK](https://ai-sdk.dev) and powered by Google Gemini + [Exa](https://exa.ai) search + [Resend](https://resend.com) email.

## ✨ Features

- **🔍 Parallel Multi-Category Search** — 3 specialized AI agents search simultaneously across Dev Tools, AI/ML, and Dev Ecosystem Funding
- **🧹 Smart Deduplication** — Merges duplicate stories from different sources into single items with multiple citations
- **📊 Impact Ranking** — Scores each item (1-5) and tags as 🔥 Trending, ⚡ Breaking, or 📌 Notable
- **✅ Cross-Referenced Verification** — Verification agent independently web-searches to fact-check claims
- **📈 Trend Detection** — Identifies themes appearing across multiple categories
- **📋 TL;DR Generation** — Auto-generated executive summary of top stories
- **⏰ 12-Hour Freshness** — Strict filtering ensures no stale news (enforced at API + prompt level)
- **📧 Email Distribution** — Sends a styled HTML digest to whitelisted recipients via Resend
- **🧠 Persistent Memory** — Remembers user preferences across runs

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Main Orchestrator                     │
│              (ToolLoopAgent + Gemini)                    │
└──────────┬──────────────┬───────────────┬───────────────┘
           │              │               │
     Stage 1: Parallel Search (Promise.all)
           │              │               │
    ┌──────▼──────┐ ┌────▼─────┐ ┌───────▼────────┐
    │  🛠️ Dev     │ │ 🤖 AI/ML │ │ 💰 Dev Funding │
    │  Tools      │ │ Search   │ │   Search       │
    │  Search     │ │ Agent    │ │   Agent        │
    └──────┬──────┘ └────┬─────┘ └───────┬────────┘
           │              │               │
           └──────────────┼───────────────┘
                          │
                   Stage 2: Deduplicate & Rank
                          │
                ┌─────────▼──────────┐
                │  🔄 Dedup & Rank   │
                │  - Merge dupes     │
                │  - Impact scores   │
                │  - Tag 🔥⚡📌      │
                │  - Detect trends   │
                │  - Write TL;DR     │
                └─────────┬──────────┘
                          │
                   Stage 3: Verify
                          │
                ┌─────────▼──────────┐
                │  🔎 Verification   │
                │  - Check sources   │
                │  - Cross-reference │
                │  - Confidence tags │
                │    High/Med/Low    │
                └─────────┬──────────┘
                          │
                   Stage 4: Save
                          │
                ┌─────────▼──────────┐
                │  💾 Save to        │
                │  news.md           │
                │  - TL;DR section   │
                │  - Trends section  │
                │  - Ranked items    │
                │  - Stats footer    │
                └─────────┬──────────┘
                          │
                   Stage 5: Email
                          │
                ┌─────────▼──────────┐
                │  📧 Email Digest   │
                │  - Styled HTML     │
                │  - All recipients  │
                │    in single call  │
                │  - via Resend      │
                └────────────────────┘
```

## 📁 Project Structure

```
newsFetch/
├── index.js                  # Entry point — kicks off the pipeline
├── agent.js                  # Main orchestrator agent definition
├── instruction.js            # All agent instructions (6 specialized prompts)
├── whitelistEmails.js        # Array of email recipients for the digest
├── tools/
│   ├── newsTools.js          # searchNewsParallel, deduplicateAndRank, verifyNews
│   ├── saveNews.js           # Saves final output to news.md with rich formatting
│   ├── emailTools.js         # sendNewsEmail — Resend-powered email distribution
│   └── memoryTools.js        # getMemory / saveMemory for persistent user context
├── subagents/
│   ├── searchSubagent.js     # 3 parallel search agents (Dev, AI, Funding)
│   ├── deduplicateRankSubagent.js  # Dedup, rank, trend detection
│   └── verifySubagent.js     # Cross-referencing verification agent
├── news.md                   # Output — the latest verified news digest
├── memory.md                 # Persistent memory store
├── .env                      # API keys (Gemini + Exa + Resend)
└── package.json
```

## 🔧 Setup

### Prerequisites

- **Node.js** 18+
- **Google Gemini API key** — [Get one here](https://aistudio.google.com/apikey)
- **Exa API key** — [Get one here](https://dashboard.exa.ai/api-keys)
- **Resend API key** — [Get one here](https://resend.com/api-keys)
- **Verified domain on Resend** — The `from` address (`ai@tsindia.org`) must belong to a domain verified in your Resend account

### Installation

```bash
git clone <your-repo-url>
cd newsFetch
npm install
```

### Configuration

Create a `.env` file in the root:

```env
VERCEL_AI_MODEL=gemini-3.1-flash-lite
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
EXA_API_KEY=your_exa_api_key
RESEND_API_KEY=your_resend_api_key
```

### Adding Email Recipients

Edit `whitelistEmails.js` to add or remove recipients:

```js
export const whitelistedEmails = [
  'sreephaneesha2005@gmail.com',
  // Add more emails here
];
```

All recipients receive the digest in a **single API call** — no per-recipient looping.

## 🚀 Usage

```bash
node index.js
```

The pipeline will:

1. **Search** — 3 agents search in parallel (~15-30s)
2. **Deduplicate & Rank** — Merge duplicates, score, tag, detect trends (~10s)
3. **Verify** — Cross-reference each claim with independent searches (~15-20s)
4. **Save** — Write the final digest to `news.md`
5. **Email** — Send styled HTML digest to all whitelisted recipients via Resend

Total runtime: ~60-90 seconds depending on API response times.

### Example Output (`news.md`)

```markdown
Last flow execution: 6/11/2026, 5:30:00 PM IST

## 📋 TL;DR
Google released DiffusionGemma, a 4x faster text-generation model. Cursor shipped 90-second
AI code reviews. NEURA Robotics closed a $1.4B round backed by Amazon and NVIDIA.

---

## 📈 Trends Detected
- Multiple AI coding tools received major updates today
- Large funding rounds continue flowing into AI infrastructure

---

### ⚡ Breaking

**[Confidence: High]** 🤖 **Google DiffusionGemma** (Impact: 5/5)
Open-source text-diffusion model generating text 4x faster than traditional LLMs...
[SiliconAngle](https://siliconangle.com/...) | [TechCrunch](https://techcrunch.com/...)

### 🔥 Trending

**[Confidence: High]** 🛠️ **Cursor BugBot 90-Second Reviews** (Impact: 4/5)
...

---

## 📊 Pipeline Stats
| Metric | Value |
|--------|-------|
| Total Items Verified | 12 |
| ✅ High Confidence | 10 |
| ⚠️ Medium Confidence | 2 |
| ❌ Low Confidence | 0 |
| 🔍 Cross-Referenced | 5 |
| ⏰ Freshness Window | Last 12 hours |
```

### Example Email

Recipients receive a styled HTML email with:
- Gradient header with "🗞️ NewsFetch Digest" branding
- Full news content rendered from Markdown to HTML
- Clean typography and clickable source links
- Footer with branding and sender info
- Sent from `ai@tsindia.org`

## 🧩 How Each Stage Works

### Stage 1 — Parallel Search

Three `ToolLoopAgent` instances run simultaneously via `Promise.all`:

| Agent | Focus Areas |
|-------|-------------|
| **Dev Tools** | IDEs, frameworks, libraries, open-source, DevOps, CI/CD |
| **AI/ML** | Model releases, AI agents, LLMs, research, AI APIs/SDKs |
| **Dev Funding** | AI startup rounds, dev tool acquisitions, infra investments |

Each agent uses [Exa](https://exa.ai) web search with:
- `category: "news"` — news-focused results
- `numResults: 10` — broad coverage
- `startPublishedDate` — dynamic 12-hour window (computed at runtime)
- `livecrawl: "always"` — real-time freshness
- `highlights` + `summary` — AI-extracted relevant snippets

### Stage 2 — Deduplicate & Rank

A dedicated agent processes the merged results:
- **Deduplication** — Same event from 3 sources → 1 item with 3 citations
- **Tagging** — 🔥 Trending (multi-source) / ⚡ Breaking (<2hrs) / 📌 Notable
- **Impact Scoring** — 1 (minor update) to 5 (industry-changing)
- **Trend Detection** — Cross-category theme identification
- **TL;DR** — 2-3 sentence executive summary

### Stage 3 — Verification

The verification agent:
- Checks each claim against provided sources
- **Independently web-searches** to cross-reference uncertain claims
- Assigns confidence: **High** / **Medium** / **Low**
- Produces a detailed verification report with explanations

### Stage 4 — Save

Writes `news.md` with:
- Timestamp header
- TL;DR section
- Trends section
- Ranked & verified news items
- Stats footer (confidence breakdown, cross-reference count)

### Stage 5 — Email Distribution

Sends the digest to all whitelisted emails:
- **Single Resend API call** — all recipients in the `to` field
- **Markdown → styled HTML** conversion with gradient header/footer
- **From address**: `ai@tsindia.org`
- **Subject**: Auto-generated with date (e.g., "🗞️ Dev News Digest — Wednesday, June 11, 2026")
- Add/remove recipients in `whitelistEmails.js`

## 🧠 Memory System

The agent persists user preferences in `memory.md`. You can extend the prompt in `index.js` to include conversational context, and the agent will remember details across runs.

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `ai` | Vercel AI SDK — ToolLoopAgent, tools, structured output |
| `@ai-sdk/google` | Google Gemini model provider |
| `@exalabs/ai-sdk` | Exa web search tool for AI SDK |
| `resend` | Email delivery via Resend API |
| `zod` | Schema validation for structured outputs |
| `dotenv` | Environment variable management |

## 📝 License

ISC

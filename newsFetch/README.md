# 🗞️ NewsFetch — AI-Powered Developer News Agent (DEPRECATED)

> [!WARNING]
> **This repository/folder is DEPRECATED.**
> It has been replaced by the superior parent-child subagent implementation in **[newsAgentOpenAI](file:///D:/news/newsAgentOpenAI)**.
> All future features, updates, and maintenance will take place there. Please transition to using the new pipeline.

An intelligent multi-stage news pipeline that fetches, deduplicates, ranks, verifies, and emails the latest developer-focused news using AI agents. Built with [Vercel AI SDK](https://ai-sdk.dev) and powered by Mistral AI + [Exa](https://exa.ai) search + [Tavily](https://tavily.com) search + [Resend](https://resend.com) email.

## ✨ Features

- **🔍 Unified Multi-Category Search** — A single AI agent searches across Dev Tools, AI/ML, and Dev Ecosystem Funding in one pass using both Exa and Tavily
- **🧹 Smart Deduplication** — Merges duplicate stories from different sources into single items with multiple citations
- **📊 Impact Ranking** — Scores each item (1-5) and tags as 🔥 Trending, ⚡ Breaking, or 📌 Notable
- **✅ Cross-Referenced Verification** — Independently web-searches to fact-check uncertain claims and assigns confidence levels
- **📈 Trend Detection** — Identifies themes appearing across multiple categories
- **📋 TL;DR Generation** — Auto-generated executive summary of top stories
- **⏰ 12-Hour Freshness** — Strict filtering ensures no stale news (enforced at API + prompt level)
- **📧 Email Distribution** — Sends a styled HTML digest to whitelisted recipients via Resend
- **🧠 Persistent Memory** — Remembers user preferences across runs

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Main Orchestrator                     │
│              (ToolLoopAgent + Mistral)                   │
└──────────┬──────────────┬───────────────┬───────────────┘
           │              │               │
    Stage 1: Unified Search (single LLM pass)
           │
    ┌──────▼──────────────────────────────────┐
    │  🔍 Unified Search Agent                │
    │  Covers all 3 categories in one pass:   │
    │  - 🛠️ Dev Tools & Platforms             │
    │  - 🤖 AI & Machine Learning             │
    │  - 💰 Dev Ecosystem Funding             │
    │                                         │
    │  Tools: Exa Search + Tavily Search      │
    │         + Tavily Extract                │
    └──────────────────┬──────────────────────┘
                       │
                Stage 2: Deduplicate, Rank & Verify
                       │
             ┌─────────▼──────────┐
             │  🔄 Dedup & Rank   │
             │  - Merge dupes     │
             │  - Impact scores   │
             │  - Tag 🔥⚡📌      │
             │  - Detect trends   │
             │  - Write TL;DR     │
             │  - Verify claims   │
             │  - Confidence tags │
             │    High/Med/Low    │
             └─────────┬──────────┘
                       │
                Stage 3: Save
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
                Stage 4: Email
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
├── instruction.js            # All agent instructions (unified search + dedup/rank/verify)
├── whitelistEmails.js        # Array of email recipients for the digest
├── tools/
│   ├── newsTools.js          # searchNewsParallel, deduplicateAndRank tools
│   ├── saveNews.js           # Saves final output to news.md with rich formatting
│   ├── emailTools.js         # sendNewsEmail — Resend-powered email distribution
│   └── memoryTools.js        # getMemory / saveMemory for persistent user context
├── subagents/
│   ├── searchSubagent.js     # Unified search agent (all 3 categories, Exa + Tavily)
│   └── deduplicateRankSubagent.js  # Dedup, rank, verify & trend detection
├── config/
│   └── models.js             # Centralized model configuration
├── news.md                   # Output — the latest verified news digest
├── memory.md                 # Persistent memory store
├── .env                      # API keys (Mistral + Exa + Tavily + Resend)
└── package.json
```

## 🔧 Setup

### Prerequisites

- **Node.js** 18+
- **Mistral API key** — [Get one here](https://console.mistral.ai/api-keys)
- **Exa API key** — [Get one here](https://dashboard.exa.ai/api-keys)
- **Tavily API key** — [Get one here](https://tavily.com)
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
MISTRAL_API_KEY=your_mistral_api_key
EXA_API_KEY=your_exa_api_key
TAVILY_API_KEY=your_tavily_api_key
RESEND_API_KEY=your_resend_api_key
```

### Model Configuration

All models are configured centrally in `config/models.js`:

```js
export const MODELS = {
  orchestrator: 'codestral-2508',  // Main pipeline orchestrator
  searchDefault: 'codestral-2508', // Unified search agent
  rank: 'codestral-2508',          // Dedup, rank & verify agent
};
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

1. **Search** — 1 unified agent searches all 3 categories using Exa + Tavily (~15-30s)
2. **Deduplicate, Rank & Verify** — Merge duplicates, score, tag, detect trends, cross-reference claims (~10-20s)
3. **Save** — Write the final digest to `news.md`
4. **Email** — Send styled HTML digest to all whitelisted recipients via Resend

Total runtime: ~30-60 seconds depending on API response times.

### 🤖 GitHub Actions Automation

The news pipeline is automated via a GitHub Actions workflow defined in [news_digest.yml](file:///home/phaneesh/development/news/.github/workflows/news_digest.yml). It is scheduled to run twice daily at `02:30` and `14:30` UTC.

To enable the automated run, you need to add the following secrets in your GitHub repository's settings under **Settings > Secrets and variables > Actions**:
* `MISTRAL_API_KEY` — Your Mistral API key
* `EXA_API_KEY` — Your Exa API key
* `TAVILY_API_KEY` — Your Tavily API key
* `RESEND_API_KEY` — Your Resend API key

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

### Stage 1 — Unified Search

A single `ToolLoopAgent` searches all 3 categories in one LLM pass, using both Exa and Tavily as tools:

| Category | Focus Areas |
|----------|-------------|
| **🛠️ Dev Tools & Platforms** | IDEs, frameworks, libraries, open-source, DevOps, CI/CD |
| **🤖 AI & Machine Learning** | Model releases, AI agents, LLMs, research, AI APIs/SDKs |
| **💰 Dev Ecosystem Funding** | AI startup rounds, dev tool acquisitions, infra investments |

The agent has access to 3 tools:
- **Exa Search** — `category: "news"`, `numResults: 10`, `startPublishedDate` set to a dynamic 12-hour window, `livecrawl: "always"` for real-time content with AI summaries
- **Tavily Search** — `topic: "news"`, `maxResults: 10`, `timeRange: "day"`, with advanced search depth and raw markdown content
- **Tavily Extract** — For extracting full content from URLs with thin search snippets

Each source is tagged with its category (`devTools`, `aiMl`, or `devFunding`) in the structured output.

### Stage 2 — Deduplicate, Rank & Verify

A single combined agent handles deduplication, ranking, and verification in one pass:
- **Deduplication** — Same event from 3 sources → 1 item with 3 citations
- **Tagging** — 🔥 Trending (multi-source) / ⚡ Breaking (<2hrs) / 📌 Notable
- **Impact Scoring** — 1 (minor update) to 5 (industry-changing)
- **Trend Detection** — Cross-category theme identification
- **TL;DR** — 2-3 sentence executive summary
- **Verification** — Cross-references uncertain claims via web search, assigns **High** / **Medium** / **Low** confidence

### Stage 3 — Save

Writes `news.md` with:
- Timestamp header
- TL;DR section
- Trends section
- Ranked & verified news items
- Stats footer (confidence breakdown, cross-reference count)

### Stage 4 — Email Distribution

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
| `@ai-sdk/mistral` | Mistral AI model provider |
| `@exalabs/ai-sdk` | Exa web search tool for AI SDK |
| `@tavily/ai-sdk` | Tavily search & extract tools for AI SDK |
| `resend` | Email delivery via Resend API |
| `zod` | Schema validation for structured outputs |
| `dotenv` | Environment variable management |

## 📝 License

ISC

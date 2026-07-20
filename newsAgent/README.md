# Multi-Agent News System

A premium, highly-predictable multi-agent news retrieval and synthesis system built using the official `@openai/agents` SDK, `zod` for type-safe tool parameters, and the Scoutify API. 

It is designed for personal use, hardcoded to connect to **Ollama Cloud** (`https://ollama.com/v1`) using the **`gemma4:31b`** model to retrieve, validate, deduplicate, score, and format software development and AI updates into a premium email digest and Redis store.

---

## 🛠️ Architecture & Design Patterns

The project utilizes the **Agents as Tools (Subagents)** pattern where a parent `NewsManagerAgent` orchestrates specialized subagents exposed as tools.

```text
┌──────────────────┐
│   User Request   │
└────────┬─────────┘
         │ (npm start)
         ▼
┌──────────────────┐
│ NewsManagerAgent │
└────────┬─────────┘
         │
         ├─► Step 1: Search
         │   └─► [SearchAgent]
         │       └─► Scoutify Search API
         │
         ├─► Step 2: Enrich
         │   └─► [EnrichAgent]
         │       ├─► Scoutify: GitHub Releases
         │       ├─► GitHub API: Trending Repos
         │       ├─► Hacker News: Stories >150 points
         │       ├─► Scoutify: Target Subreddits
         │       ├─► Scoutify: Security Advisories
         │       └─► HF Daily Papers API
         │
         └─► Step 3: Synthesis
             └─► [SynthesisAgent]
                 ├─► Deduplication & Clustering
                 └─► Scoring Rank Layer
```

### 1. Centralized Subagent Orchestration
*   **NewsManagerAgent**: Parent agent that calls specialized subagents in a strict sequence.
*   **SearchAgent**: Retrieves general AI and dev company blog news.
*   **EnrichAgent**: Gathers GitHub releases, trending repositories, Hacker News stories with >150 points (using a public JSON endpoint), Reddit signals (r/LocalLLaMA, r/MachineLearning, etc.), package compromises/CVEs, and Hugging Face Daily Papers/arXiv preprints.
*   **SynthesisAgent**: Deduplicates news and runs the **Scoring & Ranking Layer**.

### 2. Weighted Scoring Layer
The `SynthesisAgent` ranks news using a custom weighted formula:
$$\text{Score} = (0.40 \times \text{Impact}) + (0.25 \times \text{Community}) + (0.20 \times \text{Freshness}) + (0.15 \times \text{Source Authority})$$

### 3. Integrated Agent Tools
Specialized tools are implemented in `tools/agentTools.js` and registered with the subagents:
*   `search_web` / `search_news`: Queries the Scoutify API for developer/AI updates.
*   `search_github_releases`: Fetches changelogs for specified repositories (e.g. `vercel/next.js`).
*   `fetch_github_trending`: Retrieves top-starred repositories created in the past 12 hours.
*   `fetch_hacker_news`: Retrieves stories hitting >=150 points in the last 12 hours.
*   `search_reddit_signals`: Scans subreddits (r/LocalLLaMA, r/MachineLearning) for new releases.
*   `search_security_advisories`: Scans CVE and GitHub Advisories for packages/system compromises.
*   `fetch_academic_papers`: Fetches curated preprints/papers from Hugging Face Daily Papers (with automatic fallback to latest if date is empty).

### 4. Self-Correction & Quality Gate Loop
To ensure maximum signal reliability and strict adherence to formatting instructions, `index.js` routes the drafted output through an automated quality validation pipeline:
* **Validation Rules:**
  * Checks that at least 5 stories are compiled.
  * Verifies that no raw score metrics or ranking breakdowns are visible.
  * Ensures each story has associated tag lines.
  * Confirms there are no placeholder URLs (`example.com`, `#`, etc.).
  * Verifies the "Last updated:" header contains the correct current year.
* **Feedback Retries:** If any verification check fails, the pipeline feeds the diagnostics back to the manager agent and triggers a retry, supporting up to 3 self-correction iterations.

### 5. Automated Email Broadcast (Resend)
* Once the draft successfully passes the quality gate, it is stored in Upstash Redis.
* The system instantly invokes `utils/emailHelper.js` to build a responsive, custom-styled HTML newsletter.
* Using the **Resend API**, the compiled briefing newsletter is broadcasted to all registered operative coordinates listed in `whitelistEmails.js`.

---

## 📂 Project Structure

```text
newsAgent/
├── .env                  # Local API keys (git-ignored)
├── .env.example          # Sample environment template
├── .gitignore            # Git exclusions
├── package.json          # Dependency definition & run scripts
├── index.js              # Entry point to execute the pipeline, quality gate, and email trigger
├── whitelistEmails.js    # Whitelist coordinates for email dispatch broadcasts
├── README.md             # Project overview
├── config/
│   ├── config.js         # Loads environment configs and defaults
│   └── instructions.js   # Prompt instructions for all agents
├── agents/
│   ├── managerAgent.js   # NewsManagerAgent (Parent Orchestrator)
│   ├── searchAgent.js    # SearchAgent subagent (General Web/News search)
│   ├── enrichAgent.js    # EnrichAgent subagent (Releases, HN, Reddit, exploits, academic papers)
│   └── synthesisAgent.js # SynthesisAgent subagent (Deduplication & Scoring)
├── tools/
│   ├── scoutifySearch.js # Scoutify API client helper
│   └── agentTools.js     # Wrapped agent-ready tools with Zod parameters
└── utils/
    ├── disable-tracing.js# Disables telemetry traces in agent SDK
    ├── emailHelper.js    # Compiles markdown to responsive HTML and broadcasts via Resend
    └── llm.js            # Registers OpenAIProvider globally using setDefaultModelProvider
```

---

## ⚙️ Setup & Execution

1. Configure your `.env` file with `OLLAMA_API_KEY`, `SCOUTIFY_API_KEY`, and `RESEND_API_KEY`.
2. Run the pipeline:
   ```bash
   npm start
   ```
The newsletter digest will be stored in Redis and dispatched to whitelisted email coordinates.

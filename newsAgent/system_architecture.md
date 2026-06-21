# Multi-Agent News System Architecture

This project is a premium **Multi-Agent News System** built using the official `@openai/agents` SDK and Zod. It operates on a **parent-child subagent orchestration pattern** designed for personal dev and AI news tracking, powered by Ollama Cloud (`nemotron-3-ultra`).

---

## 📂 Project Directory Structure

```text
D:/news/newsAgent/
├── .env                  # Local API keys and model configuration (git-ignored)
├── .env.example          # Sample environment template
├── .gitignore            # Git exclusions
├── package.json          # Dependency definition
├── index.js              # Core pipeline coordinator & orchestrator
├── README.md             # Project overview
├── system_architecture.md # Architecture pattern documentation
├── config/
│   ├── config.js         # Configuration manager loading environment variables
│   └── instructions.js   # Prompt instructions for all 5 agents
├── agents/
│   ├── managerAgent.js   # NewsManagerAgent (Parent Orchestrator)
│   ├── searchAgent.js    # SearchAgent (General Web/News search)
│   ├── enrichAgent.js    # EnrichAgent (GitHub releases, trending, HN, Reddit, exploits, academic papers)
│   ├── synthesisAgent.js # SynthesisAgent (Deduplication, Scoring, Clustering)
│   └── editorAgent.js    # EditorAgent (news.md writing)
├── tools/
│   ├── exaSearch.js      # Primary Exa search client
│   ├── tavilySearch.js   # Fallback Tavily search client
│   ├── fileWriter.js     # Helper to write news.md
│   └── agentTools.js     # Wrapped agent-ready tools with Zod parameters
└── utils/
    └── llm.js            # Registers default model provider globally
```

---

## 🛠️ Multi-Agent Workflow Details

The system runs a **centralized parent-child subagent pipeline** (Agents as Tools pattern). The parent agent, `NewsManagerAgent`, invokes the child agents as tools sequentially:

```text
┌──────────────────┐
│   User Request   │
└────────┬─────────┘
         │ (Run)
         ▼
┌──────────────────┐
│ NewsManagerAgent │
└────────┬─────────┘
         │
         ├─► Step 1: Search
         │   └─► [SearchAgent]
         │       ├─► Exa Search API (with AI summary)
         │       └─► Tavily Search API (Fallback)
         │
         ├─► Step 2: Enrich
         │   └─► [EnrichAgent]
         │       ├─► Exa: GitHub Releases
         │       ├─► GitHub API: Trending Repos
         │       ├─► Hacker News: Stories >150 points
         │       ├─► Exa/Tavily: Target Subreddits
         │       ├─► Exa/Tavily: Security Advisories
         │       └─► HF Daily Papers API
         │
         ├─► Step 3: Synthesis
         │   └─► [SynthesisAgent]
         │       ├─► Deduplication & Clustering
         │       └─► Scoring Rank Layer
         │
         └─► Step 4: Formatting
             └─► [EditorAgent]
                 ├─► Write news.md Output File
                 └─► Confirmation to Manager
```

---

## ⚖️ Scoring & Ranking Layer

The `SynthesisAgent` ranks deduplicated news stories based on four distinct weights to prioritize high-value updates:

$$\text{Final Score} = (0.40 \times \text{Impact}) + (0.25 \times \text{Community}) + (0.20 \times \text{Freshness}) + (0.15 \times \text{Source Authority})$$

*   **Impact (40%)**: Ecosystem importance (e.g. Next.js major release = 10, minor tool update = 3).
*   **Community (25%)**: Hacker News points and Reddit discussion velocity.
*   **Freshness (20%)**: Age of announcement (within 24 hours = 10, 3 days ago = 5).
*   **Source Authority (15%)**: Official release notes/changelogs = 10, blog articles = 6, Reddit post = 4.

---

## 🚀 Execution

Run the pipeline using npm:

```bash
npm start
```

The system will retrieve data from all subagents, rank them, and save the formatted bulletin to **[news.md](file:///D:/news/content/news.md)**.

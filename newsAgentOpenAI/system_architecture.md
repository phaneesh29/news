# Multi-Agent News System Architecture

This project is a premium **Multi-Agent News System** built using the official `@openai/agents` SDK and Zod. It operates on a **parent-child subagent orchestration pattern** designed for personal dev and AI news tracking, powered by Ollama Cloud (`nemotron-3-ultra`).

---

## 📂 Project Directory Structure

```text
D:/news/newsAgentOpenAI/
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
│   ├── enrichAgent.js    # EnrichAgent (GitHub releases, trending, HN, Reddit, exploits)
│   ├── synthesisAgent.js # SynthesisAgent (Deduplication, Scoring, Clustering)
│   └── editorAgent.js    # EditorAgent (nws.md writing)
├── tools/
│   ├── exaSearch.js      # Primary Exa search client
│   ├── tavilySearch.js   # Fallback Tavily search client
│   ├── fileWriter.js     # Helper to write nws.md
│   └── agentTools.js     # Wrapped agent-ready tools with Zod parameters
└── utils/
    └── llm.js            # Registers default model provider globally
```

---

## 🛠️ Multi-Agent Workflow Details

The system runs a **centralized parent-child subagent pipeline** (Agents as Tools pattern). The parent agent, `NewsManagerAgent`, invokes the child agents as tools sequentially:

```mermaid
graph TD
    User([User Request]) -->|Run| Manager[NewsManagerAgent]
    
    %% Step 1: Search
    Manager -->|Call Tool| SearchAgent[SearchAgent]
    SearchAgent --> Exa[Exa Search API (with AI summary)]
    SearchAgent -.-->|Fallback| Tavily[Tavily Search API (with global answer)]
    
    %% Step 2: Enrich
    Manager -->|Call Tool| EnrichAgent[EnrichAgent]
    EnrichAgent --> ExaContent[Exa Search & Contents: GitHub Releases]
    EnrichAgent --> GH_Trending[GitHub Search API: Trending Repos]
    EnrichAgent --> HN[Hacker News Algolia: Stories >150 points]
    EnrichAgent --> Reddit[Exa/Tavily search of target subreddits]
    EnrichAgent --> CVE[Exa/Tavily search of NVD & GitHub Advisories]
    
    %% Step 3: Synthesis
    Manager -->|Combine Raw Data| SynthesisAgent[SynthesisAgent]
    SynthesisAgent --> Dedupe[Deduplication & Clustering]
    SynthesisAgent --> Score[Scoring Rank Layer]
    
    %% Step 4: Formatting
    Manager -->|Structured JSON| EditorAgent[EditorAgent]
    EditorAgent -->|write_news_bulletin| Format[nws.md Output File]
    EditorAgent -->|Confirmation| Manager
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

The system will retrieve data from all subagents, rank them, and save the formatted bulletin to **[`nws.md`](file:///D:/news/newsAgentOpenAI/nws.md)**.

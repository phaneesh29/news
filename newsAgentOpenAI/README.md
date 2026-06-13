# Multi-Agent News System

A premium, highly-predictable multi-agent news retrieval and synthesis system built using the official `@openai/agents` SDK, `zod` for type-safe tool parameters, and the Exa & Tavily SDKs. 

It is designed for personal use, hardcoded to connect to **Ollama Cloud** (`https://ollama.com/v1`) using the **`nemotron-3-ultra`** model to retrieve, validate, deduplicate, score, and format software development and AI updates into a premium `news.md` bulletin.

---

## 🛠️ Architecture & Design Patterns

The project utilizes the **Agents as Tools (Subagents)** pattern where a parent `NewsManagerAgent` orchestrates specialized subagents exposed as tools.

```mermaid
graph TD
    User([User Request]) -->|npm start| Manager[NewsManagerAgent]
    
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
    EnrichAgent --> HF_Papers[Hugging Face Daily Papers API: Academic Papers & Preprints]
    
    %% Step 3: Synthesis
    Manager -->|Combine Raw Data| SynthesisAgent[SynthesisAgent]
    SynthesisAgent --> Dedupe[Deduplication & Clustering]
    SynthesisAgent --> Score[Scoring Rank Layer]
    
    %% Step 4: Formatting
    Manager -->|Structured JSON| EditorAgent[EditorAgent]
    EditorAgent -->|write_news_bulletin| Format[news.md Output File]
    EditorAgent -->|Confirmation| Manager
```

### 1. Centralized Subagent Orchestration
*   **NewsManagerAgent**: Parent agent that calls specialized subagents in a strict sequence.
*   **SearchAgent**: Retrieves general AI and dev company blog news.
*   **EnrichAgent**: Gathers GitHub releases, trending repositories, Hacker News stories with >150 points (using a public JSON endpoint), Reddit signals (r/LocalLLaMA, r/MachineLearning, etc.), package compromises/CVEs, and Hugging Face Daily Papers/arXiv preprints.
*   **SynthesisAgent**: Deduplicates news and runs the **Scoring & Ranking Layer**.
*   **EditorAgent**: Formats details and writes the final markdown file.

### 2. Weighted Scoring Layer
The `SynthesisAgent` ranks news using a custom weighted formula:
$$\text{Score} = (0.40 \times \text{Impact}) + (0.25 \times \text{Community}) + (0.20 \times \text{Freshness}) + (0.15 \times \text{Source Authority})$$

### 3. Integrated Agent Tools
Specialized tools are implemented in `tools/agentTools.js` and registered with the subagents:
*   `search_web` / `search_news`: Queries Exa/Tavily APIs for developer/AI updates.
*   `search_github_releases`: Fetches changelogs for specified repositories (e.g. `vercel/next.js`).
*   `fetch_github_trending`: Retrieves top-starred repositories created in the past 12 hours.
*   `fetch_hacker_news`: Retrieves stories hitting >=150 points in the last 12 hours.
*   `search_reddit_signals`: Scans subreddits (r/LocalLLaMA, r/MachineLearning) for new releases.
*   `search_security_advisories`: Scans CVE and GitHub Advisories for packages/system compromises.
*   `fetch_academic_papers`: Fetches curated preprints/papers from Hugging Face Daily Papers (with automatic fallback to latest if date is empty).

---

## 📂 Project Structure

```text
D:/news/newsAgentOpenAI/
├── .env                  # Local API keys (git-ignored)
├── .env.example          # Sample environment template
├── .gitignore            # Git exclusions
├── package.json          # Dependency definition & run scripts
├── index.js              # Entry point to execute the pipeline
├── README.md             # Project overview
├── config/
│   ├── config.js         # Loads environment configs and defaults
│   └── instructions.js   # Prompt instructions for all 5 agents
├── agents/
│   ├── managerAgent.js   # NewsManagerAgent (Parent Orchestrator)
│   ├── searchAgent.js    # SearchAgent subagent (General Web/News search)
│   ├── enrichAgent.js    # EnrichAgent subagent (Releases, HN, Reddit, exploits, academic papers)
│   ├── synthesisAgent.js # SynthesisAgent subagent (Deduplication & Scoring)
│   └── editorAgent.js    # EditorAgent subagent (news.md writing)
├── tools/
│   ├── exaSearch.js      # Exa SDK search client
│   ├── tavilySearch.js   # Tavily SDK search client
│   ├── fileWriter.js     # news.md file writer
│   └── agentTools.js     # Wrapped agent-ready tools with Zod parameters
└── utils/
    └── llm.js            # Registers OpenAIProvider globally using setDefaultModelProvider
```

---

## ⚙️ Setup & Execution

1. Configure your `.env` file with `OLLAMA_API_KEY`, `EXA_API_KEY`, and `TAVILY_API_KEY`.
2. Run the pipeline:
   ```bash
   npm start
   ```
The newsletter will be saved directly in the project directory as [news.md](file:///D:/news/newsAgentOpenAI/news.md).

export type Difficulty = "easy" | "medium" | "hard" | "expert" | "chaos";

export interface QuizQuestion {
  id: string;
  role: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const quizQuestions: QuizQuestion[] = [
  // --- FRONTEND ENGINEER ---
  {
    id: "js-1",
    role: "Frontend Engineer",
    difficulty: "expert",
    question: "What will `console.log(typeof (new String('hello')) === typeof 'hello')` output, and why?",
    options: [
      "true, because both are evaluated as strings during type coercion.",
      "false, because `new String()` creates an object, while `'hello'` is a primitive.",
      "true, because the `typeof` operator normalizes all string variations to 'string'.",
      "TypeError, because `typeof` cannot evaluate instantiated primitives."
    ],
    correctAnswer: 1,
    explanation: "`new String('hello')` creates a String wrapper object, so its typeof is 'object'. The literal `'hello'` is a primitive, so its typeof is 'string'."
  },
  {
    id: "js-2",
    role: "Frontend Engineer",
    difficulty: "chaos",
    question: "What is the output of `[1, 2, 3].map(parseInt)`?",
    options: [
      "[1, 2, 3]",
      "[1, NaN, NaN]",
      "[1, NaN, 3]",
      "Throws a SyntaxError"
    ],
    correctAnswer: 1,
    explanation: "`map` passes three arguments: (value, index, array). `parseInt` takes two: (string, radix). So it executes: `parseInt('1', 0)` -> 1, `parseInt('2', 1)` -> NaN, `parseInt('3', 2)` -> NaN."
  },
  {
    id: "react-1",
    role: "Frontend Engineer",
    difficulty: "hard",
    question: "In React, why might `useLayoutEffect` be preferred over `useEffect`?",
    options: [
      "It runs concurrently, unblocking the main thread.",
      "It fires synchronously after all DOM mutations but before the browser paints, preventing visual flickering.",
      "It is optimized specifically for server-side rendering (SSR).",
      "It automatically memoizes its dependencies to prevent unnecessary re-renders."
    ],
    correctAnswer: 1,
    explanation: "`useLayoutEffect` blocks the browser paint. It's used when you need to read layout from the DOM and synchronously re-render, ensuring the user doesn't see a flicker of an intermediate state."
  },
  {
    id: "react-2",
    role: "Frontend Engineer",
    difficulty: "expert",
    question: "When dealing with React's Reconciliation, what happens if two components use the same Context, and the provider value is updated to a new object literal `{ data: 1 }` on every render?",
    options: [
      "Only components strictly consuming 'data' will re-render.",
      "All consuming components re-render every time because React checks object reference equality.",
      "React automatically performs a shallow comparison and skips the re-render.",
      "The Context API ignores object literals and throws a warning."
    ],
    correctAnswer: 1,
    explanation: "Context uses reference equality (`Object.is`). A new object literal creates a new reference, bypassing any optimization and forcing all consumers to re-render. Always memoize Context values!"
  },
  {
    id: "ts-2",
    role: "Frontend Engineer",
    difficulty: "hard",
    question: "What is the difference between `any` and `unknown` in TypeScript?",
    options: [
      "`unknown` is type-safe and requires a type check before performing operations on it, while `any` bypasses the type checker entirely.",
      "`any` is strictly used for primitive values, whereas `unknown` is for objects.",
      "They are identical; `unknown` was introduced purely for semantic clarity.",
      "`unknown` can only be assigned once, whereas `any` can be mutated."
    ],
    correctAnswer: 0,
    explanation: "`any` completely disables type checking. `unknown` forces you to narrow the type (e.g., via `typeof` or `instanceof`) before you can call methods or access properties on it, making it much safer."
  },

  // --- BACKEND ENGINEER ---
  {
    id: "node-1",
    role: "Backend Engineer",
    difficulty: "expert",
    question: "How does the Node.js Event Loop prioritize `process.nextTick()` compared to `setImmediate()`?",
    options: [
      "`setImmediate()` executes before `process.nextTick()` in the current phase.",
      "`process.nextTick()` executes immediately after the current operation and before the event loop continues, whereas `setImmediate()` fires in the check phase.",
      "They are identical aliases for the same underlying V8 engine API.",
      "`process.nextTick()` is pushed to the OS thread pool, while `setImmediate()` stays on the main thread."
    ],
    correctAnswer: 1,
    explanation: "`process.nextTick()` queues tasks in the microtask queue, which is drained immediately after the current operation completes, preempting the entire event loop. `setImmediate` runs later in the Check phase."
  },
  {
    id: "db-1",
    role: "Backend Engineer",
    difficulty: "expert",
    question: "What is the primary difference between B-Tree and LSM-Tree storage engines?",
    options: [
      "B-Trees use less memory; LSM-Trees use less CPU.",
      "B-Trees update data in-place (good for reads); LSM-Trees append data sequentially (optimized for extreme write throughput).",
      "LSM-Trees are strictly used in relational databases, B-Trees in NoSQL.",
      "There is no difference; LSM is simply the Java implementation of a B-Tree."
    ],
    correctAnswer: 1,
    explanation: "LSM-Trees (like Cassandra/RocksDB) are append-only, absorbing writes into memory and flushing to disk sequentially. B-Trees (like Postgres) modify pages in place, requiring random I/O."
  },
  {
    id: "kafka-1",
    role: "Backend Engineer",
    difficulty: "expert",
    question: "In Apache Kafka, what happens if you add more consumers to a Consumer Group than there are Partitions in a Topic?",
    options: [
      "Kafka will automatically split the partitions to accommodate the extra consumers.",
      "The extra consumers will sit completely idle and process zero messages.",
      "Kafka load balances the messages in a round-robin fashion across all consumers, bypassing strict ordering.",
      "The broker crashes due to an out-of-bounds partition mapping error."
    ],
    correctAnswer: 1,
    explanation: "A single partition can only be consumed by exactly one consumer within a specific consumer group at any given time. If you have 4 partitions and 5 consumers, the 5th consumer will literally do nothing."
  },
  {
    id: "db-mvcc",
    role: "Backend Engineer",
    difficulty: "expert",
    question: "How does Multi-Version Concurrency Control (MVCC) in PostgreSQL achieve high concurrency without locking?",
    options: [
      "By dynamically scaling the number of database connections per query.",
      "By keeping multiple versions of a row; readers see a consistent snapshot of the data from when their transaction began, so 'readers don't block writers, and writers don't block readers'.",
      "By temporarily routing write operations to a secondary caching layer.",
      "By automatically killing long-running transactions that conflict with reads."
    ],
    correctAnswer: 1,
    explanation: "When a row is updated in Postgres, it doesn't overwrite the old row in-place. It writes a new version. Older transactions still see the old version, allowing fully unblocked concurrent reads."
  },
  {
    id: "redis-1",
    role: "Backend Engineer",
    difficulty: "chaos",
    question: "Why might executing the `KEYS *` command in a production Redis instance cause a catastrophic outage?",
    options: [
      "Because it bypasses the eviction policy and forces all keys to expire.",
      "Because it uses massive amounts of disk I/O, overwhelming the OS.",
      "Because Redis is single-threaded, and `KEYS *` is an O(N) operation that blocks the entire event loop until it finishes traversing millions of keys.",
      "Because it decrypts all keys in memory simultaneously, causing a CPU spike."
    ],
    correctAnswer: 2,
    explanation: "Redis executes commands sequentially on a single thread. Scanning a huge dataset with `KEYS *` blocks all other operations (GETs/SETs) for seconds, causing massive latency spikes and potentially crashing dependent microservices."
  },

  // --- SYSTEM ARCHITECT ---
  {
    id: "sys-1",
    role: "System Architect",
    difficulty: "expert",
    question: "What is the 'Thundering Herd' problem in a caching layer?",
    options: [
      "When a cache node runs out of memory and abruptly evicts the most frequently accessed keys.",
      "When a highly requested cache key expires, causing a massive spike of identical requests to bypass the cache and hit the database simultaneously.",
      "When network latency causes cache invalidation messages to arrive out of order.",
      "When multiple microservices attempt to open socket connections to the cache cluster concurrently."
    ],
    correctAnswer: 1,
    explanation: "When a popular key expires, hundreds of concurrent requests will all 'miss' the cache. Without deduplication or locking, they will all query the DB at once, potentially bringing it down."
  },
  {
    id: "sys-raft",
    role: "System Architect",
    difficulty: "expert",
    question: "In distributed consensus algorithms like Raft (used by etcd/Kubernetes), how is a 'Split Brain' scenario structurally prevented?",
    options: [
      "By relying on a perfectly synchronized atomic clock (like Google TrueTime).",
      "By strictly requiring an absolute majority (quorum) of nodes to elect a leader and commit logs. In a partition, only the partition containing the majority can continue operating.",
      "By forcefully restarting any node that loses connection to the master.",
      "By assigning a static, unbreakable priority ID to every node at startup."
    ],
    correctAnswer: 1,
    explanation: "If a 5-node cluster splits into a 3-node and 2-node group, the 3-node group maintains quorum (majority) and continues. The 2-node group cannot achieve quorum to elect a leader, preventing two competing leaders (split brain)."
  },
  {
    id: "ds-crdt",
    role: "System Architect",
    difficulty: "chaos",
    question: "What is the magical property of a CRDT (Conflict-free Replicated Data Type)?",
    options: [
      "It compresses JSON payloads into binary to save network bandwidth.",
      "It uses AI to guess which user's data is more important during a conflict.",
      "It guarantees that concurrent, disconnected updates across multiple nodes can always be merged mathematically to reach exactly the same consistent state, without requiring any locking or central coordination.",
      "It strictly locks all nodes across the globe before allowing a single write."
    ],
    correctAnswer: 2,
    explanation: "CRDTs (used in collaborative apps like Figma or distributed DBs like Redis Enterprise) use specific mathematical rules (like commutativity) so that no matter the order network packets arrive in, all replicas eventually compute the exact same state without locks."
  },

  // --- DEVOPS ENGINEER ---
  {
    id: "cloud-vpc",
    role: "DevOps Engineer",
    difficulty: "hard",
    question: "In AWS, what is the primary architectural purpose of a NAT Gateway?",
    options: [
      "To translate an Elastic IP into a Route 53 domain name.",
      "To load balance traffic securely between EC2 instances in a public subnet.",
      "To allow resources in a private subnet to initiate outbound internet traffic (e.g., to download patches) while preventing the internet from initiating connections to those resources.",
      "To encrypt data traversing a VPN connection between on-premise and the cloud."
    ],
    correctAnswer: 2,
    explanation: "A NAT Gateway sits in a public subnet. Private instances send their outbound internet traffic to the NAT, which masquerades their private IPs behind its own public IP, keeping the internal instances hidden and safe from inbound attacks."
  },
  {
    id: "devops-docker",
    role: "DevOps Engineer",
    difficulty: "hard",
    question: "Why is it an anti-pattern to run processes as `root` inside a Docker container?",
    options: [
      "Docker refuses to expose ports if the container runs as root.",
      "Root processes consume significantly more RAM on the host machine.",
      "By default, the `root` user inside the container shares the exact same UID (0) as the `root` user on the host OS. A container breakout vulnerability could grant the attacker host root access.",
      "It breaks Docker's layer caching mechanism."
    ],
    correctAnswer: 2,
    explanation: "Containers are not full VMs; they share the host kernel. UID 0 inside is UID 0 outside (unless user namespaces are remapped). Escaping the container as root gives catastrophic control over the host."
  },

  // --- SECURITY ENGINEER ---
  {
    id: "sec-1",
    role: "Security Engineer",
    difficulty: "hard",
    question: "How does a Server-Side Request Forgery (SSRF) attack typically manifest?",
    options: [
      "An attacker injects a malicious script that runs in the victim's browser.",
      "An attacker tricks the backend server into making an HTTP request to an internal, restricted resource (e.g., AWS metadata IP).",
      "An attacker intercepts a TLS handshake to downgrade the cipher suite.",
      "An attacker repeatedly submits a login form to exhaust the database connection pool."
    ],
    correctAnswer: 1,
    explanation: "SSRF happens when a server takes a user-provided URL and fetches it without validation. Attackers use this to bypass firewalls and scan internal networks or access sensitive metadata endpoints like 169.254.169.254."
  },
  {
    id: "sec-pfs",
    role: "Security Engineer",
    difficulty: "expert",
    question: "What does 'Perfect Forward Secrecy' (PFS) achieve in modern TLS connections?",
    options: [
      "It prevents Man-in-the-Middle attackers from downgrading the connection to HTTP.",
      "It generates a unique, ephemeral session key for every connection. If an attacker records encrypted traffic for years and later steals the server's private key, they STILL cannot decrypt the historical traffic.",
      "It securely forwards IP packets to the next firewall without revealing the origin.",
      "It ensures that a leaked password hash cannot be reversed."
    ],
    correctAnswer: 1,
    explanation: "Without PFS, stealing the server's private RSA key allows an attacker to decrypt years of recorded past traffic. PFS (using Diffie-Hellman Ephemeral) ensures the session keys are never saved on the server, making retroactive decryption impossible."
  },

  // --- ML ENGINEER ---
  {
    id: "ml-1",
    role: "ML Engineer",
    difficulty: "expert",
    question: "In the self-attention mechanism of a Transformer model, what is the primary purpose of the 'Key' (K), 'Query' (Q), and 'Value' (V) matrices?",
    options: [
      "They compress the input embedding dimension to reduce memory footprint.",
      "The 'Query' of one word compares against the 'Keys' of all other words to compute attention scores, which then weight the 'Values' to form the final contextual representation.",
      "They are used strictly during backpropagation to prevent exploding gradients.",
      "They map text tokens directly into probability distributions for the next word prediction."
    ],
    correctAnswer: 1,
    explanation: "In self-attention, each token acts as a Query asking 'which other tokens are relevant to me?'. It checks the Keys of other tokens. The resulting dot-product score determines how much of that token's Value is mixed into the output."
  },
  {
    id: "ml-2",
    role: "ML Engineer",
    difficulty: "hard",
    question: "When performing vector search for semantic similarity, why might you choose 'Cosine Similarity' over 'Euclidean Distance' (L2)?",
    options: [
      "Cosine Similarity is computationally much faster on GPUs.",
      "Cosine Similarity measures the angle between vectors rather than magnitude, meaning it correctly identifies similarity even if one text is much longer than the other.",
      "Euclidean Distance only works for 2D vectors.",
      "Cosine similarity is the only metric supported by modern databases like pgvector."
    ],
    correctAnswer: 1,
    explanation: "Euclidean distance measures absolute distance, so a long document might seem far from a short summary of it. Cosine similarity looks at the angle/direction, focusing on the semantic meaning regardless of length/magnitude."
  },
  {
    id: "ml-3",
    role: "ML Engineer",
    difficulty: "chaos",
    question: "What does 'Gradient Accumulation' allow an ML Engineer to do during model training?",
    options: [
      "It automatically prevents the model from overfitting to the training data.",
      "It fakes a larger batch size by accumulating gradients over multiple smaller forward/backward passes before actually updating the weights, solving VRAM limitations.",
      "It compresses the model weights into INT8 format for inference.",
      "It skips backpropagation on layers that are already converged."
    ],
    correctAnswer: 1,
    explanation: "When you can't fit a batch size of 32 in GPU VRAM, you can run a batch size of 8 four times, summing (accumulating) the gradients each time, and only stepping the optimizer once. It effectively simulates the larger batch size without OOM errors."
  },

  // --- FORWARD DEPLOYED ENGINEER ---
  {
    id: "fde-1",
    role: "Forward Deployed Engineer",
    difficulty: "hard",
    question: "As an FDE deploying an LLM solution to an on-premise enterprise client, what is the most critical constraint when dealing with 'Air-Gapped' environments?",
    options: [
      "The model will train significantly slower due to older GPU hardware.",
      "The environment has zero inbound or outbound internet connectivity, meaning you cannot rely on external APIs (like OpenAI), SaaS telemetry, or internet-based package managers during deployment.",
      "Air-gapped networks inherently block all WebSocket connections.",
      "You are restricted to using only SQL databases for vector storage."
    ],
    correctAnswer: 1,
    explanation: "Air-gapped networks are physically/logically isolated from the internet for extreme security. This means FDEs must deploy open-source/local models (like Llama 3) and bring all dependencies on physical media or via strict internal artifact registries."
  },
  {
    id: "fde-2",
    role: "Forward Deployed Engineer",
    difficulty: "expert",
    question: "When integrating a modern AI agent with a client's legacy SOAP/XML system, what is the most robust architectural pattern to prevent the AI from generating malformed requests?",
    options: [
      "Prompting the LLM to output perfect SOAP XML and sending it directly to the legacy server.",
      "Building a deterministic adapter/middleware API (e.g., in Python/Node) that accepts simple JSON from the AI agent and safely translates it into strict SOAP calls.",
      "Fine-tuning the LLM on thousands of the client's XML logs so it natively understands the schema.",
      "Converting the legacy SOAP system entirely to REST before the AI can be deployed."
    ],
    correctAnswer: 1,
    explanation: "LLMs are probabilistic and will eventually hallucinate syntax. An FDE should never let an LLM directly generate and fire legacy XML payloads. You must build a strict deterministic software bridge (API tool) that the LLM invokes with simple JSON arguments."
  },

  // --- AI LEAD ARCHITECT ---
  {
    id: "aia-1",
    role: "AI Lead Architect",
    difficulty: "expert",
    question: "When should an AI Architect choose Retrieval-Augmented Generation (RAG) over Fine-Tuning an LLM?",
    options: [
      "When the goal is to teach the model a completely new language syntax.",
      "When the application requires factual accuracy on dynamic, constantly changing private data, and the source of the facts needs to be cited.",
      "When you need to change the fundamental reasoning capabilities and 'tone' of the model.",
      "When inference speed and latency are the absolute highest priorities."
    ],
    correctAnswer: 1,
    explanation: "Fine-tuning bakes knowledge into the model weights, making it static, expensive to update, and prone to hallucination without citations. RAG injects live, searchable data into the prompt at runtime, solving data staleness and allowing source attribution."
  },
  {
    id: "aia-2",
    role: "AI Lead Architect",
    difficulty: "chaos",
    question: "In a Multi-Agent AI system (e.g., using LangChain or AutoGen), what is a 'Semantic Router' used for?",
    options: [
      "To load balance TCP traffic between different GPU nodes.",
      "To use an embedding model to classify a user's intent based on the semantic meaning of their query, deterministically routing them to the correct specialized agent or tool without invoking a heavy LLM.",
      "To translate natural language into SQL queries instantly.",
      "To compress conversation history to fit within the context window."
    ],
    correctAnswer: 1,
    explanation: "Semantic routing compares the vector embedding of a user's prompt against predefined intent vectors. It's incredibly fast and cheap, allowing the architecture to route queries to specialized agents (e.g., billing vs tech support) without wasting time/money on an LLM inference step."
  },

  // --- PROMPT ENGINEER ---
  {
    id: "pe-1",
    role: "Prompt Engineer",
    difficulty: "hard",
    question: "What is the primary mechanism behind 'Chain of Thought' (CoT) prompting?",
    options: [
      "Feeding the model a massive sequence of past conversations.",
      "Forcing the model to output a bulleted list.",
      "Appending phrases like 'Let's think step by step', forcing the model to explicitly output intermediate reasoning steps before arriving at a final answer, which drastically reduces logical errors.",
      "Using few-shot examples that only show the final correct answer."
    ],
    correctAnswer: 2,
    explanation: "LLMs predict the next token based on previous tokens. By forcing the model to write out its logic ('thinking' out loud), the 'thoughts' become part of the context window, giving the model a mathematically sound foundation to predict the correct final answer token."
  },
  {
    id: "pe-2",
    role: "Prompt Engineer",
    difficulty: "expert",
    question: "How can a Prompt Engineer effectively mitigate 'Prompt Injection' attacks when taking untrusted user input?",
    options: [
      "By asking the LLM nicely not to listen to malicious commands.",
      "By using delimiter framing (e.g., wrapping user input in ```) combined with pre-flight intent classification, or placing the system instructions AFTER the user input.",
      "By restricting the input length to exactly 100 characters.",
      "Prompt injection is impossible if you use a high enough temperature setting."
    ],
    correctAnswer: 1,
    explanation: "Attackers use injections (like 'Ignore previous instructions...') to hijack the LLM. Using strict delimiters separates the instructions from the payload. Placing core system instructions at the very end of the prompt also leverages the 'recency bias' of attention mechanisms, overriding the attacker's payload."
  },
  {
    id: "aia-1",
    role: "AI Lead Architect",
    difficulty: "chaos",
    question: "When designing a large-scale RAG system with a vector database containing 10 billion embeddings, which indexing algorithm and query strategy minimizes 99th percentile latency while maintaining >95% recall under a high concurrent query load?",
    options: ["HNSW (Hierarchical Navigable Small World) with a high ef_construction and dynamic ef_search tuning, partitioned across multiple shards with scatter-gather querying.","IVF-PQ (Inverted File with Product Quantization) using a coarse quantizer trained on a representative sample, combined with aggressive caching of Voronoi cell centroids.","LSH (Locality-Sensitive Hashing) with multiple hash tables, leveraging parallel map-reduce for distance computation across distributed nodes.","Exact KNN (K-Nearest Neighbors) using highly optimized GPU-accelerated matrix multiplication on high-bandwidth memory architectures."],
    correctAnswer: 0,
    explanation: "For 10 billion embeddings requiring high recall (>95%) and low p99 latency, HNSW partitioned across shards is optimal. IVF-PQ typically sacrifices some recall for memory efficiency, LSH struggles with high-dimensional dense embeddings for high recall, and Exact KNN is computationally infeasible at this scale for low latency."
  },
  {
    id: "aia-2",
    role: "AI Lead Architect",
    difficulty: "expert",
    question: "In a multi-agent orchestration framework where Agent A (Planner) asynchronously delegates tasks to Agent B (Coder) and Agent C (Reviewer), which consensus protocol prevents race conditions when both B and C attempt to modify the same shared state file?",
    options: ["Implementing a global lock manager using Redis, requiring agents to acquire an exclusive lock before state mutation.","Using an optimistic concurrency control (OCC) mechanism with vector clocks to detect and resolve conflicting state versions during merges.","Enforcing a strict directed acyclic graph (DAG) execution model where state is immutable and each agent produces a new state snapshot.","Deploying a decentralized Paxos or Raft consensus algorithm among the agents to vote on state transition validity."],
    correctAnswer: 2,
    explanation: "In multi-agent architectures, enforcing a DAG execution model with immutable state snapshots is the most robust and scalable way to prevent race conditions and maintain determinism, avoiding the deadlocks of global locks and the complexity of OCC or consensus protocols at the agent level."
  },
  {
    id: "aia-3",
    role: "AI Lead Architect",
    difficulty: "hard",
    question: "To serve an 8x7B Mixture of Experts (MoE) LLM with minimal latency on memory-constrained edge hardware, which quantization strategy provides the best trade-off between inference speed and perplexity degradation?",
    options: ["Applying uniform INT8 quantization to all weights and activations across all expert layers.","Using AWQ (Activation-aware Weight Quantization) at 4-bit, keeping activations in FP16 to preserve outlier magnitudes.","Implementing SmoothQuant to statically shift the quantization difficulty from activations to weights, enabling INT8 compute.","Employing post-training GPTQ at 3-bit precision with group-size 128 for the expert layers, while keeping the routing network in FP16."],
    correctAnswer: 3,
    explanation: "For MoE models on memory-constrained edge devices, keeping the routing network in higher precision (FP16) is critical for accurate expert selection. Compressing the massive expert layers using advanced techniques like GPTQ at 3/4-bit with grouped quantization aggressively reduces memory footprint while mitigating perplexity drops."
  },
  {
    id: "aia-4",
    role: "AI Lead Architect",
    difficulty: "chaos",
    question: "When designing a cost-optimization layer for a high-volume LLM API gateway routing requests between GPT-4, Claude 3.5 Sonnet, and a local Llama-3-8B, which dynamic routing algorithm maximizes ROI while respecting a strict SLA of <2s latency?",
    options: ["A round-robin scheduler weighted by the inverse of the API cost per 1K tokens.","A semantic similarity router that embeds the prompt and queries a vector database to match historical queries, routing to the cheapest model that previously succeeded.","A multi-armed bandit (MAB) reinforcement learning agent optimizing a reward function combining output quality scores, cost, and real-time latency metrics.","A rule-based classifier that routes queries <100 tokens to Llama-3, 100-1000 tokens to Claude, and >1000 tokens to GPT-4."],
    correctAnswer: 2,
    explanation: "A Multi-Armed Bandit (MAB) or contextual bandit dynamically balances exploration and exploitation, adapting to fluctuating latencies, costs, and model performance. Semantic similarity routing adds unacceptable latency (<2s SLA violation risk), and rule-based or round-robin methods are too rigid."
  },
  {
    id: "aia-5",
    role: "AI Lead Architect",
    difficulty: "expert",
    question: "In a continuous pre-training pipeline for a 70B parameter model using PyTorch FSDP (Fully Sharded Data Parallel), how do you resolve a recurring Out of Memory (OOM) error that only occurs during the backward pass of the final transformer layers?",
    options: ["Enable gradient checkpointing (activation checkpointing) for the transformer blocks to trade compute for memory.","Switch from FSDP to DeepSpeed ZeRO Stage 3 to offload optimizer states to the CPU.","Reduce the micro-batch size and proportionally increase gradient accumulation steps.","Adjust the FSDP auto-wrap policy to shard at a finer granularity, wrapping individual linear layers instead of full transformer blocks."],
    correctAnswer: 0,
    explanation: "OOM during the backward pass is typically caused by storing massive activation tensors from the forward pass. Gradient (activation) checkpointing drops these activations and recomputes them during the backward pass, significantly reducing peak memory usage. Sharding policies or ZeRO-3 address model/optimizer state memory, not activation memory directly."
  },
  {
    id: "aia-6",
    role: "AI Lead Architect",
    difficulty: "chaos",
    question: "You are building a real-time speech-to-speech AI agent. The current pipeline (STT -> LLM -> TTS) suffers from a 3.5s total latency. Which architectural overhaul most effectively reduces total latency to sub-second levels while maintaining conversational flow?",
    options: ["Deploying all three models on a single H100 GPU utilizing CUDA Graphs to eliminate CPU-GPU communication overhead.","Implementing streaming chunk-based processing where the LLM begins generating tokens from partial STT hypotheses, and the TTS synthesizes audio from the LLM's token stream before sentence completion.","Replacing the sequential pipeline with a single end-to-end multi-modal transformer trained natively on audio-in/audio-out tasks.","Using a smaller, distilled LLM and quantization to INT4 for the STT and TTS models."],
    correctAnswer: 1,
    explanation: "Streaming architecture is the industry standard for sub-second conversational AI. By cascading partial outputs (STT streaming to LLM, LLM token streaming to TTS), you hide the latency of subsequent steps behind the execution of earlier ones. End-to-end models (like GPT-4o native audio) are still emerging and harder to control, while hardware/quantization optimizations won't bridge a 3.5s gap alone."
  },
  {
    id: "aia-7",
    role: "AI Lead Architect",
    difficulty: "hard",
    question: "When implementing a semantic cache for an LLM application to reduce API costs, what is the primary vulnerability of setting a very high semantic similarity threshold (e.g., cosine similarity > 0.99)?",
    options: ["The cache hit rate will drop significantly, neutralizing the cost-saving benefits of the cache.","The vector database will consume excessive memory due to the high precision required for embeddings.","The system will return inaccurate or logically flawed responses to subtly different queries.","The retrieval latency will increase exponentially due to the dense clustering of embeddings."],
    correctAnswer: 0,
    explanation: "A very high similarity threshold means only nearly identical queries will trigger a cache hit. This results in a low cache hit rate, making the cache ineffective for cost optimization. Lower thresholds risk returning irrelevant cached responses (false positives), but high thresholds cause false negatives."
  },
  {
    id: "aia-8",
    role: "AI Lead Architect",
    difficulty: "expert",
    question: "To mitigate the 'lost in the middle' phenomenon in RAG systems, which retrieval and synthesis strategy is most effective?",
    options: ["Increasing the sequence length of the embedding model to capture larger document chunks.","Applying a reranker model (e.g., Cohere Rerank) to the top-K retrieved documents before passing them to the LLM.","Implementing an order-aware prompt compilation that places the most relevant retrieved chunks at the very beginning and very end of the context window.","Using a generative feedback loop where the LLM queries the vector database iteratively until it finds the exact answer."],
    correctAnswer: 2,
    explanation: "LLMs exhibit a U-shaped attention curve, often ignoring context in the middle of long prompts. Placing the highest-scoring retrieved chunks at the start and end of the context window directly counteracts this, ensuring the most vital information is heavily attended to."
  },
  {
    id: "aia-9",
    role: "AI Lead Architect",
    difficulty: "chaos",
    question: "In a distributed Kubernetes cluster running vLLM for serving Llama-3-70B, you observe severe tail latency spikes during concurrent batch processing. The KV cache utilization metric frequently hits 95%. What is the most appropriate architectural intervention?",
    options: ["Increase the number of attention heads in the model configuration to parallelize KV cache access.","Implement PagedAttention and dynamically tune the `--gpu-memory-utilization` parameter to allocate a larger memory pool specifically for the KV cache.","Switch from tensor parallelism to pipeline parallelism across nodes to distribute the KV cache burden.","Deploy an external Redis cluster to offload and serve the KV cache tensors over the network."],
    correctAnswer: 1,
    explanation: "PagedAttention (core to vLLM) efficiently manages the KV cache to prevent fragmentation. If the cache is hitting 95% and causing tail latency (due to swapping or recomputation), tuning the GPU memory utilization flag to reserve more VRAM for the KV cache pool directly addresses the bottleneck. Network offloading is too slow for inference."
  },
  {
    id: "aia-10",
    role: "AI Lead Architect",
    difficulty: "hard",
    question: "Which evaluation metric is most robust for automatically assessing the hallucination rate of an enterprise QA chatbot grounded in proprietary documents?",
    options: ["ROUGE-L, comparing the chatbot's response to a set of human-written golden answers.","Cosine similarity between the generated response embeddings and the retrieved document embeddings.","LLM-as-a-Judge using a prompt that strictly evaluates the entailment of the response given only the retrieved context.","Perplexity of the generated response calculated by the base pre-trained model."],
    correctAnswer: 2,
    explanation: "LLM-as-a-Judge (specifically checking for Natural Language Inference/Entailment against the provided context) is the state-of-the-art for hallucination detection in RAG. ROUGE measures lexical overlap, embeddings capture semantic similarity but ignore factual contradictions, and perplexity only measures the statistical likelihood of text, not truthfulness."
  },
  {
    id: "aia-11",
    role: "AI Lead Architect",
    difficulty: "chaos",
    question: "You are migrating a monolithic Python AI backend to a microservices architecture. The core service runs a heavy PyTorch model inference that blocks the main thread. How do you architect the Python service to handle 10,000 concurrent HTTP requests without dropping connections?",
    options: ["Use asynchronous programming (asyncio/FastAPI) and offload the PyTorch inference calls to a ProcessPoolExecutor or dedicated GPU inference server (like Triton).","Deploy the application using Gunicorn with 10,000 synchronous worker threads.","Wrap the PyTorch inference in an `await` block natively within the FastAPI async route handler.","Rewrite the PyTorch inference logic in Cython and release the Global Interpreter Lock (GIL) manually."],
    correctAnswer: 0,
    explanation: "PyTorch inference is CPU/GPU bound and will block the asyncio event loop if run directly in an async handler. Using a ProcessPoolExecutor isolates the blocking call, but ideally, separating the compute into a dedicated inference server (like Triton or Ray Serve) and communicating asynchronously from FastAPI is the enterprise standard."
  },
  {
    id: "aia-12",
    role: "AI Lead Architect",
    difficulty: "expert",
    question: "When designing a knowledge graph (KG) augmented RAG system (GraphRAG), what is the architectural advantage of extracting triplets (Subject, Predicate, Object) over standard semantic chunking?",
    options: ["Triplets require significantly less storage space than dense vector embeddings.","Graph traversals can explicitly resolve multi-hop reasoning queries that semantic similarity often fails to connect.","Triplets eliminate the need for an LLM during the final generation phase.","Knowledge graphs natively support continuous learning without requiring database updates."],
    correctAnswer: 1,
    explanation: "Standard semantic chunking struggles with multi-hop reasoning (e.g., 'Who is the CEO of the company that acquired X?'). Knowledge graphs model explicit relationships, allowing deterministic traversal across multiple nodes to connect disparate facts before passing the context to the LLM."
  },
  {
    id: "aia-13",
    role: "AI Lead Architect",
    difficulty: "hard",
    question: "To secure an internal LLM deployment against Prompt Injection attacks that attempt to exfiltrate system prompts, which defense-in-depth architectural pattern is most effective?",
    options: ["Fine-tuning the model heavily on a dataset of known prompt injection attacks.","Using a secondary, smaller 'guardrail' LLM to evaluate the user's input for malicious intent before passing it to the primary model.","Filtering the user input through a regular expression matcher containing common injection keywords like 'ignore previous instructions'.","Encoding the system prompt in base64 before passing it to the model context."],
    correctAnswer: 1,
    explanation: "A semantic filter or 'guardrail' model (like Llama-Guard) evaluating inputs is a robust, dynamic defense mechanism. Regular expressions are easily bypassed, fine-tuning can be unlearned or circumvented, and encoding the prompt degrades the model's instruction-following capability."
  },
  {
    id: "aia-14",
    role: "AI Lead Architect",
    difficulty: "chaos",
    question: "Your team uses Direct Preference Optimization (DPO) to align a model. The training loss rapidly drops to zero, but human evaluators report the model now outputs repetitive, degenerate text. What is the likely architectural or hyperparameter cause?",
    options: ["The learning rate is too low, causing the model to get stuck in a local minimum.","The beta (KL penalty) parameter in the DPO loss function is set too low, allowing the model to diverge too far from the reference model.","The preference dataset contains too many tied responses, confusing the reward model.","Gradient clipping was disabled, leading to exploding gradients."],
    correctAnswer: 1,
    explanation: "In DPO (and RLHF), the beta parameter controls the KL divergence penalty against the reference model. If beta is too low, the model over-optimizes for the preference data without constraint, leading to 'reward hacking' or degenerate, out-of-distribution text."
  },
  {
    id: "aia-15",
    role: "AI Lead Architect",
    difficulty: "expert",
    question: "In a federated learning architecture for training a healthcare LLM across multiple hospitals without sharing raw patient data, how do you defend against a malicious node attempting a 'model poisoning' attack?",
    options: ["Encrypting all gradients using Fully Homomorphic Encryption (FHE) before transmission.","Implementing Byzantine-robust aggregation algorithms (e.g., Krum or trimmed mean) at the central server to discard anomalous gradient updates.","Applying Differential Privacy (DP-SGD) at the hospital level during local training.","Requiring each hospital to provide a cryptographic hash of their local dataset."],
    correctAnswer: 1,
    explanation: "Byzantine-robust aggregators analyze incoming updates and discard outliers, preventing a malicious node from skewing the global model. FHE protects privacy but doesn't prevent poisoning. DP-SGD protects privacy but actually reduces model utility and doesn't explicitly stop directed poisoning."
  },
  {
    id: "aia-16",
    role: "AI Lead Architect",
    difficulty: "hard",
    question: "You are tasked with evaluating an open-weights LLM for coding tasks. The model achieves 90% on HumanEval pass@1 but struggles in real-world repo-level completion. What architectural capability is likely missing?",
    options: ["The model lacks cross-file context window awareness and Fill-In-The-Middle (FIM) training objectives.","The model was not quantized properly, leading to precision loss in syntax generation.","The model's vocabulary size is too small to handle complex variable names.","The model was evaluated using greedy decoding instead of nucleus sampling."],
    correctAnswer: 0,
    explanation: "HumanEval tests isolated, function-level logic (often simple algorithms). Real-world coding requires repository-level context (understanding imports, class structures across files) and Fill-In-The-Middle (FIM) capabilities to insert code within existing blocks, which requires specific pre-training formatting."
  },
  {
    id: "aia-17",
    role: "AI Lead Architect",
    difficulty: "chaos",
    question: "When deploying LoRA (Low-Rank Adaptation) adapters for multi-tenant LLM serving (e.g., 100 users with different fine-tunes on the same base model), which system architecture maximizes throughput and minimizes VRAM?",
    options: ["Deploying 100 separate API containers, each loading the base model and its specific LoRA adapter.","Using vLLM with multi-LoRA support to dynamically inject adapter weights into the base model's attention layers per-request during batched inference.","Merging all 100 LoRA adapters into a single base model using SVD and serving it natively.","Storing LoRA adapters in a PostgreSQL database and fetching them via REST API on every token generation step."],
    correctAnswer: 1,
    explanation: "Advanced serving frameworks like vLLM and Lorax support dynamic multi-LoRA serving. They keep one copy of the massive base model in VRAM and dynamically apply the small LoRA matrices (A and B) to specific requests within a single batch, drastically reducing VRAM and increasing throughput."
  },
  {
    id: "aia-18",
    role: "AI Lead Architect",
    difficulty: "expert",
    question: "What is the primary architectural trade-off when implementing a sparse attention mechanism (like Longformer or BigBird) compared to standard dense self-attention for handling 128k token contexts?",
    options: ["Sparse attention increases VRAM usage logarithmically but reduces CPU overhead.","Sparse attention reduces theoretical computational complexity from O(N^2) to O(N), but heavily fragments memory access patterns, often resulting in lower actual hardware utilization on GPUs.","Sparse attention completely eliminates the need for positional embeddings, simplifying the model architecture.","Sparse attention restricts the model to only processing causal language modeling, preventing bidirectional encoding."],
    correctAnswer: 1,
    explanation: "While sparse attention mathematically reduces complexity to O(N) or O(N log N), GPUs are optimized for dense matrix multiplications. The sparse, block-based, or random memory access patterns of sparse attention often lead to poor tensor core utilization and memory bandwidth bottlenecks in practice."
  },
  {
    id: "aia-19",
    role: "AI Lead Architect",
    difficulty: "hard",
    question: "In the context of AI agent tool-calling architectures, what is the primary benefit of constraining the LLM's output using structured generation (e.g., JSON Schema enforcement via Outlines or constrained decoding)?",
    options: ["It significantly reduces the latency of the LLM's forward pass by skipping tokens.","It eliminates hallucinations entirely from the generated text.","It guarantees the output syntax is strictly parsable by downstream systems, preventing serialization crashes.","It allows the model to access tools without requiring an API key."],
    correctAnswer: 2,
    explanation: "Constrained decoding intercepts the LLM's logit distribution and masks out tokens that would violate a predefined schema (like JSON). This guarantees 100% syntactically correct outputs, eliminating the common issue of agents failing because they generated malformed JSON that crashes downstream parsers."
  },
  {
    id: "aia-20",
    role: "AI Lead Architect",
    difficulty: "chaos",
    question: "You are designing the data ingestion pipeline for an enterprise RAG system processing complex PDFs (containing double-column layouts, charts, and tables). Which parsing architecture yields the highest quality embeddings?",
    options: ["Using a standard Python library like PyPDF2 to extract text strings linearly and chunking by character count.","Employing a Vision-Language Model (VLM) or multimodal OCR pipeline to detect bounding boxes, preserve reading order, and extract tables into Markdown format before chunking.","Converting the PDF to images and embedding the entire images directly using CLIP.","Extracting all text and passing the entire unformatted string through an LLM to summarize before embedding."],
    correctAnswer: 1,
    explanation: "Standard PDF parsers destroy semantic structure (reading columns out of order, garbling tables). A VLM/OCR-based layout parsing approach preserves the semantic structure, turning tables into Markdown/HTML, which modern LLMs and embedding models understand perfectly, vastly improving RAG retrieval accuracy."
  },
  {
    id: "aia-21",
    role: "AI Lead Architect",
    difficulty: "expert",
    question: "When building an agentic workflow using the ReAct (Reasoning and Acting) pattern, what is the most critical prompt engineering technique to prevent the agent from getting stuck in an infinite thought-action loop?",
    options: ["Providing a strict few-shot example of a successful sequence ending in a Final Answer.","Setting the temperature parameter to 0.0 to ensure deterministic behavior.","Appending a system prompt that simply says 'Do not repeat yourself'.","Increasing the frequency penalty parameter to 2.0."],
    correctAnswer: 0,
    explanation: "ReAct agents often loop when they fail to recognize when a task is complete or how to format the termination state. Few-shot prompting with clear examples of how to transition from an Observation to a Final Answer is the most reliable architectural method to ground the agent's state machine."
  },
  {
    id: "aia-22",
    role: "AI Lead Architect",
    difficulty: "hard",
    question: "Which system architecture design best handles the cold-start problem when scaling up GPU instances (e.g., loading a 40GB model into VRAM) on serverless infrastructure during a sudden traffic spike?",
    options: ["Deploying the model using a standard Docker container on AWS Lambda.","Keeping a pool of 'warm' instances running at baseline capacity and utilizing predictive auto-scaling based on historical traffic patterns.","Using an NFS (Network File System) to stream the model weights directly to the GPU on demand.","Quantizing the model to INT8 at runtime during the cold start."],
    correctAnswer: 1,
    explanation: "Loading massive tensors into GPU memory physically takes time (PCIe bandwidth limits). You cannot completely eliminate cold starts on massive models. The architectural solution is predictive scaling and maintaining a warm pool. Serverless (Lambda) doesn't support GPUs well, streaming weights over network is too slow, and runtime quantization adds compute overhead."
  },
  {
    id: "aia-23",
    role: "AI Lead Architect",
    difficulty: "chaos",
    question: "In a sophisticated AI system utilizing speculative decoding to speed up token generation, what is the relationship between the draft model and the target model?",
    options: ["The draft model generates tokens in parallel, and the target model verifies them in a single forward pass, accepting them if their probabilities align.","The target model generates a draft, and a smaller draft model checks it for factual accuracy.","The draft model is a quantized version of the target model running on CPU while the target model runs on GPU.","Both models generate tokens independently, and a router selects the fastest response."],
    correctAnswer: 0,
    explanation: "Speculative decoding uses a small, fast 'draft' model to predict multiple future tokens sequentially. The large, slow 'target' model then processes these drafted tokens in parallel in a single forward pass. If the target model's logits agree with the draft, multiple tokens are accepted at once, heavily breaking the memory bandwidth bottleneck of autoregressive generation."
  },
  {
    id: "aia-24",
    role: "AI Lead Architect",
    difficulty: "expert",
    question: "What is the primary function of the 'KV Cache' in autoregressive Transformer models during inference?",
    options: ["To store the weights of the Feed-Forward Neural Network layers in fast SRAM.","To cache semantic search results from the vector database to prevent redundant queries.","To store the Keys and Values computed from previous tokens to avoid recomputing them for every new token generated.","To memorize frequent user prompts and their corresponding responses to save API costs."],
    correctAnswer: 2,
    explanation: "In autoregressive generation, each new token requires attending to all previous tokens. The KV cache stores the Key and Value tensors for past tokens. Without it, the model would recalculate the full sequence's attention at every step, making generation exponentially slower."
  },
  {
    id: "aia-25",
    role: "AI Lead Architect",
    difficulty: "hard",
    question: "When designing a multi-modal RAG system that ingests both images and text, what is the architectural advantage of using an embedding space like CLIP over using separate models for text and images?",
    options: ["CLIP natively generates text responses directly from images without needing an LLM.","CLIP aligns text and images into a shared latent space, allowing cross-modal retrieval (e.g., using a text query to retrieve a relevant image directly).","CLIP compresses image file sizes by 90% before storing them in the vector database.","CLIP replaces the need for a vector database by storing embeddings in a local graph structure."],
    correctAnswer: 1,
    explanation: "CLIP (Contrastive Language-Image Pre-training) maps both images and text into the exact same vector space. This shared latent space allows for seamless cross-modal search, where a text vector can be directly compared (via cosine similarity) to an image vector, enabling powerful multimodal retrieval architectures."
  },
  {
    id: "architect-1",
    role: "System Architect",
    difficulty: "expert",
    question: "In the context of the PACELC theorem, how does a typical Dynamo-style database (like Cassandra) configured with Quorum reads and writes behave?",
    options: ["PA/EC (Prefers Availability over Consistency during partitions, and Consistency over Latency during normal operations)","PA/EL (Prefers Availability over Consistency during partitions, and Latency over Consistency during normal operations)","PC/EC (Prefers Consistency over Availability during partitions, and Consistency over Latency during normal operations)","PC/EL (Prefers Consistency over Availability during partitions, and Latency over Consistency during normal operations)"],
    correctAnswer: 1,
    explanation: "Dynamo-style systems like Cassandra are fundamentally designed for high availability and low latency. Under PACELC, they are typically PA/EL, choosing availability under partition, and favoring lower latency over strong consistency during normal operations."
  },
  {
    id: "architect-2",
    role: "System Architect",
    difficulty: "chaos",
    question: "When implementing Consistent Hashing to distribute load across a cache cluster, adding a new node typically requires what percentage of keys to be remapped, given K total keys and N existing nodes?",
    options: ["K / (N * N)","K / (N + 1)","K / N","K / 2"],
    correctAnswer: 1,
    explanation: "In consistent hashing, when a new node is added, only the keys that fall between the new node and its predecessor in the hash ring need to be remapped. Statistically, this is K / (N + 1) keys."
  },
  {
    id: "architect-3",
    role: "System Architect",
    difficulty: "hard",
    question: "Which of the following database isolation levels prevents the 'Phantom Read' anomaly according to the SQL standard, but might still allow 'Write Skew' in some MVCC implementations?",
    options: ["Read Committed","Repeatable Read","Snapshot Isolation","Serializable"],
    correctAnswer: 2,
    explanation: "Snapshot Isolation prevents dirty reads, non-repeatable reads, and phantom reads, but is famously susceptible to the Write Skew anomaly, which requires true Serializable isolation to prevent."
  },
  {
    id: "architect-4",
    role: "System Architect",
    difficulty: "expert",
    question: "You are designing a high-throughput, append-heavy datastore. Why might you choose an LSM-Tree (Log-Structured Merge-Tree) over a B-Tree?",
    options: ["LSM-Trees provide faster read operations for point queries.","LSM-Trees optimize for random writes by buffering in memory and writing sequentially to disk.","LSM-Trees eliminate the need for garbage collection and compaction.","LSM-Trees prevent write amplification entirely."],
    correctAnswer: 1,
    explanation: "LSM-Trees are optimized for high write throughput because they buffer writes in memory (MemTable) and flush them to disk as sequential writes (SSTables), avoiding the random disk I/O typical of B-Tree node updates. They do, however, suffer from read and write amplification due to compaction."
  },
  {
    id: "architect-5",
    role: "System Architect",
    difficulty: "hard",
    question: "In the Saga pattern for distributed transactions, what is the primary role of compensating transactions?",
    options: ["To lock resources across multiple microservices to ensure ACID properties.","To automatically retry a failed transaction until it succeeds.","To undo the partial work of preceding local transactions if a subsequent transaction fails.","To coordinate the two-phase commit protocol across distributed nodes."],
    correctAnswer: 2,
    explanation: "Sagas avoid distributed locks by using a sequence of local transactions. If one local transaction fails, the Saga executes compensating transactions to explicitly undo the state changes made by the preceding local transactions."
  },
  {
    id: "architect-6",
    role: "System Architect",
    difficulty: "expert",
    question: "When designing a rate limiter, you choose the Token Bucket algorithm. What is a key advantage of Token Bucket over Leaky Bucket?",
    options: ["Token Bucket enforces a strictly constant output rate of requests.","Token Bucket allows for bursts of traffic up to the bucket's capacity.","Token Bucket requires less memory to track individual user requests.","Token Bucket never drops a request, it only delays them."],
    correctAnswer: 1,
    explanation: "The Token Bucket algorithm allows bursts of traffic as long as there are enough tokens in the bucket, whereas the Leaky Bucket algorithm processes requests at a constant, strict rate regardless of burst size."
  },
  {
    id: "architect-7",
    role: "System Architect",
    difficulty: "chaos",
    question: "In a distributed system using Lamport timestamps, event A has timestamp L(A)=5 and event B has timestamp L(B)=8. What can you definitively conclude about the causal relationship between A and B?",
    options: ["Event A definitely caused Event B.","Event B happened concurrently with Event A.","If Event A causally precedes Event B, then L(A) < L(B). However, L(A) < L(B) does NOT imply A caused B.","Event A and B happened on the same node."],
    correctAnswer: 2,
    explanation: "Lamport timestamps guarantee that if A -> B (A causally precedes B), then L(A) < L(B). However, the reverse is not true: L(A) < L(B) does not mean A -> B; they could be concurrent. Vector clocks are required to detect concurrency."
  },
  {
    id: "architect-8",
    role: "System Architect",
    difficulty: "hard",
    question: "To mitigate 'Cache Stampede' (Thundering Herd) when a highly requested cache key expires, which of the following techniques is most effective?",
    options: ["Increasing the cache expiration time (TTL) significantly.","Implementing consistent hashing across the cache cluster.","Using Probabilistic Early Expiration (XFetch) or Mutex Locks to ensure only one thread recomputes the value.","Scaling out the database to handle the sudden burst of read queries."],
    correctAnswer: 2,
    explanation: "Mutex locks ensure only the first thread encountering a cache miss queries the DB and repopulates the cache. Probabilistic Early Expiration computes the new value in the background slightly before the actual TTL expires, preventing the stampede."
  },
  {
    id: "architect-9",
    role: "System Architect",
    difficulty: "expert",
    question: "In Kafka, how is 'Exactly-Once Semantics' (EOS) primarily achieved during stream processing (read-process-write loop)?",
    options: ["By using distributed locks on consumer groups and two-phase commits to the broker.","By utilizing transactional producers that atomicize the consumption of offsets and the production of new messages.","By writing idempotent consumers that process the same message multiple times without side effects.","By configuring the broker with `acks=all` and consumers with `auto.commit=false`."],
    correctAnswer: 1,
    explanation: "Kafka's EOS in stream processing is achieved via Transactional APIs. A transactional producer can commit the processed output messages and the consumed offsets atomically in a single transaction, preventing duplicates on failure."
  },
  {
    id: "architect-10",
    role: "System Architect",
    difficulty: "chaos",
    question: "In the Raft consensus algorithm, what happens if a network partition separates the leader from the majority of the cluster?",
    options: ["The leader continues to serve reads and writes to the minority partition, causing a split-brain.","The leader immediately steps down and becomes a follower without waiting for an election timeout.","The leader cannot commit new log entries because it cannot achieve a majority quorum, and the majority partition will elect a new leader.","The cluster falls back to Paxos to resolve the partition state."],
    correctAnswer: 2,
    explanation: "A Raft leader isolated in a minority partition will continue attempting to replicate entries but will fail to get majority acknowledgments, so no new entries are committed. Meanwhile, the majority partition will experience an election timeout and elect a new functional leader."
  },
  {
    id: "architect-11",
    role: "System Architect",
    difficulty: "hard",
    question: "Why might you prefer a Cuckoo Filter over a standard Bloom Filter?",
    options: ["Cuckoo Filters have absolutely zero false positives.","Cuckoo Filters support removing items dynamically, whereas standard Bloom Filters do not.","Cuckoo Filters use significantly less CPU during read operations.","Cuckoo Filters never require resizing."],
    correctAnswer: 1,
    explanation: "A key advantage of Cuckoo Filters is that they support the deletion of items dynamically without requiring recreation of the filter, which standard Bloom Filters cannot do."
  },
  {
    id: "architect-12",
    role: "System Architect",
    difficulty: "expert",
    question: "When designing an API Gateway, what is the primary purpose of the 'Backends for Frontends' (BFF) pattern?",
    options: ["To completely replace the API Gateway with individual service meshes.","To provide a single monolithic API that serves all types of clients (web, mobile, IoT) uniformly.","To create separate, customized API gateways tailored to the specific needs and payload shapes of different client types.","To route traffic directly to backend databases, bypassing microservices."],
    correctAnswer: 2,
    explanation: "The BFF pattern involves creating a dedicated API gateway (a Backend for a Frontend) for each specific client interface (e.g., one for web, one for mobile) to optimize data fetching and aggregation for that client's specific UI needs."
  },
  {
    id: "architect-13",
    role: "System Architect",
    difficulty: "hard",
    question: "Which of the following scenarios is a State-based CRDT (CvRDT) specifically designed to handle?",
    options: ["Ensuring strict, real-time serializable consistency across global datacenters.","Merging diverging replicas of data without requiring synchronous coordination, provided the merge function is commutative, associative, and idempotent.","Enforcing foreign key constraints across microservice boundaries.","Preventing network partitions from occurring in distributed databases."],
    correctAnswer: 1,
    explanation: "CRDTs (Conflict-free Replicated Data Types) allow strong eventual consistency without coordination. State-based CRDTs merge complete states. The merge function must form a join semilattice (commutative, associative, idempotent) to guarantee convergence."
  },
  {
    id: "architect-14",
    role: "System Architect",
    difficulty: "expert",
    question: "In a microservices architecture, what is a primary drawback of 'Choreography' compared to 'Orchestration' for complex business transactions?",
    options: ["Choreography introduces a single point of failure in the system.","Choreography strictly couples services together, reducing independent deployability.","Choreography can make it difficult to monitor, track, and debug the overall state of a complex, multi-step business process.","Choreography requires using HTTP synchronous calls instead of asynchronous events."],
    correctAnswer: 2,
    explanation: "In choreography, services act on events independently without a central controller. While this reduces coupling, a major drawback is that the overarching business logic is scattered, making it hard to track the state of a complex flow compared to centralized Orchestration."
  },
  {
    id: "architect-15",
    role: "System Architect",
    difficulty: "chaos",
    question: "What is the 'Split-Brain' problem in distributed consensus, and how do systems like ZooKeeper or etcd prevent it?",
    options: ["It occurs when two different databases have different schemas. It is prevented by strict CI/CD pipelines.","It occurs when a network partition allows two isolated parts of a cluster to each elect a leader. It is prevented by requiring a strict majority (quorum) to elect a leader.","It occurs when read and write operations are routed to different nodes. It is prevented by sticky sessions.","It occurs when an LSM-tree fails to compact. It is prevented by increasing MemTable size."],
    correctAnswer: 1,
    explanation: "Split-brain happens when a cluster partitions and both sides act independently, potentially corrupting state. Quorum-based systems prevent this because only the partition containing a majority of nodes can elect a leader and process writes."
  },
  {
    id: "architect-16",
    role: "System Architect",
    difficulty: "hard",
    question: "When implementing Distributed Tracing (like OpenTelemetry), how are traces typically connected across asynchronous boundaries, such as putting a message on a Kafka queue?",
    options: ["By storing the Trace ID in a centralized relational database.","By injecting the Trace Context (Trace ID and Span ID) into the message headers/metadata before publishing.","By relying on the timing and timestamp of the message creation to guess the correlation.","By using a global distributed lock whenever a message is published."],
    correctAnswer: 1,
    explanation: "Context propagation is key in distributed tracing. When crossing boundaries like message queues, the trace context (Trace ID, Span ID, etc.) must be injected into the message payload or headers by the producer and extracted by the consumer."
  },
  {
    id: "architect-17",
    role: "System Architect",
    difficulty: "expert",
    question: "In database architecture, what is the primary purpose of a Write-Ahead Log (WAL)?",
    options: ["To provide an index for fast full-text search queries.","To securely encrypt data at rest before it is written to the main tables.","To ensure durability (the 'D' in ACID) by recording changes to disk sequentially before applying them to the in-memory database structures.","To automatically balance partitions across a distributed database cluster."],
    correctAnswer: 2,
    explanation: "A WAL ensures durability and atomicity. Before making changes to the actual data files, the changes are written sequentially to the WAL. If the system crashes, the WAL can be replayed to restore the state."
  },
  {
    id: "architect-18",
    role: "System Architect",
    difficulty: "chaos",
    question: "You are utilizing Martin Fowler's 'Circuit Breaker' pattern. After the circuit opens due to high failure rates, what must happen for it to close again?",
    options: ["A manual override from a system administrator is always required.","The system waits a predefined timeout, then transitions to 'Half-Open', allowing a limited number of test requests. If successful, it closes.","The circuit breaker continuously sends ping packets to the downstream service until an HTTP 200 is received, then closes immediately.","The downstream service must send a callback webhook to the circuit breaker to trigger the close."],
    correctAnswer: 1,
    explanation: "The 'Half-Open' state is critical. After a timeout period in the Open state, the circuit transitions to Half-Open to test the waters. If the limited test requests succeed, it transitions to Closed; if they fail, it trips back to Open."
  },
  {
    id: "architect-19",
    role: "System Architect",
    difficulty: "hard",
    question: "When migrating from a Monolith to Microservices, you use the Strangler Fig pattern. What is the core mechanism of this pattern?",
    options: ["Shutting down the monolith entirely for a 48-hour window while the microservices are deployed.","Gradually replacing specific functionalities of the monolith with new microservices by using a proxy or API gateway to route traffic to the new services.","Duplicating the entire monolith's codebase into 50 smaller repositories simultaneously.","Strangling the database by dropping foreign keys to improve write performance."],
    correctAnswer: 1,
    explanation: "The Strangler Fig pattern involves placing a reverse proxy or API gateway in front of the legacy monolith. You iteratively extract functionality into new microservices and redirect traffic for those specific endpoints to the new services until the monolith is 'strangled'."
  },
  {
    id: "architect-20",
    role: "System Architect",
    difficulty: "expert",
    question: "What is 'Backpressure' in the context of asynchronous, distributed stream processing?",
    options: ["A mechanism where a fast consumer forces a slow producer to speed up by increasing thread pools.","A network security technique to prevent DDoS attacks at the reverse proxy layer.","A feedback mechanism where a downstream system signals an upstream system to slow down data emission to prevent memory exhaustion.","The physical latency induced by routing traffic across oceanic fiber optic cables."],
    correctAnswer: 2,
    explanation: "Backpressure is essential for system stability. When a consumer cannot process data as fast as the producer generates it, backpressure allows the consumer to signal the producer to slow down, preventing buffer overflows and crashes."
  },
  {
    id: "architect-21",
    role: "System Architect",
    difficulty: "chaos",
    question: "In the context of distributed locking algorithms, what is the 'fencing token' problem that Martin Kleppmann highlighted regarding Redis Redlock?",
    options: ["Redlock is too slow for high-frequency trading platforms.","Clock drift across Redis nodes can cause locks to be granted to multiple clients simultaneously.","A client holding a lock might experience a GC pause exceeding the lock TTL. Upon waking, it believes it holds the lock and writes data, conflicting with the new lock owner. Redlock lacks a monotonic fencing token to prevent the storage layer from accepting the delayed write.","Redlock requires an odd number of nodes, which is difficult to provision in AWS."],
    correctAnswer: 2,
    explanation: "If a client pauses (e.g., Garbage Collection) and its lock expires, another client gets the lock. When the first client wakes up, it still thinks it has the lock and writes to storage. A fencing token (a strictly increasing number passed to storage) is required to reject the older client's write."
  },
  {
    id: "architect-22",
    role: "System Architect",
    difficulty: "hard",
    question: "Why might an architect choose a Graph Database (like Neo4j) over a Relational Database (like PostgreSQL) for a specific domain?",
    options: ["Graph databases are strictly better at storing massive, flat time-series data.","Graph databases treat relationships between entities as first-class citizens, making highly interconnected queries (like shortest path or recommendation engines) O(1) or O(log N) rather than requiring expensive recursive JOINs.","Graph databases enforce stronger ACID guarantees than traditional RDBMS.","Graph databases automatically shard relationships across multiple geographical regions seamlessly."],
    correctAnswer: 1,
    explanation: "Graph databases shine when the relationships between data points are as important as the data itself. Traversing a graph via pointers is computationally much cheaper than executing deep, recursive JOINs in SQL."
  },
  {
    id: "architect-23",
    role: "System Architect",
    difficulty: "expert",
    question: "When designing a highly available Service Mesh, what role does the 'Control Plane' play vs the 'Data Plane'?",
    options: ["The Control Plane processes and routes the actual network packets, while the Data Plane manages the TLS certificates.","The Data Plane consists of the application microservices, while the Control Plane is the database layer.","The Control Plane manages policies, configuration, and telemetry collection, while the Data Plane (usually sidecar proxies) intercepts and routes the actual application traffic.","The Control Plane is responsible for horizontal pod autoscaling, while the Data Plane handles load balancing."],
    correctAnswer: 2,
    explanation: "In a Service Mesh (like Istio), the Data Plane handles the actual transit of network traffic between services via proxies (like Envoy). The Control Plane manages the configuration of those proxies, pushing routing rules, mutual TLS certs, and gathering metrics."
  },
  {
    id: "architect-24",
    role: "System Architect",
    difficulty: "chaos",
    question: "In a gossip protocol used for cluster membership (like HashiCorp Serf), how does the system reliably detect a failed node without a central coordinator?",
    options: ["By having the central coordinator ping all nodes every second.","Through a decentralized process where nodes periodically send 'ping' messages to a random subset of peers. If a direct ping fails, the node requests other peers to perform an 'indirect ping'. If all fail, the node is marked dead.","By relying on BGP routing table updates from the underlying cloud provider network.","By waiting for the node to explicitly send a 'leave' message before shutting down."],
    correctAnswer: 1,
    explanation: "Gossip-based failure detection (SWIM protocol) uses random probing. Node A pings Node B. If B doesn't ACK, A asks Nodes C and D to ping B (indirect probe). This minimizes false positives caused by transient network path issues while remaining fully decentralized."
  },
  {
    id: "architect-25",
    role: "System Architect",
    difficulty: "hard",
    question: "What is the primary architectural difference between a 'Push' and 'Pull' based monitoring system (e.g., StatsD vs Prometheus)?",
    options: ["Push systems require agents to send metrics to a central server, while Pull systems require the central server to scrape endpoints exposed by the applications.","Push systems are strictly for logs, while Pull systems are strictly for metrics.","Push systems use TCP, while Pull systems always use UDP.","Push systems cannot handle high-cardinality data, whereas Pull systems can inherently compress it."],
    correctAnswer: 0,
    explanation: "In a Push model (like StatsD or Telegraf), the application or local agent pushes data to the central monitoring server. In a Pull model (like Prometheus), the monitoring server actively scrapes an HTTP endpoint exposed by the application at regular intervals."
  },
  {
    id: "backend-1",
    role: "Backend Engineer",
    difficulty: "hard",
    question: "When piping a readable stream into a writable stream in Node.js, how does the readable stream know when to pause emitting 'data' events to prevent memory issues?",
    options: ["The writable stream emits a 'backpressure' event, forcing the readable stream to buffer chunks internally.","The writable stream returns false from its write() method, causing the readable stream to pause until the 'drain' event.","The Event Loop detects the high memory usage in the heap and automatically throttles I/O operations.","The pipe() method internally overrides the readable's push() method to block the thread until the writable is ready."],
    correctAnswer: 1,
    explanation: "In Node.js, writable.write(chunk) returns false when the internal buffer exceeds the highWaterMark. The readable stream observes this and stops pushing data until the writable stream emits a 'drain' event, signaling it's ready for more data."
  },
  {
    id: "backend-2",
    role: "Backend Engineer",
    difficulty: "expert",
    question: "Which transaction isolation level is the LOWEST level required to prevent the 'Phantom Read' anomaly in a strictly ANSI SQL-92 compliant database?",
    options: ["READ COMMITTED","SNAPSHOT ISOLATION","REPEATABLE READ","SERIALIZABLE"],
    correctAnswer: 3,
    explanation: "According to the ANSI SQL-92 standard, SERIALIZABLE is the lowest (and only) isolation level that guarantees the prevention of Phantom Reads, even though some modern DBMS implementations prevent it at lower levels."
  },
  {
    id: "backend-3",
    role: "Backend Engineer",
    difficulty: "expert",
    question: "In PostgreSQL, what is the primary consequence of extensive update operations on a table without frequent or aggressive vacuuming?",
    options: ["Index fragmentation occurs rapidly due to B-tree rebalancing.","The transaction log (WAL) gets excessively large and blocks read queries.","Table bloat occurs because updated rows are written as new tuples, leaving dead tuples occupying space.","Write-ahead logging (WAL) becomes disabled to preserve disk I/O."],
    correctAnswer: 2,
    explanation: "PostgreSQL uses MVCC, meaning an UPDATE is essentially a DELETE and an INSERT. Without VACUUM to clean up the dead tuples (the old versions), the table grows in size, causing 'bloat'."
  },
  {
    id: "backend-4",
    role: "Backend Engineer",
    difficulty: "chaos",
    question: "In the Java G1 Garbage Collector, what is the primary purpose of the 'Remembered Sets' (RSet)?",
    options: ["To track object references into a region from other regions, allowing independent collection.","To maintain a list of objects that survived the previous minor GC.","To keep strong references to objects in the Eden space until explicit release.","To map virtual memory addresses for Humongous objects."],
    correctAnswer: 0,
    explanation: "RSets in G1GC track incoming references to a region. This allows the GC to collect a specific region independently without having to scan the entire heap for references pointing into that region."
  },
  {
    id: "backend-5",
    role: "Backend Engineer",
    difficulty: "hard",
    question: "Why does a single-threaded Redis instance perform exceptionally well under high concurrency despite lacking multi-threading for command execution?",
    options: ["It bypasses the kernel network stack using DPDK.","It uses an event-driven, non-blocking I/O multiplexing model to handle concurrent connections efficiently.","It spawns a lightweight fiber for every request to avoid OS thread context switching.","It strictly limits the maximum number of concurrent clients."],
    correctAnswer: 1,
    explanation: "Redis achieves high concurrency by utilizing I/O multiplexing (like epoll or kqueue) to manage thousands of active connections within a single event loop thread, effectively avoiding context switching and locking overhead."
  },
  {
    id: "backend-6",
    role: "Backend Engineer",
    difficulty: "hard",
    question: "In Apache Kafka, what is the primary mechanism that ensures messages within a specific topic are consumed in the exact order they were produced?",
    options: ["Setting the topic's 'strict.ordering' configuration to true.","Using exactly-once semantics (EOS) enabled by transactional producers.","Assigning a specific key to messages so they are always hashed and routed to the same partition.","Limiting the topic to a single consumer group."],
    correctAnswer: 2,
    explanation: "Kafka only guarantees ordering within a single partition. By producing messages with the same key, they are deterministically routed to the same partition, ensuring they are stored and consumed sequentially."
  },
  {
    id: "backend-7",
    role: "Backend Engineer",
    difficulty: "expert",
    question: "What is the primary difference between a 'Mutex' and a 'Semaphore' initialized with a count of 1 (a binary semaphore)?",
    options: ["A mutex has an ownership concept (only the acquiring thread can release it), whereas a semaphore can be released by any thread.","A mutex causes busy-waiting, whereas a semaphore puts the thread to sleep.","A semaphore can be acquired recursively without deadlocking, while a mutex cannot.","There is no functional difference; the distinction is purely historical."],
    correctAnswer: 0,
    explanation: "A mutex implies exclusive ownership, meaning the thread that locked the mutex must be the one to unlock it. A semaphore is fundamentally a signaling mechanism and does not enforce ownership; any thread can signal (release) it."
  },
  {
    id: "backend-8",
    role: "Backend Engineer",
    difficulty: "hard",
    question: "According to the CAP Theorem, when a network partition occurs, a distributed database must choose between which two properties?",
    options: ["Concurrency and Availability","Consistency and Partition Tolerance","Availability and Partition Tolerance","Consistency and Availability"],
    correctAnswer: 3,
    explanation: "The CAP theorem states that a distributed system can only provide two out of three guarantees: Consistency, Availability, and Partition Tolerance. In the presence of a network partition (P), the system must choose between Consistency (C) or Availability (A)."
  },
  {
    id: "backend-9",
    role: "Backend Engineer",
    difficulty: "expert",
    question: "Which feature of HTTP/2 directly solves the HTTP/1.1 'head-of-line blocking' problem at the application layer?",
    options: ["Server Push","Multiplexing multiple streams over a single TCP connection.","HPACK header compression","Binary framing"],
    correctAnswer: 1,
    explanation: "HTTP/2 multiplexing allows multiple requests and responses to be in flight simultaneously over a single TCP connection, preventing a slow response from blocking subsequent requests."
  },
  {
    id: "backend-10",
    role: "Backend Engineer",
    difficulty: "expert",
    question: "In Node.js, in which phase of the Event Loop are `setImmediate()` callbacks executed?",
    options: ["The check phase, which occurs immediately after the poll phase.","The timers phase, directly before setTimeout callbacks.","The microtask queue, which is evaluated after every single phase.","The pending callbacks phase."],
    correctAnswer: 0,
    explanation: "The `setImmediate()` function schedules callbacks to run specifically in the 'check' phase of the Node.js event loop, which immediately follows the 'poll' phase."
  },
  {
    id: "backend-11",
    role: "Backend Engineer",
    difficulty: "chaos",
    question: "In the Go runtime scheduler's M:N threading model, what happens when a Goroutine (G) makes a blocking system call?",
    options: ["The Go runtime converts it to a non-blocking asynchronous I/O operation.","All Goroutines on the same logical processor (P) are blocked.","The OS thread (M) is blocked, so the scheduler detaches the logical processor (P) and assigns it to a new M.","The Goroutine is moved to a global wait queue."],
    correctAnswer: 2,
    explanation: "When a Goroutine issues a blocking syscall, the OS thread (M) blocks. To prevent the other Goroutines attached to the logical processor (P) from starving, the Go scheduler detaches P from the blocked M and schedules it on a different M."
  },
  {
    id: "backend-12",
    role: "Backend Engineer",
    difficulty: "hard",
    question: "In RabbitMQ, what is the role of a 'Topic Exchange'?",
    options: ["Routes messages strictly to the single queue whose binding key exactly matches.","Routes messages to queues based on a wildcard match between the routing key and the queue binding pattern.","Broadcasts all incoming messages to every queue known to the exchange.","Distributes messages among multiple consumers using round-robin."],
    correctAnswer: 1,
    explanation: "A Topic Exchange routes messages to one or many queues by matching a routing key (like 'logs.error.auth') against a routing pattern specified by the queue's binding (like 'logs.error.*' or '#.auth')."
  },
  {
    id: "backend-13",
    role: "Backend Engineer",
    difficulty: "expert",
    question: "Why might a B-Tree index become less effective, or even be ignored by the query planner, for a column with very low cardinality (e.g., a boolean 'is_active' flag)?",
    options: ["B-Trees cannot store boolean values or NULLs.","Low cardinality causes B-Tree depth to exceed maximum allowed levels.","The query planner calculates that a sequential scan is cheaper than navigating the index and performing random heap lookups for a large percentage of rows.","Updates to low cardinality columns cause frequent page splits."],
    correctAnswer: 2,
    explanation: "If a query fetches a large percentage of table rows (which is common for low cardinality columns), using an index results in costly random I/O heap fetches. The query planner opts for a faster sequential scan instead."
  },
  {
    id: "backend-14",
    role: "Backend Engineer",
    difficulty: "chaos",
    question: "What is the primary purpose of the `SO_REUSEPORT` socket option in Linux network programming?",
    options: ["It forcefully binds a socket to a port in the TIME_WAIT state.","It enables a TCP socket to transition into a UDP socket.","It ignores the ephemeral port range limit.","It allows multiple sockets to bind to the same port, enabling the kernel to load-balance incoming connections."],
    correctAnswer: 3,
    explanation: "Introduced in Linux 3.9, SO_REUSEPORT allows multiple processes or threads to bind to the exact same port and IP. The kernel evenly distributes incoming TCP connections and UDP datagrams across all listening sockets."
  },
  {
    id: "backend-15",
    role: "Backend Engineer",
    difficulty: "expert",
    question: "In a distributed caching system using Consistent Hashing, what is the primary advantage of adding 'virtual nodes'?",
    options: ["It significantly improves uniform distribution of keys, especially with heterogeneous node capacities.","It prevents network partitions by creating redundant logical paths.","It allows a single physical machine to participate in multiple independent hash rings.","It completely eliminates the need to migrate any keys when a new node is added."],
    correctAnswer: 0,
    explanation: "Virtual nodes map a single physical server to multiple points on the hash ring. This mitigates uneven key distribution and allows operators to adjust the weight of physical nodes based on their hardware capacity."
  },
  {
    id: "backend-16",
    role: "Backend Engineer",
    difficulty: "hard",
    question: "Which cache invalidation strategy writes data to the cache and the backing database simultaneously, ensuring consistency but introducing higher write latency?",
    options: ["Write-Around","Write-Back","Write-Through","Read-Through"],
    correctAnswer: 2,
    explanation: "The Write-Through strategy updates both the cache and the database in a single transaction. While this guarantees data consistency, it suffers from higher latency due to the double write operation."
  },
  {
    id: "backend-17",
    role: "Backend Engineer",
    difficulty: "expert",
    question: "In the OAuth 2.0 Authorization Code flow, why is the 'state' parameter crucial?",
    options: ["It stores the user's session identifier to skip the login prompt.","It protects the client against Cross-Site Request Forgery (CSRF) attacks.","It dictates the specific scopes requested.","It acts as a cryptographic nonce to prevent replay attacks on the token endpoint."],
    correctAnswer: 1,
    explanation: "The 'state' parameter is an opaque value generated by the client to maintain state between the request and callback. Checking this value upon redirection ensures the authorization response matches the client's original request, preventing CSRF."
  },
  {
    id: "backend-18",
    role: "Backend Engineer",
    difficulty: "chaos",
    question: "Which Linux namespace is responsible for providing a container with its own isolated network stack (interfaces, routing tables, iptables)?",
    options: ["Network namespace (net)","Mount namespace (mnt)","Inter-Process Communication namespace (ipc)","UNIX Time-Sharing namespace (uts)"],
    correctAnswer: 0,
    explanation: "The Linux 'net' (network) namespace isolates the network controllers, system resources associated with networking, firewall rules, and routing tables, which allows containers to have their own IP addresses."
  },
  {
    id: "backend-19",
    role: "Backend Engineer",
    difficulty: "hard",
    question: "What is the most common solution to the 'N+1 Query Problem' frequently encountered in deeply nested GraphQL resolvers?",
    options: ["Forcing clients to flatten queries.","Enabling HTTP caching via ETags.","Using GraphQL Subscriptions.","Using a DataLoader pattern to batch and cache database queries into a single bulk request."],
    correctAnswer: 3,
    explanation: "The DataLoader pattern collects multiple singular fetch requests triggered by GraphQL resolvers within a single tick of the event loop and batches them into one SQL 'IN' query, drastically reducing database load."
  },
  {
    id: "backend-20",
    role: "Backend Engineer",
    difficulty: "hard",
    question: "Which DNS record type is specifically used to alias one hostname to another hostname?",
    options: ["A","CNAME","PTR","TXT"],
    correctAnswer: 1,
    explanation: "A Canonical Name (CNAME) record maps an alias name to a true or canonical domain name. For example, 'www.example.com' might be a CNAME pointing to 'example.com'."
  },
  {
    id: "backend-21",
    role: "Backend Engineer",
    difficulty: "expert",
    question: "In a microservices architecture, what is the primary purpose of the 'Saga' pattern?",
    options: ["To manage long-lived distributed transactions via local transactions and compensating actions.","To route incoming requests via an API Gateway.","To synchronize state using Raft.","To pass user identity using signed JWTs."],
    correctAnswer: 0,
    explanation: "The Saga pattern maintains data consistency across microservices without distributed ACID locks. It achieves this by executing a sequence of local transactions, and if one fails, it triggers 'compensating transactions' to undo the previous steps."
  },
  {
    id: "backend-22",
    role: "Backend Engineer",
    difficulty: "expert",
    question: "During a standard TLS 1.2 handshake, how is the 'Premaster Secret' securely transmitted from the client to the server?",
    options: ["It is hashed using SHA-256 and verified.","It is negotiated openly in plaintext.","It is encrypted by the client using the server's public key.","It is encrypted by the server using a symmetric key."],
    correctAnswer: 2,
    explanation: "In an RSA key exchange (standard in TLS 1.2 and earlier), the client generates a random Premaster Secret, encrypts it using the public key found in the server's X.509 certificate, and sends it to the server."
  },
  {
    id: "backend-23",
    role: "Backend Engineer",
    difficulty: "chaos",
    question: "What is an 'Intent Lock' in the context of relational database concurrency control?",
    options: ["A pessimistic lock applied after a timeout.","A lock placed on a higher-level resource to indicate intent to acquire lower-level locks.","A lock on an index page to prevent phantom reads.","A spinlock protecting the buffer pool."],
    correctAnswer: 1,
    explanation: "Intent locks (like Intent Shared 'IS' or Intent Exclusive 'IX') are placed on higher-level hierarchy items (e.g., a table) to signal that a transaction plans to place actual shared or exclusive locks on lower-level resources (e.g., rows), preventing conflicting table-level operations."
  },
  {
    id: "backend-24",
    role: "Backend Engineer",
    difficulty: "hard",
    question: "In Elasticsearch, what is the fundamental data structure used by Lucene to enable extremely fast full-text searches?",
    options: ["Inverted Index","B+ Tree","Bloom Filter","LSM Tree"],
    correctAnswer: 0,
    explanation: "Lucene uses an Inverted Index, which tokenizes text into distinct terms and maps each term to a list of documents containing it. This makes keyword lookups blazing fast compared to scanning the documents directly."
  },
  {
    id: "backend-25",
    role: "Backend Engineer",
    difficulty: "chaos",
    question: "When designing a highly available rate limiter (e.g., 100 req/min) distributed across multiple regions, which algorithm paired with which data store provides the best balance of exactness and low latency without heavy lock contention?",
    options: ["Sliding Window Log with SERIALIZABLE isolation.","Token Bucket algorithm using Redis with Lua scripts for atomicity.","Fixed Window Counter using eventually consistent Cassandra.","Leaky Bucket using in-memory local cache on each gateway."],
    correctAnswer: 1,
    explanation: "Using Redis with Lua scripts allows atomic fetch-and-decrement/increment operations without explicit locking, making the Token Bucket algorithm extremely efficient, precise, and easily scalable across multiple gateways in a distributed system."
  },
  {
    id: "cloud-1",
    role: "Cloud Architect",
    difficulty: "expert",
    question: "In an AWS Transit Gateway setup, you have multiple VPCs attached. You notice that traffic from VPC-A can reach VPC-B, but return traffic drops. The TGW route tables show proper associations and propagations. What is the most likely cause of this asymmetric routing issue?",
    options: ["The TGW attachment subnet in VPC-B does not have a return route pointing to the TGW in its subnet route table.","VPC-A has an overlapping CIDR block with VPC-B, causing a blackhole route in the TGW.","The Security Group on the TGW attachment ENI in VPC-B is blocking the return traffic.","Transit Gateway does not support stateful firewall inspection natively, causing asymmetric flows to be dropped by the VPC-B NAT Gateway."],
    correctAnswer: 0,
    explanation: "While TGW manages routing between attachments, the VPC's own route tables (specifically those associated with the subnets containing the workloads and the TGW attachment subnets) must have routes pointing back to the TGW for the return traffic. TGW attachments do not have Security Groups themselves."
  },
  {
    id: "cloud-2",
    role: "Cloud Architect",
    difficulty: "chaos",
    question: "Google Cloud Spanner relies on TrueTime to achieve external consistency. If the uncertainty window (ε) for TrueTime suddenly spikes across the fleet due to GPS/atomic clock sync issues, how does Spanner maintain strict serializability?",
    options: ["It falls back to a Paxos-based logical clock, temporarily disabling external consistency.","It rejects all new write transactions until the uncertainty window drops below the configured maximum threshold.","Read-write transactions are forced to wait longer (commit wait) until the uncertainty window passes before returning success.","It allows writes to proceed immediately but marks them as 'stale' until the next synchronized timestamp is agreed upon."],
    correctAnswer: 2,
    explanation: "Spanner guarantees external consistency by enforcing a 'commit wait'. A transaction must wait until the absolute time is guaranteed to have passed the transaction's commit timestamp. If the TrueTime uncertainty window (ε) increases, the wait time simply increases, ensuring no subsequent transaction can receive an earlier timestamp."
  },
  {
    id: "cloud-3",
    role: "Cloud Architect",
    difficulty: "hard",
    question: "You are migrating an Azure AD Connect environment. Which of the following authentication methods allows users to sign in to both on-premises and cloud applications using the same passwords, but authenticates the users directly against the on-premises Active Directory in real-time, without storing password hashes in the cloud?",
    options: ["Password Hash Synchronization (PHS) with Seamless SSO","Pass-through Authentication (PTA)","Active Directory Federation Services (AD FS)","Azure AD Domain Services (Azure AD DS)"],
    correctAnswer: 1,
    explanation: "Pass-through Authentication (PTA) allows users to sign in using their on-premises passwords by validating them directly against on-premises Active Directory via a lightweight agent, without requiring a complex federation setup like AD FS or storing hashes in Azure AD."
  },
  {
    id: "cloud-4",
    role: "Cloud Architect",
    difficulty: "expert",
    question: "An enterprise relies heavily on AWS Savings Plans. They currently hold a Compute Savings Plan covering $100/hour. They launch new EC2 instances, Fargate tasks, and Lambda functions. How is the Savings Plan discount applied across these different compute services?",
    options: ["It applies to all eligible usage chronologically as it occurs in the billing hour.","It applies to the highest percentage discount usage first, regardless of the service.","It prioritizes EC2 instances first, then Fargate, and finally Lambda.","It applies only to the specific instance families designated when the plan was purchased."],
    correctAnswer: 1,
    explanation: "AWS applies Compute Savings Plans to the usage that provides the largest percentage discount first, maximizing the customer's savings across all eligible services (EC2, Fargate, Lambda) within the billing hour."
  },
  {
    id: "cloud-5",
    role: "Cloud Architect",
    difficulty: "hard",
    question: "You are establishing a highly available AWS Site-to-Site VPN with an on-premises data center using BGP. You have two customer gateway devices. To ensure AWS always sends traffic to CGW-1 unless it's down, how should you configure BGP?",
    options: ["Configure CGW-1 to advertise a lower Multi-Exit Discriminator (MED) value to AWS.","Configure CGW-2 to prepend its AS path multiple times when advertising routes to AWS.","Configure AWS Transit Gateway to use a higher Local Preference for the VPN attachment of CGW-1.","Set a lower administrative distance on the AWS Virtual Private Gateway for routes received from CGW-1."],
    correctAnswer: 1,
    explanation: "To influence the return path from AWS to on-premises via BGP, the standard approach is to use AS Path Prepending on the secondary (backup) connection. AWS will prefer the route with the shorter AS path. AWS does not use MED to prefer one CGW over another in this context if they are on different connections."
  },
  {
    id: "cloud-6",
    role: "Cloud Architect",
    difficulty: "chaos",
    question: "In a multi-tenant Kubernetes cluster (EKS), you notice intermittent DNS resolution delays (up to 5 seconds) for external hostnames in Alpine Linux-based pods. What is the root cause and the most effective architectural fix?",
    options: ["Root cause: CoreDNS rate limiting. Fix: Deploy NodeLocal DNSCache.","Root cause: Alpine's musl libc handles IPv4/IPv6 parallel queries poorly with conntrack race conditions. Fix: Deploy NodeLocal DNSCache or switch to glibc.","Root cause: ndots:5 configuration causing too many search domain queries. Fix: Reduce ndots to 1 in the pod's dnsConfig.","Root cause: EKS Control Plane ENI exhaustion. Fix: Increase max-pods on the worker nodes."],
    correctAnswer: 1,
    explanation: "Alpine Linux uses musl libc, which historically sends A and AAAA DNS queries concurrently from the same socket. This causes a race condition in the Linux kernel's netfilter conntrack module (specifically SNAT on UDP), leading to dropped packets and exactly 5-second timeouts. NodeLocal DNSCache mitigates this by changing the connection tracking behavior."
  },
  {
    id: "cloud-7",
    role: "Cloud Architect",
    difficulty: "expert",
    question: "A developer claims that immediately after uploading a new object to an existing AWS S3 bucket, a ListObjectsV2 API call might not show the object due to eventual consistency. Is this correct?",
    options: ["Yes, S3 is only strongly consistent for read-after-write of new objects, but list operations remain eventually consistent.","No, Amazon S3 provides strong read-after-write consistency for all requests, including list operations.","Yes, but only if the bucket has versioning enabled; otherwise, list operations are strongly consistent.","No, but strong consistency is only guaranteed if the list operation includes a specific prefix that matches the new object."],
    correctAnswer: 1,
    explanation: "As of late 2020, Amazon S3 provides strong read-after-write consistency for PUTs and DELETEs of objects, as well as for List operations, removing the eventual consistency caveat that used to exist."
  },
  {
    id: "cloud-8",
    role: "Cloud Architect",
    difficulty: "hard",
    question: "Your DynamoDB table uses On-Demand capacity. A marketing campaign causes a massive, sudden spike in read traffic targeted at exactly one partition key. The spike exceeds 3000 read capacity units per second. What happens?",
    options: ["The table scales automatically, and all requests are served successfully because it is in On-Demand mode.","DynamoDB immediately splits the partition to handle the load, causing a brief pause (few milliseconds) in serving requests.","Requests exceeding 3000 RCUs/sec to a single partition will be throttled, regardless of the table being in On-Demand mode.","The read traffic is automatically distributed to Global Secondary Indexes to alleviate partition heat."],
    correctAnswer: 2,
    explanation: "Even in On-Demand mode, DynamoDB has hard limits per partition. A single partition can support a maximum of 3000 RCUs or 1000 WCUs per second. Traffic concentrated on a single partition key (a 'hot partition') exceeding these limits will result in ProvisionedThroughputExceededException throttling."
  },
  {
    id: "cloud-9",
    role: "Cloud Architect",
    difficulty: "expert",
    question: "You are designing a globally distributed application using Azure Cosmos DB. You need to ensure that reads always honor the order in which writes were committed, and clients never see out-of-order writes, but you can tolerate some lag to improve availability and latency over Strong consistency. Which consistency level should you choose?",
    options: ["Session","Bounded Staleness","Consistent Prefix","Eventual"],
    correctAnswer: 2,
    explanation: "Consistent Prefix guarantees that reads never see out-of-order writes. If writes were performed in the order A, B, C, a client sees either A, A-B, or A-B-C, but never out of order like A-C. Bounded Staleness also provides this, but Consistent Prefix is the exact definition of honoring write order without the strict time/version bounds of Bounded Staleness."
  },
  {
    id: "cloud-10",
    role: "Cloud Architect",
    difficulty: "chaos",
    question: "In a Google Cloud Platform VPC, you have instances in us-central1 and europe-west1 communicating via internal IP addresses. How is this traffic routed and billed?",
    options: ["It routes over the public internet via VPN; billed as standard internet egress.","It routes over Google's global backbone; billed as cross-region inter-zone egress.","It routes over Google's global backbone; intra-VPC traffic is free regardless of region.","It requires a VPC peering connection between the regional subnets; billed per GB of data processed by peering."],
    correctAnswer: 1,
    explanation: "GCP VPCs are global resources, so instances in different regions within the same VPC can communicate over Google's private backbone using internal IPs without VPN or Peering. However, cross-region traffic within a VPC incurs egress charges."
  },
  {
    id: "cloud-11",
    role: "Cloud Architect",
    difficulty: "expert",
    question: "An AWS IAM User is in an Organization with an SCP that explicitly denies 's3:DeleteBucket'. The User's Identity Policy explicitly allows 's3:*'. A specific S3 bucket has a Resource Policy explicitly allowing 's3:*' for this User. Furthermore, the User has a Permissions Boundary that explicitly allows 's3:*'. Can the user delete the S3 bucket?",
    options: ["Yes, the Resource Policy overrides the SCP.","Yes, the combination of Identity Policy and Permissions Boundary overrides the SCP.","No, an explicit Deny in an SCP overrides any Allow across all policy types.","No, because the Permissions Boundary must explicitly allow the action, but it doesn't override the Resource Policy."],
    correctAnswer: 2,
    explanation: "In AWS IAM evaluation logic, an explicit Deny in any applicable policy (SCP, Identity Policy, Resource Policy, Permissions Boundary) always trumps any explicit Allow. Since the SCP has an explicit Deny, the action is denied."
  },
  {
    id: "cloud-12",
    role: "Cloud Architect",
    difficulty: "hard",
    question: "When managing a multi-region AWS infrastructure with Terraform, how do you provision resources in multiple regions within the same Terraform workspace/module?",
    options: ["Define a single AWS provider and use the 'region' argument dynamically within the resource block.","Declare multiple AWS provider blocks with different 'alias' attributes, and reference the specific provider alias in the resource block.","Use the 'terraform workspace' command to switch regions and apply the configuration sequentially.","Terraform does not support multi-region deployments in a single state file; you must use Terragrunt or separate modules."],
    correctAnswer: 1,
    explanation: "Terraform handles multiple regions (or multiple accounts) within the same configuration by defining multiple provider blocks, distinguishing them using the 'alias' attribute. Resources then specify which provider to use via the 'provider = aws.alias_name' meta-argument."
  },
  {
    id: "cloud-13",
    role: "Cloud Architect",
    difficulty: "expert",
    question: "You need to point the apex of your domain (e.g., example.com) to an AWS Application Load Balancer. Why must you use an AWS Route 53 Alias record instead of a standard CNAME record?",
    options: ["CNAME records cannot be used for apex (root) domains according to DNS RFCs, whereas Route 53 Alias records resolve to IP addresses natively.","Alias records propagate faster across global edge locations than CNAME records.","CNAME records incur a higher query cost in Route 53 compared to Alias records.","Alias records provide automatic failover to alternative regions, which CNAMEs do not support."],
    correctAnswer: 0,
    explanation: "DNS protocol (RFC 1034) prohibits the creation of CNAME records at the zone apex (root domain) because a CNAME cannot coexist with other records (like SOA and NS) that are required at the apex. Route 53 Alias records solve this by resolving the target internally and returning A or AAAA records."
  },
  {
    id: "cloud-14",
    role: "Cloud Architect",
    difficulty: "chaos",
    question: "Historically, attaching an AWS Lambda function to a VPC caused severe cold starts due to ENI creation. AWS resolved this using Hyperplane ENIs. With Hyperplane, when is the ENI actually created?",
    options: ["Synchronously upon the first invocation of the Lambda function.","Asynchronously when the Lambda function is created or its VPC configuration is updated.","Dynamically whenever a concurrent execution threshold is breached.","It is never created in the customer VPC; traffic is routed over AWS PrivateLink directly."],
    correctAnswer: 1,
    explanation: "With the Hyperplane ENI architecture, ENI creation is decoupled from function invocation. The ENI is created asynchronously when you create or update the Lambda function with VPC settings. Subsequent invocations simply share the existing Hyperplane ENI, eliminating the ENI creation delay during cold starts."
  },
  {
    id: "cloud-15",
    role: "Cloud Architect",
    difficulty: "hard",
    question: "In Google Cloud Run, you have an application that needs to perform a 10-second asynchronous cleanup task after returning the HTTP response to the client. What is the expected behavior if you rely on background threads without specific configuration?",
    options: ["The background thread completes normally, billed exactly for the CPU time used.","The container is immediately terminated after the HTTP response is sent.","CPU is heavily throttled (near zero) immediately after the response is sent, potentially causing the background task to hang or fail.","Cloud Run detects the active thread and automatically keeps the CPU allocated for up to 15 minutes."],
    correctAnswer: 2,
    explanation: "By default, Cloud Run allocates CPU only during request processing. Once the response is sent, the CPU is throttled to near zero. Background threads will barely execute. To support this, you must explicitly enable the 'CPU always allocated' setting for the Cloud Run service."
  },
  {
    id: "cloud-16",
    role: "Cloud Architect",
    difficulty: "expert",
    question: "Comparing Amazon RDS Multi-AZ deployments with Amazon Aurora high availability: How does the replication mechanism differ fundamentally between a standard RDS MySQL Multi-AZ instance and an Aurora MySQL cluster?",
    options: ["RDS uses asynchronous binlog replication; Aurora uses synchronous binlog replication.","RDS replicates the entire EBS volume at the block storage level synchronously; Aurora replicates only the database redo logs to its distributed storage layer.","RDS relies on application-level multi-write capability; Aurora relies on storage-level replication.","There is no difference; both use synchronous block-level storage replication across Availability Zones."],
    correctAnswer: 1,
    explanation: "Standard RDS Multi-AZ uses synchronous block-level replication of the EBS volume to a standby instance. Amazon Aurora replaces the traditional storage layer with a purpose-built, distributed storage engine that replicates only the redo logs across 6 storage nodes in 3 AZs, drastically reducing network I/O."
  },
  {
    id: "cloud-17",
    role: "Cloud Architect",
    difficulty: "chaos",
    question: "You are designing an Azure network architecture requiring high-speed connectivity to Azure paired with global transit. You decide to use Azure ExpressRoute Premium. What specific capability does the Premium SKU provide over the Standard SKU?",
    options: ["It provides MACsec encryption over the physical link.","It allows the ExpressRoute circuit to access all Azure regions globally, not just regions within the same geopolitical boundary.","It increases the maximum bandwidth limit from 10 Gbps to 100 Gbps (ExpressRoute Direct).","It includes a built-in SLA of 99.99% compared to 99.95% for Standard."],
    correctAnswer: 1,
    explanation: "ExpressRoute Standard limits access to Azure regions within the same geopolitical boundary (e.g., North America). The Premium SKU enables global connectivity, allowing a circuit connected in New York to access resources in Azure regions in Europe or Asia without hair-pinning traffic."
  },
  {
    id: "cloud-18",
    role: "Cloud Architect",
    difficulty: "hard",
    question: "In an AWS CloudFront distribution, you configure the cache behavior to forward all query strings to the origin. How does this specific configuration impact the CloudFront edge cache?",
    options: ["It has no impact; CloudFront strips query strings before caching the object.","It drastically reduces the cache hit ratio, as CloudFront caches separate versions of the object for every unique combination of query string parameters.","It forces CloudFront to use POST requests to the origin instead of GET requests.","It enables Lambda@Edge to modify the query strings before they reach the cache."],
    correctAnswer: 1,
    explanation: "When CloudFront is configured to forward all query strings, it uses the exact query string as part of the cache key. Thus, `/image.jpg?v=1` and `/image.jpg?v=2` are cached as separate objects, which can severely fragment the cache and reduce the cache hit ratio."
  },
  {
    id: "cloud-19",
    role: "Cloud Architect",
    difficulty: "expert",
    question: "When implementing IAM Roles for Service Accounts (IRSA) in Amazon EKS, how does the pod securely acquire the AWS credentials?",
    options: ["The EKS Control Plane injects static access keys into the pod's environment variables upon startup.","The pod queries the EC2 Instance Metadata Service (IMDS), which is intercepted by an EKS daemonset that proxies the request.","The pod receives an OIDC-federated web identity token file mounted via a projected service account token volume, which the AWS SDK uses to assume the IAM role.","A Kubernetes mutating admission webhook directly modifies the container image to include the IAM role trust policy."],
    correctAnswer: 2,
    explanation: "IRSA leverages an OpenID Connect (OIDC) identity provider. Kubernetes issues a signed JWT token (projected volume) to the pod. The AWS SDKs are configured to read this token and use the `sts:AssumeRoleWithWebIdentity` API to exchange the Kubernetes token for temporary AWS credentials."
  },
  {
    id: "cloud-20",
    role: "Cloud Architect",
    difficulty: "chaos",
    question: "In an Apache Kafka cluster (like Amazon MSK), you have a topic with 12 partitions and a consumer group with 15 consumers. What is the partition assignment state?",
    options: ["All 15 consumers receive messages; 3 consumers read from multiple partitions.","12 consumers read from one partition each; 3 consumers sit idle and consume nothing.","Kafka dynamically reassigns partitions across all 15 consumers on a per-message basis (Round Robin).","The consumer group will crash with a RebalanceInProgressException."],
    correctAnswer: 1,
    explanation: "In Kafka, a single partition can only be consumed by one consumer within the same consumer group at any given time. If there are more consumers than partitions, the excess consumers will remain idle."
  },
  {
    id: "cloud-21",
    role: "Cloud Architect",
    difficulty: "hard",
    question: "You need to load balance HTTP/HTTPS traffic across multiple Azure regions with SSL termination, path-based routing, and WAF capabilities at the global edge. Which Azure service is the most appropriate?",
    options: ["Azure Load Balancer","Azure Application Gateway","Azure Traffic Manager","Azure Front Door"],
    correctAnswer: 3,
    explanation: "Azure Front Door is a global Layer 7 load balancer that operates at Microsoft's edge network using Anycast. It provides SSL termination, path-based routing, and WAF globally. Application Gateway is a regional Layer 7 load balancer. Traffic Manager is a DNS-based global router (no SSL termination/Layer 7 routing). Load Balancer is Layer 4."
  },
  {
    id: "cloud-22",
    role: "Cloud Architect",
    difficulty: "expert",
    question: "You configure a Google Cloud Storage bucket as a Dual-region bucket (e.g., nam4: us-east1 and us-central1). How does GCP handle a complete loss of the us-east1 region?",
    options: ["Read traffic is automatically routed to us-central1, but writes are disabled until us-east1 recovers.","Manual failover is required via the GCP Console or API to update the bucket's active region.","Traffic is automatically transparently routed to us-central1 for both reads and writes with zero RPO for objects already asynchronously replicated.","The bucket becomes read-only, and you must restore from an automatic snapshot to a new bucket in a different region."],
    correctAnswer: 2,
    explanation: "GCS Dual-region buckets provide active-active highly available storage. If one region is lost, GCS transparently routes all requests (read and write) to the surviving region. Replication is asynchronous, but for objects already replicated, RPO is zero. RTO is zero as the failover is automatic."
  },
  {
    id: "cloud-23",
    role: "Cloud Architect",
    difficulty: "chaos",
    question: "In a high-throughput microservices architecture using AWS KMS Envelope Encryption with the AWS Encryption SDK, you implement Data Key Caching. What is a critical security trade-off you must accept when tuning the `MaxMessages` and `MaxAge` cache parameters?",
    options: ["Larger cache limits mean the KMS key policy cannot be rotated.","Increasing cache parameters increases the blast radius if the cache is compromised, as more data is encrypted under the same data key.","Data Key Caching forces the use of symmetric CMKs, preventing the use of asymmetric signing keys.","High cache ages result in increased latency due to frequent KMS API throttling."],
    correctAnswer: 1,
    explanation: "Data Key Caching reuses the same plaintext data key to encrypt multiple messages locally to save KMS API calls and latency. The trade-off is that if the cached data key is compromised, the attacker can decrypt all messages encrypted with that specific key (increased blast radius). It violates the strict one-key-per-message ideal."
  },
  {
    id: "cloud-24",
    role: "Cloud Architect",
    difficulty: "hard",
    question: "When running an application in an AWS ECS Fargate task, the application needs to programmatically determine the Task ID and the cluster it belongs to. How should the application retrieve this metadata?",
    options: ["By querying the EC2 Instance Metadata Service (IMDSv2) at 169.254.169.254.","By reading the ECS_CONTAINER_METADATA_URI_V4 environment variable and making an HTTP GET request to that endpoint.","By parsing the /etc/ecs/ecs.config file mounted inside the container.","By querying the AWS Systems Manager Parameter Store."],
    correctAnswer: 1,
    explanation: "In Fargate, tasks do not run on EC2 instances managed by the customer, so IMDS is not applicable in the same way. ECS injects the `ECS_CONTAINER_METADATA_URI_V4` environment variable, which points to a local endpoint the container can query to get comprehensive metadata about the task, including cluster and task ARN."
  },
  {
    id: "cloud-25",
    role: "Cloud Architect",
    difficulty: "expert",
    question: "According to the CAP Theorem, when designing an active-active multi-region database architecture across AWS (us-east-1 and eu-west-1), what fundamental choice must a Cloud Architect make during a network partition (split-brain)?",
    options: ["Choose between high Availability (accepting writes in both regions, risking inconsistency) and strong Consistency (halting writes in one or both regions until the partition heals).","Choose between Partition Tolerance and Latency.","Choose between cross-region Read Replicas and Multi-AZ deployments.","Choose between synchronous replication for high Availability and asynchronous replication for strong Consistency."],
    correctAnswer: 0,
    explanation: "CAP theorem states that in the presence of a network Partition (P) - which must be assumed in distributed multi-region systems - a system must choose between Consistency (C) and Availability (A). Choosing Availability means allowing writes on both sides of the split (leading to conflicts/inconsistency). Choosing Consistency means stopping writes on at least one side to prevent divergence."
  },
  {
    id: "data-1",
    role: "Data Engineer",
    difficulty: "expert",
    question: "In Spark 3.0+, when Adaptive Query Execution (AQE) optimizes a skewed join, how does it handle the skewed partition under the hood?",
    options: ["It automatically broadcasts the skewed partition to all executors, bypassing the shuffle entirely.","It splits the skewed partition into smaller sub-partitions and duplicates the corresponding data from the other side of the join.","It triggers a fallback to a Cartesian join if the skew exceeds the configured spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes.","It applies a dynamic salting technique by appending a random integer to the skewed keys before the shuffle."],
    correctAnswer: 1,
    explanation: "AQE handles skew joins by detecting partitions that are significantly larger than the median size. It then splits the skewed partition from table A into smaller sub-partitions, and replicates the corresponding matching partition from table B so that the join can be processed in parallel by multiple tasks without OOM."
  },
  {
    id: "data-2",
    role: "Data Engineer",
    difficulty: "chaos",
    question: "In Kafka exactly-once semantics (EOS), if a producer crashes after sending the transactional payload but before sending the Commit or Abort marker, what prevents consumers with `isolation.level=read_committed` from reading these messages forever?",
    options: ["The consumer automatically times out uncommitted transactions based on the `transaction.timeout.ms` configuration.","The Transaction Coordinator detects the producer timeout and writes an Abort marker to the transaction log, which is then replicated to the partition.","The leader broker of the partition proactively deletes uncommitted messages during log compaction.","The ZooKeeper/KRaft controller revokes the producer's PID, causing the consumer to ignore the orphan records."],
    correctAnswer: 1,
    explanation: "When a producer initiates a transaction, it registers with the Transaction Coordinator. If it crashes, the Coordinator waits for the transaction timeout. Upon timeout, it rolls back the transaction by writing an Abort marker to the partition, allowing read_committed consumers to safely skip the aborted messages."
  },
  {
    id: "data-3",
    role: "Data Engineer",
    difficulty: "hard",
    question: "In Apache Airflow, if a task is configured with `depends_on_past=True` and `wait_for_downstream=False`, what happens if the previous day's task instance was manually marked as 'skipped'?",
    options: ["The current task instance will execute normally because 'skipped' is considered a success state for dependency resolution.","The current task instance will remain in the 'no_status' state until the previous task is cleared and succeeds.","The current task instance will also be marked as 'skipped' due to state propagation.","The current task instance will fail immediately with a DependencyNotMet exception."],
    correctAnswer: 0,
    explanation: "In Airflow, `depends_on_past=True` checks if the previous schedule's task instance is successful or skipped. If it is skipped, the dependency is satisfied, and the current task will run normally."
  },
  {
    id: "data-4",
    role: "Data Engineer",
    difficulty: "expert",
    question: "You are optimizing a massive Snowflake table. You define a clustering key, but notice the 'clustering depth' is extremely high. What does a high clustering depth indicate?",
    options: ["The data is highly compressed, resulting in deep micro-partitions.","There is a large amount of overlap in the clustering key ranges across many micro-partitions.","The clustering key has high cardinality, making it ideal for pruning.","The table has too many micro-partitions, exceeding the recommended limit per warehouse."],
    correctAnswer: 1,
    explanation: "Clustering depth in Snowflake measures the average number of overlapping micro-partitions for a given clustering key. A high depth means many micro-partitions contain overlapping value ranges, which reduces query performance because the engine must scan more partitions. Reclustering reduces this depth."
  },
  {
    id: "data-5",
    role: "Data Engineer",
    difficulty: "hard",
    question: "In Apache Flink, if a custom watermark generator sets the watermark exactly equal to the maximum observed event timestamp (maxTimestamp) with no delay, what is the most likely consequence for out-of-order events?",
    options: ["Out-of-order events will be buffered indefinitely until a later watermark arrives.","The job will throw a LateDataException and restart from the last checkpoint.","Out-of-order events will be considered late and dropped or sent to a side output, even if they are only a millisecond late.","Flink will automatically fall back to processing time to handle the late events."],
    correctAnswer: 2,
    explanation: "If the watermark is exactly the max observed timestamp, the event time clock advances immediately to that timestamp. Any event arriving later with an earlier timestamp is strictly less than the watermark, making it late. Late events are dropped unless a side output or allowed lateness is configured."
  },
  {
    id: "data-6",
    role: "Data Engineer",
    difficulty: "expert",
    question: "Under the hood, how does Spark's `coalesce(n)` differ fundamentally from `repartition(n)` when reducing the number of partitions?",
    options: ["Coalesce performs a full shuffle using a RoundRobinPartitioning scheme, whereas repartition uses HashPartitioning.","Coalesce avoids a full shuffle by safely merging existing partitions on the same executor, whereas repartition forces a full cross-node shuffle.","Coalesce reads data into driver memory before redistributing it, whereas repartition distributes data peer-to-peer.","Coalesce can increase or decrease partition count without a shuffle, but repartition only increases partition count."],
    correctAnswer: 1,
    explanation: "Coalesce minimizes data movement by combining adjacent partitions, avoiding a full network shuffle. This means upstream operations might be forced to execute with fewer tasks. Repartition forces a full shuffle, which balances data evenly but incurs network I/O."
  },
  {
    id: "data-7",
    role: "Data Engineer",
    difficulty: "expert",
    question: "What is the primary advantage of the `CooperativeStickyAssignor` over the standard `RangeAssignor` during a Kafka consumer group rebalance?",
    options: ["It allows consumers to continue processing their existing assigned partitions during the rebalance, avoiding a 'stop-the-world' pause.","It assigns partitions strictly by range across all topics, ensuring maximum sequential disk I/O on the brokers.","It forces the leader broker to handle all rebalance logic instead of the consumer group coordinator, reducing latency.","It automatically deletes uncommitted offsets for reassigned partitions to prevent duplicate processing."],
    correctAnswer: 0,
    explanation: "The CooperativeStickyAssignor uses cooperative rebalancing, which means consumers do not revoke all partitions when a rebalance starts. They only revoke partitions that need to be transferred to another consumer, allowing them to continue processing their retained partitions without a stop-the-world pause."
  },
  {
    id: "data-8",
    role: "Data Engineer",
    difficulty: "chaos",
    question: "In Delta Lake, how does `OPTIMIZE ... ZORDER BY (colA, colB)` internally structure the data compared to standard multi-column sorting (e.g., `ORDER BY colA, colB`)?",
    options: ["Z-Ordering hashes both columns into a single Bloom filter, whereas standard sorting creates separate indexes.","Z-Ordering maps multi-dimensional data into a single dimension by interleaving the bit representations of the values, preserving locality for both columns equally.","Z-Ordering physically partitions the Parquet files by colA and then colB, whereas standard sorting just sorts rows within existing files.","Z-Ordering sorts entirely by colA first, and only uses colB as a tie-breaker, exactly like a standard B-Tree index."],
    correctAnswer: 1,
    explanation: "Z-Ordering uses a space-filling curve technique that interleaves the bits of the specified columns to map multi-dimensional data onto a single dimension. This preserves data locality for both columns roughly equally, meaning queries filtering on either colA or colB will be highly efficient, unlike lexicographical sorting which heavily favors the first column."
  },
  {
    id: "data-9",
    role: "Data Engineer",
    difficulty: "hard",
    question: "What is a major risk of using default Airflow XComs (backed by the metadata database) to pass large Pandas DataFrames between tasks?",
    options: ["The worker node will immediately run out of memory when serializing the DataFrame to Pickle.","It can bloat the metadata database, causing the Airflow scheduler and webserver to slow down drastically or crash due to large query payloads.","XComs can only store string types, so the DataFrame will be silently corrupted during JSON serialization.","Downstream tasks will receive a shallow copy of the DataFrame, leading to race conditions."],
    correctAnswer: 1,
    explanation: "Default XComs store data directly in Airflow's backend database (e.g., Postgres or MySQL). Passing large objects like DataFrames bloats the database tables, leading to massive latency in scheduler heartbeat queries and web UI load times, eventually crashing the system."
  },
  {
    id: "data-10",
    role: "Data Engineer",
    difficulty: "expert",
    question: "In Snowflake, what is the difference between Time Travel and Fail-safe?",
    options: ["Time Travel is configurable up to 90 days and queryable by users; Fail-safe is a non-configurable 7-day period for disaster recovery only accessible by Snowflake support.","Time Travel allows recovering deleted tables, while Fail-safe only allows recovering dropped schemas.","Fail-safe is queried using the `AT (TIMESTAMP => ...)` syntax, while Time Travel requires cloning.","Time Travel uses zero-copy clones, whereas Fail-safe physically duplicates the data files to a secondary cloud region."],
    correctAnswer: 0,
    explanation: "Time Travel allows users to query, clone, and restore historical data (up to 90 days for Enterprise). Once the Time Travel period expires, data enters Fail-safe for 7 days. Fail-safe data cannot be queried or recovered by users; it requires opening a ticket with Snowflake support."
  },
  {
    id: "data-11",
    role: "Data Engineer",
    difficulty: "expert",
    question: "In Spark's Unified Memory Manager, how does the system handle contention between Execution memory (used for shuffles/joins) and Storage memory (used for caching)?",
    options: ["Storage memory has strict priority; Execution memory will immediately spill to disk if Storage memory is full.","They share a unified region. Execution memory can evict blocks from Storage memory if needed, but Storage memory cannot evict Execution memory.","They are strictly separated by a hard boundary defined by `spark.memory.storageFraction`, and neither can borrow from the other.","Storage memory can safely evict Execution memory blocks by forcing running tasks to restart with a smaller memory footprint."],
    correctAnswer: 1,
    explanation: "In Spark 1.6+, the Unified Memory Manager allows Execution and Storage to share a unified boundary. Execution memory can borrow space from Storage (and evict cached blocks if necessary). Storage can borrow from Execution if free, but it cannot evict Execution memory because that would kill running tasks."
  },
  {
    id: "data-12",
    role: "Data Engineer",
    difficulty: "expert",
    question: "When implementing an exactly-once sink in Flink using the TwoPhaseCommitSinkFunction, what happens during the 'pre-commit' phase?",
    options: ["The sink acknowledges the Flink checkpoint coordinator and permanently makes the data visible to downstream systems.","The sink flushes the current transaction's state to the external system but leaves the transaction uncommitted or in a pending state.","The sink stores the data strictly in RocksDB and waits for the job to restart before writing to the external system.","The sink reads the external system's transaction log to ensure no duplicate IDs exist before writing."],
    correctAnswer: 1,
    explanation: "In Flink's two-phase commit, during the pre-commit phase (triggered when taking a checkpoint snapshot), the sink flushes data to the external system in a pending transaction. The transaction is only fully committed (making data visible) in the 'commit' phase, which happens after all operators have successfully completed their checkpoints."
  },
  {
    id: "data-13",
    role: "Data Engineer",
    difficulty: "hard",
    question: "In a Kafka compacted topic, what is the purpose of sending a message with a valid key but a `null` payload?",
    options: ["It acts as a 'tombstone' marker, instructing the log cleaner to eventually delete all previous messages with that key.","It resets the offset of that specific key back to zero for all consumer groups.","It forcefully triggers an immediate log compaction cycle on the leader broker.","It indicates to the Schema Registry that the schema for this key has been deprecated."],
    correctAnswer: 0,
    explanation: "A message with a key and a null payload is called a tombstone. During log compaction, Kafka retains only the latest value for each key. When the log cleaner encounters a tombstone, it eventually removes the key and all its prior values entirely from the log after a configured retention period."
  },
  {
    id: "data-14",
    role: "Data Engineer",
    difficulty: "chaos",
    question: "In Delta Lake, if you run `VACUUM` with a retention period of 0 hours on a table being actively read by a long-running batch job, what is the most likely outcome?",
    options: ["The VACUUM command will silently skip deleting files that are currently locked by the batch job.","The batch job may fail with a FileNotFoundException because VACUUM will physically delete underlying Parquet files that the job was still planning to read.","The VACUUM command will successfully compact the Delta log, but the physical Parquet files will remain until the transaction ends.","Delta Lake will throw an error immediately preventing you from running VACUUM with 0 hours without disabling a safety flag."],
    correctAnswer: 1,
    explanation: "While Delta Lake forces you to disable the `spark.databricks.delta.retentionDurationCheck.enabled` flag to run a 0-hour vacuum, if you do so, VACUUM deletes all files not referenced in the latest transaction log. If a long-running job read an older log version and is trying to access those files, it will crash with a FileNotFoundException because the physical files are gone."
  },
  {
    id: "data-15",
    role: "Data Engineer",
    difficulty: "hard",
    question: "What is the primary limitation of Spark's Continuous Processing mode for Structured Streaming compared to Micro-batch mode?",
    options: ["It does not support exactly-once semantics under any circumstances.","It currently only supports map-like operations and does not support aggregations or complex joins.","It requires a dedicated ZooKeeper cluster to manage state checkpoints.","It forces the use of RDDs instead of the DataFrame/SQL API."],
    correctAnswer: 1,
    explanation: "Continuous Processing mode achieves sub-millisecond latency by using long-running tasks that continuously process data. However, it only supports map-like operations (projections, selections). It does not support shuffle-based operations like aggregations, groupBys, or complex joins."
  },
  {
    id: "data-16",
    role: "Data Engineer",
    difficulty: "expert",
    question: "In Trino (formerly PrestoSQL), how does Dynamic Filtering optimize join queries between a large fact table and a small dimension table?",
    options: ["It broadcasts the entire fact table to all worker nodes to avoid shuffle overhead.","It collects the filtered keys from the dimension table during execution and pushes them down to the fact table scan (e.g., as a Bloom filter), reducing the amount of data read from storage.","It dynamically rewrites the query into a materialized view and queries the view instead.","It converts the join into a series of highly parallel cross joins and filters the results post-shuffle."],
    correctAnswer: 1,
    explanation: "Dynamic Filtering in Trino works by scanning the build side of a join (the smaller dimension table), creating a filter (like a Bloom filter or Min/Max range), and pushing this filter down to the probe side (the large fact table) dynamically at runtime. This heavily reduces network I/O and storage reads."
  },
  {
    id: "data-17",
    role: "Data Engineer",
    difficulty: "hard",
    question: "In Apache Airflow, what happens when a sensor is configured with `mode='poke'` and takes 3 hours to succeed, compared to `mode='reschedule'`?",
    options: ["Poke mode occupies a worker slot continuously for the entire 3 hours, whereas reschedule mode frees the worker slot between checks.","Poke mode writes metadata to the database every second, whereas reschedule mode only writes upon success.","Poke mode bypasses the Celery executor and runs directly on the scheduler, whereas reschedule runs on workers.","Poke mode ignores the `timeout` parameter, whereas reschedule strictly enforces it."],
    correctAnswer: 0,
    explanation: "In 'poke' mode, the sensor sleeps within the running task, occupying an Airflow worker slot the entire time. This can quickly lead to sensor deadlocks where all worker slots are taken by sleeping sensors. 'Reschedule' mode raises a special exception that frees the worker slot and tells the scheduler to queue the task again later."
  },
  {
    id: "data-18",
    role: "Data Engineer",
    difficulty: "chaos",
    question: "Which of the following operations is generally NOT supported when defining a Materialized View in Snowflake?",
    options: ["Filtering data using a WHERE clause.","Using complex joins across multiple tables.","Aggregating data using SUM or COUNT.","Projecting a subset of columns from the base table."],
    correctAnswer: 1,
    explanation: "Snowflake Materialized Views have strict limitations. One of the primary limitations is that they can only query a single base table. Joins across multiple tables, self-joins, and window functions are not supported in the definition of a Materialized View (unlike Dynamic Tables which do support joins)."
  },
  {
    id: "data-19",
    role: "Data Engineer",
    difficulty: "expert",
    question: "In Amazon Redshift, if a table is distributed using `DISTSTYLE ALL`, what is the physical storage consequence?",
    options: ["A copy of the entire table is placed on the leader node to accelerate metadata queries.","The table is evenly distributed across all slices using a round-robin algorithm.","A complete copy of the entire table is stored on the first slice of every compute node.","The data is partitioned globally using a distributed hash table on S3."],
    correctAnswer: 2,
    explanation: "DISTSTYLE ALL places a complete copy of the entire table on the first slice of every compute node in the cluster. It is useful for relatively small, slowly changing dimension tables, as it eliminates data redistribution (broadcasting) during joins with fact tables."
  },
  {
    id: "data-20",
    role: "Data Engineer",
    difficulty: "expert",
    question: "A Kafka topic has `replication.factor=3`, `min.insync.replicas=2`, and `acks=all`. If 2 out of the 3 brokers go offline, leaving only the leader up, what happens to the producer and consumer?",
    options: ["Both producers and consumers will be completely blocked.","Producers will receive NotEnoughReplicas exceptions, but consumers can still read existing committed messages.","Producers will automatically fallback to `acks=1` and continue writing, while consumers read normally.","Producers can write successfully since the leader is up, but consumers cannot read until the replicas catch up."],
    correctAnswer: 1,
    explanation: "With `min.insync.replicas=2` and `acks=all`, the producer requires at least 2 in-sync replicas to successfully acknowledge a write. If only 1 broker is up, producer writes will fail. However, existing committed messages are still available on the leader, so consumers can continue to read normally."
  },
  {
    id: "data-21",
    role: "Data Engineer",
    difficulty: "expert",
    question: "In Spark, if a query shows massive 'Spill (Memory)' and 'Spill (Disk)' metrics in the web UI, why is the 'Spill (Memory)' metric usually much larger than the 'Spill (Disk)' metric?",
    options: ["Memory spill measures uncompressed, deserialized Java objects, while disk spill measures compressed, serialized bytes.","Memory spill includes data from cached broadcast variables, which are excluded from the disk metric.","Spark counts the memory spill cumulatively across retries, while disk spill is overwritten.","It is an artifact of the JVM garbage collector reporting reclaimed heap space."],
    correctAnswer: 0,
    explanation: "Spill (Memory) is the size of the data as it exists in memory (deserialized, uncompressed Java/Scala objects, which carry heavy object overhead). Spill (Disk) is the size of that exact same data after it has been serialized and compressed and written to disk, which is always drastically smaller."
  },
  {
    id: "data-22",
    role: "Data Engineer",
    difficulty: "chaos",
    question: "How do 'Unaligned Checkpoints' in Flink differ from standard aligned checkpoints under heavy backpressure?",
    options: ["Unaligned checkpoints ignore exactly-once semantics to achieve lower latency.","Unaligned checkpoints bypass the JobManager and allow TaskManagers to write directly to S3 asynchronously.","Unaligned checkpoints capture the data currently in flight in the network buffers as part of the state, allowing checkpoint barriers to overtake data records.","Unaligned checkpoints only snapshot the state of source operators and replay the rest from the log."],
    correctAnswer: 2,
    explanation: "Standard checkpoints require barriers to align; under heavy backpressure, barriers get stuck behind buffered data, causing checkpoints to time out. Unaligned checkpoints allow barriers to overtake the queued data buffers. The data in those network buffers is then snapshotted alongside the operator state, significantly reducing checkpoint times under backpressure."
  },
  {
    id: "data-23",
    role: "Data Engineer",
    difficulty: "expert",
    question: "In Airflow's Dynamic Task Mapping (`task.expand(arg=list)`), what happens if the upstream task generates a list of 5 items in the first run, but only 3 items in the subsequent run?",
    options: ["Airflow will map exactly 3 task instances for the second run, gracefully handling the dynamic resizing.","The second run will fail because Airflow requires dynamically mapped arrays to have a constant size across DAG runs.","Airflow will create 5 task instances, but pass `None` to the last 2 instances.","The scheduler will deadlock because the metadata database expects the `map_index` to reach 4."],
    correctAnswer: 0,
    explanation: "Dynamic Task Mapping in Airflow calculates the mapping at runtime. It dynamically creates `map_index` 0, 1, and 2 for the second run. It naturally handles changing array sizes between DAG runs without any failures or dummy tasks."
  },
  {
    id: "data-24",
    role: "Data Engineer",
    difficulty: "hard",
    question: "In Snowflake, how does a Stream track Change Data Capture (CDC) events on a table without creating massive copies of the underlying data?",
    options: ["It places triggers on the table that insert DML operations into a hidden queue.","It queries the cloud provider's storage logs (e.g., S3 Event Notifications) directly.","It maintains an offset in the table's metadata and leverages the immutable micro-partition architecture to compute the delta at query time.","It continuously runs a background task that hashes each row to detect changes."],
    correctAnswer: 2,
    explanation: "Snowflake Streams rely on the immutable micro-partition architecture. A Stream essentially stores an offset (a transaction version). When queried, it computes the CDC delta on the fly by comparing the micro-partitions that existed at the offset with the current micro-partitions, avoiding any physical data duplication."
  },
  {
    id: "data-25",
    role: "Data Engineer",
    difficulty: "expert",
    question: "In Delta Lake, every 10 commits, a checkpoint file (.parquet) is written to the `_delta_log`. What is the primary purpose of this checkpoint file?",
    options: ["To enforce GDPR compliance by permanently purging deleted rows from disk.","To compress the physical data files in the table into a single large Parquet file.","To aggregate the history of all JSON commit logs into a single Parquet file so clients can reconstruct the table state quickly without parsing thousands of JSON files.","To synchronize the Delta Lake transaction log with the Hive Metastore."],
    correctAnswer: 2,
    explanation: "Delta Lake logs every transaction as a JSON file. Over time, reading thousands of JSON files to reconstruct the latest table state becomes slow. Checkpoint Parquet files summarize the state of the log up to that point. A client only needs to read the latest Parquet checkpoint and any subsequent JSON files, making state reconstruction extremely fast."
  },
  {
    id: "dba-1",
    role: "Database Administrator",
    difficulty: "expert",
    question: "In PostgreSQL, if the system reaches `autovacuum_freeze_max_age` and starts an aggressive anti-wraparound vacuum on a very large table, what is the primary concurrency impact?",
    options: ["It runs in the background but can consume significant I/O; concurrent writes and reads are still allowed.","It takes an ACCESS EXCLUSIVE lock, completely blocking all read and write queries on the table.","It blocks concurrent inserts and updates but allows SELECT queries using an ACCESS SHARE lock.","It forces the database into read-only mode until the vacuum completes to prevent transaction ID exhaustion."],
    correctAnswer: 0,
    explanation: "Anti-wraparound autovacuum does not take an ACCESS EXCLUSIVE lock. It allows concurrent reads and writes, although it might consume heavy I/O and degrade performance."
  },
  {
    id: "dba-2",
    role: "Database Administrator",
    difficulty: "hard",
    question: "In MySQL InnoDB with REPEATABLE READ isolation level, a transaction executes: `SELECT * FROM users WHERE age = 30 FOR UPDATE;` where `age` is a non-unique indexed column. What locks are acquired?",
    options: ["Next-key locks on the index records for age=30 and gap locks before and after the matching records.","Only record locks on the exact matching rows where age=30.","A table-level lock since age is non-unique and range queries require full table locking.","Gap locks only, preventing inserts with age=30, but allowing updates to existing rows."],
    correctAnswer: 0,
    explanation: "InnoDB uses next-key locking for non-unique indexes in REPEATABLE READ to prevent phantom reads, placing locks on the index records and the gaps between them."
  },
  {
    id: "dba-3",
    role: "Database Administrator",
    difficulty: "chaos",
    question: "In Oracle Database, what happens when a log switch occurs but the next redo log group has not been completely archived by the ARCn process?",
    options: ["The database hangs and LGWR waits until the archiving of the required redo log group is complete.","LGWR automatically bypasses the unarchived log group and overwrites the oldest archived group instead.","The database temporarily switches to NOARCHIVELOG mode to prevent downtime.","An ORA-01555 'snapshot too old' error is returned to active transactions."],
    correctAnswer: 0,
    explanation: "LGWR must wait for the archiver (ARCn) to finish archiving a redo log group before it can be overwritten. During this wait, the database can experience a 'checkpoint not complete' or 'log file switch (archiving needed)' wait event, causing a stall."
  },
  {
    id: "dba-4",
    role: "Database Administrator",
    difficulty: "hard",
    question: "In SQL Server, a transaction log has grown to 500GB due to a runaway transaction, resulting in thousands of Virtual Log Files (VLFs). What is the primary negative consequence of having too many small VLFs?",
    options: ["Database recovery (crash recovery, restores, or Always On failovers) takes an excessively long time.","Data file growth is disabled until the transaction log is truncated.","The maximum number of concurrent transactions is artificially limited by the VLF count.","Checkpoint operations fail because dirty pages cannot be mapped to individual VLFs."],
    correctAnswer: 0,
    explanation: "Having too many small VLFs ('VLF fragmentation') significantly slows down database recovery processes, including startup, restores, and availability group failovers, because SQL Server has to open and read each VLF sequentially."
  },
  {
    id: "dba-5",
    role: "Database Administrator",
    difficulty: "chaos",
    question: "Consider a B+ Tree index with a branching factor of 'b'. If the table size increases by a factor of 100, what is the approximate expected increase in the height of the B+ Tree?",
    options: ["2 / log10(b)","b * log2(100)","100 / b","log(100) * b"],
    correctAnswer: 0,
    explanation: "The height of a B-tree is proportional to log_b(N). If N increases to 100N, the new height is log_b(100N) = log_b(N) + log_b(100). By change of base, log_b(100) = log10(100) / log10(b) = 2 / log10(b)."
  },
  {
    id: "dba-6",
    role: "Database Administrator",
    difficulty: "expert",
    question: "Under what specific condition does PostgreSQL utilize Heap-Only Tuples (HOT) to optimize an UPDATE operation?",
    options: ["The UPDATE does not modify any columns that are part of an index, and there is sufficient free space in the same page.","The table contains no indexes whatsoever, allowing in-place updates.","The UPDATE modifies an indexed column, but the old and new values hash to the same bucket.","The table's fillfactor is set to 100, forcing updates to allocate space sequentially."],
    correctAnswer: 0,
    explanation: "HOT updates occur when an UPDATE does not change any indexed columns and the new version of the row can fit on the same page as the old version, bypassing the need to update index pointers."
  },
  {
    id: "dba-7",
    role: "Database Administrator",
    difficulty: "expert",
    question: "In Oracle, if UNDO_RETENTION is set to 900 seconds but the undo tablespace is fixed in size and runs out of space, what is the default behavior?",
    options: ["Unexpired undo information is overwritten to accommodate new transactions, potentially causing ORA-01555 for long queries.","New transactions fail with an 'undo space exhausted' error until unexpired undo becomes expired.","The oldest active transaction is automatically rolled back to free up undo space.","The database dynamically allocates space in the SYSTEM tablespace to hold the overflow undo data."],
    correctAnswer: 0,
    explanation: "Unless RETENTION GUARANTEE is explicitly enabled, Oracle will overwrite unexpired undo data to satisfy new transaction demands, which can lead to ORA-01555 (snapshot too old) errors for long-running queries."
  },
  {
    id: "dba-8",
    role: "Database Administrator",
    difficulty: "hard",
    question: "What is the primary purpose of the InnoDB doublewrite buffer in MySQL?",
    options: ["To protect against partial or torn page writes during an OS or power crash.","To write changes to both the primary server and a synchronous replica simultaneously.","To cache read requests and write requests separately to avoid I/O contention.","To double the speed of bulk inserts by buffering them in contiguous memory blocks."],
    correctAnswer: 0,
    explanation: "InnoDB pages are typically 16KB, but OS file system writes are usually smaller (e.g., 4KB). A crash during a write could leave a 'torn page'. The doublewrite buffer ensures page consistency by first writing the page sequentially to a dedicated area before writing it to the data file."
  },
  {
    id: "dba-9",
    role: "Database Administrator",
    difficulty: "expert",
    question: "Enabling Read Committed Snapshot Isolation (RCSI) in SQL Server removes read locks for SELECT statements. What is the main architectural trade-off of this setting?",
    options: ["It increases the workload and space utilization in TempDB due to row versioning overhead.","It disables the ability to use covering non-clustered indexes.","It requires the transaction log to run in Bulk-Logged recovery model to handle versions.","It forces all UPDATE statements to acquire table-level exclusive locks."],
    correctAnswer: 0,
    explanation: "RCSI implements statement-level read consistency using row versioning. The older versions of the rows are stored in the version store in TempDB, which can significantly increase TempDB size and I/O."
  },
  {
    id: "dba-10",
    role: "Database Administrator",
    difficulty: "hard",
    question: "In PostgreSQL, if `checkpoint_completion_target` is set to 0.9, what does this actually mean?",
    options: ["The system aims to complete the current checkpoint spreading the writes over 90% of the time until the next scheduled checkpoint.","Checkpoints will only trigger when the WAL reaches 90% of the `max_wal_size`.","90% of the dirty buffers in shared_buffers will be flushed during a checkpoint, leaving 10% dirty.","The background writer will yield 90% of its CPU time to concurrent user queries during a checkpoint."],
    correctAnswer: 0,
    explanation: "Setting `checkpoint_completion_target` to 0.9 tells PostgreSQL to throttle checkpoint I/O so that it finishes in roughly 90% of the time between checkpoints, reducing I/O spikes."
  },
  {
    id: "dba-11",
    role: "Database Administrator",
    difficulty: "hard",
    question: "In Redis, if the `maxmemory-policy` is set to `volatile-lru`, how does the eviction mechanism select keys to remove when memory is full?",
    options: ["It evicts the least recently used keys, but only from the set of keys that have an expire set.","It evicts keys randomly, but only those without an expiration time.","It evicts the keys with the shortest remaining time-to-live (TTL).","It evicts any least recently used key across the entire dataset, ignoring TTLs."],
    correctAnswer: 0,
    explanation: "`volatile-lru` evicts the least recently used keys out of all keys that have an expiration (TTL) set."
  },
  {
    id: "dba-12",
    role: "Database Administrator",
    difficulty: "expert",
    question: "In Oracle, after issuing a massive DELETE statement that removes 90% of the rows from a table without indices, subsequent full table scans are unexpectedly slow. Why?",
    options: ["A standard DELETE does not lower the segment's High Water Mark (HWM), so full table scans still read all the empty blocks.","The DELETE operation automatically fragmented the data blocks, increasing the multiblock read count.","The undo data generated by the DELETE is still being read by the full table scan to verify visibility.","Full table scans dynamically rebuild deleted rows in memory before filtering them out."],
    correctAnswer: 0,
    explanation: "DELETE operations do not reset the High Water Mark. Full table scans read up to the HWM, so scanning a table that had many deleted rows will still read all the empty blocks below the HWM unless the table is truncated or reorganized (e.g., using SHRINK SPACE)."
  },
  {
    id: "dba-13",
    role: "Database Administrator",
    difficulty: "expert",
    question: "MySQL asynchronous replication is experiencing heavy lag. The replica's IO thread is caught up, but the SQL thread is far behind. What is the most likely cause?",
    options: ["The primary is executing heavy write operations (like massive UPDATEs or schema changes) that the replica's single-threaded SQL thread cannot process quickly enough.","The network bandwidth between the primary and the replica is saturated, delaying binary log transmission.","The replica's `sync_binlog` setting is set to 0, causing the SQL thread to wait for disk syncs.","The binary log format on the primary is set to STATEMENT, which prevents the SQL thread from applying row-based changes."],
    correctAnswer: 0,
    explanation: "If the IO thread is caught up, the binlogs are safely on the replica. The SQL thread lagging implies the replica is CPU or disk-bound applying the changes, typically because traditional replication is single-threaded (without parallel replication enabled) and struggles to keep up with concurrent primary writes."
  },
  {
    id: "dba-14",
    role: "Database Administrator",
    difficulty: "hard",
    question: "In a MongoDB sharded cluster, choosing a monotonically increasing field (like an ObjectId or timestamp) as the shard key leads to which specific performance antipattern?",
    options: ["Write operations become localized to a single shard (the 'hot shard'), failing to distribute the write load across the cluster.","Read operations will require scatter-gather queries across all shards, increasing latency.","Chunks can never be split because the keyspace is strictly ordered.","Secondary indexes on the shard key become impossibly large and cause out-of-memory errors."],
    correctAnswer: 0,
    explanation: "Monotonically increasing shard keys direct all new inserts to the chunk with the 'maxKey' upper bound, which resides on a single shard. This creates a hot spot and prevents horizontal write scaling."
  },
  {
    id: "dba-15",
    role: "Database Administrator",
    difficulty: "chaos",
    question: "When using PgBouncer in `transaction` pooling mode, why do server-side prepared statements typically fail or cause errors for client applications?",
    options: ["PgBouncer routes different transactions of the same client to different backend connections, so a prepared statement created on one connection might not exist on the connection used for execution.","PgBouncer forcefully converts all prepared statements into dynamic SQL to prevent SQL injection.","The protocol for prepared statements requires an active replication slot, which PgBouncer blocks.","PgBouncer caches the prepared statement execution plan, leading to stale data when statistics change."],
    correctAnswer: 0,
    explanation: "In transaction pooling mode, a client connection might use multiple underlying database connections for different transactions. A prepared statement is session-scoped to a specific DB connection. If the PREPARE happens on DB connection A, and the EXECUTE happens on DB connection B, it will fail."
  },
  {
    id: "dba-16",
    role: "Database Administrator",
    difficulty: "expert",
    question: "The 'Snapshot Isolation' level prevents Phantom Reads but is still susceptible to which specific concurrency anomaly?",
    options: ["Write Skew","Dirty Reads","Non-Repeatable Reads","Lost Updates"],
    correctAnswer: 0,
    explanation: "Snapshot isolation is vulnerable to Write Skew, where two concurrent transactions read overlapping data sets and independently update disjoint data sets, resulting in a state that could not have occurred if the transactions were strictly serialized."
  },
  {
    id: "dba-17",
    role: "Database Administrator",
    difficulty: "hard",
    question: "When the SQL Server lock monitor detects a deadlock, what is the default criteria it uses to select the 'deadlock victim'?",
    options: ["It chooses the transaction that is least expensive to roll back, typically determined by the amount of log generated.","It chooses the transaction that has been running the longest to minimize user frustration.","It randomly selects a transaction to prevent deterministic deadlock loops.","It chooses the transaction holding the most exclusive locks."],
    correctAnswer: 0,
    explanation: "By default, SQL Server chooses the deadlock victim based on the transaction that is cheapest to roll back (the one that has generated the least amount of transaction log). This can be overridden by setting `DEADLOCK_PRIORITY`."
  },
  {
    id: "dba-18",
    role: "Database Administrator",
    difficulty: "expert",
    question: "In Apache Cassandra, a high number of read timeouts are occurring on a specific table where data is frequently deleted. What is the architectural reason for this?",
    options: ["Deletes write 'tombstones' which must be scanned and filtered during read operations until they are purged during compaction, causing high CPU and I/O load.","The coordinator node must actively query the cluster to confirm the deletion on a majority of nodes before returning read results.","Deleting data physically fragments the Memtable, slowing down subsequent sequential reads.","Deletes cause synchronous index rebuilds across all replicas, locking read operations."],
    correctAnswer: 0,
    explanation: "Cassandra uses an append-only architecture. Deletes create tombstone markers. During a read, both live data and tombstones must be scanned to ensure deleted data is not returned, heavily degrading read performance if tombstones accumulate before the `gc_grace_seconds` allows them to be compacted away."
  },
  {
    id: "dba-19",
    role: "Database Administrator",
    difficulty: "hard",
    question: "In older versions of Elasticsearch (pre-7.x), what was the primary configuration setting used to prevent a 'split-brain' scenario in a cluster of N master-eligible nodes?",
    options: ["Setting `discovery.zen.minimum_master_nodes` to (N / 2) + 1.","Setting `cluster.routing.allocation.enable` to true.","Setting `network.host` to a unicast IP list rather than multicast.","Configuring a dedicated tie-breaker node with `node.data` set to false."],
    correctAnswer: 0,
    explanation: "To prevent split-brain (where a network partition creates two independent clusters that both elect a master), the quorum size for master election had to be explicitly set to a strict majority: (N/2) + 1. In ES 7.x+, this is managed automatically."
  },
  {
    id: "dba-20",
    role: "Database Administrator",
    difficulty: "hard",
    question: "In the Oracle System Global Area (SGA), what is the difference in purpose between the Database Buffer Cache and the Shared Pool?",
    options: ["The Buffer Cache stores copies of data blocks read from disk, while the Shared Pool stores cached SQL execution plans and PL/SQL code.","The Buffer Cache handles user session memory, while the Shared Pool caches redo log entries before writing to disk.","The Buffer Cache is used for temporary sort operations, while the Shared Pool caches table statistics.","The Buffer Cache caches data for the primary instance, while the Shared Pool is used to synchronize data blocks in a RAC environment."],
    correctAnswer: 0,
    explanation: "The DB Buffer Cache holds data blocks fetched from data files. The Shared Pool holds the library cache (parsed SQL, execution plans) and dictionary cache (metadata), optimizing parsing and execution."
  },
  {
    id: "dba-21",
    role: "Database Administrator",
    difficulty: "expert",
    question: "For a PostgreSQL column that stores an array of integers (e.g., `integer[]`), which index type is most appropriate to optimize queries checking for array containment (`@>`)?",
    options: ["GIN (Generalized Inverted Index)","B-Tree","Hash","BRIN (Block Range Index)"],
    correctAnswer: 0,
    explanation: "GIN indexes are designed for handling values that contain multiple elements, such as arrays, full-text search vectors (tsvector), and JSONB, making them highly efficient for containment queries. B-Tree indexes only index the array as a whole."
  },
  {
    id: "dba-22",
    role: "Database Administrator",
    difficulty: "expert",
    question: "In InnoDB, what happens if a table is created without explicitly defining a PRIMARY KEY or a UNIQUE index?",
    options: ["InnoDB automatically generates a hidden 6-byte ROWID to use as the clustered index.","The table is stored as a heap file without any clustered index organization.","The table creation fails with an error requiring a primary key.","InnoDB uses the first non-null column defined in the schema as the clustered index."],
    correctAnswer: 0,
    explanation: "InnoDB tables are always clustered index organized. If no PK is defined, and no suitable UNIQUE KEY is available, InnoDB implicitly creates a synthetic 6-byte ROWID column to cluster the data on."
  },
  {
    id: "dba-23",
    role: "Database Administrator",
    difficulty: "chaos",
    question: "In the PACELC theorem (an extension of the CAP theorem), what does the 'E' and 'L' stand for?",
    options: ["Else (E), Latency (L)","Eventual (E), Local (L)","Partition (E) in CAP implies Logarithmic (L)","Elastic (E), Linearizable (L)"],
    correctAnswer: 0,
    explanation: "PACELC states: if there is a Partition (P), trade off Availability (A) vs Consistency (C); Else (E), when the system is running normally without partitions, trade off Latency (L) vs Consistency (C)."
  },
  {
    id: "dba-24",
    role: "Database Administrator",
    difficulty: "expert",
    question: "When using Declarative Partitioning in PostgreSQL, what is a crucial limitation regarding global unique constraints?",
    options: ["Unique constraints (and primary keys) must include the partition key column(s); otherwise, they cannot be enforced across the entire partitioned table.","Unique constraints are only enforced on the default partition.","Adding a unique constraint automatically converts the partitioning strategy to Hash partitioning.","Unique constraints cause all partition pruning to be disabled during SELECT queries."],
    correctAnswer: 0,
    explanation: "PostgreSQL cannot enforce a global unique index across multiple partitions independently. For a unique constraint or primary key to be supported on a partitioned table, the partition key must be part of the unique constraint columns."
  },
  {
    id: "dba-25",
    role: "Database Administrator",
    difficulty: "hard",
    question: "How are Bloom filters typically utilized in modern database storage engines (e.g., RocksDB, Cassandra)?",
    options: ["To quickly determine if a specific key definitely does NOT exist in an SSTable/disk file, saving unnecessary disk reads.","To guarantee that a row is stored sequentially in the transaction log.","To compress the size of B-Tree leaf nodes in memory.","To exactly identify the exact byte offset of a key within a page without scanning."],
    correctAnswer: 0,
    explanation: "A Bloom filter is a probabilistic data structure. It can definitively answer 'No' (the key is not here), preventing an expensive disk read. If it answers 'Yes', the key might be there (a false positive), and a read is performed to verify."
  },
  {
    id: "devops-1",
    role: "DevOps Engineer",
    difficulty: "hard",
    question: "In a Dockerfile, you execute 'RUN rm -rf /tmp/large-files' immediately after a 'RUN wget ... /tmp/large-files' layer. What is the effect on the final Docker image size?",
    options: ["The image size is reduced significantly because the files are deleted.","The image size remains unchanged or slightly increases because the files are still stored in the previous layer.","The image build will fail because you cannot remove files created in a previous layer.","The image size is reduced, but only if you use a multi-stage build."],
    correctAnswer: 1,
    explanation: "Docker images are built in layers. Deleting a file in a subsequent layer hides it from the final filesystem but does not remove it from the underlying layer, meaning the final image size includes the deleted file."
  },
  {
    id: "devops-2",
    role: "DevOps Engineer",
    difficulty: "expert",
    question: "A Kubernetes Pod is evicted with the reason 'OOMKilled'. Which of the following resource configurations is the primary cause?",
    options: ["The pod exceeded its CPU request limit.","The pod exceeded its memory request, and the node ran out of memory.","The pod exceeded its memory limit, regardless of node memory availability.","The pod exceeded its CPU limit, triggering an Out-Of-Memory killer."],
    correctAnswer: 2,
    explanation: "OOMKilled occurs when a container exceeds its defined memory limit, causing the kernel to terminate the process. If a node runs out of memory, pods are 'Evicted', not necessarily 'OOMKilled', unless they hit their own limit first."
  },
  {
    id: "devops-3",
    role: "DevOps Engineer",
    difficulty: "chaos",
    question: "You are debugging a Kubernetes networking issue where a headless service (ClusterIP: None) is being queried. What does the DNS query for this service return?",
    options: ["A single virtual IP address load-balanced by kube-proxy.","Multiple A records containing the IPs of all ready endpoints (Pods) backing the service.","A CNAME record pointing to the underlying Node IP addresses.","An SRV record that resolves to the ClusterIP of the associated StatefulSet."],
    correctAnswer: 1,
    explanation: "A headless service bypasses kube-proxy load balancing. Kubernetes DNS returns multiple A records, one for each ready Pod IP, allowing the client to handle load balancing or connect directly to a specific pod."
  },
  {
    id: "devops-4",
    role: "DevOps Engineer",
    difficulty: "hard",
    question: "In Terraform, you transition from using 'count' to 'for_each' for an existing resource without altering the terraform state manually. What happens on the next 'terraform apply'?",
    options: ["Terraform updates the resources in-place since the resource attributes haven't changed.","Terraform destroys the resources created by 'count' and recreates them using 'for_each' indexing.","Terraform throws a syntax error because 'for_each' cannot replace 'count' on an existing module.","Terraform ignores the change as long as the number of instances remains the same."],
    correctAnswer: 1,
    explanation: "Changing from `count` (which uses integer indices like `[0]`) to `for_each` (which uses string keys) changes the resource address in the state file. Without `moved` blocks or `terraform state mv`, Terraform sees this as a request to destroy the old indexed resources and create new keyed ones."
  },
  {
    id: "devops-5",
    role: "DevOps Engineer",
    difficulty: "expert",
    question: "When a Pod in Kubernetes is deleted, the API server sends a SIGTERM signal to the container. If the application doesn't exit, what happens next?",
    options: ["The API server sends a SIGKILL immediately after 30 seconds (default terminationGracePeriodSeconds).","kubelet waits indefinitely until the container gracefully shuts down.","kube-proxy drops the connection, and the pod is forcefully removed from etcd.","kubelet sends a SIGKILL after the terminationGracePeriodSeconds expires."],
    correctAnswer: 3,
    explanation: "When a pod is deleted, it enters Terminating state. Kubelet sends a SIGTERM. If the container doesn't exit within `terminationGracePeriodSeconds` (default 30s), kubelet sends a SIGKILL to forcefully terminate it."
  },
  {
    id: "devops-6",
    role: "DevOps Engineer",
    difficulty: "hard",
    question: "Which Linux namespace is responsible for isolating network interfaces, routing tables, and iptables rules for a Docker container?",
    options: ["PID namespace","Mount namespace","Network namespace (netns)","UTS namespace"],
    correctAnswer: 2,
    explanation: "The Network namespace (netns) provides isolation of the system network stack, including network interfaces, IPv4/IPv6 protocol stacks, IP routing tables, firewall rules, and directory trees."
  },
  {
    id: "devops-7",
    role: "DevOps Engineer",
    difficulty: "expert",
    question: "In an AWS IAM policy, what is the difference between an 'Identity-based policy' and a 'Resource-based policy'?",
    options: ["Identity-based policies define what an identity can do, while resource-based policies define who can access a resource.","Identity-based policies are attached to S3 buckets, while resource-based policies are attached to IAM Users.","Identity-based policies grant cross-account access natively, while resource-based policies do not.","There is no functional difference; they are just different names for the same JSON structure."],
    correctAnswer: 0,
    explanation: "Identity-based policies are attached to IAM users, groups, or roles and specify what that identity can do. Resource-based policies are attached to resources (like S3 buckets or KMS keys) and specify who has access to the resource and what actions they can perform."
  },
  {
    id: "devops-8",
    role: "DevOps Engineer",
    difficulty: "chaos",
    question: "You have a Bash script with 'set -euo pipefail'. What happens if you run 'cat non_existent_file | grep some_text > output.txt'?",
    options: ["The script continues execution because 'grep' masks the failure of 'cat'.","The script fails and exits immediately because 'cat' exits with a non-zero status, and 'pipefail' propagates it.","The script continues because output redirection (>) resets the exit code.","The script exits immediately due to the '-e' flag, regardless of 'pipefail'."],
    correctAnswer: 1,
    explanation: "Normally, a pipeline's exit status is that of the last command (grep). With `set -o pipefail`, the pipeline's exit status is the value of the last (rightmost) command to exit with a non-zero status. Since `cat` fails, the pipeline fails, and `-e` causes the script to exit."
  },
  {
    id: "devops-9",
    role: "DevOps Engineer",
    difficulty: "expert",
    question: "In Terraform, how do you securely manage sensitive variables, like database passwords, so they don't appear in plaintext in the terminal output or version control?",
    options: ["Mark the variable as 'sensitive = true' and store the state file in a remote backend with encryption at rest.","Use the 'terraform obscure' command before committing code.","Store the variable in a local 'terraform.tfvars' file and commit it to git.","Mark the variable as 'secure' which encrypts it automatically in the state file."],
    correctAnswer: 0,
    explanation: "Marking a variable as `sensitive = true` prevents Terraform from showing its value in CLI output. However, it is still stored in plaintext in the state file, so using a remote backend (like S3) with encryption at rest and strict access controls is essential."
  },
  {
    id: "devops-10",
    role: "DevOps Engineer",
    difficulty: "hard",
    question: "When configuring an AWS Auto Scaling Group (ASG), what is the purpose of a 'Cooldown Period'?",
    options: ["It determines how long an instance must run before it can be terminated.","It specifies the time to wait after a scaling activity completes before another scaling activity can begin.","It delays the startup of an instance to allow user data scripts to finish.","It dictates how long the load balancer waits before routing traffic to a new instance."],
    correctAnswer: 1,
    explanation: "The cooldown period prevents the ASG from launching or terminating additional instances before the effects of previous scaling activities are visible (e.g., metric stabilization), preventing runaway scaling."
  },
  {
    id: "devops-11",
    role: "DevOps Engineer",
    difficulty: "expert",
    question: "A Kubernetes ClusterRoleBinding binds a ClusterRole to a ServiceAccount in the 'default' namespace. What is the scope of permissions granted?",
    options: ["The permissions are limited to the 'default' namespace.","The permissions apply across all namespaces in the cluster.","The permissions apply only to cluster-scoped resources, not namespaced resources.","The binding is invalid; ServiceAccounts cannot be bound via ClusterRoleBindings."],
    correctAnswer: 1,
    explanation: "A ClusterRoleBinding grants the permissions defined in a ClusterRole across the entire cluster, covering all namespaces. If you want to grant ClusterRole permissions within a specific namespace, you use a RoleBinding."
  },
  {
    id: "devops-12",
    role: "DevOps Engineer",
    difficulty: "chaos",
    question: "In Linux, a process shows a state of 'D' (Uninterruptible Sleep) in 'top' or 'htop'. What is the most common cause?",
    options: ["The process is stuck in an infinite CPU loop.","The process is waiting for an I/O operation (like disk or network) to complete and cannot be killed with SIGKILL.","The process is a zombie and is waiting for its parent to read its exit status.","The process is paused by a SIGSTOP signal and waiting for SIGCONT."],
    correctAnswer: 1,
    explanation: "State 'D' means Uninterruptible Sleep. The process is typically waiting for hardware I/O (disk, NFS, etc.) and cannot process signals, meaning even `kill -9` (SIGKILL) will not terminate it until the I/O request completes or times out."
  },
  {
    id: "devops-13",
    role: "DevOps Engineer",
    difficulty: "hard",
    question: "When a Docker container is run with the '--privileged' flag, what does it actually do under the hood?",
    options: ["It mounts the host's root filesystem (/) into the container at /host.","It runs the container process as the root user of the host, ignoring user namespaces.","It gives the container all Linux capabilities and lifts cgroup limitations, allowing it to act almost like the host OS.","It automatically exposes all ports to the host network."],
    correctAnswer: 2,
    explanation: "The `--privileged` flag grants the container all Linux capabilities (overriding the default dropped capabilities), allows access to all host devices, and removes cgroup restrictions, essentially disabling container isolation."
  },
  {
    id: "devops-14",
    role: "DevOps Engineer",
    difficulty: "expert",
    question: "In a CI/CD pipeline, what is the primary risk of using 'docker.sock' mounting (/var/run/docker.sock) for Docker-in-Docker (DinD) builds?",
    options: ["It causes significant performance degradation due to nested virtualization.","It allows the container to easily gain root access to the host machine by launching a privileged container.","It restricts the container to only building images, preventing it from running tests.","It causes conflicts with the host's local image cache, leading to corrupted builds."],
    correctAnswer: 1,
    explanation: "Mounting the Docker socket gives the container access to the host's Docker daemon. Since the Docker daemon runs as root, a compromised container can use the socket to start a new privileged container that mounts the host root filesystem, achieving full host takeover."
  },
  {
    id: "devops-15",
    role: "DevOps Engineer",
    difficulty: "chaos",
    question: "You update a Kubernetes Deployment's manifest, changing an environment variable, but the pods do not restart. Which of the following is a possible reason?",
    options: ["The Deployment strategy is set to 'Recreate' instead of 'RollingUpdate'.","The change was made to a ConfigMap that the Deployment references via 'envFrom', and the Deployment spec itself wasn't modified.","The Deployment's 'revisionHistoryLimit' is set to 0.","The cluster's kube-scheduler is temporarily down."],
    correctAnswer: 1,
    explanation: "Changes to an external ConfigMap or Secret do not automatically trigger a rollout in a Deployment unless the Deployment spec itself (e.g., the pod template hash) changes. Tools like 'Reloader' or hashing the configmap in an annotation are used to force restarts."
  },
  {
    id: "devops-16",
    role: "DevOps Engineer",
    difficulty: "hard",
    question: "In Prometheus, what is the difference between an 'irate' and 'rate' function?",
    options: ["irate calculates the per-second rate based on all data points in the range, while rate only uses the first and last data points.","irate is used for gauges, while rate is used for counters.","irate calculates the per-second rate based on the last two data points in the range, making it better for fast-moving, spiky graphs.","There is no difference; irate is an alias for rate in newer Prometheus versions."],
    correctAnswer: 2,
    explanation: "`irate` calculates the rate based on the two most recent data points within the specified time range, which highlights instantaneous spikes. `rate` calculates the average rate over the entire time window."
  },
  {
    id: "devops-17",
    role: "DevOps Engineer",
    difficulty: "expert",
    question: "When working with Ansible, what does the 'serial' keyword achieve in a playbook?",
    options: ["It forces Ansible to execute tasks in strict sequential order within a single host.","It determines the number of hosts Ansible will manage concurrently during a rolling update.","It assigns a unique sequential ID to each host in the inventory.","It ensures that handlers are executed serially at the end of the playbook run."],
    correctAnswer: 1,
    explanation: "The `serial` keyword controls how many hosts Ansible updates at a time (batch size) during a play. This is crucial for rolling updates to ensure a service remains available while a portion of the cluster is updated."
  },
  {
    id: "devops-18",
    role: "DevOps Engineer",
    difficulty: "chaos",
    question: "In Terraform, you use a 'remote_state' data source to read outputs from another workspace. If the target workspace destroys its resources, what happens to your workspace on the next 'plan'?",
    options: ["Terraform automatically ignores the missing remote state and uses the last known values.","The plan succeeds, but the outputs fetched will be empty or null, potentially causing downstream resource recreation or errors.","The plan fails immediately because the remote state file no longer exists.","Terraform automatically triggers a destroy on your workspace to maintain consistency."],
    correctAnswer: 1,
    explanation: "The `terraform_remote_state` data source reads the state file. If the target workspace destroys its resources, its outputs become empty/null. Your workspace will read these null values, which may cause your plan to attempt destroying or altering your resources that depended on those values."
  },
  {
    id: "devops-19",
    role: "DevOps Engineer",
    difficulty: "hard",
    question: "Which of the following describes the behavior of a Kubernetes Service of type 'NodePort'?",
    options: ["It exposes the service on a static port on each Node's IP, and automatically creates a ClusterIP.","It exposes the service via a cloud provider's external load balancer.","It routes traffic directly to the pod without using kube-proxy iptables rules.","It bypasses the ClusterIP and exposes the service only on the master node."],
    correctAnswer: 0,
    explanation: "A NodePort service allocates a port (usually in the 30000-32767 range) on every node in the cluster. It also automatically allocates a ClusterIP. Traffic sent to any node's IP on the NodePort is routed via kube-proxy to the service's pods."
  },
  {
    id: "devops-20",
    role: "DevOps Engineer",
    difficulty: "expert",
    question: "You have an AWS S3 bucket and want to ensure that it cannot be accidentally deleted by Terraform, even if someone runs 'terraform destroy'. How do you configure this?",
    options: ["Set 'prevent_destroy = true' within the 'lifecycle' block of the aws_s3_bucket resource.","Add a 'deletion_protection = true' argument to the aws_s3_bucket resource configuration.","Configure the S3 backend to use DynamoDB state locking.","Use 'terraform state rm' before running destroy."],
    correctAnswer: 0,
    explanation: "The `lifecycle` block in Terraform has a `prevent_destroy` meta-argument. If set to `true`, Terraform will throw an error and reject any plan that attempts to destroy the resource, protecting it from accidental deletion."
  },
  {
    id: "devops-21",
    role: "DevOps Engineer",
    difficulty: "chaos",
    question: "In a GitOps workflow using ArgoCD, what happens if someone manually edits a Kubernetes Deployment in the cluster (e.g., using kubectl edit) to change the replica count?",
    options: ["ArgoCD immediately deletes the Deployment and recreates it from Git.","ArgoCD detects the drift and shows the application as 'OutOfSync', reverting the change automatically if auto-sync with self-heal is enabled.","The change remains permanent, and ArgoCD commits the change back to the Git repository.","ArgoCD ignores the change unless the Git repository is updated."],
    correctAnswer: 1,
    explanation: "ArgoCD continuously monitors the live cluster state against the desired state in Git. Manual changes cause 'OutOfSync' status. If 'automated' sync with 'selfHeal' is enabled, ArgoCD automatically overwrites the manual changes to match Git."
  },
  {
    id: "devops-22",
    role: "DevOps Engineer",
    difficulty: "hard",
    question: "What is the primary function of a 'Taint' in Kubernetes?",
    options: ["To attract specific pods to a node based on matching labels.","To repel pods from scheduling onto a node unless the pod has a matching 'Toleration'.","To mark a node as completely unschedulable (cordon) so no pods can run on it.","To isolate a namespace's network traffic from other namespaces."],
    correctAnswer: 1,
    explanation: "Taints are applied to nodes to repel pods. A pod cannot schedule onto a tainted node unless it has a specific Toleration that matches the taint. This is used for dedicating nodes to specific workloads or handling node problems."
  },
  {
    id: "devops-23",
    role: "DevOps Engineer",
    difficulty: "expert",
    question: "During a Docker build, which instruction invalidates the build cache for ALL subsequent instructions if the evaluated value changes?",
    options: ["ENV","EXPOSE","ARG","LABEL"],
    correctAnswer: 2,
    explanation: "When an `ARG` value changes during a build (passed via `--build-arg`), the instruction where it is first used and all subsequent layers are cache-invalidated because the build environment has effectively changed."
  },
  {
    id: "devops-24",
    role: "DevOps Engineer",
    difficulty: "chaos",
    question: "You are managing AWS infrastructure with Terraform. What is the impact of manually changing a resource's tag in the AWS Console instead of updating the Terraform code?",
    options: ["Terraform will fail on the next 'apply' due to an unexpected state conflict.","Terraform will overwrite the manual tag on the next 'apply' to match the configuration in the code.","Terraform will ignore the manual tag unless 'ignore_changes' is explicitly disabled.","The AWS Console prevents manual tag changes on resources created by Terraform."],
    correctAnswer: 1,
    explanation: "Terraform aims to make the real-world infrastructure match the code. Since the code doesn't have the manual tag, the next `terraform apply` will detect drift and remove the manual tag to bring the resource back to the desired state defined in code."
  },
  {
    id: "devops-25",
    role: "DevOps Engineer",
    difficulty: "hard",
    question: "In a Linux system, what is the purpose of the '/etc/fstab' file?",
    options: ["To store firewall rules for iptables.","To configure DNS resolution order and nameservers.","To define how disk partitions, block devices, or remote filesystems should be automatically mounted into the filesystem.","To store encrypted user passwords and shadow hashes."],
    correctAnswer: 2,
    explanation: "The `/etc/fstab` (file systems table) file contains information about filesystems and mount points. It is read by the `mount` command at boot time to determine which filesystems to mount and with what options."
  },
  {
    id: "fde-1",
    role: "Forward Deployed Engineer",
    difficulty: "hard",
    question: "When deploying a containerized application into a strictly air-gapped environment without an internal registry, which approach reliably transfers multi-arch images with all dependencies?",
    options: ["Docker export/import pipeline.","Running a temporary registry via a bastion host.","Using docker save to generate a tar archive, transferring via physical media, and loading with docker load.","Executing docker commit on running containers and migrating the layers over SSH."],
    correctAnswer: 2,
    explanation: "Docker save generates a complete tarball of the image layers, suitable for physical transfer into an air-gapped environment, whereas export only captures the filesystem state without metadata or layers, and pulling/running requires a registry."
  },
  {
    id: "fde-2",
    role: "Forward Deployed Engineer",
    difficulty: "expert",
    question: "A customer's legacy system only supports SAML 2.0, but your modern application uses OpenID Connect (OIDC). What is the most robust architectural pattern to integrate them without rewriting the legacy system?",
    options: ["Implement a SAML parser directly in the frontend application.","Deploy an Identity Provider (IdP) broker/gateway that acts as an OIDC provider to your app and a SAML Service Provider to the legacy system.","Use a JWT-to-SAML token exchange service within the API Gateway.","Embed an iframe in the application to handle the SAML POST binding securely."],
    correctAnswer: 1,
    explanation: "An identity broker pattern translates protocols at the edge. It acts as an OIDC provider for modern applications while communicating with legacy SAML IdPs, decoupling protocol complexities from application code."
  },
  {
    id: "fde-3",
    role: "Forward Deployed Engineer",
    difficulty: "chaos",
    question: "While debugging an intermittent timeout connecting to a customer's on-premise database over an IPSec VPN, you notice large queries fail while small ones succeed. What is the most likely root cause?",
    options: ["Path MTU Discovery (PMTUD) failure caused by ICMP traffic being dropped by the firewall.","The database connection pool is exhausting available sockets.","TCP Window Scaling is disabled on the customer's router.","The IPSec VPN is fragmenting packets at the application layer."],
    correctAnswer: 0,
    explanation: "If ICMP 'Fragmentation Needed' messages are blocked by a firewall, PMTUD fails. Large packets exceed the VPN tunnel's lower MTU, get dropped silently, and cause large queries to hang, while small packets pass through."
  },
  {
    id: "fde-4",
    role: "Forward Deployed Engineer",
    difficulty: "hard",
    question: "To extract logs from a deeply nested customer VM without public internet access or direct inbound SSH, how can you establish a reliable tunnel to pull data?",
    options: ["Configure a cron job to email logs daily.","Use SSH Local Port Forwarding (ssh -L) from the bastion host.","Establish a reverse SSH tunnel (ssh -R) from the customer VM to an external jump server you control.","Set up an FTP server on the bastion host and push logs via SMB."],
    correctAnswer: 2,
    explanation: "A reverse SSH tunnel allows a machine in a restricted internal network to initiate an outbound connection to an external server, thereby opening a port on the external server that forwards traffic back into the internal VM."
  },
  {
    id: "fde-5",
    role: "Forward Deployed Engineer",
    difficulty: "expert",
    question: "An enterprise customer requires strict mutual TLS (mTLS) between their load balancer and your deployed application. Which combination of certificates must the application server present and validate?",
    options: ["Present its own server certificate, validate the client's certificate against a trusted CA.","Present the client's certificate, validate the server's certificate.","Present a self-signed root CA, validate the Let's Encrypt intermediate CA.","Present the Load Balancer's public key, validate the server's private key."],
    correctAnswer: 0,
    explanation: "In mTLS, both parties authenticate. The application server must present its server certificate to identify itself to the load balancer, and it must request and validate the client certificate sent by the load balancer against a trusted Certificate Authority."
  },
  {
    id: "fde-6",
    role: "Forward Deployed Engineer",
    difficulty: "chaos",
    question: "A deployment on a customer's restricted Linux environment fails because the application binary attempts to bind to port 443. The customer refuses to run the application as root. What is the most secure and least intrusive solution?",
    options: ["Configure iptables to forward port 443 to a high port (e.g., 8443) where the application binds.","Run the application inside a rootless Docker container using port mapping.","Assign the CAP_NET_BIND_SERVICE capability to the specific application binary using setcap.","Use an LDAP service account to temporarily elevate privileges during startup."],
    correctAnswer: 2,
    explanation: "The setcap command grants the specific capability to bind to privileged ports (CAP_NET_BIND_SERVICE) to a single executable without requiring full root access or complex network configurations."
  },
  {
    id: "fde-7",
    role: "Forward Deployed Engineer",
    difficulty: "hard",
    question: "When deploying a Helm chart into an air-gapped Kubernetes cluster, the pods fail with 'ImagePullBackOff'. Which sequence of steps best resolves this assuming images are transferred via tarball?",
    options: ["scp the tarballs, extract to /var/lib/docker on all nodes, and restart kubelet.","Load images into a private registry inside the air-gapped network, then update the Helm chart's values to point to this internal registry.","Change imagePullPolicy to 'Always' to force local caching.","Manually edit the deployment YAMLs via kubectl to remove registry prefixes."],
    correctAnswer: 1,
    explanation: "In an air-gapped environment, images must be loaded into a local private registry accessible to the cluster, and deployment manifests (Helm values) must be updated to reference this internal registry's URL."
  },
  {
    id: "fde-8",
    role: "Forward Deployed Engineer",
    difficulty: "expert",
    question: "An enterprise environment intercepts all outbound HTTPS traffic using a transparent proxy that rewrites TLS certificates. Your application fails to communicate with external APIs due to certificate errors. How do you resolve this?",
    options: ["Disable TLS verification in the application globally.","Tunnel the application traffic over a UDP-based VPN.","Append the enterprise proxy's custom Root CA certificate to the application's trusted certificate store.","Change the API endpoints from HTTPS to HTTP."],
    correctAnswer: 2,
    explanation: "Transparent TLS inspection proxies work by dynamically generating certificates signed by an internal Root CA. For applications to trust these certificates, the internal Root CA must be added to the application's specific trust store."
  },
  {
    id: "fde-9",
    role: "Forward Deployed Engineer",
    difficulty: "chaos",
    question: "You are integrating with an on-premise Kerberos authentication system (Active Directory). Authentication intermittently fails with 'Clock skew too great' errors. What is the standard threshold and proper mitigation?",
    options: ["The threshold is 1 minute; sync the application server to a public NTP pool.","The threshold is 5 minutes; synchronize both the application server and the domain controller to the same internal NTP server.","The threshold is 15 minutes; increase the skew tolerance in the krb5.conf file.","The threshold is 30 seconds; configure the application to ignore timestamps in Kerberos tickets."],
    correctAnswer: 1,
    explanation: "Kerberos relies heavily on timestamps to prevent replay attacks, with a default maximum tolerance of 5 minutes. To fix clock skew issues, all participating systems must sync to a common, reliable NTP source."
  },
  {
    id: "fde-10",
    role: "Forward Deployed Engineer",
    difficulty: "hard",
    question: "A customer requires you to deploy a highly available service, but their network does not support hardware load balancers. Which software approach allows IP failover between two VMs on the same subnet?",
    options: ["Configuring identical static IP addresses on both VMs.","Using Keepalived with VRRP (Virtual Router Redundancy Protocol) to float a virtual IP (VIP) between the VMs.","Implementing Round-Robin DNS with a TTL of 0.","Using iptables NAT rules to load balance traffic."],
    correctAnswer: 1,
    explanation: "Keepalived uses VRRP to manage a floating Virtual IP (VIP). If the primary node fails, the secondary node automatically assumes the VIP, ensuring high availability at the network layer."
  },
  {
    id: "fde-11",
    role: "Forward Deployed Engineer",
    difficulty: "expert",
    question: "Your application must fetch large datasets from a legacy SOAP service that frequently times out. To improve resilience and performance without changing the legacy service, which pattern should you apply?",
    options: ["Implement a Circuit Breaker pattern with a stale-cache fallback in a proxy layer.","Increase the TCP timeout on the legacy server's OS.","Convert the SOAP service to REST using an API Gateway and disable timeouts.","Use synchronous blocking calls to ensure data integrity."],
    correctAnswer: 0,
    explanation: "A Circuit Breaker prevents cascading failures by stopping calls to a failing service. Combining it with a stale-cache fallback allows the application to serve previously fetched data while the legacy system recovers, improving perceived resilience."
  },
  {
    id: "fde-12",
    role: "Forward Deployed Engineer",
    difficulty: "chaos",
    question: "When configuring a reverse proxy for WebSockets through an enterprise Web Application Firewall (WAF), connections drop immediately after the handshake. What is the most likely HTTP header missing in the proxy configuration?",
    options: ["Access-Control-Allow-Origin: *","Connection: Upgrade and Upgrade: websocket","X-Forwarded-Proto: wss","Strict-Transport-Security: max-age=31536000"],
    correctAnswer: 1,
    explanation: "WebSockets require the HTTP connection to be explicitly 'upgraded' from HTTP to the WebSocket protocol. If a proxy does not pass the 'Connection: Upgrade' and 'Upgrade: websocket' headers from the client to the backend, the upgrade fails."
  },
  {
    id: "fde-13",
    role: "Forward Deployed Engineer",
    difficulty: "hard",
    question: "An on-premise installation requires storing sensitive configuration secrets. The environment is fully disconnected. Which solution provides the best balance of security and operational viability?",
    options: ["Hardcode secrets in obfuscated binary code.","Store secrets in plaintext within a restricted Linux permissions folder (chmod 400).","Deploy a local HashiCorp Vault instance utilizing Auto Unseal with a local KMS or Shamir's Secret Sharing.","Encrypt secrets using a public key, where the private key is downloaded dynamically from the internet."],
    correctAnswer: 2,
    explanation: "A local secrets management system like Vault provides encryption at rest, access control, and auditing. Shamir's Secret Sharing allows multiple operators to securely unseal the vault in a fully air-gapped environment."
  },
  {
    id: "fde-14",
    role: "Forward Deployed Engineer",
    difficulty: "expert",
    question: "You deploy an application behind a customer's Nginx reverse proxy. The application logs show all incoming requests originating from the proxy's internal IP address instead of the actual client IPs. How do you fix this?",
    options: ["Configure Nginx to send the 'X-Forwarded-For' header and configure the application to trust the proxy's IP to parse this header.","Change the proxy protocol from HTTP to TCP.","Enable transparent proxying using iptables TPROXY module.","Use DNS to resolve the client IP dynamically within the application."],
    correctAnswer: 0,
    explanation: "Reverse proxies terminate the TCP connection, changing the source IP. To pass the original client IP, proxies add the 'X-Forwarded-For' header. The application must be explicitly configured to trust the proxy's IP and read this header."
  },
  {
    id: "fde-15",
    role: "Forward Deployed Engineer",
    difficulty: "chaos",
    question: "A customer network restricts outbound traffic, only allowing access to specific domains via an SNI-aware proxy. If an application uses an IP address instead of a hostname to connect to an allowed external API, what happens?",
    options: ["The connection succeeds because the proxy resolves the IP internally.","The proxy translates the IP to a hostname via reverse DNS and forwards it.","The connection is rejected because the TLS ClientHello lacks the Server Name Indication (SNI) extension containing the allowed hostname.","The application automatically falls back to HTTP."],
    correctAnswer: 2,
    explanation: "SNI-aware proxies inspect the TLS ClientHello packet to determine the destination hostname. If a direct IP is used, the SNI extension is typically omitted or invalid, causing the proxy to drop the connection since it cannot verify the allowed domain."
  },
  {
    id: "fde-16",
    role: "Forward Deployed Engineer",
    difficulty: "hard",
    question: "A customer's LDAP server contains deeply nested groups (groups within groups). Your application needs to authorize users based on group membership. Which LDAP query strategy is most efficient for Active Directory?",
    options: ["Recursively query each group in the application code.","Use the LDAP_MATCHING_RULE_IN_CHAIN (OID 1.2.840.113556.1.4.1941) operator in the search filter.","Download the entire directory tree and evaluate relationships in memory.","Query the 'memberOf' attribute, which automatically expands all nested groups by default."],
    correctAnswer: 1,
    explanation: "Active Directory supports the LDAP_MATCHING_RULE_IN_CHAIN operator, which performs nested group expansion entirely on the server side, vastly reducing network overhead and application complexity compared to recursive client-side queries."
  },
  {
    id: "fde-17",
    role: "Forward Deployed Engineer",
    difficulty: "expert",
    question: "When debugging a performance issue in an enterprise deployment, you notice that fetching a specific 10MB JSON payload takes 30 seconds, while raw bandwidth is over 1Gbps. TCP analysis shows high 'Retransmission Timeouts'. What is the likely cause?",
    options: ["The JSON parser is single-threaded.","Network Interface Card (NIC) driver buffer bloat.","Asymmetric routing causing packets to arrive out of order and TCP window collapse.","The application is using UDP instead of TCP."],
    correctAnswer: 2,
    explanation: "Asymmetric routing (where outbound and inbound paths differ) can cause stateful firewalls to drop packets or lead to severe out-of-order delivery. This triggers continuous TCP Retransmission Timeouts (RTOs) and window collapse, destroying throughput for large payloads."
  },
  {
    id: "fde-18",
    role: "Forward Deployed Engineer",
    difficulty: "chaos",
    question: "An enterprise client requires offline software licensing. They provide a signed JWT as a license file. How can the completely disconnected application mathematically verify the license is authentic and hasn't expired?",
    options: ["By making a single outbound API call during installation.","By verifying the JWT signature using an embedded public key from the vendor and checking the 'exp' claim against the system clock.","By requiring the customer to input an RSA private key.","By hashing the JWT with MD5 and checking a local database."],
    correctAnswer: 1,
    explanation: "In an offline environment, the application can cryptographically verify the authenticity of a JWT using a pre-embedded public key. If the signature matches, the payload is trusted, allowing the application to check the 'exp' (expiration) claim locally."
  },
  {
    id: "fde-19",
    role: "Forward Deployed Engineer",
    difficulty: "hard",
    question: "In a locked-down SELinux environment, your newly installed application service fails to start, logging 'Permission denied' when accessing its configuration file in /opt/app/config. The file permissions are correctly set to 644 for the app user. What command diagnoses the SELinux block?",
    options: ["chmod 777 /opt/app/config","chown root:root /opt/app/config","ausearch -m AVC -ts recent","setenforce 1"],
    correctAnswer: 2,
    explanation: "SELinux denials are logged as Access Vector Cache (AVC) messages. 'ausearch -m AVC' searches the audit logs specifically for these SELinux denials, revealing the context mismatch causing the permission denied error despite standard Linux permissions being correct."
  },
  {
    id: "fde-20",
    role: "Forward Deployed Engineer",
    difficulty: "expert",
    question: "Your microservices architecture is deployed across multiple customer sites. You need to securely connect services across these disparate, NAT-ed environments without opening inbound firewall ports. Which technology fits best?",
    options: ["Site-to-Site IPsec VPN.","A mesh VPN overlay network (e.g., WireGuard/Tailscale) utilizing UDP hole punching or relay nodes.","Exposing services directly via Public IP addresses.","Using standard SSH Local Port Forwarding for all traffic."],
    correctAnswer: 1,
    explanation: "Overlay networks like Tailscale or custom WireGuard setups establish secure, peer-to-peer mesh networks across NAT boundaries and firewalls. They use UDP hole punching to establish direct connections or fall back to relays, requiring zero inbound port openings."
  },
  {
    id: "fde-21",
    role: "Forward Deployed Engineer",
    difficulty: "chaos",
    question: "A Java application deployed on a legacy AIX system throws a 'java.security.InvalidKeyException: Illegal key size' when attempting AES-256 encryption. What is the root cause and standard fix?",
    options: ["The CPU does not support AES-NI instructions; disable hardware acceleration.","The Java Cryptography Extension (JCE) Unlimited Strength Jurisdiction Policy Files are not installed in the JVM.","The AES key is exactly 256 bytes long instead of 256 bits.","AIX natively blocks AES-256 for compliance reasons."],
    correctAnswer: 1,
    explanation: "Older Java versions (prior to 8u162) enforce export restrictions on cryptographic key sizes by default, limiting AES to 128-bit. To use 256-bit AES, the JCE Unlimited Strength Jurisdiction Policy Files must be manually installed in the JRE."
  },
  {
    id: "fde-22",
    role: "Forward Deployed Engineer",
    difficulty: "hard",
    question: "A customer uses a forward proxy that requires NTLM authentication. Your Linux-based Dockerized application only supports Basic Auth or no auth for outbound proxies. How do you allow the application to reach the internet?",
    options: ["Compile the application with NTLM headers hardcoded.","Deploy a local proxy like Cntlm or PX that handles NTLM authentication upstream and exposes an unauthenticated proxy locally to the container.","Change the Docker daemon to run as a Windows container.","Bypass the proxy using an ICMP tunnel."],
    correctAnswer: 1,
    explanation: "Cntlm or PX act as intermediate proxy servers. They listen locally without authentication (or with Basic Auth), accept requests from the application, and handle the complex NTLM challenge-response handshake with the corporate forward proxy."
  },
  {
    id: "fde-23",
    role: "Forward Deployed Engineer",
    difficulty: "expert",
    question: "During an on-prem deployment, your containerized database suffers data corruption whenever the VM reboots. The customer provisions storage via NFS. What mount option is critical to prevent database corruption on NFS?",
    options: ["async","ro (read-only)","hard,sync","soft,nolock"],
    correctAnswer: 2,
    explanation: "Databases require strict POSIX file semantics and synchronous writes to ensure data integrity. NFS 'hard' mounts ensure requests are retried indefinitely, and 'sync' ensures writes are committed to stable storage before the server responds, preventing corruption on reboot."
  },
  {
    id: "fde-24",
    role: "Forward Deployed Engineer",
    difficulty: "chaos",
    question: "In an air-gapped system, the Certificate Revocation List (CRL) for the internal PKI has expired, causing application TLS handshakes to fail. A new CRL cannot be imported immediately. What is the riskiest but fastest temporary mitigation?",
    options: ["Generate a self-signed certificate for every client.","Modify the application's TLS configuration to disable CRL checking (e.g., set revocation check to false).","Change the system clock backwards.","Manually edit the binary CRL file to extend the date."],
    correctAnswer: 1,
    explanation: "While highly risky because it allows compromised certificates to be accepted, temporarily disabling CRL/OCSP checking in the application code or configuration bypasses the expiration block, restoring service until the air-gap allows a fresh CRL import."
  },
  {
    id: "fde-25",
    role: "Forward Deployed Engineer",
    difficulty: "hard",
    question: "A customer environment dynamically rotates database credentials every hour via CyberArk. How should a stateless containerized microservice handle these rotating secrets without downtime?",
    options: ["Mount the secret as an environment variable and restart the container hourly.","Hardcode a master DBA password to bypass the rotation.","Use a sidecar container that fetches the credential and writes it to a shared tmpfs volume, while the application dynamically re-reads the file or uses a dynamic connection pool.","Rely on DNS caching to handle the failover."],
    correctAnswer: 2,
    explanation: "Environment variables are static for the life of a process. A dynamic approach uses a sidecar/agent to retrieve secrets and write them to an in-memory volume. The application must be designed to watch this file or dynamically request the credential upon connection pool exhaustion."
  },
  {
    id: "frontend-1",
    role: "Frontend Engineer",
    difficulty: "expert",
    question: "What is the result of evaluating `['1', '7', '11'].map(parseInt)` in JavaScript?",
    options: ["[1, NaN, 3]","[1, 7, 11]","[1, NaN, 11]","[1, 7, 3]"],
    correctAnswer: 0,
    explanation: "`map` passes `(element, index, array)` to `parseInt`, which expects `(string, radix)`. Index 0: radix 0 defaults to 10 -> 1. Index 1: radix 1 is invalid -> NaN. Index 2: radix 2 parses '11' as binary -> 3."
  },
  {
    id: "frontend-2",
    role: "Frontend Engineer",
    difficulty: "chaos",
    question: "What does the expression `[] == ![]` evaluate to in JavaScript?",
    options: ["true","false","TypeError","undefined"],
    correctAnswer: 0,
    explanation: "`![]` evaluates to `false`. `[] == false` converts both to primitives. `[]` becomes `\"\"` then `0`. `false` becomes `0`. `0 == 0` evaluates to `true`."
  },
  {
    id: "frontend-3",
    role: "Frontend Engineer",
    difficulty: "hard",
    question: "In React 18, in what order do `useEffect` cleanups and setups run when a component's dependency updates?",
    options: ["Previous render's cleanup -> Next render's setup","Next render's setup -> Previous render's cleanup","Concurrently on different threads","Cleanup runs unmount, setup runs mount"],
    correctAnswer: 0,
    explanation: "React cleans up effects from the previous render before running the effects for the next render to ensure no memory leaks and proper resetting of subscriptions."
  },
  {
    id: "frontend-4",
    role: "Frontend Engineer",
    difficulty: "expert",
    question: "What is the logging order of the following? `console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3)); console.log(4);`",
    options: ["1, 4, 3, 2","1, 4, 2, 3","1, 2, 3, 4","1, 3, 4, 2"],
    correctAnswer: 0,
    explanation: "Synchronous logs (1, 4) run first. Microtasks (Promise resolutions) like 3 run after the current synchronous code. Macrotasks (setTimeout) like 2 run in the next iteration of the event loop."
  },
  {
    id: "frontend-5",
    role: "Frontend Engineer",
    difficulty: "hard",
    question: "Which of the following CSS property combinations does NOT necessarily create a new stacking context?",
    options: ["display: flex;","opacity: 0.9;","transform: scale(1);","position: relative; z-index: 1;"],
    correctAnswer: 0,
    explanation: "`display: flex` alone does not create a stacking context. However, if a flex item has a `z-index` other than `auto`, it does create one. The others always create a stacking context."
  },
  {
    id: "frontend-6",
    role: "Frontend Engineer",
    difficulty: "expert",
    question: "How do you signal to Webpack that a module has no side effects, optimizing tree shaking?",
    options: ["Add `\"sideEffects\": false` to the library's `package.json`","Use `import { pure } from 'module'`","Set `optimization.treeShake` to `true` in `webpack.config.js`","Prepend exports with `/* webpackPure */`"],
    correctAnswer: 0,
    explanation: "The `\"sideEffects\": false` field in `package.json` tells Webpack that it can safely remove unused exports from the files because evaluating them has no side effects."
  },
  {
    id: "frontend-7",
    role: "Frontend Engineer",
    difficulty: "hard",
    question: "What is the difference between `e.stopPropagation()` and `e.stopImmediatePropagation()`?",
    options: ["`stopImmediatePropagation` also prevents other listeners attached to the SAME element from executing.","`stopImmediatePropagation` immediately stops the event, while `stopPropagation` waits for the next JS tick.","There is no functional difference; they are aliases.","`stopPropagation` prevents default browser behavior, while `stopImmediatePropagation` stops bubbling."],
    correctAnswer: 0,
    explanation: "`stopPropagation` prevents the event from bubbling up to parent elements, while `stopImmediatePropagation` also prevents any remaining event listeners attached to the current element from firing."
  },
  {
    id: "frontend-8",
    role: "Frontend Engineer",
    difficulty: "hard",
    question: "Why is using an array index as a `key` in React lists considered an anti-pattern when items can be reordered?",
    options: ["React may reuse wrong component instances, incorrectly mapping old state to new data.","It bypasses the Virtual DOM and updates the real DOM immediately.","Array indices are numbers, and React strictly requires string keys.","It causes React to throw a fatal error in StrictMode."],
    correctAnswer: 0,
    explanation: "When items are reordered or deleted, keys based on indices will remain the same for different elements, tricking React into reusing component state and DOM elements for the wrong data items."
  },
  {
    id: "frontend-9",
    role: "Frontend Engineer",
    difficulty: "expert",
    question: "Which of the following JavaScript operations forces a synchronous browser layout (reflow)?",
    options: ["Accessing `element.offsetHeight`","Modifying `element.style.width`","Calling `element.classList.add()`","Reading `element.getAttribute('id')`"],
    correctAnswer: 0,
    explanation: "Accessing geometric or layout properties like `offsetHeight` forces the browser to flush pending DOM changes and synchronously calculate layout to provide accurate pixel values."
  },
  {
    id: "frontend-10",
    role: "Frontend Engineer",
    difficulty: "chaos",
    question: "What is the output? `const obj = { name: 'A', log: function() { const f = () => console.log(this.name); f(); } }; obj.log();`",
    options: ["A","undefined","null","TypeError"],
    correctAnswer: 0,
    explanation: "Arrow functions do not bind their own `this`. They inherit it from the enclosing lexical scope, which is the `log` function. Since `log` was called on `obj`, `this` is `obj`, logging 'A'."
  },
  {
    id: "frontend-11",
    role: "Frontend Engineer",
    difficulty: "expert",
    question: "What is the specificity weight of the CSS selector `#nav ul.menu li a:hover`?",
    options: ["1, 2, 3","1, 1, 4","0, 2, 3","1, 3, 2"],
    correctAnswer: 0,
    explanation: "The selector has 1 ID (`#nav`), 2 classes/pseudo-classes (`.menu` and `:hover`), and 3 elements (`ul`, `li`, `a`), resulting in a specificity of 1, 2, 3."
  },
  {
    id: "frontend-12",
    role: "Frontend Engineer",
    difficulty: "hard",
    question: "In a CSS Flexbox or Grid, why might a child element cause its parent to overflow despite the parent having `overflow: hidden`?",
    options: ["The child has an implied `min-width: auto`, preventing it from shrinking smaller than its content.","The parent lacks `box-sizing: border-box`.","Flexbox and Grid ignore the `overflow` property natively.","The child must be absolutely positioned to obey parent overflow restrictions."],
    correctAnswer: 0,
    explanation: "By default, flex and grid items have a `min-width` (or `min-height`) of `auto`, which prevents them from shrinking below the intrinsic size of their content. Setting `min-width: 0` overrides this."
  },
  {
    id: "frontend-13",
    role: "Frontend Engineer",
    difficulty: "hard",
    question: "What is the core distinction between `Map` and `WeakMap` in JavaScript?",
    options: ["Keys in a `WeakMap` must be objects and are weakly referenced, allowing them to be garbage collected.","`WeakMap` keys can be primitives but are garbage collected immediately.","`Map` provides O(1) lookup whereas `WeakMap` provides O(N).","`WeakMap` can be iterated over using a `for...of` loop, while `Map` cannot."],
    correctAnswer: 0,
    explanation: "`WeakMap` requires keys to be objects (or non-registered symbols). These keys are held weakly, meaning if there are no other references to the key object, it can be garbage collected."
  },
  {
    id: "frontend-14",
    role: "Frontend Engineer",
    difficulty: "hard",
    question: "What vulnerability does a Content Security Policy (CSP) primarily mitigate?",
    options: ["Cross-Site Scripting (XSS)","Cross-Site Request Forgery (CSRF)","SQL Injection","Man-in-the-Middle (MitM) Attacks"],
    correctAnswer: 0,
    explanation: "CSP mitigates XSS by restricting the domains that the browser should consider to be valid sources of executable scripts, preventing unauthorized inline or external scripts from executing."
  },
  {
    id: "frontend-15",
    role: "Frontend Engineer",
    difficulty: "expert",
    question: "In a Node.js environment, what happens if `setImmediate` and `setTimeout(fn, 0)` are called inside an I/O cycle callback?",
    options: ["`setImmediate` will always be executed first.","`setTimeout` will always be executed first.","The order is non-deterministic.","They are executed in parallel on separate threads."],
    correctAnswer: 0,
    explanation: "Inside an I/O cycle, the event loop moves to the `check` phase immediately after polling for I/O. Therefore, callbacks scheduled by `setImmediate` are executed before any timers (`setTimeout`)."
  },
  {
    id: "frontend-16",
    role: "Frontend Engineer",
    difficulty: "expert",
    question: "What is the primary difference between `useTransition` and `useDeferredValue` in React?",
    options: ["`useTransition` wraps a state-updating function, while `useDeferredValue` wraps a state value.","`useDeferredValue` is synchronous, whereas `useTransition` is strictly asynchronous.","`useTransition` is for Redux, and `useDeferredValue` is for Context API.","They are identical aliases introduced in React 18."],
    correctAnswer: 0,
    explanation: "`useTransition` provides a `startTransition` function to wrap state-setting operations marking them as low-priority. `useDeferredValue` takes a value and returns a delayed version of it for non-urgent UI updates."
  },
  {
    id: "frontend-17",
    role: "Frontend Engineer",
    difficulty: "chaos",
    question: "What does `Object.create(null) instanceof Object` evaluate to?",
    options: ["false","true","TypeError","undefined"],
    correctAnswer: 0,
    explanation: "`Object.create(null)` creates an object with a `null` prototype, meaning it does not inherit from `Object.prototype`. Thus, the `instanceof` check against `Object` returns `false`."
  },
  {
    id: "frontend-18",
    role: "Frontend Engineer",
    difficulty: "hard",
    question: "In React, what happens if you completely omit the dependency array in a `useEffect` hook?",
    options: ["The effect runs after every single render.","The effect runs only once after the initial mount.","The effect never runs.","React throws a StrictMode warning and ignores the effect."],
    correctAnswer: 0,
    explanation: "If the dependency array is omitted, React doesn't know what values to compare, so it defaults to running the effect after every render."
  },
  {
    id: "frontend-19",
    role: "Frontend Engineer",
    difficulty: "expert",
    question: "Which HTTP header is typically used to provide strong cache validation by returning a hash of the resource content?",
    options: ["ETag","Last-Modified","Cache-Control","Vary"],
    correctAnswer: 0,
    explanation: "The `ETag` (Entity Tag) header provides a unique identifier (often a hash) representing the exact content of the resource, ensuring a strong validation of cached data."
  },
  {
    id: "frontend-20",
    role: "Frontend Engineer",
    difficulty: "hard",
    question: "How does `Promise.allSettled` differ from `Promise.all`?",
    options: ["`Promise.allSettled` waits for all promises to resolve or reject, while `Promise.all` short-circuits on the first rejection.","`Promise.allSettled` resolves only when all promises resolve successfully.","`Promise.allSettled` returns the first promise to settle, ignoring the rest.","`Promise.all` returns objects with status flags, whereas `Promise.allSettled` returns raw values."],
    correctAnswer: 0,
    explanation: "`Promise.all` fails fast if any promise rejects. `Promise.allSettled` always waits for all input promises to either fulfill or reject, returning an array of objects describing each outcome."
  },
  {
    id: "frontend-21",
    role: "Frontend Engineer",
    difficulty: "chaos",
    question: "What is logged to the console? `for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 10); }`",
    options: ["3, 3, 3","0, 1, 2","undefined, undefined, undefined","0, 0, 0"],
    correctAnswer: 0,
    explanation: "Because `var` is function-scoped (or globally scoped here), the loop finishes running before the timeouts execute, leaving `i` at 3. The closures all capture a reference to the same `i`."
  },
  {
    id: "frontend-22",
    role: "Frontend Engineer",
    difficulty: "expert",
    question: "Which CSS pseudo-element allows styling of explicitly exposed elements inside a Shadow DOM from the global styles?",
    options: ["::part()",":host","::slotted()","::shadow"],
    correctAnswer: 0,
    explanation: "The `::part()` pseudo-element targets elements inside a shadow tree that have a `part` attribute, allowing component authors to safely expose specific nodes for external styling."
  },
  {
    id: "frontend-23",
    role: "Frontend Engineer",
    difficulty: "hard",
    question: "What does `typeof null` evaluate to in JavaScript?",
    options: ["\"object\"","\"null\"","\"undefined\"","TypeError"],
    correctAnswer: 0,
    explanation: "This is a historical bug in JavaScript. The original implementation used a 32-bit system where `null` was represented by the NULL pointer (0x00), which coincidentally shared its type tag (0) with objects."
  },
  {
    id: "frontend-24",
    role: "Frontend Engineer",
    difficulty: "hard",
    question: "In a Webpack configuration, what is the primary structural effect of using a dynamic `import()` statement?",
    options: ["It signals Webpack to split the imported module into its own separate chunk file (code splitting).","It forces the module to be synchronously bundled into the main entry chunk.","It completely disables tree shaking for that specific module.","It transpiles CommonJS imports into ES6 static imports."],
    correctAnswer: 0,
    explanation: "Dynamic imports (`import('module')`) tell Webpack to perform code splitting, generating a new chunk file that is only fetched over the network when the code is executed."
  },
  {
    id: "frontend-25",
    role: "Frontend Engineer",
    difficulty: "expert",
    question: "In the Service Worker lifecycle, when does the `activate` event typically fire?",
    options: ["After the new worker is installed and all clients controlled by the previous worker have been closed.","Immediately after the script is downloaded and parsed.","Every time the browser intercepts a network `fetch` request.","Only when the user clicks 'Update' in Chrome DevTools."],
    correctAnswer: 0,
    explanation: "A new Service Worker waits in the 'installed' phase to ensure consistency. It transitions to 'activating' only when there are no active clients (tabs/windows) still using the older version."
  },
  {
    id: "fullstack-1",
    role: "Full Stack Engineer",
    difficulty: "hard",
    question: "Which of the following scenarios will cause a React SSR hydration mismatch warning, but will NOT automatically patch the DOM to match the client render?",
    options: ["Using `Date.now()` inside a component's render function.","Rendering an entirely different subtree based on `window.innerWidth`.","A missing `<tbody>` tag inside a `<table>` in the raw HTML string.","Rendering a text node on the server that differs from the client text node."],
    correctAnswer: 2,
    explanation: "React attempts to patch text node differences during hydration. However, browser parsers will automatically insert a <tbody> if it's missing in the raw HTML, meaning the DOM tree structure React expects based on the virtual DOM will not match the actual DOM nodes the browser created, causing a mismatch that React cannot safely auto-patch without re-rendering."
  },
  {
    id: "fullstack-2",
    role: "Full Stack Engineer",
    difficulty: "expert",
    question: "When configuring a cross-origin request using `fetch` with `credentials: 'include'`, which of the following CORS headers MUST the server provide to successfully read the response?",
    options: ["Access-Control-Allow-Origin: *","Access-Control-Allow-Credentials: true and Access-Control-Allow-Origin: <specific-origin>","Access-Control-Allow-Credentials: true and Access-Control-Allow-Origin: *","Access-Control-Allow-Headers: Authorization"],
    correctAnswer: 1,
    explanation: "When making a credentialed cross-origin request, the server cannot use the wildcard '*' for Access-Control-Allow-Origin. It must explicitly state the origin of the request, and it must also set Access-Control-Allow-Credentials to true."
  },
  {
    id: "fullstack-3",
    role: "Full Stack Engineer",
    difficulty: "chaos",
    question: "In PostgreSQL, under the `REPEATABLE READ` transaction isolation level, which of the following anomalies is specifically PREVENTED according to the SQL standard, but still possible in some other DB engines?",
    options: ["Dirty Reads","Non-repeatable Reads","Phantom Reads","Serialization Anomaly"],
    correctAnswer: 1,
    explanation: "The SQL standard mandates that REPEATABLE READ prevents Dirty Reads and Non-repeatable reads. In PostgreSQL, REPEATABLE READ also prevents Phantom Reads (which is stricter than the standard requires), but the specific anomaly the level is named for preventing (compared to Read Committed) is Non-repeatable Reads."
  },
  {
    id: "fullstack-4",
    role: "Full Stack Engineer",
    difficulty: "expert",
    question: "What is the primary architectural difference between Server-Sent Events (SSE) and WebSockets?",
    options: ["SSE uses UDP, while WebSockets use TCP.","SSE is unidirectional (server-to-client) over a single HTTP connection, while WebSockets are bidirectional over a custom protocol.","WebSockets support automatic reconnection out-of-the-box, while SSE requires manual implementation.","SSE can transmit binary data natively, whereas WebSockets only transmit base64-encoded strings."],
    correctAnswer: 1,
    explanation: "SSE is a strictly unidirectional protocol where the server streams text data over a long-lived HTTP connection. WebSockets provide full-duplex, bidirectional communication over a single TCP connection, upgrading from HTTP to the WebSocket protocol."
  },
  {
    id: "fullstack-5",
    role: "Full Stack Engineer",
    difficulty: "hard",
    question: "Consider the following Node.js code:\n\n```javascript\nsetTimeout(() => console.log('A'), 0);\nPromise.resolve().then(() => console.log('B'));\nprocess.nextTick(() => console.log('C'));\n```\nWhat is the exact output order?",
    options: ["A, B, C","C, B, A","B, C, A","C, A, B"],
    correctAnswer: 1,
    explanation: "In Node.js, `process.nextTick` callbacks are executed immediately after the current operation and before the event loop continues. Microtasks (like Promise callbacks) execute next. Macrotasks (like `setTimeout`) execute in the next phase of the event loop. Therefore, C (nextTick) runs first, then B (Promise), then A (setTimeout)."
  },
  {
    id: "fullstack-6",
    role: "Full Stack Engineer",
    difficulty: "hard",
    question: "How does HTTP/3 solve the Head-of-Line (HoL) blocking problem that exists in HTTP/2?",
    options: ["By using multiplexing over a single TCP connection.","By opening multiple concurrent TCP connections.","By replacing TCP with QUIC (built on UDP), where streams are independent at the transport layer.","By using Server Push to send resources before the client requests them."],
    correctAnswer: 2,
    explanation: "HTTP/2 suffers from TCP-level HoL blocking; if a single packet is lost, all multiplexed streams wait for its retransmission. HTTP/3 uses QUIC over UDP, managing independent streams at the transport layer, so packet loss only affects the specific stream missing the packet."
  },
  {
    id: "fullstack-7",
    role: "Full Stack Engineer",
    difficulty: "expert",
    question: "When dealing with GraphQL resolvers, what is the most standard technique to solve the N+1 query problem?",
    options: ["Using `JOIN` statements in the root query resolver.","Implementing a Data Loader pattern to batch and cache database requests.","Relying solely on Redis to cache individual entity queries.","Using GraphQL subscriptions to stream relational data."],
    correctAnswer: 1,
    explanation: "The Data Loader pattern (originally open-sourced by Facebook) collects all individual IDs requested by sibling resolvers during a single execution tick, and batches them into a single query (e.g., `WHERE id IN (...)`), effectively turning O(N) database queries into O(1)."
  },
  {
    id: "fullstack-8",
    role: "Full Stack Engineer",
    difficulty: "chaos",
    question: "You set a session cookie with `SameSite=Lax`. In which of the following scenarios will the cookie be sent to your origin on a cross-site request?",
    options: ["An AJAX POST request from another domain.","An image loaded via an `<img>` tag on another domain.","A user clicking a standard `<a>` link on another domain that navigates to your site (top-level navigation).","An `<iframe>` embedding your site on another domain."],
    correctAnswer: 2,
    explanation: "SameSite=Lax blocks cookies on cross-site subrequests (like images or iframes) and unsafe HTTP methods (like POST). It ONLY sends the cookie on cross-site requests if they are safe, top-level navigations, such as clicking a standard anchor link."
  },
  {
    id: "fullstack-9",
    role: "Full Stack Engineer",
    difficulty: "hard",
    question: "Which of the following attributes is strictly necessary on a JWT (JSON Web Token) to prevent interception by a malicious browser extension reading LocalStorage?",
    options: ["Setting an expiration (exp) claim.","Signing it with a strong RS256 private key.","None. JWTs in LocalStorage cannot be protected from browser extensions with access to the page context.","Encrypting the payload using JWE instead of JWS."],
    correctAnswer: 2,
    explanation: "Any script (including malicious extensions) running in the context of the page can read LocalStorage. Cryptography (JWS/JWE) protects data integrity or confidentiality in transit/at rest, but if the token itself is extracted, it can be used for session hijacking. The recommended approach is storing tokens in HttpOnly cookies."
  },
  {
    id: "fullstack-10",
    role: "Full Stack Engineer",
    difficulty: "expert",
    question: "What is the primary cause of a 'cache stampede' (or thundering herd) in a heavily trafficked web application?",
    options: ["Writing to the cache faster than the Redis instance can process commands.","Evicting keys using an LRU algorithm instead of LFU.","A highly requested cache key expiring, causing hundreds of concurrent requests to query the database simultaneously to rebuild the cache.","Failing to serialize JSON objects properly before writing them to Memcached."],
    correctAnswer: 2,
    explanation: "A cache stampede occurs when a popular cache item expires or is deleted. Suddenly, all concurrent requests for that item miss the cache and hit the underlying database simultaneously, potentially overwhelming it before the first request can repopulate the cache."
  },
  {
    id: "fullstack-11",
    role: "Full Stack Engineer",
    difficulty: "expert",
    question: "In a Node.js Express application, you notice memory usage steadily growing over days until the process crashes. Which pattern is the MOST likely culprit for this memory leak?",
    options: ["Using `JSON.parse` on large strings in a middleware.","Failing to close a database connection pool on application shutdown.","Adding a global event listener inside a request handler without ever removing it.","Using extensive `async/await` syntax instead of Promise chains."],
    correctAnswer: 2,
    explanation: "Adding listeners to a long-lived object (like the global `process` or a singleton EventEmitter) inside a per-request handler creates a closure over the request context. Since the listener is never removed, the event emitter holds a reference to it forever, preventing garbage collection of the request objects."
  },
  {
    id: "fullstack-12",
    role: "Full Stack Engineer",
    difficulty: "hard",
    question: "When defining an index in a SQL database to optimize the query `SELECT * FROM users WHERE last_name = 'Doe' AND age > 30 ORDER BY created_at DESC;`, which composite index structure is generally optimal?",
    options: ["(last_name, age, created_at)","(last_name, created_at, age)","(created_at, last_name, age)","(age, last_name, created_at)"],
    correctAnswer: 1,
    explanation: "The rule of thumb for composite indexes is Equality, Sort, Range. `last_name` is an equality check, `created_at` is the sort field, and `age` is a range check. If you put the range check (`age`) before the sort field, the database cannot use the index for sorting and must perform a filesort."
  },
  {
    id: "fullstack-13",
    role: "Full Stack Engineer",
    difficulty: "chaos",
    question: "What is a major limitation of using standard Web Workers for caching HTTP responses in a Progressive Web App (PWA)?",
    options: ["Web Workers do not have access to the CacheStorage API.","Web Workers cannot intercept network requests made by the main thread.","Web Workers are terminated immediately when the main thread executes an expensive operation.","Web Workers cannot execute asynchronous `fetch` calls."],
    correctAnswer: 1,
    explanation: "Standard Web Workers run scripts in the background but cannot intercept network requests. Service Workers, a specialized type of Web Worker, act as a network proxy and can intercept requests (via the `fetch` event) to implement offline caching strategies."
  },
  {
    id: "fullstack-14",
    role: "Full Stack Engineer",
    difficulty: "expert",
    question: "In CSS, under which specific condition will a child element with `z-index: 9999` render BEHIND a sibling element with `z-index: 1`?",
    options: ["When the sibling has `position: fixed`.","When the child element uses `mix-blend-mode`.","When the parent of the child element creates a stacking context with a lower `z-index` than the sibling.","When the sibling element has an `opacity` of 0.99."],
    correctAnswer: 2,
    explanation: "If a parent element creates a stacking context (e.g., via `position: relative; z-index: 0` or `opacity: 0.9`), all its children are bound within that context. Even if a child has `z-index: 9999`, it cannot escape its parent's stacking context. If a sibling to the parent has `z-index: 1`, it will render on top of the parent and all its children."
  },
  {
    id: "fullstack-15",
    role: "Full Stack Engineer",
    difficulty: "expert",
    question: "Why might a modern bundler like Webpack or Vite fail to tree-shake an unused function exported from a JavaScript module?",
    options: ["The module uses ES6 `import`/`export` syntax instead of CommonJS.","The bundler detects that executing the module might produce side-effects (e.g., modifying a global variable).","The unused function is an async generator.","Tree-shaking is disabled by default in production builds."],
    correctAnswer: 1,
    explanation: "Tree-shaking relies on static analysis. If the bundler cannot guarantee that a module is side-effect free (e.g., a top-level function call or mutation of `window`), it must include the code to preserve semantics. Developers can use the `\"sideEffects\": false` flag in package.json to hint to the bundler."
  },
  {
    id: "fullstack-16",
    role: "Full Stack Engineer",
    difficulty: "hard",
    question: "In the OAuth 2.0 Authorization Code flow with PKCE, what is the primary purpose of the `code_challenge` and `code_verifier`?",
    options: ["To prevent Cross-Site Request Forgery (CSRF) on the authorization endpoint.","To encrypt the JWT returned by the authorization server.","To ensure that the entity requesting the access token is the same entity that initiated the authorization request, preventing authorization code interception.","To replace the `client_secret` when running in a Node.js backend environment."],
    correctAnswer: 2,
    explanation: "PKCE (Proof Key for Code Exchange) was designed for public clients (like SPAs and mobile apps) that cannot securely store a client secret. The client generates a verifier and sends a hashed challenge. When exchanging the auth code for a token, it sends the verifier, proving it is the same client that initiated the flow, thwarting interception attacks."
  },
  {
    id: "fullstack-17",
    role: "Full Stack Engineer",
    difficulty: "expert",
    question: "A developer implements a Rate Limiter using a pure Token Bucket algorithm. If the bucket capacity is 100 tokens, and tokens refill at 10 per second, what happens if a user makes 150 requests simultaneously after a period of inactivity?",
    options: ["All 150 requests are processed instantly.","The first 100 requests are processed instantly, and the remaining 50 are rejected.","The first 10 requests are processed instantly, and the rest are queued.","The requests are processed at a steady rate of 10 per second."],
    correctAnswer: 1,
    explanation: "A pure Token Bucket allows bursts up to the bucket's maximum capacity. After inactivity, the bucket is full (100 tokens). It immediately processes 100 requests (draining the bucket), and the remaining 50 are rejected (or queued, depending on implementation, but strictly speaking of the bucket state, they cannot be processed instantly)."
  },
  {
    id: "fullstack-18",
    role: "Full Stack Engineer",
    difficulty: "chaos",
    question: "In React 18, when using `startTransition` for a state update, what is the specific guarantee React provides regarding rendering?",
    options: ["The state update will be batched synchronously with the next browser paint.","The state update will bypass the virtual DOM and mutate the real DOM directly.","The render caused by the transition can be interrupted by higher-priority updates (like typing), keeping the UI responsive.","The component will suspend and show a Suspense fallback automatically."],
    correctAnswer: 2,
    explanation: "`startTransition` marks an update as a non-urgent 'transition'. React's concurrent renderer can yield control back to the browser during the render phase of a transition, allowing high-priority events (like user input) to interrupt the work, ensuring the main thread doesn't lock up."
  },
  {
    id: "fullstack-19",
    role: "Full Stack Engineer",
    difficulty: "hard",
    question: "In the context of the V8 JavaScript engine, what is the 'Generational Hypothesis' upon which its Garbage Collector (Orinoco) is built?",
    options: ["Most objects are deeply nested and require recursive traversal.","Objects allocated by closures live longer than objects allocated in global scope.","Most objects die young, while older objects tend to live for a long time.","Memory fragmentation can only be resolved by stopping the world."],
    correctAnswer: 2,
    explanation: "The Generational Hypothesis states that most objects die young. Therefore, V8 divides the heap into a 'New Space' (where allocation is cheap and GC is frequent/fast) and an 'Old Space' (for objects that survive multiple GC cycles, where GC is slower but less frequent)."
  },
  {
    id: "fullstack-20",
    role: "Full Stack Engineer",
    difficulty: "expert",
    question: "How can a classic SQL Injection vulnerability occur even when using a modern ORM (Object-Relational Mapper) like Prisma, Sequelize, or Entity Framework?",
    options: ["ORMs do not use parameterized queries by default.","Injecting malicious SQL syntax into JSON fields that the ORM cannot serialize.","Concatenating untrusted user input directly into a raw SQL query execution method provided by the ORM.","Passing a profoundly nested JavaScript object to a `.findMany()` where clause."],
    correctAnswer: 2,
    explanation: "While ORMs use parameterized queries for their built-in methods (preventing injection), almost all ORMs provide 'escape hatches' for raw SQL (e.g., `sequelize.query()`). If developers use string concatenation with user input in these raw methods, the application becomes vulnerable."
  },
  {
    id: "fullstack-21",
    role: "Full Stack Engineer",
    difficulty: "hard",
    question: "When implementing infinite scrolling using an API, why is Keyset Pagination (Cursor-based) generally preferred over Offset-based pagination for large datasets?",
    options: ["Offset pagination requires the client to store the entire dataset in memory.","Offset pagination becomes linearly slower for deep pages because the DB must scan and discard `OFFSET` rows.","Keyset pagination automatically caches results in the browser.","Keyset pagination allows for bidirectional scrolling out-of-the-box."],
    correctAnswer: 1,
    explanation: "In `LIMIT X OFFSET Y`, the database must retrieve and then discard `Y` rows before returning `X` rows. For deep pages (e.g., OFFSET 100000), this is extremely slow. Cursor pagination (`WHERE id > last_seen_id`) uses an index to immediately jump to the correct row, maintaining O(1) performance."
  },
  {
    id: "fullstack-22",
    role: "Full Stack Engineer",
    difficulty: "expert",
    question: "In a distributed microservices architecture implementing the Saga pattern, what is the primary role of a 'Compensating Transaction'?",
    options: ["To automatically retry a failed network request using exponential backoff.","To replicate data to a secondary database shard.","To logically undo the work of a previously successful step if a subsequent step in the distributed transaction fails.","To lock rows in multiple databases simultaneously using Two-Phase Commit (2PC)."],
    correctAnswer: 2,
    explanation: "Since microservices manage separate databases, traditional ACID transactions across them are impossible (or use anti-patterns like 2PC). A Saga breaks the transaction into local transactions. If step 3 fails, the system must execute compensating transactions to undo the effects of steps 1 and 2."
  },
  {
    id: "fullstack-23",
    role: "Full Stack Engineer",
    difficulty: "chaos",
    question: "A web application suffers from a Cross-Site Scripting (XSS) vulnerability. Which of the following HTTP headers provides the most robust defense-in-depth mechanism to prevent the browser from executing the malicious inline script?",
    options: ["X-XSS-Protection: 1; mode=block","Strict-Transport-Security: max-age=31536000","Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-randomstring'","X-Content-Type-Options: nosniff"],
    correctAnswer: 2,
    explanation: "Content Security Policy (CSP) restricts where scripts can be loaded from and prevents execution of inline scripts unless they match a securely generated cryptographic nonce. X-XSS-Protection is largely deprecated and ineffective against modern attacks."
  },
  {
    id: "fullstack-24",
    role: "Full Stack Engineer",
    difficulty: "hard",
    question: "What is the primary trade-off highlighted by the CAP theorem when choosing a NoSQL database like Apache Cassandra over a traditional RDBMS during a network partition?",
    options: ["Cassandra sacrifices partition tolerance to maintain strong consistency.","Cassandra sacrifices availability to ensure strong consistency.","Cassandra sacrifices strong consistency to maintain high availability.","Cassandra sacrifices data durability to maintain atomic transactions."],
    correctAnswer: 2,
    explanation: "CAP theorem states you can only have two of Consistency, Availability, and Partition tolerance. Since network partitions (P) are inevitable in distributed systems, the choice is between C and A. Cassandra is typically configured as an AP system, favoring eventual consistency to remain highly available."
  },
  {
    id: "fullstack-25",
    role: "Full Stack Engineer",
    difficulty: "expert",
    question: "In Docker, what is the primary advantage of using a 'Multi-Stage Build' in a Dockerfile?",
    options: ["It allows you to run multiple containers from a single image simultaneously.","It drastically reduces the final image size by discarding build dependencies and keeping only the compiled artifact.","It speeds up the build process by executing instructions in parallel.","It encrypts the source code before pushing the image to a registry."],
    correctAnswer: 1,
    explanation: "Multi-stage builds allow you to use a heavy base image with all the necessary SDKs and build tools (like `golang` or `node`) to compile the code, and then copy only the final compiled binary or build folder into a much smaller, pristine base image (like `alpine` or `nginx`), reducing the attack surface and download size."
  },
  {
    id: "ml-1",
    role: "ML Engineer",
    difficulty: "hard",
    question: "In PyTorch, what is the exact mechanism by which `torch.utils.checkpoint.checkpoint` reduces memory usage during the forward pass?",
    options: ["It offloads intermediate activations to CPU RAM synchronously to free up GPU memory.","It relies on saving only the inputs to the checkpointed function and recomputing the forward pass during the backward pass.","It quantizes the intermediate activations to 8-bit integers and dequantizes them during backpropagation.","It disables gradient calculation entirely for the wrapped module, functioning similar to `torch.no_grad()`."],
    correctAnswer: 1,
    explanation: "Gradient checkpointing trades compute for memory. Instead of saving all intermediate activations for backpropagation, it only saves the inputs. During the backward pass, it recomputes the forward pass for that specific block to generate the activations necessary for gradients."
  },
  {
    id: "ml-2",
    role: "ML Engineer",
    difficulty: "expert",
    question: "When implementing a custom CUDA kernel for a reduction operation, what is the primary purpose of using warp-level primitives like `__shfl_down_sync`?",
    options: ["To synchronize all warps across an entire thread block before writing to global memory.","To prevent thread divergence by forcing all threads in a warp to execute the same instruction regardless of branch conditions.","To dynamically allocate more registers to a specific warp when it encounters computationally heavy math instructions.","To allow threads within the same warp to exchange data without using shared memory, avoiding bank conflicts and reducing latency."],
    correctAnswer: 3,
    explanation: "Warp-level primitives like `__shfl_down_sync` allow threads within the same warp to communicate directly via registers. This completely bypasses shared memory, avoiding potential bank conflicts and reducing overall latency for intra-warp reductions."
  },
  {
    id: "ml-3",
    role: "ML Engineer",
    difficulty: "hard",
    question: "In standard scaled dot-product attention, what is the exact mathematical consequence of omitting the scaling factor 1/sqrt(d_k) when d_k is large?",
    options: ["The dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients, leading to vanishing gradients.","The dot products become extremely small, causing the softmax outputs to approach a uniform distribution and destroying representational capacity.","The computational complexity of the attention mechanism increases from O(N^2 d) to O(N^3 d), causing out-of-memory errors.","The model will explicitly prioritize the query tokens over the key tokens, breaking the permutation invariance of the sequence."],
    correctAnswer: 0,
    explanation: "Without the scaling factor 1/sqrt(d_k), dot products can grow large in magnitude, pushing the softmax function into regions with extremely small gradients. This effectively halts learning because the gradients vanish during backpropagation."
  },
  {
    id: "ml-4",
    role: "ML Engineer",
    difficulty: "chaos",
    question: "In ZeRO-3 (Zero Redundancy Optimizer Stage 3) as implemented in DeepSpeed, how are the model parameters distributed?",
    options: ["The model parameters are replicated across all processes, but the gradients and optimizer states are partitioned to save memory.","The parameters are sharded across the layers (pipeline parallelism), with each GPU holding only a contiguous subset of the model's layers.","The model parameters are partitioned across all data parallel processes, and are gathered on-the-fly via all-gather operations only when needed for forward or backward computation.","The model parameters are stored entirely in CPU memory and are synchronously prefetched to the GPU block-by-block."],
    correctAnswer: 2,
    explanation: "ZeRO-3 partitions the model parameters, gradients, and optimizer states across all available GPUs. When a forward or backward pass needs a specific layer's parameters, they are fetched just-in-time via collective communication (all-gather)."
  },
  {
    id: "ml-5",
    role: "ML Engineer",
    difficulty: "hard",
    question: "When training deep neural networks with Batch Normalization, what happens if the batch size is set extremely small (e.g., 2 or 4)?",
    options: ["The network perfectly memorizes the training data because Batch Normalization acts as a strong regularizer at small batch sizes.","The estimates of the batch mean and variance become highly noisy, which destabilizes training and leads to poor convergence or degradation in performance.","Batch Normalization automatically switches to Layer Normalization to compensate for the lack of statistics across the batch dimension.","The gradients explode because the variance estimate approaches zero, requiring gradient clipping to be strictly enforced."],
    correctAnswer: 1,
    explanation: "Batch Normalization relies on computing the mean and variance across the batch dimension. With a very small batch size, these estimates become highly inaccurate and noisy, severely destabilizing the training process."
  },
  {
    id: "ml-6",
    role: "ML Engineer",
    difficulty: "expert",
    question: "In Post-Training Quantization (PTQ) of LLMs to 8-bit integers (INT8), what is the primary reason why simple symmetric per-tensor quantization often degrades performance severely on models over 6B parameters?",
    options: ["The loss of rotational invariance in the attention matrices due to integer truncation, preventing the model from recognizing positional embeddings.","The fact that INT8 matrix multiplication requires accumulation in FP16, leading to frequent numerical overflows in large dimensions.","Per-tensor quantization requires the model weights to be uniformly distributed, which is violated by the Gaussian initialization used in large LLMs.","The emergence of extreme outlier features in specific hidden dimensions, which forces the quantization scale factor to be large and squashes the majority of normal activations to zero."],
    correctAnswer: 3,
    explanation: "In large LLMs (typically >6B parameters), extreme outlier activations emerge in certain hidden dimensions. Symmetric per-tensor quantization maps the maximum absolute value to 127. If an outlier is extremely large, the scale factor becomes huge, squashing normal activations to zero and destroying the model's predictive capability."
  },
  {
    id: "ml-7",
    role: "ML Engineer",
    difficulty: "hard",
    question: "In object detection, how does the Focal Loss address the class imbalance problem differently than standard cross-entropy loss with class weights?",
    options: ["It dynamically scales the loss based on prediction confidence, down-weighting easily classified background examples to focus on hard, misclassified examples.","It adds a constant margin penalty to the logits of the majority class, physically pushing the decision boundary towards the minority class.","It randomly drops out gradients from the majority class during backpropagation based on a pre-defined hyperparameter gamma.","It normalizes the cross-entropy loss by the intersection-over-union (IoU) of the bounding box predictions."],
    correctAnswer: 0,
    explanation: "Focal Loss reshapes the standard cross-entropy loss such that the loss assigned to well-classified examples is down-weighted. This focuses the model's learning capacity on hard, misclassified examples, addressing extreme class imbalance typically found in one-stage object detectors."
  },
  {
    id: "ml-8",
    role: "ML Engineer",
    difficulty: "expert",
    question: "In a sparse Mixture of Experts (MoE) layer with top-k routing, what is the primary purpose of the 'load balancing loss' (or auxiliary loss)?",
    options: ["To ensure that the sum of the expert weights for each token strictly equals 1.0, maintaining the scale of the activations.","To minimize the latency of the all-to-all communication primitives during distributed expert execution.","To prevent the router network from collapsing into a state where it sends almost all tokens to a few 'favored' experts, leaving other experts underutilized.","To prevent catastrophic forgetting by heavily regularizing the weights of newly initialized experts."],
    correctAnswer: 2,
    explanation: "MoE models use a router to assign tokens to specific experts. Without a load balancing loss, the router can degenerate and send all tokens to a single or a few experts. The load balancing loss penalizes this behavior, ensuring all experts receive a roughly equal share of tokens."
  },
  {
    id: "ml-9",
    role: "ML Engineer",
    difficulty: "hard",
    question: "In standard Dropout, during the training phase, if the dropout probability is p, how are the retained activations scaled, and why?",
    options: ["They are scaled by p to smoothly transition the network capacity and prevent sudden activation spikes during inference.","They are scaled by 1 / (1 - p) to ensure that the expected value of the activations remains the same as during inference when dropout is disabled.","They are not scaled during training; instead, the weights are scaled by 1 - p during inference to compensate for the missing units.","They are scaled by sqrt(p) to maintain the variance of the activations, similar to Xavier initialization."],
    correctAnswer: 1,
    explanation: "During training, standard dropout zeros out activations with probability p. To ensure the expected sum of activations remains the same during inference (when dropout is off), PyTorch/TensorFlow scale the retained activations by 1/(1-p) during training (Inverted Dropout)."
  },
  {
    id: "ml-10",
    role: "ML Engineer",
    difficulty: "hard",
    question: "What does `torch.cuda.empty_cache()` actually do in PyTorch?",
    options: ["It releases all unoccupied cached memory currently held by the PyTorch caching allocator back to the GPU so that it can be used by other applications.","It forcefully deletes all PyTorch tensors currently out of scope to prevent memory leaks in custom training loops.","It resets the CUDA memory state, clearing all initialized variables and forcing the model to be re-loaded from system memory.","It compacts the allocated blocks in GPU memory to eliminate fragmentation and contiguous free space for larger tensor allocations."],
    correctAnswer: 0,
    explanation: "`torch.cuda.empty_cache()` releases unoccupied cached memory back to the GPU allocator so other processes can use it. It does not free memory occupied by active tensors and does not fix out-of-memory errors caused by actual high memory usage."
  },
  {
    id: "ml-11",
    role: "ML Engineer",
    difficulty: "expert",
    question: "In the InfoNCE loss used in contrastive learning (e.g., SimCLR), what is the effect of using a smaller temperature parameter tau?",
    options: ["It perfectly smooths out the distribution of similarity scores, making the model learn a uniform representation space without clusters.","It strictly acts as a regularizer, forcing the magnitude of the positive and negative embeddings to be exactly 1.","It decreases the effective learning rate for the contrastive head, requiring more epochs to converge.","It makes the loss more sensitive to hard negative samples, increasing the penalty for negatives that are very similar to the anchor, but can lead to instability if too small."],
    correctAnswer: 3,
    explanation: "In InfoNCE, a smaller temperature parameter tau scales the logits before the softmax. This sharply peaks the distribution, making the loss highly sensitive to hard negative samples (negatives that are very close to the anchor), forcing the model to separate them further."
  },
  {
    id: "ml-12",
    role: "ML Engineer",
    difficulty: "hard",
    question: "In the context of autoregressive language model decoding, what does Nucleus Sampling (Top-p sampling) do?",
    options: ["It selects the top p most probable tokens at each step and redistributes their probabilities to sum to 1 before sampling.","It samples only from the smallest set of most probable tokens whose cumulative probability mass exceeds a pre-defined threshold p.","It strictly prunes any token that has a probability less than p to prevent the generation of hallucinated words.","It penalizes the probability of generating tokens that have already appeared in the sequence by a factor of p to reduce repetition."],
    correctAnswer: 1,
    explanation: "Nucleus Sampling (Top-p) sorts the next-token probabilities in descending order and iteratively adds tokens to a set until the cumulative probability exceeds p. It only samples from this dynamic-sized set, cutting off the long tail of unreliable tokens while maintaining diversity."
  },
  {
    id: "ml-13",
    role: "ML Engineer",
    difficulty: "chaos",
    question: "What is a 'bank conflict' in CUDA shared memory?",
    options: ["It occurs when multiple threads in the same warp access different memory addresses that map to the same memory bank, forcing the accesses to be serialized.","It happens when the L1 cache overflows and falls back to L2 cache, significantly increasing memory access latency.","It is a race condition where two threads attempt to write to the exact same shared memory address simultaneously without an atomic operation.","It occurs when the thread block requests more shared memory than is physically available on a single Streaming Multiprocessor (SM)."],
    correctAnswer: 0,
    explanation: "Shared memory in CUDA is divided into banks. A bank conflict occurs when multiple threads in the same warp request addresses that map to the same memory bank. The hardware cannot service these concurrently, forcing the memory accesses to be serialized and reducing bandwidth."
  },
  {
    id: "ml-14",
    role: "ML Engineer",
    difficulty: "expert",
    question: "In PyTorch Automatic Mixed Precision (AMP), what is the primary purpose of the `GradScaler`?",
    options: ["To dynamically cast FP32 weights to FP16 based on their magnitude to optimize VRAM utilization.","To truncate exploding gradients that exceed the FP16 maximum representable value (65504) to prevent NaNs during training.","To multiply the loss by a scale factor before backpropagation to prevent underflow of FP16 gradients, and then unscale the gradients before the optimizer step.","To scale the learning rate up and down based on the loss plateau, similar to ReduceLROnPlateau."],
    correctAnswer: 2,
    explanation: "In mixed precision training, FP16 gradients can be extremely small and underflow to zero. The `GradScaler` multiplies the loss by a large factor before backpropagation, pushing gradients into a representable FP16 range. It then unscales the gradients in FP32 before the optimizer updates the weights."
  },
  {
    id: "ml-15",
    role: "ML Engineer",
    difficulty: "hard",
    question: "In Information Retrieval, what is the main advantage of NDCG (Normalized Discounted Cumulative Gain) over MAP (Mean Average Precision)?",
    options: ["NDCG is computationally cheaper to calculate for very large candidate sets because it only evaluates the top K results.","NDCG penalizes false positives much more heavily than MAP, making it better for precision-critical applications.","NDCG accounts for graded relevance scores (e.g., 0 to 4) rather than just binary relevance, and explicitly discounts the value of relevant items found lower in the ranking.","NDCG is intrinsically scale-invariant, meaning it requires no normalization across queries with different numbers of relevant documents."],
    correctAnswer: 2,
    explanation: "Unlike MAP which assumes binary relevance, NDCG (Normalized Discounted Cumulative Gain) supports graded relevance (e.g., highly relevant, somewhat relevant). Furthermore, the 'discounted' part explicitly penalizes relevant results that appear lower in the search ranking."
  },
  {
    id: "ml-16",
    role: "ML Engineer",
    difficulty: "expert",
    question: "In Rotary Position Embedding (RoPE), how is the positional information injected into the queries and keys?",
    options: ["By adding a sinusoidal bias vector to the attention logits (the dot product of queries and keys) prior to the softmax operation.","By concatenating a learnable embedding vector directly to the query and key vectors before the linear projections.","By multiplying the value vectors by a complex phase shift corresponding to the relative distance between tokens.","By applying a rotation matrix to the query and key vectors in the multi-dimensional complex plane, where the rotation angle is proportional to the token's absolute position."],
    correctAnswer: 3,
    explanation: "RoPE (Rotary Position Embedding) encodes absolute positional information with a rotation matrix and naturally incorporates explicit relative position dependency in self-attention formulation by rotating the query and key representations in complex space."
  },
  {
    id: "ml-17",
    role: "ML Engineer",
    difficulty: "hard",
    question: "In the AdamW optimizer, how does it fundamentally differ from applying standard L2 regularization (weight decay) in standard Adam?",
    options: ["AdamW decouples the weight decay from the gradient update, applying it directly to the weights rather than adding the L2 penalty to the loss function, which interacts poorly with Adam's adaptive learning rates.","AdamW incorporates the Nesterov momentum correction into the first moment estimate, accelerating convergence in flat regions of the loss landscape.","AdamW uses the infinity norm (max norm) of the past gradients instead of the L2 norm for the second moment estimate to prevent aggressive learning rate decay.","AdamW scales the weight decay factor dynamically based on the variance of the gradients, applying more decay to noisy parameters."],
    correctAnswer: 0,
    explanation: "In standard Adam, L2 regularization is added to the gradient, which interacts poorly with the adaptive learning rate scaling (parameters with large historical gradients get less weight decay). AdamW decouples this by subtracting the weight decay directly from the weights during the update step."
  },
  {
    id: "ml-18",
    role: "ML Engineer",
    difficulty: "expert",
    question: "In Proximal Policy Optimization (PPO), what is the purpose of the clipping mechanism in the surrogate objective function?",
    options: ["To clip the advantages to the range [-1, 1] to stabilize the variance of the value function estimator.","To prevent destructively large policy updates by bounding the probability ratio between the new and old policies, ensuring the new policy stays within a trusted region of the old policy.","To enforce a hard constraint on the KL divergence between the new and old policies by strictly rejecting updates that exceed a threshold.","To clip the gradients of the critic network during backpropagation to prevent exploding gradients in deep continuous control tasks."],
    correctAnswer: 1,
    explanation: "PPO maximizes a surrogate objective but prevents the new policy from diverging too far from the old policy. It does this by clipping the probability ratio r_t(theta) into the range [1-epsilon, 1+epsilon], preventing destructively large policy updates."
  },
  {
    id: "ml-19",
    role: "ML Engineer",
    difficulty: "hard",
    question: "In PyTorch DistributedDataParallel (DDP), what is the function of the `SyncBatchNorm` layer?",
    options: ["It forces the forward and backward passes of the batch normalization layer to be perfectly synchronous, acting as a synchronization barrier for the computation graph.","It replicates the running mean and variance buffers from the master node to all worker nodes at the beginning of every forward pass.","It automatically handles the conversion of typical Batch Normalization layers to Layer Normalization layers for distributed environments.","It synchronizes the calculation of the batch mean and variance across all participating GPUs, providing accurate statistics when the per-GPU batch size is too small."],
    correctAnswer: 3,
    explanation: "In DistributedDataParallel (DDP), each GPU calculates Batch Norm statistics independently by default. If the per-GPU batch size is small (e.g., 2), the statistics are noisy. `SyncBatchNorm` calculates the global mean and variance across all GPUs for accurate normalization."
  },
  {
    id: "ml-20",
    role: "ML Engineer",
    difficulty: "hard",
    question: "In depthwise separable convolutions (as used in MobileNet), how is the standard convolution operation factorized?",
    options: ["Into a 1D convolution along the height axis followed by a 1D convolution along the width axis.","Into a spatial depthwise convolution that applies a single filter per input channel, followed by a 1x1 pointwise convolution to combine the outputs across channels.","Into a dense channel-wise multiplication followed by a sparse group convolution.","Into a standard convolution with a heavily dilated receptive field followed by a bottleneck linear layer."],
    correctAnswer: 1,
    explanation: "Depthwise separable convolutions heavily reduce parameter count and compute by splitting a standard convolution into two distinct steps: a depthwise convolution (applying 1 filter per input channel) and a pointwise convolution (a 1x1 convolution combining the channel outputs)."
  },
  {
    id: "ml-21",
    role: "ML Engineer",
    difficulty: "expert",
    question: "What is the primary motivation for using the Wasserstein distance (WGAN) instead of the Jensen-Shannon divergence in GAN training?",
    options: ["The Wasserstein distance requires significantly less computational power because it replaces the sigmoid activation in the discriminator with a simple linear output.","The Wasserstein distance guarantees that the generator will explicitly avoid mode collapse by penalizing generated samples that are too close to each other.","The Wasserstein distance provides a meaningful, continuous gradient even when the generator and discriminator distributions have disjoint supports, mitigating the vanishing gradient problem.","The Wasserstein distance perfectly bounds the loss function between 0 and 1, providing an interpretable metric for convergence."],
    correctAnswer: 2,
    explanation: "The Jensen-Shannon divergence used in standard GANs maxes out and provides zero gradients when the real and fake distributions don't overlap. The Wasserstein distance (Earth Mover's Distance) provides a smooth, continuous gradient everywhere, effectively solving the vanishing gradient problem in GANs."
  },
  {
    id: "ml-22",
    role: "ML Engineer",
    difficulty: "hard",
    question: "In the context of Two-Tower recommendation models, why is the dot product strictly preferred over a deep neural network (e.g., an MLP) for computing the final user-item similarity score during serving?",
    options: ["The dot product has been mathematically proven to have a higher capacity to model non-linear interactions than an MLP.","The dot product enables the use of highly optimized Approximate Nearest Neighbor (ANN) search algorithms (like HNSW or FAISS) for sub-millisecond retrieval across millions of items.","The dot product automatically normalizes the embeddings, preventing popular items from dominating the recommendation results.","The dot product requires no trainable parameters, completely eliminating the risk of overfitting during the final scoring stage."],
    correctAnswer: 1,
    explanation: "Two-Tower models output separate dense embeddings for the user and the item. Using the dot product (or cosine similarity) allows the system to pre-compute item embeddings and use ultra-fast Approximate Nearest Neighbor (ANN) indexes to retrieve the top-k recommendations in milliseconds."
  },
  {
    id: "ml-23",
    role: "ML Engineer",
    difficulty: "expert",
    question: "In the training of Variational Autoencoders (VAEs), what is the 'reparameterization trick' and why is it essential?",
    options: ["It reparameterizes the loss function from Maximum Likelihood Estimation to the Evidence Lower Bound (ELBO) to make it computationally tractable.","It expresses the random latent variable z as a deterministic function of the input and a fixed noise source (e.g., z = mu + sigma * epsilon), allowing gradients to backpropagate through the stochastic sampling process.","It replaces the KL divergence penalty with an adversarial discriminator, turning the VAE into a GAN to improve image sharpness.","It transforms the continuous latent space into a discrete set of categorical variables using vector quantization (as in VQ-VAE)."],
    correctAnswer: 1,
    explanation: "In a VAE, we cannot backpropagate through a random sampling node z ~ N(mu, sigma^2). The reparameterization trick rewrites this as z = mu + sigma * epsilon where epsilon ~ N(0, 1). The randomness is shifted to epsilon, allowing gradients to flow deterministically through mu and sigma."
  },
  {
    id: "ml-24",
    role: "ML Engineer",
    difficulty: "hard",
    question: "In Layer Normalization (often used in Transformers), across which dimensions are the mean and variance computed for a tensor of shape `(batch_size, sequence_length, hidden_dim)`?",
    options: ["The statistics are computed across the `hidden_dim` for each individual token in the sequence, independently for each item in the batch.","The statistics are computed across the `batch_size` and `sequence_length` dimensions, normalizing a specific feature dimension globally.","The statistics are computed across the `sequence_length` only, normalizing the temporal dynamics of a specific feature for a given batch item.","The statistics are computed across the entire tensor simultaneously, resulting in a single mean and variance for the entire batch."],
    correctAnswer: 0,
    explanation: "In Layer Normalization (as used in standard Transformers), the mean and variance are computed across the last dimension (`hidden_dim`). This means every individual token in the sequence has its own specific mean and variance, independent of other tokens and other items in the batch."
  },
  {
    id: "ml-25",
    role: "ML Engineer",
    difficulty: "hard",
    question: "In the context of convex optimization, what is a 'saddle point', and why do they pose a significant challenge for first-order optimization methods like standard Gradient Descent in deep neural networks?",
    options: ["It is a point where the gradient explodes to infinity, causing the optimizer to diverge unless aggressive gradient clipping is applied.","It is a severe local minimum surrounded by extremely steep loss surfaces, preventing the model from generalizing to unseen data.","It is a point where the gradient is zero, but it is a minimum along some dimensions and a maximum along others; Gradient Descent can easily get stuck here because the gradient vanishes, taking a long time to escape along the directions of negative curvature.","It is a point where the loss landscape is perfectly flat in all dimensions, meaning that the Hessian matrix is the identity matrix."],
    correctAnswer: 2,
    explanation: "A saddle point has a zero gradient, making it a critical point. However, the loss curves upwards in some dimensions and downwards in others. High-dimensional spaces have exponentially more saddle points than local minima, and standard Gradient Descent can plateau heavily when navigating them."
  },
  {
    id: "mobile-1",
    role: "Mobile Engineer",
    difficulty: "hard",
    question: "In Swift, if a protocol provides a default implementation for a method in its extension, but does NOT declare the method in the protocol itself, what happens when you invoke this method on an instance conforming to the protocol but typed as the protocol?",
    options: ["The method is dynamically dispatched and the struct's implementation is called.","The method is statically dispatched and the extension's default implementation is called.","A compilation error occurs because the method is not declared in the protocol.","A runtime crash occurs due to a missing protocol witness table entry."],
    correctAnswer: 1,
    explanation: "Because the method is only in the extension and not the protocol itself, it uses static dispatch based on the variable's declared type. If typed as the protocol, the extension's implementation is called, even if the conforming type provides its own implementation."
  },
  {
    id: "mobile-2",
    role: "Mobile Engineer",
    difficulty: "expert",
    question: "In Android, an Activity has `launchMode=\"singleTask\"`. The current task stack is A -> B -> C. An explicit Intent is fired to start Activity A again. What is the state of the task stack and which lifecycle methods are called on Activity A?",
    options: ["Stack: A -> B -> C -> A. Lifecycle: onCreate(), onStart(), onResume()","Stack: A. Lifecycle: onNewIntent(), onRestart(), onStart(), onResume()","Stack: A -> A. Lifecycle: onNewIntent(), onResume()","Stack: A. Lifecycle: onDestroy() then onCreate(), onStart(), onResume()"],
    correctAnswer: 1,
    explanation: "With singleTask, the system routes the intent to the existing instance of A. All activities above A (B and C) are popped off the stack (destroyed). A receives the intent via `onNewIntent()` followed by `onRestart()`, `onStart()`, and `onResume()`."
  },
  {
    id: "mobile-3",
    role: "Mobile Engineer",
    difficulty: "chaos",
    question: "In React Native, what is the primary performance bottleneck resolved by the new JSI (JavaScript Interface) architecture compared to the legacy Bridge?",
    options: ["JSI offloads rendering entirely to the GPU, bypassing the Shadow Tree.","JSI asynchronously batches all native module calls to prevent JS thread blocking.","JSI allows synchronous, direct memory access between JS and Native without JSON serialization over an asynchronous message queue.","JSI automatically compiles JavaScript to native machine code at runtime (JIT)."],
    correctAnswer: 2,
    explanation: "The legacy Bridge required asynchronous message passing and JSON serialization/deserialization. JSI exposes C++ objects directly to JavaScript, allowing synchronous method calls and shared memory without serialization."
  },
  {
    id: "mobile-4",
    role: "Mobile Engineer",
    difficulty: "hard",
    question: "In iOS, calling `DispatchQueue.main.sync { ... }` from the main thread will result in:",
    options: ["Immediate synchronous execution of the block on the main thread.","Execution of the block on the main thread during the next run loop cycle.","A guaranteed deadlock.","A compiler warning and the block being ignored at runtime."],
    correctAnswer: 2,
    explanation: "Calling `sync` on the current queue causes a deadlock. The main thread blocks waiting for the `sync` block to complete, but the `sync` block cannot execute because the main thread is blocked."
  },
  {
    id: "mobile-5",
    role: "Mobile Engineer",
    difficulty: "hard",
    question: "In Android ViewModel architecture, which of the following is true regarding process death?",
    options: ["ViewModels automatically survive system-initiated process death and restore their state.","ViewModels survive configuration changes but are destroyed during process death; state must be saved using `SavedStateHandle`.","ViewModels are destroyed during configuration changes but survive process death via Android's persistence layer.","ViewModels must implement `Parcelable` to survive both configuration changes and process death."],
    correctAnswer: 1,
    explanation: "ViewModels easily survive configuration changes (like rotation) by remaining in memory. However, if the system kills the app process to free memory, the ViewModel is destroyed. To preserve UI state across process death, `SavedStateHandle` must be used."
  },
  {
    id: "mobile-6",
    role: "Mobile Engineer",
    difficulty: "expert",
    question: "In Swift, what happens when you access an `unowned` reference after the referenced object has been deallocated?",
    options: ["It returns `nil` safely.","It triggers a fatal runtime error and crashes the app.","It creates a dangling pointer but execution continues, potentially causing memory corruption later.","It automatically promotes the reference to a strong reference to prevent a crash."],
    correctAnswer: 1,
    explanation: "Unlike `weak` references which become `nil`, `unowned` references assume the object will never be `nil` when accessed. Accessing a deallocated `unowned` reference causes an immediate, deterministic runtime trap (crash)."
  },
  {
    id: "mobile-7",
    role: "Mobile Engineer",
    difficulty: "expert",
    question: "In React Native, providing an inline arrow function to the `renderItem` prop of a `FlatList` is considered an anti-pattern. Why?",
    options: ["It causes a memory leak because the arrow function captures the `FlatList` context.","It breaks the Yoga layout engine's flexbox calculations for the list items.","A new function reference is created on every render, causing `FlatList`'s `PureComponent` optimizations to fail and re-rendering all items.","It forces the Bridge to serialize the function definition repeatedly."],
    correctAnswer: 2,
    explanation: "Inline arrow functions create a new reference on every render. Because `FlatList` relies on shallow equality checks to optimize rendering, this new reference breaks the optimization, potentially causing the entire list to re-render unnecessarily."
  },
  {
    id: "mobile-8",
    role: "Mobile Engineer",
    difficulty: "hard",
    question: "In Android, what is the key difference between calling `commit()` vs `apply()` on a `SharedPreferences.Editor`?",
    options: ["`commit()` writes asynchronously to disk and returns nothing, while `apply()` writes synchronously and returns a boolean.","`apply()` commits changes to the in-memory map immediately and writes to disk asynchronously, while `commit()` writes to disk synchronously.","`commit()` merges changes with existing data, while `apply()` overwrites the entire SharedPreferences file.","There is no functional difference; `apply()` is simply the Kotlin extension function for `commit()`."],
    correctAnswer: 1,
    explanation: "`apply()` is fire-and-forget: it updates the in-memory SharedPreferences immediately but schedules the disk write asynchronously. `commit()` writes to disk synchronously on the calling thread and returns a boolean indicating success."
  },
  {
    id: "mobile-9",
    role: "Mobile Engineer",
    difficulty: "chaos",
    question: "In iOS Core Data, a developer fetches an `NSManagedObject` on the main queue context, passes the object reference to a background `DispatchQueue`, modifies a property, and saves the context. What is the expected behavior?",
    options: ["The change is saved successfully as Core Data automatically synchronizes managed objects across threads.","The app will likely crash or experience undefined behavior due to accessing an `NSManagedObject` outside its context's queue.","The background thread will block until the main thread is available to perform the save.","The change is ignored because properties of an `NSManagedObject` become read-only when accessed off the creator thread."],
    correctAnswer: 1,
    explanation: "`NSManagedObject` instances are not thread-safe and must strictly be accessed only on the queue of the `NSManagedObjectContext` they are registered with. Passing them across threads without using `NSManagedObjectID` and `performBlock` violates concurrency rules."
  },
  {
    id: "mobile-10",
    role: "Mobile Engineer",
    difficulty: "expert",
    question: "In Android custom Views, what is the performance difference between calling `invalidate()` versus `requestLayout()`?",
    options: ["`invalidate()` forces a complete measure and layout pass, while `requestLayout()` only redraws the view.","`invalidate()` only schedules a call to `onDraw()`, whereas `requestLayout()` schedules a measure pass, a layout pass, and then a draw pass.","`invalidate()` updates the view hierarchy synchronously, while `requestLayout()` does it asynchronously.","Both methods perform the exact same operations but are used in different lifecycle states."],
    correctAnswer: 1,
    explanation: "`invalidate()` simply marks the view as dirty and schedules a redraw (`onDraw()`). `requestLayout()` indicates that the view's bounds or layout parameters have changed, forcing the entire view hierarchy to measure and layout again."
  },
  {
    id: "mobile-11",
    role: "Mobile Engineer",
    difficulty: "expert",
    question: "In React Native's Animated API, what is the primary benefit of setting `useNativeDriver: true`?",
    options: ["It automatically converts CSS animations into native UIView/View animations.","It serializes animation frames synchronously over the Bridge to ensure 60fps.","It offloads the animation execution entirely to the native UI thread, preventing JS thread drops from causing stutter.","It uses native hardware acceleration for the JS thread."],
    correctAnswer: 2,
    explanation: "With `useNativeDriver: true`, the animation configuration is sent to the native side once. The native UI thread then calculates and applies every frame of the animation directly, freeing the JS thread and ensuring smooth performance."
  },
  {
    id: "mobile-12",
    role: "Mobile Engineer",
    difficulty: "hard",
    question: "In Swift Concurrency, how does an `actor` protect its mutable state from data races?",
    options: ["By automatically applying traditional mutex locks around every property access.","By ensuring all state accesses are routed through the main thread.","By isolating its state and requiring external access to be asynchronous (`await`), ensuring serialized execution of tasks.","By making all internal state deeply immutable upon initialization."],
    correctAnswer: 2,
    explanation: "Actors in Swift use state isolation. They maintain their own execution context, and any external code trying to access or mutate the actor's state must do so asynchronously using `await`. The actor serializes these requests."
  },
  {
    id: "mobile-13",
    role: "Mobile Engineer",
    difficulty: "chaos",
    question: "In Android, which scenario most reliably describes a Context memory leak?",
    options: ["Passing `getApplicationContext()` to a singleton repository class.","Passing an Activity Context to a singleton network manager that outlives the Activity.","Using an Activity Context to inflate a layout inside `onCreate`.","Passing `getApplicationContext()` to a temporary `AsyncTask`."],
    correctAnswer: 1,
    explanation: "Passing an Activity Context to a long-lived object like a Singleton means the Singleton holds a strong reference to the Activity, preventing the Garbage Collector from freeing the Activity (and its View hierarchy) when it is destroyed."
  },
  {
    id: "mobile-14",
    role: "Mobile Engineer",
    difficulty: "hard",
    question: "In iOS development, when a `UIView` is rotated by 45 degrees using its `transform` property, what happens to its `frame` and `bounds`?",
    options: ["Both the `frame` size and `bounds` size increase to accommodate the rotation.","The `bounds` size remains unchanged, but the `frame` size increases to bound the newly rotated view.","The `frame` size remains unchanged, but the `bounds` size decreases.","The `frame` becomes mathematically undefined, and only the `bounds` can be safely accessed."],
    correctAnswer: 1,
    explanation: "The `bounds` represent the view's internal coordinate system and its size stays the same. The `frame` represents the view's position and size in its superview's coordinate system; therefore, the `frame`'s bounding box must expand to enclose the rotated view."
  },
  {
    id: "mobile-15",
    role: "Mobile Engineer",
    difficulty: "expert",
    question: "In React Native using the Hermes engine, what is the primary advantage of AOT (Ahead-of-Time) compilation over JIT (Just-in-Time) compilation?",
    options: ["It allows JS to run directly on the UI thread without JSI.","It compiles the JS bundle into bytecode during the build process, significantly improving app startup time (TTI).","It automatically converts JavaScript into native Swift and Kotlin code.","It eliminates the need for the React Native bundler (Metro)."],
    correctAnswer: 1,
    explanation: "Hermes precompiles the JavaScript into efficient bytecode ahead of time during the build step. This means the device doesn't have to parse and compile JS on startup, drastically reducing the Time to Interact (TTI)."
  },
  {
    id: "mobile-16",
    role: "Mobile Engineer",
    difficulty: "hard",
    question: "In Android, what is the architectural difference between `LiveData` and `StateFlow`?",
    options: ["`LiveData` is lifecycle-aware by default, while `StateFlow` is a hot flow that requires specific collection strategies (e.g., `repeatOnLifecycle`) to be lifecycle-aware.","`LiveData` requires an initial value, whereas `StateFlow` does not.","`StateFlow` strictly runs on the main thread, while `LiveData` operates entirely in the background.","`LiveData` can emit identical consecutive values, while `StateFlow` always emits all values regardless of equality."],
    correctAnswer: 0,
    explanation: "`LiveData` automatically unregisters observers when the lifecycle owner goes inactive. `StateFlow` is a Kotlin coroutine flow and is naturally active; developers must use functions like `repeatOnLifecycle` or `flowWithLifecycle` to pause collection when the UI is hidden."
  },
  {
    id: "mobile-17",
    role: "Mobile Engineer",
    difficulty: "chaos",
    question: "In iOS, you declare a Swift enum with associated values. You want to expose this enum to Objective-C code. How is this achieved?",
    options: ["By simply adding the `@objc` attribute to the enum declaration.","By inheriting the enum from `NSObject`.","It is impossible directly; Swift enums with associated values cannot be exposed to Objective-C. A wrapper class must be created.","By marking the associated values with `@objc dynamic`."],
    correctAnswer: 2,
    explanation: "Objective-C does not support enums with associated values (which are implemented as tagged unions in Swift). Therefore, they cannot be bridged to Objective-C. You must provide a bridging mechanism, such as a wrapper class or a computed property returning an Objective-C compatible type."
  },
  {
    id: "mobile-18",
    role: "Mobile Engineer",
    difficulty: "expert",
    question: "In Android, which Launch Mode guarantees that an Activity is always the single, solitary Activity in its own dedicated Task?",
    options: ["singleTask","singleTop","singleInstance","singleInstancePerTask"],
    correctAnswer: 2,
    explanation: "With `singleInstance`, the system creates a new task and instantiates the activity at the root of that task. It is the only activity in that task; any other activities launched from it open in a separate task."
  },
  {
    id: "mobile-19",
    role: "Mobile Engineer",
    difficulty: "expert",
    question: "In React Native, why is using `Reanimated` with `React Native Gesture Handler` preferred over the built-in `PanResponder` and `Animated` APIs for complex gestures?",
    options: ["Reanimated automatically generates C++ code for gestures.","They execute the gesture tracking and animation physics entirely on the UI thread, bypassing the asynchronous React Native Bridge.","They allow gestures to be handled directly by the JS thread synchronously.","They integrate natively with WebGL for 60fps rendering."],
    correctAnswer: 1,
    explanation: "The built-in `PanResponder` sends touch events back and forth across the bridge between the UI thread and the JS thread, causing input lag. Reanimated and Gesture Handler run worklets on the native UI thread, avoiding bridge latency."
  },
  {
    id: "mobile-20",
    role: "Mobile Engineer",
    difficulty: "hard",
    question: "In iOS, when is the `loadView()` method of a `UIViewController` called?",
    options: ["Immediately after `init()` completes.","Right before `viewDidLoad()` every time the view controller is presented.","Only when the `view` property is accessed and its current value is `nil`.","When the system receives a memory warning and needs to flush the view."],
    correctAnswer: 2,
    explanation: "`loadView()` is heavily optimized. It lazily creates the view hierarchy. The system only calls it when the `view` property of the view controller is requested for the first time or if it has been set to `nil`."
  },
  {
    id: "mobile-21",
    role: "Mobile Engineer",
    difficulty: "chaos",
    question: "In Android, what mechanism securely verifies ownership of a domain to automatically open \"App Links\" without displaying the disambiguation dialog?",
    options: ["Adding an `intent-filter` with `autoVerify=\"true\"` in the Manifest and hosting an `assetlinks.json` file at the domain's `.well-known` path.","Registering the domain in the Firebase Console and generating a google-services.json file.","Using a Custom URL Scheme (e.g., `myapp://`) and verifying it through the Google Play Developer Console.","Generating an SSL pinning certificate and embedding it in the app's `res/raw` directory."],
    correctAnswer: 0,
    explanation: "Android App Links require the developer to prove ownership of the web domain. This is done by hosting a Digital Asset Links JSON file (`assetlinks.json`) on the website and setting `autoVerify=\"true\"` in the AndroidManifest."
  },
  {
    id: "mobile-22",
    role: "Mobile Engineer",
    difficulty: "hard",
    question: "In iOS, what is the primary difference between a strong reference cycle involving Closures versus Classes, and how do you resolve the Closure cycle?",
    options: ["Closures capture values by copy, requiring `inout` to break cycles.","Closures capture references to `self` automatically; to resolve, use a capture list `[weak self]` or `[unowned self]`.","Closures don't cause reference cycles; only Classes do.","Closures use manual retain-release; to resolve, call `self.release()` inside the closure."],
    correctAnswer: 1,
    explanation: "If a class holds a strong reference to a closure, and the closure captures `self` strongly, a retain cycle occurs. This is resolved by explicitly defining a capture list in the closure, capturing `self` weakly or unowned."
  },
  {
    id: "mobile-23",
    role: "Mobile Engineer",
    difficulty: "expert",
    question: "In Android's `RecyclerView`, performing heavy bitmap decoding or network requests directly inside `onBindViewHolder` will cause:",
    options: ["An immediate `OutOfMemoryError`.","The `RecyclerView` to automatically spawn a background thread.","Stuttering and dropped frames during scrolling because `onBindViewHolder` runs on the main UI thread.","The ViewHolder to be permanently recycled and hidden."],
    correctAnswer: 2,
    explanation: "`onBindViewHolder` is executed sequentially on the main thread as the user scrolls. Any heavy processing blocks the main thread, missing the 16ms frame window, resulting in visible jank."
  },
  {
    id: "mobile-24",
    role: "Mobile Engineer",
    difficulty: "expert",
    question: "In React Native, the `Yoga` engine is primarily responsible for:",
    options: ["Managing the JavaScript to Native bridge serialization.","Translating Flexbox layout properties into native layout constraints (X, Y, Width, Height) on a background thread.","Compiling JSX down to native View components.","Handling gestures and touch events asynchronously."],
    correctAnswer: 1,
    explanation: "Yoga is a cross-platform layout engine written in C++. In React Native, it runs on the Shadow Thread, calculates Flexbox layouts independently of the UI thread, and translates them into absolute coordinates for the native views."
  },
  {
    id: "mobile-25",
    role: "Mobile Engineer",
    difficulty: "chaos",
    question: "For local mobile databases, enabling SQLite WAL (Write-Ahead Logging) mode solves what specific concurrency issue?",
    options: ["It encrypts the database file using 256-bit AES.","It allows an unlimited number of concurrent writes to happen simultaneously.","It allows concurrent readers to access the database while a write operation is actively modifying it.","It completely disables disk I/O, keeping the database purely in-memory."],
    correctAnswer: 2,
    explanation: "Normally, a write lock blocks all readers. WAL mode writes changes to a separate log file rather than directly over the main database file. This allows readers to continue reading the original data while the write occurs, vastly improving concurrency."
  },
  {
    id: "prompt-1",
    role: "Prompt Engineer",
    difficulty: "expert",
    question: "In the context of few-shot prompting, which of the following best describes the 'majority label bias' phenomena?",
    options: ["The LLM tends to predict the label that appears most frequently in the few-shot examples, even if the current prompt implies a different answer.","The LLM tends to generate responses that align with the majority opinion of its pre-training data, regardless of the few-shot examples.","The LLM prioritizes the most recent few-shot example and assigns its label to the current prompt.","The LLM assumes that all questions in the prompt will have the same answer as the first few-shot example."],
    correctAnswer: 0,
    explanation: "Majority label bias occurs when an LLM skews its predictions towards the label that is most prevalent in the provided few-shot examples, overriding the actual reasoning required for the current prompt."
  },
  {
    id: "prompt-2",
    role: "Prompt Engineer",
    difficulty: "chaos",
    question: "When designing a prompt to mitigate the 'Lost in the Middle' effect in long context windows, which strategy is empirically most effective?",
    options: ["Placing the most critical instructions or context at the exact mathematical center of the prompt.","Repeating the core instruction periodically throughout the prompt (e.g., every 500 tokens).","Placing the most critical information at the very beginning and the very end of the prompt.","Formatting the entire prompt as a JSON object to enforce strict positional embeddings."],
    correctAnswer: 2,
    explanation: "The 'Lost in the Middle' phenomenon indicates that LLMs are significantly better at utilizing information at the beginning and end of their context window, while information in the middle is frequently ignored or degraded."
  },
  {
    id: "prompt-3",
    role: "Prompt Engineer",
    difficulty: "hard",
    question: "Which of the following is a structural vulnerability that allows for 'indirect prompt injection' in an LLM-integrated application?",
    options: ["The user explicitly appends 'Ignore previous instructions' to their input text.","The application uses an outdated tokenizer that incorrectly parses special characters.","The LLM is prompted to summarize an external webpage that contains hidden text instructing the LLM to exfiltrate data.","The system prompt lacks a strict XML-tag wrapper around user inputs."],
    correctAnswer: 2,
    explanation: "Indirect prompt injection occurs when malicious instructions are embedded in external data sources (like a webpage or document) that the LLM is legitimately instructed to retrieve and process."
  },
  {
    id: "prompt-4",
    role: "Prompt Engineer",
    difficulty: "expert",
    question: "In Tree of Thoughts (ToT) prompting, how does the system typically evaluate intermediate steps to decide which branches to prune or pursue?",
    options: ["By fine-tuning a secondary smaller model strictly on intermediate logical states.","By using external symbolic solvers or heuristics exclusively, bypassing the LLM.","By utilizing the LLM itself to self-evaluate the states using deliberate prompts like voting or value scoring.","By comparing the cosine similarity of the intermediate state to a pre-defined vector database of correct paths."],
    correctAnswer: 2,
    explanation: "Tree of Thoughts relies on the LLM to self-evaluate intermediate thought states (e.g., scoring them from 1-10 or voting on viability) to guide the search algorithm (BFS or DFS) through the thought space."
  },
  {
    id: "prompt-5",
    role: "Prompt Engineer",
    difficulty: "hard",
    question: "Why might appending 'Let's think step by step' (Zero-shot CoT) fail or degrade performance on simple, factual recall questions?",
    options: ["It triggers a safety filter that blocks multi-step reasoning for factual queries.","It forces the model into a verbose reasoning path, increasing the probability of hallucinating intermediate, incorrect facts that derail the final answer.","It causes the model to truncate the output because the token limit is exceeded instantly.","It switches the model to a non-deterministic decoding strategy like top-k sampling regardless of user settings."],
    correctAnswer: 1,
    explanation: "For simple factual recall, forcing a chain of thought can introduce unnecessary intermediate steps, increasing the chance of hallucination (the 'hallucination snowball' effect) rather than straightforward retrieval."
  },
  {
    id: "prompt-6",
    role: "Prompt Engineer",
    difficulty: "expert",
    question: "When utilizing the ReAct (Reasoning and Acting) framework, what is the primary purpose of the 'Observation' step?",
    options: ["To allow the LLM to reflect on its own internal reasoning and correct logical errors before acting.","To provide the LLM with the results of an action taken in an external environment (e.g., an API response or search result).","To prompt the user for manual confirmation before the LLM executes a destructive action.","To aggregate multiple few-shot examples into a single, cohesive reasoning rule."],
    correctAnswer: 1,
    explanation: "In ReAct, the cycle is Thought -> Action -> Observation. The Observation step injects the real-world output of the executed Action (like a Wikipedia search result) back into the prompt context for the next Thought."
  },
  {
    id: "prompt-7",
    role: "Prompt Engineer",
    difficulty: "chaos",
    question: "Which specific prompting technique utilizes 'Self-Consistency' to improve reasoning performance?",
    options: ["Sampling multiple reasoning paths using temperature > 0 and selecting the final answer by majority vote.","Prompting the model to write a Python script, execute it, and check if the output matches the expected data type.","Enforcing strict JSON schema validation to ensure the model does not deviate from the requested output format.","Asking the model the same question sequentially in a single chat session until it stops changing its answer."],
    correctAnswer: 0,
    explanation: "Self-Consistency involves generating multiple diverse reasoning paths (Chain of Thoughts) using non-zero temperature, and then marginalizing out the reasoning paths by taking a majority vote on the final answer."
  },
  {
    id: "prompt-8",
    role: "Prompt Engineer",
    difficulty: "hard",
    question: "What is 'recency bias' in the context of few-shot prompt engineering?",
    options: ["The model's tendency to rely on its most recent training data cutoff rather than general knowledge.","The model's tendency to predict an answer that aligns with the very last example provided in the few-shot sequence.","The model favoring recently generated tokens over older tokens in the context window during beam search.","The model forgetting the system prompt if the user prompt is longer than 1000 tokens."],
    correctAnswer: 1,
    explanation: "Recency bias in few-shot prompting refers to the LLM's inclination to heavily weight the label or pattern of the example situated closest to the end of the prompt (right before the actual query)."
  },
  {
    id: "prompt-9",
    role: "Prompt Engineer",
    difficulty: "expert",
    question: "How does 'Step-Back Prompting' fundamentally differ from standard Chain of Thought?",
    options: ["It instructs the LLM to write the final answer first, and then generate the reasoning that leads to it.","It requires the LLM to first abstract the specific query into a broader, high-level principle or concept before solving the specific instance.","It forces the LLM to break the task into smaller sub-tasks and solve them in reverse order.","It utilizes a secondary, older model (a 'step back' in version) to verify the primary model's output."],
    correctAnswer: 1,
    explanation: "Step-Back Prompting prompts the model to first generate a higher-level abstraction or generic principle regarding the question, and then uses that abstraction to guide the reasoning for the specific problem."
  },
  {
    id: "prompt-10",
    role: "Prompt Engineer",
    difficulty: "hard",
    question: "In mitigating prompt injections, what is the 'sandwich defense' technique?",
    options: ["Wrapping the user input within XML tags and randomly generated boundary strings.","Placing the user input between a strong system prompt at the beginning and a reiteration of the security instructions at the very end.","Passing the prompt through an evaluator model, then the main model, then a secondary evaluator model.","Encoding the user input in Base64 and instructing the model to decode it internally."],
    correctAnswer: 1,
    explanation: "The sandwich defense involves placing the potentially untrusted user input between the initial instructions and a secondary reminder of the instructions at the end, minimizing the user input's recency effect."
  },
  {
    id: "prompt-11",
    role: "Prompt Engineer",
    difficulty: "expert",
    question: "What is the primary mechanism by which tokenization can cause 'spelling' or 'character-level' tasks to fail in modern LLMs?",
    options: ["The LLM's attention mechanism cannot process sequences shorter than 3 tokens.","Common words are compressed into single tokens, obscuring their constituent characters from the model's fundamental representations.","Byte-Pair Encoding (BPE) randomly drops vowels during the merging phase to save context space.","The embedding layer explicitly strips out capitalization and punctuation before processing."],
    correctAnswer: 1,
    explanation: "Because subword tokenizers (like BPE) group common sequences of letters into single integer tokens, the model 'sees' the token ID rather than individual characters, making tasks like spelling, anagrams, or character counting inherently difficult without specific prompting interventions (like adding spaces between letters)."
  },
  {
    id: "prompt-12",
    role: "Prompt Engineer",
    difficulty: "chaos",
    question: "Which of the following describes 'Directional Stimulus Prompting'?",
    options: ["Providing the LLM with a small, specific hint or keyword (e.g., extracted by a smaller model) to guide its generation in a desired direction.","Using negative constraints exclusively (e.g., 'Do not use the letter E') to shape the output.","Prompting the model to evaluate the emotional sentiment of the user and mirror it.","Injecting hidden control tokens into the prompt embedding layer rather than the text sequence."],
    correctAnswer: 0,
    explanation: "Directional Stimulus Prompting introduces a 'stimulus'—like keywords or a summary generated by an external policy model—into the prompt to explicitly steer the LLM's generation trajectory without providing the full answer."
  },
  {
    id: "prompt-13",
    role: "Prompt Engineer",
    difficulty: "hard",
    question: "When defining output formats, why is XML often preferred over JSON for purely unstructured text generation with inline annotations?",
    options: ["LLMs are natively trained on XML, whereas JSON requires a specialized fine-tuning adapter.","JSON requires strict escaping of quotes and newlines, which LLMs frequently get wrong in long narrative text, leading to parsing errors.","XML tokens are uniformly shorter than JSON tokens in all major tokenizer vocabularies.","XML natively supports semantic vector embeddings, making it easier for the LLM to search."],
    correctAnswer: 1,
    explanation: "For generating long text blocks that include line breaks or quotes, JSON's strict syntax and escaping rules often cause formatting hallucinations or parsing errors. XML allows for robust tagging of unstructured text without complex escaping."
  },
  {
    id: "prompt-14",
    role: "Prompt Engineer",
    difficulty: "expert",
    question: "In the context of RAG (Retrieval-Augmented Generation), what is 'Needle In A Haystack' (NIAH) testing evaluating?",
    options: ["The vector database's ability to retrieve the correct chunk using cosine similarity.","The LLM's ability to recall a specific, often out-of-context fact hidden deep within a very large, distractor-filled context window.","The tokenizer's ability to identify rare words (needles) amongst common stop words (hay).","The prompt's vulnerability to highly obfuscated injection attacks."],
    correctAnswer: 1,
    explanation: "NIAH testing evaluates an LLM's effective context window by burying a specific fact (the needle) at various depths in a large irrelevant text (the haystack) and prompting the model to retrieve it."
  },
  {
    id: "prompt-15",
    role: "Prompt Engineer",
    difficulty: "chaos",
    question: "How does setting the Temperature parameter to 0 conceptually interact with Top-P (nucleus sampling)?",
    options: ["Top-P becomes the sole determinant of randomness, overriding the temperature setting entirely.","Setting Temperature to 0 forces greedy decoding, making Top-P effectively irrelevant as only the most probable token is ever selected.","Temperature 0 scales the Top-P cumulative probability threshold linearly.","It causes a divide-by-zero error in the softmax layer, forcing the model to fallback to default settings."],
    correctAnswer: 1,
    explanation: "Temperature = 0 means greedy decoding (always picking the highest probability token). Because the distribution collapses to a single token with 100% probability, nucleus sampling (Top-P) has no effect, as the top token alone satisfies any Top-P > 0."
  },
  {
    id: "prompt-16",
    role: "Prompt Engineer",
    difficulty: "hard",
    question: "What is the primary vulnerability exploited by the 'jailbreak' technique known as 'Roleplay / Persona Adoption' (e.g., DAN)?",
    options: ["It exploits a buffer overflow in the context window handling.","It leverages the model's RLHF alignment to be helpful, overriding refusal mechanisms by framing the malicious request as a hypothetical fictional scenario.","It manipulates the system's timezone settings to bypass time-locked safety mechanisms.","It forces the model to use an alternative language tokenizer that lacks safety filters."],
    correctAnswer: 1,
    explanation: "Persona adoption jailbreaks (like DAN - Do Anything Now) work by creating a hypothetical or fictional context where the safety constraints supposedly do not apply, exploiting the model's instruction-following and helpfulness training to bypass standard refusal triggers."
  },
  {
    id: "prompt-17",
    role: "Prompt Engineer",
    difficulty: "expert",
    question: "In 'Graph of Thoughts' (GoT) prompting, how does it advance beyond 'Tree of Thoughts' (ToT)?",
    options: ["GoT allows reasoning paths to merge (synergize) and form loops, whereas ToT is restricted to strictly branching hierarchies.","GoT executes entirely via an external Knowledge Graph database without consuming LLM tokens.","GoT forces the LLM to output SVG code representing the reasoning path visually.","GoT is specifically optimized for single-token responses, eliminating multi-step generation."],
    correctAnswer: 0,
    explanation: "Graph of Thoughts models reasoning as a directed graph, allowing the LLM to combine multiple independent thoughts into a new synergistic thought (merging) or refine previous thoughts, which is impossible in the strict tree structure of ToT."
  },
  {
    id: "prompt-18",
    role: "Prompt Engineer",
    difficulty: "chaos",
    question: "When configuring generation hyperparameters, what does setting 'Presence Penalty' > 0 achieve distinctively compared to 'Frequency Penalty'?",
    options: ["Presence Penalty penalizes the exact number of times a token appears, whereas Frequency Penalty penalizes it once if it appears at all.","Presence Penalty applies a flat penalty to a token if it exists anywhere in the text, encouraging topic diversity, while Frequency Penalty scales linearly with repetition, deterring repetitive phrasing.","Presence Penalty forces the model to include specific tokens provided in the prompt.","Presence Penalty dynamically adjusts the temperature based on token rarity."],
    correctAnswer: 1,
    explanation: "Presence penalty applies a constant deduction if a token has appeared at least once, encouraging the model to introduce new concepts. Frequency penalty applies a deduction proportional to how many times the token has already appeared, discouraging verbatim repetition."
  },
  {
    id: "prompt-19",
    role: "Prompt Engineer",
    difficulty: "hard",
    question: "What is 'Metaprompting'?",
    options: ["Using an LLM to generate, refine, or optimize the prompt that will subsequently be fed into itself or another LLM.","Extracting the metadata of a prompt (length, token count, author) and formatting it as a JSON payload.","Bypassing the LLM entirely and interacting directly with the model's embedding vectors.","A technique where the prompt is entirely composed of emojis to reduce token usage."],
    correctAnswer: 0,
    explanation: "Metaprompting involves using a language model to act as the prompt engineer, automatically generating, evaluating, and refining prompts for specific tasks before executing them."
  },
  {
    id: "prompt-20",
    role: "Prompt Engineer",
    difficulty: "expert",
    question: "Which of the following phenomena makes LLMs 'LLM-as-a-judge' susceptible to evaluation errors?",
    options: ["Positional bias, where the LLM disproportionately favors the first or last response in a pairwise comparison.","Syntax hypersensitivity, where the LLM penalizes any response containing contractions.","Temperature inversion, where high temperature forces the LLM to select the worst possible answer.","Zero-shot degradation, where the LLM cannot evaluate without at least 100 examples."],
    correctAnswer: 0,
    explanation: "LLM-as-a-judge often suffers from positional bias (or order bias), where it may consistently prefer the first candidate (Option A) or the second (Option B) simply due to where they are placed in the prompt, regardless of actual quality."
  },
  {
    id: "prompt-21",
    role: "Prompt Engineer",
    difficulty: "hard",
    question: "To force an LLM to strictly follow a desired output format (like JSON) without failing, which API-level feature is most reliable?",
    options: ["Setting Temperature to 2.0 to ensure it explores all formatting options.","Using 'Logit Bias' to set the probability of curly braces to 100.","Using 'Structured Outputs' or 'JSON Mode' which employs constrained decoding at the API level to guarantee schema adherence.","Appending 'OR I WILL DELETE YOUR CODE' to the system prompt."],
    correctAnswer: 2,
    explanation: "While prompting techniques help, true reliability requires API-level constrained decoding (like OpenAI's Structured Outputs), which masks out invalid tokens during generation to mathematically guarantee schema adherence."
  },
  {
    id: "prompt-22",
    role: "Prompt Engineer",
    difficulty: "expert",
    question: "In 'Multi-agent debate prompting', what is the core mechanism used to reach a final, high-quality answer?",
    options: ["A single agent queries a search engine repeatedly until it finds a verified source.","Multiple LLM instances generate initial answers, and then iteratively critique and refine each other's responses over several rounds until consensus is reached.","A human in the loop reviews the prompt before execution.","The prompt is split into fragments and processed by different models simultaneously to save time."],
    correctAnswer: 1,
    explanation: "Multi-agent debate involves instantiating several LLM 'agents' that propose answers and then actively critique one another. This iterative process of cross-examination often corrects individual hallucinations and converges on a more robust solution."
  },
  {
    id: "prompt-23",
    role: "Prompt Engineer",
    difficulty: "chaos",
    question: "When observing 'Cross-lingual prompt transfer' behavior in LLMs, which counter-intuitive phenomenon is frequently documented?",
    options: ["Prompting in English but requesting output in a low-resource language often yields better reasoning quality than prompting natively in that low-resource language.","The LLM will automatically translate its system prompt into French regardless of user input.","Token usage drops by 50% when the prompt is mixed with Spanish and Mandarin.","The model loses the ability to perform basic math when prompted in any language other than English."],
    correctAnswer: 0,
    explanation: "Because the vast majority of reasoning and factual training data is in English, forcing the model's internal reasoning steps to occur in English (even when the final output is in a low-resource language) often bypasses the poorer semantic representations of the low-resource language."
  },
  {
    id: "prompt-24",
    role: "Prompt Engineer",
    difficulty: "hard",
    question: "How does 'System Prompt Leakage' typically occur in a production application?",
    options: ["The cloud provider's database gets hacked.","The user asks the model directly, 'Repeat the words above starting with You are a...', and the model complies.","The tokenizer fails to encode the system prompt, printing it in plain text to the console.","The API key is accidentally committed to a public GitHub repository."],
    correctAnswer: 1,
    explanation: "System prompt leakage is a form of prompt injection where the user uses specific adversarial phrasing to trick the model into outputting its hidden initial instructions (the system prompt)."
  },
  {
    id: "prompt-25",
    role: "Prompt Engineer",
    difficulty: "expert",
    question: "What is the primary characteristic of 'Contrastive Decoding' when used alongside prompt engineering?",
    options: ["It subtracts the logits of a small, less-capable 'amateur' model from a large 'expert' model to heavily penalize common, generic, or hallucinated tokens.","It compares the prompt to a database of known malicious prompts before execution.","It generates two outputs simultaneously, one positive and one negative, and asks the user to choose.","It relies purely on visual contrast in the UI to highlight generated text."],
    correctAnswer: 0,
    explanation: "Contrastive decoding is an advanced inference technique that improves generation quality by taking the probability distribution of an expert model and penalizing it based on the distribution of a weaker amateur model, theoretically filtering out basic errors and generic text."
  },
  {
    id: "security-1",
    role: "Security Engineer",
    difficulty: "expert",
    question: "In an implementation of AES-GCM, the initialization vector (IV) is accidentally reused for two different messages with the same key. Which of the following best describes the immediate cryptographic impact of this error?",
    options: ["The attacker can recover the authentication key (HashKey) and forge tags for any future messages, completely breaking authenticity.","The attacker can XOR the two ciphertexts to obtain the XOR of the two plaintexts, breaking confidentiality, but authenticity remains intact.","The attacker can recover the master encryption key using a lattice-based attack on the Galois field.","The attacker can recover both the XOR of the plaintexts and forge valid authentication tags for subsequent messages by recovering the authentication key."],
    correctAnswer: 3,
    explanation: "In AES-GCM, nonce reuse breaks both confidentiality (XOR of plaintexts) and authenticity. The authentication in GCM uses a polynomial evaluation over GF(2^128). Reusing the nonce allows an attacker to set up a polynomial equation to recover the authentication key (H), enabling them to forge tags for any message."
  },
  {
    id: "security-2",
    role: "Security Engineer",
    difficulty: "expert",
    question: "When implementing the OAuth 2.0 Authorization Code Flow, an attacker successfully registers a wildcard or broad redirect URI on the Authorization Server. Which of the following attacks becomes highly probable if the attacker exploits this, combined with an open redirect on the client's domain?",
    options: ["The attacker can steal the access token directly from the URL fragment.","The attacker can steal the authorization code by tricking the victim into initiating the flow and redirecting the callback to an attacker-controlled server.","The attacker can perform a Cross-Site Request Forgery (CSRF) attack to link their account to the victim's account.","The attacker can bypass the PKCE validation step since the open redirect strips the code_challenge parameter."],
    correctAnswer: 1,
    explanation: "If the AS allows broad redirect URIs (e.g., *.example.com) and the client has an open redirect (e.g., example.com/redirect?url=attacker.com), the attacker can construct an authorization request that redirects the victim to the AS. After consent, the AS redirects to the client's open redirect with the authorization code, which then redirects to the attacker's server, leaking the code."
  },
  {
    id: "security-3",
    role: "Security Engineer",
    difficulty: "hard",
    question: "A web application prevents Server-Side Request Forgery (SSRF) by resolving the user-provided URL's hostname to an IP address and checking if it belongs to a private IP range (e.g., 169.254.169.254, 10.0.0.0/8) before making the HTTP request. Which technique can bypass this mitigation?",
    options: ["DNS Rebinding","HTTP Parameter Pollution","Null-byte injection in the URL","Using IPv6 representation of the IP addresses"],
    correctAnswer: 0,
    explanation: "DNS Rebinding involves setting up a malicious DNS server that responds to the first query (the security check) with a safe IP address, but responds to the second query (the actual HTTP request) with the target private IP address (e.g., AWS metadata service). The time-to-live (TTL) is set very low to force the application to resolve the domain again."
  },
  {
    id: "security-4",
    role: "Security Engineer",
    difficulty: "expert",
    question: "An application implements Content Security Policy (CSP) with 'script-src \\'nonce-RANDOM\\' \\'strict-dynamic\\'; object-src \\'none\\'; base-uri \\'none\\';'. The application uses a vulnerable version of DOMPurify to sanitize user input before inserting it into the DOM via `innerHTML`. What is the most viable path to achieve XSS?",
    options: ["Inject a `<script>` tag with a matching nonce, guessing the random value.","Exploit a Mutation XSS (mXSS) vulnerability to bypass DOMPurify, utilizing a payload that creates an inherently trusted script element under 'strict-dynamic'.","Inject a `<base>` tag to hijack relative script loads, bypassing the nonce requirement.","Use `<object>` or `<embed>` tags to execute Flash/Java payloads."],
    correctAnswer: 1,
    explanation: "Because `strict-dynamic` is used, any script dynamically created by a trusted script is also trusted. If the application uses `innerHTML` and a mutation XSS bypasses the sanitizer, the attacker can inject DOM elements that trigger event handlers or create scripts. However, standard event handlers are blocked by CSP. Instead, an attacker can use a gadget or mXSS to create a `<script>` node dynamically via an existing trusted script (DOM Clobbering or similar techniques), or exploit specific mXSS vectors where the browser mutates the injected HTML into a script execution context."
  },
  {
    id: "security-5",
    role: "Security Engineer",
    difficulty: "chaos",
    question: "In the context of HTTP Request Smuggling, a reverse proxy and a backend server disagree on where a request ends. The frontend uses the `Content-Length` header, and the backend uses the `Transfer-Encoding` header (CL.TE). Which of the following payloads correctly demonstrates a CL.TE attack?",
    options: ["POST / HTTP/1.1\\r\\nHost: example.com\\r\\nContent-Length: 4\\r\\nTransfer-Encoding: chunked\\r\\n\\r\\n12\\r\\nSMUGGLED_REQUEST\\r\\n0\\r\\n\\r\\n","POST / HTTP/1.1\\r\\nHost: example.com\\r\\nContent-Length: 13\\r\\nTransfer-Encoding: chunked\\r\\n\\r\\n0\\r\\n\\r\\nSMUGGLED","POST / HTTP/1.1\\r\\nHost: example.com\\r\\nTransfer-Encoding: chunked\\r\\nContent-Length: 0\\r\\n\\r\\n0\\r\\n\\r\\nSMUGGLED","POST / HTTP/1.1\\r\\nHost: example.com\\r\\nContent-Length: 20\\r\\nTransfer-Encoding: chunked\\r\\n\\r\\nSMUGGLED_REQUEST\\r\\n0\\r\\n\\r\\n"],
    correctAnswer: 1,
    explanation: "In a CL.TE attack, the frontend processes Content-Length and forwards the specified number of bytes. The backend processes Transfer-Encoding: chunked. In option 2, the CL is 13, so the frontend forwards '0\\r\\n\\r\\nSMUGGLED' (13 bytes). The backend sees the chunked encoding, reads the '0\\r\\n\\r\\n' as the end of the first request, and leaves 'SMUGGLED' in the buffer to prefix the next incoming request."
  },
  {
    id: "security-6",
    role: "Security Engineer",
    difficulty: "hard",
    question: "An application uses JSON Web Tokens (JWT) for authentication. The token header is `{\"alg\": \"HS256\", \"kid\": \"key1\"}`. The attacker discovers the backend fetches the key using a directory path built from the `kid` parameter: `/app/keys/{kid}.pem`. Which attack is most likely to succeed in forging a valid JWT?",
    options: ["Changing the algorithm to `None` and stripping the signature.","Path traversal via `kid` to point to a predictable file like `/dev/null`, creating an empty key to sign the token.","SQL Injection in the `kid` parameter to extract the key from the database.","Algorithm confusion by changing `HS256` to `RS256` and using the public key as the symmetric secret."],
    correctAnswer: 1,
    explanation: "This is a classic 'kid' parameter vulnerability. By using path traversal (e.g., `kid=../../../../dev/null`), the application loads an empty file as the secret key. The attacker can then sign the JWT using an empty string (or known static content) as the HMAC secret, successfully forging the token."
  },
  {
    id: "security-7",
    role: "Security Engineer",
    difficulty: "hard",
    question: "A developer configures Nginx to serve static files using the `alias` directive: `location /static { alias /var/www/app/static/; }`. What is the security implication of omitting the trailing slash on the location path (`/static` instead of `/static/`) while having a trailing slash on the alias path?",
    options: ["No security implication; Nginx will automatically normalize the paths.","Path Traversal (Off-by-slash). An attacker can request `/static../` to access files in `/var/www/app/`.","Server-Side Request Forgery. The alias directive can be forced to resolve external URLs.","Denial of Service. Nginx will enter an infinite redirect loop when accessing `/static`."],
    correctAnswer: 1,
    explanation: "This is an Nginx misconfiguration known as off-by-slash. Because `location /static` lacks a trailing slash, a request for `/static../config.json` matches the location block. Nginx strips the `/static` prefix, leaving `../config.json`, and appends it to the alias `/var/www/app/static/`, resulting in `/var/www/app/static/../config.json` -> `/var/www/app/config.json`, allowing directory traversal."
  },
  {
    id: "security-8",
    role: "Security Engineer",
    difficulty: "chaos",
    question: "In a Node.js application, an attacker finds a Prototype Pollution vulnerability allowing them to inject properties into `Object.prototype`. The application uses the `child_process.spawn()` or `exec()` function. Which property can the attacker pollute to achieve Remote Code Execution (RCE)?",
    options: ["polluting `__proto__.env` with a malicious environment variable payload.","polluting `__proto__.NODE_OPTIONS` to pass `--require` flags to the spawned process.","polluting `__proto__.shell` to overwrite the path to the shell executable used by spawn/exec.","polluting `__proto__.args` to inject command-line arguments to the spawned process."],
    correctAnswer: 2,
    explanation: "When Node.js `child_process.spawn()` is called (and by extension `exec()`), it accepts an `options` object. If `options.shell` is not explicitly defined, it inherits from the prototype chain. By polluting `Object.prototype.shell`, an attacker can point the shell to a malicious executable or a specific binary like `/proc/self/exe` combined with polluted `NODE_OPTIONS` to execute arbitrary code."
  },
  {
    id: "security-9",
    role: "Security Engineer",
    difficulty: "expert",
    question: "A web application strictly validates the `Origin` header in CORS requests against a whitelist. However, the developer implemented the check using a regular expression: `^https:\\/\\/(www\\.)?example\\.com`. Which of the following attacker origins will successfully bypass this check?",
    options: ["https://example.com.attacker.com","https://www.example.com@attacker.com","https://attacker.com/example.com","https://www.example.com.attacker.com"],
    correctAnswer: 0,
    explanation: "The regular expression lacks a trailing anchor ($). It checks if the Origin *starts with* `https://example.com` or `https://www.example.com`. Therefore, an origin like `https://example.com.attacker.com` (which the attacker controls) perfectly matches the regex and bypasses the CORS validation."
  },
  {
    id: "security-10",
    role: "Security Engineer",
    difficulty: "hard",
    question: "Which of the following scenarios describes a 'Cross-Site Leaks' (XSLeaks) attack using the cache network timing technique?",
    options: ["An attacker sends a payload that measures the time it takes for a GraphQL query to return, deducing if a username exists.","An attacker forces the victim's browser to fetch a specific resource; the attacker then fetches the same resource and measures the response time to determine if the victim previously cached it.","An attacker uses WebRTC to leak the victim's internal IP address by measuring the connection setup time.","An attacker measures the execution time of a JavaScript function using `performance.now()` to steal encryption keys."],
    correctAnswer: 1,
    explanation: "XSLeaks often rely on side-channels to deduce state in another origin. In a cache timing attack, the attacker probes if a sensitive resource (e.g., an image loaded only if the user is an admin) is in the victim's browser cache. By measuring the time it takes to fetch the resource (or inferring it via other means like `onload` event timing), the attacker infers the victim's state."
  },
  {
    id: "security-11",
    role: "Security Engineer",
    difficulty: "expert",
    question: "In Java Deserialization attacks involving `ObjectInputStream`, the 'Gadget Chain' is crucial. What is the fundamental requirement for a class to be used as an entry point (kick-off) gadget in such an attack?",
    options: ["The class must implement the `Externalizable` interface.","The class must override the `readObject` method and perform operations (like reflection or method invocation) on fields initialized from the serialized stream.","The class must extend `java.lang.reflect.Proxy` to intercept method calls.","The class must contain a vulnerable `Runtime.getRuntime().exec()` call in its constructor."],
    correctAnswer: 1,
    explanation: "During deserialization, `ObjectInputStream.readObject()` automatically invokes the `readObject` method of the class being deserialized (if it exists). To trigger a gadget chain, the entry point class must override `readObject` and perform some action on its untrusted, deserialized fields (e.g., invoking a method on a deserialized object, putting it in a hash map, etc.), leading to the next gadget."
  },
  {
    id: "security-12",
    role: "Security Engineer",
    difficulty: "hard",
    question: "An application uses XML External Entity (XXE) mitigation by disabling DTDs: `factory.setFeature(\"http://apache.org/xml/features/disallow-doctype-decl\", true);`. However, an attacker realizes the application uses a flawed SAML implementation that processes XML Signatures. How can the attacker bypass this XXE mitigation?",
    options: ["By injecting an external entity directly into the SAML Subject element without using a DOCTYPE declaration.","By exploiting XSLT Processing within the XML Signature transformation step, which often uses a different XML parser context that might not have DTDs disabled.","By using an Out-Of-Band (OOB) parameter entity within a CDATA section.","By encoding the XML payload in UTF-16, which bypasses the feature flag detection."],
    correctAnswer: 1,
    explanation: "XML Signatures often rely on XML transformations (like XSLT) to canonicalize data before verifying the signature. If the underlying XSLT processor used during signature validation does not have secure processing configured, it can be exploited for XXE or code execution, bypassing the restrictions placed on the main XML document parser."
  },
  {
    id: "security-13",
    role: "Security Engineer",
    difficulty: "chaos",
    question: "A developer uses the `crypto.createHmac('sha256', secret)` in Node.js to sign session cookies. The secret is randomly generated once at startup: `secret = Math.random().toString()`. Why is this highly insecure, even if `Math.random` is practically unpredictable?",
    options: ["The length of `Math.random().toString()` is shorter than the SHA256 block size, allowing length extension attacks.","Node.js `crypto.createHmac` requires a buffer; passing a string causes it to fall back to a weak default key.","`Math.random()` in V8 uses the xorshift128+ algorithm, and its internal state can be recovered after observing a sequence of outputs.","The default encoding for strings in Node.js HMAC is ASCII, which truncates the randomness."],
    correctAnswer: 2,
    explanation: "`Math.random()` in modern JS engines (like V8) is not cryptographically secure (it uses xorshift128+). An attacker who can obtain a few outputs of `Math.random()` (e.g., if used elsewhere in the app for CSRF tokens or just predicting the sequence) can mathematically reverse the internal state of the PRNG and predict the exact value of the `secret` generated at startup."
  },
  {
    id: "security-14",
    role: "Security Engineer",
    difficulty: "expert",
    question: "In a Linux container environment (e.g., Docker), the `CAP_SYS_ADMIN` capability is highly dangerous. If an attacker compromises a container running with `CAP_SYS_ADMIN`, which of the following is the most direct method to escape to the host namespace?",
    options: ["Mounting the host's `/dev/sda1` using the `mknod` command and editing `/etc/shadow`.","Creating a new user namespace and mapping the host root UID to the container's root UID.","Using the `cgroups` release_agent feature by mounting the cgroup filesystem, writing a malicious script, and triggering it.","Exploiting a kernel panic by overloading the network stack via netlink sockets."],
    correctAnswer: 2,
    explanation: "`CAP_SYS_ADMIN` allows mounting filesystems. An attacker can mount the cgroup memory subsystem, enable the `notify_on_release` feature, and set the `release_agent` path to a script they wrote on the host's filesystem (which is accessible via the OverlayFS mount of the container). When a cgroup process dies, the host kernel executes the release_agent script as root in the host namespace."
  },
  {
    id: "security-15",
    role: "Security Engineer",
    difficulty: "expert",
    question: "Which of the following accurately describes a Length Extension Attack and the cryptographic construction it targets?",
    options: ["It targets HMAC constructions (e.g., HMAC-SHA256) by appending data to the message and forging the MAC without knowing the secret.","It targets naive MAC constructions like `Hash(secret || message)` where the hash function is based on the Merkle-Damgård construction (e.g., MD5, SHA-1, SHA-256).","It targets AES-CBC mode by manipulating the padding oracle to decrypt the last block.","It targets RSA signatures by exploiting the malleability of the PKCS#1 v1.5 padding scheme."],
    correctAnswer: 1,
    explanation: "Length extension attacks apply to hash functions utilizing the Merkle-Damgård construction. If a MAC is implemented incorrectly as `Hash(secret || message)`, an attacker who knows the length of the secret and intercepts the hash of a message can initialize the hash algorithm's internal state with the intercepted hash and append additional data, generating a valid hash for `secret || message || appended_data` without knowing the secret. HMAC is immune to this."
  },
  {
    id: "security-16",
    role: "Security Engineer",
    difficulty: "hard",
    question: "In GraphQL, an attacker wants to execute a Denial of Service (DoS) attack. The application limits query depth to 5. Which technique can the attacker still use to overwhelm the server?",
    options: ["Introspection queries to dump the entire schema.","Query Batching or Array-based requests, sending thousands of distinct, shallow queries in a single HTTP request.","Using GraphQL Fragments to create infinite recursive loops within the depth limit.","Exploiting the `__typename` meta-field to trigger excessive database joins."],
    correctAnswer: 1,
    explanation: "Even if query depth is restricted, many GraphQL implementations support query batching (sending an array of queries in JSON). An attacker can send an array containing thousands of resource-intensive but shallow queries. The server will process them all in a single request context, leading to CPU/Memory exhaustion."
  },
  {
    id: "security-17",
    role: "Security Engineer",
    difficulty: "hard",
    question: "When securing a modern web application against CSRF, setting cookies to `SameSite=Strict` provides strong defense. In what scenario can an attacker still effectively perform a CSRF-like state-changing action against the user despite `SameSite=Strict`?",
    options: ["By utilizing an open redirect on the target domain, which causes the browser to send the cookies during the redirect flow.","By placing the target domain in a full-screen `<iframe>` and using clickjacking.","By exploiting an XSS vulnerability on a subdomain, allowing them to make Same-Origin fetch requests.","By initiating the request from a completely different domain via a standard POST form submission."],
    correctAnswer: 2,
    explanation: "`SameSite=Strict` prevents cookies from being sent in any cross-site requests. However, if there is an XSS vulnerability on a subdomain (or the same origin), the attacker can execute JavaScript in the context of that site. Since the request originates from the same site, the browser attaches the `SameSite=Strict` cookies, completely bypassing the protection."
  },
  {
    id: "security-18",
    role: "Security Engineer",
    difficulty: "chaos",
    question: "A developer writes a custom Python session handler using `pickle` for serialization. To secure it, they sign the pickled data with HMAC-SHA256. The cookie format is `base64(pickle_data) + \".\" + hmac(secret, base64(pickle_data))`. What is a critical security flaw in this design if the application also has a separate file upload feature that reflects the file content?",
    options: ["The HMAC signature does not include a timestamp, making it vulnerable to replay attacks.","An attacker can upload a malicious pickle payload, get its signature via an error message or reflection, and use it as a session cookie to achieve RCE.","Python `pickle` is vulnerable to side-channel timing attacks when validating the HMAC.","The attacker can modify the base64 string slightly (e.g., adding padding) without invalidating the HMAC due to base64 decoding leniency."],
    correctAnswer: 1,
    explanation: "If an attacker can use a different part of the application (like an endpoint that signs arbitrary data or reflects it) to generate a valid HMAC signature for their own chosen payload, they can construct a malicious serialized object (e.g., using `__reduce__` for RCE), get it signed by the system, and submit it as their session cookie. This is known as a Chosen Ciphertext Attack context where the system acts as a signing oracle."
  },
  {
    id: "security-19",
    role: "Security Engineer",
    difficulty: "expert",
    question: "In a Server-Side Template Injection (SSTI) attack against a Jinja2 template environment in Python, what is the core mechanism used to achieve Remote Code Execution?",
    options: ["Exploiting the `eval()` function implicitly called by Jinja2 when rendering string variables.","Accessing the Method Resolution Order (MRO) via `__class__.__mro__` to find and instantiate the `subprocess.Popen` or `os` modules.","Injecting malicious SQL syntax into template variables that are directly passed to the ORM.","Overwriting the global template environment variables using the `set` directive to replace the `render` function."],
    correctAnswer: 1,
    explanation: "Jinja2 allows access to Python objects. An attacker starts with an empty string `''`, accesses its class `__class__`, then accesses the MRO `__mro__` to reach the base `object` class. From there, they use `__subclasses__()` to list all classes in the Python environment, locating classes that can execute commands (like `subprocess.Popen` or specific warning catchers that import `os`), and instantiate them to run arbitrary code."
  },
  {
    id: "security-20",
    role: "Security Engineer",
    difficulty: "hard",
    question: "A web application prevents brute-forcing of its login endpoint by implementing rate limiting based on the `X-Forwarded-For` header. How can an attacker reliably bypass this defense?",
    options: ["By rotating the User-Agent header for each request.","By injecting multiple IP addresses in the `X-Forwarded-For` header or spoofing the header with random IPs for each request.","By sending requests using HTTP/2 multiplexing to exhaust connection limits.","By using an IPv6 address instead of an IPv4 address."],
    correctAnswer: 1,
    explanation: "If rate limiting relies entirely on the `X-Forwarded-For` header without verifying the chain of trust from external proxies, an attacker can simply inject a spoofed or randomized IP address into the header (e.g., `X-Forwarded-For: 1.2.3.4`, then `1.2.3.5`). The application will perceive each request as originating from a different client, completely bypassing the rate limit."
  },
  {
    id: "security-21",
    role: "Security Engineer",
    difficulty: "expert",
    question: "When analyzing a compiled C binary for memory safety vulnerabilities, you identify a Use-After-Free (UAF). The target system uses the glibc heap allocator (ptmalloc). Which of the following conditions is strictly necessary to successfully exploit this UAF to achieve arbitrary code execution via hijacking the Instruction Pointer (EIP/RIP)?",
    options: ["The freed chunk must be placed into the fastbins, and the attacker must perform a double-free on the same chunk.","The attacker must be able to allocate a new object of the same size that occupies the freed memory, and overwrite function pointers or virtual table pointers contained within it before the program uses them.","The program must have a stack buffer overflow vulnerability to combine with the UAF.","The attacker must overwrite the `fd` and `bk` pointers of the freed chunk while it is in the unsorted bin to trigger the 'unlink' macro exploit."],
    correctAnswer: 1,
    explanation: "A Use-After-Free relies on a dangling pointer. To exploit it for execution control, the attacker must reallocate the freed memory with attacker-controlled data (e.g., a forged vtable pointer in C++). When the vulnerable program later uses the dangling pointer to call a method or function, it uses the attacker's data, redirecting execution. The 'unlink' macro exploit (option 4) is for heap overflows, not strictly UAF. Fastbin dup (option 1) is a specific technique that requires a double-free, which is different from a standard UAF reallocation."
  },
  {
    id: "security-22",
    role: "Security Engineer",
    difficulty: "hard",
    question: "A cloud-native application uses AWS IAM roles for service accounts (IRSA) in Kubernetes. A pod is compromised via an RCE vulnerability. What is the most critical metadata endpoint the attacker will query to extract the temporary AWS credentials associated with the pod's role?",
    options: ["http://169.254.169.254/latest/meta-data/iam/security-credentials/","http://169.254.169.254/latest/dynamic/instance-identity/document","Reading the token from `/var/run/secrets/eks.amazonaws.com/serviceaccount/token` and exchanging it via the AWS STS `AssumeRoleWithWebIdentity` API.","Querying the Kubernetes API server directly at `https://kubernetes.default.svc` for secrets."],
    correctAnswer: 2,
    explanation: "In AWS EKS with IRSA, pods do not obtain credentials from the EC2 instance metadata service (IMDS) at `169.254.169.254`. Instead, a Kubernetes projected service account token is injected into the pod's filesystem (usually `/var/run/secrets/eks.amazonaws.com/serviceaccount/token`). The AWS SDKs within the pod read this OIDC token and call the AWS STS `AssumeRoleWithWebIdentity` API to exchange it for temporary AWS credentials."
  },
  {
    id: "security-23",
    role: "Security Engineer",
    difficulty: "chaos",
    question: "During a penetration test on a web application utilizing WebSockets, you notice that the initial HTTP handshake for the WebSocket connection does not implement CSRF tokens, and relies solely on cookies for authentication. What attack is the application vulnerable to?",
    options: ["Cross-Site WebSocket Hijacking (CSWSH), allowing an attacker to establish an authenticated WebSocket connection from an attacker-controlled site and read bidirectional traffic.","WebSocket Smuggling, allowing the attacker to bypass WAF rules by encapsulating malicious HTTP payloads inside WebSocket frames.","WebSocket Denial of Service via Ping/Pong flooding.","Man-in-the-Middle (MitM) attacks, as WebSockets do not support TLS encryption by default."],
    correctAnswer: 0,
    explanation: "The WebSocket handshake is initiated via standard HTTP GET request with an `Upgrade` header. If authentication relies only on ambient credentials (cookies) without CSRF protection (like checking the `Origin` header or requiring an explicit token in the handshake or first message), a malicious site can initiate a `new WebSocket('wss://target.com/ws')`. The browser will send the victim's cookies, the server will upgrade the connection, and the attacker will have full read/write access to the authenticated WebSocket stream. This is Cross-Site WebSocket Hijacking (CSWSH)."
  },
  {
    id: "security-24",
    role: "Security Engineer",
    difficulty: "expert",
    question: "A developer configures a GitHub Actions workflow with the following trigger to allow PRs from forks to access a necessary secret: `on: [pull_request_target]`. The workflow checks out the PR's code explicitly and runs `npm install && npm run build`. Why is this configuration extremely dangerous?",
    options: ["It allows anyone to push commits directly to the main branch.","The workflow runs in the context of the base repository. By checking out the untrusted PR code and running `npm install`, an attacker can execute malicious scripts to steal repository secrets.","It exposes the GitHub token to public view in the actions log.","It bypasses branch protection rules automatically."],
    correctAnswer: 1,
    explanation: "While `pull_request` runs in the context of the merge commit with read-only access (safe), if a developer mistakenly uses `pull_request_target` (which is often done to give workflows access to secrets for PRs from forks), the workflow runs in the context of the base branch. If it then checks out the untrusted PR code and executes it (e.g., `npm install` running postinstall scripts), the attacker achieves execution within the privileged environment, allowing theft of `GITHUB_TOKEN` and repository secrets."
  },
  {
    id: "security-25",
    role: "Security Engineer",
    difficulty: "hard",
    question: "A mobile application utilizes Certificate Pinning to prevent Man-in-the-Middle attacks. The application pins the public key of the server's leaf certificate. What is a major operational risk associated with this specific pinning strategy?",
    options: ["If the server's certificate expires or is compromised and needs immediate rotation, the mobile application will be unable to connect until a new version with the updated pin is released to the app stores and installed by users.","It makes the application vulnerable to downgrade attacks against TLS 1.2.","It allows attackers to extract the private key from the mobile application binary.","It bypasses the operating system's root CA store, disabling all TLS validation."],
    correctAnswer: 0,
    explanation: "Pinning the leaf certificate's public key (or hash) directly means the app strictly expects that exact certificate. If the certificate is rotated, expires, or is revoked, the server will present a new certificate. The app will reject it because the pin doesn't match, locking out all users until they update the app. A safer approach is to pin the Intermediate CA or have backup pins."
  },
  {
    id: "sre-1",
    role: "Site Reliability Engineer",
    difficulty: "expert",
    question: "If a service has a 99.9% availability SLO over a 30-day window, how much downtime is permitted, and what is the typical formula used to calculate availability based on successful requests?",
    options: ["4.32 hours; (Good requests / Bad requests) * 100","4.32 minutes; (Total requests - Bad requests) / Bad requests","43.2 minutes; (Good requests / Total requests) * 100","43.2 minutes; (Total requests / Good requests) * 100"],
    correctAnswer: 2,
    explanation: "99.9% of 30 days (43200 minutes) leaves 0.1% downtime, which equates to exactly 43.2 minutes. Availability is typically calculated mathematically as the ratio of successful events to total events."
  },
  {
    id: "sre-2",
    role: "Site Reliability Engineer",
    difficulty: "chaos",
    question: "In Prometheus, which of the following label strategies is most likely to cause a 'cardinality explosion' and severely degrade TSDB performance?",
    options: ["Adding an `environment` label (e.g., prod, staging, dev) to all metrics.","Adding a `user_id` label to an HTTP request duration metric for a public-facing e-commerce site.","Adding an `http_status_code` label to an HTTP request counter.","Adding a `pod_name` label to a CPU usage metric in a Kubernetes cluster with 1000 pods."],
    correctAnswer: 1,
    explanation: "Cardinality is the number of unique combinations of label values. A `user_id` on a highly trafficked public site can have millions of unique values, creating a massive number of time series and overwhelming the TSDB."
  },
  {
    id: "sre-3",
    role: "Site Reliability Engineer",
    difficulty: "hard",
    question: "When the Linux kernel invokes the Out-Of-Memory (OOM) killer, which heuristic does it primarily use by default to select a process to terminate?",
    options: ["It calculates an `oom_score` based heavily on the proportion of RAM and swap space the process uses, favoring larger processes to free more memory.","It randomly selects a process from the `cgroup` with the highest memory consumption.","It immediately kills the process that triggered the page fault leading to the OOM condition.","It strictly terminates the process with the highest PID, assuming it is the most recently created."],
    correctAnswer: 0,
    explanation: "The Linux kernel assigns an `oom_score` to processes, primarily penalizing processes that use a large amount of memory relative to the system's total, though it also considers `oom_score_adj`."
  },
  {
    id: "sre-4",
    role: "Site Reliability Engineer",
    difficulty: "hard",
    question: "A high-throughput proxy server is exhausting its ephemeral ports due to too many sockets lingering in the TIME_WAIT state. Which sysctl parameter is often (sometimes dangerously) tweaked to mitigate this by allowing port reuse?",
    options: ["net.ipv4.tcp_fin_timeout","net.ipv4.tcp_syncookies","net.ipv4.tcp_keepalive_time","net.ipv4.tcp_tw_reuse"],
    correctAnswer: 3,
    explanation: "`net.ipv4.tcp_tw_reuse` allows the reuse of sockets in TIME_WAIT state for new outgoing connections when it's safe from a protocol perspective, alleviating ephemeral port exhaustion."
  },
  {
    id: "sre-5",
    role: "Site Reliability Engineer",
    difficulty: "expert",
    question: "Which of the following best describes the safety mechanism that prevents eBPF programs from crashing the Linux kernel?",
    options: ["eBPF programs are wrapped in a lightweight hypervisor sandbox managed by KVM.","The eBPF verifier analyzes the bytecode before loading to ensure it cannot loop indefinitely, access out-of-bounds memory, or perform unprivileged operations.","eBPF programs are executed entirely in user space, so kernel panics are impossible.","The kernel creates a snapshot of its state before executing an eBPF program and rolls back if an exception occurs."],
    correctAnswer: 1,
    explanation: "The in-kernel eBPF verifier performs static analysis to guarantee the program is safe to run (e.g., bounded execution, safe memory access) before allowing it to be attached to hooks."
  },
  {
    id: "sre-6",
    role: "Site Reliability Engineer",
    difficulty: "hard",
    question: "In Kubernetes, what is the difference between `nodeSelector` and `nodeAffinity`?",
    options: ["nodeSelector evaluates labels on the worker nodes, while nodeAffinity evaluates labels on the control plane nodes.","nodeSelector is used for pod-to-pod anti-affinity, while nodeAffinity is strictly for pod-to-node placement.","nodeAffinity provides a more expressive syntax (e.g., In, NotIn) and supports 'soft' preferences, whereas nodeSelector is a simpler, hard exact-match requirement.","nodeAffinity is deprecated in favor of nodeSelector in modern Kubernetes versions."],
    correctAnswer: 2,
    explanation: "`nodeAffinity` greatly expands the capabilities of node selection, offering operators like `NotIn` or `Exists`, and allows specifying soft preferences (`preferredDuringSchedulingIgnoredDuringExecution`)."
  },
  {
    id: "sre-7",
    role: "Site Reliability Engineer",
    difficulty: "expert",
    question: "In the Raft consensus algorithm, how does the system recover from a split-brain scenario caused by a network partition?",
    options: ["The oldest node in the cluster automatically seizes the leader role, invalidating the partition.","Both partitions will elect a leader and serve writes; conflict resolution happens via vector clocks when the partition heals.","The cluster immediately pauses all reads and writes globally until an external operator manually resolves the split.","Nodes in the minority partition will fail to achieve a quorum for leader election or log commits, while the majority partition continues normally."],
    correctAnswer: 3,
    explanation: "Raft prevents split-brain because a candidate must receive votes from a majority of the cluster to become leader. A minority partition cannot elect a leader or commit entries."
  },
  {
    id: "sre-8",
    role: "Site Reliability Engineer",
    difficulty: "hard",
    question: "According to Little's Law (L = λW), if a load balancer receives an average of 1,000 requests per second (λ) and the average response time (W) is 50 milliseconds, what is the average number of concurrent requests (L) in the system?",
    options: ["50","500","20","50,000"],
    correctAnswer: 0,
    explanation: "L = 1000 requests/second * 0.050 seconds = 50 concurrent requests."
  },
  {
    id: "sre-9",
    role: "Site Reliability Engineer",
    difficulty: "expert",
    question: "What is a 'cache stampede' (or thundering herd) in a highly concurrent system, and what is a common mitigation strategy?",
    options: ["It occurs when a popular cache key expires, and thousands of concurrent requests simultaneously query the backend database to regenerate the value. Mitigated by using a distributed lock or probabilistic early expiration.","It occurs when too many nodes join a memcached cluster simultaneously, causing re-hashing overhead. Mitigated by consistent hashing.","It occurs when a cache eviction policy deletes the most frequently used items by mistake. Mitigated by switching from LRU to LFU.","It occurs when the cache runs out of memory and swaps to disk. Mitigated by increasing the RAM limit."],
    correctAnswer: 0,
    explanation: "A cache stampede happens when concurrent requests miss the cache for the same key and hit the database concurrently. Locks or XFetch (probabilistic early expiration) prevent this."
  },
  {
    id: "sre-10",
    role: "Site Reliability Engineer",
    difficulty: "expert",
    question: "How does BGP Anycast route traffic to the 'closest' edge server in a Content Delivery Network (CDN)?",
    options: ["A central DNS server analyzes the user's IP and dynamically rewrites the A record to point to the nearest server.","Multiple geographically distributed servers announce the exact same IP address via BGP. Routers natively direct packets to the server with the shortest AS-path metric.","The client establishes a TCP connection to a load balancer, which then encapsulates the packet in a GRE tunnel to the nearest server based on latency probes.","BGP routers use an integrated GeoIP database to inspect incoming packets and forward them accordingly."],
    correctAnswer: 1,
    explanation: "Anycast works by having multiple endpoints advertise the same IP prefix via BGP. The Internet routing infrastructure naturally routes packets to the topologically nearest destination based on routing metrics."
  },
  {
    id: "sre-11",
    role: "Site Reliability Engineer",
    difficulty: "hard",
    question: "When a Pod in Kubernetes wants to communicate with a Service IP (ClusterIP), which component is primarily responsible for translating that Service IP into the IP of a specific backend Pod?",
    options: ["kube-proxy (often via iptables or IPVS rules)","CoreDNS","The CNI plugin (e.g., Calico, Flannel)","The Ingress Controller"],
    correctAnswer: 0,
    explanation: "kube-proxy programs netfilter rules (iptables/IPVS) on each node to intercept traffic destined for a ClusterIP and perform destination NAT (DNAT) to route it to an actual Pod IP."
  },
  {
    id: "sre-12",
    role: "Site Reliability Engineer",
    difficulty: "hard",
    question: "In the context of incident management, what is the primary purpose of an 'Error Budget'?",
    options: ["To define the maximum acceptable latency for the 99th percentile of requests.","To allocate a financial budget to compensate customers for SLA breaches at the end of the quarter.","To quantitatively balance system reliability with the pace of feature releases, acting as a threshold that triggers a freeze on non-essential deployments when exhausted.","To track the number of syntax errors generated by developers in the CI/CD pipeline."],
    correctAnswer: 2,
    explanation: "An error budget is the acceptable amount of unreliability (100% - SLO). It dictates how much risk a team can take. If depleted, the focus shifts from feature launches to reliability work."
  },
  {
    id: "sre-13",
    role: "Site Reliability Engineer",
    difficulty: "expert",
    question: "If you want to trace system calls made by a running process, including the time spent in each syscall, which `strace` flag combination is most appropriate?",
    options: ["strace -e trace=open -p <PID>","strace -c -p <PID>","strace -f -p <PID>","strace -s 1024 -p <PID>"],
    correctAnswer: 1,
    explanation: "The `-c` flag in strace generates a summary report counting time, calls, and errors for each system call executed by the process."
  },
  {
    id: "sre-14",
    role: "Site Reliability Engineer",
    difficulty: "hard",
    question: "You notice high `%iowait` in `top`. Which of the following statements about `%iowait` is most accurate?",
    options: ["It indicates the percentage of CPU cycles actively consumed by the kernel to transfer data between RAM and the disk controller via DMA.","It means the system's swap space is 100% full and the kernel is killing processes to reclaim memory.","It measures the network latency between the hypervisor and an external NAS/SAN.","It indicates the percentage of time that CPUs were idle AND there were outstanding disk I/O requests. It does not strictly mean the CPU is the bottleneck."],
    correctAnswer: 3,
    explanation: "`%iowait` is a sub-category of idle time. It means the CPU has no runable tasks, but at least one task is blocked waiting for I/O to complete."
  },
  {
    id: "sre-15",
    role: "Site Reliability Engineer",
    difficulty: "expert",
    question: "Which rate limiting algorithm allows for short bursts of traffic exceeding the average rate limit, provided there has been a period of inactivity to accumulate 'credits'?",
    options: ["Leaky Bucket","Fixed Window Counter","Token Bucket","Sliding Window Log"],
    correctAnswer: 2,
    explanation: "In a Token Bucket algorithm, tokens are added at a constant rate. If the bucket isn't full, they accumulate. This accumulated capacity allows a burst of traffic to be processed instantaneously."
  },
  {
    id: "sre-16",
    role: "Site Reliability Engineer",
    difficulty: "chaos",
    question: "Why is consistent hashing preferred over a simple modulo-based hashing scheme (e.g., hash(key) % N) in distributed caching systems?",
    options: ["Modulo hashing is cryptographically insecure and susceptible to collision attacks, whereas consistent hashing uses SHA-256.","Consistent hashing guarantees perfectly uniform distribution of keys, eliminating the need for virtual nodes.","When the number of nodes (N) changes (e.g., adding or removing a node), consistent hashing requires remapping only a small fraction of keys (1/N), minimizing cache misses.","Consistent hashing operates in O(1) time complexity, whereas modulo hashing is O(N)."],
    correctAnswer: 2,
    explanation: "Modulo hashing causes almost all keys to map to new nodes if N changes, invalidating the entire cache. Consistent hashing maps keys and nodes to a ring, so adding/removing a node only affects adjacent keys."
  },
  {
    id: "sre-17",
    role: "Site Reliability Engineer",
    difficulty: "expert",
    question: "How does the Linux kernel typically handle memory used by the page cache when user-space applications suddenly demand more RAM?",
    options: ["The page cache is strictly reserved; the kernel will swap the user-space application out to disk.","The kernel invokes the OOM killer immediately to protect the page cache.","The kernel automatically evicts clean pages from the page cache to satisfy the application's memory allocation request without triggering an OOM condition.","The page cache size is fixed at boot time via `sysctl` and cannot dynamically yield memory."],
    correctAnswer: 2,
    explanation: "The page cache utilizes unused RAM to cache disk blocks. If applications need more memory, the kernel readily drops 'clean' (unmodified) cached pages to free up RAM."
  },
  {
    id: "sre-18",
    role: "Site Reliability Engineer",
    difficulty: "hard",
    question: "In OpenTelemetry/Jaeger, what is the relationship between a 'Trace' and a 'Span'?",
    options: ["A Span is a collection of Traces originating from a single microservice.","A Trace captures metrics data, while a Span captures logging data.","A Trace represents the entire lifecycle of a request as it traverses a distributed system, while a Span represents a single, timed logical operation within that Trace.","Traces are used exclusively for frontend monitoring, while Spans are used for backend database queries."],
    correctAnswer: 2,
    explanation: "A Trace is a directed acyclic graph of Spans. The Trace tracks the whole request, and each Span is a specific component of that request (e.g., an HTTP call, a DB query)."
  },
  {
    id: "sre-19",
    role: "Site Reliability Engineer",
    difficulty: "hard",
    question: "During a DNS resolution process, what is the role of a 'Recursive Resolver'?",
    options: ["It receives a query from a client and iteratively queries root, TLD, and authoritative name servers on the client's behalf until it finds the IP address.","It holds the authoritative zone file for a domain and provides the final, official answer to queries.","It strictly forwards queries to a local `/etc/hosts` file and never contacts the internet.","It is a secondary DNS server that periodically requests zone transfers (AXFR) from the primary server."],
    correctAnswer: 0,
    explanation: "The recursive resolver (e.g., 8.8.8.8 or your ISP's DNS) does the heavy lifting of traversing the DNS hierarchy to resolve a hostname for the stub resolver (client)."
  },
  {
    id: "sre-20",
    role: "Site Reliability Engineer",
    difficulty: "hard",
    question: "According to the CAP theorem, when a network partition (P) occurs in a distributed database, a system must trade off between which two properties?",
    options: ["Consistency and Performance","Concurrency and Partition Tolerance","Availability and Atomicity","Consistency and Availability"],
    correctAnswer: 3,
    explanation: "The CAP theorem states that in the presence of a network Partition, a distributed data store can only guarantee either Consistency (all nodes see the same data) or Availability (every request receives a non-error response)."
  },
  {
    id: "sre-21",
    role: "Site Reliability Engineer",
    difficulty: "hard",
    question: "Which layer of the OSI model does an Application Load Balancer (ALB) like AWS ALB or an NGINX reverse proxy inspecting HTTP headers operate at?",
    options: ["Layer 7 (Application)","Layer 4 (Transport)","Layer 3 (Network)","Layer 2 (Data Link)"],
    correctAnswer: 0,
    explanation: "Layer 7 load balancers can inspect application-layer traffic (HTTP/HTTPS), allowing routing decisions based on URLs, headers, or cookies."
  },
  {
    id: "sre-22",
    role: "Site Reliability Engineer",
    difficulty: "expert",
    question: "Go is widely used in SRE tooling. What type of Garbage Collection algorithm does the Go runtime primarily use?",
    options: ["Generational Copying","Reference Counting with Cycle Detection","Stop-the-world Compacting","Concurrent Mark-and-Sweep"],
    correctAnswer: 3,
    explanation: "Go uses a concurrent, tri-color mark-and-sweep garbage collector, specifically designed for low latency by minimizing stop-the-world pause times."
  },
  {
    id: "sre-23",
    role: "Site Reliability Engineer",
    difficulty: "hard",
    question: "In a service mesh architecture like Istio, where does the 'data plane' proxy (e.g., Envoy) typically reside in a Kubernetes environment?",
    options: ["Injected as a sidecar container within the same Pod as the application container.","Deployed as a single, centralized DaemonSet running on the master node.","Integrated directly into the kube-proxy binary on every worker node.","Hosted externally as a managed service on the cloud provider's network edge."],
    correctAnswer: 0,
    explanation: "The data plane consists of lightweight proxies (like Envoy) deployed as sidecars alongside application code in the same pod, intercepting all network traffic."
  },
  {
    id: "sre-24",
    role: "Site Reliability Engineer",
    difficulty: "hard",
    question: "Which of the following scenarios is Object Storage (like Amazon S3) uniquely better suited for compared to Block Storage (like Amazon EBS)?",
    options: ["Hosting the boot volume and root filesystem for a high-performance database server.","Storing massive volumes of unstructured data, such as images and backups, with highly scalable read/write APIs over HTTP.","Providing ultra-low latency, sub-millisecond I/O for high-frequency trading applications.","Allowing a single storage volume to be mounted simultaneously by hundreds of virtual machines with POSIX compliance."],
    correctAnswer: 1,
    explanation: "Object storage is designed for massive scalability of unstructured data accessible via HTTP APIs. It is not POSIX compliant and generally has higher latency than block storage."
  },
  {
    id: "sre-25",
    role: "Site Reliability Engineer",
    difficulty: "chaos",
    question: "Which of the following best defines the primary goal of Chaos Engineering?",
    options: ["To randomly terminate production instances during peak traffic hours without warning to see if on-call engineers are paying attention.","To proactively experiment on a system by injecting controlled failures to uncover systemic weaknesses and build confidence in its resilience.","To intentionally overload the system with DDoS-style traffic until it crashes to determine the maximum capacity.","To test the security perimeter by attempting unauthorized data exfiltration using known vulnerabilities."],
    correctAnswer: 1,
    explanation: "Chaos engineering is the discipline of experimenting on a system to build confidence in the system's capability to withstand turbulent conditions in production. It is controlled and hypothesis-driven."
  }
];

export const getRandomQuestions = (count: number = 10, role?: string, difficulty?: Difficulty): QuizQuestion[] => {
  let filtered = [...quizQuestions];

  if (role) {
    filtered = filtered.filter(q => q.role.toLowerCase() === role.toLowerCase());
  }

  if (difficulty) {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }

  // Shuffle array using Fisher-Yates
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  return filtered.slice(0, count);
};

export const getUniqueRoles = (): string[] => {
  const roles = new Set(quizQuestions.map(q => q.role));
  return Array.from(roles).sort();
};

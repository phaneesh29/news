export type Difficulty = "easy" | "medium" | "hard" | "expert" | "chaos";

export interface QuizQuestion {
  id: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const quizQuestions: QuizQuestion[] = [
  // OS (1-10)
  {
    id: "os1", topic: "Operating Systems", difficulty: "medium",
    question: "What is the primary difference between a process and a thread?",
    options: ["Threads have their own memory space", "Processes share memory space by default", "Threads share the same address space of the process that created them", "A process can only have one thread"],
    correctAnswer: 2,
    explanation: "Threads within the same process share the same data and code segments (address space), whereas processes have isolated memory spaces."
  },
  {
    id: "os2", topic: "Operating Systems", difficulty: "hard",
    question: "Which of the following is NOT a necessary condition for a deadlock to occur?",
    options: ["Mutual Exclusion", "Hold and Wait", "No Preemption", "Race Condition"],
    correctAnswer: 3,
    explanation: "The Coffman conditions for deadlock are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Race Condition is a synchronization issue, but not a deadlock condition."
  },
  {
    id: "os3", topic: "Operating Systems", difficulty: "medium",
    question: "What happens when a page fault occurs?",
    options: ["The CPU crashes", "The OS brings the required page from disk to RAM", "The process is immediately terminated", "The CPU ignores the missing page"],
    correctAnswer: 1,
    explanation: "A page fault triggers an interrupt that signals the OS to fetch the missing memory page from swap/disk into physical RAM."
  },
  {
    id: "os4", topic: "Operating Systems", difficulty: "expert",
    question: "In a Linux system, what does an 'inode' store?",
    options: ["File name and content", "File metadata and pointers to data blocks", "Only the file content", "Network routing tables"],
    correctAnswer: 1,
    explanation: "An inode stores metadata about a file (permissions, owner, size, timestamps) and pointers to the disk blocks where the actual data is stored. It does NOT store the filename."
  },
  {
    id: "os5", topic: "Operating Systems", difficulty: "hard",
    question: "What is the purpose of the Translation Lookaside Buffer (TLB)?",
    options: ["Cache file system directories", "Cache recently translated virtual-to-physical memory addresses", "Translate network packets", "Buffer disk I/O operations"],
    correctAnswer: 1,
    explanation: "The TLB is a hardware cache used by the MMU to store recent virtual-to-physical address translations, significantly speeding up memory access."
  },
  {
    id: "os6", topic: "Operating Systems", difficulty: "medium",
    question: "Which scheduling algorithm can suffer from 'starvation'?",
    options: ["Round Robin", "First-Come, First-Served", "Shortest Job First", "All of the above"],
    correctAnswer: 2,
    explanation: "Shortest Job First (SJF) can cause starvation for long processes if short processes continuously arrive in the queue."
  },
  {
    id: "os7", topic: "Operating Systems", difficulty: "chaos",
    question: "What is a 'zombie process' in Unix?",
    options: ["A process that has completed execution but still has an entry in the process table", "A malware process that replicates itself", "A background daemon", "A process that is sleeping indefinitely"],
    correctAnswer: 0,
    explanation: "A zombie process has terminated, but its parent hasn't yet called wait() to read its exit status, leaving an entry in the process table."
  },
  {
    id: "os8", topic: "Operating Systems", difficulty: "hard",
    question: "What is context switching?",
    options: ["Switching keyboard inputs", "Storing the state of a process/thread and loading the state of another", "Changing CPU clock speed", "Switching between user mode and kernel mode"],
    correctAnswer: 1,
    explanation: "Context switching involves saving the CPU registers and state of the current process/thread and loading the state of the next one to run."
  },
  {
    id: "os9", topic: "Operating Systems", difficulty: "expert",
    question: "How does a spinlock differ from a mutex?",
    options: ["Spinlocks put the thread to sleep, mutexes do not", "Spinlocks perform busy-waiting, consuming CPU cycles, while mutexes yield the CPU", "Mutexes can only be used by one thread ever", "There is no difference"],
    correctAnswer: 1,
    explanation: "A spinlock causes a thread trying to acquire it to simply wait in a loop ('spin') while repeatedly checking if the lock is available, burning CPU but avoiding context switch overhead."
  },
  {
    id: "os10", topic: "Operating Systems", difficulty: "medium",
    question: "What does thrashing mean in the context of virtual memory?",
    options: ["The CPU is overheating", "The OS spends more time paging data in and out than executing processes", "The hard drive is physically clicking", "A process is stuck in an infinite loop"],
    correctAnswer: 1,
    explanation: "Thrashing occurs when the system lacks sufficient physical memory, causing it to constantly swap pages between RAM and disk, bringing execution to a crawl."
  },

  // Networks (11-20)
  {
    id: "cn1", topic: "Computer Networks", difficulty: "medium",
    question: "Which of these is a connectionless protocol?",
    options: ["TCP", "HTTP", "UDP", "SSH"],
    correctAnswer: 2,
    explanation: "UDP is connectionless and does not guarantee delivery, ordering, or error checking, making it faster but less reliable than TCP."
  },
  {
    id: "cn2", topic: "Computer Networks", difficulty: "hard",
    question: "During a TCP 3-way handshake, what is the sequence of packets exchanged?",
    options: ["SYN, ACK, SYN-ACK", "SYN, SYN-ACK, ACK", "ACK, SYN, SYN-ACK", "SYN-ACK, SYN, ACK"],
    correctAnswer: 1,
    explanation: "The client sends a SYN, the server responds with a SYN-ACK, and the client acknowledges with an ACK."
  },
  {
    id: "cn3", topic: "Computer Networks", difficulty: "expert",
    question: "What is BGP primarily used for?",
    options: ["Assigning IP addresses to local devices", "Routing packets between different autonomous systems on the Internet", "Resolving domain names to IP addresses", "Encrypting web traffic"],
    correctAnswer: 1,
    explanation: "Border Gateway Protocol (BGP) is the core routing protocol of the Internet, exchanging routing info between Autonomous Systems (AS)."
  },
  {
    id: "cn4", topic: "Computer Networks", difficulty: "chaos",
    question: "In HTTP semantics, which method is NOT defined as idempotent?",
    options: ["GET", "PUT", "DELETE", "POST"],
    correctAnswer: 3,
    explanation: "POST is non-idempotent because making multiple identical POST requests generally results in multiple resources being created."
  },
  {
    id: "cn5", topic: "Computer Networks", difficulty: "hard",
    question: "What does the SNI (Server Name Indication) extension in TLS allow?",
    options: ["Faster encryption", "Hosting multiple HTTPS websites with different certificates on a single IP", "Hiding the destination IP address", "Bypassing firewalls"],
    correctAnswer: 1,
    explanation: "SNI allows the client to tell the server which hostname it is trying to connect to during the TLS handshake, enabling multiple certificates on one IP."
  },
  {
    id: "cn6", topic: "Computer Networks", difficulty: "medium",
    question: "Which port is officially designated for HTTPS traffic?",
    options: ["80", "443", "8080", "22"],
    correctAnswer: 1,
    explanation: "Port 443 is the standard port for secure web traffic (HTTPS)."
  },
  {
    id: "cn7", topic: "Computer Networks", difficulty: "hard",
    question: "What is the primary function of an ARP request?",
    options: ["Find the MAC address corresponding to a known IP address", "Find the IP address corresponding to a known MAC address", "Assign an IP address to a client", "Route packets across the internet"],
    correctAnswer: 0,
    explanation: "Address Resolution Protocol (ARP) translates a network layer IP address into a link layer MAC address on a local network."
  },
  {
    id: "cn8", topic: "Computer Networks", difficulty: "chaos",
    question: "What happens if a router receives an IP packet with a TTL (Time to Live) of 1?",
    options: ["It forwards it immediately", "It drops the packet and sends an ICMP Time Exceeded message to the sender", "It increments the TTL to 2", "It broadcasts the packet"],
    correctAnswer: 1,
    explanation: "Routers decrement the TTL by 1. If it hits 0, the packet is discarded to prevent infinite routing loops, and an ICMP message is returned."
  },
  {
    id: "cn9", topic: "Computer Networks", difficulty: "medium",
    question: "Which layer of the OSI model does a standard Router operate at?",
    options: ["Layer 2 (Data Link)", "Layer 3 (Network)", "Layer 4 (Transport)", "Layer 7 (Application)"],
    correctAnswer: 1,
    explanation: "Routers forward packets based on IP addresses, which are part of the Layer 3 (Network) protocol."
  },
  {
    id: "cn10", topic: "Computer Networks", difficulty: "expert",
    question: "What is the purpose of HTTP/2 Multiplexing?",
    options: ["Sending multiple DNS requests at once", "Allowing multiple requests and responses to be in flight simultaneously over a single TCP connection", "Compressing HTTP headers", "Using multiple TCP connections simultaneously"],
    correctAnswer: 1,
    explanation: "Multiplexing solves the HTTP/1.1 Head-of-Line blocking problem by allowing concurrent streams over a single TCP connection."
  },

  // DBMS (21-30)
  {
    id: "db1", topic: "DBMS", difficulty: "hard",
    question: "Which SQL isolation level completely prevents Dirty Reads, Non-Repeatable Reads, and Phantom Reads?",
    options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
    correctAnswer: 3,
    explanation: "Serializable is the highest isolation level. It guarantees that transactions run strictly sequentially, preventing all read anomalies."
  },
  {
    id: "db2", topic: "DBMS", difficulty: "chaos",
    question: "In PostgreSQL, what is a known gotcha regarding wrapping a DDL statement (like CREATE TABLE) in a transaction block?",
    options: ["It will immediately crash the DB", "PostgreSQL supports transactional DDL, so it will rollback correctly if aborted", "DDL statements inherently auto-commit and cannot be rolled back", "It causes a system-wide lock until restart"],
    correctAnswer: 1,
    explanation: "Unlike MySQL or Oracle where DDL causes implicit commits, PostgreSQL supports transactional DDL, allowing you to rollback table creations/alterations safely."
  },
  {
    id: "db3", topic: "DBMS", difficulty: "expert",
    question: "What data structure is predominantly used for database indexes to allow fast range queries?",
    options: ["Hash Table", "B-Tree (or B+ Tree)", "Linked List", "Bloom Filter"],
    correctAnswer: 1,
    explanation: "B-Trees (specifically B+ Trees) keep keys sorted and allow fast O(log N) lookups, insertions, deletions, and crucial sequential range scans."
  },
  {
    id: "db4", topic: "DBMS", difficulty: "medium",
    question: "What does the 'C' in ACID stand for?",
    options: ["Concurrency", "Consistency", "CAP", "Caching"],
    correctAnswer: 1,
    explanation: "Consistency ensures that a transaction takes the database from one valid state to another, maintaining all predefined rules and constraints."
  },
  {
    id: "db5", topic: "DBMS", difficulty: "hard",
    question: "When would you choose an Optimistic Concurrency Control (OCC) over Pessimistic Locking?",
    options: ["When lock contention is expected to be very high", "When data conflicts are rare and you want to avoid locking overhead", "When using SQLite exclusively", "When you want to prevent all phantom reads"],
    correctAnswer: 1,
    explanation: "OCC uses version numbers/timestamps to check for conflicts at commit time. It's highly performant when conflicts are rare, avoiding expensive database locks."
  },
  {
    id: "db6", topic: "DBMS", difficulty: "expert",
    question: "What is an N+1 query problem?",
    options: ["Querying an API exactly N+1 times", "Fetching a parent record, then executing a separate query for each of its N child records", "A limit offset pagination error", "A SQL injection pattern"],
    correctAnswer: 1,
    explanation: "The N+1 problem occurs (often in ORMs) when the code fetches 1 list of objects, then makes N additional queries to fetch a related entity for each object."
  },
  {
    id: "db7", topic: "DBMS", difficulty: "hard",
    question: "In a composite B-Tree index on (A, B, C), which query condition CANNOT fully utilize the index?",
    options: ["WHERE A = 1 AND B = 2 AND C = 3", "WHERE A = 1 AND B > 2", "WHERE B = 2 AND C = 3", "WHERE A = 1"],
    correctAnswer: 2,
    explanation: "Due to the left-prefix rule of B-Trees, an index on (A, B, C) cannot be used efficiently if the query filters only on B and C without specifying A."
  },
  {
    id: "db8", topic: "DBMS", difficulty: "chaos",
    question: "What happens if you use `SELECT COUNT(*)` vs `SELECT COUNT(column_name)`?",
    options: ["They are exactly identical in output and performance", "COUNT(*) counts rows including NULLs, COUNT(column) ignores NULLs in that column", "COUNT(column) is always faster", "COUNT(*) will crash if there are NULLs"],
    correctAnswer: 1,
    explanation: "COUNT(*) counts total rows. COUNT(column_name) counts only the rows where column_name is NOT NULL."
  },
  {
    id: "db9", topic: "DBMS", difficulty: "expert",
    question: "In distributed databases, what does the CAP theorem state regarding Network Partitions?",
    options: ["You can always achieve Consistency and Availability even during a partition", "In the presence of a network partition, you must choose between Consistency and Availability", "Network partitions are impossible in modern cloud", "Partitions only affect Relational Databases"],
    correctAnswer: 1,
    explanation: "Since network partitions (P) are inevitable in distributed systems, CAP dictates that during a partition, a system can either be Consistent (CP) or Available (AP), but not both."
  },
  {
    id: "db10", topic: "DBMS", difficulty: "medium",
    question: "What is Database Normalization?",
    options: ["Encrypting data at rest", "Restoring a database from backup", "Organizing data to reduce redundancy and improve data integrity", "Denormalizing tables for read performance"],
    correctAnswer: 2,
    explanation: "Normalization involves dividing larger tables into smaller ones and linking them using relationships to minimize duplicate data."
  },

  // Linux & DevOps (31-40)
  {
    id: "lnx1", topic: "Linux", difficulty: "medium",
    question: "In Linux file permissions, what does 'chmod 755' mean?",
    options: ["Read/Write/Execute for Owner, Read/Execute for Group and Others", "Read/Write for Everyone", "Execute only for Owner", "Full control for Group, Read only for Owner"],
    correctAnswer: 0,
    explanation: "7 (4+2+1) means Read, Write, Execute for the user. 5 (4+1) means Read and Execute for group and others."
  },
  {
    id: "lnx2", topic: "Linux", difficulty: "chaos",
    question: "What is the difference between a hard link and a symbolic (soft) link in Linux?",
    options: ["Soft links point to inodes, hard links point to filenames", "Hard links point to the same inode as the original file, soft links point to the file path", "Hard links can cross file systems, soft links cannot", "There is no difference"],
    correctAnswer: 1,
    explanation: "A hard link shares the exact same inode and data blocks as the original file. A soft link is a special file containing the path to another file."
  },
  {
    id: "lnx3", topic: "Linux", difficulty: "hard",
    question: "What signal does `kill -9` send to a process?",
    options: ["SIGTERM", "SIGINT", "SIGKILL", "SIGHUP"],
    correctAnswer: 2,
    explanation: "kill -9 sends SIGKILL. Unlike SIGTERM (15), SIGKILL cannot be caught, blocked, or ignored by the process; the kernel terminates it immediately."
  },
  {
    id: "lnx4", topic: "DevOps", difficulty: "chaos",
    question: "A common Docker production mistake is running processes as the 'root' user inside the container. Why is this bad?",
    options: ["It consumes more RAM", "If an attacker escapes the container, they may retain root privileges on the host", "Docker will refuse to start the container", "It causes image bloat"],
    correctAnswer: 1,
    explanation: "By default, root in a container is the same UID as root on the host. If a container breakout vulnerability occurs, the attacker has host root access."
  },
  {
    id: "lnx5", topic: "Linux", difficulty: "expert",
    question: "Which Linux kernel feature fundamentally enables Docker containers to have isolated process trees, network interfaces, and mounts?",
    options: ["cgroups (Control Groups)", "Namespaces", "SELinux", "chroot"],
    correctAnswer: 1,
    explanation: "Namespaces isolate resources (PID, Mount, Net, User) so a process sees an isolated view of the system. cgroups are used for resource limiting (CPU/Memory)."
  },
  {
    id: "lnx6", topic: "DevOps", difficulty: "medium",
    question: "What is the purpose of a Docker multi-stage build?",
    options: ["To run multiple containers at once", "To reduce the final image size by discarding build dependencies", "To deploy to multiple clouds simultaneously", "To encrypt the Dockerfile"],
    correctAnswer: 1,
    explanation: "Multi-stage builds allow you to compile code in one image (with heavy SDKs) and copy only the compiled artifacts into a small, minimal runtime image."
  },
  {
    id: "lnx7", topic: "Linux", difficulty: "hard",
    question: "What tool would you use to trace the system calls made by a running process?",
    options: ["top", "netstat", "strace", "tcpdump"],
    correctAnswer: 2,
    explanation: "strace intercepts and records the system calls which are called by a process and the signals which are received by a process."
  },
  {
    id: "lnx8", topic: "DevOps", difficulty: "expert",
    question: "In CI/CD pipelines, what is 'Cache Poisoning' in the context of dependency caching?",
    options: ["When a malicious package replaces a valid one in the cache, affecting subsequent builds", "When the cache consumes all disk space", "When RAM is corrupted during build", "When Docker images fail to pull"],
    correctAnswer: 0,
    explanation: "Cache poisoning occurs when bad or malicious dependencies are incorrectly stored in a shared CI cache and then retrieved by subsequent legitimate pipeline runs."
  },
  {
    id: "lnx9", topic: "Linux", difficulty: "chaos",
    question: "What does the command `rm -rf /` actually do on a modern Linux system?",
    options: ["Immediately wipes the entire drive", "Fails gracefully because modern GNU rm requires --no-preserve-root to execute on /", "Only deletes the /root directory", "Reboots the system"],
    correctAnswer: 1,
    explanation: "To prevent catastrophic accidents, modern GNU coreutils 'rm' implements a safety mechanism requiring the flag '--no-preserve-root' to recursively delete the root directory."
  },
  {
    id: "lnx10", topic: "DevOps", difficulty: "hard",
    question: "What is an Infrastructure as Code (IaC) 'drift'?",
    options: ["When servers physically move between datacenters", "When the actual state of cloud resources diverges from the state defined in code (e.g., Terraform)", "When git branches diverge", "When load balancers distribute traffic unevenly"],
    correctAnswer: 1,
    explanation: "Drift happens when someone makes manual changes via the cloud console, causing reality to mismatch the declarative Terraform/CloudFormation files."
  },

  // Distributed Systems & Architecture (41-55)
  {
    id: "arch1", topic: "Architecture", difficulty: "expert",
    question: "What is the Thundering Herd problem?",
    options: ["When many servers boot at the exact same time", "When a cache expires and thousands of concurrent requests simultaneously hit the database to regenerate the same key", "When a DDoS attack hits a firewall", "When message queues overflow"],
    correctAnswer: 1,
    explanation: "A thundering herd occurs when a highly requested cache key expires, causing all concurrent requests to miss the cache and simultaneously overwhelm the underlying database."
  },
  {
    id: "arch2", topic: "Architecture", difficulty: "hard",
    question: "How do you achieve idempotency in an API endpoint (e.g., POST /payments)?",
    options: ["By using GET instead of POST", "By using a unique Idempotency-Key header mapped to transaction states to prevent double-charging", "By disabling retries completely", "By locking the entire database table"],
    correctAnswer: 1,
    explanation: "Clients pass a unique Idempotency-Key. The server stores this key; if the same key is received again (e.g., due to a network retry), the server returns the cached success response instead of processing it twice."
  },
  {
    id: "ds1", topic: "Distributed Systems", difficulty: "expert",
    question: "What consensus algorithm is heavily utilized by etcd and Consul for leader election and state machine replication?",
    options: ["Paxos", "Raft", "ZAB (ZooKeeper Atomic Broadcast)", "Gossip Protocol"],
    correctAnswer: 1,
    explanation: "Raft is designed to be a more understandable alternative to Paxos and is the underlying consensus algorithm for etcd (used by Kubernetes) and Consul."
  },
  {
    id: "ds2", topic: "Distributed Systems", difficulty: "chaos",
    question: "What happens in a 'Split Brain' scenario in a distributed cluster?",
    options: ["The cluster operates twice as fast", "A network partition causes two groups of nodes to each elect their own leader, causing conflicting data writes", "The database automatically splits into shards", "Memory is divided into two segments"],
    correctAnswer: 1,
    explanation: "Split brain occurs when network connectivity is lost between cluster nodes, and multiple nodes independently assume the role of the primary/leader, leading to data corruption."
  },
  {
    id: "arch3", topic: "Architecture", difficulty: "medium",
    question: "What is a major advantage of the Event-Driven Architecture pattern?",
    options: ["It makes debugging synchronous flows trivial", "It tightly couples services together", "It allows services to act asynchronously and scale independently based on message queues", "It eliminates the need for databases"],
    correctAnswer: 2,
    explanation: "Event-driven systems decouple producers and consumers via event brokers (like Kafka/RabbitMQ), allowing high scalability, resilience, and asynchronous processing."
  },
  {
    id: "ds3", topic: "Distributed Systems", difficulty: "expert",
    question: "In Dynamo-style databases (like Cassandra), what are 'Hinted Handoffs' used for?",
    options: ["To delete old data", "To temporarily store writes locally on a healthy node when the target replica node is down, delivering them when it recovers", "To elect a new leader", "To compress network payloads"],
    correctAnswer: 1,
    explanation: "If a replica is temporarily offline, another node accepts the write and stores a 'hint'. Once the offline node recovers, the healthy node 'hands off' the data, ensuring eventual consistency."
  },
  {
    id: "arch4", topic: "Architecture", difficulty: "hard",
    question: "When dealing with Microservices, what is the 'Saga Pattern' used to solve?",
    options: ["Frontend state management", "Distributed tracing", "Managing distributed transactions across multiple services without a centralized lock", "Deploying monolithic code"],
    correctAnswer: 2,
    explanation: "The Saga pattern manages distributed transactions by breaking them into a sequence of local transactions. If one step fails, it executes compensating transactions to undo the previous steps."
  },
  {
    id: "ds4", topic: "Distributed Systems", difficulty: "expert",
    question: "What are Vector Clocks used for in distributed systems?",
    options: ["Synchronizing physical hardware clocks via NTP", "Generating random UUIDs", "Detecting causality and resolving conflicts in eventually consistent systems where events happen concurrently", "Measuring network latency"],
    correctAnswer: 2,
    explanation: "Vector clocks provide a partial ordering of events in a distributed system, allowing the system to detect if writes occurred concurrently or sequentially, helping resolve conflicts."
  },
  {
    id: "arch5", topic: "Architecture", difficulty: "medium",
    question: "Which of the following is an example of an API Gateway responsibility?",
    options: ["Executing complex SQL joins", "Rendering HTML pages", "Rate limiting, auth termination, and routing to backend microservices", "Training machine learning models"],
    correctAnswer: 2,
    explanation: "API Gateways act as a reverse proxy, sitting in front of microservices to handle cross-cutting concerns like routing, rate limiting, authentication, and SSL termination."
  },
  {
    id: "ds5", topic: "Distributed Systems", difficulty: "chaos",
    question: "Why is strictly relying on server timestamps for ordering distributed events dangerous?",
    options: ["Timestamps take up too much memory", "Clock Drift causes servers to have slightly different physical times, even with NTP, making absolute temporal ordering unreliable", "Integers can overflow", "Time zones confuse the database"],
    correctAnswer: 1,
    explanation: "Physical clocks on different machines drift. If event ordering relies purely on timestamps (instead of logical clocks), a fast clock on one node can incorrectly reorder events."
  },
  {
    id: "arch6", topic: "Architecture", difficulty: "hard",
    question: "What is the primary benefit of the Circuit Breaker pattern?",
    options: ["It automatically scales servers", "It stops network loops", "It prevents a system from repeatedly attempting an operation that is likely to fail, giving the failing subsystem time to recover", "It encrypts traffic between nodes"],
    correctAnswer: 2,
    explanation: "If a downstream service goes down, the circuit breaker 'opens', failing fast and preventing cascading failures across the architecture until the service recovers."
  },
  {
    id: "arch7", topic: "Architecture", difficulty: "expert",
    question: "What does 'Consistent Hashing' prevent when scaling out a distributed cache (like Memcached)?",
    options: ["Hash collisions", "Remapping the entire dataset. It ensures only a small fraction of keys are remapped when a node is added or removed.", "Data eviction", "Memory leaks"],
    correctAnswer: 1,
    explanation: "Standard modulo hashing (`hash(key) % N`) forces almost all keys to remap if N changes. Consistent hashing maps nodes and keys to a ring, minimizing data movement during scaling."
  },
  {
    id: "arch8", topic: "Architecture", difficulty: "medium",
    question: "What is the purpose of a Content Delivery Network (CDN)?",
    options: ["To store relational database backups", "To cache static assets at edge locations geographically closer to users, reducing latency", "To execute long-running background jobs", "To secure application code"],
    correctAnswer: 1,
    explanation: "CDNs cache heavy assets (images, JS, CSS) at edge nodes around the world, significantly reducing load on the origin server and improving page load speeds for users."
  },
  {
    id: "ds6", topic: "Distributed Systems", difficulty: "chaos",
    question: "What is the 'Two Generals Problem'?",
    options: ["A bug in early AI code", "A thought experiment proving that reaching consensus over an unreliable network is impossible", "A scheduling conflict in multi-core CPUs", "A security flaw in shared hosting"],
    correctAnswer: 1,
    explanation: "The Two Generals problem proves theoretically that two nodes cannot guarantee consensus if the communication channel between them can drop messages."
  },
  {
    id: "arch9", topic: "Architecture", difficulty: "hard",
    question: "When applying a Retry strategy to network requests, why is 'Exponential Backoff with Jitter' highly recommended?",
    options: ["It encrypts the payload", "It ensures retries happen instantly", "It prevents retry storms by spreading out the retry attempts randomly, avoiding thundering herds", "It bypasses load balancers"],
    correctAnswer: 2,
    explanation: "If multiple clients fail simultaneously and retry at exact intervals, they'll repeatedly hammer the server at the same time. Jitter adds randomness to spread out the load."
  },

  // Security (56-65)
  {
    id: "sec1", topic: "Security", difficulty: "medium",
    question: "What is Cross-Site Scripting (XSS)?",
    options: ["Intercepting network traffic", "Injecting malicious JavaScript into a web page viewed by other users", "Forging a user's cookie", "Cracking a password hash"],
    correctAnswer: 1,
    explanation: "XSS occurs when an application includes untrusted data in a web page without proper validation or escaping, allowing attackers to execute JS in victims' browsers."
  },
  {
    id: "sec2", topic: "Security", difficulty: "hard",
    question: "How does a parameterized query (Prepared Statement) prevent SQL Injection?",
    options: ["It encrypts the SQL query string", "It strips all special characters from the input", "It sends the SQL template and the user data to the database separately, ensuring data is never parsed as executable code", "It uses a firewall"],
    correctAnswer: 2,
    explanation: "Prepared statements pre-compile the SQL template on the DB server. The parameters are then treated strictly as literal values, never as executable SQL commands."
  },
  {
    id: "sec3", topic: "Security", difficulty: "chaos",
    question: "What is a major security gotcha of storing JWTs (JSON Web Tokens) in localStorage?",
    options: ["localStorage deletes data randomly", "localStorage is restricted by CORS", "localStorage is accessible via JavaScript, making the token vulnerable to XSS attacks", "localStorage cannot store long strings"],
    correctAnswer: 2,
    explanation: "If an attacker executes an XSS payload, they can read `localStorage.getItem('token')`. Using HttpOnly secure cookies prevents JS from reading the token."
  },
  {
    id: "sec4", topic: "Security", difficulty: "expert",
    question: "What is Server-Side Request Forgery (SSRF)?",
    options: ["Faking an IP address", "Tricking a server into making HTTP requests to internal, protected resources behind its firewall", "Tricking a client browser into making an unwanted request", "Stealing server SSH keys"],
    correctAnswer: 1,
    explanation: "In an SSRF attack, an attacker abuses functionality on the server to read or update internal resources (like AWS metadata IP 169.254.169.254) not intended for public access."
  },
  {
    id: "sec5", topic: "Security", difficulty: "medium",
    question: "What hashing algorithm is currently considered the industry standard for securely storing user passwords?",
    options: ["MD5", "SHA-1", "Argon2 (or bcrypt)", "Base64"],
    correctAnswer: 2,
    explanation: "Argon2, bcrypt, and scrypt are purposely slow, salted hashing algorithms designed to thwart brute-force and rainbow table attacks. MD5 and SHA-1 are broken for passwords."
  },
  {
    id: "sec6", topic: "Security", difficulty: "hard",
    question: "What is the purpose of the Same-Origin Policy (SOP) in browsers?",
    options: ["To prevent users from opening multiple tabs", "To block cookies entirely", "To restrict how a document/script loaded from one origin can interact with a resource from another origin", "To ensure all images have the same dimensions"],
    correctAnswer: 2,
    explanation: "SOP is a critical security mechanism that isolates potentially malicious documents, preventing JS on evil.com from reading data on bank.com."
  },
  {
    id: "sec7", topic: "Security", difficulty: "chaos",
    question: "Why should you NOT use `Math.random()` for generating session IDs or crypto keys?",
    options: ["It returns strings instead of numbers", "It is extremely slow", "It is a Pseudo-Random Number Generator (PRNG) and its outputs are mathematically predictable", "It requires an internet connection"],
    correctAnswer: 2,
    explanation: "Math.random() is predictable. Cryptographically Secure PRNGs (CSPRNGs) like `crypto.getRandomValues()` or Node's `crypto.randomBytes()` must be used for security."
  },
  {
    id: "sec8", topic: "Security", difficulty: "expert",
    question: "In OAuth 2.0, what is the Authorization Code flow primarily used for?",
    options: ["To exchange a username and password directly for a token", "To securely obtain an access token via a back-channel request, preventing the token from being exposed in the browser", "To refresh expired cookies", "To encrypt user data"],
    correctAnswer: 1,
    explanation: "The client gets an auth code via the browser URL, then the backend server exchanges that code for a token directly with the auth server, keeping the token out of the frontend."
  },
  {
    id: "sec9", topic: "Security", difficulty: "medium",
    question: "What is a Rainbow Table attack?",
    options: ["A DDoS attack using light pulses", "An attack that uses a massive precomputed dictionary of plaintext passwords and their corresponding hashes to quickly crack leaked databases", "Injecting colored pixels to crash a UI", "A social engineering tactic"],
    correctAnswer: 1,
    explanation: "Rainbow tables trade storage space for speed by precomputing hash chains. Salting passwords defeats rainbow tables because it requires a unique table for every possible salt."
  },
  {
    id: "sec10", topic: "Security", difficulty: "hard",
    question: "What does the 'HttpOnly' flag on a cookie do?",
    options: ["Forces the cookie to only be sent over HTTP, not HTTPS", "Prevents the cookie from being accessed by client-side JavaScript (e.g. document.cookie)", "Encrypts the cookie value", "Makes the cookie permanent"],
    correctAnswer: 1,
    explanation: "Setting HttpOnly mitigates the risk of XSS attackers stealing session cookies via scripts."
  },

  // JS Weirdness & React (66-80)
  {
    id: "js1", topic: "JS Weirdness", difficulty: "chaos",
    question: "What is the output of `typeof null` in JavaScript?",
    options: ["'null'", "'undefined'", "'object'", "'number'"],
    correctAnswer: 2,
    explanation: "This is a historic bug in JavaScript. The type tag for objects in early JS was 0, and null was represented as the NULL pointer (0x00), so typeof evaluated it as 'object'."
  },
  {
    id: "react2", topic: "React", difficulty: "hard",
    question: "What causes a 'Stale Closure' in React Hooks?",
    options: ["Memory leaks in the browser", "A callback function capturing state/props from an older render because its dependency array didn't include them", "Using Redux with Context API", "Forgetting to import React"],
    correctAnswer: 1,
    explanation: "If a function (like inside useEffect or useCallback) uses a state variable but omits it from the dependency array, it 'closes over' the variable's value from the render when it was created."
  },
  {
    id: "js3", topic: "JS Weirdness", difficulty: "chaos",
    question: "What does `0.1 + 0.2 === 0.3` evaluate to?",
    options: ["true", "false", "undefined", "NaN"],
    correctAnswer: 1,
    explanation: "Because JS uses IEEE 754 double-precision floating-point numbers, 0.1 + 0.2 results in 0.30000000000000004. So it evaluates to false."
  },
  {
    id: "js4", topic: "JS Weirdness", difficulty: "expert",
    question: "What does the following print: `console.log(1 + '2' + '2'); console.log(1 + +'2' + '2');`",
    options: ["'122', '32'", "'14', '14'", "5, 5", "'122', '122'"],
    correctAnswer: 0,
    explanation: "First: 1 + '2' is '12', then '12' + '2' is '122'. Second: the unary plus `+'2'` converts it to the number 2. So 1 + 2 is 3, then 3 + '2' is '32'."
  },
  {
    id: "js5", topic: "JS Weirdness", difficulty: "hard",
    question: "How does the JavaScript Event Loop handle Promises compared to setTimeout?",
    options: ["setTimeout executes before Promises", "Promises go to the Microtask Queue and execute BEFORE tasks (like setTimeout) in the Macrotask Queue", "They are handled exactly the same way", "Promises execute in a separate Web Worker"],
    correctAnswer: 1,
    explanation: "Promise callbacks (.then/.catch) are pushed to the Microtask queue. The Event Loop completely drains the Microtask queue immediately after the current task, before moving to the next Macrotask (setTimeout)."
  },
  {
    id: "react1", topic: "React", difficulty: "medium",
    question: "Why should you not mutate state directly in React (e.g., `state.count = 1`)?",
    options: ["It crashes the browser", "It violates TypeScript rules", "React relies on object reference equality to detect changes and trigger re-renders; mutating doesn't change the reference", "It causes infinite loops"],
    correctAnswer: 2,
    explanation: "React's reconciliation engine uses strict equality (`oldState === newState`). If you mutate the existing object, the reference remains the same, and React assumes nothing changed, bypassing the re-render."
  },
  {
    id: "js6", topic: "JS Weirdness", difficulty: "chaos",
    question: "What is the result of `[] + []`?",
    options: ["[]", "'' (empty string)", "undefined", "NaN"],
    correctAnswer: 1,
    explanation: "When adding objects, JS attempts to convert them to primitives. Arrays coerce to strings using their elements joined by commas. Two empty arrays become two empty strings, which concatenate to ''."
  },
  {
    id: "react3", topic: "React", difficulty: "expert",
    question: "What happens if two components use the same React Context, and the Context provider value is updated to a new object literal `{ data: 1 }` on every parent render?",
    options: ["Nothing, Context is smart enough to deep compare", "Both components re-render on every parent render because the object reference changes, causing unnecessary renders", "Only the component consuming 'data' re-renders", "React throws an Error"],
    correctAnswer: 1,
    explanation: "Context uses reference equality. Passing a new object literal `<Provider value={{ data: 1 }}>` creates a new reference every render, forcing all consumers of that context to re-render. You should wrap the value in `useMemo`."
  },
  {
    id: "js7", topic: "JS Weirdness", difficulty: "hard",
    question: "In non-strict mode, if you declare a variable inside a function without the `var`, `let`, or `const` keyword (e.g., `x = 10`), what happens?",
    options: ["Syntax error", "It is scoped to the function", "It becomes a global variable (property of the global object)", "It is ignored"],
    correctAnswer: 2,
    explanation: "Assigning to an undeclared variable in non-strict mode implicitly creates a global variable, leading to massive scoping bugs and memory leaks. Strict mode throws an error."
  },
  {
    id: "react4", topic: "React", difficulty: "medium",
    question: "What is the primary purpose of React.memo()?",
    options: ["To memoize heavy calculations", "To memoize the DOM elements", "To prevent a functional component from re-rendering if its props haven't changed", "To cache API responses"],
    correctAnswer: 2,
    explanation: "React.memo() is a higher-order component that wraps a component to prevent re-renders when the parent re-renders, as long as the component's incoming props remain exactly the same."
  },
  {
    id: "js8", topic: "JS Weirdness", difficulty: "chaos",
    question: "What does `Math.max()` evaluate to with no arguments?",
    options: ["0", "Infinity", "-Infinity", "NaN"],
    correctAnswer: 2,
    explanation: "Math.max() starts comparing from the lowest possible value. With no arguments provided to compare, it simply returns its starting baseline: -Infinity."
  },
  {
    id: "react5", topic: "React", difficulty: "expert",
    question: "In React 18 Concurrent Mode, what does `startTransition` do?",
    options: ["Starts a CSS transition", "Tells React that a state update is non-urgent, allowing it to be interrupted by urgent updates like typing", "Pre-loads a page route", "Forces a synchronous layout calculation"],
    correctAnswer: 1,
    explanation: "startTransition allows you to mark a state update (like filtering a huge list) as a 'transition'. React can pause this rendering to process higher-priority inputs (like updating an input field), keeping the UI responsive."
  },
  {
    id: "js9", topic: "JS Weirdness", difficulty: "hard",
    question: "What is a JavaScript Closure?",
    options: ["A function that self-executes", "A memory leak", "A function bundled together with references to its surrounding lexical environment, giving it access to an outer function's scope", "Closing a database connection"],
    correctAnswer: 2,
    explanation: "A closure is created when a function is defined within another function. The inner function remembers and has access to the variables of the outer function, even after the outer function has returned."
  },
  {
    id: "js10", topic: "JS Weirdness", difficulty: "chaos",
    question: "What does `parseInt('08')` return in old JavaScript engines (ECMAScript 3)?",
    options: ["8", "0", "NaN", "SyntaxError"],
    correctAnswer: 1,
    explanation: "In old JS engines, parseInt treated strings starting with '0' as Octal (base-8). Since '8' is not a valid octal digit, it parsed until '0' and returned 0. Modern JS (ES5+) defaults to base-10."
  },
  {
    id: "react6", topic: "React", difficulty: "hard",
    question: "Why is using an array index as a React key (`key={index}`) generally a bad idea?",
    options: ["Keys must be strings", "It slows down rendering", "If the array order changes (inserts/deletes), React's reconciliation might mix up component states and DOM nodes", "React will throw a runtime error"],
    correctAnswer: 2,
    explanation: "React uses keys to identify DOM nodes. If items are reordered, an item previously at index 0 might move to index 1. If keys are indexes, React thinks the item changed, destroying local state and causing subtle UI bugs."
  },

  // AI Engineering, Backend, & Next.js (81-100)
  {
    id: "ai1", topic: "AI Engineering", difficulty: "medium",
    question: "In Large Language Models, what is 'Context Window'?",
    options: ["The UI interface where you type", "The maximum number of tokens (words/subwords) the model can process and remember in a single interaction", "The database where embeddings are stored", "The training dataset size"],
    correctAnswer: 1,
    explanation: "The context window limits how much text the LLM can consider at once. If a conversation exceeds this window, older tokens are truncated and forgotten."
  },
  {
    id: "ai2", topic: "AI Engineering", difficulty: "hard",
    question: "What is RAG (Retrieval-Augmented Generation)?",
    options: ["A technique to make models smaller", "A prompt injection attack", "An architecture that retrieves relevant documents from an external database and feeds them into the LLM's prompt to ground its answers", "A framework for building UI"],
    correctAnswer: 2,
    explanation: "RAG solves hallucination and outdated knowledge by fetching actual proprietary/live documents (often via vector search) and providing them to the LLM to generate answers from."
  },
  {
    id: "ai3", topic: "AI Engineering", difficulty: "expert",
    question: "What is the primary function of a Vector Database?",
    options: ["Storing JSON documents efficiently", "Storing high-dimensional numerical arrays (embeddings) and performing highly optimized similarity searches (like Cosine Similarity)", "Managing graph relationships between users", "Executing MapReduce jobs"],
    correctAnswer: 1,
    explanation: "Vector databases (like Pinecone, Milvus, pgvector) are optimized to index and perform Nearest Neighbor searches across millions of dense embedding vectors."
  },
  {
    id: "ai4", topic: "AI Engineering", difficulty: "hard",
    question: "In model deployment, what does 'Quantization' achieve?",
    options: ["Increases the context window size", "Reduces the precision of the model's weights (e.g., from FP32 to INT8), drastically reducing memory usage and speeding up inference with minimal accuracy loss", "Encrypts the model weights", "Connects the model to the internet"],
    correctAnswer: 1,
    explanation: "Quantization shrinks massive LLMs so they can fit on consumer GPUs (or even run locally on CPUs) by using fewer bits to represent numbers."
  },
  {
    id: "nxt1", topic: "Next.js", difficulty: "medium",
    question: "In Next.js App Router, what differentiates Server Components from Client Components?",
    options: ["Server Components run only on the server, have no access to browser APIs, send zero JS bundle to the client, and can use async/await directly", "Client Components run only on the server", "Server Components are just for APIs", "There is no difference"],
    correctAnswer: 0,
    explanation: "React Server Components (RSC) fetch data on the backend, reduce frontend bundle sizes, and securely access databases directly, whereas Client Components handle interactivity."
  },
  {
    id: "nxt2", topic: "Next.js", difficulty: "hard",
    question: "What is ISR (Incremental Static Regeneration)?",
    options: ["Rebuilding the entire site on every push", "Generating static pages at build time, but automatically re-generating specific pages in the background after a specified timeout when traffic hits them", "Rendering pages exclusively on the client", "Caching API routes"],
    correctAnswer: 1,
    explanation: "ISR blends the speed of Static Site Generation (SSG) with the flexibility of Server-Side Rendering (SSR). It serves a stale static page instantly, then rebuilds a fresh one in the background for the next user."
  },
  {
    id: "be1", topic: "Backend", difficulty: "chaos",
    question: "When implementing Rate Limiting, what is the 'Token Bucket' algorithm?",
    options: ["Storing tokens in a database", "A method where tokens are added to a bucket at a fixed rate, and every request costs a token. It allows bursts of traffic while enforcing an average rate.", "Encrypting session tokens", "A queueing system for background jobs"],
    correctAnswer: 1,
    explanation: "Token Bucket is highly efficient. If the bucket is full, new tokens are discarded. If it's empty, requests are rejected. This perfectly handles sudden API traffic bursts."
  },
  {
    id: "ai5", topic: "AI Engineering", difficulty: "medium",
    question: "What is an Embedding in machine learning?",
    options: ["A hardware chip", "A dense vector representation of data (like text or images) in a continuous multidimensional space, where similar concepts are mathematically close together", "A prompt template", "A fine-tuning methodology"],
    correctAnswer: 1,
    explanation: "Embeddings capture semantic meaning. For example, the vector for 'King' - 'Man' + 'Woman' results in a vector incredibly close to 'Queen'."
  },
  {
    id: "be2", topic: "Backend", difficulty: "expert",
    question: "What is a Bloom Filter?",
    options: ["A CSS styling effect", "A probabilistic data structure that can tell you if an element is 'definitely not in the set' or 'possibly in the set', using very little memory", "A SQL indexing algorithm", "A spam filter for emails"],
    correctAnswer: 1,
    explanation: "Bloom filters are used in systems like databases and caches. They are space-efficient and never return false negatives, but may return false positives. They avoid unnecessary disk lookups."
  },
  {
    id: "nxt3", topic: "Next.js", difficulty: "chaos",
    question: "In Next.js, what is the hydration error 'Text content did not match' usually caused by?",
    options: ["Bad CSS", "The HTML rendered on the server differs from what the initial React render expects on the client (e.g., relying on `window.innerWidth` during initial render)", "Using old React versions", "A typo in the code"],
    correctAnswer: 1,
    explanation: "Hydration expects the server HTML and the first client HTML to match exactly. If a component renders differently based on browser-only objects (like `window`), it triggers a mismatch error."
  },
  {
    id: "be3", topic: "Backend", difficulty: "hard",
    question: "In GraphQL, what is the 'N+1 problem'?",
    options: ["An issue where mutations execute twice", "A schema validation error", "An inefficiency where fetching a list of items and their relationships results in one query for the list, plus N separate queries for the relationships", "A rate limiting bypass"],
    correctAnswer: 2,
    explanation: "Because resolvers in GraphQL are executed independently, resolving nested relations can trigger massive query spam. It's typically solved using tools like DataLoader to batch requests."
  },
  {
    id: "ai6", topic: "AI Engineering", difficulty: "expert",
    question: "What is LoRA (Low-Rank Adaptation) used for?",
    options: ["Compressing images", "Fine-tuning large language models efficiently by freezing original weights and injecting trainable low-rank decomposition matrices, drastically reducing memory requirements", "Increasing internet bandwidth", "A new architecture replacing Transformers"],
    correctAnswer: 1,
    explanation: "Instead of retraining a 70B parameter model, LoRA allows fine-tuning with only a few million parameters, making it possible to fine-tune massive models on a single consumer GPU."
  },
  {
    id: "be4", topic: "Backend", difficulty: "medium",
    question: "What is the primary difference between WebSockets and Server-Sent Events (SSE)?",
    options: ["SSE requires UDP", "WebSockets are full-duplex (bidirectional), while SSE is strictly unidirectional (server to client)", "WebSockets are slower", "SSE cannot send text data"],
    correctAnswer: 1,
    explanation: "SSE is essentially an HTTP stream designed to push updates from server to client. WebSockets upgrade the connection to allow real-time communication in both directions."
  },
  {
    id: "nxt4", topic: "Next.js", difficulty: "expert",
    question: "What happens when you define `export const dynamic = 'force-dynamic'` in a Next.js App Router page?",
    options: ["The page is fully static", "It forces the page to be server-rendered at request time, opting out of the static data cache completely", "It enables dynamic CSS imports", "It forces the page to be a Client Component"],
    correctAnswer: 1,
    explanation: "By default, Next.js tries to statically cache pages. 'force-dynamic' ensures the page behaves like traditional SSR, running on the server for every single user request."
  },
  {
    id: "be5", topic: "Backend", difficulty: "chaos",
    question: "Why is it dangerous to parse uncontrolled JSON payloads directly into an object without schema validation in a Node.js backend?",
    options: ["It slows down the server", "It uses too much memory", "It opens the system to Prototype Pollution attacks, where attackers overwrite base Object properties", "It breaks TypeScript"],
    correctAnswer: 2,
    explanation: "If an attacker sends a payload with `__proto__` keys, poorly written merging/parsing logic can mutate the global Object prototype, potentially allowing Remote Code Execution (RCE) or altering app logic."
  },
  {
    id: "ai7", topic: "AI Engineering", difficulty: "hard",
    question: "What does 'Temperature' control in an LLM API call?",
    options: ["The server cooling fan speed", "The maximum length of the output", "The randomness of the token probabilities. Lower temperature makes the model more deterministic and focused, higher makes it more creative.", "The latency of the response"],
    correctAnswer: 2,
    explanation: "Temperature scales the logits before the softmax function. A temperature of 0 always picks the most likely token (greedy decoding). High temperatures flatten the distribution, allowing less likely tokens to be chosen."
  },
  {
    id: "be6", topic: "Backend", difficulty: "expert",
    question: "What is a 'Tombstone' in the context of distributed databases or log-compacted queues (like Kafka)?",
    options: ["A dead server node", "A deleted network packet", "A special marker record written to indicate that a key has been deleted, ensuring the deletion propagates properly", "An archived database table"],
    correctAnswer: 2,
    explanation: "Since these systems append data continuously and replicate it, you can't simply delete a row. You write a tombstone record (a key with a null value) that eventually tells all replicas to purge the data during compaction."
  },
  {
    id: "nxt5", topic: "Next.js", difficulty: "medium",
    question: "What is the purpose of the `next/image` component?",
    options: ["To edit photos directly in the browser", "To automatically optimize image sizes, formats (like WebP), and implement lazy loading to improve Core Web Vitals", "To upload images to AWS S3", "To generate AI images"],
    correctAnswer: 1,
    explanation: "The Image component prevents Cumulative Layout Shift (CLS) and heavily optimizes images on the server edge before serving them to the client."
  },
  {
    id: "be7", topic: "Backend", difficulty: "hard",
    question: "When should you use a UUID instead of a sequentially auto-incrementing integer for primary keys?",
    options: ["When you need fast B-Tree indexing", "When you want shorter URLs", "In distributed systems to allow independent generation without collision, or to obscure the number of records from users", "Never, integers are always better"],
    correctAnswer: 2,
    explanation: "Auto-incrementing IDs require a central authority (the DB) to generate, creating a bottleneck. UUIDs can be generated anywhere. They also prevent an attacker from guessing `user/1234` to scrape data."
  },
  {
    id: "os11", topic: "System Design", difficulty: "expert",
    question: "What is 'Backpressure' in stream processing?",
    options: ["A firewall dropping packets", "A mechanism where a slow consumer signals a fast producer to slow down, preventing the consumer's memory from overflowing", "Compressing database backups", "Increasing CPU clock speed"],
    correctAnswer: 1,
    explanation: "Without backpressure, a producer sending data faster than a consumer can process it will cause the consumer's buffer to fill up and eventually crash with an Out of Memory error."
  },


  { id: "e1", topic: "Security", difficulty: "chaos", question: "What is CORS?", options: ["Cross-Origin Resource Sharing", "Centralized Object Rendering System", "Computed Output Routing Standard", "Core Operating Routine System"], correctAnswer: 0, explanation: "CORS is a browser security feature that restricts cross-origin HTTP requests." },
  { id: "e2", topic: "DevOps", difficulty: "expert", question: "In Kubernetes, what is a DaemonSet?", options: ["A pod that runs on every node in the cluster", "A background cron job", "A database replica", "An ingress controller"], correctAnswer: 0, explanation: "DaemonSets ensure that all (or some) Nodes run a copy of a Pod, often used for log collection or monitoring daemons." },
  { id: "e3", topic: "Backend", difficulty: "hard", question: "What does a reverse proxy do?", options: ["Intercepts outgoing requests to the internet", "Sits in front of backend servers and forwards client requests to them", "Encrypts client hard drives", "Caches DNS lookups locally"], correctAnswer: 1, explanation: "A reverse proxy (like Nginx) takes incoming requests and routes them to the appropriate internal server, often handling load balancing and SSL." },
  { id: "e4", topic: "DBMS", difficulty: "chaos", question: "What is an SQL Injection?", options: ["Adding extra memory to the database server", "Inserting malicious SQL commands via user input fields to manipulate the database", "Caching query results", "Using NO-SQL databases instead of SQL"], correctAnswer: 1, explanation: "SQL Injection allows attackers to interfere with the queries the application makes to its database." },
  { id: "e5", topic: "Architecture", difficulty: "medium", question: "What is horizontal scaling?", options: ["Upgrading a server's CPU and RAM", "Adding more servers/nodes to a cluster to share the load", "Optimizing database queries", "Increasing network bandwidth"], correctAnswer: 1, explanation: "Horizontal scaling (scaling out) involves adding more machines to your pool of resources." },
  { id: "e6", topic: "Architecture", difficulty: "expert", question: "What is vertical scaling?", options: ["Adding more servers", "Upgrading the hardware (CPU, RAM) of an existing single server", "Adding more IP addresses", "Compressing HTTP responses"], correctAnswer: 1, explanation: "Vertical scaling (scaling up) means adding more power to an existing machine." },
  { id: "e7", topic: "Computer Networks", difficulty: "hard", question: "What is DNS?", options: ["Dynamic Network System", "Domain Name System", "Data Nullification Standard", "Digital Native Security"], correctAnswer: 1, explanation: "DNS translates human-readable domain names (like www.google.com) to machine-readable IP addresses." },
  { id: "e8", topic: "Computer Networks", difficulty: "chaos", question: "What is a MAC address?", options: ["An Apple computer's IP", "A unique physical identifier assigned to a network interface controller", "A wireless protocol", "A type of routing table"], correctAnswer: 1, explanation: "Media Access Control addresses are hardware identifiers assigned to network adapters." },
  { id: "e9", topic: "Linux", difficulty: "medium", question: "What does 'grep' do?", options: ["Deletes files", "Searches text using regular expressions", "Downloads files from the internet", "Changes file permissions"], correctAnswer: 1, explanation: "grep is a command-line utility for searching plain-text data sets for lines that match a regular expression." },
  { id: "e10", topic: "Linux", difficulty: "expert", question: "What is the purpose of 'sudo'?", options: ["To run programs as another user, typically the root user", "To exit the terminal", "To compile source code", "To view system logs"], correctAnswer: 0, explanation: "sudo allows a permitted user to execute a command as the superuser or another user." },
  { id: "e11", topic: "DevOps", difficulty: "chaos", question: "What is Docker?", options: ["A virtual machine hypervisor", "A platform for developing, shipping, and running applications in isolated containers", "A version control system", "A continuous integration server"], correctAnswer: 1, explanation: "Docker uses OS-level virtualization to deliver software in packages called containers." },
  { id: "e12", topic: "AI Engineering", difficulty: "hard", question: "What is a Neural Network?", options: ["A network of brain cells in biology", "A computing system inspired by the biological neural networks that constitute animal brains", "A type of fiber optic cable", "A blockchain consensus algorithm"], correctAnswer: 1, explanation: "Artificial neural networks are computing systems vaguely inspired by the biological neural networks of animal brains." },
  { id: "e13", topic: "Backend", difficulty: "medium", question: "What is a REST API?", options: ["An API that sleeps to save energy", "An architectural style for distributed hypermedia systems", "A binary communication protocol", "A database query language"], correctAnswer: 1, explanation: "Representational State Transfer (REST) is a software architectural style that defines a set of constraints to be used for creating Web services." },
  { id: "e14", topic: "Next.js", difficulty: "chaos", question: "What is a hook in React?", options: ["A fishing tool", "A special function that lets you 'hook into' React state and lifecycle features from functional components", "A way to intercept HTTP requests", "A CSS styling preprocessor"], correctAnswer: 1, explanation: "Hooks allow you to use state and other React features without writing a class." },
  { id: "e15", topic: "JS Weirdness", difficulty: "expert", question: "What does `==` do in JavaScript compared to `===`?", options: ["`==` compares value and type, `===` compares only value", "`==` performs type coercion before comparison, `===` checks strict equality without type coercion", "They are exactly the same", "`===` is used only for strings"], correctAnswer: 1, explanation: "The loose equality operator == attempts to convert and compare operands of different types, while the strict equality operator === requires operands to be of the same type." },
  { id: "e16", topic: "DBMS", difficulty: "medium", question: "What is a Primary Key?", options: ["The first column in a table", "A specific choice of a minimal set of attributes that uniquely specify a tuple in a relation", "A password for the database", "A foreign key in another table"], correctAnswer: 1, explanation: "A primary key is a unique identifier for a database record." },
  { id: "e17", topic: "Security", difficulty: "hard", question: "What is a DDoS attack?", options: ["Direct Data Operation System", "Distributed Denial-of-Service attack, where multiple compromised systems are used to target a single system, causing a Denial of Service", "A type of SQL injection", "A phishing technique"], correctAnswer: 1, explanation: "A DDoS attack aims to overwhelm a target server, service, or network with a flood of Internet traffic." },
  { id: "e18", topic: "Architecture", difficulty: "chaos", question: "What is Microservices Architecture?", options: ["An architectural style that structures an application as a collection of small autonomous services", "A single, massive codebase", "Using tiny computers to run servers", "A frontend framework"], correctAnswer: 0, explanation: "Microservices are a software development technique that arranges an application as a collection of loosely coupled services." },
  { id: "e19", topic: "Computer Networks", difficulty: "expert", question: "What is latency?", options: ["The amount of data transferred per second", "The time it takes for a data packet to travel from source to destination", "The strength of a WiFi signal", "The number of dropped packets"], correctAnswer: 1, explanation: "Latency is the delay before a transfer of data begins following an instruction for its transfer." },
  { id: "e20", topic: "Linux", difficulty: "hard", question: "What does the 'tar' command do?", options: ["Paints the screen black", "An archiving utility used to combine multiple files into a single archive file", "Downloads packages", "Monitors CPU usage"], correctAnswer: 1, explanation: "tar (tape archive) is used to create, maintain, modify, and extract files that are archived in the tar format." },
  // --- DevOps & Infrastructure Deep Dives ---
  {
    id: "do-1",
    question: "In Kubernetes, what is the primary difference between a Deployment and a StatefulSet?",
    options: [
      "Deployments are for microservices; StatefulSets are for monoliths.",
      "StatefulSets provide stable, unique network identifiers and persistent storage across rescheduling.",
      "Deployments do not support rolling updates, whereas StatefulSets do.",
      "StatefulSets run on Master nodes, while Deployments run on Worker nodes."
    ],
    correctAnswer: 1,
    topic: "Kubernetes",
    difficulty: "expert",
    explanation: "StatefulSets maintain a sticky identity for each of their Pods. These pods are created from the same spec, but are not interchangeable: each has a persistent identifier that it maintains across any rescheduling."
  },
  {
    id: "do-2",
    question: "When running Docker containers in production, why is it considered a bad practice to use the 'latest' image tag?",
    options: [
      "It severely impacts container startup performance.",
      "It prevents Docker from caching the image layers locally.",
      "It leads to unpredictable deployments because the underlying image can change without the tag changing.",
      "It bypasses the Docker daemon's security scanning tools."
    ],
    correctAnswer: 2,
    topic: "Docker",
    difficulty: "easy",
    explanation: "The 'latest' tag is mutable. If a new image is pushed with 'latest', subsequent container orchestrator pulls will fetch a different image, leading to environments drifting and unpredictable behaviors."
  },
  {
    id: "do-3",
    question: "What is the primary architectural advantage of Caddy over Nginx as a reverse proxy?",
    options: [
      "Caddy is written in C++ for maximum throughput.",
      "Caddy automatically obtains and renews Let's Encrypt TLS certificates by default.",
      "Caddy uses a multi-threaded event loop unlike Nginx's single-threaded model.",
      "Caddy natively executes PHP code without needing PHP-FPM."
    ],
    correctAnswer: 1,
    topic: "Web Servers",
    difficulty: "medium",
    explanation: "Caddy's defining feature is its automatic HTTPS. It automatically provisions and renews certificates via Let's Encrypt or ZeroSSL without manual configuration or external cron jobs."
  },
  {
    id: "do-4",
    question: "In a Serverless architecture (like AWS Lambda), what is a 'cold start'?",
    options: [
      "The time taken to provision database connections when the cluster scales up.",
      "The latency introduced when the cloud provider provisions a new container environment to run a function that hasn't been invoked recently.",
      "The initial delay caused by the API Gateway compiling the routing tables.",
      "A security mechanism that pauses execution until an IAM role is fully propagated."
    ],
    correctAnswer: 1,
    topic: "Serverless",
    difficulty: "medium",
    explanation: "A cold start happens when a serverless platform needs to initialize a new instance (container) of your function because no idle instances are available, resulting in higher latency for that specific invocation."
  },
  {
    id: "do-5",
    question: "Which of the following Nginx directives is used to implement a reverse proxy passing requests to an upstream application server?",
    options: [
      "proxy_forward",
      "upstream_pass",
      "proxy_pass",
      "server_forward"
    ],
    correctAnswer: 2,
    topic: "Nginx",
    difficulty: "easy",
    explanation: "The 'proxy_pass' directive is used in Nginx to forward HTTP requests to a proxied server or an upstream group."
  },
  {
    id: "do-6",
    question: "How does Docker's layer caching mechanism optimize the image build process?",
    options: [
      "It compresses the entire image into a single tarball before storing it.",
      "It skips building instructions if the instruction and parent layer haven't changed since the last build.",
      "It caches the network responses of 'apt-get install' commands globally.",
      "It stores the image layers in RAM rather than on disk."
    ],
    correctAnswer: 1,
    topic: "Docker",
    difficulty: "medium",
    explanation: "Docker caches each step (layer) of a Dockerfile. If an instruction and its preceding layers are unchanged, Docker reuses the cached layer instead of rebuilding it, vastly speeding up builds."
  },
  {
    id: "do-7",
    question: "In Kubernetes, what is the role of the Ingress controller?",
    options: [
      "To manage internal East-West traffic between Pods using a service mesh.",
      "To provision and manage persistent volumes for StatefulSets.",
      "To provide an HTTP/HTTPS routing layer that exposes services to external traffic outside the cluster.",
      "To enforce network policies that block unauthorized outbound traffic."
    ],
    correctAnswer: 2,
    topic: "Kubernetes",
    difficulty: "medium",
    explanation: "An Ingress controller evaluates Ingress rules and routes external HTTP/HTTPS traffic to the appropriate internal Services within the Kubernetes cluster."
  },
  {
    id: "do-8",
    question: "What is a common strategy to mitigate 'cold starts' in Serverless environments?",
    options: [
      "Writing the function in a JIT-compiled language like Java instead of Go.",
      "Increasing the function's memory allocation or utilizing provisioned concurrency.",
      "Disabling VPC access for the function.",
      "Setting the function timeout to the maximum allowed limit."
    ],
    correctAnswer: 1,
    topic: "Serverless",
    difficulty: "hard",
    explanation: "Increasing memory gives the container proportionally more CPU, which speeds up initialization. Provisioned concurrency explicitly keeps a specified number of execution environments warm."
  },
  {
    id: "do-9",
    question: "When configuring Nginx to serve static files, what is the most efficient directive to use?",
    options: [
      "proxy_pass",
      "fastcgi_pass",
      "try_files",
      "rewrite"
    ],
    correctAnswer: 2,
    topic: "Nginx",
    difficulty: "medium",
    explanation: "The 'try_files' directive checks for the existence of files in order, and returns the first one found. It is highly optimized for serving static assets."
  },
  {
    id: "do-10",
    question: "In a CI/CD pipeline, what is the primary purpose of a 'Blue-Green' deployment strategy?",
    options: [
      "To route traffic based on the geographic location of the user.",
      "To gradually shift traffic in 10% increments to a new version.",
      "To switch traffic entirely from an older version (blue) to a new version (green) with zero downtime, allowing instant rollback.",
      "To test multiple UI variations simultaneously to see which converts better."
    ],
    correctAnswer: 2,
    topic: "DevOps",
    difficulty: "medium",
    explanation: "Blue-Green deployment provisions an identical parallel environment. Traffic is flipped at the load balancer level, enabling zero-downtime releases and immediate rollbacks if the new (green) environment fails."
  },
  {
    id: "do-11",
    question: "What is a Kubernetes 'DaemonSet' used for?",
    options: [
      "To run ephemeral batch jobs that terminate upon completion.",
      "To ensure that a copy of a specific Pod runs on all (or some) Nodes in the cluster.",
      "To manage stateful applications like database replicas.",
      "To scale the number of pods automatically based on CPU utilization."
    ],
    correctAnswer: 1,
    topic: "Kubernetes",
    difficulty: "medium",
    explanation: "A DaemonSet ensures that all eligible nodes run a copy of a pod. It is typically used for cluster-wide background tasks like log collection (Fluentd) or node monitoring (Prometheus Node Exporter)."
  },
  {
    id: "do-12",
    question: "When building a Docker image for a Node.js application, why is it recommended to copy 'package.json' and run 'npm install' BEFORE copying the rest of the source code?",
    options: [
      "To prevent Node.js from running in cluster mode.",
      "To leverage Docker's layer cache so dependencies aren't re-downloaded unless package.json changes.",
      "To ensure the node_modules folder is encrypted.",
      "It is a strict requirement of the NPM CLI."
    ],
    correctAnswer: 1,
    topic: "Docker",
    difficulty: "medium",
    explanation: "Docker caches layers sequentially. If you copy the entire source code first, any change to any file invalidates the cache for all subsequent steps, forcing a slow 'npm install' every build."
  },
  {
    id: "do-13",
    question: "What is the primary function of a reverse proxy in a modern web architecture?",
    options: [
      "To hide the IP address of the client making the request from the server.",
      "To sit in front of backend servers, forwarding client requests to them while providing load balancing, caching, and SSL termination.",
      "To intercept outbound traffic from an internal network for deep packet inspection.",
      "To translate IPv4 addresses to IPv6 addresses."
    ],
    correctAnswer: 1,
    topic: "Architecture",
    difficulty: "easy",
    explanation: "A reverse proxy (like Nginx or Caddy) accepts incoming requests from clients and routes them to upstream application servers, abstracting the backend topology and providing features like SSL termination."
  },
  {
    id: "do-14",
    question: "In Kubernetes, how does a Service locate the specific Pods it needs to route traffic to?",
    options: [
      "By looking up the Pod IPs in a static configuration file.",
      "By using Label Selectors to match labels attached to the Pods.",
      "By dynamically querying the container runtime socket.",
      "By routing to all Pods running within the same Namespace."
    ],
    correctAnswer: 1,
    topic: "Kubernetes",
    difficulty: "medium",
    explanation: "Services use Label Selectors to group Pods dynamically. Any Pod whose labels match the Service's selector is automatically added to the Service's endpoints."
  },
  {
    id: "do-15",
    question: "Which pattern is commonly used in Serverless applications to handle sudden massive spikes in incoming events without overwhelming downstream relational databases?",
    options: [
      "Circuit Breaker Pattern",
      "Fan-out / Fan-in Pattern",
      "Queue-Based Load Leveling (e.g., SQS before Lambda)",
      "Strangler Fig Pattern"
    ],
    correctAnswer: 2,
    topic: "Serverless",
    difficulty: "hard",
    explanation: "Placing a queue (like SQS) between the event source and the serverless functions acts as a buffer. It levels the load by allowing functions to pull messages at a controlled rate, preventing DB connection exhaustion."
  },
  {
    id: "do-16",
    question: "What is the main benefit of Alpine Linux-based Docker images?",
    options: [
      "They include a full GUI environment for debugging.",
      "They are highly optimized for Python applications natively.",
      "They provide a significantly smaller attack surface and image size (often under 5MB).",
      "They use glibc instead of musl libc for better compatibility."
    ],
    correctAnswer: 2,
    topic: "Docker",
    difficulty: "easy",
    explanation: "Alpine is a minimalist Linux distribution. Its tiny footprint results in faster image pulls, smaller storage costs, and a reduced attack surface. (Note: It uses musl libc, not glibc, which can occasionally cause compatibility issues)."
  },
  {
    id: "do-17",
    question: "In Nginx, what happens if multiple 'server' blocks match a request's Host header?",
    options: [
      "Nginx rejects the request with a 500 error.",
      "Nginx serves the request using the first matching server block found in the configuration file.",
      "Nginx load balances the request between the matching blocks.",
      "Nginx uses the block with the most specific (longest) server_name match."
    ],
    correctAnswer: 3,
    topic: "Nginx",
    difficulty: "hard",
    explanation: "Nginx has a specific priority order for resolving the Host header. It first looks for exact name matches, then longest wildcard matches starting with an asterisk, then longest wildcard matches ending with an asterisk, and finally regular expressions."
  },
  {
    id: "do-18",
    question: "What does the concept of 'Infrastructure as Code' (IaC) primarily solve?",
    options: [
      "It eliminates the need for containerization tools like Docker.",
      "It allows developers to write cloud infrastructure provisioning and configuration in machine-readable definition files, enabling version control and reproducibility.",
      "It automatically converts legacy monolithic codebases into microservices.",
      "It allows frontend code to be executed directly on load balancers."
    ],
    correctAnswer: 1,
    topic: "DevOps",
    difficulty: "easy",
    explanation: "IaC (e.g., Terraform, CloudFormation) replaces manual infrastructure setup with declarative code. This ensures environments are consistent, reproducible, and version-controllable."
  },
  {
    id: "do-19",
    question: "In Kubernetes, if a Node crashes, what component is responsible for noticing the missing Pods and scheduling replacements on healthy Nodes?",
    options: [
      "kube-proxy",
      "etcd",
      "kube-controller-manager",
      "kubelet"
    ],
    correctAnswer: 2,
    topic: "Kubernetes",
    difficulty: "expert",
    explanation: "The kube-controller-manager runs control loops (like the ReplicaSet controller or Node controller) that watch the state of the cluster through the API server and make changes to move the current state towards the desired state."
  },
  {
    id: "do-20",
    question: "Which of the following scenarios is a poor fit for a Serverless architecture?",
    options: [
      "A web API with highly unpredictable, bursty traffic.",
      "A cron job that runs for 2 minutes every night.",
      "A WebSocket server requiring long-lived, persistent bidirectional connections.",
      "An event-driven pipeline processing image uploads."
    ],
    correctAnswer: 2,
    topic: "Serverless",
    difficulty: "medium",
    explanation: "Serverless functions (like AWS Lambda) are ephemeral and typically have strict execution time limits. They are fundamentally stateless and short-lived, making them a poor fit for persistent, long-lived WebSocket connections (though services like API Gateway can abstract this)."
  },
  // --- AWS, Terraform & Advanced Systems ---
  { id: "aws-1", topic: "AWS", difficulty: "expert", question: "In AWS DynamoDB, what is a primary consequence of a 'hot partition'?", options: ["It triggers an automatic scale-up of the entire table's read/write capacity.", "It causes requests to exceed provisioned throughput for that specific partition, leading to throttled requests.", "It permanently corrupts the data stored in that partition.", "It forces the partition to split into two smaller partitions, causing a brief downtime."], correctAnswer: 1, explanation: "DynamoDB distributes provisioned capacity evenly across all partitions. If one partition receives disproportionately high traffic (a hot partition), it can easily exceed its allocated share and throttle requests, even if the table's overall capacity is underutilized." },
  { id: "aws-2", topic: "AWS", difficulty: "hard", question: "What is the primary difference between AWS SQS Standard and SQS FIFO queues?", options: ["Standard queues provide exactly-once processing, FIFO provides at-least-once.", "FIFO queues guarantee order and exactly-once processing, while Standard queues offer best-effort ordering and at-least-once delivery.", "FIFO queues have unlimited throughput, while Standard queues are strictly limited.", "Standard queues encrypt messages at rest, while FIFO queues do not."], correctAnswer: 1, explanation: "SQS FIFO strictly preserves the exact order in which messages are sent and guarantees that each message is processed exactly once, at the cost of lower throughput compared to Standard queues." },
  { id: "aws-3", topic: "AWS", difficulty: "medium", question: "When securing a VPC in AWS, how do Security Groups differ from Network ACLs (NACLs)?", options: ["Security Groups operate at the subnet level, NACLs operate at the instance level.", "Security Groups are stateless, NACLs are stateful.", "Security Groups evaluate all rules before deciding, NACLs evaluate rules in number order until a match is found.", "Security Groups only allow Deny rules, NACLs only allow Allow rules."], correctAnswer: 2, explanation: "NACLs evaluate rules in numerical order and stop as soon as a match is found. They are also stateless (return traffic must be explicitly allowed), whereas Security Groups are stateful and evaluate all rules." },
  { id: "aws-4", topic: "AWS", difficulty: "hard", question: "What is the purpose of AWS Route 53's 'Alias' record?", options: ["To map a domain name to an IP address outside of AWS.", "To map a root domain (apex) directly to an AWS resource like an ELB or CloudFront distribution, which standard CNAMEs cannot do.", "To alias an IPv4 address to an IPv6 address.", "To cache DNS queries locally within a VPC."], correctAnswer: 1, explanation: "DNS protocol does not allow CNAME records at the zone apex (e.g., example.com). AWS created Alias records as an extension to allow mapping the apex to AWS resources seamlessly." },
  { id: "aws-5", topic: "AWS", difficulty: "medium", question: "Which AWS service is best suited for real-time streaming data ingestion and processing?", options: ["AWS SQS", "AWS Kinesis Data Streams", "AWS Glue", "AWS Batch"], correctAnswer: 1, explanation: "Kinesis Data Streams is designed for real-time data streaming and analytics, capable of capturing gigabytes of data per second from hundreds of thousands of sources." },
  { id: "aws-6", topic: "AWS", difficulty: "expert", question: "In AWS IAM, what is an 'AssumeRole' operation typically used for?", options: ["To permanently change an IAM user's assigned permissions.", "To grant temporary security credentials to a trusted entity, enabling cross-account access or federated logins.", "To bypass MFA requirements for programmatic access.", "To assign a role to an EC2 instance permanently."], correctAnswer: 1, explanation: "AssumeRole returns a set of temporary security credentials that you can use to access AWS resources that you might not normally have access to, often used for cross-account delegation or SAML federation." },
  { id: "aws-7", topic: "AWS", difficulty: "hard", question: "What mechanism does Amazon S3 use to ensure read-after-write consistency for PUTS of new objects?", options: ["It uses a Paxos-based consensus protocol to synchronously replicate to all Availability Zones before returning 200 OK.", "It doesn't; S3 is strictly eventually consistent for all operations.", "S3 provides strong consistency automatically for all read and write operations.", "S3 delays the 200 OK response until the object is indexed by the metadata server."], correctAnswer: 2, explanation: "As of late 2020, Amazon S3 provides strong read-after-write consistency automatically for all GET, PUT, and LIST operations without changes to performance or availability." },
  { id: "aws-8", topic: "AWS", difficulty: "expert", question: "What is a 'VPC Endpoint' in AWS used for?", options: ["To expose an internal VPC service to the public internet.", "To allow private connections between your VPC and supported AWS services without requiring an Internet Gateway or NAT.", "To act as a VPN terminator for corporate networks.", "To peer two VPCs together across different regions."], correctAnswer: 1, explanation: "VPC Endpoints (Gateway or Interface endpoints) enable private routing to AWS services like S3 or DynamoDB entirely within the AWS network, keeping traffic off the public internet." },
  { id: "aws-9", topic: "AWS", difficulty: "hard", question: "How does an Application Load Balancer (ALB) differ from a Network Load Balancer (NLB) in AWS?", options: ["ALB operates at Layer 4 (TCP/UDP), NLB operates at Layer 7 (HTTP/HTTPS).", "ALB operates at Layer 7 and supports path-based routing, while NLB operates at Layer 4 and is optimized for extreme performance/low latency.", "ALB requires Elastic IP addresses, NLB does not.", "ALB can only balance across EC2 instances, NLB balances across Lambda functions."], correctAnswer: 1, explanation: "ALB is built for HTTP/HTTPS traffic (Layer 7) offering advanced routing, while NLB handles TCP/UDP traffic (Layer 4) providing ultra-high performance and static IP support." },
  { id: "aws-10", topic: "AWS", difficulty: "expert", question: "In an AWS Auto Scaling Group, what does a 'Lifecycle Hook' allow you to do?", options: ["Automatically delete instances older than 30 days.", "Pause an instance as it launches or terminates to perform custom actions (like draining connections or downloading logs).", "Schedule automatic scaling based on time of day.", "Prevent an instance from ever being terminated by AWS."], correctAnswer: 1, explanation: "Lifecycle hooks let you pause an instance in a 'Pending:Wait' or 'Terminating:Wait' state so you can run a script or wait for an external system to complete a task before the instance lifecycle continues." },
  { id: "tf-1", topic: "Terraform", difficulty: "medium", question: "What is the primary purpose of the 'terraform.tfstate' file?", options: ["To store the provider credentials and API keys securely.", "To map Terraform configuration code to real-world resources and track metadata.", "To define the infrastructure as code syntax.", "To store the shell execution logs of the 'terraform apply' command."], correctAnswer: 1, explanation: "The state file keeps track of the IDs and properties of the resources Terraform has created, allowing it to know what exists, compute diffs, and manage resources across executions." },
  { id: "tf-2", topic: "Terraform", difficulty: "hard", question: "Why is it crucial to use a remote backend (like S3 with DynamoDB locking) for Terraform state in a team environment?", options: ["It compiles the Terraform code faster in the cloud.", "It prevents multiple team members from concurrently modifying state (via locking) and ensures everyone uses the single source of truth.", "It automatically translates AWS CloudFormation templates into Terraform HCL.", "It is a strict requirement for utilizing Terraform modules."], correctAnswer: 1, explanation: "A remote backend centralizes the state file, and when combined with a locking mechanism (like DynamoDB for S3 backends), it prevents race conditions and state corruption from simultaneous applies." },
  { id: "tf-3", topic: "Terraform", difficulty: "hard", question: "What happens when you run 'terraform taint <resource>'?", options: ["The resource is immediately destroyed in the cloud provider.", "The resource is marked as degraded, forcing Terraform to destroy and recreate it during the next 'apply'.", "Terraform ignores the resource entirely in future operations.", "Terraform forces a 'refresh' on the resource to update its state."], correctAnswer: 1, explanation: "Tainting a resource tells Terraform that the object has become degraded or damaged. Terraform will destroy and recreate it during the next plan/apply cycle." },
  { id: "tf-4", topic: "Terraform", difficulty: "expert", question: "In Terraform, how do 'Data Sources' differ from 'Resources'?", options: ["Data Sources fetch and read information defined outside of Terraform, whereas Resources create and manage infrastructure.", "Data Sources are used for databases, Resources are used for compute instances.", "Data Sources are deprecated in favor of variables.", "Resources only exist in the state file, Data Sources only exist in the cloud provider."], correctAnswer: 0, explanation: "Data sources allow Terraform to use information defined outside of Terraform, or defined by another separate Terraform configuration, essentially acting as read-only queries." },
  { id: "tf-5", topic: "Terraform", difficulty: "medium", question: "What is a 'Terraform Module'?", options: ["A plugin downloaded from the Terraform Registry to interface with a cloud provider.", "A container for multiple resources that are used together, allowing for reusable infrastructure code.", "A billing construct to calculate infrastructure costs.", "A secure vault for storing sensitive variables."], correctAnswer: 1, explanation: "Modules are self-contained packages of Terraform configurations that manage a collection of related resources. They promote reusability and logical grouping." },
  { id: "tf-6", topic: "Terraform", difficulty: "expert", question: "What is the function of the '.terraform.lock.hcl' file introduced in Terraform 0.14?", options: ["To lock the state file during an active 'terraform apply'.", "To lock the exact versions and hashes of provider plugins to ensure reproducible runs across different machines.", "To prevent manual edits to the main.tf file.", "To encrypt sensitive outputs in the CLI."], correctAnswer: 1, explanation: "The dependency lock file records exactly which versions of providers were installed, ensuring that 'terraform init' installs the exact same provider binaries across all team members and CI/CD systems." },
  { id: "tf-7", topic: "Terraform", difficulty: "hard", question: "How can you pass values from a child Terraform module back to its parent module?", options: ["Using 'export' variables.", "Using the 'terraform output' command in a null_resource.", "By declaring 'output' blocks in the child module, which the parent can reference as 'module.name.output_name'.", "It is not possible; data only flows top-down in Terraform."], correctAnswer: 2, explanation: "Outputs declared in a child module expose subsets of its resource attributes to the calling parent module, allowing the parent to use those values." },
  { id: "tf-8", topic: "Terraform", difficulty: "expert", question: "What is a common danger of using Terraform 'provisioners' (like local-exec or remote-exec)?", options: ["They cost extra money on AWS.", "They inherently bypass Terraform's declarative model, hiding side-effects and making failure recovery difficult.", "They disable Terraform state locking.", "They require writing scripts in Go."], correctAnswer: 1, explanation: "Provisioners introduce imperative actions into a declarative system. If a provisioner fails mid-execution, Terraform cannot easily know the exact state of the resource, often leaving it tainted." },
  { id: "tf-9", topic: "Terraform", difficulty: "medium", question: "What does the 'terraform plan' command do?", options: ["It generates an execution plan showing what actions Terraform will take to achieve the desired state without actually applying them.", "It formats the HCL code to adhere to canonical spacing.", "It provisions the infrastructure in a temporary 'dry-run' AWS account.", "It downloads required provider plugins."], correctAnswer: 0, explanation: "The plan command is a crucial safety mechanism that compares your code to the state file and real-world infrastructure, outputting the exact additions, changes, and deletions it intends to make." },
  { id: "tf-10", topic: "Terraform", difficulty: "hard", question: "What Terraform feature allows you to manage multiple distinct environments (like dev, staging, prod) using the exact same directory of Terraform code?", options: ["Terraform Provisioners", "Terraform Workspaces", "Terraform Modules", "Terraform Taints"], correctAnswer: 1, explanation: "Workspaces allow you to maintain separate, isolated state files for a single configuration directory, making it easy to deploy the same infrastructure across multiple environments." },
  { id: "sys-1", topic: "System Design", difficulty: "expert", question: "What does the CAP theorem state regarding distributed data stores?", options: ["A system can only guarantee two out of three: Consistency, Availability, and Partition Tolerance.", "A system must balance Compute, Availability, and Performance.", "Consistency is always more important than Availability during a Partition.", "Cache, API, and Persistence must be decoupled."], correctAnswer: 0, explanation: "The CAP theorem states that in the presence of a network partition (P), a distributed system must choose between being Consistent (C) or Available (A)." },
  { id: "sys-2", topic: "System Design", difficulty: "hard", question: "In the context of the PACELC theorem, what does the 'E' stand for?", options: ["Eventually (Consistent)", "Else", "Entity", "Error"], correctAnswer: 1, explanation: "PACELC expands CAP: if there is a Partition (P), choose Availability (A) or Consistency (C); Else (E) (when the system is running normally), choose Latency (L) or Consistency (C)." },
  { id: "sys-3", topic: "System Design", difficulty: "hard", question: "What is 'Consistent Hashing' primarily used for in distributed systems?", options: ["To securely hash passwords in a distributed authentication system.", "To minimize the number of keys that need to be remapped when a node is added or removed from a cluster (like a distributed cache).", "To ensure blockchain nodes agree on the next block.", "To compress large payloads before sending them over the network."], correctAnswer: 1, explanation: "Consistent hashing maps data to nodes on a ring. When a node is added/removed, only a small fraction of keys are redistributed, drastically reducing cache misses compared to modulo hashing." },
  { id: "sys-4", topic: "System Design", difficulty: "expert", question: "What problem do Consensus Algorithms (like Raft or Paxos) solve?", options: ["Ensuring a distributed cluster agrees on a single value or state, even in the presence of network partitions and node failures.", "Load balancing HTTP traffic evenly across available servers.", "Preventing SQL injection attacks in distributed databases.", "Compressing data across multiple nodes to save storage."], correctAnswer: 0, explanation: "Consensus algorithms allow a collection of machines to work as a coherent group that can survive the failures of some of its members, essential for coordinating leader election and state machine replication." },
  { id: "sys-5", topic: "System Design", difficulty: "expert", question: "What is the 'Cache Stampede' (or Thundering Herd) problem?", options: ["When too many servers try to write to the cache simultaneously, crashing the cache node.", "When a highly requested cache key expires, and thousands of concurrent requests all miss the cache and hit the database simultaneously.", "When a caching layer evicts keys randomly instead of using LRU.", "When the cache memory becomes entirely fragmented."], correctAnswer: 1, explanation: "A cache stampede occurs when a popular cached item expires, causing a sudden spike of identical queries to hit the expensive backend database at the exact same time before the cache is repopulated." },
  { id: "sys-6", topic: "System Design", difficulty: "hard", question: "Which strategy helps mitigate a Cache Stampede?", options: ["Disabling the cache entirely.", "Implementing mutual exclusion (mutex locks) so only one thread recomputes the cache value while others wait.", "Using a Write-Behind caching strategy.", "Switching from Redis to Memcached."], correctAnswer: 1, explanation: "By using a distributed lock, the first request that misses the cache acquires the lock, queries the database, and updates the cache. Other requests wait or return slightly stale data until the lock is released." },
  { id: "sys-7", topic: "System Design", difficulty: "expert", question: "In event-driven architecture, what does 'Exactly-Once Semantics' guarantee, and why is it famously difficult?", options: ["It guarantees messages are never delayed. It's difficult because of network speed of light.", "It guarantees a message is delivered and processed exactly once. It is difficult because network failures require retries, naturally leading to at-least-once delivery.", "It guarantees databases never duplicate rows. It's difficult due to SQL syntax.", "It guarantees code executes on only one CPU core. It's difficult due to modern multi-core processors."], correctAnswer: 1, explanation: "Networks are unreliable. If an acknowledgment is lost, the sender must retry (at-least-once). True exactly-once requires strict coordination (idempotency) between the messaging system and the processor." },
  { id: "sys-8", topic: "System Design", difficulty: "hard", question: "What is an 'Idempotent' operation?", options: ["An operation that runs faster upon subsequent executions.", "An operation that can be applied multiple times without changing the result beyond the initial application.", "An operation that locks a database row until a transaction finishes.", "An operation that must never be retried under any circumstances."], correctAnswer: 1, explanation: "Idempotency is crucial in distributed systems. If an API request (like 'set status to completed') is sent twice due to a network retry, the final state should be exactly the same as if it were sent once." },
  { id: "sys-9", topic: "System Design", difficulty: "expert", question: "What is the purpose of the 'Outbox Pattern' in microservices?", options: ["To forward spam emails to a central server.", "To reliably publish events to a message broker within the same local database transaction that updates the business entity.", "To structure frontend API calls linearly.", "To bypass API Gateways for internal service-to-service communication."], correctAnswer: 1, explanation: "The Outbox pattern prevents dual-write failures. Business data and the event payload are written in a single ACID transaction to the database. A separate process then reads the 'outbox' table and reliably publishes the events to a message broker." },
  { id: "sys-10", topic: "System Design", difficulty: "medium", question: "In database scaling, what is 'Sharding'?", options: ["Replicating the entire database to multiple servers for read performance.", "Partitioning a database horizontally across multiple servers based on a shard key.", "Compressing database rows to fit more data in RAM.", "Creating indexes on every column to speed up queries."], correctAnswer: 1, explanation: "Sharding involves splitting a massive table horizontally into smaller, distinct chunks (shards) that are hosted on separate database instances, distributing the write/read load and storage." },
  { id: "db-1", topic: "DBMS", difficulty: "hard", question: "What is the difference between a B-Tree index and an LSM-Tree (Log-Structured Merge-Tree)?", options: ["B-Trees are optimized for fast writes; LSM-Trees are optimized for fast reads.", "B-Trees update data in-place; LSM-Trees append data sequentially and merge in the background, making them highly optimized for heavy write workloads.", "B-Trees are only used in NoSQL; LSM-Trees are used in SQL.", "LSM-Trees require all data to fit in RAM; B-Trees do not."], correctAnswer: 1, explanation: "LSM-Trees (used by Cassandra, RocksDB) absorb writes sequentially into memory and flush to immutable files, providing extreme write throughput. B-Trees (used by Postgres, MySQL) update pages in-place, which requires random disk I/O." },
  { id: "db-2", topic: "DBMS", difficulty: "expert", question: "What does the 'Isolation' property in ACID transactions prevent?", options: ["Hard drive failures from corrupting data.", "Concurrent transactions from interfering with each other, preventing issues like dirty reads, non-repeatable reads, and phantom reads.", "Unauthorized users from accessing specific tables.", "A transaction from executing partially without rolling back."], correctAnswer: 1, explanation: "Isolation dictates how and when changes made by one transaction become visible to other concurrent transactions, providing a spectrum of levels from Read Uncommitted to Serializable." },
  { id: "db-3", topic: "DBMS", difficulty: "hard", question: "What is a 'Dirty Read' in database transactions?", options: ["Reading data from a corrupted sector on the hard drive.", "Reading data that contains profanity.", "Reading uncommitted changes made by another concurrent transaction that might later be rolled back.", "Reading data that lacks a primary key."], correctAnswer: 2, explanation: "If Transaction A updates a row but hasn't committed, and Transaction B reads that updated row, B has performed a dirty read. If A subsequently rolls back, B has acted on data that technically never existed." },
  { id: "db-4", topic: "DBMS", difficulty: "expert", question: "How does MVCC (Multi-Version Concurrency Control) typically improve database performance?", options: ["By compressing the database files on disk.", "By allowing readers to read a snapshot of the data without blocking writers, and writers to write without blocking readers.", "By splitting large queries into multiple smaller queries across a cluster.", "By moving the entire dataset into RAM."], correctAnswer: 1, explanation: "MVCC (used by PostgreSQL) keeps multiple versions of a row. When a transaction reads data, it sees a consistent snapshot. Thus, read locks don't block write locks, dramatically increasing concurrency." },
  { id: "db-5", topic: "DBMS", difficulty: "expert", question: "What is an N+1 query problem, and how is it typically solved in ORMs?", options: ["It is a mathematical error in SQL aggregations. Solved by using `HAVING` clauses.", "When an ORM executes 1 query to fetch N parent records, and then N additional queries to fetch child records. Solved by using eager loading (JOINs).", "When a query returns N rows but the application only expects 1. Solved by using `LIMIT 1`.", "When the database requires N+1 index scans to find a record. Solved by creating composite indexes."], correctAnswer: 1, explanation: "The N+1 problem causes huge latency spikes because it generates a flood of tiny queries instead of fetching all required data in a single, efficient JOIN or subquery (Eager Loading)." },
  { id: "obs-1", topic: "Observability", difficulty: "medium", question: "What are the 'Three Pillars of Observability'?", options: ["Speed, Security, Reliability", "Metrics, Logs, Traces", "Alerts, Dashboards, Runbooks", "CPU, Memory, Network"], correctAnswer: 1, explanation: "Metrics provide aggregate numerical data (is there a problem?), Logs provide detailed point-in-time events (what exactly is the problem?), and Traces map requests across distributed services (where is the problem?)." },
  { id: "obs-2", topic: "Observability", difficulty: "hard", question: "In Distributed Tracing, what is the difference between a 'Trace' and a 'Span'?", options: ["A Trace is for backend, a Span is for frontend.", "A Trace represents the entire journey of a request across the system. A Span represents a single logical operation or boundary within that Trace.", "A Trace is an error log; a Span is a performance metric.", "They are synonymous and used interchangeably."], correctAnswer: 1, explanation: "A Trace is a tree of Spans. If a request hits an API Gateway, an Auth Service, and a Database, the entire flow is one Trace, comprising at least three individual Spans." },
  { id: "obs-3", topic: "Observability", difficulty: "expert", question: "What is the difference between an SLA, SLO, and SLI in Site Reliability Engineering?", options: ["SLI is an indicator (measurement), SLO is an objective (target), SLA is an agreement (business contract outlining penalties).", "SLA is the speed, SLO is the uptime, SLI is the error rate.", "They are three different open-source monitoring tools.", "SLI is for internal use, SLO is for managers, SLA is for the database team."], correctAnswer: 0, explanation: "An SLI (Indicator) might be 'HTTP 500 error rate'. An SLO (Objective) might be '99.9% of requests will not be 500s'. An SLA (Agreement) is the contract promising refunds if the SLO is not met." },
  { id: "net-1", topic: "Computer Networks", difficulty: "expert", question: "What is the purpose of the TCP Three-Way Handshake?", options: ["To negotiate the TLS encryption keys.", "To establish a reliable connection, synchronize sequence numbers, and acknowledge readiness before data transmission begins.", "To authenticate the user credentials.", "To find the shortest path through the network routers."], correctAnswer: 1, explanation: "The SYN, SYN-ACK, ACK process allows both the client and server to agree on starting sequence numbers and confirm that two-way communication is possible." },
  { id: "net-2", topic: "Computer Networks", difficulty: "hard", question: "What is 'Head-of-line blocking' in the context of HTTP/1.1?", options: ["When a CSS file blocks the rendering of the DOM.", "When an error in the HTML header causes the entire page to fail.", "When a slow response blocks subsequent requests sent over the same TCP connection because HTTP/1.1 processes requests sequentially.", "When a firewall blocks the first packet of a TCP stream."], correctAnswer: 2, explanation: "In HTTP/1.1 with persistent connections, responses must be returned in the exact order requests were sent. If the first request takes 10 seconds, all subsequent requests must wait, blocking the 'line'." },
  { id: "net-3", topic: "Computer Networks", difficulty: "hard", question: "How does HTTP/2 solve the Head-of-line blocking problem present in HTTP/1.1?", options: ["By compressing HTTP headers.", "By requiring a separate TCP connection for every single asset.", "By using a binary framing layer that allows multiplexing multiple concurrent streams over a single TCP connection.", "By switching the underlying protocol from TCP to UDP."], correctAnswer: 2, explanation: "HTTP/2 multiplexing allows multiple requests and responses to be interleaved concurrently over a single TCP connection, eliminating application-layer head-of-line blocking." },
  { id: "sec-1", topic: "Security", difficulty: "expert", question: "What is a CSRF (Cross-Site Request Forgery) attack?", options: ["Stealing a user's password via a fake login screen.", "Injecting malicious JavaScript into a webpage that executes in another user's browser.", "Forcing an authenticated user's browser to execute an unwanted, state-changing action on a trusted site without their knowledge.", "Overwhelming a server with cross-origin requests."], correctAnswer: 2, explanation: "Because browsers automatically send ambient credentials (like cookies) with requests, a malicious site can trick a user's browser into making a forged request to a vulnerable bank or email site where they are logged in." },
  { id: "sec-2", topic: "Security", difficulty: "hard", question: "Which HTTP header is primarily designed to mitigate Cross-Site Scripting (XSS) attacks by restricting the sources from which scripts can be loaded?", options: ["X-Frame-Options", "Content-Security-Policy (CSP)", "Strict-Transport-Security (HSTS)", "Access-Control-Allow-Origin (CORS)"], correctAnswer: 1, explanation: "A robust CSP acts as a strict whitelist, telling the browser exactly which domains are allowed to load scripts, styles, or images, heavily neutralizing injected malicious scripts." },
  { id: "arch-1", topic: "Architecture", difficulty: "expert", question: "What does the 'Strangler Fig Pattern' refer to in software architecture?", options: ["A method for compressing large monolithic databases.", "A strategy for incrementally migrating a legacy system by gradually replacing specific pieces of functionality with new applications and services.", "A security pattern to isolate compromised network segments.", "A design pattern where child processes terminate their parent process to free up memory."], correctAnswer: 1, explanation: "Instead of a risky 'big bang' rewrite, the Strangler Fig pattern puts a routing facade in front of the legacy system and gradually routes specific endpoints to newly built microservices until the legacy system can be strangled out entirely." },
  { id: "arch-2", topic: "Architecture", difficulty: "hard", question: "In microservices, what is the 'BFF' pattern?", options: ["Best Friends Forever: tight coupling between two microservices.", "Backend For Frontend: Creating specialized backend services tailored to the specific needs of different frontends (e.g., one for Web, one for Mobile).", "Binary File Format: A highly compressed RPC protocol.", "Buffer First Flush: A caching strategy for high-throughput APIs."], correctAnswer: 1, explanation: "The BFF pattern avoids forcing mobile and web apps to use the exact same generalized API. Instead, specific API gateways are built to cater to the distinct payload and latency requirements of each UI." },
  { id: "go-1", topic: "Programming", difficulty: "expert", question: "In Go (Golang), what happens if you read from a closed channel?", options: ["It causes a runtime panic.", "It blocks indefinitely.", "It immediately returns the zero value of the channel's type, without blocking.", "It restarts the channel automatically."], correctAnswer: 2, explanation: "Reading from a closed channel in Go succeeds immediately, yielding the zero value of the channel's type and a boolean flag 'false' indicating it is closed. This is crucial for broadcast patterns." },
  { id: "java-1", topic: "Programming", difficulty: "expert", question: "In Java, what is 'Type Erasure' in the context of Generics?", options: ["The process where generic type information is removed at compile time, making 'List<String>' and 'List<Integer>' the exact same class at runtime.", "A Garbage Collection mechanism that deletes unused classes.", "A security feature that hides class names in stack traces.", "A feature of the JVM that unloads classes to save memory."], correctAnswer: 0, explanation: "Java implemented generics for backward compatibility. The compiler checks types during compilation, but erases them (replacing them with Object or bounds) in the bytecode. Thus, at runtime, a List<String> is just a List." },
  { id: "node-1", topic: "Programming", difficulty: "expert", question: "In Node.js, how does the Event Loop handle 'microtasks' (like resolved Promises) versus 'macrotasks' (like setTimeout)?", options: ["It alternates between one microtask and one macrotask.", "It executes the entire microtask queue immediately after the current operation completes, before moving on to the next macrotask or phase of the event loop.", "It executes macrotasks first, as they have higher priority.", "It relies on the OS scheduler to manage both simultaneously across threads."], correctAnswer: 1, explanation: "Microtasks have absolute priority over the next macrotask. If a microtask queues another microtask, the event loop will process it immediately, potentially starving the event loop if microtasks loop indefinitely." },
  { id: "rust-1", topic: "Programming", difficulty: "expert", question: "What core problem does Rust's 'Borrow Checker' solve?", options: ["It ensures that dependencies fetched from crates.io are cryptographically signed.", "It prevents data races and memory bugs at compile-time by enforcing strict rules about variable ownership, mutable references, and lifetimes.", "It prevents infinite loops in asynchronous code.", "It manages garbage collection pauses automatically."], correctAnswer: 1, explanation: "Rust achieves memory safety without a garbage collector. The borrow checker enforces that you can have either one mutable reference or any number of immutable references to a piece of data at any given time, but never both." },
  { id: "sql-1", topic: "DBMS", difficulty: "hard", question: "What is the difference between a clustered index and a non-clustered index in a relational database?", options: ["Clustered indexes are used on clusters of servers; non-clustered are used on single nodes.", "A clustered index physically sorts the actual data rows on disk by the index key. A non-clustered index stores a separate structure containing pointers to the data rows.", "Clustered indexes only work for string columns.", "Non-clustered indexes are automatically created for primary keys."], correctAnswer: 1, explanation: "Because a clustered index determines the physical storage order of the rows, a table can only have one clustered index. It acts as the actual table data structure." },
  { id: "sql-2", topic: "DBMS", difficulty: "expert", question: "What is a 'Covering Index'?", options: ["An index that covers all columns in a database table.", "An index that contains all the fields required by a query, allowing the database to retrieve the result directly from the index without doing a lookup to the actual table row.", "A backup of an index stored in RAM.", "An index specifically designed for full-text search."], correctAnswer: 1, explanation: "If an index 'covers' a query, the database engine avoids the expensive secondary step of looking up the actual table data (the clustered index or heap) because the index itself contains everything needed." },
  { id: "db-6", topic: "DBMS", difficulty: "expert", question: "What is the primary difference between a materialized view and a standard view?", options: ["A standard view is read-only; a materialized view can be written to.", "A materialized view caches the actual result set on disk and must be refreshed, whereas a standard view is essentially a saved SQL macro that executes dynamically every time it is queried.", "Materialized views can only join two tables at maximum.", "Standard views are only available in NoSQL databases."], correctAnswer: 1, explanation: "Standard views don't store data; they just store the query. Materialized views compute the query and store the physical result set on disk, vastly speeding up complex analytical queries at the cost of data staleness." },
  { id: "cache-1", topic: "Caching", difficulty: "hard", question: "What distinguishes a 'Write-Through' cache from a 'Write-Behind' (Write-Back) cache?", options: ["Write-Through writes to cache only; Write-Behind writes to database only.", "Write-Through synchronously writes to both cache and database before confirming success. Write-Behind writes to the cache instantly and asynchronously flushes to the database later.", "Write-Through bypasses the cache entirely for write operations.", "Write-Behind is strictly used for CDNs, while Write-Through is for Redis."], correctAnswer: 1, explanation: "Write-Through ensures consistency but incurs higher latency on writes. Write-Behind provides extremely fast writes but risks data loss if the cache node crashes before flushing to the persistent database." },
  { id: "msg-1", topic: "System Design", difficulty: "expert", question: "In Apache Kafka, what defines the unit of parallelism for a topic?", options: ["The number of ZooKeeper nodes.", "The number of Partitions assigned to the topic.", "The size of the consumer group.", "The number of Kafka brokers in the cluster."], correctAnswer: 1, explanation: "A Kafka topic is divided into partitions. A single partition cannot be consumed concurrently by multiple consumers in the same group. Therefore, the number of partitions dictates the maximum parallel consumption rate." },
  { id: "msg-2", topic: "System Design", difficulty: "hard", question: "What is the key functional difference between RabbitMQ and Apache Kafka?", options: ["RabbitMQ is a distributed log where messages persist after reading; Kafka is a smart-broker queue that deletes messages once acknowledged.", "RabbitMQ uses a push model with smart routing and deletes messages after processing. Kafka is a distributed append-only log where consumers pull messages and keep track of their own offsets.", "Kafka only supports XML payloads; RabbitMQ supports JSON.", "RabbitMQ requires Kubernetes to run; Kafka does not."], correctAnswer: 1, explanation: "RabbitMQ acts like a traditional post office (smart broker, dumb consumer). Kafka acts like a persistent, replayable tape drive (dumb broker, smart consumer)." },
  { id: "net-4", topic: "Computer Networks", difficulty: "expert", question: "What is BGP (Border Gateway Protocol)?", options: ["A protocol used to encrypt traffic between two local microservices.", "The routing protocol of the internet, responsible for exchanging routing and reachability information among autonomous systems.", "A DNS mechanism for preventing DDoS attacks.", "A load balancing algorithm used by Nginx."], correctAnswer: 1, explanation: "BGP is the postal service of the internet. It maps out the paths data can take to travel across massive, distinct networks (Autonomous Systems) operated by ISPs and large tech companies." },
  { id: "sec-3", topic: "Security", difficulty: "hard", question: "In modern authentication, what is an 'ID Token' vs an 'Access Token' (e.g., in OpenID Connect/OAuth2)?", options: ["ID Tokens are used for database access; Access Tokens are used for UI rendering.", "An ID Token asserts the identity of the user for the client application. An Access Token grants the client application permission to access an API on the user's behalf.", "They are exactly the same thing, just different naming conventions.", "ID Tokens are strictly XML; Access Tokens are strictly JWTs."], correctAnswer: 1, explanation: "You 'read' an ID token to know who logged in to display their name. You 'use' an Access token (usually as a Bearer token) to call a protected backend API. You should never send an ID token to authorize an API call." },
  { id: "sec-4", topic: "Security", difficulty: "expert", question: "What is a Server-Side Request Forgery (SSRF) vulnerability?", options: ["When an attacker forces the server to execute malicious SQL.", "When an attacker abuses functionality on the server to read or update internal resources, effectively forcing the server to make requests on the attacker's behalf.", "When an attacker intercepts the TLS handshake.", "When an attacker spoofs the 'Referer' header."], correctAnswer: 1, explanation: "SSRF occurs when a web application is fetching a remote resource without validating the user-supplied URL. It allows attackers to access internal services like the AWS metadata endpoint (169.254.169.254) or internal admin panels." },
  { id: "arch-3", topic: "Architecture", difficulty: "hard", question: "What is the 'Saga Pattern' used for?", options: ["To organize frontend components into chronological stories.", "To manage distributed transactions across multiple microservices without using global 2PC (Two-Phase Commit) locks.", "To compress log files chronologically.", "To automatically retry failed API requests forever."], correctAnswer: 1, explanation: "A Saga splits a distributed transaction into a sequence of local transactions. If one step fails, the Saga executes compensating transactions (undo operations) to rollback the previous steps, maintaining eventual consistency." },
  { id: "arch-4", topic: "Architecture", difficulty: "expert", question: "In CQRS (Command Query Responsibility Segregation), what is the core principle?", options: ["Combining read and write models into a single, unified ORM for simplicity.", "Separating the models and operations that update data (Commands) from the models and operations that read data (Queries).", "Ensuring every command runs exactly twice.", "Querying data using Command-Line Interfaces exclusively."], correctAnswer: 1, explanation: "CQRS acknowledges that reading data and writing data have vastly different performance, scale, and security requirements. By separating them, you can scale read databases and write databases independently." },
  { id: "cloud-1", topic: "AWS", difficulty: "medium", question: "What does Amazon CloudFront do?", options: ["It provisions EC2 instances.", "It is a Content Delivery Network (CDN) that caches data, videos, APIs, and applications globally close to the end user.", "It manages VPC routing tables.", "It is a managed relational database."], correctAnswer: 1, explanation: "CloudFront distributes traffic across a massive global network of edge locations, reducing latency by serving static and dynamic content from a node physically closer to the user." },
  { id: "cloud-2", topic: "AWS", difficulty: "expert", question: "What is AWS EventBridge primarily used for?", options: ["To build real-time chat applications via WebSockets.", "A serverless event bus that makes it easy to connect applications together using data from your own applications, integrated SaaS apps, and AWS services.", "To bridge an on-premise Active Directory with AWS IAM.", "To load balance traffic across different AWS Regions."], correctAnswer: 1, explanation: "EventBridge is an evolution of CloudWatch Events. It allows you to build highly decoupled, event-driven architectures by routing events based on complex pattern matching." },
  { id: "k8s-1", topic: "Kubernetes", difficulty: "hard", question: "In Kubernetes, what is a 'ConfigMap'?", options: ["A map showing the physical location of the cluster's nodes.", "An API object used to store non-confidential data in key-value pairs, which can be consumed by Pods as environment variables, command-line arguments, or configuration files.", "A file used to configure the local `kubectl` CLI.", "A tool to visually map the network topology of services."], correctAnswer: 1, explanation: "ConfigMaps allow you to decouple environment-specific configuration from your container images, making your applications easily portable across environments (dev, staging, prod)." },
  { id: "k8s-2", topic: "Kubernetes", difficulty: "expert", question: "How does a Kubernetes Horizontal Pod Autoscaler (HPA) determine when to scale up?", options: ["By periodically querying a metrics API (like the metrics-server) to check resource utilization (e.g., CPU, Memory) against defined target thresholds.", "By monitoring the length of an AWS SQS queue directly by default.", "By parsing the Nginx access logs for 500 errors.", "By running a ping test against the Pods every second."], correctAnswer: 0, explanation: "The HPA controller queries the resource metrics API. If the average CPU utilization across all targeted pods exceeds the target percentage, it calculates the necessary number of replicas and scales the deployment up." },
  { id: "docker-1", topic: "Docker", difficulty: "expert", question: "In a Dockerfile, what is the critical difference between the `CMD` and `ENTRYPOINT` instructions?", options: ["`CMD` is required, `ENTRYPOINT` is optional.", "`ENTRYPOINT` sets the executable that will always run, while `CMD` provides default arguments that can be easily overridden at the end of the `docker run` command.", "`CMD` executes at build time, `ENTRYPOINT` executes at runtime.", "They are exactly the same and exist only for historical reasons."], correctAnswer: 1, explanation: "If you define `ENTRYPOINT ['python']` and `CMD ['app.py']`, running `docker run myimg` runs `python app.py`. Running `docker run myimg script.py` overrides the CMD, running `python script.py` instead." },
  { id: "sre-1", topic: "DevOps", difficulty: "expert", question: "What is an 'Error Budget' in SRE?", options: ["The financial cost allocated for replacing broken servers.", "The maximum amount of time developers are allowed to spend debugging.", "The acceptable level of unreliability allowed for a service before feature development is halted to focus on stability.", "A cloud provider billing alarm."], correctAnswer: 2, explanation: "An error budget (100% minus the SLO, e.g., 0.1% downtime) acts as a control mechanism. If the budget is exhausted by too many outages, the team must prioritize reliability work over releasing new features." },
  { id: "sre-2", topic: "DevOps", difficulty: "medium", question: "What does 'Mean Time To Recovery' (MTTR) measure?", options: ["The average time it takes to deploy a new feature to production.", "The average time it takes to restore a system to full functionality after a failure occurs.", "The time it takes to reboot a Linux server.", "The average time between consecutive failures."], correctAnswer: 1, explanation: "MTTR is a crucial incident management metric. It measures the speed and efficiency of a team's response and remediation processes during an outage." },
  { id: "alg-1", topic: "Computer Science", difficulty: "expert", question: "What is the time complexity of searching for an element in a balanced Binary Search Tree (BST)?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctAnswer: 1, explanation: "Because the tree is balanced, each comparison halves the remaining search space, leading to a logarithmic time complexity." },
  { id: "alg-2", topic: "Computer Science", difficulty: "hard", question: "Why are Hash Tables generally preferred over Trees for dictionary lookups?", options: ["Hash tables use less memory.", "Hash tables preserve the sorted order of keys.", "Hash tables offer average O(1) time complexity for lookups, insertions, and deletions.", "Hash tables do not suffer from collisions."], correctAnswer: 2, explanation: "While trees (like Red-Black trees) guarantee O(log n) operations and keep keys sorted, Hash Tables provide much faster O(1) operations on average, making them ideal for standard key-value mappings." },
  { id: "cloud-3", topic: "AWS", difficulty: "expert", question: "In AWS, what is a NAT Gateway primarily used for?", options: ["To route traffic between two different VPCs.", "To allow instances in a private subnet to connect to the internet (for updates/patches) while preventing the internet from initiating connections to those instances.", "To translate IPv6 traffic into IPv4 traffic.", "To load balance incoming HTTP requests."], correctAnswer: 1, explanation: "A NAT Gateway resides in a public subnet and acts as a proxy. Private instances send outbound traffic to the NAT Gateway, which translates the private IP to a public IP to reach the internet, keeping the instance secure from inbound attacks." },
  { id: "cloud-4", topic: "AWS", difficulty: "expert", question: "What is the primary use case for AWS Global Accelerator?", options: ["To accelerate the build times of AWS CodeBuild.", "To improve global application availability and performance by routing user traffic through AWS's dedicated global network infrastructure using anycast IPs.", "To cache static website assets globally like a CDN.", "To migrate large databases to AWS quickly using physical hard drives."], correctAnswer: 1, explanation: "Global Accelerator provides static IP addresses that act as a fixed entry point. Traffic enters the AWS global network at the edge location closest to the user, bypassing the unpredictable public internet." },
  { id: "db-7", topic: "DBMS", difficulty: "hard", question: "What is a 'Bloom Filter' typically used for in modern databases?", options: ["To beautifully visualize data queries.", "To deterministically prove that an element is definitely inside a dataset.", "To quickly test whether an element is *possibly* in a set, or *definitely not* in a set, saving expensive disk reads.", "To filter out malicious SQL injection attempts."], correctAnswer: 2, explanation: "Bloom filters are probabilistic data structures. They are used in databases like Cassandra and Postgres to avoid doing expensive disk lookups for rows that are mathematically proven to not exist in the file." },
  { id: "sec-5", topic: "Security", difficulty: "expert", question: "What does 'Perfect Forward Secrecy' (PFS) ensure in TLS encryption?", options: ["It ensures that the server can perfectly predict the client's next request.", "It ensures that if the server's long-term private key is compromised in the future, past recorded encrypted sessions cannot be decrypted.", "It ensures that the SSL certificate never expires.", "It ensures that data is routed forward through the fastest network path."], correctAnswer: 1, explanation: "PFS uses unique, ephemeral session keys (like via Diffie-Hellman) for every session. Even if an attacker records traffic for years and eventually steals the server's private key, they still cannot decrypt the historical traffic." },
  { id: "arch-5", topic: "Architecture", difficulty: "hard", question: "What is the 'Circuit Breaker' pattern?", options: ["A physical switch that cuts power to servers during a cyber attack.", "A design pattern that prevents an application from repeatedly trying to execute an operation that's likely to fail, giving the failing service time to recover.", "A pattern to split a monolithic codebase into microservices.", "A routing technique to balance traffic across multiple regions."], correctAnswer: 1, explanation: "Just like an electrical circuit breaker, if a downstream service starts failing repeatedly, the breaker 'trips' and immediately fails fast for new requests, preventing cascading failures across the system." },
  { id: "tf-11", topic: "Terraform", difficulty: "expert", question: "In Terraform, what does the `lifecycle { create_before_destroy = true }` block do?", options: ["It prevents the resource from ever being destroyed.", "It forces Terraform to provision the replacement resource first, wait for it to be ready, and only then destroy the old resource, minimizing downtime.", "It runs a shell script before destroying the resource.", "It automatically backs up the resource before destruction."], correctAnswer: 1, explanation: "By default, Terraform destroys a resource before creating its replacement. `create_before_destroy` inverts this order, which is crucial for zero-downtime updates on resources like load balancer target groups." },
  { id: "k8s-3", topic: "Kubernetes", difficulty: "hard", question: "What is a Kubernetes 'Sidecar' container?", options: ["A secondary container that runs in the same Pod as the primary application container, used to augment or extend the primary app's functionality (e.g., logging, proxying).", "A container that runs on a separate Node to monitor the primary container.", "A deprecated feature from older Kubernetes versions.", "A container used strictly for database backups."], correctAnswer: 0, explanation: "Because containers in the same Pod share the same network namespace and local storage, sidecars are perfect for tasks like service mesh proxies (Envoy) or log shippers (Fluentbit) that need to sit closely alongside the main app." },
  { id: "msg-3", topic: "System Design", difficulty: "expert", question: "In event streaming, what is the 'Poison Pill' problem?", options: ["When an engineer accidentally deletes a production database.", "When a corrupted or unprocessable message blocks the processing queue because the consumer continuously crashes or errors when trying to read it.", "When a security token expires mid-transaction.", "When a load balancer routes traffic to a dead node."], correctAnswer: 1, explanation: "If a consumer encounters a message it cannot parse, and the system is set to infinitely retry on failure, that single 'poison pill' blocks all subsequent messages from being processed. Dead Letter Queues (DLQs) are the typical solution." },
  { id: "go-2", topic: "Programming", difficulty: "expert", question: "What is a 'Goroutine' leak?", options: ["When memory is freed too early, causing panics.", "When a Goroutine is blocked forever (e.g., waiting on a channel that will never be written to or closed), causing it and its memory to never be garbage collected.", "When a Goroutine executes faster than the main thread.", "When too many Goroutines are spawned, crashing the OS."], correctAnswer: 1, explanation: "Unlike normal memory, blocked Goroutines cannot be garbage collected. If a function spawns a Goroutine that gets stuck waiting on an abandoned channel, that Goroutine leaks, permanently consuming memory and resources." },
  { id: "db-8", topic: "DBMS", difficulty: "expert", question: "What is 'Two-Phase Commit' (2PC)?", options: ["A Git workflow requiring two code reviews.", "A distributed algorithm that coordinates all processes that participate in a distributed atomic transaction to decide whether to commit or abort.", "A database backup strategy involving two separate drives.", "A method to compress database indexes in two passes."], correctAnswer: 1, explanation: "2PC ensures ACID properties across multiple disparate databases or systems. A coordinator asks all nodes to 'prepare' (Phase 1). If all agree, it issues the 'commit' (Phase 2). It's robust but notorious for causing blocking and latency." },
  { id: "sys-11", topic: "System Design", difficulty: "expert", question: "What is a 'CRDT' (Conflict-free Replicated Data Type)?", options: ["A type of relational database join.", "A data structure that can be replicated across multiple network nodes and updated independently, which mathematically guarantees that conflicts will resolve automatically into a consistent state.", "A cryptographic hashing function.", "A caching strategy for CDN edge nodes."], correctAnswer: 1, explanation: "CRDTs are used in highly collaborative distributed systems (like Figma or Google Docs) or geo-distributed databases (like Redis Enterprise). They allow concurrent local updates without locking, merging them seamlessly later." }
];

// Helper functions for the quiz
export const getRandomQuestions = (count: number = 10, topic?: string, difficulty?: Difficulty): QuizQuestion[] => {
  let filtered = [...quizQuestions];

  if (topic) {
    filtered = filtered.filter(q => q.topic.toLowerCase() === topic.toLowerCase());
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

export const getUniqueTopics = (): string[] => {
  const topics = new Set(quizQuestions.map(q => q.topic));
  return Array.from(topics).sort();
};

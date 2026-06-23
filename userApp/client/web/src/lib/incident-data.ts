export type MetricImpact = {
  integrity?: number;
  trust?: number;
  time?: number;
};

export type IncidentChoice = {
  id: string;
  label: string;
  nextNodeId: string;
  impact?: MetricImpact;
};

export type IncidentNode = {
  id: string;
  text: string;
  type: "neutral" | "alert" | "critical" | "success" | "failure";
  choices?: IncidentChoice[];
};

export type Scenario = {
  id: string;
  title: string;
  description: string;
  startNodeId: string;
  nodes: Record<string, IncidentNode>;
};

export const scenarios: Scenario[] = [
  {
    id: "cache-stampede",
    title: "Incident 01: The Black Friday Stampede",
    description: "A sudden 4000% traffic spike has hit your e-commerce platform. Your caching layer is showing extreme volatility.",
    startNodeId: "alert-1",
    nodes: {
      "alert-1": {
        id: "alert-1",
        text: "CRITICAL ALERT: PagerDuty is screaming. Your Redis cluster just evicted the 'global_catalog' key due to TTL expiration right as the flash sale started. Thousands of concurrent requests are about to hit the primary PostgreSQL database simultaneously to recompute the catalog.",
        type: "critical",
        choices: [
          { id: "c1", label: "Do nothing. The database connection pool can handle the surge.", nextNodeId: "db-crash", impact: { integrity: -40, trust: -20, time: 2 } },
          { id: "c2", label: "Emergency scaling: Vertically scale the PostgreSQL instances immediately.", nextNodeId: "scale-db", impact: { integrity: 10, trust: -10, time: 15 } },
          { id: "c3", label: "Implement a distributed Mutex Lock (Mutex Pattern).", nextNodeId: "mutex-lock", impact: { integrity: 20, trust: 0, time: 5 } }
        ]
      },
      "db-crash": {
        id: "db-crash",
        text: "SYSTEM FAILURE: The database connection pool was instantly exhausted. 100% CPU utilization. The database has locked up entirely. You are experiencing a classic 'Thundering Herd' collapse. Users are seeing 502 Bad Gateway errors.",
        type: "failure",
        choices: [
          { id: "c1", label: "Restart the database cluster.", nextNodeId: "restart-db", impact: { integrity: -20, trust: -30, time: 10 } },
          { id: "c2", label: "Implement a Circuit Breaker on the API gateway to drop traffic.", nextNodeId: "circuit-breaker", impact: { integrity: 30, trust: -40, time: 5 } }
        ]
      },
      "scale-db": {
        id: "scale-db",
        text: "WARNING: Vertically scaling a database requires a brief restart. The site went completely offline for 15 minutes during the peak sale. The database is now massive and handling the load, but the PR damage is done.",
        type: "failure",
        choices: [
          { id: "c1", label: "Write a post-mortem and apologize.", nextNodeId: "game-over-mediocre", impact: { trust: 10, time: 60 } }
        ]
      },
      "mutex-lock": {
        id: "mutex-lock",
        text: "SUCCESS: You quickly deployed a distributed lock. The first request acquired the lock and began querying the database to rebuild the cache. The other 9,999 requests waited gracefully or served stale data. The database survived.",
        type: "success",
        choices: [
          { id: "c1", label: "Monitor the system.", nextNodeId: "alert-2", impact: { time: 5 } }
        ]
      },
      "restart-db": {
        id: "restart-db",
        text: "CATASTROPHE: Restarting the database did nothing to solve the underlying problem. The moment it came back online, the same 10,000 requests slammed it again. It immediately crashed.",
        type: "failure",
        choices: [
          { id: "c1", label: "Accept defeat.", nextNodeId: "game-over-bad", impact: { integrity: -40, trust: -40 } }
        ]
      },
      "circuit-breaker": {
        id: "circuit-breaker",
        text: "MITIGATED: The circuit breaker tripped. 90% of users are getting 'Service Unavailable' pages, but the database is recovering. You saved the hardware, but lost the revenue.",
        type: "alert",
        choices: [
          { id: "c1", label: "Write a post-mortem.", nextNodeId: "game-over-mediocre", impact: { trust: 10, time: 60 } }
        ]
      },
      "alert-2": {
        id: "alert-2",
        text: "NEW ALERT: The database is stable, but now the Checkout Service (a downstream microservice) is throwing latency warnings. The message queue (RabbitMQ) processing orders is backing up heavily.",
        type: "alert",
        choices: [
          { id: "c1", label: "Spin up more consumer pods to drain the queue faster.", nextNodeId: "scale-consumers", impact: { integrity: 20, time: 5 } },
          { id: "c2", label: "Purge the queue to clear the backlog.", nextNodeId: "purge-queue", impact: { integrity: 0, trust: -80, time: 2 } }
        ]
      },
      "scale-consumers": {
        id: "scale-consumers",
        text: "SUCCESS: The new pods spun up and drained the backlog. Latency is back to nominal levels. The flash sale was a massive success. You are a hero.",
        type: "success",
        choices: [
          { id: "c1", label: "Review Incident Report.", nextNodeId: "game-over-good", impact: { trust: 20 } }
        ]
      },
      "purge-queue": {
        id: "purge-queue",
        text: "FATAL ERROR: You just deleted 50,000 paid customer orders. The queue is empty and latency is 0ms, but the company is facing massive lawsuits.",
        type: "failure",
        choices: [
          { id: "c1", label: "Resign immediately.", nextNodeId: "game-over-bad", impact: { integrity: -100, trust: -100 } }
        ]
      },
      "game-over-bad": {
        id: "game-over-bad",
        text: "INCIDENT CLOSED (FAILURE): The system collapsed, revenue was lost, and trust was permanently damaged. Read up on architecture patterns and try again.",
        type: "failure"
      },
      "game-over-mediocre": {
        id: "game-over-mediocre",
        text: "INCIDENT CLOSED (DEGRADED): You survived, but with heavy casualties to revenue and trust. The system architecture needs a serious review.",
        type: "alert"
      },
      "game-over-good": {
        id: "game-over-good",
        text: "INCIDENT CLOSED (RESOLVED): Perfect execution. You identified the bottlenecks, applied the correct distributed systems patterns (Mutex Locks, Horizontal Scaling), and saved the company millions.",
        type: "success"
      }
    }
  }
];

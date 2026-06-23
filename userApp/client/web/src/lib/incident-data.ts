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
    id: "global-launch",
    title: "Incident 01: The Global Viral Launch",
    description: "Your startup just got mentioned by top influencers globally. Traffic is surging exponentially. You need to keep the platform alive through a gauntlet of systemic bottlenecks.",
    startNodeId: "alert-1-cdn",
    nodes: {
      "alert-1-cdn": {
        id: "alert-1-cdn",
        text: "CRITICAL ALERT: The monitoring dashboard has turned completely red. Inbound traffic has spiked by 10,000% across various global IPs. The edge routers are saturated, and the origin servers' CPU utilization is climbing past 90%. Is this a DDoS attack or the viral marketing campaign?",
        type: "critical",
        choices: [
          { id: "c1", label: "Scale Origin: Quickly auto-scale the backend servers to 100 instances.", nextNodeId: "scale-origin-fail", impact: { integrity: -20, trust: 0, time: 10 } },
          { id: "c2", label: "Edge Defense: Activate WAF 'Under Attack' mode and aggressive CDN caching for static assets.", nextNodeId: "waf-success", impact: { integrity: 20, trust: 10, time: 5 } },
          { id: "c3", label: "Geo-Block: Drop all traffic from outside our primary region to save the servers.", nextNodeId: "geo-block-fail", impact: { integrity: 10, trust: -40, time: 2 } }
        ]
      },
      "scale-origin-fail": {
        id: "scale-origin-fail",
        text: "FAILURE: You scaled the backend, but a large portion of the traffic was a botnet scraping your site, mixed with real users. The bots easily overwhelmed the new instances. You just burned through $50,000 of cloud credits in an hour, and the site is still crashing.",
        type: "failure",
        choices: [
          { id: "c1", label: "Acknowledge defeat and resign.", nextNodeId: "game-over-bad" }
        ]
      },
      "geo-block-fail": {
        id: "geo-block-fail",
        text: "FAILURE: The traffic was legitimate international users brought in by a global influencer. You just blocked 80% of your potential new customer base. The servers survived, but the business opportunity is dead.",
        type: "failure",
        choices: [
          { id: "c1", label: "Acknowledge defeat.", nextNodeId: "game-over-bad" }
        ]
      },
      "waf-success": {
        id: "waf-success",
        text: "SUCCESS: The CDN absorbed 90% of the traffic at the edge. The WAF challenge successfully deterred the botnet scraping attempts while letting legitimate users through. However, the 10% of dynamic traffic that reached the origin is still 10x your normal peak.",
        type: "success",
        choices: [
          { id: "c1", label: "Investigate backend health.", nextNodeId: "alert-2-cache", impact: { time: 2 } }
        ]
      },
      "alert-2-cache": {
        id: "alert-2-cache",
        text: "NEW ALERT: Legitimate users are hammering your product catalog. Your Redis cluster just evicted the 'global_catalog' key due to memory pressure. Thousands of concurrent requests are now bypassing the cache and attempting to query the primary PostgreSQL database simultaneously.",
        type: "alert",
        choices: [
          { id: "c1", label: "Ignore it. The database connection pool is robust enough.", nextNodeId: "db-crash", impact: { integrity: -40, trust: -20, time: 2 } },
          { id: "c2", label: "Implement a distributed Mutex Lock (Cache Stampede prevention).", nextNodeId: "mutex-success", impact: { integrity: 20, trust: 0, time: 5 } },
          { id: "c3", label: "Emergency restart of the database to clear connections.", nextNodeId: "restart-db", impact: { integrity: -30, trust: -30, time: 10 } }
        ]
      },
      "db-crash": {
        id: "db-crash",
        text: "SYSTEM FAILURE: The database connection pool was instantly exhausted. 100% CPU. The database locked up entirely. You are experiencing a classic 'Thundering Herd' collapse. Users see 502 errors.",
        type: "failure",
        choices: [
          { id: "c1", label: "Write a post-mortem.", nextNodeId: "game-over-bad" }
        ]
      },
      "restart-db": {
        id: "restart-db",
        text: "CATASTROPHE: Restarting did nothing. The moment it came back online, the same 10,000 requests slammed it again. It immediately crashed.",
        type: "failure",
        choices: [
          { id: "c1", label: "Write a post-mortem.", nextNodeId: "game-over-bad" }
        ]
      },
      "mutex-success": {
        id: "mutex-success",
        text: "SUCCESS: You quickly deployed a distributed lock. The first request acquired the lock and queried the DB to rebuild the cache. The other 9,999 requests waited gracefully or were served stale data. The database survived.",
        type: "success",
        choices: [
          { id: "c1", label: "Check the Load Balancer.", nextNodeId: "alert-3-lb", impact: { time: 5 } }
        ]
      },
      "alert-3-lb": {
        id: "alert-3-lb",
        text: "NEW ALERT: Users are reporting intermittent 502 Bad Gateway errors. Your Application Load Balancer (ALB) metrics show a massive spike in 'Target Connection Errors'. The backend servers have low CPU, but the ALB is failing to route traffic to them.",
        type: "alert",
        choices: [
          { id: "c1", label: "Force restart all backend servers to clear zombie processes.", nextNodeId: "restart-backends-fail", impact: { integrity: -20, trust: -10 } },
          { id: "c2", label: "We are hitting ephemeral port exhaustion. Enable HTTP Keep-Alives and switch to IP target groups.", nextNodeId: "lb-success", impact: { integrity: 20, trust: 10, time: 10 } },
          { id: "c3", label: "Increase the EC2 instance size of the backend servers.", nextNodeId: "scale-up-fail", impact: { integrity: -10, time: 15 } }
        ]
      },
      "restart-backends-fail": {
        id: "restart-backends-fail",
        text: "FAILURE: Restarting the instances dropped all active user sessions. When they came back up, the load balancer re-established connections and immediately hit the same port exhaustion limit.",
        type: "failure",
        choices: [
          { id: "c1", label: "Acknowledge defeat.", nextNodeId: "game-over-bad" }
        ]
      },
      "scale-up-fail": {
        id: "scale-up-fail",
        text: "FAILURE: You vertically scaled the instances, requiring a 15-minute downtime. The CPU was never the bottleneck; it was TCP port exhaustion. The issue persists.",
        type: "failure",
        choices: [
          { id: "c1", label: "Acknowledge defeat.", nextNodeId: "game-over-bad" }
        ]
      },
      "lb-success": {
        id: "lb-success",
        text: "SUCCESS: By enabling HTTP Keep-Alives, multiple requests reused the same TCP connections, drastically reducing the number of open sockets. The port exhaustion resolved, and 502 errors vanished.",
        type: "success",
        choices: [
          { id: "c1", label: "Review the checkout flow.", nextNodeId: "alert-4-queue", impact: { time: 5 } }
        ]
      },
      "alert-4-queue": {
        id: "alert-4-queue",
        text: "NEW ALERT: The site is fast, but checkout is extremely slow. Customers complain that orders are stuck on 'Processing...'. Your message broker (RabbitMQ) handling async orders has a backlog of 80,000 messages.",
        type: "alert",
        choices: [
          { id: "c1", label: "Purge the entire queue to clear the backlog and start fresh.", nextNodeId: "purge-queue", impact: { integrity: -80, trust: -100 } },
          { id: "c2", label: "Spin up 200 more consumer worker pods to drain it instantly.", nextNodeId: "scale-consumers-fail", impact: { integrity: -20, time: 5 } },
          { id: "c3", label: "Scale consumers moderately (20 pods) and implement a Dead Letter Queue (DLQ).", nextNodeId: "dlq-success", impact: { integrity: 20, time: 10 } }
        ]
      },
      "purge-queue": {
        id: "purge-queue",
        text: "FATAL ERROR: You just deleted 80,000 paid customer orders from the queue. The backlog is gone and latency is 0ms, but the company is now facing massive lawsuits.",
        type: "failure",
        choices: [
          { id: "c1", label: "Resign immediately.", nextNodeId: "game-over-bad" }
        ]
      },
      "scale-consumers-fail": {
        id: "scale-consumers-fail",
        text: "FAILURE: You spun up 200 workers. They instantly drained the queue and simultaneously hit the downstream Payment Database, completely overloading its IOPS limit. You just moved the bottleneck and crashed the DB.",
        type: "failure",
        choices: [
          { id: "c1", label: "Acknowledge defeat.", nextNodeId: "game-over-bad" }
        ]
      },
      "dlq-success": {
        id: "dlq-success",
        text: "SUCCESS: Scaling moderately processed the orders without overloading downstream systems. The DLQ caught several malformed 'poison-pill' messages that were causing workers to crash and retry infinitely.",
        type: "success",
        choices: [
          { id: "c1", label: "Monitor the Payment API.", nextNodeId: "alert-5-api", impact: { time: 5 } }
        ]
      },
      "alert-5-api": {
        id: "alert-5-api",
        text: "CRITICAL ALERT: The downstream third-party Payment Gateway API is starting to return '429 Too Many Requests'. If our workers keep hammering them with retries, they will blacklist our IP entirely.",
        type: "critical",
        choices: [
          { id: "c1", label: "Implement a Circuit Breaker with Exponential Backoff + Jitter.", nextNodeId: "circuit-breaker-success", impact: { integrity: 30, trust: 20 } },
          { id: "c2", label: "Switch immediately to the un-tested backup payment gateway.", nextNodeId: "backup-gateway-fail", impact: { integrity: -40, trust: -20 } },
          { id: "c3", label: "Ignore the 429s and keep retrying every 10ms until they go through.", nextNodeId: "retry-storm", impact: { integrity: -50, trust: -30 } }
        ]
      },
      "backup-gateway-fail": {
        id: "backup-gateway-fail",
        text: "FAILURE: The backup gateway was never load-tested. It immediately buckled under the traffic, returning 500 Internal Server Errors and corrupting transaction states.",
        type: "failure",
        choices: [
          { id: "c1", label: "Acknowledge defeat.", nextNodeId: "game-over-bad" }
        ]
      },
      "retry-storm": {
        id: "retry-storm",
        text: "FAILURE: Your workers caused a retry-storm. The Payment Gateway interpreted this as an abusive DoS attack and permanently blacklisted your production NAT IP. Checkout is completely broken.",
        type: "failure",
        choices: [
          { id: "c1", label: "Acknowledge defeat.", nextNodeId: "game-over-bad" }
        ]
      },
      "circuit-breaker-success": {
        id: "circuit-breaker-success",
        text: "SUCCESS: The Circuit Breaker tripped, pausing requests and preventing a retry storm. Using exponential backoff with jitter, it slowly allowed traffic back as the Payment API's rate limits reset.",
        type: "success",
        choices: [
          { id: "c1", label: "Review overall system health.", nextNodeId: "game-over-ultimate", impact: { trust: 50 } }
        ]
      },
      "game-over-bad": {
        id: "game-over-bad",
        text: "INCIDENT CLOSED (FAILURE): The system collapsed, revenue was lost, and trust was permanently damaged. Read up on system design and architecture patterns and try again.",
        type: "failure"
      },
      "game-over-ultimate": {
        id: "game-over-ultimate",
        text: "INCIDENT CLOSED (RESOLVED): Absolute perfection. You utilized CDN caching, WAF rules, Mutex Locks, TCP tuning, Queue DLQs, and Circuit Breakers to survive a massive viral event. You are a true Systems Architect.",
        type: "success"
      }
    }
  }
];

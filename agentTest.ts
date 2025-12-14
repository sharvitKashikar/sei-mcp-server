/**
 * Startup Strategy Agent
 * ----------------------
 * A rule-based intelligent agent that analyzes startup metrics,
 * keeps memory of past decisions, and outputs strategy suggestions.
 */

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

interface StartupMetrics {
  name: string;
  users: number;
  revenue: number;
  monthlyBurn: number;
  funding: number;
  churnRate: number; // %
}

interface AgentDecision {
  risk: RiskLevel;
  runwayMonths: number;
  marketStage: string;
  recommendation: string;
  timestamp: Date;
}

/* -------------------- Agent Memory -------------------- */

class AgentMemory {
  private logs: AgentDecision[] = [];

  store(decision: AgentDecision): void {
    this.logs.push(decision);
  }

  getHistory(): AgentDecision[] {
    return this.logs;
  }
}

/* -------------------- Agent Tools -------------------- */

class FinanceTool {
  calculateRunway(funding: number, burn: number): number {
    if (burn <= 0) return Infinity;
    return Math.floor(funding / burn);
  }

  evaluateRisk(runway: number): RiskLevel {
    if (runway > 18) return "LOW";
    if (runway >= 6) return "MEDIUM";
    return "HIGH";
  }
}

class MarketTool {
  analyzeMarket(users: number, churnRate: number): string {
    if (users > 100000 && churnRate < 3) return "Strong product-market fit";
    if (users > 20000) return "Growing market";
    return "Early-stage market";
  }
}

/* -------------------- Core Agent -------------------- */

class StartupStrategyAgent {
  private memory: AgentMemory;
  private financeTool: FinanceTool;
  private marketTool: MarketTool;

  constructor() {
    this.memory = new AgentMemory();
    this.financeTool = new FinanceTool();
    this.marketTool = new MarketTool();
  }

  analyze(metrics: StartupMetrics): AgentDecision {
    const runway = this.financeTool.calculateRunway(
      metrics.funding,
      metrics.monthlyBurn
    );

    const risk = this.financeTool.evaluateRisk(runway);
    const marketStage = this.marketTool.analyzeMarket(
      metrics.users,
      metrics.churnRate
    );

    let recommendation = "";

    if (risk === "HIGH") {
      recommendation =
        "Urgent action required: reduce burn, improve revenue, or raise funds.";
    } else if (marketStage === "Strong product-market fit") {
      recommendation =
        "Focus on scaling: invest in growth, partnerships, and hiring.";
    } else {
      recommendation =
        "Optimize product and user retention before aggressive scaling.";
    }

    const decision: AgentDecision = {
      risk,
      runwayMonths: runway,
      marketStage,
      recommendation,
      timestamp: new Date(),
    };

    this.memory.store(decision);
    return decision;
  }

  getAgentMemory(): AgentDecision[] {
    return this.memory.getHistory();
  }
}

/* -------------------- Demo / Simulation -------------------- */

const agent = new StartupStrategyAgent();

const startupData: StartupMetrics[] = [
  {
    name: "ByteBell",
    users: 120000,
    revenue: 180000,
    monthlyBurn: 70000,
    funding: 1200000,
    churnRate: 2.5,
  },
  {
    name: "EduSpark",
    users: 18000,
    revenue: 25000,
    monthlyBurn: 60000,
    funding: 300000,
    churnRate: 6.2,
  },
];

for (const startup of startupData) {
  console.log(`\n🔍 Analyzing ${startup.name}`);
  const result = agent.analyze(startup);
  console.log(result);
}

console.log("\n🧠 Agent Memory Log:");
console.log(agent.getAgentMemory());

# sei-mcp-server

This repository houses the backend services and intelligent agents for the Sei Multi-Chain Platform (MCP) server. It integrates various tools and strategies to provide robust functionalities, from data retrieval to strategic decision-making.

## Features

*   **ByteBell Agent**: An advanced knowledge retrieval agent that fetches information from a knowledge base.
*   **Startup Strategy Agent**: A rule-based intelligent agent designed to analyze startup metrics, assess financial risk and runway, and provide market insights and strategic recommendations.
    *   [Learn more about the Startup Strategy Agent](docs/StartupStrategyAgent.md)

## Core Technologies

*   Node.js/TypeScript
*   Express.js (for API endpoints, if applicable)
*   Vector Databases / Knowledge Bases (for ByteBell Agent)

## Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/sharvitKashikar/sei-mcp-server.git
    cd sei-mcp-server
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or yarn install
    ```

### Running the Server (if applicable)

*(Add instructions here if the server can be run directly, e.g., how to start an Express server, if any. Currently, the agents seem to be callable directly.)*

## Usage Examples

### ByteBell Agent Example

```typescript
import { ByteBellAgent } from './src/agent/bytebellAgent'; // Assuming path

const agent = new ByteBellAgent();
async function runByteBellAgent() {
    const query = "How sei EVM works";
    const response = await agent.retrieve(query);
    console.log(response);
}

runByteBellAgent();
```

### Startup Strategy Agent Example

```typescript
import { StartupStrategyAgent } from './src/org'; // Assuming path based on org.ts

const agent = new StartupStrategyAgent();
const metrics = {
    name: "InnovateCo",
    users: 50000,
    revenue: 150000,
    monthlyBurn: 50000,
    funding: 1200000,
    churnRate: 2.5
};

const decision = agent.analyze(metrics);
console.log(decision);
/*
Example Output:
{
  risk: 'MEDIUM',
  runwayMonths: 24,
  marketStage: 'Growing market',
  recommendation: 'Focus on scaling user acquisition while maintaining low churn. Explore next funding round within 12 months.',
  timestamp: Date object
}
*/
```

## Project Structure

```
.github/
src/
├── agent/
│   └── bytebellAgent.ts
├── org.ts
└── ... (other source files)
test/
... (other project files)
```

This structure prioritizes modularity and separation of concerns, allowing for independent development and testing of components like the `ByteBellAgent` and `StartupStrategyAgent`.

## Contributing

Contributions are welcome! Please refer to our `CONTRIBUTING.md` (if exists) for guidelines.
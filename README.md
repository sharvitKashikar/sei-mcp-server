# MCP Server for SEI (Authless)

This repository contains an authless Model Context Protocol (MCP) server designed to provide contextual information and accelerate interactions with the SEI blockchain.

## Project Overview

This server is implemented as a Cloudflare Worker that integrates the `@modelcontextprotocol/sdk` to expose a `ByteBellAgent`. The `ByteBellAgent` is responsible for retrieving and synthesizing information from a vector database (Pinecone) using embeddings (VoyageAI) to answer queries related to SEI.

### Core Components:

-   **`ByteBellAgent`**: The main agent handling user queries by interacting with specialized retrievers.
-   **`MetaRetriever`**: Responsible for searching metadata within the Pinecone index, used to enhance initial queries.
-   **`BaseRetriever`**: Performs the primary content search within the Pinecone index using enhanced queries.
-   **`src/retrievers/utils.ts`**: Provides utility functions for constructing advanced Pinecone metadata filters.
-   **`src/index.ts`**: Sets up the MCP server and registers the `bytebell_agent` tool, which orchestrates calls to the `ByteBellAgent`.

## Setup and Environment Variables

To run this project, you need to configure several environment variables, typically managed by Cloudflare Workers (e.g., in a `.dev.vars` file for local development or set directly in your Cloudflare dashboard for deployment).

Required environment variables:

-   `PINECONE_API_KEY`: API key for accessing the Pinecone vector database.
-   `VOYAGE_API_KEY`: API key for the VoyageAI embedding service.
-   `OPENROUTER_API_KEY`: API key for the OpenRouter LLM service (used by the `ByteBellAgent`).

Example `.dev.vars` file:

```env
PINECONE_API_KEY="your_pinecone_api_key"
VOYAGE_API_KEY="your_voyageai_api_key"
OPENROUTER_API_KEY="your_openrouter_api_key"
ENVIRONMENT="production"
```

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sharvitKashikar/sei-mcp-server.git
    cd sei-mcp-server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Available Scripts

-   `npm run dev`: Starts a local development server using `wrangler dev`. This will simulate the Cloudflare Worker environment.
-   `npm run deploy`: Deploys the worker to Cloudflare using `wrangler deploy`.
-   `npm run format`: Formats the codebase using Biome (`biome format --write`).
-   `npm run lint:fix`: Lints and fixes issues in the codebase using Biome (`biome lint --fix`).
-   `npm run cf-typegen`: Generates Cloudflare Worker types (`wrangler types`).
-   `npm run type-check`: Performs a TypeScript type check without emitting files (`tsc --noEmit`).

## Usage

Once deployed or running locally, the MCP server will expose an API endpoint that can be interacted with using the `@modelcontextprotocol/sdk` client. The `bytebell_agent` tool can be invoked with a `query` to retrieve SEI-related information.

Example (conceptual interaction):

```typescript
import { McpClient } from '@modelcontextprotocol/sdk/client';

const client = new McpClient({
  url: 'YOUR_CLOUDflare_WORKER_URL',
});

async function getSeiInfo(query: string) {
  const response = await client.callTool('bytebell_agent', { query });
  console.log(response.output);
}

// Example query
// getSeiInfo('What is the latest upgrade on Sei blockchain?');
```
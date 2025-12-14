# ByteBellAgent Documentation

The `ByteBellAgent` class (`src/bbagent.ts`) is the core intelligence component for query enhancement and information retrieval within the ByteBell system. It is designed to process incoming queries, enrich them with contextual information, and then orchestrate the retrieval of relevant documents from a vector database.

## Overview

The `ByteBellAgent` operates by combining meta-information retrieval with base-content retrieval. It uses an embedding model to convert queries into vector representations and interacts with a Pinecone vector database to find both high-level (meta) and detailed (base) context. This context is then used to refine the original query, leading to more precise and relevant search results.

## Architecture

The `ByteBellAgent` encapsulates the following key components:

*   **`MetaRetriever`**: An instance of `MetaRetriever` responsible for fetching metadata or high-level contextual information related to the user's query from a specific namespace (`sei_meta`) in the Pinecone index. This metadata helps understand the broader context or intent behind the query.
*   **`BaseRetriever`**: An instance of `BaseRetriever` tasked with retrieving detailed content or core documents from a different namespace (`sei`) in the Pinecone index. This provides the primary search results.
*   **Pinecone Client**: An initialized client for interacting with the Pinecone vector database. It manages access to the `bytebell-prod-v2` index and its namespaces.
*   **VoyageAI Client**: An initialized client for the VoyageAI embedding service, used to generate vector embeddings for queries and document chunks.
*   **Configuration**: Stores parameters like the Pinecone index name and namespace names.

## Configuration (Constructor)

The `ByteBellAgent` is initialized with configuration settings that specify the Pinecone index and the namespaces for meta and base data.

```typescript
import { createPineconeClient } from "./vector/pinecone";
import { createEmbedder } from "./vector/embeddings";
import { MetaRetriever, BaseRetriever } from "./retrievers";

const PINECONE_API_KEY=""; // Placeholder, should be loaded from environment
const VOYAGE_API_KEY="";   // Placeholder, should be loaded from environment
const OPENROUTER_API_KEY=""; // Placeholder, unused in provided snippet

export class ByteBellAgent {
    private pineconeClient;
    private voyageAiClient;
    private config: any;

    constructor() {
        this.config = {
            "indexName": "bytebell-prod-v2",
            "namespaces": {
                "meta": "sei_meta",
                "base": "sei"
            }
        };
        this.pineconeClient = createPineconeClient(PINECONE_API_KEY);
        this.voyageAiClient = createEmbedder(VOYAGE_API_KEY);
        this.metaRetriever = new MetaRetriever(
            this.pineconeClient,
            this.config.indexName,
            this.voyageAiClient
        );
        this.baseRetriever = new BaseRetriever(
            this.pineconeClient,
            this.config.indexName,
            this.voyageAiClient
        );
    }
    // ... rest of the class methods
}
```

## Key Methods

### `createEnhancedQuery(originalQuery: string, metaResults: any[], keywords: string[]): Promise<string>`

This private method is responsible for enhancing the original user query by incorporating contextual information obtained from meta-retrieval. It uses an LLM (via OpenRouter API, although not fully implemented in the provided snippet) to analyze the meta-context and reformulate the query for better base document retrieval.

**Parameters:**
*   `originalQuery`: The initial query provided by the user.
*   `metaResults`: An array of results obtained from the `MetaRetriever`, containing high-level contextual information.
*   `keywords`: An array of keywords extracted from the original query (though not explicitly used in the shown `createEnhancedQuery` prompt, it's part of the signature).

**Returns:**
*   `Promise<string>`: A promise that resolves to the enhanced query string.

**Example Prompt (LLM Input):**
```
You are a search query optimizer. Analyze the meta context to enhance the original query for better document retrieval.

Original Query: "${originalQuery}"

Meta Context Found:
${metaContext}

Based on the meta context, generate an enhanced, more specific, and comprehensive search query. The enhanced query should incorporate key terms and concepts from the meta context that are relevant to the original query, ensuring it is optimized for retrieving detailed documents. Focus on clarity and specificity.

Enhanced Query:
```

### `retrieve(query: string, limit: number = 10): Promise<any[]>`

This is the primary public method for initiating the retrieval process. It orchestrates the meta-retrieval, query enhancement, and base-retrieval steps to return a comprehensive set of results.

**Parameters:**
*   `query`: The user's original search query.
*   `limit`: The maximum number of results to retrieve (default is 10).

**Returns:**
*   `Promise<any[]>`: A promise that resolves to an array of retrieved documents or results.

**Internal Workflow:**
1.  **Extract Keywords**: Placeholder for keyword extraction (implementation not shown).
2.  **Meta Retrieval**: `this.metaRetriever.getRelevantDocuments(query, keywords, limit)` is called to fetch meta-level documents.
3.  **Query Enhancement**: The `createEnhancedQuery` method is invoked with the `originalQuery` and `metaResults` to generate a more refined query.
4.  **Base Retrieval**: `this.baseRetriever.getRelevantDocuments(enhancedQuery, limit)` is called using the optimized query to fetch the final, detailed results.
5.  **Return Results**: The results from the base retrieval are returned.

## Usage Example (Conceptual)

```typescript
import { ByteBellAgent } from './bbagent';

async function performSearch(userQuery: string, resultLimit: number = 5) {
    const agent = new ByteBellAgent();
    console.log(`Searching for: "${userQuery}"`);
    try {
        const results = await agent.retrieve(userQuery, resultLimit);
        console.log(`Found ${results.length} results.`);
        results.forEach((r, index) => {
            console.log(`Result ${index + 1}: ${r.content || r.text}`);
            // You might want to display other metadata like r.source, r.id
        });
    } catch (error) {
        console.error("Search failed:", error);
    }
}

// Example call
performSearch("what is a blockchain");
performSearch("detailed architecture of sei");
```


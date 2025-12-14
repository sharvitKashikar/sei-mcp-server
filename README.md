# ByteBellAgent: Intelligent Query Enhancement

This repository houses the backend services for the ByteBell project, focusing on advanced information retrieval and query processing.

## Core Components

### ByteBellAgent

The `ByteBellAgent` is a pivotal component responsible for intelligent query enhancement and document retrieval. It leverages both meta-level and base-level information to refine user queries and fetch more accurate results. This class integrates with vector databases (Pinecone) and embedding services (VoyageAI) to provide contextual understanding and efficient data retrieval.

For an in-depth understanding of its functionality, configuration, and usage, please refer to the [ByteBellAgent Documentation](docs/ByteBellAgent.md).

### Retrievers

The system utilizes specialized retrievers:
*   **MetaRetriever**: Focuses on retrieving high-level, structural, or conceptual information related to the query.
*   **BaseRetriever**: Handles the retrieval of detailed, content-specific information.

These retrievers work in conjunction with the `ByteBellAgent` to provide a comprehensive search experience.

---

*(... rest of the README content ...)*

import { Pinecone } from "@pinecone-database/pinecone";
import { getSparseVectors, queryIndex } from "../vector/pinecone";
import { generateEmbedding } from "../vector/embeddings";
import { VoyageAIClient } from "voyageai";
import { BaseMetadata, NamespaceSearchParams } from ".";

export interface BaseSearchResult extends BaseMetadata {
  id: string;
  text: string;
  source: string;
  node_id: string;
  length?: number;
  title?: string;
  knowledge_id?: string;
  url?: string;
  chunk_type?: string;
  chunk_content?: string;
}

export interface BaseSearchResponse {
  success: boolean;
  results: Array<{
    id: string;
    content: string;
    metadata: {
      similarity_score: number;
      source: string;
      node_id: string;
      title?: string;
      knowledge_id?: string;
      url?: string;
      length?: number;
      chunk_type?: string;
      chunk_content?: string;
    };
  }>;
  query: string;
  namespace: string;
  searchType: string;
  error?: string;
}

export interface FormatOptions {
  fields?: Array<{
    key: keyof BaseSearchResponse["results"][number]["metadata"] | "content";
    label: string;
  }>;
  separator?: string;
}

export class BaseRetriever {
  private defaultFormatOptions: FormatOptions;

  constructor(
    private pineconeClient: Pinecone,
    private indexName: string,
    private embedder: VoyageAIClient,
    formatOptions?: FormatOptions
  ) {
    this.defaultFormatOptions = formatOptions || {
      fields: [
        { key: "title" as const, label: "Title" },
        { key: "source" as const, label: "Source" },
        { key: "content" as const, label: "Content" },
      ],
      separator: "-----",
    };
  }

  async search(params: NamespaceSearchParams): Promise<BaseSearchResponse> {
    try {
      const {
        query,
        namespace,
        topK = 10,
        scoreThreshold = 0.01,
        filter,
      } = params;

      console.log(
        `🔍 Base search: "${query.slice(0, 70)}"... in namespace: ${namespace}`
      );

      const [queryEmbedding, sparseEmbedding] = await Promise.all([
        generateEmbedding(this.embedder, [query], {
          inputType: "query",
          model: "voyage-3-large",
        }),
        getSparseVectors(this.pineconeClient, query),
      ]);

      const embeddings =
        sparseEmbedding[0].vectorType === "sparse" && sparseEmbedding[0];

      const queryResults = await queryIndex<BaseSearchResult>(
        this.pineconeClient,
        this.indexName,
        namespace,
        {
          vector: queryEmbedding.data[0].embedding,
          sparseVector: {
            indices: embeddings.sparseIndices,
            values: embeddings.sparseValues,
          },
          ...(filter && Object.keys(filter).length > 0 ? { filter } : {}),
          topK,
          includeValues: false,
          includeMetadata: true,
        }
      );

      const relevantDocs = queryResults.matches.filter((doc) => {
        return (
          doc.score > scoreThreshold &&
          (doc.metadata.chunk_content || doc.metadata.text)
        );
      });
      const results = relevantDocs.map((match) => ({
        id: match.id,
        content: (match.metadata.text as string) || "",
        metadata: {
          similarity_score: match.score || 0,
          source: match.metadata?.source as string,
          node_id: match.metadata.node_id,
          title: match.metadata?.title as string,
          knowledge_id: match.metadata?.knowledge_id as string,
          url: match.metadata?.url as string,
          length: match.metadata.length,
          chunk_type: (match.metadata?.chunk_type as string) || "",
          chunk_content: match.metadata?.chunk_content as string,
        },
      }));

      return {
        success: true,
        results,
        query,
        namespace,
        searchType: "base",
      };
    } catch (error) {
      console.error("❌ Base search failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        results: [],
        query: params.query,
        namespace: params.namespace,
        searchType: "meta",
      };
    }
  }

  async retrieve(
    query: string,
    namespace: string,
    formatOptions?: FormatOptions
  ): Promise<string> {
    const result = await this.search({ query, namespace });

    if (!result.success || result.results.length === 0) {
      return "";
    }

    // Merge provided options with defaults
    const fields = formatOptions?.fields || this.defaultFormatOptions.fields!;
    const separator =
      formatOptions?.separator || this.defaultFormatOptions.separator!;

    const formatResult = (r: BaseSearchResponse["results"][number]) => {
      const sections = fields
        .map(({ key, label }) => {
          const value =
            key === "content"
              ? r.content
              : r.metadata[key as keyof typeof r.metadata];

          if (!value) return null;

          return `${label}: ${value}`;
        })
        .filter(Boolean)
        .join("\n");

      return sections + (sections ? `\n${separator}` : "");
    };

    const formatted = result.results.map(formatResult).join("\n\n");

    console.log(`Base retreiver : ${formatted.slice(0, 100)}`);

    return formatted;
  }
}

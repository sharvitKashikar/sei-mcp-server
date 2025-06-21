import { Pinecone } from "@pinecone-database/pinecone";
import { VoyageAIClient } from "voyageai";
import { getSparseVectors, queryIndex } from "../vector/pinecone";
import { generateEmbedding } from "../vector/embeddings";
import { BaseMetadata, NamespaceSearchParams } from ".";

export interface MetaSearchResult extends BaseMetadata {
  id: string;
  text: string;
  datasource: string;
  meta_type: string;
  node_id: string;
  length?: number;

  ref_chunk_id: string;
  ref_datasource: string;
  ref_node_id: string;
  ref_knowledge_id: string;
  chunk_type?: string;
  chunk_content?: string;
}

export interface MetaSearchResponse {
  success: boolean;
  results: Array<{
    id: string;
    content: string;
    metadata: {
      similarity_score: number;
      source: string;
      node_id: string;
      metaType: string;
      length: number;

      ref_chunk_id: string;
      ref_datasource: string;
      ref_node_id: string;
      chunk_type: string;
      chunk_content?: string;
    };
  }>;
  query: string;
  namespace: string;
  searchType: string;
  error?: string;
}

interface FormatOptions {
  fields?: Array<{
    key: keyof MetaSearchResponse["results"][number]["metadata"] | "content";
    label: string;
  }>;
  separator?: string;
}

export class MetaRetriever {
  private defaultFormatOptions: FormatOptions;

  constructor(
    private pineconeClient: Pinecone,
    private indexName: string,
    private embedder: VoyageAIClient,
    formatOptions?: FormatOptions
  ) {
    this.defaultFormatOptions = formatOptions || {
      fields: [
        { key: "metaType" as const, label: "Meta Type" },
        { key: "source" as const, label: "Source" },
        { key: "content" as const, label: "Content" },
      ],
      separator: "-----",
    };
  }

  async search(params: NamespaceSearchParams): Promise<MetaSearchResponse> {
    try {
      const {
        query,
        namespace,
        topK = 10,
        scoreThreshold = 0.01,
        filter,
      } = params;

      console.log(
        `🔍 Meta search: "${query.slice(0, 70)}"... in namespace: ${namespace}`
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

      const queryResults = await queryIndex<MetaSearchResult>(
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

          source: match.metadata?.datasource as string,
          node_id: match.metadata.node_id,
          metaType: match.metadata?.meta_type as string,
          length: match.metadata.length,

          ref_chunk_id: match.metadata.ref_chunk_id as string,
          ref_datasource: match.metadata.ref_datasource as string,
          ref_node_id: (match.metadata?.ref_node_id as string) || "",

          chunk_type: (match.metadata?.chunk_type as string) || "",
        },
      }));
      console.log(`meta results found ${results.length}`);

      return {
        success: true,
        results,
        query,
        namespace,
        searchType: "meta",
      };
    } catch (error) {
      console.error("❌ Meta search failed:", error);
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
    console.log(
      `meta retrieve found ${result.query} success: ${result.success} ${result.results.length}`
    );

    if (!result.success || result.results.length === 0) {
      return "";
    }

    // Merge provided options with defaults
    const fields = formatOptions?.fields || this.defaultFormatOptions.fields!;
    const separator =
      formatOptions?.separator || this.defaultFormatOptions.separator!;

    const formatResult = (r: MetaSearchResponse["results"][number]) => {
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

    console.log(`Formatted slice ${formatted.slice(0, 100)}`);

    return formatted;
  }
}

/**
  // Simple equality filter
  await retriever.search({
    query: "AI documentation",
    namespace: "docs",
    filter: { metaType: "Documentation" }
  });

  // Using helper functions
  await retriever.search({
    query: "AI documentation",
    namespace: "docs",
    filter: MetaFilters.and(
      MetaFilters.eq("metaType", "Documentation"),
      MetaFilters.in("chunk_type", ["summary", "content"]),
      MetaFilters.range("similarity_score", 0.7)
    )
  });

  // Complex filter with OR condition
  await retriever.search({
    query: "AI documentation",
    namespace: "docs",
    filter: {
      $or: [
        { metaType: { $eq: "Documentation" } },
        { $and: [
          { chunk_type: { $in: ["summary", "header"] } },
          { length: { $gte: 100 } }
        ]}
      ]
    }
  });
*/

// Pinecone metadata filter types based on MongoDB query operators
type MetadataValue = string | number | boolean | string[];

interface ComparisonOperators<T = MetadataValue> {
  $eq?: T;
  $ne?: T;
  $gt?: T;
  $gte?: T;
  $lt?: T;
  $lte?: T;
  $in?: T[];
  $nin?: T[];
  $exists?: boolean;
}

type MetadataFilter =
  | {
      [key: string]: MetadataValue | ComparisonOperators | LogicalOperator;
    }
  | LogicalOperator;

interface LogicalOperator {
  $and?: MetadataFilter[];
  $or?: MetadataFilter[];
}

// Helper functions for creating filters
export const createMetaFilters = {
  // Simple equality filter
  eq: (field: string, value: MetadataValue): MetadataFilter => ({
    [field]: { $eq: value },
  }),

  // Multiple conditions with AND
  and: (...filters: MetadataFilter[]): MetadataFilter => ({
    $and: filters,
  }),

  // Multiple conditions with OR
  or: (...filters: MetadataFilter[]): MetadataFilter => ({
    $or: filters,
  }),

  // Value in array
  in: (field: string, values: MetadataValue[]): MetadataFilter => ({
    [field]: { $in: values },
  }),

  // Range filter
  range: (field: string, min?: number, max?: number): MetadataFilter => {
    const filter: any = {};
    if (min !== undefined) filter.$gte = min;
    if (max !== undefined) filter.$lte = max;
    return { [field]: filter };
  },

  // Check if field exists
  exists: (field: string): MetadataFilter => ({
    [field]: { $exists: true },
  }),
};

export interface NamespaceSearchParams {
  query: string;
  namespace: string;
  topK?: number;
  scoreThreshold?: number;
  filter?: MetadataFilter;
}

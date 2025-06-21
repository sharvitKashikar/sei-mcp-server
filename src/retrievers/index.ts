export * from "./base-retriever";
export * from "./meta-retriever";
import { RecordMetadata } from "@pinecone-database/pinecone";

export type BaseMetadata<T extends RecordMetadata = RecordMetadata> = {
  id: string;
  text: string;
  node_id?: string;
} & T;

export type { NamespaceSearchParams } from "./utils";
export { createMetaFilters } from "./utils";
